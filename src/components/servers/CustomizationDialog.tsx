import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Server, useUpdateServer } from "@/hooks/useServers";
import { Loader2, Palette, Layout, Type } from "lucide-react";

interface CustomizationDialogProps {
  server: Server;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomCardData {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  glowColor?: string;
}

interface CustomLandingData {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerText?: string;
}

const fontOptions = [
  { value: "inherit", label: "Default" },
  { value: "Orbitron, sans-serif", label: "Orbitron (Sci-Fi)" },
  { value: "Cinzel, serif", label: "Cinzel (Elegant)" },
  { value: "Space Grotesk, sans-serif", label: "Space Grotesk (Modern)" },
  { value: "Bebas Neue, sans-serif", label: "Bebas Neue (Bold)" },
  { value: "Permanent Marker, cursive", label: "Permanent Marker (Casual)" },
  { value: "Press Start 2P, cursive", label: "Press Start 2P (Retro)" },
];

export function CustomizationDialog({ server, open, onOpenChange }: CustomizationDialogProps) {
  const updateServer = useUpdateServer();
  
  // Card customization
  const [cardBgColor, setCardBgColor] = useState("#1a1a2e");
  const [cardBorderColor, setCardBorderColor] = useState("#6366f1");
  const [cardTextColor, setCardTextColor] = useState("#ffffff");
  const [cardAccentColor, setCardAccentColor] = useState("#6366f1");
  const [cardFont, setCardFont] = useState("inherit");
  const [cardGlowColor, setCardGlowColor] = useState("#6366f1");

  // Landing page customization
  const [landingBgColor, setLandingBgColor] = useState("#0a0a0f");
  const [landingBgImage, setLandingBgImage] = useState("");
  const [landingTextColor, setLandingTextColor] = useState("#ffffff");
  const [landingAccentColor, setLandingAccentColor] = useState("#6366f1");
  const [landingFont, setLandingFont] = useState("inherit");
  const [landingHeaderText, setLandingHeaderText] = useState("");

  useEffect(() => {
    if (server.custom_card_data) {
      const cardData = server.custom_card_data as CustomCardData;
      setCardBgColor(cardData.backgroundColor || "#1a1a2e");
      setCardBorderColor(cardData.borderColor || "#6366f1");
      setCardTextColor(cardData.textColor || "#ffffff");
      setCardAccentColor(cardData.accentColor || "#6366f1");
      setCardFont(cardData.fontFamily || "inherit");
      setCardGlowColor(cardData.glowColor || "#6366f1");
    }
    if (server.custom_landing_data) {
      const landingData = server.custom_landing_data as CustomLandingData;
      setLandingBgColor(landingData.backgroundColor || "#0a0a0f");
      setLandingBgImage(landingData.backgroundImage || "");
      setLandingTextColor(landingData.textColor || "#ffffff");
      setLandingAccentColor(landingData.accentColor || "#6366f1");
      setLandingFont(landingData.fontFamily || "inherit");
      setLandingHeaderText(landingData.headerText || "");
    }
  }, [server]);

  const handleSave = async () => {
    const customCardData = {
      backgroundColor: cardBgColor,
      borderColor: cardBorderColor,
      textColor: cardTextColor,
      accentColor: cardAccentColor,
      fontFamily: cardFont,
      glowColor: cardGlowColor,
    };

    const customLandingData = {
      backgroundColor: landingBgColor,
      backgroundImage: landingBgImage || undefined,
      textColor: landingTextColor,
      accentColor: landingAccentColor,
      fontFamily: landingFont,
      headerText: landingHeaderText || undefined,
    };

    await updateServer.mutateAsync({
      id: server.id,
      custom_card_data: customCardData as unknown,
      custom_landing_data: customLandingData as unknown,
      has_custom_card: true,
      has_custom_landing: true,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {server.name}</DialogTitle>
          <DialogDescription>
            Fully customize your server card and landing page appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Server Card
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Landing Page
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardBgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardBgColor}
                    onChange={(e) => setCardBgColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={cardBgColor}
                    onChange={(e) => setCardBgColor(e.target.value)}
                    placeholder="#1a1a2e"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardBorderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardBorderColor}
                    onChange={(e) => setCardBorderColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={cardBorderColor}
                    onChange={(e) => setCardBorderColor(e.target.value)}
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardTextColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardTextColor}
                    onChange={(e) => setCardTextColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={cardTextColor}
                    onChange={(e) => setCardTextColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardAccentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardAccentColor}
                    onChange={(e) => setCardAccentColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={cardAccentColor}
                    onChange={(e) => setCardAccentColor(e.target.value)}
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardGlowColor">Glow Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={cardGlowColor}
                    onChange={(e) => setCardGlowColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={cardGlowColor}
                    onChange={(e) => setCardGlowColor(e.target.value)}
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Family
                </Label>
                <Select value={cardFont} onValueChange={setCardFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Card Preview */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div 
                className="p-4 rounded-lg border-2"
                style={{
                  backgroundColor: cardBgColor,
                  borderColor: cardBorderColor,
                  color: cardTextColor,
                  fontFamily: cardFont,
                  boxShadow: `0 0 20px ${cardGlowColor}40`,
                }}
              >
                <h3 className="font-bold text-lg">{server.name}</h3>
                <p className="text-sm opacity-80">{server.description || "Server description"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span style={{ color: cardAccentColor }}>●</span>
                  <span className="text-sm">1,234 members</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={landingBgColor}
                    onChange={(e) => setLandingBgColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={landingBgColor}
                    onChange={(e) => setLandingBgColor(e.target.value)}
                    placeholder="#0a0a0f"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input
                  value={landingBgImage}
                  onChange={(e) => setLandingBgImage(e.target.value)}
                  placeholder="https://example.com/background.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={landingTextColor}
                    onChange={(e) => setLandingTextColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={landingTextColor}
                    onChange={(e) => setLandingTextColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={landingAccentColor}
                    onChange={(e) => setLandingAccentColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={landingAccentColor}
                    onChange={(e) => setLandingAccentColor(e.target.value)}
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Family
                </Label>
                <Select value={landingFont} onValueChange={setLandingFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Header Text</Label>
                <Input
                  value={landingHeaderText}
                  onChange={(e) => setLandingHeaderText(e.target.value)}
                  placeholder="Welcome to our server!"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="hero" 
            onClick={handleSave}
            disabled={updateServer.isPending}
          >
            {updateServer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Customization
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
