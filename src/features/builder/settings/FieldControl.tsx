import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorField } from "@/components/common/ColorField";
import { bool, num, str } from "@/utils/json";
import type { JsonMap } from "@/types";
import type { FieldDef } from "./fieldTypes";

import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { SearchableInput } from "@/components/common/SearchableInput";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopify";

interface FieldControlProps {
  field: FieldDef;
  config: JsonMap;
  onChange: (key: string, value: unknown) => void;
}

export function FieldControl({ field, config, onChange }: FieldControlProps) {
  const { data: allProducts } = useShopifyProducts();
  const { data: allCollections } = useShopifyCollections();

  switch (field.kind) {
    case "text": {
      const isMedia = 
        field.key.toLowerCase().includes("image") || 
        field.key.toLowerCase().includes("media");

      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          {isMedia ? (
            <ImageUploadInput
              value={str(config, field.key) || ""}
              placeholder={field.placeholder}
              onChange={(val) => onChange(field.key, val)}
            />
          ) : (
            <Input
              value={str(config, field.key)}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
        </div>
      );
    }

    case "textarea":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Textarea
            value={str(config, field.key)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={num(config, field.key)}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
          />
        </div>
      );

    case "color":
      return (
        <ColorField
          label={field.label}
          value={str(config, field.key)}
          onChange={(hex) => onChange(field.key, hex)}
        />
      );

    case "switch":
      return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label className="cursor-pointer text-sm text-foreground">
            {field.label}
          </Label>
          <Switch
            checked={bool(config, field.key)}
            onCheckedChange={(v) => onChange(field.key, v)}
          />
        </div>
      );

    case "file":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                if (typeof result === "string") {
                  onChange(field.key, result);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Select
            value={str(config, field.key) || field.options[0]?.value}
            onValueChange={(v) => onChange(field.key, v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "tuple_text": {
      const raw = config[field.key];
      const arr = Array.isArray(raw) ? raw.map(String) : ["", ""];
      
      return (
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>{field.label1}</Label>
            <Input
              value={arr[0] || ""}
              placeholder={field.placeholder1}
              onChange={(e) => {
                const next = [...arr];
                next[0] = e.target.value;
                onChange(field.key, next);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{field.label2}</Label>
            <Input
              value={arr[1] || ""}
              placeholder={field.placeholder2}
              onChange={(e) => {
                const next = [...arr];
                next[1] = e.target.value;
                onChange(field.key, next);
              }}
            />
          </div>
        </div>
      );
    }

    case "tuple3_text": {
      const raw = config[field.key];
      const arr = Array.isArray(raw) ? raw.map(String) : ["", "", ""];
      
      return (
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>{field.label1}</Label>
            <Input
              value={arr[0] || ""}
              placeholder={field.placeholder1}
              onChange={(e) => {
                const next = [...arr];
                next[0] = e.target.value;
                onChange(field.key, next);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{field.label2}</Label>
            <Input
              value={arr[1] || ""}
              placeholder={field.placeholder2}
              onChange={(e) => {
                const next = [...arr];
                next[1] = e.target.value;
                onChange(field.key, next);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{field.label3}</Label>
            <Input
              value={arr[2] || ""}
              placeholder={field.placeholder3}
              onChange={(e) => {
                const next = [...arr];
                next[2] = e.target.value;
                onChange(field.key, next);
              }}
            />
          </div>
        </div>
      );
    }

    case "cart_product_labels": {
      const raw = config[field.key];
      const arr = Array.isArray(raw) ? raw.map(String) : [];
      while (arr.length < 9) {
        arr.push("");
      }

      const labels = [
        "Tag / Badge (e.g. SELLING FAST)",
        "Product Title",
        "Size Label (e.g. Size : S)",
        "Quantity Label (e.g. 01)",
        "Original Price (MRP)",
        "Quantity Value (e.g. 2)",
        "Discounted Price",
        "Discount Percentage (e.g. 64% off)",
        "Wishlist CTA Button Text",
      ];

      return (
        <div className="space-y-3 border rounded-lg p-3 bg-zinc-50/50">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
            {field.label}
          </span>
          <div className="grid gap-2.5">
            {labels.map((lbl, idx) => (
              <div key={idx} className="space-y-1">
                <Label className="text-[11px] font-medium text-zinc-500">{lbl}</Label>
                <Input
                  value={arr[idx] || ""}
                  onChange={(e) => {
                    const next = [...arr];
                    next[idx] = e.target.value;
                    onChange(field.key, next);
                  }}
                  className="bg-white h-8 text-xs font-normal"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "tags": {
      // Read current value as string[]
      const raw = config[field.key];
      const tags: string[] = Array.isArray(raw) ? raw.map(String) : [];
      return (
        <TagsField
          label={field.label}
          placeholder={field.placeholder}
          tags={tags}
          onChange={(next) => onChange(field.key, next)}
        />
      );
    }

    case "media_url":
      return (
        <div className="grid gap-3">
          {field.typeKey && (
            <div className="space-y-1.5">
              <Label>Media Type</Label>
              <Select
                value={str(config, field.typeKey) || "IMAGE"}
                onValueChange={(v) => onChange(field.typeKey!, v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">IMAGE</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>{field.label}</Label>
            <ImageUploadInput
              value={str(config, field.key) || ""}
              placeholder={field.placeholder || "https://..."}
              onChange={(v) => onChange(field.key, v)}
            />
          </div>
        </div>
      );

    case "redirect_value": {
      const redirectType = String(config[field.typeKey] || "NONE");
      if (redirectType === "PRODUCT" || redirectType === "COLLECTION") {
        return (
          <div className="space-y-1.5">
            <Label>{field.label}</Label>
            <SearchableInput
              value={str(config, field.key) || ""}
              placeholder={`Search ${redirectType.toLowerCase()} handle...`}
              options={
                redirectType === "PRODUCT"
                  ? (allProducts || []).map(p => ({ label: p.title, value: p.handle }))
                  : (allCollections || []).map(c => ({ label: c.title, value: c.handle }))
              }
              onChange={(val) => {
                onChange(field.key, val);
                // Also update the resource ID if we can find it
                if (redirectType === "PRODUCT") {
                  const p = allProducts?.find(p => p.handle === val);
                  if (p) onChange("viewAllRedirectId", p.id); // Or a generic way to handle ID
                } else if (redirectType === "COLLECTION") {
                  const c = allCollections?.find(c => c.handle === val);
                  if (c) onChange("viewAllRedirectId", c.id);
                }
              }}
            />
          </div>
        );
      }

      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Input
            value={str(config, field.key) || ""}
            placeholder={field.placeholder || "https://..."}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );
    }

    default:
      return null;
  }
}

// ── Inner component so we can use local state cleanly ─────────────────────────
interface TagsFieldProps {
  label: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagsField({ label, placeholder, tags, onChange }: TagsFieldProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {/* Pill display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {t}
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input */}
      <Input
        ref={inputRef}
        value={input}
        placeholder={placeholder ?? "Type and press Enter…"}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !input && tags.length) {
            remove(tags.length - 1);
          }
        }}
        onBlur={add}
      />
    </div>
  );
}
