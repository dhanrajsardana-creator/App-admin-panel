/**
 * BFF Adapter — ported from Mobile/react-native-playground/src/helpers/bff-adapter.ts
 *
 * Maps CMS Section objects (as returned by the admin API) into UIWidget objects
 * that are structurally identical to what the mobile app renders.
 *
 * The admin's `Section` type and the mobile's `BFFSection` type share the same
 * shape, so this is a direct port with only TypeScript import adjustments.
 */

import type { Section } from '@/types'
import type {
  BannerWidget,
  CartProductWidget,
  CartBannerWidget,
  CartSummaryWidget,
  CartCheckoutWidget,
  ProfileBannerWidget,
  ProfileListWidget,
  CategoryShowcaseWidget,
  CollectionGridWidget,
  EditorialLookbookWidget,
  FeaturedCollectionWidget,
  FilterItem,
  GifBannerWidget,
  IrresistibleDealsWidget,
  NewDropWidget,
  ProductGridWidget,
  StyleSpotlightWidget,
  TheRotationWidget,
  TrendsCollageWidget,
  UIWidget,
  ValuePropsWidget,
  WidgetAction,
  WidgetProductItem,
} from '@/types/widgets'

// ── Helpers ──────────────────────────────────────────────────────────────────

const ABSENT_VALUE = '—'

/**
 * Maps BFF redirectType and redirectValue to a WidgetAction.
 */
function mapBffAction(
  redirectType: 'COLLECTION' | 'LANDING' | 'NONE' | string | null,
  redirectValue: string | null,
): WidgetAction {
  if (!redirectType || redirectType === 'NONE' || !redirectValue) {
    return { type: 'NAVIGATE_TO_COLLECTION', payload: {} }
  }

  switch (redirectType) {
    case 'COLLECTION':
      return { type: 'NAVIGATE_TO_COLLECTION', payload: { query: redirectValue } }
    case 'LANDING':
      return { type: 'OPEN_URL', payload: { url: redirectValue } }
    case 'PRODUCT':
      return { type: 'NAVIGATE_TO_PRODUCT', payload: { id: redirectValue } }
    default:
      return { type: 'NAVIGATE_TO_COLLECTION', payload: { query: redirectValue } }
  }
}

// ── Product mapping helper (shared by multiple adapters) ──────────────────────

