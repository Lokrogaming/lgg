import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  inviteCode: z.string().trim().min(2).max(100).regex(/^[a-zA-Z0-9-]+$/),
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Service unavailable" }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { error: authError } = await supabase.auth.getUser();
    if (authError) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: parsed.error.flatten().fieldErrors }, 400);
    }

    const response = await fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(parsed.data.inviteCode)}?with_counts=true`,
      { headers: { "User-Agent": "LGG/1.0 (https://lgg.lokro.dev)" } },
    );

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "5");
      return jsonResponse({ error: "Discord is temporarily rate limiting lookups", retryAfter }, 429);
    }

    if (response.status === 404) {
      return jsonResponse({ error: "Invite not found" }, 404);
    }

    if (!response.ok) {
      return jsonResponse({ error: "Could not fetch invite" }, 502);
    }

    const data = await response.json();
    return jsonResponse(data);
  } catch (error) {
    console.error("discord-invite-info error", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not fetch invite" }, 500);
  }
});