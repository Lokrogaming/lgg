import { Badge } from "@/components/ui/badge";
import { Users, ThumbsUp, Shield, Wifi } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ThemePreviewProps {
  themeName: string;
}

interface ThemeData {
  background: string;
  borderColor: string;
  fontFamily: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
}

const themeStyles: Record<string, ThemeData> = {
  neon: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(6, 182, 212, 0.15))",
    borderColor: "rgba(236, 72, 153, 0.6)",
    fontFamily: "'Orbitron', sans-serif",
    accentColor: "#ec4899",
    textColor: "#fff",
    mutedColor: "rgba(255,255,255,0.6)",
  },
  gold: {
    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(217, 119, 6, 0.15))",
    borderColor: "rgba(234, 179, 8, 0.6)",
    fontFamily: "'Cinzel', serif",
    accentColor: "#eab308",
    textColor: "#fef3c7",
    mutedColor: "rgba(254,243,199,0.6)",
  },
  galaxy: {
    background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(79, 70, 229, 0.15))",
    borderColor: "rgba(147, 51, 234, 0.6)",
    fontFamily: "'Space Grotesk', sans-serif",
    accentColor: "#9333ea",
    textColor: "#e9d5ff",
    mutedColor: "rgba(233,213,255,0.6)",
  },
};

export function ThemePreview({ themeName }: ThemePreviewProps) {
  const themeKey = themeName.toLowerCase();
  const theme = themeStyles[themeKey];

  if (!theme) return null;

  return (
    <div className="mt-4 mb-2">
      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
      <div
        className="rounded-lg p-4 border-2 transition-all"
        style={{
          background: theme.background,
          borderColor: theme.borderColor,
          fontFamily: theme.fontFamily,
          boxShadow: `0 0 20px ${theme.accentColor}30`,
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar
            className="h-10 w-10 rounded-lg border-2"
            style={{ borderColor: theme.accentColor }}
          >
            <AvatarFallback
              className="rounded-lg text-sm font-bold"
              style={{ backgroundColor: `${theme.accentColor}30`, color: theme.accentColor }}
            >
              S
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="font-semibold text-sm truncate"
                style={{ color: theme.textColor, fontFamily: theme.fontFamily }}
              >
                Sample Server
              </span>
              <Shield className="h-3 w-3" style={{ color: theme.accentColor }} />
            </div>

            <p
              className="text-xs line-clamp-1 mb-2"
              style={{ color: theme.mutedColor }}
            >
              A preview of the {themeName} theme
            </p>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1" style={{ color: theme.mutedColor }}>
                <Users className="h-3 w-3" />
                <span>1,234</span>
              </div>
              <div className="flex items-center gap-1" style={{ color: "#22c55e" }}>
                <Wifi className="h-3 w-3" />
                <span>567</span>
              </div>
              <div className="flex items-center gap-1" style={{ color: theme.mutedColor }}>
                <ThumbsUp className="h-3 w-3" />
                <span>89</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
