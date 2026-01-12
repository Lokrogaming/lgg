import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting bump expiration check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all servers where bump has expired (bump_expires_at is in the past)
    const now = new Date().toISOString();
    
    const { data: expiredServers, error: fetchError } = await supabase
      .from("servers")
      .select("id, name, bump_expires_at")
      .eq("is_bumped", true)
      .lt("bump_expires_at", now);

    if (fetchError) {
      console.error("Error fetching expired bumps:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredServers?.length || 0} servers with expired bumps`);

    if (expiredServers && expiredServers.length > 0) {
      // Update all expired servers to remove bump status
      const serverIds = expiredServers.map((s) => s.id);
      
      const { error: updateError } = await supabase
        .from("servers")
        .update({ 
          is_bumped: false, 
          bump_expires_at: null 
        })
        .in("id", serverIds);

      if (updateError) {
        console.error("Error updating expired bumps:", updateError);
        throw updateError;
      }

      console.log(`Successfully expired bumps for ${serverIds.length} servers:`, 
        expiredServers.map(s => s.name).join(", "));
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: expiredServers?.length || 0,
        expired_servers: expiredServers?.map(s => ({ id: s.id, name: s.name })) || [],
        checked_at: now,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in expire-bumps function:", errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});