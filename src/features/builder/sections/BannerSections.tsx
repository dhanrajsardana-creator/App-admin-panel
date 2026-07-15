import React, { useState, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { bool, num, str } from "@/utils/json";
import { PreviewImage, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";
import type { JsonMap } from "@/types";
import { useShopifyCollectionDetail } from "@/hooks/useShopify";

function textPositionClasses(pos: string) {
  switch (pos) {
    case "top":
      return "items-start";
    case "center":
      return "items-center";
    default:
      return "items-end";
  }
}

function OverlayContent({
  title,
  subtitle,
  config,
  meta,
}: {
  title?: string | null;
  subtitle?: string | null;
  config: JsonMap;
  meta: JsonMap;
}) {
  const textColor = str(meta, "textColor") || str(config, "textColor") || "#ffffff";
  const pos = str(meta, "textPosition") || str(config, "textPosition") || "bottom";
  const buttonText = str(meta, "buttonText") || str(config, "buttonText");
  const buttonColor =
    str(meta, "buttonColor") || str(config, "buttonColor") || "#ffffff";
  const buttonTextColor =
    str(meta, "buttonTextColor") || str(config, "buttonTextColor") || "#000000";
  const overlayingTexts = Array.isArray(meta.overlayingTexts)
    ? (meta.overlayingTexts as unknown[]).map(String)
    : [];

  const fadeInStyle = (delay: number) => ({
    animation: "fade-in-up 0.75s ease-out forwards",
    animationDelay: `${delay}s`,
  });

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end p-4",
        textPositionClasses(pos)
      )}
      style={fadeInStyle(0.05)}
    >
      <div className={cn(pos === "center" && "text-center")}> 
        {title && (
          <h2
            className="text-xl font-extrabold uppercase leading-tight tracking-tight drop-shadow"
            style={{ color: textColor, ...fadeInStyle(0.15) }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            className="mt-1 text-xs font-medium uppercase tracking-wide drop-shadow"
            style={{ color: textColor, ...fadeInStyle(0.3) }}
          >
            {subtitle}
          </p>
        )}
        {overlayingTexts.map((t, i) => (
          <p
            key={i}
            className="text-xs drop-shadow"
            style={{
              color: textColor,
              ...fadeInStyle(0.35 + i * 0.08),
            }}
          >
            {t}
          </p>
        ))}
        {buttonText && (
          <button
            className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
              ...fadeInStyle(0.45),
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

/** BANNER / featured_collection_products / new_drop_products — overlay hero. */
export function BannerSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const first = items[0];
  const meta = (first?.metadataJson ?? {}) as JsonMap;
  const overlayOpacity = num(meta, "overlayOpacity", num(config, "overlayOpacity", 0.3));
  const bgValue =
    str(config, "backgroundMediaValue") || str(meta, "backgroundMediaValue");
  const image = bgValue || itemImage(first ?? ({} as never)) || null;

  if (section.sectionKey === "STYLE_SPOTLIGHT") {
    const title = section.title || "STRAIGHT OUTTA HOOD";
    const subtitle = section.subtitle || "new drops";
    const buttonText = str(config, "viewAllButtonText") || "VIEW ALL";
    const ratioStr = config.aspectRatio;
    let aspectRatio = 0.75;
    if (ratioStr && typeof ratioStr === "string" && ratioStr.includes(":")) {
      const [w, h] = ratioStr.split(":").map(Number);
      if (w && h) aspectRatio = w / h;
    } else if (ratioStr && typeof ratioStr === "string" && ratioStr.includes("/")) {
      const [w, h] = ratioStr.split("/").map(Number);
      if (w && h) aspectRatio = w / h;
    }

    return (
      <div className="bg-white pt-6 pb-6">
        {/* Header */}
        <div className="mb-4 px-4 text-center">
          <h3
            className="text-[26px] uppercase tracking-[0.06em] text-zinc-900 font-extrabold"
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed max-w-[290px] mx-auto uppercase tracking-wide font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="relative w-full overflow-hidden bg-zinc-200 cursor-pointer"
          style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
        >
          {image && (
            <img
              src={image}
              alt={title || "spotlight"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        {bool(config, "isViewAllButtonEnabled", true) && (
          <div className="mt-4 border-y border-zinc-200/60 py-3.5 flex justify-center">
            <button
              className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-900"
              style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
            >
              {buttonText.toUpperCase()}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (section.sectionKey === "TRENDING_SHOWCASE") {
    const title = section.title || "";
    const subtitle = section.subtitle || "";
    const gridImageUrl = str(config, "backgroundMediaValue") || image;
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
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed max-w-[290px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Card Box */}
        <div className="mx-4 bg-white rounded-[24px] p-3 shadow-[0_6px_24px_rgba(0,0,0,0.06)] cursor-pointer">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-zinc-100">
            <img src={gridImageUrl} alt={title} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* View All Button */}
        {bool(config, "isViewAllButtonEnabled", true) && (
          <div className="mt-4 border-y border-zinc-200/60 py-3.5">
            <button className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-zinc-800 uppercase">
              {str(config, "viewAllButtonText") || "VIEW ALL"} →
            </button>
          </div>
        )}
      </div>
    );
  }

  if (section.sectionKey === "DEALS_SHOWCASE") {
    const title = section.title || "";

    // Find COLLECTION item
    const collectionItem = items.find(
      (item) => item.referenceType === "COLLECTION"
    );
    
    const activeCollectionId = collectionItem?.referenceId || null;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: collectionData } = useShopifyCollectionDetail(activeCollectionId);
    const productsToRender = collectionData?.products || [];

    const heroImageUrl =
      str(config, "backgroundMediaValue") ||
      collectionItem?.imageUrl;

    const ctaText = str(config, "buttonText") || (collectionItem?.metadataJson?.buttonText as string | undefined);
    const maxItems = num(config, "maxItems", 5);

    const dealItems = productsToRender.slice(0, maxItems).map((product: any) => {
      return {
        id: product.id,
        imageUrl: product.imageUrl,
        priceText: ctaText || `GET IT FOR ₹${product.price || "599"}`,
      };
    });

    // If no items are resolved yet in DB (e.g. template initial state), show mock items
    const displayItems = dealItems.slice(0, maxItems);

    return (
      <div className="bg-[#f2f4f5]">
        {/* Hero zone */}
        <div className="relative w-full overflow-hidden bg-[#e8f3f5]">
          {/* SVG decorative lines pattern */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full z-0" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="33%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="33%" y1="120" x2="33%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="5%" y1="20" x2="38%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="38%" y1="120" x2="38%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="100%" y1="20" x2="67%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="67%" y1="120" x2="67%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="95%" y1="20" x2="62%" y2="120" stroke="#BEDADF" strokeWidth="1.2" />
            <line x1="62%" y1="120" x2="62%" y2="100%" stroke="#BEDADF" strokeWidth="1.2" />
          </svg>

          {/* Podium */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 h-[50px] w-[260px] rounded-[100%] bg-white z-0 shadow-sm" />

          {/* Hero model/product image */}
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt="deals hero"
              className="relative z-10 w-full h-auto object-cover block mix-blend-darken"
            />
          ) : (
             <div className="relative z-10 w-full h-[300px] bg-zinc-200" />
          )}
        </div>

        {/* Rotating text / subtitle */}
        {section.subtitle && (
          <div className="flex justify-center py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              {section.subtitle}
            </span>
          </div>
        )}

        {/* Horizontal deal cards */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-6 pt-2">
          {displayItems.map((item) => (
            <div key={item.id} className="w-[140px] shrink-0 cursor-pointer bg-white">
              <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                <img src={item.imageUrl} alt={item.priceText} className="h-full w-full object-cover" />
              </div>
              <div className="py-2.5 flex justify-center items-center">
                <p
                  className="text-center text-[12px] uppercase leading-tight text-zinc-800 font-bold"
                  style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", letterSpacing: "0.05em" }}
                >
                  {item.priceText}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        {bool(config, "isViewAllButtonEnabled", true) && (
          <div className="flex justify-center py-4 border-t border-zinc-200/50">
            <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-800">
              {str(config, "viewAllButtonText") || "VIEW ALL"} →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
      <PreviewImage src={image} className="h-full w-full" />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      <OverlayContent
        title={first?.title || section.title}
        subtitle={section.subtitle}
        config={config}
        meta={meta}
      />
    </div>
  );
}

/** hero_carousel — full-bleed swipeable slides with cinematic intro animation. */
export function HeroCarouselSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};

  // ── Read canonical configJson keys (same keys the admin settings panel writes) ──
  const showBrandLogo = bool(config, "isBrandLogoEnabled", true);
  const showSearch    = bool(config, "isSearchBoxEnabled", true);
  const searchFixed   = str(config, "searchBoxFixedPlaceholder") || "Search for";

  // searchBoxRotationalPlaceholders is a string[]
  const rawRotational = config["searchBoxRotationalPlaceholders"];
  const rotationals: string[] = Array.isArray(rawRotational)
    ? rawRotational.map(String)
    : ["T-shirts", "Shirts", "Jackets"];

  // overlayingTexts[0] = first big line, [1] = second big line
  const rawOverlaying = config["overlayingTexts"];
  const overlayingTexts: string[] = Array.isArray(rawOverlaying)
    ? rawOverlaying.map(String)
    : [];
  const overlayLine1 = overlayingTexts[0] ?? "";
  const overlayLine2 = overlayingTexts[1] ?? "";

  const overlayingTitle  = str(config, "overlayingTitle");
  const viewAllText      = str(config, "viewAllButtonText") || "Shop Now";
  const showViewAll      = bool(config, "isViewAllButtonEnabled", true);

  const slides = items.length > 0 ? items : [null];

  // Rotate the search keyword every 2.5 s (mirrors mobile app behaviour)
  const [rotIdx, setRotIdx] = useState(0);
  useEffect(() => {
    if (rotationals.length <= 1) return;
    const t = setInterval(() => setRotIdx((i) => (i + 1) % rotationals.length), 2500);
    return () => clearInterval(t);
  }, [rotationals.length]);

  const currentKeyword = rotationals[rotIdx] ?? "";

  return (
    <div className="relative w-full">

      {/* ── Brand logo / name ── */}
      {showBrandLogo && (
        <div className="hero-intro-brand absolute inset-x-0 top-0 z-30 flex items-center justify-center px-4 pt-3">
          <span
            className="text-[10px] font-black tracking-[0.25em] text-white/90 drop-shadow-lg"
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            ▣ POWERLOOK
          </span>
        </div>
      )}

      {/* ── Search bar ── */}
      {showSearch && (
        <div
          className="hero-intro-search absolute inset-x-0 top-0 z-20 px-4"
          style={{ paddingTop: showBrandLogo ? "2.2rem" : "3rem" }}
        >
          <div className="flex items-center gap-2 border-b border-white/30 pb-2.5 text-white/90">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-[13px]">
              {searchFixed}{" "}
              <span
                key={rotIdx}
                className="font-semibold text-white"
                style={{ animation: "fade-in-up 0.35s ease-out forwards" }}
              >
                {currentKeyword}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── Slides ── */}
      <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {slides.map((item, i) => {
          const meta = (item?.metadataJson ?? {}) as JsonMap;

          // Background image: item-level first, then configJson.backgroundMediaValue
          const image =
            (item ? itemImage(item) : null) ||
            str(config, "backgroundMediaValue");

          const overlayOpacity = num(meta, "overlayOpacity", num(config, "overlayOpacity", 0.2));
          const textColor = str(meta, "textColor") || str(config, "textColor") || "#ffffff";

          // Per-slide overlay lines (from item) fall back to section-level configJson
          const line1 = item?.title   || str(meta, "overlayingTexts[0]") || overlayLine1;
          const line2 = item?.subtitle || str(meta, "overlayingTexts[1]") || overlayLine2;

          const revealStyle = (delay: number): React.CSSProperties => ({
            opacity: 0,
            animation: `hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
          });

          return (
            <div
              key={item?.id ?? i}
              className="relative shrink-0 snap-center overflow-hidden bg-zinc-800 w-full h-[740px]"
            >
              {/* Background image */}
              <div className="hero-intro-image h-full w-full">
                <PreviewImage src={image} className="h-full w-full object-top" />
              </div>

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

              {/* ── Overlay text block at bottom ── */}
              <div
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch"
                style={{ paddingBottom: "15%" }}
              >
                {/* Optional title above the lines (overlayingTitle) */}
                {overlayingTitle && (
                  <p
                    className="pb-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 drop-shadow"
                    style={revealStyle(1.1)}
                  >
                    {overlayingTitle}
                  </p>
                )}

                {/* Line 1 */}
                {line1 && (
                  <>
                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.25)", ...revealStyle(1.3) }}
                    />
                    <h2
                      className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                      style={{
                        color: textColor,
                        fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                        letterSpacing: "0.05em",
                        ...revealStyle(1.4),
                      }}
                    >
                      {line1}
                    </h2>
                  </>
                )}

                {/* Line 2 */}
                {line2 && (
                  <>
                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.25)", ...revealStyle(1.65) }}
                    />
                    <p
                      className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                      style={{
                        color: textColor,
                        fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                        letterSpacing: "0.05em",
                        ...revealStyle(1.8),
                      }}
                    >
                      {line2}
                    </p>
                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.25)", ...revealStyle(1.95) }}
                    />
                  </>
                )}

                {/* View-all button */}
                {showViewAll && (
                  <div className="mt-4 flex justify-center" style={revealStyle(2.1)}>
                    <button
                      className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/10 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm"
                    >
                      {viewAllText}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** video_banner — background video poster with overlay. */
export function VideoBannerSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const first = items[0];
  const meta = (first?.metadataJson ?? {}) as JsonMap;
  const videoUrl =
    first?.videoUrl ||
    str(config, "backgroundMediaValue") ||
    str(meta, "backgroundMediaValue");
  const poster = first ? itemImage(first) : null;
  const overlayOpacity = num(config, "overlayOpacity", 0.3);

  return (
    <div className="relative aspect-[9/16] max-h-[420px] w-full overflow-hidden bg-black">
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={poster ?? undefined}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <PreviewImage src={poster} className="h-full w-full" />
      )}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
      <div className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">
        ▶ Video
      </div>
      <OverlayContent
        title={first?.title || section.title}
        subtitle={section.subtitle}
        config={config}
        meta={meta}
      />
    </div>
  );
}

/** sale_banner — solid promo block with discount label and optional countdown. */
export function SaleBannerSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const bg = str(config, "backgroundColor") || "#111111";
  const textColor = str(config, "textColor") || "#ffffff";
  const discount = str(config, "discountLabel") || "SALE";
  const showButton = bool(config, "showButton", true);
  const buttonText = str(config, "buttonText") || "Shop now";
  const showCountdown = bool(config, "showCountdown");
  const bgImage = str(config, "backgroundImage");

  return (
    <div
      className="relative overflow-hidden px-5 py-8 text-center"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {bgImage && (
        <PreviewImage src={bgImage} className="absolute inset-0 h-full w-full opacity-40" />
      )}
      <div className="relative">
        {section.title && (
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">
            {section.title}
          </p>
        )}
        <p className="text-3xl font-extrabold uppercase">{discount}</p>
        {showCountdown && (
          <div className="mt-3 flex justify-center gap-2 text-sm font-bold">
            {["02", "18", "45", "30"].map((n, i) => (
              <span key={i} className="rounded bg-white/15 px-2 py-1">
                {n}
              </span>
            ))}
          </div>
        )}
        {showButton && (
          <button
            className="mt-4 rounded-full px-5 py-2 text-xs font-semibold"
            style={{
              backgroundColor: str(config, "buttonColor") || "#ffffff",
              color: str(config, "buttonTextColor") || "#000000",
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
