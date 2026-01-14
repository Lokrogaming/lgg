import { Header } from "@/components/layout/Header";
import partners from "@/data/partner.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const partnerTypeColors: Record<string, string> = {
  discord: "from-indigo-500 to-purple-500",
  website: "from-emerald-500 to-teal-500",
};

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Partner Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner, index) => (
              <div
                key={partner.id}
                className="gaming-border p-6 hover:glow-primary transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center h-14 w-14 rounded-xl mb-4 bg-gradient-to-br",
                    partnerTypeColors[partner.type] ?? "from-primary to-primary"
                  )}
                >
                  <Heart className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>

                <p className="text-muted-foreground text-sm mb-3">
                  {partner.description}
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {partner.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2">
                  {partner.type === "website" && (
                    <Button
                      variant="hero"
                      onClick={() => window.open(partner.url, "_blank")}
                    >
                      Visit Website
                    </Button>
                  )}

                  {partner.type === "discord" && (
                    <>
                      <Button
                        variant="hero"
                        onClick={() =>
                          window.open(partner.inviteUrl, "_blank")
                        }
                      >
                        Join Discord
                      </Button>

                      {partner.landingPageUrl && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(partner.landingPageUrl, "_blank")
                          }
                        >
                          View Landing Page
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
