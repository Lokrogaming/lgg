import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useServers, Server, useUpdateServer, useDeleteServer } from "@/hooks/useServers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  MoreHorizontal, 
  Crown, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Users,
  Server as ServerIcon,
  Coins,
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading, isSiteOwner } = useAuth();
  const { servers, loading: serversLoading } = useServers();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Server | null>(null);
  const navigate = useNavigate();
  
  const updateServer = useUpdateServer();
  const deleteServer = useDeleteServer();

  useEffect(() => {
    if (!authLoading && (!user || !isSiteOwner)) {
      navigate("/");
      toast.error("Access denied - Site Owner only");
    }
  }, [user, authLoading, isSiteOwner, navigate]);

  if (authLoading || !user || !isSiteOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = async (server: Server) => {
    await updateServer.mutateAsync({
      id: server.id,
      is_verified: !server.is_verified,
    });
    toast.success(server.is_verified ? "Server unverified" : "Server verified");
  };

  const handleTogglePromotion = async (server: Server) => {
    await updateServer.mutateAsync({
      id: server.id,
      is_promoted: !server.is_promoted,
    });
    toast.success(server.is_promoted ? "Promotion removed" : "Server promoted");
  };

  const handleAddCredits = async (server: Server, amount: number) => {
    await updateServer.mutateAsync({
      id: server.id,
      credits: (server.credits || 0) + amount,
    });
    toast.success(`Added ${amount} credits to ${server.name}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteServer.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const totalCredits = servers.reduce((acc, s) => acc + (s.credits || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-warning" />
              <h1 className="text-3xl font-bold">Owner Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Full control over all servers in the LGG network
            </p>
          </div>
          <Badge className="bg-warning text-warning-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Site Owner
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <div className="p-2 rounded-lg bg-success/20">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{servers.filter(s => s.is_verified).length}</p>
              </div>
            </div>
          </div>
          <div className="gaming-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Sparkles className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promoted</p>
                <p className="text-2xl font-bold">{servers.filter(s => s.is_promoted).length}</p>
              </div>
            </div>
          </div>
          <div className="gaming-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Coins className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search servers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Servers Table */}
        <div className="gaming-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Server</TableHead>
                <TableHead>Age Rating</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serversLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredServers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No servers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredServers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={server.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {server.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{server.name}</p>
                            {server.is_promoted && <Sparkles className="h-3 w-3 text-warning" />}
                            {server.is_bumped && <Zap className="h-3 w-3 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {server.member_count.toLocaleString()} members • {server.vote_count || 0} votes
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={server.age_rating === "nsfw" ? "destructive" : "secondary"}
                      >
                        {server.age_rating.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-warning">
                        <Coins className="h-4 w-4" />
                        {server.credits || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {server.is_verified ? (
                          <Badge className="bg-success text-success-foreground text-xs">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerify(server)}>
                            {server.is_verified ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Verify
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePromotion(server)}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {server.is_promoted ? "Remove Promotion" : "Promote"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAddCredits(server, 100)}>
                            <Coins className="mr-2 h-4 w-4" />
                            Add 100 Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddCredits(server, 500)}>
                            <Coins className="mr-2 h-4 w-4" />
                            Add 500 Credits
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirm(server)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.name}" from the network. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