function mapResolvedProduct(
  resolvedProd: any,
  itemSource?: any,
  sectionTitle?: string | null,
  filterKeys?: string[],
): WidgetProductItem {
  const priceAmount = parseFloat(resolvedProd.price?.amount || '0')
  const comparePriceAmount = parseFloat(
    resolvedProd.compareAtPrice?.amount ||
      resolvedProd.variants?.[0]?.compareAtPrice ||
      '0',
  )

  const discountPercent =
    resolvedProd.discountPercent ||
    (comparePriceAmount > priceAmount
      ? Math.round(((comparePriceAmount - priceAmount) / comparePriceAmount) * 100)
      : 0)

  let resolvedTags: string[] = []
  if (Array.isArray(resolvedProd.tags)) {
    const primaryTags = resolvedProd.tags.filter((t: string) =>
      ['Oversized', 'Relaxed', 'Premium', 'Cotton', 'Shirt', 'Cargo'].some(
        (term) => t.toLowerCase().includes(term.toLowerCase()),
      ),
    )
    resolvedTags = primaryTags.length > 0 ? [primaryTags[0]] : resolvedProd.tags.slice(0, 1)
  }

  let memberPrice: number | undefined
  let isMemberHighlight = false
  if (priceAmount > 0) {
    const baseMember = Math.round((priceAmount * 0.6) / 10) * 10
    memberPrice = baseMember > 0 ? baseMember : undefined
    isMemberHighlight = Math.random() > 0.5
  }

  return {
    id: resolvedProd.id,
    title: resolvedProd.title || '',
    price: priceAmount,
    originalPrice: comparePriceAmount > priceAmount ? comparePriceAmount : undefined,
    discountPercentage: discountPercent > 0 ? discountPercent : undefined,
    memberPrice,
    isMemberHighlight,
    imageUrl:
      resolvedProd.featuredImage?.url || resolvedProd.images?.[0]?.url || '',
    badge: itemSource?.badgeText || sectionTitle?.toUpperCase() || undefined,
    tags: resolvedTags.length > 0 ? resolvedTags : undefined,
    isFavorite: false,
    action: {
      type: 'NAVIGATE_TO_PRODUCT',
      payload: {
        id: resolvedProd.handle || resolvedProd.gid || resolvedProd.id,
      },
    },
  }
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export const bffAdapter = {
  /**
   * Translates a Section into a UIWidget based on its sectionKey.
   * Returns null for unrecognised sectionKeys.
   */
  sectionToWidget: (section: Section): UIWidget | null => {
    if (section.sectionType?.toUpperCase() === 'CART_PRODUCT' || section.sectionKey?.toUpperCase() === 'PRODUCT_CARD') {
      return bffAdapter.toCartProduct(section)
    }
    if (section.sectionType?.toUpperCase() === 'CART_BANNER') {
      return bffAdapter.toCartBanner(section)
    }
    if (section.sectionType?.toUpperCase() === 'CART_SUMMARY' || section.sectionKey?.toUpperCase() === 'CART_SUMMARY') {
      return bffAdapter.toCartSummary(section)
    }
    if (section.sectionType?.toUpperCase() === 'CART_CHECKOUT' || section.sectionKey?.toUpperCase() === 'CART_CHECKOUT') {
      return bffAdapter.toCartCheckout(section)
    }
    if (section.sectionType?.toUpperCase() === 'PROFILE_BANNER' || section.sectionKey?.toUpperCase() === 'PROFILE_BANNER') {
      return bffAdapter.toProfileBanner(section)
    }
    if (section.sectionType?.toUpperCase() === 'PROFILE_LIST' || section.sectionKey?.toUpperCase() === 'PROFILE_LIST') {
      return bffAdapter.toProfileList(section)
    }
    switch (section.sectionKey) {
      case 'HOME_HERO_CAROUSEL':
        return bffAdapter.toHeroBanner(section)

      case 'HOME_CATEGORY_GRID':
        return bffAdapter.toCategoryGrid(section)

      case 'HOME_NEW_ARRIVALS':
      case 'CATEGORY_PRODUCTS_SHELF':
        return bffAdapter.toProductGrid(section)

      case 'HOMEPAGE_NEW_DROP':
        return bffAdapter.toNewDrop(section)

      case 'HOMEPAGE_EXCLUSIVE_OFFERS':
        return bffAdapter.toGifBanner(section)

      case 'STYLE_SPOTLIGHT':
        return bffAdapter.toStyleSpotlight(section)

      case 'HOME_LOOKBOOK_GRID':
        return bffAdapter.toEditorialLookbook(section)

      case 'COLLECTIONS_SHOWCASE':
        return bffAdapter.toCategoryShowcase(section)

      case 'FEATURED_COLLECTION':
        return bffAdapter.toFeaturedCollection(section)

      case 'SERVICE_OFFERING':
        return bffAdapter.toValueProps(section)

      case 'TRENDING_SHOWCASE':
        return bffAdapter.toTrendsCollage(section)

      case 'DEALS_SHOWCASE':
        return bffAdapter.toIrresistibleDeals(section)

      case 'THE_ROTATION':
        return bffAdapter.toTheRotation(section)

      default:
        console.warn(`[bffAdapter] No adapter match for sectionKey: ${section.sectionKey}`)
        return null
    }
  },

  toHeroBanner: (section: Section): BannerWidget => {
    const items = section.items ?? []
    const slides = items.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl || '',
      action: mapBffAction(item.redirectType, item.redirectValue),
      title: item.title || '',
      subtitle: item.subtitle || '',
    }))

    const firstItem = items[0]
    const overlayTitle = firstItem?.title || (section.configJson?.overlayTitle as string) || section.title || 'BEYOND'
    const overlaySubtitle = firstItem?.subtitle || (section.configJson?.overlaySubtitle as string) || section.subtitle || 'ORDINARY'

    const overlay = firstItem
      ? {
          subtitle: overlaySubtitle,
          title: overlayTitle.replace(/\.\s+/g, '.\n'),
          ctaText: (firstItem.metadataJson?.buttonText as string) || 'SHOP NOW',
          action: mapBffAction(firstItem.redirectType, firstItem.redirectValue),
        }
      : undefined

    const searchBar =
      section.sectionKey === 'HOME_HERO_CAROUSEL'
        ? {
            placeholder: 'Search for',
            rotatingKeywords: ['T Shirt', 'Jackets', 'Sneakers', 'Denim'],
            rotationInterval: 3000,
            action: { type: 'NAVIGATE_TO_SEARCH' as const, payload: {} },
          }
        : undefined

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'HERO_BANNER',
      order: section.sortOrder,
      data: { slides, fullScreen: true, searchBar, overlay },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as BannerWidget
  },

  toCartProduct: (section: Section): CartProductWidget => {
    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'CART_PRODUCT',
      order: section.sortOrder,
      data: {
        title: section.title || '',
        subtitle: section.subtitle || '',
        overlayingTexts: (section.configJson?.overlayingTexts as string[]) || [],
        overlayingTitle: (section.configJson?.overlayingTitle as string) || '',
        backgroundMediaType: (section.configJson?.backgroundMediaType as string) || 'IMAGE',
        backgroundMediaValue: (section.configJson?.backgroundMediaValue as string) || '',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    }
  },

  toCartBanner: (section: Section): CartBannerWidget => {
    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'CART_BANNER',
      order: section.sortOrder,
      data: {
        title: section.title || '',
        couponCode: (section.configJson?.couponCode as string) || 'BOGO',
        couponBenefit: (section.configJson?.couponBenefit as string) || 'Save ₹50',
        viewMoreText: (section.configJson?.viewMoreText as string) || 'View More Details',
        viewAllText: (section.configJson?.viewAllText as string) || 'VIEW ALL',
        isViewAllEnabled: section.configJson?.isViewAllEnabled !== false,
        buttonText: (section.configJson?.buttonText as string) || 'Apply',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    }
  },

  toCartSummary: (section: Section): CartSummaryWidget => {
    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'CART_SUMMARY',
      order: section.sortOrder,
      data: {
        title: section.title || 'Order Summary',
        subtotal: (section.configJson?.subtotal as string) || '2,799',
        discount: (section.configJson?.discount as string) || '1,800',
        shipping: (section.configJson?.shipping as string) || 'To Be Calculated at Checkout',
        grandTotal: (section.configJson?.grandTotal as string) || '999',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    }
  },

  toCartCheckout: (section: Section): CartCheckoutWidget => {
    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'CART_CHECKOUT',
      order: section.sortOrder,
      data: {
        title: section.title || 'Checkout',
        price: (section.configJson?.price as string) || '999',
        priceLabel: (section.configJson?.priceLabel as string) || 'Inc. of all taxes',
        buttonText: (section.configJson?.buttonText as string) || 'CHECKOUT',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    }
  },

  toProfileBanner: (section: Section): ProfileBannerWidget => {
    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'PROFILE_BANNER',
      order: section.sortOrder,
      data: {
        title: section.title || 'POWERLOOK',
        subtitle: (section.configJson?.subtitle as string) || 'WELCOME TO',
        logoUrl: (section.configJson?.logoUrl as string) || '',
        backgroundMediaType: (section.configJson?.backgroundMediaType as string) || 'IMAGE',
        backgroundMediaValue: (section.configJson?.backgroundMediaValue as string) || '',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    }
  },

  toProfileList: (section: Section): ProfileListWidget => {
    const config = section.configJson ?? {};
    const overlayingTexts = (config.overlayingTexts as string[]) || [];

    let items: ProfileListItem[] = [];
    let moreItems: ProfileListItem[] = [];

    const sectionItems = section.items ?? [];

    if (sectionItems.length > 0) {
      if (section.subtitle && sectionItems.length > 5) {
        const firstGroup = sectionItems.slice(0, 5);
        const secondGroup = sectionItems.slice(5);
        items = firstGroup.map((item) => ({
          id: item.id,
          title: item.title || 'Navigation Item',
          icon: item.subtitle || '',
          url: item.redirectValue || '',
        }));
        moreItems = secondGroup.map((item) => ({
          id: item.id,
          title: item.title || 'Navigation Item',
          icon: item.subtitle || '',
          url: item.redirectValue || '',
        }));
      } else {
        items = sectionItems.map((item) => ({
          id: item.id,
          title: item.title || 'Navigation Item',
          icon: item.subtitle || '',
          url: item.redirectValue || '',
        }));
      }
    } else if (overlayingTexts.length > 0) {
      const firstGroup = overlayingTexts.slice(0, 5);
      const secondGroup = overlayingTexts.slice(5);

      items = firstGroup.map((text, idx) => ({
        id: `item_1_${idx}`,
        title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: text,
        url: "",
      }));

      if (section.subtitle && secondGroup.length > 0) {
        moreItems = secondGroup.map((text, idx) => ({
          id: `item_2_${idx}`,
          title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
          icon: text,
          url: "",
        }));
      } else if (secondGroup.length > 0) {
        items = [...items, ...secondGroup.map((text, idx) => ({
          id: `item_1_${idx + 5}`,
          title: text.replace(/\b\w/g, (c) => c.toUpperCase()),
          icon: text,
          url: "",
        }))];
      }
    } else {
      items = [];
    }

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'PROFILE_LIST',
      order: section.sortOrder,
      data: {
        title: section.title || 'MY ACCOUNT',
        subtitle: section.subtitle || undefined,
        items,
        moreItems: moreItems.length > 0 ? moreItems : undefined,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    };
  },

  toCategoryGrid: (section: Section): CollectionGridWidget => {
    const items = section.items ?? []
    const gridItems = items.map((item) => {
      const resolvedCollection = (item as any).resolved as any

      let resolvedImage = ''
      if (resolvedCollection?.image) {
        if (typeof resolvedCollection.image === 'string') {
          resolvedImage = resolvedCollection.image
        } else if (typeof resolvedCollection.image === 'object') {
          resolvedImage = resolvedCollection.image.url || resolvedCollection.image.src || ''
        }
      }

      const imageUrl = item.mobileImageUrl || item.imageUrl || resolvedImage || ''

      return {
        id: item.id,
        title: item.title || resolvedCollection?.title || '',
        imageUrl,
        action: mapBffAction(item.redirectType, item.redirectValue),
      }
    })

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'COLLECTION_GRID',
      order: section.sortOrder,
      title: section.title || '',
      subtitle: section.subtitle || '',
      data: {
        items: gridItems,
        columns: (section.configJson?.columns as number) || 3,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as CollectionGridWidget
  },

  toProductGrid: (section: Section): ProductGridWidget => {
    const items = section.items ?? []
    const products: any[] = []
    const filters: FilterItem[] = []
    const uniqueProductsMap = new Map<string, any>()

    const hasCollections = items.some((item) => item.referenceType === 'COLLECTION')

    if (hasCollections) {
      filters.push({ key: 'all', label: 'All' })

      items.forEach((item) => {
        if (item.referenceType === 'COLLECTION' && (item as any).resolved) {
          const resolvedCollection = (item as any).resolved as any
          const handle = resolvedCollection.handle || item.id

          let label = item.title || resolvedCollection.title || ''
          if (label === 'New Arrivals') {
            label = 'All'
          } else {
            label = label
              .replace('Trending Now', 'Trending')
              .replace('Best Sellers', 'Best Seller')
              .replace('Jackets/View All', 'Jackets')
              .replace('New Arrivals/T-Shirts', 'T-Shirts')
          }

          if (handle !== 'new-arrivals') {
            filters.push({ key: handle, label })
          }

          if (Array.isArray(resolvedCollection.products)) {
            resolvedCollection.products.forEach((prod: any) => {
              const productId = prod.id
              if (!uniqueProductsMap.has(productId)) {
                uniqueProductsMap.set(productId, {
                  resolvedProd: prod,
                  itemSource: item,
                  filterKeys: ['all'],
                })
              }
              const existing = uniqueProductsMap.get(productId)
              if (handle !== 'new-arrivals') {
                existing.filterKeys.push(handle)
              }
            })
          }
        }
      })

      uniqueProductsMap.forEach((val) => products.push(val))
    } else {
      items.forEach((item) => {
        if (item.referenceType === 'PRODUCT' && (item as any).resolved) {
          products.push({ itemSource: item, resolvedProd: (item as any).resolved })
        }
      })
    }

    const mappedProducts: WidgetProductItem[] = products.map(
      ({ itemSource, resolvedProd, filterKeys }) =>
        mapResolvedProduct(resolvedProd, itemSource, section.title, filterKeys),
    )

    const viewAllAction = mapBffAction(
      (section.configJson?.viewAllRedirectType as string) || 'COLLECTION',
      (section.configJson?.viewAllRedirectValue as string) ||
        (section.configJson?.collectionHandle as string) ||
        'new-arrivals',
    )

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'PRODUCT_GRID',
      order: section.sortOrder,
      title: section.title || '',
      subtitle: section.subtitle || '',
      data: {
        products: mappedProducts,
        columns: (section.configJson?.columns as number) || 2,
        scrollDirection: 'horizontal',
        cardWidth: (section.configJson?.cardWidth as number) || 160,
        viewAllAction,
        filters: filters.length > 2 ? filters : undefined,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as ProductGridWidget
  },

  toEditorialLookbook: (section: Section): EditorialLookbookWidget => {
    const items = section.items ?? []
    const firstItem = items[0]
    const remainingItems = items.slice(1)

    const backgroundImageUrl =
      (firstItem?.metadataJson?.backgroundMediaValue as string) ||
      firstItem?.imageUrl ||
      firstItem?.mobileImageUrl ||
      ''

    const overlayingTexts: string[] =
      (firstItem?.metadataJson?.overlayingTexts as string[]) || []

    const title = overlayingTexts[0] || section.title || firstItem?.title || ''
    const promoText = overlayingTexts[1] || firstItem?.subtitle || ABSENT_VALUE

    const promoAction = firstItem
      ? mapBffAction(firstItem.redirectType, firstItem.redirectValue)
      : undefined

    const promoTag = firstItem
      ? { text: promoText, action: promoAction }
      : undefined

    const blocks = remainingItems.map((item) => ({
      title: item.title || '',
      imageUrl: item.imageUrl || item.mobileImageUrl || '',
      action: mapBffAction(item.redirectType, item.redirectValue),
    }))

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'EDITORIAL_LOOKBOOK',
      order: section.sortOrder,
      data: { title, backgroundImageUrl, promoTag, blocks },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as EditorialLookbookWidget
  },

  toNewDrop: (section: Section): NewDropWidget => {
    const items = section.items ?? []
    const dropItems: any[] = []

    items.forEach((item) => {
      const ctaText =
        (item.metadataJson?.buttonText as string) ||
        (section.configJson?.buttonText as string) ||
        'SHOP NOW'
      const watermarkText = 'NEW DROP'

      if (item.referenceType === 'COLLECTION' && (item as any).resolved) {
        const resolvedCollection = (item as any).resolved as any
        if (Array.isArray(resolvedCollection.products)) {
          resolvedCollection.products.forEach((product: any) => {
            const priceValue = parseFloat(product.price?.amount || '0')
            const imageUrl =
              product.featuredImage?.url || product.images?.[0]?.url || ''
            dropItems.push({
              id: product.id,
              watermarkText,
              imageUrl,
              priceLabel: 'GET IT FOR',
              priceValue,
              ctaText,
              action: {
                type: 'NAVIGATE_TO_PRODUCT',
                payload: { id: product.handle || product.gid || product.id },
              },
            })
          })
        }
      } else if (item.referenceType === 'PRODUCT' && (item as any).resolved) {
        const product = (item as any).resolved as any
        const priceValue = parseFloat(product.price?.amount || '0')
        const imageUrl =
          product.featuredImage?.url || product.images?.[0]?.url || ''
        dropItems.push({
          id: product.id,
          watermarkText,
          imageUrl,
          priceLabel: 'GET IT FOR',
          priceValue,
          ctaText,
          action: {
            type: 'NAVIGATE_TO_PRODUCT',
            payload: { id: product.handle || product.gid || product.id },
          },
        })
      }
    })

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'NEW_DROP',
      order: section.sortOrder,
      title: '',
      subtitle: '',
      data: { items: dropItems, paginationStyle: 'dots' },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as NewDropWidget
  },

  toGifBanner: (section: Section): GifBannerWidget => {
    const items = section.items ?? []
    const firstItem = items[0]

    const gifUrl =
      (firstItem?.metadataJson?.backgroundMediaValue as string) ||
      firstItem?.imageUrl ||
      firstItem?.mobileImageUrl ||
      ''

    let aspectRatio = 0.85
    const ratioStr = section.configJson?.aspectRatio
    if (ratioStr && typeof ratioStr === 'string' && ratioStr.includes(':')) {
      const [w, h] = (ratioStr as string).split(':').map(Number)
      if (w && h) aspectRatio = w / h
    }

    const redirectType =
      firstItem?.redirectType ||
      (section.configJson?.viewAllRedirectType as string) ||
      'COLLECTION'
    const redirectValue =
      firstItem?.redirectValue ||
      (section.configJson?.viewAllRedirectValue as string) ||
      (section.configJson?.collectionHandle as string) ||
      ''

    const action = mapBffAction(redirectType, redirectValue)

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'GIF_BANNER',
      order: section.sortOrder,
      title:
        section.configJson?.showSectionTitle !== false ? section.title || '' : '',
      subtitle: section.subtitle || '',
      data: {
        gifUrl,
        aspectRatio,
        action,
        titleColor:
          (section.configJson?.sectionTitleColor as string) || 'color-text-primary',
        titleVariant: 'bebas_h3.regular',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as GifBannerWidget
  },

  toStyleSpotlight: (section: Section): StyleSpotlightWidget => {
    const config = section.configJson || {}

    const imageUrl = (config.backgroundMediaValue as string) || ''
    const redirectType =
      (config.redirectType as string) || (config.viewAllRedirectType as string) || 'COLLECTION'
    const redirectValue =
      (config.redirectValue as string) || (config.viewAllRedirectValue as string) || 'new-arrivals'
    const action = mapBffAction(redirectType, redirectValue)

    let aspectRatio = 0.75
    const ratioStr = config.aspectRatio
    if (ratioStr && typeof ratioStr === 'string' && ratioStr.includes(':')) {
      const [w, h] = (ratioStr as string).split(':').map(Number)
      if (w && h) aspectRatio = w / h
    }

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'STYLE_SPOTLIGHT',
      order: section.sortOrder,
      title: section.title || '',
      subtitle: section.subtitle || '',
      data: {
        imageUrl,
        buttonText: (config.buttonText as string) || 'VIEW ALL',
        aspectRatio,
        action,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as StyleSpotlightWidget
  },

  toCategoryShowcase: (section: Section): CategoryShowcaseWidget => {
    const items = section.items ?? []
    const item = items[0]
    const resolvedCollection = (item as any)?.resolved as any
    const config = section.configJson ?? {}

    const rawTitle = item?.title || resolvedCollection?.title || ''
    const categoryName = rawTitle.split('/')[0] || 'Bottoms'
    const productCountText = `${resolvedCollection?.productCount || 0} Products`

    const bannerImageUrl =
      item?.imageUrl || item?.mobileImageUrl || resolvedCollection?.image?.url || ''

    const action = mapBffAction(
      item?.redirectType || 'COLLECTION',
      item?.redirectValue ||
        resolvedCollection?.handle ||
        't-shirts-printed-t-shirts',
    )

    const mappedProducts: WidgetProductItem[] = (
      resolvedCollection?.products || []
    ).map((resolvedProd: any) =>
      mapResolvedProduct(resolvedProd, item, section.title),
    )

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'CATEGORY_SHOWCASE',
      order: section.sortOrder,
      data: {
        categoryName,
        productCountText,
        bannerImageUrl,
        products: mappedProducts,
        action,
        viewAllAction: action,
        buttonText: config.buttonText as string | undefined,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as CategoryShowcaseWidget
  },

  toFeaturedCollection: (section: Section): FeaturedCollectionWidget => {
    const items = section.items ?? []
    const firstItem = items[0]
    const overlayingTexts =
      (section.configJson?.overlayingTexts as string[]) ||
      (firstItem?.metadataJson?.overlayingTexts as string[]) || []

    const title = overlayingTexts[0] || section.title || 'THE COLLECTIVES'
    const subtitle = overlayingTexts[1] || section.subtitle || 'GET THE VIBE'
    const rawBadge = overlayingTexts[2]

    let badgeText = '₹799'
    if (rawBadge) {
      const match = rawBadge.match(/\d+/)
      badgeText = match ? `₹${match[0]}` : rawBadge
    }

    const heroImageUrl =
      (section.configJson?.backgroundMediaValue as string) ||
      (firstItem?.metadataJson?.backgroundMediaValue as string) ||
      firstItem?.imageUrl ||
      firstItem?.mobileImageUrl ||
      undefined

    const action = firstItem
      ? mapBffAction(firstItem.redirectType, firstItem.redirectValue)
      : undefined

    const gridItems = items.slice(1, 9).map((item) => ({
      id: item.id,
      imageUrl:
        item.imageUrl ||
        (item.metadataJson?.backgroundMediaValue as string) ||
        item.mobileImageUrl ||
        '',
      title: item.title || '',
      label: item.title || '',
      action: mapBffAction(item.redirectType, item.redirectValue),
    }))

    const viewAllAction = mapBffAction(
      (section.configJson?.viewAllRedirectType as string) || 'COLLECTION',
      (section.configJson?.viewAllRedirectValue as string) || 'the-collectives',
    )

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'FEATURED_COLLECTION',
      order: section.sortOrder,
      data: {
        title,
        subtitle,
        badgeText,
        heroImageUrl,
        action,
        viewAllAction,
        items: gridItems,
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as FeaturedCollectionWidget
  },

  toValueProps: (section: Section): ValuePropsWidget => {
    const items = section.items ?? []
    const firstItem = items[0]
    const rawTitle = firstItem?.title || 'WHAT EXTRA DO WE OFFER'
    const backgroundImageUrl =
      (firstItem?.metadataJson?.backgroundMediaValue as string) ||
      firstItem?.imageUrl ||
      firstItem?.mobileImageUrl ||
      undefined

    const rawTexts: string[] =
      (firstItem?.metadataJson?.overlayingTexts as string[]) || []

    const valueItems = rawTexts.map((text, index) => {
      const textLower = text.toLowerCase()
      let iconName = 'heart'
      if (textLower.includes('free shipping')) iconName = 'truck'
      else if (textLower.includes('order dispatch')) iconName = 'clock'
      else if (textLower.includes('trusted by')) iconName = 'heart'

      return { id: `val_prop_${index}`, iconName, title: text, subtitle: '' }
    })

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'VALUE_PROPS',
      order: section.sortOrder,
      data: { title: rawTitle, backgroundImageUrl, items: valueItems },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as ValuePropsWidget
  },

  toTrendsCollage: (section: Section): TrendsCollageWidget => {
    const items = section.items ?? []
    const item = items[0]
    const resolvedCollection = (item as any)?.resolved as any

    const gridImageUrl =
      item?.imageUrl ||
      item?.mobileImageUrl ||
      (item?.metadataJson?.backgroundMediaValue as string) ||
      resolvedCollection?.image?.url ||
      ''

    const action = mapBffAction(
      item?.redirectType || item?.referenceType || 'COLLECTION',
      item?.redirectValue ||
        resolvedCollection?.handle ||
        item?.referenceId ||
        'trending-now',
    )

    const viewAllAction = mapBffAction(
      (section.configJson?.viewAllRedirectType as string) ||
        item?.redirectType ||
        item?.referenceType ||
        'COLLECTION',
      (section.configJson?.viewAllRedirectValue as string) ||
        item?.redirectValue ||
        resolvedCollection?.handle ||
        item?.referenceId ||
        'trending-now',
    )

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'TRENDS_COLLAGE',
      order: section.sortOrder,
      title: section.title || item?.title || '',
      subtitle: section.subtitle || item?.subtitle || '',
      data: { gridImageUrl, action, viewAllAction },
      styles: {
        backgroundColor:
          section.backgroundColor ||
          (section.configJson?.backgroundColor as string) ||
          undefined,
      },
    } as TrendsCollageWidget
  },

  toIrresistibleDeals: (section: Section): IrresistibleDealsWidget | null => {
    const items = section.items ?? []
    const collectionItem = items.find(
      (item) => item.referenceType === 'COLLECTION' && (item as any).resolved,
    )

    const resolvedCollection = (collectionItem as any)?.resolved as any
    const resolvedProducts: any[] = Array.isArray(resolvedCollection?.products)
      ? resolvedCollection.products
      : []

    if (resolvedProducts.length === 0) return null

    const ctaText = collectionItem?.metadataJson?.buttonText as string | undefined
    const productLimit = collectionItem?.metadataJson?.productLimit

    const dealItems = resolvedProducts
      .slice(0, typeof productLimit === 'number' && productLimit > 0 ? productLimit : resolvedProducts.length)
      .map((product: any) => {
        const priceText =
          ctaText ||
          product.price?.formatted ||
          (product.price?.amount ? `GET IT FOR ₹${product.price.amount}` : '')

        return {
          id: product.id,
          imageUrl: product.featuredImage?.url || product.images?.[0]?.url || '',
          priceText,
          action: {
            type: 'NAVIGATE_TO_PRODUCT' as const,
            payload: { id: product.id },
          },
        }
      })
      .filter(
        (item: { imageUrl: string; priceText: string }) =>
          Boolean(item.imageUrl) && Boolean(item.priceText),
      )

    if (dealItems.length === 0) return null

    const heroImageUrl =
      (section.configJson?.backgroundMediaValue as string) ||
      collectionItem?.imageUrl ||
      collectionItem?.mobileImageUrl ||
      undefined

    const rotatingTexts = [
      section.subtitle,
      collectionItem?.metadataJson?.buttonText as string | undefined,
    ].filter((text): text is string => typeof text === 'string' && text.length > 0)

    const viewAllRedirectValue =
      collectionItem?.redirectValue ||
      resolvedCollection?.handle ||
      collectionItem?.referenceId ||
      undefined

    const viewAllAction = viewAllRedirectValue
      ? mapBffAction('COLLECTION', viewAllRedirectValue)
      : undefined

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'IRRESISTIBLE_DEALS',
      order: section.sortOrder,
      title: section.title || '',
      subtitle: section.subtitle || '',
      data: {
        heroImageUrl,
        rotatingTexts,
        items: dealItems,
        viewAllAction,
        fullWidthHero: section.layoutType === 'FULL_WIDTH',
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as IrresistibleDealsWidget
  },

  /**
   * Adapts a section for which no specific mapping exists into a generic
   * TheRotation-style widget. Used as a fallback by the pipeline.
   */
  toTheRotation: (section: Section): TheRotationWidget => {
    const items = section.items ?? []
    const config = section.configJson ?? {}
    
    const heroImageUrl = (config.backgroundMediaValue as string) || undefined

    const products = items.map((item) => {
      const resolved = (item as any).resolved as any
      return {
        id: item.id,
        imageUrl: resolved?.featuredImage?.url || resolved?.images?.[0]?.url || item.imageUrl || '',
        priceText: `GET IT FOR ₹${parseFloat(resolved?.price?.amount || '0').toFixed(0)}`,
        action: mapBffAction(item.redirectType, item.redirectValue),
      }
    })

    const overlayingTexts = Array.isArray(config.overlayingTexts) ? config.overlayingTexts : []
    const taglines = overlayingTexts.length > 0 ? overlayingTexts : ['EXPLOSIVE', 'DRAMA', 'STYLISH']

    return {
      id: section.id || `${section.sectionKey}_${section.sortOrder}`,
      widgetType: 'THE_ROTATION',
      order: section.sortOrder,
      data: {
        heroImageUrl: heroImageUrl || section.backgroundImage || undefined,
        title: section.title || 'THE ROTATION',
        subtitle: (config.overlayingTitle as string) || section.subtitle || 'POWERLOOK PRESENTS',
        taglines,
        products,
        viewAllAction: mapBffAction(
          (section.configJson?.viewAllRedirectType as string) || 'COLLECTION',
          (section.configJson?.viewAllRedirectValue as string) || '',
        ),
      },
      styles: { backgroundColor: section.backgroundColor ?? undefined },
    } as TheRotationWidget
  },
}
