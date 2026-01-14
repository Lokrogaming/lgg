import { Header } from "@/components/layout/Header";
import announcementsData from "@/data/announcements.json";
import { Shield, ScrollText } from "lucide-react";

export default function Announcements() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="bg-gradient-hero py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-6">
            <ScrollText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Community <span className="text-gradient-primary">Announcements</span>
          </h1>
          
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {announcementsData.announcements.map((announcement, index) => (
              <div 
                key={index}
                className="gaming-border p-6 hover:glow-primary transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {announcement.paragraph.header}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {announcement.paragraph.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="mt-12 gaming-border p-6 bg-warning/5 border-warning/30">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning mb-2">Important Notice</h3>
                <p className="text-muted-foreground text-sm">
                  Announcements are currently mainly available in German
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
