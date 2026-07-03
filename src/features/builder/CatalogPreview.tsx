import { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { FullSpinner } from "@/components/common/Spinner";
import {
  useShopifyCollectionDetail,
  useShopifyCollectionsIndex,
  useShopifyProductDetail,
  useShopifyProducts,
  useStorefrontProduct,
} from "@/hooks/useShopify";
import { formatMoney } from "@/api/shopifyStorefront";
import { useBuilderStore } from "@/store/builderStore";
import type { CatalogPreview as CatalogPreviewRef } from "@/store/builderStore";
import { PreviewImage } from "./sections/primitives";

/** Back arrow that pops the catalog nav-stack; hidden when there's no history. */
function BackButton({ className }: { className?: string }) {
  const canGoBack = useBuilderStore((s) => s.catalogHistory.length > 0);
  const catalogBack = useBuilderStore((s) => s.catalogBack);
  if (!canGoBack) return null;
  return (
    <button
      onClick={catalogBack}
      aria-label="Back"
      className={className}
    >
      <ChevronLeft className="h-6 w-6 rounded-full bg-white/80 p-1 text-black" />
    </button>
  );
}

/** The "Collections" landing screen — a list of collection cards. */
function CollectionIndexView() {
  const { data, isLoading, isError } = useShopifyCollectionsIndex();
  const selectCatalog = useBuilderStore((s) => s.selectCatalog);

  if (isLoading) return <FullSpinner label="Loading collections…" />;
  if (isError || !data) {
    return (
      <div className="px-6 py-20 text-center text-sm text-zinc-500">
        Couldn't load collections from Shopify.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {data.map((c) => {
        const cleanDesc = c.description ? c.description.replace(/<[^>]*>/g, "") : "";
        const formattedDate = c.updatedAt
          ? new Date(c.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";
        return (
          <button
            key={c.id}
            onClick={() =>
              selectCatalog(
                {
                  kind: "collection",
                  id: c.id,
                  handle: c.handle,
                  title: c.title,
                  imageUrl: c.imageUrl,
                },
                { push: true }
              )
            }
            className="flex h-20 w-full items-center justify-between overflow-hidden rounded-xl bg-zinc-100 pl-4 text-left"
          >
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="flex items-center gap-1 text-sm font-bold text-zinc-900">
                {c.title}
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              </span>
              {cleanDesc && (
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                  {cleanDesc}
                </p>
              )}
              <p className="mt-0.5 text-[9px] text-zinc-400">
                {c.productsCount} products
                {formattedDate && ` · Updated ${formattedDate}`}
              </p>
            </div>
            <div className="h-full w-28 shrink-0 overflow-hidden">
              <PreviewImage src={c.imageUrl} className="h-full w-full" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** The "Products" landing screen — a grid of all products. */
function ProductIndexView() {
  const { data, isLoading, isError } = useShopifyProducts();
  const selectCatalog = useBuilderStore((s) => s.selectCatalog);

  if (isLoading) return <FullSpinner label="Loading products…" />;
  if (isError || !data) {
    return (
      <div className="px-6 py-20 text-center text-sm text-zinc-500">
        Couldn't load products from Shopify.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {data.map((p) => (
        <button
          key={p.id}
          onClick={() =>
            selectCatalog(
              {
                kind: "product",
                id: p.id,
                handle: p.handle,
                title: p.title,
                imageUrl: p.imageUrl,
              },
              { push: true }
            )
          }
          className="w-full text-left"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100">
            <PreviewImage src={p.imageUrl} className="h-full w-full" />
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px]">
              ♡
            </span>
          </div>
          <div className="mt-1 px-0.5 min-w-0">
            {p.vendor && (
              <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                {p.vendor}
              </p>
            )}
            <p className="truncate text-[11px] font-medium text-zinc-700 leading-tight">
              {p.title}
            </p>
            {p.tags && p.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-0.5 overflow-hidden max-h-4">
                {p.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-zinc-100 px-1 py-0.2 text-[8px] text-zinc-500 whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/** Renders a live Shopify collection (product grid) inside the phone frame. */
function CollectionView({ catalog }: { catalog: CatalogPreviewRef }) {
  const { data, isLoading, isError } = useShopifyCollectionDetail(
    catalog.id ?? null
  );
  const selectCatalog = useBuilderStore((s) => s.selectCatalog);

  if (isLoading) return <FullSpinner label="Loading collection…" />;
  if (isError || !data) {
    return (
      <div className="px-6 py-20 text-center text-sm text-zinc-500">
        Couldn't load this collection from Shopify.
      </div>
    );
  }

  return (
    <div>
      {/* Collection hero */}
      <div className="relative h-36 w-full overflow-hidden bg-zinc-200">
        <PreviewImage src={data.imageUrl} className="h-full w-full" />
        <div className="absolute inset-0 bg-black/30" />
        <BackButton className="absolute left-2 top-2" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <h2 className="text-lg font-bold leading-tight">{data.title}</h2>
          <p className="text-[11px] opacity-90">{data.productsCount} products</p>
        </div>
      </div>

      {/* Sort / filter bar */}
      <div className="flex items-center justify-between border-b bg-white px-3 py-2 text-[11px] font-medium text-zinc-600">
        <span>{data.products.length} shown</span>
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter & Sort
        </span>
      </div>

      {/* Product grid */}
      {data.products.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-zinc-500">
          This collection has no products.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-2">
          {data.products.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                selectCatalog(
                  {
                    kind: "product",
                    id: p.id,
                    handle: p.handle,
                    title: p.title,
                    imageUrl: p.imageUrl,
                  },
                  { push: true }
                )
              }
              className="w-full text-left"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100">
                <PreviewImage src={p.imageUrl} className="h-full w-full" />
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px]">
                  ♡
                </span>
              </div>
              <div className="mt-1 px-0.5">
                <p className="truncate text-[11px] text-zinc-700">{p.title}</p>
                {p.price && (
                  <p className="text-xs font-semibold">{p.price}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders a live Shopify product detail page (Storefront API) in the phone. */
function ProductView({ catalog }: { catalog: CatalogPreviewRef }) {
  // Storefront API is keyed by handle; fall back to the Admin API when we only
  // have an id, or when the Storefront lookup fails (e.g. a draft/unpublished
  // product that the Storefront API can't resolve).
  const sf = useStorefrontProduct(catalog.handle ?? null);
  const useAdmin = !catalog.handle || sf.isError;
  const admin = useShopifyProductDetail(useAdmin ? catalog.id ?? null : null);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  if (sf.isLoading || admin.isLoading) {
    return <FullSpinner label="Loading product…" />;
  }

  // --- Rich Storefront product -------------------------------------------
  if (sf.data) {
    const p = sf.data;
    const images = p.images.length > 0 ? p.images.map((i) => i.url) : [catalog.imageUrl ?? ""];
    const variant =
      p.variants.find((v) => v.id === selectedVariant) ?? p.variants[0] ?? null;
    const price = formatMoney(variant?.price ?? p.priceRange.minVariantPrice);
    const compareAt = formatMoney(variant?.compareAtPrice ?? null);

    // Group variant options (e.g. Size → [S, M, L]) for selectable chips.
    const optionGroups = new Map<string, Set<string>>();
    p.variants.forEach((v) =>
      v.selectedOptions.forEach((o) => {
        if (!optionGroups.has(o.name)) optionGroups.set(o.name, new Set());
        optionGroups.get(o.name)!.add(o.value);
      })
    );

    return (
      <div>
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          <PreviewImage src={images[activeImage] ?? images[0]} className="h-full w-full" />
          <BackButton className="absolute left-2 top-2" />
          {!p.availableForSale && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-3 py-1 text-xs font-semibold uppercase text-white">
              Sold out
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
            {images.slice(0, 8).map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded border bg-zinc-100 ${
                  i === activeImage ? "ring-2 ring-black" : ""
                }`}
              >
                <PreviewImage src={src} className="h-full w-full" />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 bg-white px-3 py-3">
          {p.vendor && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {p.vendor}
            </p>
          )}
          <h2 className="text-base font-semibold leading-snug">{p.title}</h2>

          {/* Price */}
          <div className="flex items-center gap-2">
            {price && <span className="text-lg font-bold">{price}</span>}
            {compareAt && compareAt !== price && (
              <span className="text-sm text-zinc-400 line-through">{compareAt}</span>
            )}
          </div>

          {/* Variant option chips */}
          {Array.from(optionGroups.entries()).map(([name, values]) => (
            <div key={name} className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-700">{name}</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(values).map((value) => {
                  // The variant that matches this option value.
                  const match = p.variants.find((v) =>
                    v.selectedOptions.some(
                      (o) => o.name === name && o.value === value
                    )
                  );
                  const active = variant?.selectedOptions.some(
                    (o) => o.name === name && o.value === value
                  );
                  return (
                    <button
                      key={value}
                      onClick={() => match && setSelectedVariant(match.id)}
                      disabled={match ? !match.availableForSale : false}
                      className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-zinc-300 text-zinc-700"
                      } ${match && !match.availableForSale ? "opacity-40 line-through" : ""}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* SKU / stock */}
          {variant && (
            <p className="text-[11px] text-zinc-400">
              {variant.sku ? `SKU: ${variant.sku}` : ""}
              {variant.quantityAvailable != null
                ? `${variant.sku ? " · " : ""}${variant.quantityAvailable} in stock`
                : ""}
            </p>
          )}

          {/* Tags */}
          {p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {p.tags.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Description (rich HTML from Shopify) */}
          {p.descriptionHtml && (
            <div
              className="prose-sm max-w-none text-xs leading-relaxed text-zinc-600 [&_a]:text-blue-600 [&_img]:rounded [&_li]:ml-4 [&_li]:list-disc"
              dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
            />
          )}

          <button
            disabled={variant ? !variant.availableForSale : !p.availableForSale}
            className="mt-1 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {variant?.availableForSale ?? p.availableForSale
              ? "Add to Cart"
              : "Sold Out"}
          </button>
        </div>
      </div>
    );
  }

  // --- Admin API fallback (no handle / Storefront unavailable) -----------
  if (admin.data) {
    const data = admin.data;
    const gallery = data.images.length > 0 ? data.images : [data.imageUrl ?? ""];
    return (
      <div>
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          <PreviewImage src={data.imageUrl ?? gallery[0]} className="h-full w-full" />
          <BackButton className="absolute left-2 top-2" />
        </div>
        <div className="space-y-2 bg-white px-3 py-3">
          {data.productType && (
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">
              {data.productType}
            </p>
          )}
          <h2 className="text-base font-semibold leading-snug">{data.title}</h2>
          {data.price && <p className="text-lg font-bold">{data.price}</p>}
          {data.description && (
            <p className="line-clamp-4 text-xs leading-relaxed text-zinc-500">
              {data.description}
            </p>
          )}
          <button className="mt-2 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white">
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-20 text-center text-sm text-zinc-500">
      Couldn't load this product from Shopify.
    </div>
  );
}

export function CatalogPreview({ catalog }: { catalog: CatalogPreviewRef }) {
  switch (catalog.kind) {
    case "collection-index":
      return <CollectionIndexView />;
    case "collection":
      return <CollectionView catalog={catalog} />;
    case "product":
      return <ProductView catalog={catalog} />;
    case "product-index":
      return <ProductIndexView />;
    default:
      return <CollectionIndexView />;
  }
}
