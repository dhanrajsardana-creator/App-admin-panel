import { useMemo, useState } from "react";
import { ChevronLeft, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
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
    <h3 className="px-3 pb-2 pt-1 text-sm font-bold uppercase tracking-wide text-zinc-800">
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
    const rows: { label: string; value: string }[] = [];
    if (product.vendor) rows.push({ label: "Brand", value: product.vendor });
    if (product.productType)
      rows.push({ label: "Category", value: product.productType });
    rows.push({
      label: "Availability",
      value: product.availableForSale ? "In stock" : "Sold out",
    });
    if (product.tags.length)
      rows.push({ label: "Tags", value: product.tags.slice(0, 5).join(", ") });
    return (
      <div>
        <PdpHeading section={section} />
        <div className="mx-3 mb-3 divide-y rounded-lg border bg-white text-xs">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-3 px-3 py-2">
              <span className="text-zinc-500">{r.label}</span>
              <span className="text-right font-medium text-zinc-800">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Additional information / product description → rich HTML.
  if (t.includes("additional") || t.includes("description")) {
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

  // Rating & review (Storefront has no native reviews; sample UI).
  if (t.includes("rating") || t.includes("review")) {
    return (
      <div>
        <PdpHeading section={section} />
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border bg-white px-3 py-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i <= 4
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-200 text-zinc-200"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold">4.2</span>
          <span className="text-[11px] text-zinc-400">
            · reviews load from your reviews app
          </span>
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
    return (
      <div>
        <PdpHeading section={section} />
        {sizes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-3 pb-3">
            {sizes.map((s) => {
              const available = product.variants.some(
                (v) =>
                  v.availableForSale &&
                  v.selectedOptions.some(
                    (o) => /size/i.test(o.name) && o.value === s
                  )
              );
              return (
                <span
                  key={s}
                  className={cn(
                    "rounded-md border px-3 py-1 text-xs",
                    available
                      ? "border-zinc-300 text-zinc-700"
                      : "border-zinc-200 text-zinc-300 line-through"
                  )}
                >
                  {s}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="px-3 pb-3 text-xs text-zinc-400">
            This product has no size options.
          </p>
        )}
      </div>
    );
  }

  // Offers → discount derived from the variant's compare-at price.
  if (t.includes("offer")) {
    const v = product.variants[0];
    const hasDiscount =
      v?.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount);
    return (
      <div>
        <PdpHeading section={section} />
        <div className="mx-3 mb-3 space-y-1.5">
          {hasDiscount && (
            <div className="rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              Save{" "}
              {formatMoney({
                amount: String(
                  Number(v!.compareAtPrice!.amount) - Number(v!.price.amount)
                ),
                currencyCode: v!.price.currencyCode,
              })}{" "}
              on this product
            </div>
          )}
          <div className="rounded-lg border bg-white px-3 py-2 text-xs text-zinc-600">
            Use code <span className="font-semibold">FIRST10</span> for 10% off
            your first order
          </div>
        </div>
      </div>
    );
  }

  // Delivery details → static trust rows (not product-specific).
  if (t.includes("delivery") || t.includes("shipping")) {
    const rows = [
      { icon: Truck, text: "Free delivery on orders above ₹999" },
      { icon: RotateCcw, text: "Easy 7-day returns & exchange" },
      { icon: ShieldCheck, text: "100% secure payments" },
    ];
    return (
      <div>
        <PdpHeading section={section} />
        <div className="mx-3 mb-3 divide-y rounded-lg border bg-white">
          {rows.map((r) => (
            <div key={r.text} className="flex items-center gap-2.5 px-3 py-2.5">
              <r.icon className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="text-xs text-zinc-700">{r.text}</span>
            </div>
          ))}
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

  const images =
    product.images.length > 0 ? product.images.map((i) => i.url) : [""];
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const price = formatMoney(variant?.price ?? product.priceRange.minVariantPrice);
  const compareAt = formatMoney(variant?.compareAtPrice ?? null);

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
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        <PreviewImage src={images[activeImage] ?? images[0]} className="h-full w-full" />
        <ChevronLeft className="absolute left-2 top-2 h-6 w-6 rounded-full bg-white/80 p-1 text-black" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
          {images.slice(0, 8).map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "h-12 w-12 shrink-0 overflow-hidden rounded border bg-zinc-100",
                i === activeImage && "ring-2 ring-black"
              )}
            >
              <PreviewImage src={src} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2 bg-white px-3 py-3">
        {product.vendor && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {product.vendor}
          </p>
        )}
        <h2 className="text-base font-semibold leading-snug">{product.title}</h2>
        <div className="flex items-center gap-2">
          {price && <span className="text-lg font-bold">{price}</span>}
          {compareAt && compareAt !== price && (
            <span className="text-sm text-zinc-400 line-through">{compareAt}</span>
          )}
        </div>
        {sizeOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sizeOptions.map((s) => {
              const match = product.variants.find((v) =>
                v.selectedOptions.some(
                  (o) => /size/i.test(o.name) && o.value === s
                )
              );
              const active = variant?.selectedOptions.some(
                (o) => /size/i.test(o.name) && o.value === s
              );
              return (
                <button
                  key={s}
                  onClick={() => match && setVariantId(match.id)}
                  disabled={match ? !match.availableForSale : false}
                  className={cn(
                    "rounded-md border px-3 py-1 text-xs",
                    active
                      ? "border-black bg-black text-white"
                      : "border-zinc-300 text-zinc-700",
                    match && !match.availableForSale && "opacity-40 line-through"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
        <button
          disabled={!(variant?.availableForSale ?? product.availableForSale)}
          className="mt-2 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {(variant?.availableForSale ?? product.availableForSale)
            ? "Add to Cart"
            : "Sold Out"}
        </button>
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
