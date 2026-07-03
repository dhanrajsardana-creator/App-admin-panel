import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const safe = HEX.test(value) ? value : "#000000";
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border">
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -left-1 -top-1 h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
            aria-label={label}
          />
        </div>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
