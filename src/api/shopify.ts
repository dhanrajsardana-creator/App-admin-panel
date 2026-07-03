import axios from "axios";

// IMPORTANT: this hits the Vite dev proxy (/shopify-admin/graphql), which
// attaches the Admin token server-side. The token is never present in the
// browser bundle. In production this path must be served by the CMS backend.
const shopifyHttp = axios.create({
  baseURL: "/shopify-admin",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

async function gql<T>(query: string): Promise<T> {
  const { data } = await shopifyHttp.post("/graphql", { query });
  if (data.errors) {
    throw new Error(
      Array.isArray(data.errors)
        ? data.errors.map((e: { message: string }) => e.message).join("; ")
        : "Shopify GraphQL error"
    );
  }
  return data.data as T;
}

export interface ShopifyCollection {
  id: string; // numeric id (gid suffix)
  title: string;
  handle: string;
  productsCount: number;
  imageUrl: string | null;
  description: string | null;
  updatedAt: string | null;
}

export interface ShopifyProduct {
  id: string; // numeric id (gid suffix)
  title: string;
  handle: string;
  productType: string | null;
  status: string | null;
  imageUrl: string | null;
  vendor: string | null;
  tags: string[];
}

/** A collection card for the "Collections" index screen. */
export interface ShopifyCollectionCard {
  id: string;
  title: string;
  handle: string;
  productsCount: number;
  /** First product's image (preferred), falling back to the collection image. */
  imageUrl: string | null;
  description: string | null;
  updatedAt: string | null;
}

/** Strip the gid:// prefix down to the bare numeric id the CMS stores. */
const numericId = (gid: string) => gid.split("/").pop() ?? gid;

/** Build a Shopify gid from a bare numeric id (passes through full gids). */
const toGid = (kind: "Collection" | "Product", id: string) =>
  id.startsWith("gid://") ? id : `gid://shopify/${kind}/${id}`;

export interface ShopifyPreviewProduct {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  price: string | null; // formatted, e.g. "₹999" / "$12.00"
}

export interface ShopifyCollectionDetail {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  productsCount: number;
  products: ShopifyPreviewProduct[];
}

export interface ShopifyProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  price: string | null;
  productType: string | null;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/** Format a Shopify MoneyV2 into a compact display string. */
function money(m: { amount: string; currencyCode: string } | null): string | null {
  if (!m) return null;
  const sym = CURRENCY_SYMBOL[m.currencyCode] ?? `${m.currencyCode} `;
  const n = Number(m.amount);
  return `${sym}${Number.isFinite(n) ? n.toLocaleString() : m.amount}`;
}

export const shopifyApi = {
  shop: async (): Promise<{ name: string; domain: string }> => {
    const d = await gql<{ shop: { name: string; myshopifyDomain: string } }>(
      `query { shop { name myshopifyDomain } }`
    );
    return { name: d.shop.name, domain: d.shop.myshopifyDomain };
  },

  collections: async (first = 50): Promise<ShopifyCollection[]> => {
    const d = await gql<{
      collections: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description: string | null;
            updatedAt: string | null;
            productsCount: { count: number } | null;
            image: { url: string } | null;
          };
        }[];
      };
    }>(
      `query { collections(first: ${first}) { edges { node { id title handle description updatedAt productsCount { count } image { url } } } } }`
    );
    return d.collections.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productsCount: node.productsCount?.count ?? 0,
      imageUrl: node.image?.url ?? null,
      description: node.description ?? null,
      updatedAt: node.updatedAt ?? null,
    }));
  },

  /**
   * Collections for the index screen, each with its first product's image so
   * the card has a thumbnail even when the collection itself has no image.
   */
  collectionsIndex: async (first = 50): Promise<ShopifyCollectionCard[]> => {
    const d = await gql<{
      collections: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description: string | null;
            updatedAt: string | null;
            productsCount: { count: number } | null;
            image: { url: string } | null;
            products: { edges: { node: { featuredImage: { url: string } | null } }[] };
          };
        }[];
      };
    }>(
      `query { collections(first: ${first}) { edges { node {
        id title handle description updatedAt productsCount { count } image { url }
        products(first: 1) { edges { node { featuredImage { url } } } }
      } } } }`
    );
    return d.collections.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productsCount: node.productsCount?.count ?? 0,
      imageUrl:
        node.products.edges[0]?.node.featuredImage?.url ??
        node.image?.url ??
        null,
      description: node.description ?? null,
      updatedAt: node.updatedAt ?? null,
    }));
  },

  products: async (first = 250): Promise<ShopifyProduct[]> => {
    const d = await gql<{
      products: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            vendor: string | null;
            productType: string | null;
            status: string | null;
            tags: string[];
            featuredImage: { url: string } | null;
          };
        }[];
      };
    }>(
      `query { products(first: ${first}) { edges { node { id title handle vendor productType status tags featuredImage { url } } } } }`
    );
    return d.products.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productType: node.productType,
      status: node.status,
      imageUrl: node.featuredImage?.url ?? null,
      vendor: node.vendor ?? null,
      tags: node.tags ?? [],
    }));
  },

  /** A single collection plus the first N products inside it, for preview. */
  collectionDetail: async (
    id: string,
    first = 24
  ): Promise<ShopifyCollectionDetail> => {
    const d = await gql<{
      collection: {
        id: string;
        title: string;
        handle: string;
        image: { url: string } | null;
        productsCount: { count: number } | null;
        products: {
          edges: {
            node: {
              id: string;
              title: string;
              handle: string;
              featuredImage: { url: string } | null;
              priceRangeV2: {
                minVariantPrice: { amount: string; currencyCode: string };
              } | null;
            };
          }[];
        };
      } | null;
    }>(
      `query { collection(id: "${toGid("Collection", id)}") {
        id title handle image { url } productsCount { count }
        products(first: ${first}) { edges { node {
          id title handle featuredImage { url }
          priceRangeV2 { minVariantPrice { amount currencyCode } }
        } } }
      } }`
    );
    const c = d.collection;
    if (!c) throw new Error("Collection not found");
    return {
      id: numericId(c.id),
      title: c.title,
      handle: c.handle,
      imageUrl: c.image?.url ?? null,
      productsCount: c.productsCount?.count ?? 0,
      products: c.products.edges.map(({ node }) => ({
        id: numericId(node.id),
        title: node.title,
        handle: node.handle,
        imageUrl: node.featuredImage?.url ?? null,
        price: money(node.priceRangeV2?.minVariantPrice ?? null),
      })),
    };
  },

  /** A single product's detail, for preview. */
  productDetail: async (id: string): Promise<ShopifyProductDetail> => {
    const d = await gql<{
      product: {
        id: string;
        title: string;
        handle: string;
        description: string | null;
        productType: string | null;
        featuredImage: { url: string } | null;
        images: { edges: { node: { url: string } }[] };
        priceRangeV2: {
          minVariantPrice: { amount: string; currencyCode: string };
        } | null;
      } | null;
    }>(
      `query { product(id: "${toGid("Product", id)}") {
        id title handle description productType
        featuredImage { url }
        images(first: 6) { edges { node { url } } }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
      } }`
    );
    const p = d.product;
    if (!p) throw new Error("Product not found");
    return {
      id: numericId(p.id),
      title: p.title,
      handle: p.handle,
      description: p.description,
      productType: p.productType,
      imageUrl: p.featuredImage?.url ?? null,
      images: p.images.edges.map((e) => e.node.url),
      price: money(p.priceRangeV2?.minVariantPrice ?? null),
    };
  },
};
