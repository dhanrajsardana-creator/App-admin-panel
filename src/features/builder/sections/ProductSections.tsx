import { bool, num, str } from "@/utils/json";
import { ProductCard, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";

/**
 * product_shelf / collection_with_products — horizontal shelf of product cards.
 * Items reference collections/products by id, so we render placeholder cards
 * up to the configured limit using each item's badge/image where available.
 */
export function ProductShelfSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const maxItems = num(config, "maxItems", num(config, "productLimit", 6));
  const showTitle = bool(config, "showSectionTitle", true);

  // Expand item references into the visual count the shelf would show.
  const perItem = items.length > 0 ? items : [null];
  const cards: { badge?: string | null; image?: string | null; title?: string | null }[] = [];
  perItem.forEach((it) => {
    const limit = it ? num(it.metadataJson, "productLimit", 0) : 0;
    const count = limit || Math.max(1, Math.ceil(maxItems / perItem.length));
    for (let i = 0; i < count && cards.length < Math.max(maxItems, 3); i++) {
      cards.push({
        badge: it?.badgeText,
        image: it ? itemImage(it) : null,
        title: it?.title,
      });
    }
  });

  return (
    <div className="py-3">
      {showTitle && (
        <SectionHeading
          title={section.title}
          subtitle={section.subtitle}
          showViewAll={bool(config, "showViewAll", true)}
          viewAllText={str(config, "viewAllText", "View all")}
        />
      )}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-3">
        {cards.map((c, i) => (
          <div key={i} className="w-36 shrink-0">
            <ProductCard
              badge={c.badge}
              image={c.image}
              title={c.title}
              config={config}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** collection_carousel — horizontally scrolling collection cards. */
export function CollectionCarouselSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const cards = items.length > 0 ? items : [null, null, null];
  return (
    <div className="py-3">
      <SectionHeading
        title={section.title}
        subtitle={section.subtitle}
        showViewAll={bool(config, "showViewAll", true)}
        viewAllText={str(config, "viewAllText", "View all")}
      />
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-3">
        {cards.map((it, i) => (
          <div key={it?.id ?? i} className="w-40 shrink-0">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
              <ProductCard image={it ? itemImage(it) : null} config={{ showPrice: false }} />
            </div>
            <p className="mt-1.5 truncate text-xs font-medium">
              {it?.title || "Collection"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** featured_collection_products — grid of feature tiles with overlay text. */
export function FeaturedCollectionSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const textColor = str(config, "textColor", "#ffffff");
  const tiles = items.length > 0 ? items : [null, null, null, null];
  return (
    <div className="py-3">
      <SectionHeading title={section.title} subtitle={section.subtitle} />
      <div className="grid grid-cols-3 gap-1 px-1">
        {tiles.map((it, i) => {
          const meta = it?.metadataJson ?? {};
          return (
            <div key={it?.id ?? i} className="relative aspect-[3/4] overflow-hidden bg-zinc-200">
              <ProductCard image={it ? itemImage(it) : null} config={{ showPrice: false, cardBorderRadius: 0, showWishlist: false }} />
              {str(meta, "buttonText") && (
                <span
                  className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{ color: textColor }}
                >
                  {str(meta, "buttonText")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
