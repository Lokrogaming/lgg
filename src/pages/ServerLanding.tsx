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
  const dcsLink = server.dcs_short_code 
    ? `https://dcs.lol/${server.dcs_short_code}` 
    : (inviteCode ? `https://dcs.lol/${inviteCode}` : server.invite_link);

  // Custom styles for fully customized landing pages
  const customStyles: React.CSSProperties = hasCustomLanding ? {
    backgroundColor: customData.backgroundColor,
    backgroundImage: customData.backgroundImage ? `url(${customData.backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: customData.textColor,
    fontFamily: customData.fontFamily,
  } : {};

  return (
    <div 
      className={cn(
        "min-h-screen",
        !hasCustomLanding && "bg-background"
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
          <div className="gaming-border p-8 text-center mb-8">
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
            <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-primary/30">
              <AvatarImage src={avatarUrl || undefined} alt={server.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-4xl font-bold">
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
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
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
          {(server.dcs_short_code || inviteCode) && (
            <div className="gaming-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Quick join link powered by DCS.lol
              </p>
              <code className="text-lg font-mono text-primary bg-primary/10 px-4 py-2 rounded-lg">
                dcs.lol/{server.dcs_short_code || inviteCode}
              </code>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
