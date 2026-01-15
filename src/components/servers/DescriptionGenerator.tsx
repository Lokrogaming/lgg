import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sparkles, Loader2, ChevronDown, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DescriptionGeneratorProps {
  serverName: string;
  onDescriptionGenerated: (description: string) => void;
}

const tones = [
  { value: "friendly", label: "Friendly & Welcoming" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Fun" },
  { value: "competitive", label: "Competitive" },
  { value: "community", label: "Community-focused" },
];

export function DescriptionGenerator({ 
  serverName, 
  onDescriptionGenerated 
}: DescriptionGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("friendly");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!serverName.trim()) {
      toast.error("Please enter a server name first");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { 
          serverName, 
          keywords: keywords.trim() || undefined,
          tone 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.description) {
        onDescriptionGenerated(data.description);
        toast.success("Description generated!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="gap-2 w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Description Generator
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3 space-y-3 p-3 rounded-lg bg-muted/50 border">
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm">
            Keywords (optional)
          </Label>
          <Input
            id="keywords"
            placeholder="e.g., gaming, Minecraft, competitive, community events"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add keywords to help the AI understand your server better
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone" className="text-sm">
            Tone
          </Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !serverName.trim()}
          className="w-full gap-2"
          variant="hero"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate Description
            </>
          )}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
