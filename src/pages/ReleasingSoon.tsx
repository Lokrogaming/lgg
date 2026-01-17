import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/addons/countdown";

const ReleasingSoon = () => {
  // Target date: February 1st, 2026
  const targetDate = new Date("2026-02-01T00:00:00");
            
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center flex flex-col items-center gap-6">
        <Clock className="h-12 w-12 text-primary" />

        <h1 className="text-4xl font-bold">
          Coming Soon!
        </h1>

        <p className="text-xl text-muted-foreground max-w-md">
          We're working hard to bring you something amazing. Join our Discord for updates!
        </p>

        {/* Countdown */}
        <div className="text-foreground">
          <Countdown targetDate={targetDate} />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Release on February 1st, 2026
        </p>

        {/* Button */}
        <Button variant="hero" size="xl" asChild>
          <a
            href="https://dcs.lol/lokrogaming"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ReleasingSoon;
