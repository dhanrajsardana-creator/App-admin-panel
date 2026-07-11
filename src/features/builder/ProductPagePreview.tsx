import { useMemo, useState } from "react";
import { ChevronLeft, Star, Truck, RotateCcw, ShieldCheck, ShoppingBag, Heart, Share2, Search, ChevronRight, Layers, Clock, CheckCircle2, Shirt, Undo2, Building2, Plus, StarHalf, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sectionLabel } from "@/config/sectionCatalog";
import { FullSpinner } from "@/components/common/Spinner";
import {
  useShopifyProducts,
  useStorefrontProduct,
  useStorefrontRecommendations,
} from "@/hooks/useShopify";
import { formatMoney, type StorefrontProduct } from "@/api/shopifyStorefront";
import type { StorefrontProductCard } from "@/api/shopifyStorefront";
import { useBuilderStore } from "@/store/builderStore";
import type { Section } from "@/types";
import { PreviewImage } from "./sections/primitives";
import { SectionBlock } from "./SectionBlock";

/** Heading reused across PDP section blocks. */
function PdpHeading({ section }: { section: Section }) {
  return (
    <h3 className="px-3 pb-2 pt-1 text-[22px] font-semibold uppercase tracking-wide text-zinc-800">
      {section.title || sectionLabel(section.sectionType)}
    </h3>
  );
}

/** A horizontal product rail for "Best Pair" / "Similar products". */
function ProductRail({ products }: { products: StorefrontProductCard[] }) {
  if (products.length === 0) {
    return (
      <p className="px-3 pb-3 text-xs text-zinc-400">
        No recommendations available for this product.
      </p>
    );
  }
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-3">
      {products.map((p) => (
        <div key={p.id} className="w-28 shrink-0">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100">
            <PreviewImage src={p.imageUrl} className="h-full w-full" />
          </div>
          <p className="mt-1 truncate text-[11px] text-zinc-700">{p.title}</p>
          {p.price && <p className="text-xs font-semibold">{p.price}</p>}
        </div>
      ))}
    </div>
  );
}

/**
 * Renders a single PDP section backed by live product data. Returns null for
 * section types we don't specially handle, so the caller can fall back to the
 * generic CMS renderer.
 */
