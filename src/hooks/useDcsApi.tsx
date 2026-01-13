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
        customId: customId || undefined,
      }),
    });
    
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

// Fetch server info from dcs.lol API using invite code
export async function fetchDcsServerInfo(inviteCode: string): Promise<DcsServerInfo | null> {
  try {
    const response = await fetch(`https://dcs.lol/api/v1/discord/${inviteCode}`);
    if (!response.ok) return null;
    
    const json = await response.json();
    
    // Handle new API response format: { success: true, data: { server: {...}, memberCount, onlineCount } }
    if (!json.success ||!json.data) return null;
    
    const data = json.data;
    const server = data.server;
    
    return {
      name: server?.name || "",
      description: server?.description || "",
      icon: server?.icon || null, // API now returns full URL
      splash: server?.splash || null,
      banner: server?.banner || null,
      memberCount: data.memberCount || 0,
      onlineCount: data.onlineCount || 0,
      guildId: server?.id || "",
      inviteCode: inviteCode,
    };
  } catch (error) {
    console.error("Failed to fetch DCS server info:", error);
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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