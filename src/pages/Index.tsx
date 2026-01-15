import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ServerCard } from "@/components/servers/ServerCard";
import { useServers } from "@/hooks/useServers";
import { useAuth } from "@/hooks/useAuth"
import { Users, Shield, Gamepad2, Sparkles, ArrowRight } from "lucide-react";

export default function Index() {
  const { servers, loading } = useServers();
  const featuredServers = servers.slice(0, 6);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
           
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Welcome to LokroGamingGroup
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              <span className="text-gradient-primary">Unite</span> Your Gaming Community
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Discover and join amazing Discord servers. Create your own community and connect with gamers worldwide through LGG's trusted network.
            </p>

            {user && (
  <p className="mx-auto mb-10 max-w-2xl text-sm text-muted-foreground">
    Welcome back,{" "}
    <span className="text-gradient-primary">
      {user.user_metadata?.username.replace(username.charAt(0), username.charAt(0).toUpperCase()) ?? user.email}
    </span>
    !
  </p>
)}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/servers">
                  Browse Servers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Register Server
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="gaming-border p-6 text-center hover:glow-primary transition-shadow duration-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Growing Community</h3>
              <p className="text-muted-foreground">
                Join thousands of gamers across our network of verified Discord servers.
              </p>
            </div>
            
            <div className="gaming-border p-6 text-center hover:glow-primary transition-shadow duration-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-success/20">
                <Shield className="h-7 w-7 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Age Verification</h3>
              <p className="text-muted-foreground">
                AI-powered content ratings ensure safe and appropriate communities for all ages.
              </p>
            </div>
            
            <div className="gaming-border p-6 text-center hover:glow-primary transition-shadow duration-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-warning/20">
                <Gamepad2 className="h-7 w-7 text-warning" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gaming Focused</h3>
              <p className="text-muted-foreground">
                Built for gamers, by gamers. Find communities for any game or genre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Servers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Featured <span className="text-gradient-primary">Servers</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Discover trending communities and join the conversation
            </p>
          </div>
          
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="gaming-border h-64 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : featuredServers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServers.map((server, index) => (
                <ServerCard key={server.id} server={server} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 gaming-border">
              <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No servers yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to register your server!</p>
              <Button variant="hero" asChild>
                <Link to="/auth?mode=signup">Register Your Server</Link>
              </Button>
            </div>
          )}
          
          {featuredServers.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/servers">
                  View All Servers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Build Your Community?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Register your Discord server and reach thousands of potential members.
          </p>
          <Button variant="gaming" size="xl" asChild>
            <Link to="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">L</span>
              </div>
              <span className="font-semibold">LokroGamingGroup</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/rules" className="hover:text-foreground transition-colors">
                Rules
              </Link>
              <Link to="/servers" className="hover:text-foreground transition-colors">
                Servers
              </Link>
            <Link to="https://dcs.lol" className="hover:text-foreground transition-colors">
              DCS.LOL API
            </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 LGG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
