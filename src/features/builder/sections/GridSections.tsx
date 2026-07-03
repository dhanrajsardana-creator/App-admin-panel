import { cn } from "@/lib/utils";
import { bool, num, str } from "@/utils/json";
import { PreviewImage, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";

/** category_grid — grid of category tiles with labels. */
export function CategoryGridSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const columns = Math.min(Math.max(num(config, "columns", 4), 2), 5);
  const gap = num(config, "gap", 8);
  const circle = str(config, "imageShape", "circle") === "circle";
  const showLabel = bool(config, "showLabel", true);
  const textAlign = str(config, "textAlign") || "left";
  const tiles =
    items.length > 0 ? items : Array.from({ length: columns * 2 }, () => null);

  return (
    <div className="py-3">
      {bool(config, "showSectionTitle", true) && (
        <SectionHeading
          title={section.title}
          align={textAlign as "left" | "center"}
          showViewAll={bool(config, "showViewAll")}
          viewAllText={str(config, "viewAllText", "View all")}
        />
      )}
      <div
        className="grid px-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
          gap,
        }}
      >
        {tiles.map((it, i) => (
          <div key={it?.id ?? i} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "relative w-full overflow-hidden bg-zinc-100",
                circle ? "aspect-square rounded-full" : "aspect-square rounded-lg"
              )}
            >
              <PreviewImage src={it ? itemImage(it) : null} className="h-full w-full" />
              {it?.badgeText && (
                <span className="absolute right-0 top-0 rounded-bl bg-rose-500 px-1 text-[8px] font-bold text-white">
                  {it.badgeText}
                </span>
              )}
            </div>
            {showLabel && (
              <span className="line-clamp-1 text-center text-[10px] font-medium text-zinc-700">
                {it?.title || "Category"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** lookbook_grid — editorial image grid with overlay labels. */
export function LookbookGridSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const columns = Math.min(Math.max(num(config, "columns", 2), 1), 3);
  const gap = num(config, "gap", 8);
  const showOverlay = bool(config, "showOverlay", true);
  const overlayOpacity = num(config, "overlayOpacity", 0.25);
  const showLabel = bool(config, "showLabel", true);
  const radius = num(config, "borderRadius", 12);
  const tiles = items.length > 0 ? items : [null, null, null, null];

  return (
    <div className="py-3">
      {bool(config, "showSectionTitle", true) && (
        <SectionHeading title={section.title} subtitle={section.subtitle} />
      )}
      <div
        className="grid px-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap }}
      >
        {tiles.map((it, i) => (
          <div
            key={it?.id ?? i}
            className="relative aspect-[3/4] overflow-hidden bg-zinc-200"
            style={{ borderRadius: radius }}
          >
            <PreviewImage src={it ? itemImage(it) : null} className="h-full w-full" />
            {showOverlay && (
              <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
            )}
            {showLabel && it?.title && (
              <span className="absolute bottom-2 left-2 text-sm font-bold uppercase text-white drop-shadow">
                {it.title}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
