import { useQuery, useMutation } from "@tanstack/react-query";

export interface DcsServerInfo {
  name: string;
  description: string;
  icon: string | null;
  splash: string | null;
  banner: string | null;
  memberCount: number;
  onlineCount: number;
  guildId: string;
  inviteCode: string;
  inviterId: number;
  inviterName: string;
}

export interface DcsLinkResponse {
  id: string;
  shortCode: string;
  url: string;
  shortUrl: string;
}

// Extract invite code from Discord invite link
export function extractInviteCode(inviteLink: string): string | null {
  if (!inviteLink) return null;
  
  // Handle various formats:
  // https://discord.gg/abc123
  // https://discord.com/invite/abc123
  // discord.gg/abc123
  // abc123
  const patterns = [
    /discord\.gg\/([a-zA-Z0-9-]+)/,
    /discord\.com\/invite\/([a-zA-Z0-9-]+)/,
    /^([a-zA-Z0-9-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = inviteLink.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Generate dcs.lol short link from invite code
export function generateDcsLink(shortCode: string): string {
  return `https://dcs.lol/${shortCode}`;
}

// Create a DCS.lol short link from Discord invite URL
export async function createDcsLink(discordUrl: string, customId?: string): Promise<DcsLinkResponse | null> {
  try {
    const response = await fetch("https://dcs.lol/api/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: discordUrl,
        customId: customId,
      }),
    });
    
    if (!response.ok) {
      console.error("Status:", response.status, await response.text());
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Failed to create DCS link:", error);
      return null;
    }
    
    const data = await response.json();
    return {
      id: data.id || "",
      shortCode: data.shortCode || data.customId || "",
      url: data.url || discordUrl,
      shortUrl: data.shortUrl || `https://dcs.lol/${data.shortCode || data.customId}`,
    };
  } catch (error) {
    console.error("Failed to create DCS link:", error);
    return null;
  }
}

// Simple client-side queue + cache so we never hammer Discord (429 protection)
const CACHE_TTL = 15 * 60 * 1000;
const MIN_GAP_MS = 1500;
const infoCache = new Map<string, { at: number; data: DcsServerInfo | null }>();
const inFlight = new Map<string, Promise<DcsServerInfo | null>>();
let queue: Promise<unknown> = Promise.resolve();
let cooldownUntil = 0;

function schedule<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, cooldownUntil - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    return task();
  });
  queue = run.then(() => new Promise((r) => setTimeout(r, MIN_GAP_MS)), () => undefined);
  return run;
}

export async function fetchDcsServerInfo(inviteCode: string): Promise<DcsServerInfo | null> {
  const cached = infoCache.get(inviteCode);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.data;
  const pending = inFlight.get(inviteCode);
  if (pending) return pending;

  const promise = schedule(() => fetchDcsServerInfoRaw(inviteCode))
    .then((data) => {
      infoCache.set(inviteCode, { at: Date.now(), data });
      return data;
    })
    .finally(() => inFlight.delete(inviteCode));
  inFlight.set(inviteCode, promise);
  return promise;
}

async function fetchDcsServerInfoRaw(inviteCode: string): Promise<DcsServerInfo | null> {
  try {
    
    const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "5");
      cooldownUntil = Date.now() + Math.min(retryAfter * 1000 + 500, 60_000);
      return null;
    }

    if (!response.ok) return null;
    
    const data = await response.json();
    
    
    const guild = data.guild;
    
    
    return {
      name: guild?.name || "",
      description: guild?.description || data.profile?.description || "",
      icon: guild?.icon 
  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
  : null,

splash: guild?.splash 
  ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png` 
  : null,

banner: guild?.banner 
  ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png` 
  : null,
      
      
      memberCount: data.approximate_member_count || data.profile?.member_count || 0,
      onlineCount: data.approximate_presence_count || data.profile?.online_count || 0,
      
      guildId: guild?.id || "",
      inviteCode: data.code || inviteCode,
      inviterId: data.inviter?.id || "0",
      inviterName: data.inviter?.username || "",
    };
  } catch (error) {
    console.error("Failed to fetch Discord server info:", error);
    return null;
  }
}


export function useDcsServerInfo(inviteCode: string | null) {
  return useQuery({
  queryKey: ["dcs-server-info", inviteCode],
    queryFn: async () => {
      if (!inviteCode) return null;
      return fetchDcsServerInfo(inviteCode);
    },
    enabled: !!inviteCode,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateDcsLink() {
  return useMutation({
    mutationFn: async ({ discordUrl, customId }: { discordUrl: string; customId?: string }) => {
      return createDcsLink(discordUrl, customId);
    },
  });
}

// Get Discord icon URL 
export function getDiscordIconUrl(guildId: string, iconHash: string): string {
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`;
}
