import React, { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadMedia } from "@/hooks/useMedia";

interface ImageUploadInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUploadInput({ value, placeholder, onChange, className }: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMedia.mutate(file, {
      onSuccess: (res) => {
        let url = res.data.url;
        if (url && !url.startsWith("http")) {
          url = `https://${url}`;
        }
        onChange(url);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMedia.isPending}
        title="Upload Media"
      >
        {uploadMedia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      </Button>
    </div>
  );
}
