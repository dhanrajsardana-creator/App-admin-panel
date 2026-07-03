import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { str } from "@/utils/json";
import type { JsonMap, SectionItem } from "@/types";

/** Image with a graceful placeholder when no src is present. */
export function PreviewImage({
  src,
  alt,
  className,
  style,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400",
          className
        )}
        style={style}
      >
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className={cn("object-cover", className)}
      style={style}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}

/** Best-effort image source for an item (background media value wins). */
export function itemImage(item: SectionItem): string | null {
  const meta = item.metadataJson;
  const bg = str(meta, "backgroundMediaValue");
  if (bg && /^https?:\/\//.test(bg)) return bg;
  return item.imageUrl ?? item.mobileImageUrl ?? null;
}

export function SectionHeading({
  title,
  subtitle,
  showViewAll,
  viewAllText,
  align = "left",
  titleColor,
}: {
  title?: string | null;
  subtitle?: string | null;
  showViewAll?: boolean;
  viewAllText?: string;
  align?: "left" | "center";
  titleColor?: string;
}) {
  if (!title && !subtitle && !showViewAll) return null;
  return (
    <div
      className={cn(
        "mb-2 flex items-end px-3",
        align === "center" ? "justify-center text-center" : "justify-between"
      )}
    >
      <div>
        {title && (
          <h3
            className="text-[15px] font-bold leading-tight"
            style={titleColor ? { color: titleColor } : undefined}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>
      {showViewAll && align === "left" && (
        <button className="shrink-0 text-xs font-medium text-zinc-500">
          {viewAllText || "View all"}
        </button>
      )}
    </div>
  );
}

/**
 * Product card matching the Figma "New Arrivals" design: image with a badge
 * pill + wishlist heart, title, price row (current / struck-through / discount)
 * and an optional highlighted member-price line.
 */
export function ProductCard({
  badge,
  image,
  title,
  config,
}: {
  badge?: string | null;
  image?: string | null;
  title?: string | null;
  config?: JsonMap;
}) {
  const radius = Number((config?.cardBorderRadius as number) ?? 8);
  const showPrice = config?.showPrice !== false;
  const showMember = config?.showMemberPrice !== false;
  const memberLabel =
    typeof config?.memberLabel === "string" ? config.memberLabel : "Member Price";

  return (
    <div className="w-full">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100"
        style={{ borderRadius: radius }}
      >
        <PreviewImage src={image} className="h-full w-full" />
        {badge && (
          <span className="absolute left-2 top-2 rounded-sm bg-[#4a3f2a]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}
        {config?.showWishlist !== false && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm bg-white/95 text-[12px] text-zinc-700 shadow-sm">
            ♡
          </span>
        )}
      </div>
      {showPrice && (
        <div className="mt-1.5 space-y-1 px-0.5">
          <p className="line-clamp-1 text-[11px] text-zinc-700">
            {title || "Powerlook Oversize T Shirt"}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-zinc-900">₹2,500</span>
            <span className="text-[10px] text-zinc-400 line-through">₹3,200</span>
            {config?.showDiscountBadge !== false && (
              <span className="text-[10px] font-semibold text-orange-500">20% Off</span>
            )}
          </div>
          {showMember && (
            <span className="inline-block rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              {memberLabel} : ₹690
            </span>
          )}
        </div>
      )}
    </div>
  );
}
