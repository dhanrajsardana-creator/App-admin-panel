import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useItems } from "@/hooks/useItems";
import { getSectionRenderer } from "./sections/registry";
import { sectionLabel } from "@/config/sectionCatalog";
import type { Section, SectionItem } from "@/types";

interface SectionBlockProps {
  section: Section;
  /** When provided (mobile preview), items are read directly; else fetched. */
  embeddedItems?: SectionItem[];
  selected: boolean;
  selectable: boolean;
  onSelect?: () => void;
}

export function SectionBlock({
  section,
  embeddedItems,
  selected,
  selectable,
  onSelect,
}: SectionBlockProps) {
  // Only fetch items for draft rendering (no embedded items supplied).
  const { data: fetched } = useItems(
    embeddedItems ? null : selectable ? section.id : null
  );
  const items = embeddedItems ?? fetched ?? [];

  const Renderer = getSectionRenderer(section.sectionType);

  // Hidden sections show an Appbrew-style placeholder instead of content.
  if (section.isVisible === false) {
    return (
      <div
        id={`section-${section.id}`}
        onClick={selectable ? onSelect : undefined}
        className={cn(
          "relative cursor-pointer",
          selected && "outline outline-2 outline-primary"
        )}
      >
        <div className="flex items-center justify-center gap-1.5 bg-zinc-100 py-6 text-xs font-medium text-zinc-500">
          <EyeOff className="h-3.5 w-3.5" />
          Hidden block · {section.title || sectionLabel(section.sectionType)}
        </div>
      </div>
    );
  }

  const isDark = section.configJson?.theme === "dark" || !!section.configJson?.isDark;

  return (
    <div
      id={`section-${section.id}`}
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "relative transition-colors duration-200",
        selectable && "cursor-pointer",
        isDark ? "bg-[#121212] text-white" : "bg-white text-zinc-900",
        selected &&
          "outline outline-2 -outline-offset-2 outline-primary"
      )}
    >
      {selected && (
        <span className="absolute left-2 top-2 z-10 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary-foreground">
          {sectionLabel(section.sectionType)}
        </span>
      )}
      <Renderer section={section} items={items} />
    </div>
  );
}
