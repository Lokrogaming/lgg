import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useMyServers } from "@/hooks/useServers";
import { ServerCard } from "@/components/servers/ServerCard";
import { CreateServerDialog } from "@/components/servers/CreateServerDialog";
import { EditServerDialog } from "@/components/servers/EditServerDialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Server as ServerIcon } from "lucide-react";
import { Server } from "@/hooks/useServers";
import { useEffect } from "react";

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
