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
  default: {
    background: "linear-gradient(135deg, rgba(100, 100, 100, 0.15), rgba(50, 50, 50, 0.15))",
    borderColor: "rgba(100, 100, 100, 0.5)",
    fontFamily: "inherit",
    accentColor: "#6b7280",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  neon: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(6, 182, 212, 0.15))",
    borderColor: "rgba(236, 72, 153, 0.5)",
    fontFamily: "Orbitron, sans-serif",
    accentColor: "#ec4899",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  gold: {
    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(217, 119, 6, 0.15))",
    borderColor: "rgba(234, 179, 8, 0.5)",
    fontFamily: "Cinzel, serif",
    accentColor: "#eab308",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  galaxy: {
    background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(79, 70, 229, 0.15))",
    borderColor: "rgba(147, 51, 234, 0.5)",
    fontFamily: "Space Grotesk, sans-serif",
    accentColor: "#9333ea",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  "blood-moon": {
    background: "linear-gradient(135deg, rgba(28, 0, 0, 0.15), rgba(153, 27, 27, 0.15))",
    borderColor: "rgba(239, 68, 68, 0.5)",
    fontFamily: "Cinzel, serif",
    accentColor: "#ef4444",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  "dark-cosmic": {
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.15), rgba(88, 28, 135, 0.15))",
    borderColor: "rgba(167, 139, 250, 0.5)",
    fontFamily: "Rajdhani, sans-serif",
    accentColor: "#a78bfa",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
  "astro-space": {
    background: "linear-gradient(135deg, rgba(2, 6, 23, 0.15), rgba(30, 41, 59, 0.15))",
    borderColor: "rgba(148, 163, 184, 0.5)",
    fontFamily: "Space Mono, monospace",
    accentColor: "#94a3b8",
    textColor: "#ffffff",
    mutedColor: "#9ca3af",
  },
};

export function ThemePreview({ themeName }: ThemePreviewProps) {
  const themeKey = themeName.toLowerCase().replace(" theme", "").replace(/\s+/g, "-");
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
