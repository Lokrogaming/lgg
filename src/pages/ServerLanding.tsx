import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Server, AgeRating, useVoteForServer, useUserVotes } from "@/hooks/useServers";
import { useDcsServerInfo, extractInviteCode } from "@/hooks/useDcsApi";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  ThumbsUp, 
  Sparkles, 
  Zap, 
  Wifi,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const ageRatingConfig: Record<AgeRating, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  all_ages: { label: "All Ages", variant: "secondary" },
  under_18: { label: "Under 18", variant: "default", className: "bg-success text-success-foreground" },
  "18_plus": { label: "18+", variant: "outline", className: "border-warning text-warning" },
  nsfw: { label: "NSFW", variant: "destructive" },
};

interface CustomLandingData {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerText?: string;
  showDescription?: boolean;
  customCss?: string;
}

interface ThemeData {
  background?: string;
  borderColor?: string;
  fontFamily?: string;
  accentColor?: string;
}

const themeStyles: Record<string, ThemeData> = {
  default: {},
  neon: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(6, 182, 212, 0.15))",
    borderColor: "rgba(236, 72, 153, 0.5)",
    fontFamily: "Orbitron, sans-serif",
    accentColor: "#ec4899",
  },
  gold: {
    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(217, 119, 6, 0.15))",
    borderColor: "rgba(234, 179, 8, 0.5)",
    fontFamily: "Cinzel, serif",
    accentColor: "#eab308",
  },
  galaxy: {
    background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(79, 70, 229, 0.15))",
    borderColor: "rgba(147, 51, 234, 0.5)",
    fontFamily: "Space Grotesk, sans-serif",
    accentColor: "#9333ea",
  },
};

