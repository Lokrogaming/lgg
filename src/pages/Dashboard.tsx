import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useMyServers } from "@/hooks/useServers";
import { ServerCard } from "@/components/servers/ServerCard";
import { CreateServerDialog } from "@/components/servers/CreateServerDialog";
import { EditServerDialog } from "@/components/servers/EditServerDialog";
import { ThemeInventory } from "@/components/dashboard/ThemeInventory";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Server as ServerIcon, Coins, ShoppingBag, Palette } from "lucide-react";
import { Server } from "@/hooks/useServers";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { servers, loading: serversLoading, refetch } = useMyServers(user?.id);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalCredits = servers.reduce((acc, s) => acc + (s.credits || 0), 0);
  const totalVotes = servers.reduce((acc, s) => acc + (s.vote_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Servers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Discord server listings
            </p>
          </div>
          <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </div>

        {/* Stats */}
        {servers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="gaming-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <ServerIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Servers</p>
                  <p className="text-2xl font-bold">{servers.length}</p>
                </div>
              </div>
            </div>
            <div className="gaming-border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Coins className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold">{totalCredits}</p>
                </div>
              </div>
            </div>
            <Link to="/shop" className="gaming-border p-4 hover:glow-primary transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <ShoppingBag className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Shop</p>
                  <p className="text-lg font-medium group-hover:text-primary transition-colors">
                    Boost your servers →
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Tabs for Servers and Inventory */}
        <Tabs defaultValue="servers" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="servers" className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              My Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servers">
            {/* Server Grid */}
            {serversLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="gaming-border h-64 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : servers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {servers.map((server, index) => (
                  <ServerCard 
                    key={server.id} 
                    server={server} 
                    index={index}
                    showActions
                    showCredits
                    onEdit={() => setEditingServer(server)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 gaming-border">
                <ServerIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No servers yet</h3>
                <p className="text-muted-foreground mb-6">
                  Register your first Discord server to get started
                </p>
                <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Server
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="themes">
            <ThemeInventory userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>

      <CreateServerDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
      />
      
      {editingServer && (
        <EditServerDialog
          server={editingServer}
          open={!!editingServer}
          onOpenChange={(open) => !open && setEditingServer(null)}
          onSuccess={() => {
            refetch();
            setEditingServer(null);
          }}
        />
      )}
    </div>
  );
}
