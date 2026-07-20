import React from "react";
import { bool, num, str } from "@/utils/json";
import { ProductCard, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";
import { useShopifyCollectionDetail, useShopifyProducts } from "@/hooks/useShopify";

/** Maps raw CMS item titles to clean display labels shown in the tab pills. */
function normaliseTabLabel(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower === "new arrivals") return "All";
  if (lower === "trending now") return "Trending";
  if (lower === "best sellers") return "Best Seller";
  if (lower === "jackets/view all") return "Jackets";
  if (lower === "new arrivals/t-shirts") return "T-Shirts";
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

  const showTabsConfig = bool(config, "showTabs", false);
  const defaultShowTabs = isNewArrivals && items.length > 0 && !hasProductItems;
  const showTabs = config.showTabs !== undefined ? showTabsConfig : defaultShowTabs;

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
    const activeLabel = normaliseTabLabel(activeItem?.resolved?.title || activeItem?.title || "");
    const isAllTab = showTabs && activeLabel === "All";

    if (isAllTab) {
      // Aggregate all products from all items except the first one (which acts as the "All" tab itself)
      const allResolvedProducts = items.slice(1).flatMap((it) => it.resolved?.products || []);
      if (allResolvedProducts.length > 0) {
        const seen = new Set();
        productsToRender = allResolvedProducts.filter((p) => {
          if (!p || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      } else {
        // In the builder, resolved data might be missing.
        // Since the 'All' collection itself is often empty, fallback to the global product list.
        isLoading = allProductsLoading;
        productsToRender = allProducts || [];
      }
    } else if (activeItem?.resolved?.products && activeItem.resolved.products.length > 0) {
      productsToRender = activeItem.resolved.products;
    } else {
      isLoading = collectionLoading;
      productsToRender = collectionData?.products || [];
    }

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
            const rawLabel = it.resolved?.title || it.title || "Collection";
            const label = normaliseTabLabel(rawLabel);
            return (
              <button
                key={it.id}
                onClick={() => setActiveTabState(idx)}
                className={`shrink-0 rounded-sm px-4 py-1.5 text-[11px] font-medium transition-all ${isActive
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
                image={p.imageUrl || p.featuredImage?.url}
                title={p.title}
                price={typeof p.price === 'string' ? p.price : p.price?.formatted}
                compareAtPrice={typeof p.compareAtPrice === 'string' ? p.compareAtPrice : p.compareAtPrice?.formatted}
                discountPercent={p.discountPercent}
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

      {bool(config, "isViewAllButtonEnabled", true) && (
        <div className="mt-5 flex justify-center border-t border-zinc-100 pt-3">
          <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-zinc-900 uppercase">
            {str(config, "viewAllButtonText", "View All")} →
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
        isViewAllButtonEnabled={bool(config, "isViewAllButtonEnabled", true)}
        viewAllButtonText={str(config, "viewAllButtonText", "View all")}
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
  const title = section.title || overlayingTexts[0] || "";
  const subtitle = section.subtitle || overlayingTexts[1] || "";
  const rawBadge = overlayingTexts[2] || "";

  let badgeText = "";
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
    firstItem?.imageUrl;

  const maxItems = num(config, "maxItems", 9);
  const columns = num(config, "columns", 3);
  const buttonText = str(config, "viewAllButtonText") || "View All";

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* White bottom gradient to blend image boundary into the white background below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50 via-zinc-50/50 to-transparent z-10" />

        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col justify-center z-20 pt-16">
          <div className="px-5">
            {title && (
              <h2
                className="text-[44px] font-bold uppercase leading-[1.05] text-white w-3/4"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {title.split(' ').map((word, i) => (
                  <span key={i} className="block">{word}</span>
                ))}
              </h2>
            )}
          </div>
          
          {(subtitle || rawBadge) && (
            <div className="mt-16 flex items-center justify-between border-y border-white/20 bg-black/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-[12px] font-medium tracking-[0.15em] text-white/90">
                {subtitle}
              </span>
              {rawBadge && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.1em] text-white/90">
                  {rawBadge.split(/(\d+)/).map((part, i) => {
                    if (/\d+/.test(part)) {
                      return (
                        <span key={i} className="bg-white px-2 py-0.5 font-bold text-black tracking-normal">
                          ₹{part}
                        </span>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              )}
            </div>
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
                src={p.featuredImage?.url || p.imageUrl}
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
      {bool(config, "isViewAllButtonEnabled", true) && (
        <div className="mt-5 flex justify-center px-4 bg-white">
          <button className="w-full border border-zinc-200/80 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 flex items-center justify-center gap-1.5 bg-zinc-50/50">
            {buttonText} <span className="text-[14px]">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** collection_with_products — category showcase with dark background, border overlays and dark cards. */
export function CategoryShowcaseSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const maxItems = num(config, "maxItems", num(config, "productLimit", 6));

  const firstItem = items[0] || null;
  const activeCollectionId = firstItem?.referenceType === "COLLECTION" ? firstItem.referenceId : null;

  // Resolve category name and product count
  const resolved = firstItem?.resolved as any;
  const resolvedProducts = (resolved?.products || []).filter((p: any) => p.inStock);
  const hasResolvedProducts = resolvedProducts.length > 0;

  // Query collection details
  const { data: collectionData, isLoading } = useShopifyCollectionDetail(hasResolvedProducts ? null : activeCollectionId);
  const productsToRender = hasResolvedProducts ? resolvedProducts : (collectionData?.products || []);

  const rawTitle = section.title || firstItem?.title || resolved?.title || "";
  const categoryName = rawTitle.split("/")[0] || "";

  let productCountText = "";
  if (resolved?.productCount != null) {
    productCountText = `${resolved.productCount} PRODUCTS`;
  }

  const isDark = bool(config, "isDarkModeEnabled", false);

  const bannerImageUrl =
    str(config, "backgroundMediaValue") ||
    (firstItem ? itemImage(firstItem) : null) ||
    firstItem?.imageUrl;

  return (
    <div className={isDark ? "bg-[#121212]" : "bg-white"}>
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
          <div className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t ${isDark ? "from-[#121212]" : "from-white"} to-transparent`} />

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
        <div className={`no-scrollbar flex gap-3 overflow-x-auto px-5 py-5 ${isDark ? "bg-[#121212]" : "bg-white"}`}>
          {productsToRender.slice(0, maxItems).map((p: any) => {
            const imageUrl = p.featuredImage?.url || p.imageUrl;
            const price = p.price?.formatted || p.price;
            const compareAtPrice = p.compareAtPrice?.formatted || p.compareAtPrice;
            const discountPercent = p.discountPercent;

            return (
              <div key={p.id} className="w-[150px] shrink-0">
                <ProductCard
                  badge="BEST SELLER"
                  image={imageUrl}
                  title={p.title}
                  price={price}
                  compareAtPrice={compareAtPrice}
                  discountPercent={discountPercent}
                  config={config}
                  dark={isDark}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW ALL button */}
      {bool(config, "isViewAllButtonEnabled", true) && (
        <div className={`border-y py-3.5 ${isDark ? "border-white/10 bg-[#121212]" : "border-black/10 bg-white"}`}>
          <button className={`flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase ${isDark ? "text-white" : "text-black"}`}>
            {str(config, "viewAllButtonText") || `VIEW ALL ${categoryName}`} →
          </button>
        </div>
      )}
    </div>
  );
}

