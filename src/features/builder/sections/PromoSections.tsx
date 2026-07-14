import React from "react";
import { ArrowRight } from "lucide-react";
import { num, str, bool } from "@/utils/json";
import { PreviewImage, ProductCard, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";
import type { JsonMap } from "@/types";
import { useShopifyCollectionDetail, useShopifyProducts } from "@/hooks/useShopify";

/** Bebas Neue is loaded via index.html; condensed all-caps display face. */
const DISPLAY_FONT = "'Bebas Neue', 'Oswald', sans-serif";

interface PromoCard {
  label: string;
  image: string | null;
}

/** Built-in defaults so the section renders the source design out of the box. */
const DEFAULTS = {
  heading: "YOUR PERFECT SUMMER VIBE",
  subheading: "DEALS THAT'S HARD TO RESISTS",
  background: "/promo/summer-bg.png",
  cards: [
    { label: "Shop Topwear", image: "/promo/card-topwear.png" },
    { label: "Shop Bottomwear", image: "/promo/card-bottomwear.png" },
  ] as PromoCard[],
};

/** Resolve the card list from items, then config, then the built-in design. */
function resolveCards(
  items: SectionRendererProps["items"],
  config: JsonMap
): PromoCard[] {
  if (items.length > 0) {
    return items.map((item) => ({
      label: item.title ?? "",
      image: itemImage(item),
    }));
  }
  if (Array.isArray(config.cards) && config.cards.length > 0) {
    return (config.cards as JsonMap[]).map((c) => ({
      label: str(c, "label"),
      image: str(c, "image") || null,
    }));
  }
  return DEFAULTS.cards;
}

/**
 * promo_hero — full-bleed lifestyle image fading into a dark base, with a
 * condensed display heading, a solid sub-heading pill on a thin rule, and a
 * row of "shop the category" cards. Mirrors the "Perfect Summer Vibe" design.
 */
export function PromoHeroSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const first = items[0];

  const heading = str(config, "heading") || section.title || DEFAULTS.heading;
  const subheading =
    str(config, "subheadingText") || section.subtitle || DEFAULTS.subheading;
  const background =
    str(config, "backgroundMediaValue") ||
    str(config, "backgroundImage") ||
    (first ? itemImage(first) : null) ||
    DEFAULTS.background;
  const card1: PromoCard = {
    label: str(config, "card1Text") || (items[0]?.title) || "SHOP TOPWEAR",
    image: str(config, "card1Image") || (items[0] ? itemImage(items[0]) : null) || "/promo/card-topwear.png",
  };
  const card2: PromoCard = {
    label: str(config, "card2Text") || (items[1]?.title) || "SHOP BOTTOMWEAR",
    image: str(config, "card2Image") || (items[1] ? itemImage(items[1]) : null) || "/promo/card-bottomwear.png",
  };
  const cards = [card1, card2];

  return (
    <div className="relative w-full overflow-hidden bg-[#222423]">
      {/* Lifestyle backdrop occupies the upper portion of the frame. */}
      <div className="absolute inset-x-0 top-0 h-[62%]">
        <PreviewImage
          src={background}
          className="h-full w-full object-cover object-[center_25%]"
        />
      </div>
      {/* Gradient fade from the image into the solid base colour. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(34,36,35,0) 22%, rgba(34,36,35,0.77) 48%, rgb(34,36,35) 65%)",
        }}
      />

      {/* Foreground content, pushed below the image area. */}
      <div className="relative flex flex-col items-center gap-6 pb-4 pt-[200px]">
        {/* Heading + sub-heading pill */}
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full items-center justify-center px-4">
            <h2
              className="text-center text-[34px] uppercase leading-[1.18] text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {heading}
            </h2>
          </div>

          <div className="relative flex w-full items-center justify-center px-4">
            {/* Thin rule the pill sits on. */}
            <span className="absolute left-1/2 top-1/2 h-px w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 bg-white/30" />
            <div className="relative bg-white px-5 py-2">
              <span
                className="text-[16px] uppercase leading-[1.24] tracking-[0.16px] text-[#2e291d]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {subheading}
              </span>
            </div>
          </div>
        </div>

        {/* "Shop the category" cards */}
        <div className="flex w-full items-stretch gap-3 p-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="relative flex h-[141px] flex-1 flex-col items-start justify-end overflow-hidden px-2 pb-2"
            >
              <PreviewImage
                src={card.image}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(178deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.8) 98%)",
                }}
              />
              <span
                className="relative w-full text-[13px] uppercase leading-[1.3] text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * new_drop_products — light "NEW DROP" showcase: a big faded watermark behind a
 * center-aligned stacked card carousel with swipe animation and a shine gloss
 * effect on each card image. Driven by items (one card each) + config.
 */
