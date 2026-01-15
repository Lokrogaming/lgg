import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/addons/countdown";

const NotFound = () => {
            
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <SearchX className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
        <h1 className="mb-4 text-4xl font-bold">Not finished yet!</h1>
        <p className="mb-4 text-xl text-muted-foreground">Releasing soon! Further information and releasedate on our discordserver</p>
        
        <Countdown targetDate={new Date("2026-01-01")} />

        till release

        <Button variant="hero" size="xl" asChild>
                <Link to="/servers">
                  Browse Servers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
      </div>
    </div>
  );
};

export default NotFound;
