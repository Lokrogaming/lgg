import { useState, useEffect } from "react";
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
import { extractInviteCode, fetchDcsServerInfo, createDcsLink } from "@/hooks/useDcsApi";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Loader2, Link as LinkIcon, Bell, RefreshCw, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateServerDialog({ open, onOpenChange, onSuccess }: CreateServerDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [discordInviteLink, setDiscordInviteLink] = useState("");
  const [dcsShortCode, setDcsShortCode] = useState("");
  const [dcsLink, setDcsLink] = useState("");
  const [guildId, setGuildId] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [ageRating, setAgeRating] = useState<AgeRating>("all_ages");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookOnMilestone, setWebhookOnMilestone] = useState(false);
  const [webhookOnJoin, setWebhookOnJoin] = useState(false);
  const [milestoneThreshold, setMilestoneThreshold] = useState(100);
  const [fetching, setFetching] = useState(false);
  const [creatingDcsLink, setCreatingDcsLink] = useState(false);
  const [serverInfoFetched, setServerInfoFetched] = useState(false);

  const createServer = useCreateServer();

  // Auto-fetch server info when discord invite link changes
  useEffect(() => {
    const code = extractInviteCode(discordInviteLink);
    if (code && code.length >= 4) {
      const timer = setTimeout(() => {
        handleFetchFromDiscord();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setServerInfoFetched(false);
    }
  }, [discordInviteLink]);

  const handleFetchFromDiscord = async () => {
    const code = extractInviteCode(discordInviteLink);
    if (!code) {
      toast.error("Invalid invite link");
      return;
    }

    setFetching(true);
    try {
      const info = await fetchDcsServerInfo(code);
      if (info) {
        if (!name) setName(info.name);
        if (!description && info.description) setDescription(info.description);
        if (info.icon) setAvatarUrl(info.icon);
        setGuildId(info.guildId);
        setMemberCount(info.memberCount);
        setOnlineCount(info.onlineCount);
        setServerInfoFetched(true);
        toast.success("Server info fetched from Discord!");
      } else {
        toast.error("Could not fetch server info. Please check the invite link.");
        setServerInfoFetched(false);
      }
    } catch {
      toast.error("Failed to fetch server info");
      setServerInfoFetched(false);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateDcsLink = async () => {
  if (!discordInviteLink) {
    toast.error("Please enter a Discord invite link first");
    return;
  }

  setCreatingDcsLink(true);
  try {
    const rawId = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 32);

    const customId = rawId.length >= 3 ? rawId : undefined;

    const result = await createDcsLink(discordInviteLink, customId);

    if (result) {
      setDcsShortCode(result.shortCode);
      setDcsLink(result.shortUrl);
      toast.success("DCS.lol link created!");
    } else {
      toast.error("Could not create DCS link");
    }
  } catch {
    toast.error("Failed to create DCS link");
  } finally {
    setCreatingDcsLink(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have a DCS link if we have a Discord invite
    let finalDcsShortCode = dcsShortCode;
    if (discordInviteLink && !dcsShortCode) {
      const code = extractInviteCode(discordInviteLink);
      if (code) {
        finalDcsShortCode = code;
      }
    }

    await createServer.mutateAsync({
      name,
      description: description || undefined,
      avatar_url: avatarUrl || undefined,
      invite_link: discordInviteLink || undefined,
      dcs_short_code: finalDcsShortCode || undefined,
      guild_id: guildId || undefined,
      member_count: memberCount,
      online_count: onlineCount,
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
    setDiscordInviteLink("");
    setDcsShortCode("");
    setDcsLink("");
    setGuildId("");
    setMemberCount(0);
    setOnlineCount(0);
    setAgeRating("all_ages");
    setWebhookUrl("");
    setWebhookOnMilestone(false);
    setWebhookOnJoin(false);
    setMilestoneThreshold(100);
    setServerInfoFetched(false);

    onOpenChange(false);
    onSuccess?.();
  };

  const inviteCode = extractInviteCode(discordInviteLink);

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
                <p className="text-xs text-muted-foreground">
                  All server information & invite link creation powered by{" "}
                  <a href="https://dcs.lol" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    DCS.LOL API
                  </a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="discord-invite" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Discord Invite Link *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="discord-invite"
                    type="url"
                    value={discordInviteLink}
                    onChange={(e) => setDiscordInviteLink(e.target.value)}
                    placeholder="https://discord.gg/your-invite"
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchFromDiscord}
                    disabled={fetching || !inviteCode}
                    title="Fetch server info"
                  >
                    {fetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : serverInfoFetched ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {serverInfoFetched && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Server info fetched: {memberCount.toLocaleString()} members, {onlineCount.toLocaleString()} online
                  </p>
                )}
              </div>

              {/* DCS Link Generation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  DCS.lol Short Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={dcsLink || (inviteCode ? `https://dcs.lol/${inviteCode}` : "")}
                    placeholder="Will be generated..."
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCreateDcsLink}
                    disabled={creatingDcsLink || !discordInviteLink}
                    title="Generate custom DCS link"
                  >
                    {creatingDcsLink ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : dcsShortCode ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This short link will be used for server invites
                </p>
              </div>

              <AvatarUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                fallback={name || "S"}
                label="Server Avatar"
              />
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