import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import type { SectionRendererProps } from "./types";
import { str } from "@/utils/json";
import { PreviewImage } from "./primitives";
import { useShopifyCollectionDetail, useShopifyProducts } from "@/hooks/useShopify";

/**
 * 1. SEARCH_BOX (INPUT_FIELD)
 * Rotates placeholders with the fixed part non-bold and the rotating part bold.
 */
export function SearchInputSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const fixed = str(config, "searchBoxFixedPlaceholder", "Search for");
  const placeholders = (config.searchBoxRotationalPlaceholders as string[]) || [
    "T-shirts",
    "Shirts",
    "Jackets",
    "Suit-Salwar",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!placeholders || placeholders.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);

  const activePlaceholder = placeholders[index] || "";

  return (
    <div className="px-4 py-3 bg-white">
      <div className="flex items-center gap-2 rounded-lg bg-[#f3f4f6] border border-zinc-200/50 px-3.5 py-2.5 text-[14px]">
        <Search className="h-4 w-4 text-zinc-450" />
        <div className="text-zinc-500">
          <span>{fixed} </span>
          <span className="font-bold text-zinc-800">{activePlaceholder}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. RECENTLY_SEARCHES (BADGES)
 * Displays chips using configJson.exampleData.
 */
export function RecentSearchesSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const exampleData = (config.exampleData as string[]) || [];

  if (exampleData.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-white">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-700 mb-3">
        {section.title || "RECENT SEARCHES"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {exampleData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center rounded border border-zinc-200 bg-white py-2.5 px-3 text-center text-xs text-zinc-655 font-medium shadow-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. HOME_SEARCH_TRENDING (CAROUSEL)
 * Displays products from items -> resolved -> products. Ignores review/count text.
 */
export function TrendingSection({ section, items }: SectionRendererProps) {
  const productsCarouselItem = items.find(
    (item) => item.itemType === "PRODUCTS_CAROUSEL"
  );

  const collectionId = productsCarouselItem?.referenceId || null;
  const { data: collectionData } = useShopifyCollectionDetail(collectionId);
  const { data: allProducts } = useShopifyProducts();

  let bffProducts =
    productsCarouselItem?.resolved?.products ||
    collectionData?.products ||
    [];

  if (bffProducts.length === 0 && allProducts) {
    bffProducts = allProducts;
  }

  return (
    <div className="px-4 py-3 bg-white">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-700 mb-3">
        {section.title || "TRENDING"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {bffProducts.map((prod: any) => {
          const title = prod.title || "";
          const imageUrl =
            prod.featuredImage?.url ||
            prod.images?.[0]?.url ||
            prod.imageUrl ||
            "";
          return (
            <div
              key={prod.id}
              className="w-[140px] shrink-0 border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="aspect-[3/4] w-full bg-zinc-50 overflow-hidden">
                <PreviewImage src={imageUrl} className="h-full w-full object-cover" />
              </div>
              <div className="p-2 border-t border-zinc-100 text-center">
                <p className="text-[11px] font-bold text-zinc-800 uppercase truncate">
                  {title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 4. HOME_SEARCH_SALE (CAROUSEL)
 * Displays promo banners using title and metadataJson backgroundMediaValue.
 */
export function SaleSection({ section, items }: SectionRendererProps) {
  const promoBanners = items.filter((item) => item.itemType === "PROMO_BANNER");

  return (
    <div className="px-4 py-3 bg-white">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-zinc-700 mb-3">
        {section.title || "SALE"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {promoBanners.map((banner) => {
          const title = banner.title || "";
          const bgImage = banner.metadataJson?.backgroundMediaValue || banner.imageUrl || "";
          return (
            <div
              key={banner.id}
              className="relative w-[280px] h-[140px] shrink-0 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center shadow-sm"
            >
              {bgImage && (
                <img
                  src={bgImage}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative z-10 p-4 text-center">
                <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                  {title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 5. SEARCH_HOME_CATEGORY_LIST (LIST)
 * Displays navigation items with trailing chevrons.
 */
export function ListSection({ section, items }: SectionRendererProps) {
  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="bg-white border-t border-zinc-100/50 mt-1">
      {sortedItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-b border-zinc-100 py-3.5 px-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
        >
          <span className="text-[12px] font-semibold text-zinc-550 uppercase tracking-wide">
            {item.title}
          </span>
          <ChevronRight className="h-4 w-4 text-zinc-400 stroke-[1.5]" />
        </div>
      ))}
    </div>
  );
}

/**
 * 6. Search Home Carousel Router
 * Delegates rendering to Trending or Sale section depending on section key/title.
 */
export function SearchHomeCarouselSection(props: SectionRendererProps) {
  const key = props.section.sectionKey?.toUpperCase() || "";
  const title = props.section.title?.toUpperCase() || "";

  if (key.includes("TRENDING") || title.includes("TRENDING")) {
    return <TrendingSection {...props} />;
  }

  if (key.includes("SALE") || title.includes("SALE")) {
    return <SaleSection {...props} />;
  }

  // Fallback to SaleSection as generic promo carousel
  return <SaleSection {...props} />;
}
