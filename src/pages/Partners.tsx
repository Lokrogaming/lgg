import { Header } from "@/components/layout/Header";
import partners from "@/data/partner.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingBag, Heart } from "lucide-react";
import { cn } from "@/lib/utils";


export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-hero py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Our <span className="text-gradient-primary">Partners</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Communities and projects we proudly collaborate with.
          </p>
        </div>
      </section>

      {/* Partner Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner, index) => (
              <div
                key={partner.id}
                className="gaming-border p-6 hover:glow-primary transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center h-14 w-14 rounded-xl mb-4 bg-gradient-to-br",
                    partnerTypeColors[partner.type] || "from-primary to-primary"
                  )}
                >
                  <Heart className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {partner.description}
                </p>

               

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => window.open(partner.url, "_blank")}
                >
                  Visit Partner
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
