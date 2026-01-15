import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  duration_hours: number | null;
  theme_data: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  server_id: string;
  item_id: string;
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export function useShopItems() {
  return useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      return data as ShopItem[];
    },
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, itemId }: { serverId: string; itemId: string }) => {
      // Get server credits and item price
      const { data: server, error: serverError } = await supabase
        .from("servers")
        .select("credits, owner_id")
        .eq("id", serverId)
        .single();

      if (serverError) throw serverError;

      const { data: item, error: itemError } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError) throw itemError;

      // Check if user owns the server
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || server.owner_id !== user.id) {
        throw new Error("You can only purchase for your own servers");
      }

      // Check credits
      if ((server.credits || 0) < item.price) {
        throw new Error(`Not enough credits. Need ${item.price}, have ${server.credits || 0}`);
      }

      // Calculate expiry
      let expiresAt: string | null = null;
      if (item.duration_hours) {
        expiresAt = new Date(Date.now() + item.duration_hours * 60 * 60 * 1000).toISOString();
      }

      // Create purchase
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          server_id: serverId,
          item_id: itemId,
          expires_at: expiresAt,
        });

      if (purchaseError) throw purchaseError;

      // Deduct credits
      await supabase
        .from("servers")
        .update({ credits: (server.credits || 0) - item.price })
        .eq("id", serverId);

      // Apply perk based on type
      if (item.type === "bump") {
        await supabase
          .from("servers")
          .update({ 
            is_bumped: true, 
            bump_expires_at: expiresAt 
          })
          .eq("id", serverId);
      } else if (item.type === "promotion") {
        await supabase
          .from("servers")
          .update({ is_promoted: true })
          .eq("id", serverId);
      } else if (item.type === "theme") {
        const themeName = item.name.toLowerCase().replace(" theme", "").replace(" ", "-");
        await supabase
          .from("servers")
          .update({ theme: themeName })
          .eq("id", serverId);
      }

      return { item, expiresAt };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      toast.success(`Purchased ${data.item.name}!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useServerPurchases(serverId: string | undefined) {
  return useQuery({
    queryKey: ["server-purchases", serverId],
    queryFn: async () => {
      if (!serverId) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select("*, shop_items(*)")
        .eq("server_id", serverId)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
    enabled: !!serverId,
  });
}

export interface PurchaseWithItem extends Purchase {
  shop_items: ShopItem;
  servers?: { id: string; name: string; avatar_url: string | null };
}

export function useMyThemePurchases(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-theme-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get user's servers
      const { data: servers, error: serversError } = await supabase
        .from("servers")
        .select("id")
        .eq("owner_id", userId);

      if (serversError) throw serversError;
      if (!servers || servers.length === 0) return [];

      const serverIds = servers.map(s => s.id);

      // Get theme purchases for these servers
      const { data, error } = await supabase
        .from("purchases")
        .select("*, shop_items(*), servers(id, name, avatar_url)")
        .in("server_id", serverIds)
        .eq("is_active", true);

      if (error) throw error;
      
      // Filter to only theme items
      return (data as PurchaseWithItem[]).filter(p => p.shop_items?.type === "theme");
    },
    enabled: !!userId,
  });
}

export function useApplyTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, themeName }: { serverId: string; themeName: string }) => {
      const { error } = await supabase
        .from("servers")
        .update({ theme: themeName })
        .eq("id", serverId);

      if (error) throw error;
      return { themeName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      toast.success("Theme applied successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
