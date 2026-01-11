import { useQuery } from "@tanstack/react-query";

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
export function generateDcsLink(inviteCode: string): string {
  return `https://dcs.lol/${inviteCode}`;
}

// Fetch server info from dcs.lol API
export async function fetchDcsServerInfo(inviteCode: string): Promise<DcsServerInfo | null> {
  try {
    const response = await fetch(`https://dcs.lol/api/v1/discord/${inviteCode}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      name: data.guild?.name || "",
      description: data.guild?.description || "",
      icon: data.guild?.icon ? `https://dcs.lol/proxy/discord/icons/${data.guild.id}/${data.guild.icon}` : null,
      splash: data.guild?.splash || null,
      banner: data.guild?.banner || null,
      memberCount: data.approximate_member_count || 0,
      onlineCount: data.approximate_presence_count || 0,
      guildId: data.guild?.id || "",
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

// Get Discord icon URL via dcs.lol proxy (CSP-friendly)
export function getDiscordIconUrl(guildId: string, iconHash: string): string {
  return `https://dcs.lol/proxy/discord/icons/${guildId}/${iconHash}`;
}
