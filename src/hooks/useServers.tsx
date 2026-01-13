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
  online_count: number;
  is_verified: boolean;
  webhook_url: string | null;
  webhook_on_milestone: boolean;
  webhook_on_join: boolean;
  milestone_threshold: number;
  credits: number;
  is_promoted: boolean;
  is_pinned: boolean;
  is_bumped: boolean;
  bump_expires_at: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
  vote_count?: number;
  // Customization fields
  custom_card_data: unknown | null;
  custom_landing_data: unknown | null;
  has_custom_card: boolean;
  has_custom_landing: boolean;
  dcs_short_code: string | null;
  guild_id: string | null;
}

export function useServers() {
  const { data: servers = [], isLoading: loading, error } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      // Get servers with vote counts
      const { data: serversData, error: serversError } = await supabase
        .from("servers")
        .select("*")
        .order("member_count", { ascending: false });

      if (serversError) throw serversError;

      // Get vote counts for each server
      const serverIds = serversData.map(s => s.id);
      const { data: votesData } = await supabase
        .from("server_votes")
        .select("server_id")
        .in("server_id", serverIds);

      // Count votes per server
      const voteCounts: Record<string, number> = {};
      votesData?.forEach(v => {
        voteCounts[v.server_id] = (voteCounts[v.server_id] || 0) + 1;
      });

      // Check for expired bumps and update them
      const now = new Date().toISOString();
      const serversWithVotes = serversData.map(server => ({
        ...server,
        vote_count: voteCounts[server.id] || 0,
        is_bumped: server.is_bumped && server.bump_expires_at && new Date(server.bump_expires_at) > new Date()
      }));

      // Sort: pinned first, then promoted, then bumped, then by member count
      return serversWithVotes.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        if (a.is_promoted && !b.is_promoted) return -1;
        if (!a.is_promoted && b.is_promoted) return 1;
        if (a.is_bumped && !b.is_bumped) return -1;
        if (!a.is_bumped && b.is_bumped) return 1;
        return b.member_count - a.member_count;
      }) as Server[];
    },
  });

  return { servers, loading, error };
}

export function useMyServers(userId: string | undefined) {
  const { data: servers = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["my-servers", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: serversData, error: serversError } = await supabase
        .from("servers")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (serversError) throw serversError;

      // Get vote counts
      const serverIds = serversData.map(s => s.id);
      const { data: votesData } = await supabase
        .from("server_votes")
        .select("server_id")
        .in("server_id", serverIds);

      const voteCounts: Record<string, number> = {};
      votesData?.forEach(v => {
        voteCounts[v.server_id] = (voteCounts[v.server_id] || 0) + 1;
      });

      return serversData.map(server => ({
        ...server,
        vote_count: voteCounts[server.id] || 0,
      })) as Server[];
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
      dcs_short_code?: string;
      guild_id?: string;
      member_count?: number;
      online_count?: number;
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
      // Cast to any to handle custom JSON fields
      const updateData = updates as Record<string, unknown>;
      const { data, error } = await supabase
        .from("servers")
        .update(updateData)
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

export function useVoteForServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serverId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to vote");

      // Check if already voted
      const { data: existingVote } = await supabase
        .from("server_votes")
        .select("id")
        .eq("server_id", serverId)
        .eq("user_id", user.id)
        .single();

      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from("server_votes")
          .delete()
          .eq("id", existingVote.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add vote
        const { error } = await supabase
          .from("server_votes")
          .insert({ server_id: serverId, user_id: user.id });
        if (error) throw error;

        // Check if server should earn credits (every 5 votes)
        const { count } = await supabase
          .from("server_votes")
          .select("*", { count: "exact", head: true })
          .eq("server_id", serverId);

        if (count && count % 5 === 0) {
          // Add 1 credit for every 5 votes
          const { data: server } = await supabase
            .from("servers")
            .select("credits")
            .eq("id", serverId)
            .single();

          if (server) {
            await supabase
              .from("servers")
              .update({ credits: (server.credits || 0) + 1 })
              .eq("id", serverId);
          }
        }

        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["my-servers"] });
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
      toast.success(data.action === "added" ? "Vote added!" : "Vote removed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUserVotes(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-votes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("server_votes")
        .select("server_id")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map(v => v.server_id);
    },
    enabled: !!userId,
  });
}