export default function ServerLanding() {
  const { serverId } = useParams<{ serverId: string }>();
  const { user } = useAuth();
  const { data: userVotes = [] } = useUserVotes(user?.id);
  const voteForServer = useVoteForServer();

  const { data: server, isLoading } = useQuery({
    queryKey: ["server", serverId],
    queryFn: async () => {
      if (!serverId) return null;
      
      // Get server with vote count
      const { data, error } = await supabase
        .from("servers")
        .select("*")
        .eq("id", serverId)
        .single();

      if (error) throw error;

      // Get vote count
      const { count } = await supabase
        .from("server_votes")
        .select("*", { count: "exact", head: true })
        .eq("server_id", serverId);

      return { ...data, vote_count: count || 0 } as Server;
    },
    enabled: !!serverId,
  });

  const inviteCode = server?.dcs_short_code || (server?.invite_link ? extractInviteCode(server.invite_link) : null);
  const { data: dcsInfo } = useDcsServerInfo(server?.invite_link ? extractInviteCode(server.invite_link) : null);

  const hasVoted = userVotes.includes(server?.id || "");
  const customData = (server?.custom_landing_data || {}) as CustomLandingData;
  const hasCustomLanding = server?.has_custom_landing && customData;
  
  // Get theme data (purchased themes like neon, gold, galaxy)
  const themeData = themeStyles[server?.theme || "default"] || themeStyles.default;
  const hasTheme = server?.theme && server.theme !== "default";

  const handleVote = () => {
    if (!user || !server) return;
    voteForServer.mutate(server.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Server not found</h1>
        <Button asChild>
          <Link to="/servers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Servers
          </Link>
        </Button>
      </div>
    );
  }

  const ratingConfig = ageRatingConfig[server.age_rating];
  const memberCount = dcsInfo?.memberCount || server.member_count;
  const onlineCount = dcsInfo?.onlineCount || server.online_count || 0;
  const avatarUrl = dcsInfo?.icon || server.avatar_url;
  const dcsLink = server.invite_link;

  // Custom styles for fully customized landing pages OR purchased themes
  const customStyles: React.CSSProperties = hasCustomLanding ? {
    backgroundColor: customData.backgroundColor,
    backgroundImage: customData.backgroundImage ? `url(${customData.backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: customData.textColor,
    fontFamily: customData.fontFamily,
  } : hasTheme ? {
    background: themeData.background,
    fontFamily: themeData.fontFamily,
  } : {};

  // Accent color for themed elements
  const accentColor = hasCustomLanding ? customData.accentColor : hasTheme ? themeData.accentColor : undefined;
  const borderColor = hasTheme ? themeData.borderColor : undefined;

  return (
    <div 
      className={cn(
        "min-h-screen",
        !hasCustomLanding && !hasTheme && "bg-background"
      )}
      style={customStyles}
    >
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild>
          <Link to="/servers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Servers
          </Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Server Header */}
          <div 
            className="gaming-border p-8 text-center mb-8"
            style={borderColor ? { borderColor } : undefined}
          >
            {/* Status badges */}
            <div className="flex justify-center gap-2 mb-6">
              {server.is_promoted && (
                <Badge className="bg-warning text-warning-foreground">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Promoted
                </Badge>
              )}
              {server.is_bumped && (
                <Badge className="bg-primary text-primary-foreground">
                  <Zap className="h-3 w-3 mr-1" />
                  Bumped
                </Badge>
              )}
              {server.is_verified && (
                <Badge className="bg-verified text-verified-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Avatar */}
            <Avatar 
              className="h-32 w-32 mx-auto mb-6 border-4"
              style={{ borderColor: accentColor || undefined }}
            >
              <AvatarImage src={avatarUrl || undefined} alt={server.name} />
              <AvatarFallback 
                className="text-4xl font-bold"
                style={accentColor ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
              >
                {server.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name & Rating */}
            <h1 className="text-4xl font-bold mb-4">{server.name}</h1>
            <Badge 
              variant={ratingConfig.variant} 
              className={cn("text-sm mb-6", ratingConfig.className)}
            >
              {server.age_rating === "nsfw" && <AlertTriangle className="h-4 w-4 mr-1" />}
              {ratingConfig.label}
            </Badge>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div 
                  className="flex items-center justify-center gap-2 text-3xl font-bold"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  <Users className="h-6 w-6" />
                  {memberCount.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-success">
                  <Wifi className="h-6 w-6" />
                  {onlineCount.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-warning">
                  <ThumbsUp className="h-6 w-6" />
                  {server.vote_count || 0}
                </div>
                <p className="text-sm text-muted-foreground">Votes</p>
              </div>
            </div>

            {/* Description */}
            {server.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {server.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                variant={hasVoted ? "default" : "outline"}
                size="lg"
                onClick={handleVote}
                disabled={!user || voteForServer.isPending}
                className={cn(hasVoted && "bg-success hover:bg-success/90")}
              >
                <ThumbsUp className={cn("h-5 w-5 mr-2", hasVoted && "fill-current")} />
                {hasVoted ? "Voted" : "Vote"}
              </Button>

              {dcsLink && (
                <Button 
                  variant={server.age_rating === "nsfw" ? "nsfw" : "hero"} 
                  size="lg"
                  asChild
                >
                  <a href={dcsLink} target="_blank" rel="noopener noreferrer">
                    Join Server
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* DCS.lol Link */}
          {(server.invite_link || inviteCode) && (
            <div 
              className="gaming-border p-6 text-center"
              style={borderColor ? { borderColor } : undefined}
            >
              <p className="text-sm text-muted-foreground mb-2">
                Quick join link powered by{" "}
                <a 
                  href="https://dcs.lol" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={accentColor ? { color: accentColor } : undefined}
                >
                  DCS.lol
                </a>
              </p>
              <code 
                className="text-lg font-mono px-4 py-2 rounded-lg"
                style={accentColor ? { color: accentColor, backgroundColor: `${accentColor}15` } : undefined}
              >
                {server.invite_link || inviteCode}
              </code>
            </div>
          )}

          {/* DCS.lol API Attribution */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Server statistics & invite links powered by{" "}
              <a 
                href="https://dcs.lol/docs/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DCS.lol API
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
