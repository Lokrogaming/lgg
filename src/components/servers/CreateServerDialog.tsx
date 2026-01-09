import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateServer, AgeRating } from "@/hooks/useServers";
import { Loader2, Image, Link, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateServerDialog({ open, onOpenChange, onSuccess }: CreateServerDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [ageRating, setAgeRating] = useState<AgeRating>("all_ages");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookOnMilestone, setWebhookOnMilestone] = useState(false);
  const [webhookOnJoin, setWebhookOnJoin] = useState(false);
  const [milestoneThreshold, setMilestoneThreshold] = useState(100);

  const createServer = useCreateServer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createServer.mutateAsync({
      name,
      description: description || undefined,
      avatar_url: avatarUrl || undefined,
      invite_link: inviteLink || undefined,
      age_rating: ageRating,
      webhook_url: webhookUrl || undefined,
      webhook_on_milestone: webhookOnMilestone,
      webhook_on_join: webhookOnJoin,
      milestone_threshold: milestoneThreshold,
    });

    // Reset form
    setName("");
    setDescription("");
    setAvatarUrl("");
    setInviteLink("");
    setAgeRating("all_ages");
    setWebhookUrl("");
    setWebhookOnMilestone(false);
    setWebhookOnJoin(false);
    setMilestoneThreshold(100);

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            Register your Discord server to the LGG network
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Server"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your server..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age-rating">Age Rating *</Label>
                <Select value={ageRating} onValueChange={(v) => setAgeRating(v as AgeRating)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_ages">All Ages - Suitable for everyone</SelectItem>
                    <SelectItem value="under_18">Under 18 - Teen-friendly content</SelectItem>
                    <SelectItem value="18_plus">18+ - Adult themes (non-explicit)</SelectItem>
                    <SelectItem value="nsfw">NSFW - Explicit content (18+ required)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  AI will verify your rating. NSFW servers require identity verification.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="avatar" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Avatar URL
                </Label>
                <Input
                  id="avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Discord Invite Link
                </Label>
                <Input
                  id="invite"
                  type="url"
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  placeholder="https://discord.gg/..."
                />
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="webhook" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Discord Webhook URL
                </Label>
                <Input
                  id="webhook"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when your server reaches milestones or gets new joins
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Milestones</Label>
                    <p className="text-xs text-muted-foreground">
                      Send a message when you reach member milestones
                    </p>
                  </div>
                  <Switch
                    checked={webhookOnMilestone}
                    onCheckedChange={setWebhookOnMilestone}
                    disabled={!webhookUrl}
                  />
                </div>

                {webhookOnMilestone && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                    <Label htmlFor="milestone">Milestone Threshold</Label>
                    <Input
                      id="milestone"
                      type="number"
                      min={10}
                      value={milestoneThreshold}
                      onChange={(e) => setMilestoneThreshold(parseInt(e.target.value) || 100)}
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Notify every {milestoneThreshold} members
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Every Join</Label>
                    <p className="text-xs text-muted-foreground">
                      Send a message for each new join (may be noisy)
                    </p>
                  </div>
                  <Switch
                    checked={webhookOnJoin}
                    onCheckedChange={setWebhookOnJoin}
                    disabled={!webhookUrl}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={createServer.isPending || !name}>
              {createServer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Server
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
