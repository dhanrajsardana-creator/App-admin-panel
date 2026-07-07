/**
 * Web-equivalent widget renderers for the admin panel mobile preview.
 *
 * These components faithfully replicate the visual design of the mobile app's
 * React Native widgets using HTML/CSS (Tailwind). They consume UIWidget objects
 * produced by the bffAdapter — the same data structure the mobile app renders.
 */
import React, { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, Truck, Clock, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BannerWidget,
  ProductGridWidget,
  CollectionGridWidget,
  NewDropWidget,
  GifBannerWidget,
  StyleSpotlightWidget,
  EditorialLookbookWidget,
  FeaturedCollectionWidget,
  TrendsCollageWidget,
  IrresistibleDealsWidget,
  CategoryShowcaseWidget,
  ValuePropsWidget,
  TheRotationWidget,
  UIWidget,
  WidgetProductItem,
} from "@/types/widgets";

// ── Shared primitives ─────────────────────────────────────────────────────────

const DISPLAY_FONT = "'Bebas Neue', 'Oswald', sans-serif";

function Img({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (!src) {
    return <div className={cn("bg-zinc-200", className)} />;
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
    />
  );
}

function formatPrice(price?: number) {
  if (!price) return "";
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Product card — matches mobile app's product-card.tsx visual */
function ProductCard({
  item,
  width = 160,
  compact = false,
  theme = "light",
}: {
  item: WidgetProductItem;
  width?: number;
  compact?: boolean;
  theme?: "light" | "dark";
}) {
  return (
    <div className="shrink-0 cursor-pointer" style={{ width }}>
      <div className="relative overflow-hidden rounded-sm bg-zinc-100" style={{ aspectRatio: "3/4" }}>
        <Img src={item.imageUrl} alt={item.title} className="transition-transform duration-300 hover:scale-105" />
        {item.badge && (
          <span
            className="absolute left-2 top-2 rounded-sm bg-black px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white"
          >
            {item.badge}
          </span>
        )}
        {item.discountPercentage && (
          <span className="absolute right-2 top-2 rounded-sm bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            -{item.discountPercentage}%
          </span>
        )}
      </div>
      {!compact && (
        <div className="mt-1.5 px-0.5">
          {item.title && (
            <p className={`truncate text-[11px] font-medium leading-tight ${
              theme === "dark" ? "text-white/95" : "text-zinc-800"
            }`}>{item.title}</p>
          )}
          <div className="mt-0.5 flex items-center gap-1.5">
            {item.price ? (
              <span className={`text-[12px] font-semibold ${
                theme === "dark" ? "text-white" : "text-zinc-900"
              }`}>
                {formatPrice(item.price)}
              </span>
            ) : null}
            {item.originalPrice && item.originalPrice > (item.price ?? 0) && (
              <span className={`text-[10px] line-through ${
                theme === "dark" ? "text-zinc-500" : "text-zinc-400"
              }`}>
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>
          {item.memberPrice && (
            <p className={`mt-0.5 text-[9px] font-medium ${
              theme === "dark" ? "text-emerald-400" : "text-emerald-600"
            }`}>
              Member: {formatPrice(item.memberPrice)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── 1. Hero Banner ────────────────────────────────────────────────────────────

export function HeroBannerWidget({ widget }: { widget: BannerWidget }) {
  const { data } = widget;
  const { slides, searchBar, overlay } = data;
  const [activeSlide, setActiveSlide] = useState(0);
  const [keyword, setKeyword] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [slides]);

  useEffect(() => {
    if (!searchBar?.rotatingKeywords?.length) return;
    const interval = setInterval(
      () => setKeyword((prev) => (prev + 1) % searchBar.rotatingKeywords.length),
      searchBar.rotationInterval || 3000,
    );
    return () => clearInterval(interval);
  }, [searchBar]);

  const current = slides?.[activeSlide];

  return (
    <div className="relative w-full overflow-hidden bg-zinc-900" style={{ aspectRatio: "9/16", maxHeight: 680 }}>
      {/* Slide image */}
      {current?.imageUrl && (
        <img
          src={current.imageUrl}
          alt={current.title || "hero"}
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700"
          style={{ opacity: 1 }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* Brand name + search bar at top */}
      <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4">
        <div className="mb-3 flex justify-center">
          <span
            className="text-[10px] font-black tracking-[0.25em] text-white/90 drop-shadow-lg"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            ▣ POWERLOOK
          </span>
        </div>

        {searchBar && (
          <div className="flex items-center gap-2 border-b border-white/40 pb-2 text-white/90">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-[13px]">
              Search for{" "}
              <span className="font-semibold text-white transition-all">
                {searchBar.rotatingKeywords[keyword]}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Overlay text at bottom */}
      {(overlay?.title || overlay?.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch pb-[15%]">
          {overlay.title && (
            <>
              <div className="h-px w-full bg-white/25" />
              <h2
                className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                style={{ color: "#fff", fontFamily: DISPLAY_FONT, letterSpacing: "0.05em" }}
              >
                {overlay.title}
              </h2>
            </>
          )}
          {overlay.subtitle && (
            <>
              <div className="h-px w-full bg-white/25" />
              <p
                className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                style={{ color: "#fff", fontFamily: DISPLAY_FONT, letterSpacing: "0.05em" }}
              >
                {overlay.subtitle}
              </p>
              <div className="h-px w-full bg-white/25" />
            </>
          )}
        </div>
      )}

      {/* Pagination dots */}
      {slides && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeSlide ? "w-5 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. Product Grid ───────────────────────────────────────────────────────────

export function ProductGridWidget_({ widget }: { widget: ProductGridWidget }) {
  const { title, subtitle, data } = widget;
  const { products, filters, viewAllAction, cardWidth = 160 } = data;
  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.key ?? "all");

  const filtered =
    activeFilter === "all" || !filters
      ? products
      : products.filter((p: any) =>
          Array.isArray(p.filterKeys) ? p.filterKeys.includes(activeFilter) : true,
        );

  return (
    <div className="bg-white py-5">
      {/* Section heading */}
      {title && (
        <h3
          className="mb-1 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="mb-3 text-center text-[11px] text-zinc-500">{subtitle}</p>
      )}

      {/* Filter pills */}
      {filters && filters.length > 0 && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "shrink-0 rounded-sm px-4 py-1.5 text-[11px] font-medium transition-all",
                activeFilter === f.key
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-500",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal product scroll */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {filtered.slice(0, 10).map((p) => (
          <ProductCard key={p.id} item={p} width={cardWidth} />
        ))}
      </div>

      {/* View All */}
      {viewAllAction && (
        <div className="mt-5 flex justify-center border-t border-zinc-100 pt-3">
          <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 3. Collection Grid ────────────────────────────────────────────────────────

export function CollectionGridWidget_({ widget }: { widget: CollectionGridWidget }) {
  const { title, subtitle, data } = widget;
  const { items, columns = 3 } = data;

  return (
    <div className="bg-white py-5">
      {title && (
        <h3
          className="mb-1 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="mb-3 text-center text-[11px] text-zinc-500">{subtitle}</p>
      )}
      <div
        className="grid gap-2 px-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1.5 cursor-pointer">
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-zinc-100">
              <Img src={item.imageUrl} alt={item.title} />
            </div>
            <span className="text-center text-[10px] font-medium uppercase tracking-wide text-zinc-700">
              {item.title || item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. New Drop ───────────────────────────────────────────────────────────────

export function NewDropWidget_({ widget }: { widget: NewDropWidget }) {
  const { data } = widget;
  const { items, paginationStyle } = data;
  const [active, setActive] = useState(0);
  const dragRef = useRef<{ x: number } | null>(null);

  const startDrag = (clientX: number) => { dragRef.current = { x: clientX }; };
  const endDrag = (clientX: number) => {
    if (!dragRef.current) return;
    const dx = clientX - dragRef.current.x;
    if (Math.abs(dx) > 40) {
      setActive((prev) =>
        dx < 0 ? (prev + 1) % items.length : (prev - 1 + items.length) % items.length,
      );
    }
    dragRef.current = null;
  };

  const getSlideStyle = (index: number): React.CSSProperties => {
    const total = items.length;
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const absOff = Math.abs(offset);

    if (offset === 0) {
      return { transform: "translateY(0) translateX(0) scale(1) rotate(0deg)", opacity: 1, zIndex: 20, position: "absolute", left: "50%", marginLeft: "-105px" };
    }
    if (absOff <= 2) {
      return {
        transform: `translateY(${absOff * 48}px) translateX(${offset * 245}px) scale(${1 - 0.3 * absOff}) rotate(${offset * 17}deg)`,
        opacity: 1, zIndex: 20 - absOff, position: "absolute", left: "50%", marginLeft: "-105px",
      };
    }
    return { opacity: 0, position: "absolute", zIndex: 0, left: "50%", marginLeft: "-105px" };
  };

  const watermark = items[0]?.watermarkText || "NEW DROP";

  return (
    <div className="relative overflow-hidden bg-[#f5f4f2] py-8">
      <span
        className="pointer-events-none absolute inset-x-0 top-4 text-center text-[64px] uppercase leading-none text-black/[0.06] select-none"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {watermark}
      </span>

      <div
        className="relative select-none cursor-grab active:cursor-grabbing pt-10"
        style={{ minHeight: 360 }}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseUp={(e) => endDrag(e.clientX)}
        onMouseLeave={() => { dragRef.current = null; }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="w-[210px] cursor-pointer transition-all duration-300"
            style={getSlideStyle(i)}
            onClick={() => setActive(i)}
          >
            <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-200 shadow-lg">
              <Img src={item.imageUrl} alt={item.watermarkText} />
            </div>
            <div className="relative z-10 mx-2 -mt-5 flex items-stretch rounded-sm bg-white shadow-md">
              <span
                className="flex-1 px-2 py-2 text-center text-[12px] uppercase tracking-wide text-zinc-700"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {item.priceValue ? `${item.priceLabel || 'GET IT FOR'} ₹${item.priceValue}` : item.priceText}
              </span>
              <span className="my-1.5 w-px bg-zinc-200" />
              <span
                className="flex items-center gap-1 px-3 py-2 text-[12px] uppercase tracking-wide text-zinc-900"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {item.ctaText || "SHOP NOW"} <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === active ? "w-5 bg-zinc-800" : "w-2 bg-zinc-300",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── 5. GIF Banner ─────────────────────────────────────────────────────────────

export function GifBannerWidget_({ widget }: { widget: GifBannerWidget }) {
  const { title, data } = widget;
  const { gifUrl, aspectRatio = 0.85 } = data;

  return (
    <div className="bg-white py-5">
      {title && (
        <h3
          className="mb-3 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h3>
      )}
      <div
        className="relative mx-4 overflow-hidden rounded-sm bg-zinc-200 cursor-pointer"
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
      >
        {gifUrl && (
          <img
            src={gifUrl}
            alt={title || "banner"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

// ── 6. Style Spotlight ────────────────────────────────────────────────────────

export function StyleSpotlightWidget_({ widget }: { widget: StyleSpotlightWidget }) {
  const { title, subtitle, data } = widget;
  const { imageUrl, buttonText, aspectRatio = 0.75 } = data;

  return (
    <div className="bg-white py-5">
      {title && (
        <h3
          className="mb-1 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="mb-3 text-center text-[11px] text-zinc-500">{subtitle}</p>
      )}
      <div
        className="relative mx-4 overflow-hidden bg-zinc-200 cursor-pointer"
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title || "spotlight"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* CTA button overlay at bottom */}
        <div className="absolute inset-x-4 bottom-4 flex justify-center">
          <button
            className="rounded-sm bg-white px-6 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-900 shadow-md"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 7. Editorial Lookbook ─────────────────────────────────────────────────────

export function EditorialLookbookWidget_({ widget }: { widget: EditorialLookbookWidget }) {
  const { data } = widget;
  const { title, backgroundImageUrl, promoTag, blocks } = data;

  return (
    <div className="bg-white">
      {/* Full-bleed hero background */}
      <div className="relative overflow-hidden bg-zinc-900" style={{ aspectRatio: "4/5" }}>
        {backgroundImageUrl && (
          <img
            src={backgroundImageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

        {/* Title */}
        {title && (
          <div className="absolute inset-x-0 bottom-[35%] flex justify-center px-6">
            <h2
              className="text-center text-[28px] font-extrabold uppercase leading-tight text-white drop-shadow-lg"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.05em" }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* Promo tag */}
        {promoTag && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <span className="rounded-full border border-white/50 bg-white/20 px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {promoTag.text}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side promo blocks */}
      {blocks.length > 0 && (
        <div className="grid grid-cols-2 gap-1 p-1">
          {blocks.map((block, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-zinc-200"
            >
              {block.imageUrl && (
                <img
                  src={block.imageUrl}
                  alt={block.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {block.title && (
                <span
                  className="absolute inset-x-2 bottom-2 text-[13px] uppercase leading-tight text-white"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {block.title}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 8. Featured Collection ────────────────────────────────────────────────────

export function FeaturedCollectionWidget_({ widget }: { widget: FeaturedCollectionWidget }) {
  const { data } = widget;
  const { title, subtitle, badgeText, heroImageUrl, items } = data;

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

      {/* Grid of collection tiles */}
      {items && items.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-1 px-1 bg-white">
          {items.slice(0, 9).map((item) => (
            <div key={item.id} className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-zinc-100">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="mt-5 flex justify-center px-4 bg-white">
        <button className="w-full border border-zinc-200/80 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 flex items-center justify-center gap-1.5 bg-zinc-50/50">
          View All <span className="text-[14px]">→</span>
        </button>
      </div>
    </div>
  );
}

// ── 9. Trends Collage ─────────────────────────────────────────────────────────

export function TrendsCollageWidget_({ widget }: { widget: TrendsCollageWidget }) {
  const { title, subtitle, data } = widget;
  const { gridImageUrl } = data;

  const displayTitle = title || "DROP IT LIKE IT'S HOT";
  const displaySubtitle = subtitle || "The hottest styles, picked from what you love, curated into fresh collections for your vibe.";
  const imageUrl = gridImageUrl || "/figma-home/07-banner-a.png";

  return (
    <div
      className="py-6"
      style={{
        backgroundColor: "#f7f7f7",
        backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 6px, #f0f0f0 6px, #f0f0f0 12px)"
      }}
    >
      {/* Header */}
      <div className="mb-4 px-4 text-center">
        <h3
          className="text-[26px] uppercase tracking-[0.06em] text-zinc-900 font-extrabold"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {displayTitle}
        </h3>
        {displaySubtitle && (
          <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed max-w-[290px] mx-auto">
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* Card Box */}
      <div className="mx-4 bg-white rounded-[24px] p-3 shadow-[0_6px_24px_rgba(0,0,0,0.06)] cursor-pointer">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-zinc-100">
          <Img src={imageUrl} alt={displayTitle} />
        </div>
      </div>

      {/* View All Button */}
      <div className="mt-4 border-y border-zinc-200/60 py-3.5">
        <button className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-zinc-800 uppercase">
          VIEW ALL →
        </button>
      </div>
    </div>
  );
}

// ── 10. Irresistible Deals ────────────────────────────────────────────────────

export function IrresistibleDealsWidget_({ widget }: { widget: IrresistibleDealsWidget }) {
  const { title, data } = widget;
  const { heroImageUrl, items, viewAllAction, rotatingTexts, fullWidthHero } = data;
  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    if (!rotatingTexts?.length) return;
    const t = setInterval(() => setRotIdx((p) => (p + 1) % rotatingTexts.length), 1800);
    return () => clearInterval(t);
  }, [rotatingTexts]);

  return (
    <div className="bg-[#f0f6f7]">
      {/* Hero zone */}
      <div
        className="relative flex items-center justify-center overflow-hidden bg-[#e8f3f5]"
        style={{ minHeight: fullWidthHero ? undefined : 260, aspectRatio: fullWidthHero ? "1/1" : undefined }}
      >
        {/* SVG decorative lines pattern */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="33%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="33%" y1="120" x2="33%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="5%" y1="20" x2="38%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="38%" y1="120" x2="38%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="100%" y1="20" x2="67%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="67%" y1="120" x2="67%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="95%" y1="20" x2="62%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
          <line x1="62%" y1="120" x2="62%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
        </svg>

        {/* Spotlight glow */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-white/30 blur-3xl" />

        {/* Hero model/product image */}
        {heroImageUrl && (
          <img
            src={heroImageUrl}
            alt="deals hero"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Section title */}
        {title && (
          <div className="absolute inset-x-0 top-4 flex justify-center px-4 z-20">
            <h3
              className="text-[24px] uppercase text-zinc-800"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.1em" }}
            >
              {title}
            </h3>
          </div>
        )}
      </div>

      {/* Rotating text */}
      {rotatingTexts?.length > 0 && (
        <div className="flex justify-center py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 transition-all">
            {rotatingTexts[rotIdx]}
          </span>
        </div>
      )}

      {/* Horizontal deal cards */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-5 pt-1">
        {items.map((item) => (
          <div key={item.id} className="w-[140px] shrink-0 cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden rounded-sm bg-zinc-200 shadow">
              <Img src={item.imageUrl} alt={item.priceText} />
            </div>
            <p
              className="mt-1.5 text-center text-[11px] uppercase leading-tight text-zinc-700"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {item.priceText}
            </p>
          </div>
        ))}
      </div>

      {/* View All */}
      {viewAllAction && (
        <div className="flex justify-center border-t border-zinc-200 py-3">
          <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-800">
            VIEW ALL <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 11. Category Showcase ─────────────────────────────────────────────────────

export function CategoryShowcaseWidget_({ widget }: { widget: CategoryShowcaseWidget }) {
  const { data } = widget;
  const { categoryName, productCountText, bannerImageUrl, products, viewAllAction } = data;

  // Map fallback banner image based on title
  const bannerSlug = categoryName.toLowerCase();
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

  const imageUrl = bannerImageUrl || defaultBanner;

  return (
    <div className="bg-[#121212]">
      {/* Category banner with overlay lines */}
      {imageUrl && (
        <div className="relative aspect-[1/1.22] w-full overflow-hidden bg-zinc-900">
          <img
            src={imageUrl}
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
      {products.length > 0 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 py-5 bg-[#121212]">
          {products.map((p) => (
            <ProductCard key={p.id} item={p} width={150} theme="dark" />
          ))}
        </div>
      )}

      {/* VIEW ALL button */}
      {viewAllAction && (
        <div className="border-y border-white/10 py-3.5 bg-[#121212]">
          <button className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-white uppercase">
            VIEW ALL {categoryName.toUpperCase()} →
          </button>
        </div>
      )}
    </div>
  );
}

// ── 12. Value Props ───────────────────────────────────────────────────────────

const VALUE_PROP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  clock: Clock,
  heart: Heart,
};

export function ValuePropsWidget_({ widget }: { widget: ValuePropsWidget }) {
  const { data } = widget;
  const { title, items, backgroundImageUrl } = data;

  return (
    <div className="relative overflow-hidden bg-zinc-50 py-6">
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt="value props background"
          className="absolute inset-0 h-full w-full object-cover opacity-10"
        />
      )}
      <div className="relative px-4">
        {title && (
          <h3
            className="mb-4 text-center text-[14px] uppercase tracking-[0.15em] text-zinc-700"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {title}
          </h3>
        )}
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const Icon = VALUE_PROP_ICONS[item.iconName] || Heart;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-sm bg-white px-3 py-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <Icon className="h-4 w-4 text-zinc-700" />
                </div>
                <p className="text-[12px] font-medium text-zinc-700">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 13. The Rotation ──────────────────────────────────────────────────────────

export function TheRotationWidget_({ widget }: { widget: TheRotationWidget }) {
  const { data } = widget;
  const { title, subtitle, taglines, products, heroImageUrl, viewAllAction } = data;

  return (
    <div className="bg-zinc-900">
      {/* Hero section */}
      {heroImageUrl && (
        <div className="relative aspect-[9/10] w-full overflow-hidden">
          <img src={heroImageUrl} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/30 to-transparent" />

          <div className="absolute inset-x-4 bottom-8 flex flex-col items-center gap-2 text-center">
            {subtitle && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {subtitle}
              </p>
            )}
            {title && (
              <h2
                className="text-[36px] uppercase leading-none text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {title}
              </h2>
            )}
            {taglines.length > 0 && (
              <div className="flex items-center gap-2">
                {taglines.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="text-zinc-500">•</span>}
                    <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                      {tag}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {viewAllAction && (
              <button className="mt-2 flex items-center gap-2 rounded-sm bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-900">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Continue browsing products */}
      {products.length > 0 && (
        <div className="bg-zinc-800 py-4">
          <p className="mb-3 px-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Continue Browsing
          </p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
            {products.map((p) => (
              <div key={p.id} className="w-[120px] shrink-0 cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-zinc-700">
                  <Img src={p.imageUrl} alt={p.priceText} />
                </div>
                <p className="mt-1 text-center text-[10px] text-zinc-400">{p.priceText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fallback ──────────────────────────────────────────────────────────────────

export function FallbackWidget({ sectionKey }: { sectionKey?: string }) {
  return (
    <div className="flex items-center justify-center bg-zinc-50 py-6 text-center">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          Widget not previewed
        </p>
        {sectionKey && (
          <p className="mt-0.5 text-[9px] text-zinc-300">{sectionKey}</p>
        )}
      </div>
    </div>
  );
}

// ── Master widget renderer dispatcher ─────────────────────────────────────────

export function WidgetRenderer({ widget }: { widget: UIWidget }) {
  const bg = widget.styles?.backgroundColor;
  const pt = widget.styles?.paddingTop;
  const pb = widget.styles?.paddingBottom;

  const content = (() => {
    switch (widget.widgetType) {
      case "HERO_BANNER":
        return <HeroBannerWidget widget={widget as BannerWidget} />;
      case "PRODUCT_GRID":
        return <ProductGridWidget_ widget={widget as ProductGridWidget} />;
      case "COLLECTION_GRID":
      case "CATEGORY_LIST":
        return <CollectionGridWidget_ widget={widget as CollectionGridWidget} />;
      case "NEW_DROP":
        return <NewDropWidget_ widget={widget as NewDropWidget} />;
      case "GIF_BANNER":
        return <GifBannerWidget_ widget={widget as GifBannerWidget} />;
      case "STYLE_SPOTLIGHT":
        return <StyleSpotlightWidget_ widget={widget as StyleSpotlightWidget} />;
      case "EDITORIAL_LOOKBOOK":
        return <EditorialLookbookWidget_ widget={widget as EditorialLookbookWidget} />;
      case "FEATURED_COLLECTION":
        return <FeaturedCollectionWidget_ widget={widget as FeaturedCollectionWidget} />;
      case "TRENDS_COLLAGE":
        return <TrendsCollageWidget_ widget={widget as TrendsCollageWidget} />;
      case "IRRESISTIBLE_DEALS":
        return <IrresistibleDealsWidget_ widget={widget as IrresistibleDealsWidget} />;
      case "CATEGORY_SHOWCASE":
        return <CategoryShowcaseWidget_ widget={widget as CategoryShowcaseWidget} />;
      case "VALUE_PROPS":
        return <ValuePropsWidget_ widget={widget as ValuePropsWidget} />;
      case "THE_ROTATION":
        return <TheRotationWidget_ widget={widget as TheRotationWidget} />;
      default:
        return null;
    }
  })();

  if (!content) return null;

  return (
    <div
      style={{
        backgroundColor: bg || undefined,
        paddingTop: pt || undefined,
        paddingBottom: pb || undefined,
      }}
    >
      {content}
    </div>
  );
}
