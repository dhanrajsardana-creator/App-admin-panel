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

interface FieldControlProps {
  field: FieldDef;
  config: JsonMap;
  onChange: (key: string, value: unknown) => void;
}

export function FieldControl({ field, config, onChange }: FieldControlProps) {
  switch (field.kind) {
    case "text":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Input
            value={str(config, field.key) || field.placeholder || ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <Label>{field.label}</Label>
          <Textarea
            value={str(config, field.key) || field.placeholder || ""}
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
