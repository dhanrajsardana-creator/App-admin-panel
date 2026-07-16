import { cn } from "@/lib/utils";
import { bool, num, str } from "@/utils/json";
import { PreviewImage, SectionHeading, itemImage } from "./primitives";
import type { SectionRendererProps } from "./types";

/** category_grid — grid of category tiles with labels. */
export function CategoryGridSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const columns = Math.min(Math.max(num(config, "columns", 4), 2), 5);
  const gap = num(config, "gap", 8);
  const showLabel = bool(config, "showLabel", true);
  const tiles =
    items.length > 0 ? items : Array.from({ length: columns * 2 }, () => null);

  return (
    <div className="py-3">
      {bool(config, "showSectionTitle", true) && (
        <SectionHeading
          title={str(config, "title") || section.title}
          align="left"
          isViewAllButtonEnabled={false}
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
              className="relative w-full overflow-hidden bg-zinc-100 aspect-square rounded-lg"
            >
              <PreviewImage src={it ? itemImage(it) : null} className="h-full w-full" />

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

/** lookbook_grid — editorial image grid with overlay labels, redesigned to match Figma hero style. */
export function LookbookGridSection({ section, items }: SectionRendererProps) {
  if (section.sectionKey === 'THE_ROTATION') {
    return <TheRotationSection section={section} items={items} />;
  }

  const config = section.configJson ?? {};
  
  // Parse heading and subheading from overlayingTexts array
  const overlayTexts = Array.isArray(config.overlayingTexts) ? config.overlayingTexts : [];
  const heading = overlayTexts[0] || section.title || "YOUR PERFECT SUMMER VIBE";
  const subheading = overlayTexts[1] || section.subtitle || "DEALS THAT'S HARD TO RESISTS";
  const background = str(config, "backgroundMediaValue") || str(config, "backgroundImage") || "/promo/summer-bg.png";

  const DISPLAY_FONT = "'Bebas Neue', 'Oswald', sans-serif";

  // Parse cards from items
  const cards = items.slice(0, 2).map((item) => {
    const meta = item.metadataJson ?? {};
    const metaTexts = Array.isArray(meta.overlayingTexts) ? meta.overlayingTexts : [];
    return {
      label: metaTexts[0] || item.title || "SHOP",
      image: str(meta, "backgroundMediaValue") || itemImage(item) || "",
    };
  });

  // Ensure we have exactly 2 cards for the layout
  while (cards.length < 2) {
    cards.push({ label: "SHOP", image: "" });
  }

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
              {card.image && (
                <PreviewImage
                  src={card.image}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
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

function TheRotationSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const overlayingTexts = Array.isArray(config.overlayingTexts) ? config.overlayingTexts : [];
  
  const title = section.title || "THE ROTATION";
  const subtitle = (config.overlayingTitle as string) || section.subtitle || "POWERLOOK PRESENTS";
  const taglines = overlayingTexts.length > 0 ? overlayingTexts : ["EXPLOSIVE", "DRAMA", "STYLISH"];

  const heroImageUrl = (config.backgroundMediaValue as string) || section.backgroundImage || "";
  const products = items;

  const DISPLAY_FONT = "'Bebas Neue', 'Oswald', sans-serif";

  return (
    <div className="bg-zinc-900">
      {/* Hero section */}
      {heroImageUrl && (
        <div className="relative aspect-[9/10] w-full overflow-hidden">
          <PreviewImage src={heroImageUrl} className="h-full w-full object-cover" />
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
                  <span key={tag} className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                    {i > 0 && <span className="text-zinc-500">•</span>}
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <button className="mt-2 flex items-center gap-2 rounded-sm bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-900">
              View All <span className="text-[14px]">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Continue browsing products */}
      {products.length > 0 && (
        <div className="bg-zinc-900 pb-8 pt-4">
          <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-300">
            Continue Browsing
          </p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
            {products.map((p, i) => (
              <div key={p?.id ?? i} className="w-[150px] shrink-0 cursor-pointer bg-white">
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100 relative">
                  <PreviewImage src={itemImage(p)} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="py-3 flex justify-center items-center">
                  <p className="text-center text-[11px] uppercase leading-tight text-zinc-800 font-bold">
                    GET IT FOR ₹{(p as any)?.resolved?.price?.amount || '599'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
