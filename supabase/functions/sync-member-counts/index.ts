import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Discord/dcs.lol rate limit safety: max ~1 request per REQUEST_DELAY_MS
const REQUEST_DELAY_MS = 1500;
const WEBHOOK_DELAY_MS = 1200;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractInviteCode(link: string | null): string | null {
  if (!link) return null;
  const patterns = [
    /discord\.gg\/([a-zA-Z0-9-]+)/,
    /discord\.com\/invite\/([a-zA-Z0-9-]+)/,
    /dcs\.lol\/([a-zA-Z0-9-]+)/,
    /^([a-zA-Z0-9-]+)$/,
  ];
  for (const p of patterns) {
    const m = link.match(p);
    if (m) return m[1];
  }
  return null;
}

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, init);
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "5");
      console.log(`Rate limited on ${url}, waiting ${retryAfter}s`);
      await sleep(Math.min(retryAfter * 1000 + 250, 30_000));
      continue;
    }
    return res;
  }
  return null;
}

interface Counts {
  memberCount: number;
  onlineCount: number;
  name?: string;
  icon?: string | null;
}

async function fetchCounts(inviteCode: string): Promise<Counts | null> {
  const res = await rateLimitedFetch(
    `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
  );
  if (!res || !res.ok) {
    console.log(`Failed lookup for ${inviteCode}: ${res?.status}`);
    return null;
  }
  const data = await res.json();
  return {
    memberCount: data.approximate_member_count ?? 0,
    onlineCount: data.approximate_presence_count ?? 0,
    name: data.guild?.name,
    icon: data.guild?.icon
      ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
      : null,
  };
}

// Discord Components V2 milestone message
function buildComponentsV2Payload(opts: {
  serverName: string;
  avatarUrl: string | null;
  milestone: number;
  memberCount: number;
  onlineCount: number;
  landingUrl: string | null;
  accentColor?: number;
}) {
  const section: Record<string, unknown> = {
    type: 9, // Section
    components: [
      {
        type: 10, // Text Display
        content:
          `## 🎉 Milestone reached!\n**${opts.serverName}** just hit **${opts.milestone.toLocaleString()} members**!`,
      },
    ],
  };

  if (opts.avatarUrl) {
    section.accessory = {
      type: 11, // Thumbnail
      media: { url: opts.avatarUrl },
    };
  }

  const container: Record<string, unknown> = {
    type: 17, // Container
    accent_color: opts.accentColor ?? 0x5865f2,
    components: [
      section,
      { type: 14, divider: true, spacing: 1 }, // Separator
      {
        type: 10,
        content:
          `**Members:** ${opts.memberCount.toLocaleString()}\n**Online:** ${opts.onlineCount.toLocaleString()}`,
      },
    ],
  };

  if (opts.landingUrl) {
    (container.components as unknown[]).push({
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link
          label: "View on LGG",
          url: opts.landingUrl,
        },
      ],
    });
  }

  return {
    flags: 1 << 15, // IS_COMPONENTS_V2
    components: [container],
  };
}

function buildJoinPayload(opts: {
  serverName: string;
  avatarUrl: string | null;
  gained: number;
  memberCount: number;
  landingUrl: string | null;
}) {
  const section: Record<string, unknown> = {
    type: 9,
    components: [
      {
        type: 10,
        content:
          `### 👋 New members on **${opts.serverName}**\n+${opts.gained} since the last check — now at **${opts.memberCount.toLocaleString()}** members.`,
      },
    ],
  };
  if (opts.avatarUrl) {
    section.accessory = { type: 11, media: { url: opts.avatarUrl } };
  }
  const container: Record<string, unknown> = {
    type: 17,
    accent_color: 0x57f287,
    components: [section],
  };
  if (opts.landingUrl) {
    (container.components as unknown[]).push({
      type: 1,
      components: [{ type: 2, style: 5, label: "View on LGG", url: opts.landingUrl }],
    });
  }
  return { flags: 1 << 15, components: [container] };
}

async function sendWebhook(webhookUrl: string, payload: unknown): Promise<boolean> {
  const res = await rateLimitedFetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res) return false;
  if (!res.ok) {
    console.log(`Webhook failed (${res.status}): ${await res.text()}`);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const siteUrl = "https://lgg.lokro.dev";

    const { data: servers, error } = await supabase
      .from("servers")
      .select(
        "id, name, avatar_url, invite_link, dcs_short_code, landing_link, member_count, milestone_threshold, last_milestone_notified, webhook_url, webhook_on_milestone, webhook_on_join",
      )
      .eq("is_blocked", false);

    if (error) throw error;

    const today = new Date().toISOString().slice(0, 10);
    let synced = 0;
    let notified = 0;

    for (const server of servers ?? []) {
      const code = extractInviteCode(server.invite_link) ??
        extractInviteCode(server.dcs_short_code);
      if (!code) continue;

      const counts = await fetchCounts(code);
      await sleep(REQUEST_DELAY_MS); // stay well inside the rate limit
      if (!counts) continue;

      const previous = server.member_count ?? 0;
      const threshold = server.milestone_threshold || 100;
      const reached = Math.floor(counts.memberCount / threshold) * threshold;
      const lastNotified = server.last_milestone_notified ?? 0;
      const hitMilestone = reached > 0 && reached > lastNotified;

      await supabase.from("servers").update({
        member_count: counts.memberCount,
        online_count: counts.onlineCount,
        member_count_synced_at: new Date().toISOString(),
        ...(hitMilestone ? { last_milestone_notified: reached } : {}),
      }).eq("id", server.id);

      await supabase.from("server_member_stats").upsert({
        server_id: server.id,
        recorded_on: today,
        member_count: counts.memberCount,
        online_count: counts.onlineCount,
      }, { onConflict: "server_id,recorded_on" });

      synced++;

      const landingUrl = server.landing_link
        ? `${siteUrl}/s/${server.landing_link}`
        : `${siteUrl}/server/${server.id}`;

      if (server.webhook_url) {
        if (hitMilestone && server.webhook_on_milestone) {
          const ok = await sendWebhook(
            server.webhook_url,
            buildComponentsV2Payload({
              serverName: server.name,
              avatarUrl: server.avatar_url ?? counts.icon ?? null,
              milestone: reached,
              memberCount: counts.memberCount,
              onlineCount: counts.onlineCount,
              landingUrl,
            }),
          );
          if (ok) notified++;
          await sleep(WEBHOOK_DELAY_MS);
        } else if (server.webhook_on_join && counts.memberCount > previous) {
          const ok = await sendWebhook(
            server.webhook_url,
            buildJoinPayload({
              serverName: server.name,
              avatarUrl: server.avatar_url ?? counts.icon ?? null,
              gained: counts.memberCount - previous,
              memberCount: counts.memberCount,
              landingUrl,
            }),
          );
          if (ok) notified++;
          await sleep(WEBHOOK_DELAY_MS);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced, notified, date: today }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("sync-member-counts error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
