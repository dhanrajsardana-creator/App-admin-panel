import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopifyApi, type ShopifyCollection, type ShopifyProduct } from "@/api/shopify";
import { storefrontApi } from "@/api/shopifyStorefront";
import { ENV } from "@/config/env";

const STALE = 5 * 60 * 1000;

export function useShopifyCollections() {
  return useQuery({
    queryKey: ["shopify", "collections"],
    queryFn: () => shopifyApi.collections(),
    enabled: ENV.shopifyEnabled,
    staleTime: STALE,
    retry: 1,
  });
}

export function useShopifyProducts() {
  return useQuery({
    queryKey: ["shopify", "products"],
    queryFn: () => shopifyApi.products(),
    enabled: ENV.shopifyEnabled,
    staleTime: STALE,
    retry: 1,
  });
}

export function useShopifyCollectionsIndex() {
  return useQuery({
    queryKey: ["shopify", "collections-index"],
    queryFn: () => shopifyApi.collectionsIndex(),
    enabled: ENV.shopifyEnabled,
    staleTime: STALE,
    retry: 1,
  });
}

export function useShopifyCollectionDetail(id: string | null) {
  return useQuery({
    queryKey: ["shopify", "collection", id],
    queryFn: () => shopifyApi.collectionDetail(id as string),
    enabled: ENV.shopifyEnabled && !!id,
    staleTime: STALE,
    retry: 1,
  });
}

export function useShopifyProductDetail(id: string | null) {
  return useQuery({
    queryKey: ["shopify", "product", id],
    queryFn: () => shopifyApi.productDetail(id as string),
    enabled: ENV.shopifyEnabled && !!id,
    staleTime: STALE,
    retry: 1,
  });
}

/** Rich product detail from the Storefront API, keyed by product handle. */
export function useStorefrontProduct(handle: string | null) {
  return useQuery({
    queryKey: ["storefront", "product", handle],
    queryFn: () => storefrontApi.productByHandle(handle as string),
    enabled: !!handle && !!ENV.shopifyStorefrontDomain && !!ENV.shopifyStorefrontToken,
    staleTime: STALE,
    retry: 1,
  });
}

/** Related products (Storefront recommendations) for PDP rails. */
export function useStorefrontRecommendations(productId: string | null) {
  return useQuery({
    queryKey: ["storefront", "recommendations", productId],
    queryFn: () => storefrontApi.recommendations(productId as string),
    enabled: !!productId && !!ENV.shopifyStorefrontDomain && !!ENV.shopifyStorefrontToken,
    staleTime: STALE,
    retry: 1,
  });
}

export interface ResolvedRef {
  id: string;
  title: string;
  kind: "collection" | "product";
  handle: string;
  imageUrl: string | null;
  productsCount?: number;
  description?: string | null;
  updatedAt?: string | null;
  vendor?: string | null;
  tags?: string[];
}

/**
 * Resolves a CMS item's referenceId (+ referenceType) to the real Shopify
 * collection/product it points at. Returns a lookup fn and loading state.
 */
export function useShopifyResolver() {
  const collectionsQ = useShopifyCollections();
  const productsQ = useShopifyProducts();

  const byId = useMemo(() => {
    const map = new Map<string, ResolvedRef>();
    (collectionsQ.data ?? []).forEach((c: ShopifyCollection) =>
      map.set(c.id, {
        id: c.id,
        title: c.title,
        kind: "collection",
        handle: c.handle,
        imageUrl: c.imageUrl,
        productsCount: c.productsCount,
        description: c.description,
        updatedAt: c.updatedAt,
      })
    );
    (productsQ.data ?? []).forEach((p: ShopifyProduct) => {
      // Products and collections share the id space only by gid type, so a
      // collection id won't collide; keep products from overwriting collections.
      if (!map.has(p.id))
        map.set(p.id, {
          id: p.id,
          title: p.title,
          kind: "product",
          handle: p.handle,
          imageUrl: p.imageUrl,
          vendor: p.vendor,
          tags: p.tags,
        });
    });
    return map;
  }, [collectionsQ.data, productsQ.data]);

  const resolve = (
    referenceId?: string | null,
    referenceType?: string | null
  ): ResolvedRef | null => {
    if (!referenceId) return null;
    const hit = byId.get(referenceId);
    if (hit) return hit;
    // Unknown id — surface the type so the UI still shows something useful.
    if (referenceType)
      return {
        id: referenceId,
        title: referenceType.replace(/_/g, " ").toLowerCase(),
        kind: "collection",
        handle: referenceId,
        imageUrl: null,
      };
    return null;
  };

  return {
    resolve,
    enabled: ENV.shopifyEnabled,
    isLoading: collectionsQ.isLoading || productsQ.isLoading,
    isError: collectionsQ.isError || productsQ.isError,
    collections: collectionsQ.data ?? [],
    products: productsQ.data ?? [],
  };
}
