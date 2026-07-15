import React from "react";
import { bool, num, str } from "@/utils/json";
import { ProductCard, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";
import { useShopifyCollectionDetail, useShopifyProducts } from "@/hooks/useShopify";
import {
  ChevronRight,
  User,
  MapPin,
  Heart,
  History,
  Wallet,
  Phone,
  Truck,
  Shield,
  Box,
  RotateCcw,
  ArrowLeftRight,
} from "lucide-react";

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

  const rawTitle = section.title || firstItem?.title || resolved?.title || "Bottoms";
  const categoryName = rawTitle.split("/")[0] || "Bottoms";

  let productCountText = "";
  if (resolved?.productCount != null) {
    productCountText = `${resolved.productCount} Products`;
  } else if (firstItem?.subtitle) {
    productCountText = firstItem.subtitle;
  } else {
    productCountText = `${collectionData?.productsCount || 1280} Products`;
  }

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

  const isDark = bool(config, "isDarkModeEnabled", bool(config, "darkMode", false));

  const bannerImageUrl =
    str(config, "backgroundMediaValue") ||
    (firstItem ? itemImage(firstItem) : null) ||
    firstItem?.imageUrl ||
    defaultBanner;

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

export function CartProductSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const title = section.title || "";
  const overlayingTexts = (config.overlayingTexts as string[]) || [];
  const overlayingTitle = (config.overlayingTitle as string) || "";
  const backgroundMediaValue = (config.backgroundMediaValue as string) || "";

  const badge = overlayingTexts[0] || "";
  const productTitle = overlayingTexts[1] || "";
  const sizeText = overlayingTexts[2] || "Size : S";
  const qtyText = overlayingTexts[3] || "01";
  const originalPrice = overlayingTexts[4] || "";
  const finalPrice = overlayingTexts[6] || "";
  const discountText = overlayingTexts[7] || "";
  const wishlistText = overlayingTexts[8] || "MOVE TO WISHLIST";

  const savedAmt = originalPrice && finalPrice ? (Number(originalPrice) - Number(finalPrice)) : 299;
  const formattedSavedAmt = savedAmt > 0 ? `₹${savedAmt}` : "₹299";
  const titleBannerText = overlayingTitle 
    ? overlayingTitle.replace("{price}", formattedSavedAmt)
    : `Congratulations!! You have saved ${formattedSavedAmt} on your order`;

  return (
    <div className="flex flex-col bg-white w-full select-none">
      {/* 1. Green Saved Banner */}
      {overlayingTitle && (
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-4 py-2 text-[10px] font-semibold text-emerald-600 border-b border-emerald-500/10">
          <svg className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span>{titleBannerText}</span>
        </div>
      )}

      {/* 2. Shopping Bag Title Section */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-950 font-sans">
          {title ? title.toUpperCase() : "SHOPPING BAG (1)"}
        </h2>
      </div>

      {/* 3. Product Card Row */}
      <div className="flex gap-4 p-4 border-b">
        {/* Left: Product Image */}
        <div className="w-[110px] h-[150px] relative overflow-hidden rounded bg-zinc-100 shrink-0">
          {backgroundMediaValue ? (
            <img
              src={backgroundMediaValue}
              alt={productTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Top row: Badge and Trash Icon */}
            <div className="flex items-start justify-between gap-2">
              {badge && (
                <span className="rounded bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-zinc-600">
                  {badge}
                </span>
              )}
              <button className="text-zinc-400 hover:text-rose-500 ml-auto shrink-0 transition-colors">
                <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Product Title */}
            <h3 className="mt-1 text-[11px] font-bold text-zinc-800 uppercase tracking-wide truncate">
              {productTitle || "Product Title"}
            </h3>

            {/* Selects: Size & Quantity */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1 text-[10px] text-zinc-600 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors font-medium">
                <span>{sizeText}</span>
                <span className="text-[8px] text-zinc-400">▼</span>
              </div>

              <div className="flex items-center border border-zinc-200 rounded text-[10px] bg-zinc-50 font-medium">
                <button className="px-2 py-1 border-r hover:bg-zinc-100 transition-colors text-zinc-400">
                  －
                </button>
                <span className="px-2.5 text-zinc-700">{qtyText}</span>
                <button className="px-2 py-1 border-l hover:bg-zinc-100 transition-colors text-zinc-400">
                  ＋
                </button>
              </div>
            </div>
          </div>

          <div>
            {/* Price section */}
            <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs font-extrabold text-zinc-950">
                ₹{finalPrice || "799"}
              </span>
              {originalPrice && (
                <>
                  <span className="text-[10px] text-zinc-400 line-through">
                    ₹{originalPrice}
                  </span>
                  {discountText && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {discountText}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Member price tag */}
            <div className="mt-1.5 inline-block bg-emerald-500/10 rounded px-2 py-0.5 border border-emerald-500/20">
              <p className="text-[9px] font-bold text-emerald-700 leading-none">
                Member Price : ₹{finalPrice ? Math.round(Number(finalPrice) * 0.88) : "690"}
              </p>
            </div>

            {/* Action Link: Move to wishlist */}
            <div className="mt-3">
              <button className="text-[10px] font-bold tracking-wide uppercase text-zinc-500 underline decoration-zinc-400 underline-offset-4 hover:text-zinc-800 transition-colors">
                {wishlistText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartBannerSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const title = section.title || "BEST OFFER FOR YOU";
  const subtitle = section.subtitle || "";
  const couponCode = (config.couponCode as string) || "BOGO";
  const couponBenefit = (config.couponBenefit as string) || "Save ₹50";
  const viewMoreText = (config.viewMoreText as string) || "View More Details";
  const viewAllText = (config.viewAllText as string) || "VIEW ALL";
  const isViewAllEnabled = config.isViewAllEnabled !== false;
  const buttonText = (config.buttonText as string) || "Apply";

  return (
    <div className="flex flex-col bg-white border-y py-4 px-4 font-sans select-none w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-800 uppercase">
          {title}
        </h3>
        {isViewAllEnabled && (
          <button className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors uppercase bg-transparent border-0 cursor-pointer">
            <span>{viewAllText}</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/10">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 leading-tight">
            {subtitle || `${couponBenefit} with "${couponCode}"`}
          </p>
          <button className="mt-0.5 flex items-center gap-0.5 text-xs text-zinc-400 font-medium hover:text-zinc-650 transition-colors bg-transparent border-0 cursor-pointer">
            <span>{viewMoreText}</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button className="rounded border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all cursor-pointer">
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export function CartSummarySection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const title = section.title || "Order Summary";
  const subtotal = (config.subtotal as string) || "2,799";
  const discount = (config.discount as string) || "1,800";
  const shipping = (config.shipping as string) || "To Be Calculated at Checkout";
  const grandTotal = (config.grandTotal as string) || "999";

  const formatVal = (val: string) => {
    if (!val) return "₹0";
    if (val.startsWith("₹")) return val;
    return `₹${val}`;
  };

  return (
    <div className="flex flex-col bg-white py-4 px-4 font-sans select-none border-y w-full">
      {/* Title */}
      <h3 className="text-sm font-semibold tracking-wide text-zinc-800 uppercase mb-4">
        {title}
      </h3>

      {/* Breakdown rows */}
      <div className="space-y-3.5 text-xs text-zinc-500">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-800">{formatVal(subtotal)}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between text-emerald-600 font-medium">
          <span>Discount</span>
          <span>-{formatVal(discount)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="text-zinc-805 font-medium">{shipping}</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4 border-zinc-200" />

      {/* Grand Total */}
      <div className="flex items-center justify-between text-sm font-bold text-zinc-950">
        <span>Grand Total</span>
        <span>{formatVal(grandTotal)}</span>
      </div>
    </div>
  );
}

export function CartCheckoutSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const price = (config.price as string) || "999";
  const priceLabel = (config.priceLabel as string) || "Inc. of all taxes";
  const buttonText = (config.buttonText as string) || "CHECKOUT";

  const formatVal = (val: string) => {
    if (!val) return "₹0";
    if (val.startsWith("₹")) return val;
    return `₹${val}`;
  };

  return (
    <div className="sticky bottom-[53px] z-20 flex items-center justify-between bg-white py-3.5 px-5 border-t border-zinc-150 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] font-sans w-full select-none">
      <div className="flex flex-col">
        <span className="text-lg font-black text-zinc-900 tracking-tight leading-none">
          {formatVal(price)}
        </span>
        <span className="text-[10px] text-zinc-400 font-medium mt-1 leading-none">
          {priceLabel}
        </span>
      </div>

      <button className="bg-[#2B2620] hover:bg-zinc-800 text-white font-extrabold tracking-widest text-[11px] px-8 py-3.5 rounded-lg uppercase transition-all shadow-sm border-0 cursor-pointer">
        {buttonText}
      </button>
    </div>
  );
}

export function ProfileBannerSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const title = section.title || "POWERLOOK";
  const subtitle = (config.subtitle as string) || "WELCOME TO";
  const logoUrl = (config.logoUrl as string) || "";
  const backgroundMediaType = (config.backgroundMediaType as string) || "IMAGE";
  const backgroundMediaValue = (config.backgroundMediaValue as string) || "";

  const bgStyle = backgroundMediaType === "IMAGE" && backgroundMediaValue
    ? { backgroundImage: `url(${backgroundMediaValue})` }
    : { background: "radial-gradient(circle at center, #35231A 0%, #150E0A 100%)" };

  return (
    <div 
      style={bgStyle}
      className="relative flex flex-col items-center justify-center py-10 w-full aspect-[1.6] bg-cover bg-center overflow-hidden border-b border-zinc-900 select-none"
    >
      {!backgroundMediaValue && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
          <div className="w-[150px] h-[150px] rounded-full border border-white" />
          <div className="absolute w-[220px] h-[220px] rounded-full border border-white" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white" />
          <div className="absolute w-[380px] h-[380px] rounded-full border border-white" />
          <div className="absolute w-[460px] h-[460px] rounded-full border border-white" />
        </div>
      )}

      <div className="w-16 h-16 rounded-full bg-[#24231B] border border-zinc-700/50 flex items-center justify-center shadow-lg mb-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full" />
        ) : (
          <svg className="w-8 h-8 text-[#D5C29E]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="18" y="18" width="28" height="28" rx="2" />
            <path d="M28 28h8v8h-8z" />
            <path d="M28 36v8" />
          </svg>
        )}
      </div>

      <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0B49F] font-bold leading-none mb-1">
        {subtitle}
      </span>

      <span className="text-xl font-black uppercase tracking-widest text-[#EADCBF] leading-none">
        {title}
      </span>
    </div>
  );
}

function getProfileIcon(name?: string) {
  const norm = (name ?? "").toLowerCase().trim();
  if (norm.includes("profile") || norm.includes("user")) return <User className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("address") || norm.includes("store") || norm.includes("locator") || norm.includes("map")) return <MapPin className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("wishlist") || norm.includes("heart")) return <Heart className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("history") || norm.includes("order") || norm.includes("clock")) return <History className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("wallet") || norm.includes("card") || norm.includes("payment")) return <Wallet className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("support") || norm.includes("phone") || norm.includes("contact")) return <Phone className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("shipping") || norm.includes("truck") || norm.includes("delivery")) return <Truck className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("privacy") || norm.includes("shield") || norm.includes("policy")) return <Shield className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("track") || norm.includes("box") || norm.includes("package")) return <Box className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("refund") || norm.includes("rotate") || norm.includes("return")) return <RotateCcw className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  if (norm.includes("exchange") || norm.includes("repeat") || norm.includes("arrow")) return <ArrowLeftRight className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
  return <User className="h-[21px] w-[21px] text-zinc-600" strokeWidth={1.25} />;
}

