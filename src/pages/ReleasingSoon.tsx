import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/addons/countdown";


const ReleasingSoon = () => {
            
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center flex flex-col items-center gap-4">
        <SearchX className="h-6 w-6 text-danger" />

        <h1 className="text-4xl font-bold">
          Not finished yet!
        </h1>

        <p className="text-xl text-muted-foreground max-w-md">
          Releasing soon! Further information and releasedate on our discord-server
        </p>

        {/* Countdown */}
        <div className="text-muted-foreground">
          <Countdown targetDate={new Date("2026-01-02")} />
        </div>
        <p className="text-sm text-muted-foreground">/\</p>
<p className="text-sm text-muted-foreground">
          Does not Work... I don't know why, but it doesn't work...
        </p>
        <p className="text-sm text-muted-foreground">
          Release on 1.2.2026
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
