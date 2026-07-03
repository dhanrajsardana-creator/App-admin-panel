import { ENV } from "@/config/env";

/**
 * Shopify Storefront API client. The Storefront access token is PUBLIC and the
 * API is CORS-enabled, so we call it directly from the browser (no proxy). This
 * powers the rich product-detail preview with variants, prices and media.
 */

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export interface Money {
  amount: string;
  currencyCode: string;
}

/** Format a Storefront MoneyV2 into a compact display string. */
export function formatMoney(m: Money | null | undefined): string | null {
  if (!m) return null;
  const sym = CURRENCY_SYMBOL[m.currencyCode] ?? `${m.currencyCode} `;
  const n = Number(m.amount);
  return `${sym}${Number.isFinite(n) ? n.toLocaleString() : m.amount}`;
}

export interface StorefrontVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
}

export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  images: { url: string; altText: string | null }[];
  variants: StorefrontVariant[];
}

/** A lightweight product card used in recommendation rails. */
export interface StorefrontProductCard {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  price: string | null;
}

function endpoint(): string {
  return `https://${ENV.shopifyStorefrontDomain}/api/${ENV.shopifyStorefrontApiVersion}/graphql.json`;
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  if (!ENV.shopifyStorefrontDomain || !ENV.shopifyStorefrontToken) {
    throw new Error("Shopify Storefront API is not configured.");
  }
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": ENV.shopifyStorefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Storefront API error ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      Array.isArray(json.errors)
        ? json.errors.map((e: { message: string }) => e.message).join("; ")
        : "Storefront GraphQL error"
    );
  }
  return json.data as T;
}

const PRODUCT_QUERY = `query GetProduct($handle: String!) {
  product(handle: $handle) {
    id title handle descriptionHtml vendor productType tags availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    images(first: 10) { edges { node { url altText width height } } }
    variants(first: 50) {
      edges { node {
        id title sku availableForSale quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      } }
    }
  }
}`;

export const storefrontApi = {
  productByHandle: async (handle: string): Promise<StorefrontProduct> => {
    const d = await gql<{
      product: {
        id: string;
        title: string;
        handle: string;
        descriptionHtml: string;
        vendor: string | null;
        productType: string | null;
        tags: string[];
        availableForSale: boolean;
        priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
        images: { edges: { node: { url: string; altText: string | null } }[] };
        variants: { edges: { node: StorefrontVariant }[] };
      } | null;
    }>(PRODUCT_QUERY, { handle });

    const p = d.product;
    if (!p) throw new Error("Product not found");
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      descriptionHtml: p.descriptionHtml,
      vendor: p.vendor,
      productType: p.productType,
      tags: p.tags,
      availableForSale: p.availableForSale,
      priceRange: p.priceRange,
      images: p.images.edges.map((e) => e.node),
      variants: p.variants.edges.map((e) => e.node),
    };
  },

  /** Related products for "Best Pair It With" / "Similar Products" rails. */
  recommendations: async (
    productId: string
  ): Promise<StorefrontProductCard[]> => {
    const d = await gql<{
      productRecommendations: {
        id: string;
        title: string;
        handle: string;
        featuredImage: { url: string } | null;
        priceRange: { minVariantPrice: Money } | null;
      }[] | null;
    }>(
      `query Recs($productId: ID!) {
        productRecommendations(productId: $productId) {
          id title handle featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }`,
      { productId }
    );
    return (d.productRecommendations ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      imageUrl: r.featuredImage?.url ?? null,
      price: formatMoney(r.priceRange?.minVariantPrice ?? null),
    }));
  },
};