function renderPdpContent(
  section: Section,
  product: StorefrontProduct,
  recommendations: StorefrontProductCard[]
): React.ReactNode | null {
  const t = section.sectionType.toLowerCase();

  // Key highlights → product attributes.
  if (t.includes("key") && t.includes("highlight")) {
    // For builder preview, mock the exact fields from the Figma mockup
    const mockHighlights = [
      { label: "Color", value: "Black" },
      { label: "Pattern", value: "Solid" },
      { label: "Brand Fabric", value: "Linen Blend" },
      { label: "Fit", value: "Regular" },
      { label: "Sleeve", value: "Full Sleeve" },
      { label: "Collar", value: "Cut Away" },
    ];
    return (
      <div className="relative py-4 px-4 bg-gradient-to-b from-[#1C100A] via-[#5C3B24] via-30% to-[#D9CCC1] to-90%">
        <h3 className="text-center text-white font-semibold text-[22px] uppercase tracking-wide mb-[20px]">
          KEY HIGHLIGHT
        </h3>
        <div className="bg-[#212121] rounded-none p-[12px] shadow-2xl">
          <div className="grid grid-cols-2 gap-x-[20px]">
            {mockHighlights.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  "flex flex-col gap-[4px] pb-[10px] border-b border-[#333333]",
                  i < mockHighlights.length - 2 && "mb-[10px]"
                )}
              >
                <span className="text-[#8B8B8B] text-[13px] font-normal">{r.label}</span>
                <span className="text-[#F5F5F5] text-[14px] font-normal">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Additional information (accordion)
  if (t.includes("additional")) {
    const infoRows = [
      {
        icon: Shirt,
        title: "PRODUCT DETAILS",
        subtitle: "Detail and Highlight",
      },
      {
        icon: Undo2,
        title: "RETURN AND REFUND POLICY",
        subtitle: "Know about our policy",
      },
      {
        icon: Building2,
        title: "MANUFACTURING DETAILS",
        subtitle: "Marketed and manufactured by",
      }
    ];

    return (
      <div className="py-6 px-4">
        <h3 className="font-semibold text-[#212121] text-[22px] uppercase mb-4">
          ADDITIONAL INFORMATION
        </h3>
        <div className="flex flex-col">
          {infoRows.map((row, i) => (
            <div
              key={row.title}
              className={cn(
                "flex items-center justify-between py-[18px]",
                i < infoRows.length - 1 && "border-b border-[#F4F4F4]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
                  <row.icon className="w-5 h-5 text-[#5C5C5C] stroke-[1.2]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-[#333333] tracking-wide">{row.title}</span>
                  <span className="text-[13px] text-[#8B8B8B]">{row.subtitle}</span>
                </div>
              </div>
              <Plus className="w-5 h-5 text-[#5C5C5C] stroke-[1.2]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Product description → rich HTML
  if (t.includes("description")) {
    return (
      <div>
        <PdpHeading section={section} />
        {product.descriptionHtml ? (
          <div
            className="px-3 pb-3 text-xs leading-relaxed text-zinc-600 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <p className="px-3 pb-3 text-xs text-zinc-400">
            No description for this product.
          </p>
        )}
      </div>
    );
  }

  // Rating & review
  if (t.includes("rating") || t.includes("review")) {
    const defaultImg = product.featuredImage?.url || "https://placehold.co/400";
    const reviews = [1, 2, 3];
    
    // Generate a list of diverse images from the product, falling back to defaultImg
    const reviewImages = product.images?.length > 0 
      ? [...product.images.map(i => i.url)] 
      : [defaultImg];
      
    while (reviewImages.length < 4) {
      reviewImages.push(reviewImages[0]);
    }

    return (
      <div className="py-6 px-4">
        <h3 className="font-semibold text-[#212121] text-[22px] uppercase mb-6">
          RATING AND REVIEW
        </h3>

        {/* Aggregate Rating */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[32px] font-medium text-[#212121] leading-none">4.0</span>
            <span className="text-[20px] text-[#A3A3A3]">/5</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(i => (
                <Star key={i} className="w-[18px] h-[18px] fill-[#212121] text-[#212121]" />
              ))}
              <StarHalf className="w-[18px] h-[18px] fill-[#212121] text-[#212121]" />
            </div>
            <span className="text-[14px] text-[#7A7A7A]">(200 Ratings)</span>
          </div>
        </div>

        {/* User uploaded images preview */}
        <div className="flex gap-2 w-full mb-8">
          {reviewImages.slice(0, 4).map((img, idx) => (
            <div key={idx} className="flex-1 aspect-square bg-[#F5F5F5] relative overflow-hidden">
              <img src={img} alt="review" className="w-full h-full object-cover" />
              {idx === 3 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-[#212121] text-[15px] font-medium">+ 20</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Review Card - swipe container */}
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4"
        >
          {reviews.map((_, i) => (
            <div key={i} className="w-full shrink-0 snap-center px-4">
              <div className="border border-[#F0F0F0] p-4 bg-white h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-medium text-[#333333]">Absolutely Stunning!</span>
                  <div className="bg-[#212121] rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span className="text-white text-[12px] font-medium">4.5</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#7A7A7A] leading-relaxed mb-1">
                  Lorem ipsum dolor sit amet consectetur. Maecenas ut urna consequat eget maecenas tellus gravida....
                </p>
                <button className="text-[13px] text-[#83735B] mb-4">Read more</button>

                <div className="flex gap-2 mb-4">
                  <div className="w-12 h-12 bg-[#F5F5F5] overflow-hidden">
                    <img src={reviewImages[0]} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-12 h-12 bg-[#F5F5F5] overflow-hidden">
                    <img src={reviewImages[1] || reviewImages[0]} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[13px] text-[#212121] font-medium">Manav Gupta</span>
                  <div className="w-[1px] h-3 bg-[#E5E5E5]"></div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-[14px] h-[14px] fill-[#45A84D] text-white" />
                    <span className="text-[12px] text-[#7A7A7A]">Verified Buyer</span>
                  </div>
                  <span className="text-[12px] text-[#A3A3A3] ml-auto">1 week ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-5 mb-5">
          <div className="w-3 h-1 bg-[#D9D9D9]"></div>
          <div className="w-8 h-1 bg-[#212121]"></div>
          <div className="w-3 h-1 bg-[#D9D9D9]"></div>
        </div>

        {/* View All Button */}
        <div className="border-t border-[#F0F0F0] pt-4 mt-2">
          <button className="w-full flex items-center justify-center gap-2 text-[#5C5C5C] text-[13px] font-medium tracking-wide uppercase">
            VIEW ALL <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    );
  }

  // Best pair it with / similar / recommended → recommendation rail.
  if (
    t.includes("similar") ||
    t.includes("pair") ||
    t.includes("recommend") ||
    t.includes("you_may")
  ) {
    return (
      <div>
        <PdpHeading section={section} />
        <ProductRail products={recommendations} />
      </div>
    );
  }

  // Size chart → available sizes from variant options.
  if (t.includes("size")) {
    const sizes = Array.from(
      new Set(
        product.variants.flatMap((v) =>
          v.selectedOptions
            .filter((o) => /size/i.test(o.name))
            .map((o) => o.value)
        )
      )
    );

    // For the builder preview, we mock the sizes and states to perfectly match the Figma design if needed
    const displaySizes = sizes.length >= 6 ? sizes.slice(0, 6) : ["XS", "S", "M", "L", "XL", "XXL"];
    const selectedSize = displaySizes[displaySizes.length - 1]; // XXL

    return (
      <div className="py-[24px] flex flex-col gap-[28px]">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-black text-[22px]">SIZE</span>
            <span className="text-zinc-200 text-xs">|</span>
            <span className="text-zinc-400 text-[14px]">{selectedSize}</span>
            <div className="ml-1 border border-zinc-200 px-2.5 py-1 text-[11.5px] text-[#4A3D29] font-medium shadow-sm bg-white">
              Chest: 42.5 in
            </div>
          </div>
          <span className="text-[#83735B] text-[11px] font-semibold tracking-wide uppercase cursor-pointer">
            SIZE GUIDE
          </span>
        </div>

        <div className="mx-4 flex border border-zinc-200 bg-white">
          {displaySizes.map((s, i) => {
            const isSelected = s === selectedSize;
            const isOutOfStock = i === 1; // mock S
            const hasStar = i === 3; // mock L
            const isFewLeft = i === 4; // mock XL

            return (
              <div
                key={s}
                className={cn(
                  "flex-1 relative flex flex-col items-center justify-center h-[52px]",
                  i !== displaySizes.length - 1 && "border-r border-zinc-200",
                  isSelected && "ring-2 ring-inset ring-black z-10 bg-white"
                )}
              >
                {isOutOfStock && (
                  <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute w-full h-full text-zinc-300" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                )}

                <div className={cn(
                  "flex items-center gap-1 text-[13px] font-light",
                  isOutOfStock ? "text-zinc-300" : isSelected ? "text-black font-normal" : "text-[#5C5C5C]"
                )}>
                  {hasStar && <span className="text-[#83735B] text-xs">✦</span>}
                  <span className="relative z-10">{s}</span>
                </div>

                {isFewLeft && (
                  <div className="absolute bottom-0 w-full bg-[#FFD6D6] py-[2px] text-center text-[8px] font-bold text-[#FF4C4C]">
                    2 LEFT
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Offers → discount derived from the variant's compare-at price.
  if (t.includes("offer")) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="font-semibold text-black text-[22px] uppercase">OFFER</span>
          <span className="text-[#83735B] text-[11px] font-semibold tracking-wide uppercase cursor-pointer">
            VIEW ALL
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 pb-2 snap-x hide-scrollbar">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative flex-none w-[280px] bg-[#F9F6F0] rounded-[10px] overflow-hidden snap-center">
              {/* Decorative icon (watermark) */}
              <div className="absolute right-0 top-0 z-0 opacity-80 pointer-events-none">
                <img src="public/Vector.png?v=1" alt="offer background" className="h-[87px] w-auto object-contain object-right-top translate-x-2" />
              </div>

              {/* Top half */}
              <div className="relative px-4 pt-4 pb-3 min-h-[70px]">
                <p className="text-[14px] text-[#212121] leading-relaxed relative z-10 w-[90%] font-medium">
                  Get flat 20% off upto ₹50 and Free Delivery
                </p>
              </div>

              {/* Dashed line separator with cutouts */}
              <div className="relative flex items-center h-2">
                {/* Left Cutout */}
                <div className="absolute -left-2 w-4 h-4 bg-white rounded-full z-10"></div>
                {/* Dashed Line */}
                <div className="w-full border-t border-dashed border-[#E5DFD3] mx-2"></div>
                {/* Right Cutout */}
                <div className="absolute -right-2 w-4 h-4 bg-white rounded-full z-10"></div>
              </div>

              {/* Bottom half */}
              <div className="px-4 pt-2 pb-3.5">
                <p className="text-[13px] font-medium text-[#5C5C5C]">CODE: 20FLAT</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Delivery details → static trust rows (not product-specific).
  if (t.includes("delivery") || t.includes("shipping")) {
    return (
      <div className="py-4 px-4">
        <div className="pb-4">
          <span className="font-semibold text-[#212121] text-[22px] uppercase">DELIVERY DETAILS</span>
        </div>

        <div className="border border-[#E5E5E5] px-4 py-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#212121] font-normal">1221001</span>
            <span className="text-[#83735B] text-[12px] font-semibold tracking-wide uppercase cursor-pointer">
              CHANGE
            </span>
          </div>
        </div>

        <div className="py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-white fill-[#45A84D] shrink-0" />
          <span className="text-[13px] text-[#7A7A7A]">Estimated Delivery by Sun 20 Oct, 9 AM</span>
        </div>

        <div className="bg-[#F8F8F8] py-5 mt-2 border-t border-[#F0F0F0]">
          <div className="grid grid-cols-3 divide-x divide-[#E5E5E5]">
            <div className="flex flex-col items-center justify-start text-center px-1">
              <Truck className="h-[22px] w-[22px] text-[#5C5C5C] mb-2 stroke-[1.2]" />
              <span className="text-[11px] text-[#7A7A7A] leading-relaxed">Free Shipping on<br />all orders</span>
            </div>
            <div className="flex flex-col items-center justify-start text-center px-1">
              <Clock className="h-[22px] w-[22px] text-[#5C5C5C] mb-2 stroke-[1.2]" />
              <span className="text-[11px] text-[#7A7A7A] leading-relaxed">Order Dispatch<br />in 24 hours</span>
            </div>
            <div className="flex flex-col items-center justify-start text-center px-1">
              <RotateCcw className="h-[22px] w-[22px] text-[#5C5C5C] mb-2 stroke-[1.2]" />
              <span className="text-[11px] text-[#7A7A7A] leading-relaxed">Easy Return<br />& Exchange</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/** The product header (gallery, title, price, variants) at the top of the PDP. */
function ProductHeader({ product }: { product: StorefrontProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.clientX;
    const threshold = 30; // px

    if (diff > threshold) {
      setActiveImage((p) => Math.min(images.length - 1, p + 1));
    } else if (diff < -threshold) {
      setActiveImage((p) => Math.max(0, p - 1));
    } else {
      // It was a click (no drag). Let's navigate based on which side was clicked.
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        setActiveImage((p) => Math.max(0, p - 1));
      } else {
        setActiveImage((p) => Math.min(images.length - 1, p + 1));
      }
    }
    setTouchStartX(null);
  };

  const images =
    product.images.length > 0 ? product.images.map((i) => i.url) : [""];
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const activePrice = variant?.price ?? product.priceRange.minVariantPrice;
  // If there's no compare-at price, mock a 20% discount so the builder preview always shows the discount UI
  const activeCompareAt = variant?.compareAtPrice ?? (activePrice ? {
    amount: String(Number(activePrice.amount) * 1.25),
    currencyCode: activePrice.currencyCode
  } : null);

  const price = activePrice ? formatMoney(activePrice) : null;
  const compareAt = activeCompareAt ? formatMoney(activeCompareAt) : null;

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) =>
      v.selectedOptions
        .filter((o) => /size/i.test(o.name))
        .forEach((o) => set.add(o.value))
    );
    return Array.from(set);
  }, [product.variants]);

  return (
    <div>
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button className="text-zinc-600">
          <ChevronLeft className="h-6 w-6 stroke-[1.5]" />
        </button>
        <div className="flex items-center gap-5 text-zinc-600">
          <button><Search className="h-[22px] w-[22px] stroke-[1.5]" /></button>
          <button><Heart className="h-[22px] w-[22px] stroke-[1.5]" /></button>
          <button><ShoppingBag className="h-[22px] w-[22px] stroke-[1.5]" /></button>
        </div>
      </div>

      <div className="bg-white px-4 pt-4">
        <div
          className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#f4f4f4]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <PreviewImage src={images[activeImage] ?? images[0]} className="pointer-events-none h-full w-full object-cover object-top" />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(i);
                  }}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === activeImage ? "w-6 bg-[#2f3f56]" : "w-2 bg-[#a3b1c6]"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Blocks Row */}
        <div className="mt-[15px] flex gap-2.5">
          <button className="flex flex-1 items-center justify-center bg-[#f8f8f8] p-2.5 text-zinc-600 transition hover:bg-zinc-100">
            <Layers className="h-[22px] w-[22px] stroke-[1.5]" />
          </button>
          <button className="flex flex-1 items-center justify-center bg-[#f8f8f8] p-2.5 text-zinc-600 transition hover:bg-zinc-100">
            <Heart className="h-[22px] w-[22px] stroke-[1.5]" />
          </button>
          <button className="flex flex-1 items-center justify-center bg-[#f8f8f8] p-2.5 text-zinc-600 transition hover:bg-zinc-100">
            <Share2 className="h-[22px] w-[22px] stroke-[1.5]" />
          </button>
        </div>
      </div>

      <div className="bg-white px-4 pt-4 pb-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="bg-[#EDE9E1] px-2 py-0.5 text-[11px] font-medium tracking-widest text-[#212121]">
            BEST SELLER
          </span>
          <div className="flex items-center gap-1 text-[12px] font-medium text-[#83735B]">
            <span>4.0</span>
            <Star className="h-3 w-3 fill-[#83735B] text-[#83735B]" />
            <span className="font-light">| 253</span>
          </div>
        </div>

        <h2 className="mb-1.5 text-[14px] font-normal tracking-wide text-[#6B6B6B] uppercase">{product.title}</h2>

        <div className="flex items-center gap-2">
          {price && <span className="text-[18px] font-bold text-black">{price}</span>}
          {compareAt && compareAt !== price && (
            <>
              <span className="text-[14px] font-normal text-[#8E8E8E] line-through">{compareAt}</span>
              <span className="text-[14px] font-bold text-[#3DA577]">
                -{Math.round((1 - (Number(activePrice?.amount || 0) / Number(activeCompareAt?.amount || 1))) * 100)}%
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-[12px] font-normal text-[#9E9E9E]">Inclusive of all taxes</p>


      </div>
    </div>
  );
}

interface ProductPagePreviewProps {
  sections: Section[];
  selectable: boolean;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

/**
 * Renders the PRODUCT-page CMS template as a realistic product detail page:
 * a live Shopify product header followed by the CMS PDP sections, with the
 * PDP-specific section types backed by that product's data.
 */
export function ProductPagePreview({
  sections,
  selectable,
  selectedSectionId,
  onSelectSection,
}: ProductPagePreviewProps) {
  const productsQ = useShopifyProducts();
  const pdpPreviewHandle = useBuilderStore((s) => s.pdpPreviewHandle);

  const handle = pdpPreviewHandle ?? productsQ.data?.[0]?.handle ?? null;
  const productQ = useStorefrontProduct(handle);
  const recsQ = useStorefrontRecommendations(productQ.data?.id ?? null);

  if (productsQ.isLoading || productQ.isLoading) {
    return <FullSpinner label="Loading product…" />;
  }

  const product = productQ.data;
  if (!product) {
    return (
      <div className="px-6 py-20 text-center text-sm text-zinc-500">
        Couldn't load a product to preview this page with.
      </div>
    );
  }

  const recommendations = recsQ.data ?? [];

  return (
    <div>
      <ProductHeader product={product} />
      {sections.map((section) => {
        if (!section.isVisible) {
          return (
            <SectionBlock
              key={section.id}
              section={section}
              selectable={selectable}
              selected={selectable && selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
            />
          );
        }
        const pdp = renderPdpContent(section, product, recommendations);
        if (!pdp) {
          return (
            <SectionBlock
              key={section.id}
              section={section}
              selectable={selectable}
              selected={selectable && selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
            />
          );
        }
        return (
          <div
            key={section.id}
            id={`section-${section.id}`}
            onClick={selectable ? () => onSelectSection(section.id) : undefined}
            className={cn(
              "relative border-t py-2",
              selectable && "cursor-pointer",
              selectable &&
              selectedSectionId === section.id &&
              "outline outline-2 -outline-offset-2 outline-primary"
            )}
          >
            {pdp}
          </div>
        );
      })}
    </div>
  );
}