export function NewDropSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const watermark = section.title || str(config, "watermarkText") || "NEW DROP";
  const buttonText = str(config, "buttonText") || "SHOP THE LOOK";

  const itemPriceLabel = str(config, "itemPriceLabel");

  const getPrice = (rawPrice: any, fallback: string = "₹599") => {
    const amount = rawPrice ? (typeof rawPrice === "object" ? rawPrice.formatted : rawPrice) : fallback;
    return itemPriceLabel ? `${itemPriceLabel} ${amount}` : amount;
  };

  const productItems = items.filter((it) => it.referenceType === "PRODUCT");
  const collectionItem = items.find((it) => it.referenceType === "COLLECTION");
  const activeCollectionId = collectionItem?.referenceId || null;

  const { data: collectionData } = useShopifyCollectionDetail(activeCollectionId);
  const { data: allProducts } = useShopifyProducts();

  const shopifyProducts = collectionData?.products || [];
  const limit = collectionItem ? num(collectionItem.metadataJson, "productLimit", 5) : 5;

  let cards: { image: string | null; price: string | null; handle?: string }[] = [];
  if (productItems.length > 0) {
    cards = productItems.map((item) => {
      const prod = allProducts?.find((p) => String(p.id) === String(item.referenceId));
      return {
        image: prod?.imageUrl || itemImage(item),
        price: getPrice((prod as any)?.price, item.subtitle || "₹599"),
        handle: prod?.handle,
      };
    });
  } else if (shopifyProducts.length > 0) {
    cards = shopifyProducts.slice(0, limit).map((p) => ({
      image: p.imageUrl,
      price: getPrice(p.price),
      handle: p.handle,
    }));
  } else if (allProducts && allProducts.length > 0) {
    cards = allProducts.slice(0, limit).map((p) => ({
      image: p.imageUrl,
      price: getPrice((p as any).price),
      handle: p.handle,
    }));
  } else if (items.length > 0) {
    cards = items.map((it) => ({
      image: itemImage(it),
      price: getPrice(it.subtitle),
    }));
  } else {
    cards = [
      { image: "/promo/new-drop-card.png", price: "₹599" },
      { image: "/promo/new-drop-card.png", price: "₹599" },
      { image: "/promo/new-drop-card.png", price: "₹599" },
    ];
  }

  const [active, setActive] = React.useState(0);
  const touchRef = React.useRef<{ x: number; y: number } | null>(null);

  const startDrag = (clientX: number) => {
    touchRef.current = { x: clientX, y: 0 };
  };

  const endDrag = (clientX: number) => {
    if (!touchRef.current) return;
    const dx = clientX - touchRef.current.x;
    if (Math.abs(dx) > 40) {
      setActive((prev) =>
        dx < 0
          ? (prev + 1) % cards.length
          : (prev - 1 + cards.length) % cards.length
      );
    }
    touchRef.current = null;
  };

  /** Compute stacked-card style for position relative to active */
  const getSlideStyle = (
    index: number
  ): React.CSSProperties => {
    const total = cards.length;
    let offset = index - active;
    // Wrap around
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOff = Math.abs(offset);

    if (offset === 0) {
      return {
        transform: "translateY(0) translateX(0) scale(1) rotate(0deg)",
        opacity: 1,
        zIndex: 20,
        position: "absolute" as const,
        left: "50%",
        marginLeft: "-125px",
      };
    }

    if (absOff <= 2) {
      // Tilt counter-clockwise if on the left, clockwise if on the right (2D Z-rotation)
      // Shifted downwards by 48px, outwards by 265px, scaled down to 0.7, and fully opaque
      return {
        transform: `translateY(${absOff * 48}px) translateX(${offset * 265}px) scale(${1 - 0.3 * absOff}) rotate(${offset * 17}deg)`,
        opacity: 1,
        zIndex: 20 - absOff,
        position: "absolute" as const,
        left: "50%",
        marginLeft: "-125px",
      };
    }
    return { opacity: 0, position: "absolute" as const, zIndex: 0, left: "50%", marginLeft: "-125px" };
  };

  return (
    <div className="relative overflow-hidden bg-[#f5f4f2] py-8">
      {/* Faded watermark text */}
      <span
        className="pointer-events-none absolute inset-x-0 top-3 text-center text-[84px] font-black uppercase leading-none text-black/[0.05]"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {watermark}
      </span>

      {/* Carousel container */}
      <div
        className="new-drop-carousel pt-2 select-none cursor-grab active:cursor-grabbing"
        style={{ minHeight: 430 }}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseUp={(e) => endDrag(e.clientX)}
        onMouseLeave={() => { touchRef.current = null; }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            className="new-drop-slide w-[250px] cursor-pointer"
            style={getSlideStyle(i)}
            onClick={() => setActive(i)}
          >
            {/* Card image and details inside a unified white frame */}
            <div className="flex flex-col bg-white p-2.5 rounded shadow-sm border border-zinc-100">
              <div className="new-drop-card-image aspect-[3/4] w-full overflow-hidden rounded bg-zinc-200">
                <PreviewImage src={c.image} className="h-full w-full object-cover" />
              </div>
              {/* Price + CTA row */}
              <div className="mt-2.5 flex items-center pt-2 text-[10px] font-semibold tracking-wide uppercase text-zinc-800">
                <span className="flex-1 text-center" style={{ fontFamily: DISPLAY_FONT }}>
                  {c.price}
                </span>
                <span className="h-4 w-px bg-zinc-200 shrink-0" />
                <span className="flex-1 flex items-center justify-center gap-1" style={{ fontFamily: DISPLAY_FONT }}>
                  {buttonText}
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="mt-4 flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active
                ? "w-5 bg-zinc-800"
                : "w-2 bg-zinc-300 hover:bg-zinc-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * exlusive_offers — "EXCLUSIVE OFFERS" heading over a dark card showing offer
 * lines (e.g. BUY 2 GET 15% OFF) between thin rules. Title, offers (items) and
 * the background image are all admin-editable.
 */
export function ExclusiveOffersSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const title = section.title || "EXCLUSIVE OFFERS";

  const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % items.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [items.length]);

  const hasItemImages = items.some((it) => itemImage(it));
  const activeItem = items.length > 0 ? items[currentFrameIndex] : null;

  const bg = hasItemImages
    ? (activeItem ? itemImage(activeItem) : null)
    : str(config, "backgroundImage") || str(config, "backgroundMediaValue") || null;

  let offers: string[] = [];
  if (hasItemImages && activeItem) {
    if (activeItem.title || activeItem.subtitle) {
      offers = [activeItem.title || "", activeItem.subtitle || ""].filter(Boolean);
    } else {
      offers = [];
    }
  } else {
    offers =
      items.length > 0
        ? items.map((it) => it.title || "").filter(Boolean)
        : ["BUY 2 GET 15% OFF", "BUY 3 GET 25% OFF"];
  }

  return (
    <div className="bg-white py-5">
      <h3
        className="mb-3 text-center text-[18px] uppercase tracking-[0.15em] text-zinc-900"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {title}
      </h3>
      <div className="relative mx-4 overflow-hidden rounded-md bg-zinc-900 aspect-video flex flex-col justify-center">
        {bg && (
          <PreviewImage
            key={currentFrameIndex}
            src={bg}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            offers.length === 0 ? "bg-black/5" : "bg-gradient-to-br from-zinc-800/40 to-black/60"
          }`}
        />
        {offers.length > 0 && (
          <div className="relative flex flex-col items-center gap-3 px-4 py-8">
            {offers.map((o, i) => (
              <div
                key={i}
                className="w-full max-w-[260px] border-y border-white/25 py-1.5 text-center text-[22px] uppercase leading-none text-white font-bold"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {o}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * mood_grid — "Popular Category" editorial grid: a heading over a multi-column
 * grid of full-height model photos, each with an uppercase label beneath.
 */
export function MoodGridSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const columns = Math.min(Math.max(num(config, "columns", 3), 2), 4);
  const heading = str(config, "title") || section.title || "ARE WE FEELING SMOOTH OR WILD?";
  const tiles =
    items.length > 0 ? items : Array.from({ length: columns * 3 }, () => null);

  return (
    <div className="bg-white py-5">
      <h3
        className="mb-4 px-4 text-center text-[16px] font-semibold uppercase tracking-wide text-zinc-900"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {heading}
      </h3>
      <div
        className="grid gap-x-2 gap-y-4 px-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
      >
        {tiles.map((it, i) => (
          <div key={it?.id ?? i} className="flex flex-col items-center gap-1.5">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-100">
              <PreviewImage src={it ? itemImage(it) : null} className="h-full w-full" />
            </div>
            <span className="text-center text-[10px] uppercase tracking-wide text-zinc-600">
              {it?.title || "Category"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * category_banner — full-bleed lifestyle image with a category name and an
 * optional product count overlaid at the bottom (e.g. "BOTTOMS · 1280 PRODUCTS").
 */
export function CategoryBannerSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const first = items[0];
  const image =
    str(config, "backgroundImage") ||
    str(config, "backgroundMediaValue") ||
    (first ? itemImage(first) : null) ||
    "/figma-home/10-category-banner-1.png";
  const name = section.title || first?.title || "BOTTOMS";
  const count = str(config, "productCount") || "1280 PRODUCTS";

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800">
      <PreviewImage src={image} className="h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
        <span
          className="text-[20px] uppercase leading-none text-white"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {name}
        </span>
        <span
          className="text-[12px] uppercase tracking-wide text-white/80"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}

/**
 * shop_the_look — a large lifestyle image with product hotspots, a "SHOP THE
 * LOOK" title, and a row of the featured products below. The look image comes
 * from config; the products come from items.
 */
export function ShopTheLookSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const lookImage =
    str(config, "backgroundImage") ||
    str(config, "backgroundMediaValue") ||
    (items[0] ? itemImage(items[0]) : null) ||
    "/promo/look-default.png";
  const heading = section.title || "SHOP THE LOOK";
  const products = items.length > 1 ? items.slice(1) : items;

  return (
    <div className="bg-white pb-5">
      {/* Hero look image with hotspots */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        <PreviewImage src={lookImage} className="h-full w-full" />
        <div className="absolute inset-0 bg-black/10" />
        <span
          className="absolute left-4 top-4 text-[22px] uppercase leading-none text-white drop-shadow"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {heading}
        </span>
        {/* Decorative product hotspots */}
        <span className="absolute left-[28%] top-[42%] h-3 w-3 rounded-full border-2 border-white bg-white/30" />
        <span className="absolute right-[26%] top-[64%] h-3 w-3 rounded-full border-2 border-white bg-white/30" />
      </div>

      {/* Featured products */}
      {products.length > 0 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-3">
          {products.map((it, i) => (
            <div key={it?.id ?? i} className="w-36 shrink-0">
              <ProductCard
                badge={it?.badgeText}
                image={itemImage(it)}
                title={it?.title}
                config={config}
                dark={config.theme === "dark" || !!config.isDark}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
