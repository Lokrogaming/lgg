import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins, ShoppingBag, Loader2, Receipt, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMyServers } from "@/hooks/useServers";
import { useCreditHistory } from "@/hooks/useCredits";

const number = (value: number) => value.toLocaleString();

export default function Credits() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { servers, loading, error, refetch } = useMyServers(user?.id);
  const history = useCreditHistory(user?.id);
  const [serverId, setServerId] = useState("all");
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);
  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const filtered = (history.data || []).filter(row => serverId === "all" || row.server_id === serverId);
  const selectedServers = servers.filter(server => serverId === "all" || server.id === serverId);
  const balance = selectedServers.reduce((sum, server) => sum + (server.credits || 0), 0);
  const spent = filtered.reduce((sum, row) => sum + (row.credits_spent || 0), 0);
  const unknown = filtered.some(row => row.credits_spent === null);
  const refresh = () => { void refetch(); void history.refetch(); };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Coins className="h-8 w-8 text-warning" />Credits</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Refresh balances" aria-label="Refresh balances" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
            <Button asChild variant="hero"><Link to="/shop"><ShoppingBag className="mr-2 h-4 w-4" />Shop</Link></Button>
          </div>
        </div>
        {error || history.error ? (
          <div role="alert" className="py-12 text-center"><p className="text-destructive mb-4">Your credit records couldn’t be loaded.</p><Button onClick={refresh}>Try again</Button></div>
        ) : loading || history.isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : servers.length === 0 ? (
          <div className="py-20 text-center"><Coins className="h-12 w-12 mx-auto text-warning mb-4" /><h2 className="text-xl font-semibold mb-4">No server balances yet</h2><Button asChild><Link to="/dashboard">Your Servers</Link></Button></div>
        ) : (
          <>
            <div className="mb-6 max-w-sm"><Select value={serverId} onValueChange={setServerId}><SelectTrigger aria-label="Filter by server"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All servers</SelectItem>{servers.map(server => <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid sm:grid-cols-3 gap-6 border-y border-border py-6 mb-8">
              <div><p className="text-sm text-muted-foreground mb-2">Available credits</p><p className="text-4xl font-bold text-warning">{number(balance)}</p></div>
              <div><p className="text-sm text-muted-foreground mb-2">Recorded spending</p><p className="text-3xl font-bold">{number(spent)}</p></div>
              <div><p className="text-sm text-muted-foreground mb-2">Purchase records</p><p className="text-3xl font-bold">{number(filtered.length)}</p></div>
            </div>
            <h2 className="text-xl font-semibold mb-4">Server balances</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">{selectedServers.map(server => <Link key={server.id} to={`/server/${server.id}`} className="gaming-border p-4 flex items-center gap-3 min-w-0"><Avatar className="h-10 w-10 shrink-0"><AvatarImage src={server.avatar_url || undefined} /><AvatarFallback>{server.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium truncate flex-1">{server.name}</span><span className="text-warning font-semibold flex gap-1 items-center shrink-0"><Coins className="h-4 w-4" />{number(server.credits || 0)}</span></Link>)}</div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Receipt className="h-5 w-5" />Spending history</h2>
            {unknown && <p className="text-sm text-muted-foreground mb-4">Older records have no saved purchase cost and aren’t included in recorded spending.</p>}
            {filtered.length === 0 ? <p className="text-muted-foreground text-center py-12 border-y border-border">No purchases yet</p> : <div className="divide-y divide-border border-y border-border">{filtered.map(row => {
              const expired = row.expires_at && new Date(row.expires_at) <= new Date();
              return <div key={row.id} className="py-4 flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium break-words">{row.shop_items?.name || "Unavailable item"}</p><p className="text-sm text-muted-foreground break-words">{servers.find(server => server.id === row.server_id)?.name}</p><p className="text-xs text-muted-foreground mt-1">{row.purchased_at ? new Date(row.purchased_at).toLocaleString() : "Date unavailable"}</p><Badge variant="outline" className="mt-2">{!row.is_active ? "Inactive" : expired ? "Expired" : "Active"}</Badge></div><span className="text-sm font-semibold shrink-0 text-warning">{row.credits_spent === null ? "Cost unknown" : row.credits_spent === 0 ? "Granted" : `−${number(row.credits_spent)} credits`}</span></div>;
            })}</div>}
          </>
        )}
      </main>
    </div>
  );
}