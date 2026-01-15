import { useState } from "react";
import { useMyThemePurchases, useApplyTheme, PurchaseWithItem } from "@/hooks/useShop";
import { useMyServers, Server } from "@/hooks/useServers";
import { ThemePreview } from "@/components/shop/ThemePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Palette, Check, Loader2 } from "lucide-react";

interface ThemeInventoryProps {
  userId: string;
}

export function ThemeInventory({ userId }: ThemeInventoryProps) {
  const { data: purchases, isLoading } = useMyThemePurchases(userId);
  const { servers } = useMyServers(userId);
  const applyTheme = useApplyTheme();
  const [selectedServers, setSelectedServers] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="gaming-border p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="gaming-border p-6 text-center">
        <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">No Themes Yet</h3>
        <p className="text-sm text-muted-foreground">
          Purchase themes from the shop to customize your server cards
        </p>
      </div>
    );
  }

  // Group purchases by theme name to avoid duplicates
  const uniqueThemes = purchases.reduce<Record<string, PurchaseWithItem>>((acc, purchase) => {
    const themeName = purchase.shop_items?.name;
    if (themeName && !acc[themeName]) {
      acc[themeName] = purchase;
    }
    return acc;
  }, {});

  const handleApplyTheme = (purchase: PurchaseWithItem, serverId: string) => {
    const themeName = purchase.shop_items.name
      .toLowerCase()
      .replace(" theme", "")
      .replace(/\s+/g, "");
    
    applyTheme.mutate({ serverId, themeName });
  };

  const getThemeKey = (name: string) => {
    return name.toLowerCase().replace(" theme", "").replace(/\s+/g, "");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(uniqueThemes).map((purchase) => {
          const themeKey = getThemeKey(purchase.shop_items.name);
          const selectedServerId = selectedServers[purchase.id];
          const selectedServer = servers.find((s: Server) => s.id === selectedServerId);
          const isApplied = selectedServer?.theme === themeKey;
          
          // Find servers currently using this theme
          const serversUsingTheme = servers.filter((s: Server) => s.theme === themeKey);

          return (
            <Card key={purchase.id} className="gaming-border overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    {purchase.shop_items.name}
                  </CardTitle>
                  {serversUsingTheme.length > 0 && (
                    <Badge variant="default" className="bg-success/20 text-success border-success/30">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                {/* Show which servers are using this theme */}
                {serversUsingTheme.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {serversUsingTheme.map((server: Server) => (
                      <Badge 
                        key={server.id} 
                        variant="secondary" 
                        className="text-xs flex items-center gap-1"
                      >
                        <Avatar className="h-3 w-3">
                          <AvatarImage src={server.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {server.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {server.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <ThemePreview themeName={themeKey} />
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Apply to server:</label>
                  <Select
                    value={selectedServers[purchase.id] || ""}
                    onValueChange={(value) => 
                      setSelectedServers((prev) => ({ ...prev, [purchase.id]: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a server" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server: Server) => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={server.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {server.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{server.name}</span>
                            {server.theme === themeKey && (
                              <Check className="h-3 w-3 text-success ml-auto" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant={isApplied ? "outline" : "hero"}
                  size="sm"
                  className="w-full"
                  disabled={!selectedServerId || applyTheme.isPending || isApplied}
                  onClick={() => handleApplyTheme(purchase, selectedServerId)}
                >
                  {applyTheme.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isApplied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {isApplied ? "Applied" : "Apply Theme"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}