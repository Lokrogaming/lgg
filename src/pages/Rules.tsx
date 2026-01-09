import { Header } from "@/components/layout/Header";
import rulesData from "@/data/rules.json";
import { Shield, ScrollText } from "lucide-react";

export default function Rules() {
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
            Community <span className="text-gradient-primary">Rules</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read and follow these guidelines to ensure a safe and enjoyable experience for everyone in the LGG network.
          </p>
        </div>
      </section>

      {/* Rules List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {rulesData.rules.map((rule, index) => (
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
                      {rule.paragraph.header}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {rule.paragraph.text}
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
                  Violation of these rules may result in warnings, temporary bans, or permanent removal from the LGG network. 
                  Staff decisions are final. If you have questions about the rules, please contact a staff member.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
