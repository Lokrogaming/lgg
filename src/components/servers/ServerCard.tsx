import { Link } from "react-router-dom";
import { Server, AgeRating, useVoteForServer, useUserVotes } from "@/hooks/useServers";
import { useDcsServerInfo, extractInviteCode } from "@/hooks/useDcsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Shield, AlertTriangle, ThumbsUp, Sparkles, Zap, Coins, Wifi, Eye, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface ServerCardProps {
  server: Server;
  index?: number;
  showActions?: boolean;
  showCredits?: boolean;
  onEdit?: () => void;
  onCustomize?: () => void;
}

const ageRatingConfig: Record<AgeRating, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  all_ages: { label: "All Ages", variant: "secondary" },
  under_18: { label: "Under 18", variant: "default", className: "bg-success text-success-foreground" },
  "18_plus": { label: "18+", variant: "outline", className: "border-warning text-warning" },
  nsfw: { label: "NSFW", variant: "destructive" },
};

interface ThemeData {
  background?: string;
  borderColor?: string;
  fontFamily?: string;
  accentColor?: string;
}

interface CustomCardData {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  glowColor?: string;
}

const themeStyles: Record<string, ThemeData> = {
  default: {},
  neon: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(6, 182, 212, 0.1))",
    borderColor: "rgba(236, 72, 153, 0.5)",
    fontFamily: "Orbitron, sans-serif",
    accentColor: "#ec4899",
  },
  gold: {
    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(217, 119, 6, 0.1))",
    borderColor: "rgba(234, 179, 8, 0.5)",
    fontFamily: "Cinzel, serif",
    accentColor: "#eab308",
  },
  galaxy: {
    background: "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1))",
    borderColor: "rgba(147, 51, 234, 0.5)",
    fontFamily: "Space Grotesk, sans-serif",
    accentColor: "#9333ea",
  },
};

export function ServerCard({ server, index = 0, showActions, showCredits, onEdit, onCustomize }: ServerCardProps) {
  const ratingConfig = ageRatingConfig[server.age_rating];
  const { user } = useAuth();
  const { data: userVotes = [] } = useUserVotes(user?.id);
  const voteForServer = useVoteForServer();
  
  // Fetch live data from dcs.lol
  const discordInviteCode = server.invite_link ? extractInviteCode(server.invite_link) : null;
  const { data: dcsInfo } = useDcsServerInfo(discordInviteCode);
  
  const hasVoted = userVotes.includes(server.id);
  const themeData = themeStyles[server.theme] || themeStyles.default;
  const customCardData = server.has_custom_card ? (server.custom_card_data as CustomCardData) : null;
  
  // Use DCS data when available, fallback to stored data
  const memberCount = dcsInfo?.memberCount || server.member_count;
  const onlineCount = dcsInfo?.onlineCount || server.online_count || 0;
  const avatarUrl = dcsInfo?.icon || server.avatar_url;
  
  // Use DCS short code if available, otherwise fall back to Discord invite code
  const dcsLink = server.dcs_short_code 
    ? `https://dcs.lol/${server.dcs_short_code}` 
    : (discordInviteCode ? `https://dcs.lol/${discordInviteCode}` : server.invite_link);

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return;
    }
    voteForServer.mutate(server.id);
  };

  // Custom styles for fully customized cards
  const customStyles: React.CSSProperties = customCardData ? {
    backgroundColor: customCardData.backgroundColor,
    borderColor: customCardData.borderColor,
    color: customCardData.textColor,
    fontFamily: customCardData.fontFamily,
    boxShadow: customCardData.glowColor ? `0 0 20px ${customCardData.glowColor}40` : undefined,
  } : themeData.background ? {
    background: themeData.background,
    borderColor: themeData.borderColor,
    fontFamily: themeData.fontFamily,
  } : {};

  return (
    <div 
      className={cn(
        "gaming-border p-6 hover:glow-primary transition-all duration-300 group animate-fade-in relative",
        server.age_rating === "nsfw" && "hover:glow-nsfw",
        server.is_promoted && "ring-2 ring-warning/50",
        server.is_bumped && "ring-2 ring-primary/50",
      )}
      style={{ animationDelay: `${index * 100}ms`, ...customStyles }}
    >
      {/* Status badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {server.has_custom_card && (
          <Badge variant="outline" className="text-xs bg-background/50">
            <Palette className="h-3 w-3 mr-1" />
            Custom
          </Badge>
        )}
        {server.is_promoted && (
          <Badge className="bg-warning text-warning-foreground text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Promoted
          </Badge>
        )}
        {server.is_bumped && !server.is_promoted && (
          <Badge className="bg-primary text-primary-foreground text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Bumped
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-4">
        <Avatar className={cn(
          "h-14 w-14 rounded-xl border-2 border-border group-hover:border-primary/50 transition-colors",
        )} style={{ borderColor: customCardData?.accentColor || themeData.accentColor }}>
          <AvatarImage src={avatarUrl || undefined} alt={server.name} />
          <AvatarFallback className="rounded-xl bg-primary/20 text-primary text-lg font-bold">
            {server.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{server.name}</h3>
            {server.is_verified && (
              <Shield className="h-4 w-4 text-verified flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {server.description || "No description provided"}
          </p>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Badge 
              variant={ratingConfig.variant} 
              className={cn("text-xs", ratingConfig.className)}
            >
              {server.age_rating === "nsfw" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {ratingConfig.label}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{memberCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-success">
              <Wifi className="h-4 w-4" />
              <span>{onlineCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{server.vote_count || 0}</span>
            </div>

            {showCredits && (
              <div className="flex items-center gap-1 text-sm text-warning">
                <Coins className="h-4 w-4" />
                <span>{server.credits}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        <Button
          variant={hasVoted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={!user || voteForServer.isPending}
          className={cn(hasVoted && "bg-success hover:bg-success/90")}
        >
          <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-current")} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link to={`/server/${server.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>

        {dcsLink ? (
          <Button 
            variant={server.age_rating === "nsfw" ? "nsfw" : "default"} 
            className="flex-1"
            asChild
          >
            <a href={dcsLink} target="_blank" rel="noopener noreferrer">
              Join Server
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" disabled>
            No Invite Link
          </Button>
        )}
        
        {showActions && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
        )}

        {showActions && onCustomize && server.has_custom_card && (
          <Button variant="outline" onClick={onCustomize}>
            <Palette className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
