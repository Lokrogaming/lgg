import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AgeRating = "all_ages" | "under_18" | "18_plus" | "nsfw";

export interface Server {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  invite_link: string | null;
  age_rating: AgeRating;
  ai_age_rating: AgeRating | null;
  member_count: number;
  is_verified: boolean;
  webhook_url: string | null;
  webhook_on_milestone: boolean;
  webhook_on_join: boolean;
  milestone_threshold: number;
  created_at: string;
  updated_at: string;
}

export function useServers() {
  const { data: servers = [], isLoading: loading, error } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servers")
        .select("*")
        .order("member_count", { ascending: false });

      if (error) throw error;
      return data as Server[];
    },
  });

  return { servers, loading, error };
}

export function useMyServers(userId: string | undefined) {
  const { data: servers = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["my-servers", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("servers")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Server[];
    },
    enabled: !!userId,
  });

  return { servers, loading, error, refetch };
}

export function useCreateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverData: {
      name: string;
      description?: string;
      avatar_url?: string;
      invite_link?: string;
      age_rating: AgeRating;
      webhook_url?: string;
      webhook_on_milestone?: boolean;
      webhook_on_join?: boolean;
      milestone_threshold?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("servers")
        .insert({
          ...serverData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      toast.success("Server created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create server: " + error.message);
    },
  });
}

export function useUpdateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Server> & { id: string }) => {
      const { data, error } = await supabase
        .from("servers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      toast.success("Server updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update server: " + error.message);
    },
  });
}

export function useDeleteServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const { error } = await supabase
        .from("servers")
        .delete()
        .eq("id", serverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      toast.success("Server deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete server: " + error.message);
    },
  });
}
