import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ServerCard } from "@/components/servers/ServerCard";
import { useServers, AgeRating } from "@/hooks/useServers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Gamepad2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const ageFilters: { value: AgeRating | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "all_ages", label: "All Ages" },
  { value: "under_18", label: "Under 18" },
  { value: "18_plus", label: "18+" },
  { value: "nsfw", label: "NSFW" },
];

export default function Servers() {
  const { servers, loading } = useServers();
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState<AgeRating | "all">("all");

  const filteredServers = servers.filter((server) => {
    const matchesSearch = server.name.toLowerCase().includes(search.toLowerCase()) ||
      server.description?.toLowerCase().includes(search.toLowerCase());
    const matchesAge = ageFilter === "all" || server.age_rating === ageFilter;
    return matchesSearch && matchesAge;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="bg-gradient-hero py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
            Discover <span className="text-gradient-primary">Servers</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Find and join amazing Discord communities from our trusted network
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search servers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-lg bg-card border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Age Filters */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {ageFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={ageFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAgeFilter(filter.value)}
                className={cn(
                  filter.value === "nsfw" && ageFilter === filter.value && "bg-nsfw hover:bg-nsfw/90"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredServers.length} {filteredServers.length === 1 ? "server" : "servers"} found
            </p>
          </div>

          {/* Server Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="gaming-border h-64 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : filteredServers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServers.map((server, index) => (
                <ServerCard key={server.id} server={server} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 gaming-border">
              <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No servers found</h3>
              <p className="text-muted-foreground">
                {search ? "Try a different search term" : "Be the first to register your server!"}
              </p>
            </div>
          )}

          {/* DCS.lol API Attribution */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              Server data powered by{" "}
              <a 
                href="https://dcs.lol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DCS.lol API
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
