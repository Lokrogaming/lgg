import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCreditHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["credit-history", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data: servers, error: serverError } = await supabase.from("servers").select("id").eq("owner_id", userId);
      if (serverError) throw serverError;
      if (!servers.length) return [];
      const rows = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from("purchases")
          .select("id, server_id, purchased_at, expires_at, is_active, credits_spent, shop_items(name, type)")
          .in("server_id", servers.map(server => server.id))
          .order("purchased_at", { ascending: false }).order("id")
          .range(offset, offset + 499);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 500) break;
      }
      return rows;
    },
  });
}