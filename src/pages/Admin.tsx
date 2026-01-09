import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useServers, Server, useUpdateServer, useDeleteServer } from "@/hooks/useServers";
import { supabase } from "@/integrations/supabase/client";
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
  Shield, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Users,
  Server as ServerIcon
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading, isAdmin, isStaff } = useAuth();
  const { servers, loading: serversLoading } = useServers();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Server | null>(null);
  const navigate = useNavigate();
  
  const updateServer = useUpdateServer();
  const deleteServer = useDeleteServer();

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isStaff))) {
      navigate("/");
      toast.error("Access denied");
    }
  }, [user, authLoading, isAdmin, isStaff, navigate]);

  if (authLoading || !user || (!isAdmin && !isStaff)) {
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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteServer.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Manage all servers and users across the LGG network
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {isAdmin ? "Administrator" : "Staff"}
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
              <div className="p-2 rounded-lg bg-nsfw/20">
                <Shield className="h-5 w-5 text-nsfw" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NSFW Servers</p>
                <p className="text-2xl font-bold">{servers.filter(s => s.age_rating === "nsfw").length}</p>
              </div>
            </div>
          </div>
          <div className="gaming-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {servers.reduce((acc, s) => acc + s.member_count, 0).toLocaleString()}
                </p>
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
                <TableHead>Members</TableHead>
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
                          <p className="font-medium">{server.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {server.description || "No description"}
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
                    <TableCell>{server.member_count.toLocaleString()}</TableCell>
                    <TableCell>
                      {server.is_verified ? (
                        <Badge className="bg-success text-success-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <X className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
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
