import { Server, AgeRating } from "@/hooks/useServers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerCardProps {
  server: Server;
  index?: number;
  showActions?: boolean;
  onEdit?: () => void;
}

const ageRatingConfig: Record<AgeRating, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  all_ages: { label: "All Ages", variant: "secondary" },
  under_18: { label: "Under 18", variant: "default", className: "bg-success text-success-foreground" },
  "18_plus": { label: "18+", variant: "outline", className: "border-warning text-warning" },
  nsfw: { label: "NSFW", variant: "destructive" },
};

export function ServerCard({ server, index = 0, showActions, onEdit }: ServerCardProps) {
  const ratingConfig = ageRatingConfig[server.age_rating];

  return (
    <div 
      className={cn(
        "gaming-border p-6 hover:glow-primary transition-all duration-300 group animate-fade-in",
        server.age_rating === "nsfw" && "hover:glow-nsfw"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-xl border-2 border-border group-hover:border-primary/50 transition-colors">
          <AvatarImage src={server.avatar_url || undefined} alt={server.name} />
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
              <span>{server.member_count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        {server.invite_link ? (
          <Button 
            variant={server.age_rating === "nsfw" ? "nsfw" : "default"} 
            className="flex-1"
            asChild
          >
            <a href={server.invite_link} target="_blank" rel="noopener noreferrer">
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
      </div>
    </div>
  );
}