export function ProfileListSection({ section, items = [] }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const subtitle = section.subtitle || "";
  const overlayingTexts = (config.overlayingTexts as string[]) || [];

  let renderItems = items;
  let moreItems: typeof items = [];

  if (overlayingTexts.length > 0) {
    const firstGroup = overlayingTexts.slice(0, 5);
    const secondGroup = overlayingTexts.slice(5);

    renderItems = firstGroup.map((text, idx) => ({
      id: `item_1_${idx}`,
      title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
      subtitle: text,
      itemType: "NAVIGATION_ITEM",
      referenceType: null,
      referenceId: null,
      redirectType: null,
      redirectValue: "",
      sortOrder: idx,
      isActive: true,
      metadataJson: null,
      createdAt: "",
      updatedAt: "",
    }));

    if (subtitle && secondGroup.length > 0) {
      moreItems = secondGroup.map((text, idx) => ({
        id: `item_2_${idx}`,
        title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
        subtitle: text,
        itemType: "NAVIGATION_ITEM",
        referenceType: null,
        referenceId: null,
        redirectType: null,
        redirectValue: "",
        sortOrder: idx,
        isActive: true,
        metadataJson: null,
        createdAt: "",
        updatedAt: "",
      }));
    } else if (secondGroup.length > 0) {
      renderItems = [...renderItems, ...secondGroup.map((text, idx) => ({
        id: `item_1_${idx + 5}`,
        title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
        subtitle: text,
        itemType: "NAVIGATION_ITEM",
        referenceType: null,
        referenceId: null,
        redirectType: null,
        redirectValue: "",
        sortOrder: idx + 5,
        isActive: true,
        metadataJson: null,
        createdAt: "",
        updatedAt: "",
      }))];
    }
  }

  return (
    <div className="w-full bg-white select-none font-sans">
      {/* Group 1 */}
      {section.title && (
        <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#A38D64] uppercase px-5 pt-6 pb-2.5">
          {section.title}
        </div>
      )}
      <div className="flex flex-col border-t border-zinc-100">
        {renderItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-4 px-5 border-b border-zinc-100 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4.5">
              <div className="flex items-center justify-center shrink-0">
                {getProfileIcon(item.subtitle || item.title)}
              </div>
              <span className="text-[13.5px] font-medium text-[#2E2E2E] tracking-tight">
                {item.title}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={2} />
          </div>
        ))}
      </div>

      {/* Group 2 */}
      {subtitle && moreItems.length > 0 && (
        <>
          <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#A38D64] uppercase px-5 pt-6 pb-2.5">
            {subtitle}
          </div>
          <div className="flex flex-col border-t border-zinc-100">
            {moreItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 px-5 border-b border-zinc-100 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4.5">
                  <div className="flex items-center justify-center shrink-0">
                    {getProfileIcon(item.subtitle || item.title)}
                  </div>
                  <span className="text-[13.5px] font-medium text-[#2E2E2E] tracking-tight">
                    {item.title}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={2} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

