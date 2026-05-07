import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true if the given server has purchased the "Custom Landing Link" perk.
 */
export function useHasCustomLink(serverId: string | undefined) {
  return useQuery({
    queryKey: ["custom-link-purchase", serverId],
    queryFn: async () => {
      if (!serverId) return false;
      const { data, error } = await supabase
        .from("purchases")
        .select("id, shop_items!inner(type)")
        .eq("server_id", serverId)
        .eq("is_active", true)
        .eq("shop_items.type", "custom_link")
        .limit(1);
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!serverId,
  });
}
