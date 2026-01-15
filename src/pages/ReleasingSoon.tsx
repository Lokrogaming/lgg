import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SearchX } from "lucide-react";


const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <SearchX className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
        <h1 className="mb-4 text-4xl font-bold">Not finished yet!</h1>
        <p className="mb-4 text-xl text-muted-foreground">Releasing soon! Further information and releasedate on our discordserver</p>
        
        <a href="https://dcs.lol/lokrogaming" className="text-primary bg-secondary underline hover:text-primary/90">
          Join Discord
        </a>
      </div>
    </div>
  );
};

export default NotFound;
