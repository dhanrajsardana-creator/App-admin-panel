import { Boxes } from "lucide-react";
import { sectionLabel } from "@/config/sectionCatalog";
import type { SectionRendererProps } from "./types";

/** Rendered for any sectionType without a dedicated renderer. */
export function FallbackSection({ section, items }: SectionRendererProps) {
  return (
    <div className="m-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center">
      <Boxes className="mx-auto h-6 w-6 text-zinc-400" />
      <p className="mt-2 text-sm font-medium text-zinc-700">
        {section.title || sectionLabel(section.sectionType)}
      </p>
      <p className="text-[11px] text-zinc-400">
        {section.sectionType} · {items.length} item{items.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
