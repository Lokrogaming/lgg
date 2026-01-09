import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useMyServers } from "@/hooks/useServers";
import { useShopItems, usePurchaseItem, ShopItem } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Zap, Sparkles, Palette, Coins, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const itemTypeIcons: Record<string, React.ReactNode> = {
  bump: <Zap className="h-6 w-6" />,
  promotion: <Sparkles className="h-6 w-6" />,
  theme: <Palette className="h-6 w-6" />,
};

const itemTypeColors: Record<string, string> = {
  bump: "from-primary to-blue-500",
  promotion: "from-warning to-amber-500",
  theme: "from-purple-500 to-pink-500",
};

export default function Shop() {
  const { user } = useAuth();
  const { servers } = useMyServers(user?.id);
  const { data: shopItems = [], isLoading } = useShopItems();
  const purchaseItem = usePurchaseItem();
  const navigate = useNavigate();
  
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>("");

  const handlePurchase = async () => {
    if (!selectedItem || !selectedServer) return;
    await purchaseItem.mutateAsync({
      serverId: selectedServer,
      itemId: selectedItem.id,
    });
    setSelectedItem(null);
    setSelectedServer("");
  };

  const selectedServerData = servers.find(s => s.id === selectedServer);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="bg-gradient-hero py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-warning/20 mb-6">
            <ShoppingBag className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Server <span className="text-gradient-primary">Shop</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Boost your server visibility with bumps, promotions, and custom themes. Earn credits through joins and votes!
          </p>
        </div>
      </section>

      {/* How to earn credits */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="gaming-border p-6 bg-primary/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-warning" />
              How to Earn Credits
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20 text-success font-bold">
                  +2
                </div>
                <div>
                  <p className="font-medium">Server Joins</p>
                  <p className="text-sm text-muted-foreground">Earn 2 credits for every new member that joins through LGG</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">
                  +1
                </div>
                <div>
                  <p className="font-medium">Votes</p>
                  <p className="text-sm text-muted-foreground">Earn 1 credit for every 5 votes your server receives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Items */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shopItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="gaming-border p-6 hover:glow-primary transition-all duration-300 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "inline-flex items-center justify-center h-14 w-14 rounded-xl mb-4 bg-gradient-to-br",
                    itemTypeColors[item.type] || "from-primary to-primary"
                  )}>
                    {itemTypeIcons[item.type] || <ShoppingBag className="h-6 w-6" />}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {item.duration_hours && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.duration_hours >= 24 
                          ? `${Math.floor(item.duration_hours / 24)} days`
                          : `${item.duration_hours} hours`
                        }
                      </Badge>
                    )}
                    {!item.duration_hours && (
                      <Badge variant="outline" className="text-xs">
                        Permanent
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xl font-bold text-warning">
                      <Coins className="h-5 w-5" />
                      {item.price}
                    </div>
                    <Button 
                      variant="hero"
                      onClick={() => {
                        if (!user) {
                          navigate("/auth");
                          return;
                        }
                        setSelectedItem(item);
                      }}
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Select which server to apply this perk to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {servers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You don't have any servers yet. Create one first!
                </p>
                <Button variant="hero" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Server</label>
                  <Select value={selectedServer} onValueChange={setSelectedServer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a server" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{server.name}</span>
                            <span className="text-warning text-xs">
                              {server.credits} credits
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServerData && selectedItem && (
                  <div className="gaming-border p-4 bg-muted/50">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Server Credits</span>
                      <span className="text-warning font-medium">
                        {selectedServerData.credits}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Item Cost</span>
                      <span className="text-foreground font-medium">
                        -{selectedItem.price}
                      </span>
                    </div>
                    <div className="border-t border-border my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className={cn(
                        "font-medium",
                        selectedServerData.credits >= selectedItem.price 
                          ? "text-success" 
                          : "text-destructive"
                      )}>
                        {selectedServerData.credits - selectedItem.price}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="hero"
                    disabled={
                      !selectedServer || 
                      !selectedItem ||
                      purchaseItem.isPending ||
                      (selectedServerData?.credits || 0) < (selectedItem?.price || 0)
                    }
                    onClick={handlePurchase}
                  >
                    {purchaseItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Purchase
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
