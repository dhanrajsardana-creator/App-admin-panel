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
            value={str(config, field.key)}
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

    default:
      return null;
  }
}
