import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Crown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export default function Settings() {
  const { user, loading: authLoading, isSiteOwner, isServerOwner } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data);
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username,
          avatar_url: avatarUrl || null,
        });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Profile Card */}
        <div className="gaming-border p-6 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {username || "Set your username"}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {profile?.is_verified && (
                  <Badge className="bg-verified text-verified-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {isSiteOwner && (
                  <Badge className="bg-warning text-warning-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Site Owner
                  </Badge>
                )}
                {isServerOwner && !isSiteOwner && (
                  <Badge variant="outline" className="text-primary border-primary">
                    Server Owner
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <AvatarUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                fallback={username || user.email || "U"}
                label="Profile Avatar"
              />

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
                variant="hero"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="gaming-border p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Role</span>
              <span>
                {isSiteOwner 
                  ? "Site Owner" 
                  : isServerOwner 
                    ? "Server Owner" 
                    : "User"
                }
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Account Created</span>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
