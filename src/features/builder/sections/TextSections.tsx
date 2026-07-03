import { Search, Mic, Camera } from "lucide-react";
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
  const services = items.length
    ? items
    : [null, null, null];
  return (
    <div className="px-3 py-4">
      {section.title && (
        <h3 className="mb-3 text-center text-sm font-bold uppercase">
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
