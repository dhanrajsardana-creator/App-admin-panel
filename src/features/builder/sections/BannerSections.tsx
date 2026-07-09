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
    const title = section.title || "";
    const buttonText = str(config, "buttonText") || "VIEW ALL";
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
      <div className="bg-white pt-0 pb-3">
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
        <div className="mt-3 flex justify-center">
          <button
            className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-900"
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            {buttonText.toUpperCase()}
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  if (section.sectionKey === "TRENDING_SHOWCASE") {
    const title = section.title || "DROP IT LIKE IT'S HOT";
    const subtitle = section.subtitle || "The hottest styles, picked from what you love, curated into fresh collections for your vibe.";
    const gridImageUrl = image || "/figma-home/07-banner-a.png";
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
        <div className="mt-4 border-y border-zinc-200/60 py-3.5">
          <button className="flex w-full items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-zinc-800 uppercase">
            VIEW ALL →
          </button>
        </div>
      </div>
    );
  }

  if (section.sectionKey === "DEALS_SHOWCASE") {
    const title = section.title || "IRRESISTIBLE DEALS";

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
      collectionItem?.imageUrl ||
      "/figma-home/12-irresistible-deals.png"; // fallback

    const ctaText = collectionItem?.metadataJson?.buttonText as string | undefined;

    const dealItems = productsToRender.map((product: any) => {
      return {
        id: product.id,
        imageUrl: product.imageUrl,
        priceText: ctaText || `GET IT FOR ₹${product.price || "599"}`,
      };
    });

    // If no items are resolved yet in DB (e.g. template initial state), show mock items
    const displayItems = dealItems.length > 0 ? dealItems : [
      { id: "mock-1", imageUrl: "/figma-home/07-banner-a.png", priceText: "GET IT FOR ₹599" },
      { id: "mock-2", imageUrl: "/figma-home/09-banner-b.png", priceText: "GET IT FOR ₹599" },
      { id: "mock-3", imageUrl: "/figma-home/10-category-banner-1.png", priceText: "GET IT FOR ₹599" },
    ];

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

          {/* Spotlight glow */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-white/30 blur-3xl z-0" />

          {/* Hero model/product image */}
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt="deals hero"
              className="relative z-10 w-full h-auto object-cover block"
            />
          ) : (
             <div className="relative z-10 w-full h-[300px] bg-zinc-200" />
          )}

          {/* Section title, render only if image doesn't naturally contain it */}
          {title && 
            !heroImageUrl?.toLowerCase().includes("irresistible") && 
            !heroImageUrl?.toLowerCase().includes("figma-home") && (
            <div className="absolute inset-x-0 top-8 flex justify-center px-4 z-20">
              <h3
                className="text-[28px] uppercase text-zinc-900 font-extrabold"
                style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", letterSpacing: "0.05em" }}
              >
                {title}
              </h3>
            </div>
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
        <div className="flex justify-center py-4 border-t border-zinc-200/50">
          <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-800">
            VIEW ALL →
          </button>
        </div>
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
  const showDots = bool(config, "showDots", true);
  const showSearch = bool(config, "showSearch", true);
  const searchPlaceholder = str(config, "searchPlaceholder") || "Search for T Shirt";
  const showBrandName = bool(config, "showBrandName", true);
  const brandName = str(config, "brandName") || "POWERLOOK";
  const slides = items.length > 0 ? items : [null];

  return (
    <div className="relative w-full">
      {/* Brand name — fades in from top */}
      {showBrandName && (
        <div
          className="hero-intro-brand absolute inset-x-0 top-0 z-30 flex items-center justify-center px-4 pt-3"
        >
          <span
            className="text-[10px] font-black tracking-[0.25em] text-white/90 drop-shadow-lg"
            style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif" }}
          >
            ▣ {brandName}
          </span>
        </div>
      )}

      {/* Search bar — slides down */}
      {showSearch && (
        <div
          className="hero-intro-search absolute inset-x-0 top-0 z-20 px-4"
          style={{ paddingTop: showBrandName ? "2.2rem" : "3rem" }}
        >
          <div className="flex items-center gap-2 border-b border-white/30 pb-2.5 text-white/90">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-[13px]">
              Search for{" "}
              <span className="font-semibold text-white">
                {searchPlaceholder.replace(/^Search for\s*/i, "")}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {slides.map((item, i) => {
          const meta = (item?.metadataJson ?? {}) as JsonMap;
          const image =
            (item ? itemImage(item) : null) ||
            str(config, "backgroundMediaValue") ||
            "/figma-home/01-hero.png";
          const overlayOpacity = num(meta, "overlayOpacity", num(config, "overlayOpacity", 0.2));

          // Overlay text from item → meta → config → section → default
          const overlayTitle = item?.title || str(meta, "overlayTitle") || str(config, "overlayTitle") || section.title || "BEYOND";
          const overlaySubtitle = item?.subtitle || str(meta, "overlaySubtitle") || str(config, "overlaySubtitle") || section.subtitle || "ORDINARY";
          const textColor = str(meta, "textColor") || str(config, "textColor") || "#ffffff";

          return (
            <div
              key={item?.id ?? i}
              className="relative shrink-0 snap-center overflow-hidden bg-zinc-800"
              style={{ width: "375px", height: "812px" }}
            >
              {/* Image with zoom-out animation */}
              <div className="hero-intro-image h-full w-full">
                <PreviewImage src={image} className="h-full w-full object-top" />
              </div>

              {/* Overlay darken */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity }}
              />

              {/* Overlay text — reveals with stagger, positioned at bottom with line dividers */}
              {(overlayTitle || overlaySubtitle) && (
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch"
                  style={{ paddingBottom: "15%" }}
                >
                  {overlayTitle && (
                    <>
                      <div
                        className="h-px w-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.25)",
                          opacity: 0,
                          animation: "hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards",
                        }}
                      />
                      <h2
                        className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                        style={{
                          color: textColor,
                          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                          letterSpacing: "0.05em",
                          opacity: 0,
                          animation: "hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.4s forwards",
                        }}
                      >
                        {overlayTitle}
                      </h2>
                    </>
                  )}
                  {overlaySubtitle && (
                    <>
                      <div
                        className="h-px w-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.25)",
                          opacity: 0,
                          animation: "hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.65s forwards",
                        }}
                      />
                      <p
                        className="py-3 text-center text-[32px] font-extrabold uppercase leading-none drop-shadow-lg"
                        style={{
                          color: textColor,
                          fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
                          letterSpacing: "0.05em",
                          opacity: 0,
                          animation: "hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards",
                        }}
                      >
                        {overlaySubtitle}
                      </p>
                      <div
                        className="h-px w-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.25)",
                          opacity: 0,
                          animation: "hero-text-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.95s forwards",
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDots && slides.length > 0 && (
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
