import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Palette, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ThemePreview } from "@/components/shop/ThemePreview";

interface ThemeItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  theme_data: Record<string, unknown> | null;
}

interface ThemeForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  background: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: string;
}

const blankForm: ThemeForm = {
  name: "",
  description: "",
  price: 100,
  is_active: true,
  background: "linear-gradient(135deg, rgba(100, 100, 100, 0.15), rgba(50, 50, 50, 0.15))",
  borderColor: "rgba(100, 100, 100, 0.5)",
  accentColor: "#6b7280",
  textColor: "#ffffff",
  mutedColor: "#9ca3af",
  fontFamily: "inherit",
};

function itemToForm(item: ThemeItem): ThemeForm {
  const td = (item.theme_data || {}) as Record<string, string>;
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    is_active: item.is_active,
    background: td.background || blankForm.background,
    borderColor: td.borderColor || blankForm.borderColor,
    accentColor: td.accentColor || blankForm.accentColor,
    textColor: td.textColor || blankForm.textColor,
    mutedColor: td.mutedColor || blankForm.mutedColor,
    fontFamily: td.fontFamily || blankForm.fontFamily,
  };
}

export function ShopThemesPanel() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ThemeForm | null>(null);
  const [deleteItem, setDeleteItem] = useState<ThemeItem | null>(null);

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ["admin-shop-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*")
        .eq("type", "theme")
        .order("price", { ascending: true });
      if (error) throw error;
      return data as ThemeItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: ThemeForm) => {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: form.price,
        is_active: form.is_active,
        type: "theme",
        theme_data: {
          background: form.background,
          borderColor: form.borderColor,
          accentColor: form.accentColor,
          textColor: form.textColor,
          mutedColor: form.mutedColor,
          fontFamily: form.fontFamily,
        },
      };
      if (form.id) {
        const { error } = await supabase
          .from("shop_items")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shop_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-themes"] });
      queryClient.invalidateQueries({ queryKey: ["shop-items"] });
      toast.success("Theme saved");
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (item: ThemeItem) => {
      const { error } = await supabase
        .from("shop_items")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-themes"] });
      queryClient.invalidateQueries({ queryKey: ["shop-items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-themes"] });
      queryClient.invalidateQueries({ queryKey: ["shop-items"] });
      toast.success("Theme deleted");
      setDeleteItem(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Shop Themes
          </h2>
          <p className="text-sm text-muted-foreground">
            Create, edit and toggle themes available for purchase.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...blankForm })}>
          <Plus className="mr-2 h-4 w-4" />
          New Theme
        </Button>
      </div>

      <div className="grid gap-3">
        {themes.map((item) => (
          <div
            key={item.id}
            className="gaming-border p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-10 w-10 rounded-full border-2 flex-shrink-0"
                style={{
                  background:
                    ((item.theme_data as Record<string, string>)?.background as string) ||
                    "transparent",
                  borderColor:
                    ((item.theme_data as Record<string, string>)?.accentColor as string) ||
                    "#888",
                }}
              />
              <div className="min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.price} credits {item.is_active ? "" : "• Hidden"}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleActive.mutate(item)}
                title={item.is_active ? "Hide" : "Show"}
              >
                {item.is_active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing(itemToForm(item))}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteItem(item)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {themes.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No themes yet. Create your first one!
          </p>
        )}
      </div>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit Theme" : "New Theme"}</DialogTitle>
              <DialogDescription>
                Configure colors and metadata. Changes apply to the shop immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Aurora"
                  />
                </div>
                <div>
                  <Label>Price (credits)</Label>
                  <Input
                    type="number"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="Accent Color"
                  value={editing.accentColor}
                  onChange={(v) => setEditing({ ...editing, accentColor: v })}
                />
                <ColorField
                  label="Text Color"
                  value={editing.textColor}
                  onChange={(v) => setEditing({ ...editing, textColor: v })}
                />
                <ColorField
                  label="Muted Color"
                  value={editing.mutedColor}
                  onChange={(v) => setEditing({ ...editing, mutedColor: v })}
                />
                <div>
                  <Label>Font Family</Label>
                  <Input
                    value={editing.fontFamily}
                    onChange={(e) =>
                      setEditing({ ...editing, fontFamily: e.target.value })
                    }
                    placeholder="Orbitron, sans-serif"
                  />
                </div>
              </div>

              <div>
                <Label>Background (CSS)</Label>
                <Textarea
                  value={editing.background}
                  onChange={(e) =>
                    setEditing({ ...editing, background: e.target.value })
                  }
                  rows={2}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <Label>Border Color (CSS)</Label>
                <Input
                  value={editing.borderColor}
                  onChange={(e) =>
                    setEditing({ ...editing, borderColor: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>

              {editing.name && (
                <div>
                  <Label className="mb-2 block">Live Preview</Label>
                  <LivePreview form={editing} />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(editing)}
                disabled={saveMutation.isPending || !editing.name}
              >
                {saveMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Theme
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteItem?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the theme from the shop. Existing purchases will remain in
              users' inventories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded border bg-transparent cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function LivePreview({ form }: { form: ThemeForm }) {
  return (
    <div
      className="rounded-xl border-2 p-4 transition-all"
      style={{
        background: form.background,
        borderColor: form.borderColor,
        fontFamily: form.fontFamily,
        boxShadow: `0 0 20px ${form.accentColor}30`,
      }}
    >
      <p
        className="font-semibold mb-1"
        style={{ color: form.textColor, fontFamily: form.fontFamily }}
      >
        {form.name || "Theme Name"}
      </p>
      <p className="text-sm" style={{ color: form.mutedColor }}>
        {form.description || "A preview of this theme"}
      </p>
      <div
        className="mt-2 inline-block px-2 py-1 rounded text-xs"
        style={{ backgroundColor: `${form.accentColor}30`, color: form.accentColor }}
      >
        Accent
      </div>
    </div>
  );
}
