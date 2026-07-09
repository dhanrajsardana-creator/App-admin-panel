import React from "react";
import { bool, num, str } from "@/utils/json";
import { ProductCard, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";
import { useShopifyCollectionDetail, useShopifyProducts } from "@/hooks/useShopify";

/** Maps raw CMS item titles to clean display labels shown in the tab pills. */
function normaliseTabLabel(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower === "new arrivals")              return "All";
  if (lower === "trending now")              return "Trending";
  if (lower === "best sellers")              return "Best Seller";
  if (lower === "jackets/view all")         return "Jackets";
  if (lower === "new arrivals/t-shirts")    return "T-Shirts";
  return raw;
}

const DISPLAY_FONT = "'Bebas Neue', 'Oswald', sans-serif";

export function ProductShelfSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const maxItems = num(config, "maxItems", num(config, "productLimit", 6));
  const showTitle = bool(config, "showSectionTitle", true);

  const isNewArrivals =
    section.title?.toLowerCase() === "new arrivals" ||
    section.sectionKey?.toLowerCase().includes("new_arrivals") ||
    section.sectionKey?.toLowerCase().includes("newarrivals");

  const productItems = items.filter((it) => it.referenceType === "PRODUCT");
  const hasProductItems = productItems.length > 0;

  const showTabs = isNewArrivals && items.length > 0 && !hasProductItems;

  const [activeTabState, setActiveTabState] = React.useState(0);
  const activeTabIndex = showTabs ? activeTabState : 0;

  const activeItem = items[activeTabIndex] || null;
  const activeCollectionId = activeItem?.referenceType === "COLLECTION" ? activeItem.referenceId : null;

  // Query collection details or all products depending on item configurations
  const { data: collectionData, isLoading: collectionLoading } = useShopifyCollectionDetail(activeCollectionId);
  const { data: allProducts, isLoading: allProductsLoading } = useShopifyProducts();

  let productsToRender: any[] = [];
  let isLoading = false;

  if (hasProductItems) {
    isLoading = allProductsLoading;
    if (allProducts) {
      productsToRender = productItems
        .map((item) => allProducts.find((p) => String(p.id) === String(item.referenceId)))
        .filter(Boolean) as any[];
    }
  } else {
    isLoading = collectionLoading;
    productsToRender = collectionData?.products || [];
    // If no items at all, fallback to all catalog products
    if (items.length === 0 && allProducts) {
      productsToRender = allProducts;
    }
  }

  const hasProducts = productsToRender.length > 0;

  const badgeText = (section.title || activeItem?.title || "NEW ARRIVALS").toUpperCase();

  return (
    <div className="py-5 bg-white">
      {showTitle && (
        <h3
          className="mb-4 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {section.title || "NEW ARRIVALS"}
        </h3>
      )}

      {showTabs && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-3">
          {items.map((it, idx) => {
            const isActive = idx === activeTabIndex;
            const rawLabel = it.title || "Collection";
            const label = normaliseTabLabel(rawLabel);
            return (
              <button
                key={it.id}
                onClick={() => setActiveTabState(idx)}
                className={`shrink-0 rounded-sm px-4 py-1.5 text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-[#27272a] text-white"
                    : "bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-3">
        {isLoading && productsToRender.length === 0 ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="w-[160px] shrink-0 animate-pulse">
              <div className="aspect-[3/4] w-full rounded-sm bg-zinc-100" />
              <div className="mt-2 h-3 w-3/4 rounded bg-zinc-100" />
              <div className="mt-1 h-3 w-1/2 rounded bg-zinc-100" />
            </div>
          ))
        ) : hasProducts ? (
          productsToRender.slice(0, maxItems).map((p) => (
            <div key={p.id} className="w-[160px] shrink-0">
              <ProductCard
                badge={badgeText}
                image={p.imageUrl}
                title={p.title}
                price={p.price}
                config={config}
                dark={config.theme === "dark" || !!config.isDark}
              />
            </div>
          ))
        ) : (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[160px] shrink-0">
              <ProductCard
                badge="NEW"
                title="New Arrivals"
                config={config}
                dark={config.theme === "dark" || !!config.isDark}
              />
            </div>
          ))
        )}
      </div>

      {bool(config, "showViewAll", true) && (
        <div className="mt-5 flex justify-center border-t border-zinc-100 pt-3">
          <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-zinc-900 uppercase">
            {str(config, "viewAllText", "View All")} →
          </button>
        </div>
      )}
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

  const overlayingTexts = (section.configJson?.overlayingTexts as string[]) || [];
  const title = section.title || overlayingTexts[0] || "THE COLLECTIVES";
  const subtitle = section.subtitle || overlayingTexts[1] || "GET THE VIBE";
  const rawBadge = overlayingTexts[2] || "₹799";

  let badgeText = "₹799";
  if (rawBadge) {
    const match = rawBadge.match(/\d+/);
    badgeText = match ? `₹${match[0]}` : rawBadge;
  }

  const firstItem = items[0] || null;
  const activeCollectionId = firstItem?.referenceType === "COLLECTION" ? firstItem.referenceId : null;

  // Query collection details to fetch products of the collectives collection
  const { data: collectionData, isLoading } = useShopifyCollectionDetail(activeCollectionId);
  const productsToRender = collectionData?.products || [];

  const heroImageUrl =
    str(config, "backgroundMediaValue") ||
    (firstItem ? itemImage(firstItem) : null) ||
    firstItem?.imageUrl ||
    "/figma-home/13-z-collective.png"; // fallback

  const maxItems = num(config, "maxItems", 9);
  const columns = num(config, "columns", 3);
  const buttonText = str(config, "buttonText") || "View All";

  const displayProducts = productsToRender.slice(0, maxItems);

  return (
    <div className="bg-white pb-5">
      {/* Hero image with text overlay */}
      <div className="relative mx-0 aspect-[4/5] overflow-hidden bg-zinc-100">
        {heroImageUrl && (
          <img
            src={heroImageUrl}
            alt={title}
            className="h-full w-full object-cover object-top"
          />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

        {/* White bottom gradient to blend image boundary into the white background below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/40 to-transparent z-10" />

        {/* Overlay text */}
        <div className="absolute inset-x-4 bottom-8 flex flex-col gap-1 z-20">
          {subtitle && (
            <p
              className="text-[11px] uppercase tracking-[0.2em] text-white/70"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {subtitle}
            </p>
          )}
          {title && (
            <h2
              className="text-[28px] uppercase leading-tight text-white"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.05em" }}
            >
              {title}
            </h2>
          )}
          {badgeText && (
            <span className="mt-1 inline-block self-start rounded-sm bg-white px-2 py-0.5 text-[12px] font-bold text-zinc-900">
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Grid of collection products */}
      {isLoading && displayProducts.length === 0 ? (
        <div 
          className="mt-3 grid gap-1 px-1 bg-white"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns * 2 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] w-full animate-pulse bg-zinc-100" />
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div 
          className="mt-3 grid gap-1 px-1 bg-white"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {displayProducts.map((p) => (
            <div key={p.id} className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-zinc-100">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="mt-3 grid gap-1 px-1 bg-white"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns * 2 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] w-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400">
              No product
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="mt-5 flex justify-center px-4 bg-white">
        <button className="w-full border border-zinc-200/80 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 flex items-center justify-center gap-1.5 bg-zinc-50/50">
          {buttonText} <span className="text-[14px]">→</span>
        </button>
      </div>
    </div>
  );
}

/** collection_with_products — category showcase with dark background, border overlays and dark cards. */
export function CategoryShowcaseSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const maxItems = num(config, "maxItems", num(config, "productLimit", 6));

  const firstItem = items[0] || null;
  const activeCollectionId = firstItem?.referenceType === "COLLECTION" ? firstItem.referenceId : null;

  // Query collection details
  const { data: collectionData, isLoading } = useShopifyCollectionDetail(activeCollectionId);
  const productsToRender = collectionData?.products || [];

  // Resolve category name and product count
  const rawTitle = firstItem?.title || section.title || "Bottoms";
  const categoryName = rawTitle.split("/")[0] || "Bottoms";
  const productCountText = firstItem?.subtitle || `${collectionData?.productsCount || 1280} Products`;

  // Map fallback banner image based on title
  const bannerSlug = rawTitle.toLowerCase();
  let defaultBanner = "/figma-home/10-category-banner-1.png";
  if (bannerSlug.includes("shirt") && !bannerSlug.includes("t-shirt") && !bannerSlug.includes("tshirt")) {
    defaultBanner = "/figma-home/14-category-banner-2.png";
  } else if (bannerSlug.includes("polo")) {
    defaultBanner = "/figma-home/18-category-banner-3.png";
  } else if (bannerSlug.includes("denim")) {
    defaultBanner = "/figma-home/21-category-banner-4.png";
  } else if (bannerSlug.includes("bottom")) {
    defaultBanner = "/figma-home/24-category-banner-5.png";
  }

  const bannerImageUrl =
    str(config, "backgroundMediaValue") ||
    (firstItem ? itemImage(firstItem) : null) ||
    firstItem?.imageUrl ||
    defaultBanner;

  return (
    <div className="bg-[#121212]">
      {/* Category banner with overlay lines */}
      {bannerImageUrl && (
        <div className="relative aspect-[1/1.22] w-full overflow-hidden bg-zinc-900">
          <img
            src={bannerImageUrl}
            alt={categoryName}
            className="h-full w-full object-cover"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Bottom blend transition to background */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#121212] to-transparent" />

          {/* Centered overlay line-text-line block */}
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-stretch">
            {/* Top white line */}
            <div className="h-[0.5px] w-[90%] bg-white/30 mx-auto" />
            
            {/* Title & Product Count */}
            <div className="flex justify-between items-center px-6 py-2.5 w-[90%] mx-auto text-white">
              <span
                className="text-[17px] font-semibold uppercase tracking-[0.12em]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {categoryName}
              </span>
              <span 
                className="text-[12px] font-medium tracking-[0.06em] text-white/80"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {productCountText.toUpperCase()}
              </span>
            </div>

            {/* Bottom white line */}
            <div className="h-[0.5px] w-[90%] bg-white/30 mx-auto" />
          </div>
        </div>
      )}

      {/* Horizontal product cards */}
      {productsToRender.length > 0 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 py-5 bg-[#121212]">
          {productsToRender.slice(0, maxItems).map((p) => (
            <div key={p.id} className="w-[150px] shrink-0">
              <ProductCard
                badge="BEST SELLER"
                image={p.imageUrl}
                title={p.title}
                price={p.price}
                config={config}
                dark={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* VIEW ALL button */}
      <div className="border-y border-white/10 py-3.5 bg-[#121212]">
        <button className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-white uppercase">
          {str(config, "buttonText") || `VIEW ALL ${categoryName}`} →
        </button>
      </div>
    </div>
  );
}

