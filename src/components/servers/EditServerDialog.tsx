import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useUpdateServer, useDeleteServer, Server, AgeRating } from "@/hooks/useServers";
import { Loader2, Image, Link, Bell, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditServerDialogProps {
  server: Server;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditServerDialog({ server, open, onOpenChange, onSuccess }: EditServerDialogProps) {
  const [name, setName] = useState(server.name);
  const [description, setDescription] = useState(server.description || "");
  const [avatarUrl, setAvatarUrl] = useState(server.avatar_url || "");
  const [inviteLink, setInviteLink] = useState(server.invite_link || "");
  const [ageRating, setAgeRating] = useState<AgeRating>(server.age_rating);
  const [webhookUrl, setWebhookUrl] = useState(server.webhook_url || "");
  const [webhookOnMilestone, setWebhookOnMilestone] = useState(server.webhook_on_milestone);
  const [webhookOnJoin, setWebhookOnJoin] = useState(server.webhook_on_join);
  const [milestoneThreshold, setMilestoneThreshold] = useState(server.milestone_threshold);

  const updateServer = useUpdateServer();
  const deleteServer = useDeleteServer();

  useEffect(() => {
    setName(server.name);
    setDescription(server.description || "");
    setAvatarUrl(server.avatar_url || "");
    setInviteLink(server.invite_link || "");
    setAgeRating(server.age_rating);
    setWebhookUrl(server.webhook_url || "");
    setWebhookOnMilestone(server.webhook_on_milestone);
    setWebhookOnJoin(server.webhook_on_join);
    setMilestoneThreshold(server.milestone_threshold);
  }, [server]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateServer.mutateAsync({
      id: server.id,
      name,
      description: description || null,
      avatar_url: avatarUrl || null,
      invite_link: inviteLink || null,
      age_rating: ageRating,
      webhook_url: webhookUrl || null,
      webhook_on_milestone: webhookOnMilestone,
      webhook_on_join: webhookOnJoin,
      milestone_threshold: milestoneThreshold,
    });

    onOpenChange(false);
    onSuccess?.();
  };

  const handleDelete = async () => {
    await deleteServer.mutateAsync(server.id);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Server</DialogTitle>
          <DialogDescription>
            Update your server information
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
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Member Count:</span>
                <span className="font-medium">{server.member_count.toLocaleString()}</span>
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
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Every Join</Label>
                    <p className="text-xs text-muted-foreground">
                      Send a message for each new join
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

          <div className="flex justify-between gap-2 pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Server?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your server from the LGG network.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {deleteServer.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={updateServer.isPending || !name}>
                {updateServer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
