import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  fallback?: string;
  className?: string;
  label?: string;
}

export function AvatarUpload({ 
  value, 
  onChange, 
  fallback = "?", 
  className,
  label = "Avatar"
}: AvatarUploadProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onChange(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview - in production you'd upload to storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      // For now, we just use the data URL - in production, upload to storage and use the URL
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        {label}
      </Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
              {fallback.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={clearAvatar}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Input options */}
        <div className="flex-1">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "url" | "upload")}>
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="url" className="text-xs">
                <Link className="h-3 w-3 mr-1" />
                URL
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-2">
              <Input
                type="url"
                value={preview}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
