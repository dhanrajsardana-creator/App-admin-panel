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

async function storefrontGql<T>(query: string): Promise<T> {
  const domain = "www.powerlook.in";
  const token = "df3b1660e6859f510b854dc282eccdf9";
  const apiVersion = "2026-04";

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
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

export const shopifyApi = {
  shop: async (): Promise<{ name: string; domain: string }> => {
    const d = await gql<{ shop: { name: string; myshopifyDomain: string } }>(
      `query { shop { name myshopifyDomain } }`
    );
    return { name: d.shop.name, domain: d.shop.myshopifyDomain };
  },

  collections: async (first = 50): Promise<ShopifyCollection[]> => {
    const d = await storefrontGql<{
      collections: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description: string | null;
            updatedAt: string | null;
            image: { url: string } | null;
            products: { edges: { node: { featuredImage: { url: string } | null } }[] };
          };
        }[];
      };
    }>(
      `query { collections(first: ${first}) { edges { node { id title handle description updatedAt image { url } products(first: 1) { edges { node { featuredImage { url } } } } } } } }`
    );
    return d.collections.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productsCount: 0,
      imageUrl: node.products.edges[0]?.node.featuredImage?.url ?? node.image?.url ?? null,
      description: node.description ?? null,
      updatedAt: node.updatedAt ?? null,
    }));
  },

  /**
   * Collections for the index screen, each with its first product's image so
   * the card has a thumbnail even when the collection itself has no image.
   */
  collectionsIndex: async (first = 50): Promise<ShopifyCollectionCard[]> => {
    const d = await storefrontGql<{
      collections: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description: string | null;
            updatedAt: string | null;
            image: { url: string } | null;
            products: { edges: { node: { featuredImage: { url: string } | null } }[] };
          };
        }[];
      };
    }>(
      `query { collections(first: ${first}) { edges { node { id title handle description updatedAt image { url } products(first: 1) { edges { node { featuredImage { url } } } } } } } }`
    );
    return d.collections.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productsCount: 0,
      imageUrl: node.products.edges[0]?.node.featuredImage?.url ?? node.image?.url ?? null,
      description: node.description ?? null,
      updatedAt: node.updatedAt ?? null,
    }));
  },

  products: async (first = 250): Promise<ShopifyProduct[]> => {
    const d = await storefrontGql<{
      products: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            vendor: string | null;
            productType: string | null;
            tags: string[];
            featuredImage: { url: string } | null;
          };
        }[];
      };
    }>(
      `query { products(first: ${first}) { edges { node { id title handle vendor productType tags featuredImage { url } } } } }`
    );
    return d.products.edges.map(({ node }) => ({
      id: numericId(node.id),
      title: node.title,
      handle: node.handle,
      productType: node.productType,
      status: null,
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
    const d = await storefrontGql<{
      collection: {
        id: string;
        title: string;
        handle: string;
        image: { url: string } | null;
        products: {
          edges: {
            node: {
              id: string;
              title: string;
              handle: string;
              featuredImage: { url: string } | null;
              priceRange: {
                minVariantPrice: { amount: string; currencyCode: string };
              } | null;
            };
          }[];
        };
      } | null;
    }>(
      `query { collection(id: "${toGid("Collection", id)}") {
        id title handle image { url }
        products(first: ${first}) { edges { node {
          id title handle featuredImage { url }
          priceRange { minVariantPrice { amount currencyCode } }
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
      productsCount: 0,
      products: c.products.edges.map(({ node }) => ({
        id: numericId(node.id),
        title: node.title,
        handle: node.handle,
        imageUrl: node.featuredImage?.url ?? null,
        price: money(node.priceRange?.minVariantPrice ?? null),
      })),
    };
  },

  /** A single product's detail, for preview. */
  productDetail: async (id: string): Promise<ShopifyProductDetail> => {
    const d = await storefrontGql<{
      product: {
        id: string;
        title: string;
        handle: string;
        description: string | null;
        productType: string | null;
        featuredImage: { url: string } | null;
        images: { edges: { node: { url: string } }[] };
        priceRange: {
          minVariantPrice: { amount: string; currencyCode: string };
        } | null;
      } | null;
    }>(
      `query { product(id: "${toGid("Product", id)}") {
        id title handle description productType
        featuredImage { url }
        images(first: 6) { edges { node { url } } }
        priceRange { minVariantPrice { amount currencyCode } }
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
      price: money(p.priceRange?.minVariantPrice ?? null),
    };
  },

  discounts: async (): Promise<ShopifyDiscountNode[]> => {
    const query = `query GetDiscounts {
      discountNodes(first: 100) {
        edges {
          node {
            id
            discount {
              __typename
              ... on DiscountCodeBasic {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                appliesOncePerCustomer
                usageLimit
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                codes(first: 50) {
                  nodes {
                    code
                  }
                }
                customerSelection {
                  __typename
                }
                customerGets {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
              }
              ... on DiscountAutomaticBasic {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                customerGets {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
              }
              ... on DiscountCodeBxgy {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                usageLimit
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                codes(first: 50) {
                  nodes {
                    code
                  }
                }
                customerBuys {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
                customerGets {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
              }
              ... on DiscountAutomaticBxgy {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                customerBuys {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
                customerGets {
                  value {
                    __typename
                  }
                  items {
                    __typename
                  }
                }
              }
              ... on DiscountCodeFreeShipping {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                usageLimit
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
                codes(first: 50) {
                  nodes {
                    code
                  }
                }
              }
              ... on DiscountAutomaticFreeShipping {
                title
                status
                summary
                startsAt
                endsAt
                createdAt
                updatedAt
                asyncUsageCount
                combinesWith {
                  orderDiscounts
                  productDiscounts
                  shippingDiscounts
                }
              }
            }
          }
        }
      }
    }`;

    const d = await gql<{
      discountNodes: {
        edges: {
          node: {
            id: string;
            discount: {
              __typename: string;
              title: string;
              status: string;
              summary: string;
              startsAt: string;
              endsAt: string | null;
              createdAt: string;
              updatedAt: string;
              codes?: { nodes: { code: string }[] };
            };
          };
        }[];
      };
    }>(query);

    return d.discountNodes.edges.map(({ node }) => {
      const disc = node.discount;
      const codes = disc.codes?.nodes.map((c) => c.code) ?? [];
      return {
        id: node.id,
        typename: disc.__typename,
        title: disc.title,
        status: disc.status,
        summary: disc.summary || "",
        startsAt: disc.startsAt,
        endsAt: disc.endsAt,
        createdAt: disc.createdAt,
        updatedAt: disc.updatedAt,
        codes,
      };
    });
  },
};

export interface ShopifyDiscountNode {
  id: string;
  typename: string;
  title: string;
  status: string;
  summary: string;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  codes: string[];
}
