import { Search, Mic, Camera, Truck, Clock, Heart } from "lucide-react";
import { bool, num, str } from "@/utils/json";
import type { SectionRendererProps } from "./types";

/** offer_strip — auto-scrolling marquee of short offer messages. */
export function OfferStripSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const bg = section.backgroundColor || "#000000";
  const textColor = str(config, "textColor", "#ffffff");
  const fontSize = num(config, "fontSize", 12);
  const divider = bool(config, "showDivider", true) ? str(config, "dividerChar", "|") : "";
  const messages = (items.length ? items : [null]).map(
    (it) => it?.title || "🎉 Special offer just for you"
  );
  // Duplicate the message list so the marquee can loop seamlessly.
  const loop = [...messages, ...messages];

  return (
    <div
      className="overflow-hidden"
      style={{ backgroundColor: bg, paddingBlock: num(config, "paddingVertical", 8) }}
    >
      <div
        className="flex w-max animate-marquee gap-6 whitespace-nowrap"
        style={{ ["--marquee-duration" as string]: "14s" }}
      >
        {loop.map((m, i) => (
          <span
            key={i}
            className="flex items-center gap-6 font-medium"
            style={{ color: textColor, fontSize }}
          >
            {m}
            {divider && <span className="opacity-60">{divider}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/** search_bar — search input with trending tags. */
export function SearchBarSection({ section, items }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const placeholder = str(config, "placeholder", "Search…");
  const radius = num(config, "borderRadius", 24);
  const bg = str(config, "backgroundColor", "#f3f4f6");
  const tags = items.map((it) => it.title).filter(Boolean) as string[];

  return (
    <div className="px-3 py-3">
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ backgroundColor: bg, borderRadius: radius }}
      >
        <Search className="h-4 w-4 text-zinc-400" />
        <span className="flex-1 text-xs text-zinc-400">{placeholder}</span>
        {bool(config, "showVoiceSearch", true) && <Mic className="h-4 w-4 text-zinc-400" />}
        {bool(config, "showCameraSearch", true) && (
          <Camera className="h-4 w-4 text-zinc-400" />
        )}
      </div>
      {bool(config, "showTrendingTags", true) && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-600"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** rich_text — formatted heading + body copy. */
export function RichTextSection({ section }: SectionRendererProps) {
  const config = section.configJson ?? {};
  const showTitle = bool(config, "showTitle", true);
  const html = str(config, "htmlContent", "");
  return (
    <div
      style={{
        paddingInline: num(config, "paddingH", 20),
        paddingBlock: num(config, "paddingV", 20),
        textAlign: (str(config, "textAlign", "left") as "left" | "center" | "right"),
      }}
    >
      {showTitle && section.title && (
        <h3
          className="mb-2 font-bold"
          style={{
            color: str(config, "titleColor", "#111111"),
            fontSize: num(config, "titleSize", 20),
          }}
        >
          {section.title}
        </h3>
      )}
      <div
        className="prose-sm"
        style={{
          color: str(config, "textColor", "#333333"),
          fontSize: num(config, "fontSize", 14),
          lineHeight: num(config, "lineHeight", 1.6),
        }}
        dangerouslySetInnerHTML={{ __html: html || "<p>Add your content…</p>" }}
      />
    </div>
  );
}

/** services_information — trust badges / service highlights row. */
export function ServicesSection({ section, items }: SectionRendererProps) {
  const firstItem = items[0];
  const overlayingTexts = firstItem?.metadataJson?.overlayingTexts as string[] | undefined;
  const backgroundImageUrl = firstItem?.metadataJson?.backgroundMediaValue as string | undefined;

  if (overlayingTexts && overlayingTexts.length > 0) {
    const title = firstItem?.title || section.title || "WHAT EXTRA DO WE OFFER";
    return (
      <div className="relative overflow-hidden aspect-square w-full bg-zinc-950 flex flex-col justify-between py-6 px-4 text-white">
        {/* Background Image with Dark Gradient Overlay */}
        {backgroundImageUrl && (
          <>
            <img
              src={backgroundImageUrl}
              alt="value props background"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" />
          </>
        )}

        {/* Section Header */}
        <div className="relative z-10 text-center mt-4">
          <h3 
            className="text-[17px] font-extrabold uppercase tracking-[0.1em] text-white"
            style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Bottom Offerings Card */}
        <div className="relative z-10 bg-[#0c0c0cf2] border border-white/5 py-5 px-1 rounded-[4px] grid grid-cols-3 divide-x divide-white/10 text-center">
          {overlayingTexts.map((text, i) => {
            const textLower = text.toLowerCase();
            let IconComponent = Heart;
            if (textLower.includes("shipping") || textLower.includes("delivery")) {
              IconComponent = Truck;
            } else if (textLower.includes("dispatch") || textLower.includes("24 hours") || textLower.includes("clock")) {
              IconComponent = Clock;
            }

            // Split label into Title / Subtitle segments
            let titlePart = text;
            let subtitlePart = "";
            if (textLower.includes("shipping")) {
              titlePart = "Free Shipping";
              subtitlePart = "n all orders";
            } else if (textLower.includes("dispatch")) {
              titlePart = "Order Dispatch";
              subtitlePart = "in 24 hours";
            } else if (textLower.includes("trusted")) {
              titlePart = "Trusted by 2M+";
              subtitlePart = "Happy Customers";
            }

            return (
              <div key={i} className="flex flex-col items-center justify-center px-1">
                <IconComponent className="h-5 w-5 text-white/90 mb-2 stroke-[1.25]" />
                <span className="text-[10px] font-semibold text-white/90 leading-tight">
                  {titlePart}
                </span>
                {subtitlePart && (
                  <span className="text-[8px] text-zinc-400 mt-1 leading-tight font-normal">
                    {subtitlePart}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback for simple, non-Figma configurations
  const services = items.length
    ? items
    : [null, null, null];
  return (
    <div className="px-3 py-4 bg-white">
      {section.title && (
        <h3 className="mb-3 text-center text-sm font-bold uppercase text-zinc-800">
          {section.title}
        </h3>
      )}
      <div className="grid grid-cols-3 gap-2 text-center">
        {services.map((it, i) => (
          <div key={it?.id ?? i} className="flex flex-col items-center gap-1.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-lg">
              {["🚚", "↩️", "🔒"][i % 3]}
            </span>
            <span className="text-[10px] font-medium text-zinc-600">
              {it?.title || ["Free Delivery", "Easy Returns", "Secure Pay"][i % 3]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
