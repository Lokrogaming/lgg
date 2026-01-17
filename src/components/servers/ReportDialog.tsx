import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Loader2 } from "lucide-react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverName: string;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or Scam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "harassment", label: "Harassment or Bullying" },
  { value: "impersonation", label: "Impersonation" },
  { value: "illegal", label: "Illegal Activity" },
  { value: "other", label: "Other" },
];

export function ReportDialog({
  open,
  onOpenChange,
  serverName,
  onSubmit,
  isLoading,
}: ReportDialogProps) {
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    const reason = category 
      ? `${REPORT_REASONS.find(r => r.value === category)?.label || category}${details ? `: ${details}` : ""}`
      : details;
    
    if (!reason.trim()) return;
    
    onSubmit(reason);
    setCategory("");
    setDetails("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategory("");
      setDetails("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Server
          </DialogTitle>
          <DialogDescription>
            Report "{serverName}" for violating our community guidelines. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Reason Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Please provide more details about why you're reporting this server..."
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500 characters
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || (!category && !details.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}