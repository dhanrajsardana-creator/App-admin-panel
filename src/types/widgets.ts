// ============================================================================
// UIWidget types — ported verbatim from Mobile/react-native-playground/src/mock/index.ts
// These are the SAME types the mobile app uses. The BFF adapter maps BFFSection → UIWidget.
// ============================================================================

export type WidgetType =
  | 'HERO_BANNER'
  | 'PRODUCT_GRID'
  | 'CATEGORY_LIST'
  | 'COLLECTION_GRID'
  | 'FEATURED_COLLECTION'
  | 'INSTAGRAM_GRID'
  | 'EDITORIAL_LOOKBOOK'
  | 'PLACEHOLDER_BLOCK'
  | 'NEW_DROP'
  | 'GIF_BANNER'
  | 'STYLE_SPOTLIGHT'
  | 'TRENDS_COLLAGE'
  | 'IRRESISTIBLE_DEALS'
  | 'CATEGORY_SHOWCASE'
  | 'THE_ROTATION'
  | 'VALUE_PROPS'
  | 'WISHLIST_SHOWCASE'

export interface WidgetStyles {
  backgroundColor?: string
  textColor?: string
  paddingTop?: number
  paddingBottom?: number
  aspectRatio?: string
}

export interface WidgetAction {
  type:
    | 'NAVIGATE_TO_PRODUCT'
    | 'NAVIGATE_TO_COLLECTION'
    | 'OPEN_URL'
    | 'NAVIGATE_TO_SEARCH'
  payload: {
    id?: string
    url?: string
    query?: string
  }
}

export interface BaseWidget {
  id: string
  widgetType: WidgetType
  order?: number
  enabled?: boolean
  title?: string
  subtitle?: string
  viewAllUrl?: string
  styles?: WidgetStyles
}

// ── Hero Banner ──────────────────────────────────────────────────────────────

export interface HeroBannerSearchBar {
  placeholder: string
  rotatingKeywords: string[]
  rotationInterval?: number
  action?: WidgetAction
}

export interface HeroBannerOverlay {
  text?: string
  subtitle?: string
  title?: string
  ctaText?: string
  action?: WidgetAction
}

export interface HeroBannerSlide {
  imageUrl?: string
  imageAltText?: string
  action?: WidgetAction
  title?: string
  subtitle?: string
}

export interface BannerWidget extends BaseWidget {
  widgetType: 'HERO_BANNER' | 'EDITORIAL_LOOKBOOK'
  data: {
    slides: HeroBannerSlide[]
    fullScreen?: boolean
    searchBar?: HeroBannerSearchBar
    overlay?: HeroBannerOverlay
  }
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface WidgetProductItem {
  id: string
  title?: string
  price?: number
  originalPrice?: number
  discountPercentage?: number
  memberPrice?: number
  imageUrl?: string
  badge?: string
  tags?: string[]
  isFavorite?: boolean
  isMemberHighlight?: boolean
  action?: WidgetAction
}

export interface FilterItem {
  label: string
  key: string
}

export interface ProductGridWidget extends BaseWidget {
  widgetType: 'PRODUCT_GRID'
  data: {
    products: WidgetProductItem[]
    columns?: number
    scrollDirection?: 'horizontal' | 'vertical'
    cardWidth?: number
    viewAllAction?: WidgetAction
    filters?: FilterItem[]
  }
}

// ── Featured Collection ───────────────────────────────────────────────────────

export interface GridItem {
  id: string
  imageUrl?: string
  title?: string
  label?: string
  action: WidgetAction
}

export interface FeaturedCollectionWidget extends BaseWidget {
  widgetType: 'FEATURED_COLLECTION'
  data: {
    badgeText?: string
    heroImageUrl?: string
    title: string
    subtitle?: string
    action?: WidgetAction
    viewAllAction?: WidgetAction
    items?: GridItem[]
  }
}

// ── Collection Grid ───────────────────────────────────────────────────────────

export interface CollectionGridWidget extends BaseWidget {
  widgetType: 'CATEGORY_LIST' | 'COLLECTION_GRID' | 'INSTAGRAM_GRID'
  data: {
    items: GridItem[]
    columns?: number
  }
}

// ── New Drop ──────────────────────────────────────────────────────────────────

export interface NewDropItem {
  id: string
  watermarkText?: string
  imageUrl?: string
  priceLabel?: string
  priceValue?: number
  priceText?: string
  ctaText?: string
  action?: WidgetAction
}

export interface NewDropWidget extends BaseWidget {
  widgetType: 'NEW_DROP'
  data: {
    items: NewDropItem[]
    paginationStyle?: 'dots' | 'numeric'
  }
}

// ── GIF Banner ───────────────────────────────────────────────────────────────

export interface GifBannerWidget extends BaseWidget {
  widgetType: 'GIF_BANNER'
  data: {
    gifUrl?: string
    aspectRatio?: number
    action?: WidgetAction
    titleColor?: string
    titleVariant?: string
  }
}

// ── Style Spotlight ───────────────────────────────────────────────────────────

export interface StyleSpotlightWidget extends BaseWidget {
  widgetType: 'STYLE_SPOTLIGHT'
  data: {
    imageUrl: string
    buttonText: string
    aspectRatio?: number
    action?: WidgetAction
  }
}

// ── Editorial Lookbook ────────────────────────────────────────────────────────

export interface LookbookPromoBlock {
  title: string
  imageUrl?: string
  action: WidgetAction
}

export interface EditorialLookbookWidget extends BaseWidget {
  widgetType: 'EDITORIAL_LOOKBOOK'
  data: {
    backgroundImageUrl?: string
    title: string
    promoTag?: {
      text: string
      action?: WidgetAction
    }
    blocks: LookbookPromoBlock[]
  }
}

// ── Trends Collage ────────────────────────────────────────────────────────────

export interface TrendsCollageWidget extends BaseWidget {
  widgetType: 'TRENDS_COLLAGE'
  data: {
    gridImageUrl?: string
    action?: WidgetAction
    viewAllAction?: WidgetAction
  }
}

// ── Irresistible Deals ────────────────────────────────────────────────────────

export interface IrresistibleDealItem {
  id: string
  imageUrl?: string
  priceText: string
  action?: WidgetAction
}

export interface IrresistibleDealsWidget extends BaseWidget {
  widgetType: 'IRRESISTIBLE_DEALS'
  data: {
    heroImageUrl?: string
    rotatingTexts: string[]
    items: IrresistibleDealItem[]
    viewAllAction?: WidgetAction
    fullWidthHero?: boolean
  }
}

// ── Category Showcase ─────────────────────────────────────────────────────────

export interface CategoryShowcaseWidget extends BaseWidget {
  widgetType: 'CATEGORY_SHOWCASE'
  data: {
    categoryName: string
    productCountText: string
    bannerImageUrl?: string
    products: WidgetProductItem[]
    action?: WidgetAction
    viewAllAction?: WidgetAction
    buttonText?: string
  }
}

// ── Value Props ───────────────────────────────────────────────────────────────

export interface ValuePropItem {
  id: string
  iconName: string
  title: string
  subtitle: string
}

export interface ValuePropsWidget extends BaseWidget {
  widgetType: 'VALUE_PROPS'
  data: {
    backgroundImageUrl?: string
    title: string
    items: ValuePropItem[]
  }
}

// ── The Rotation ──────────────────────────────────────────────────────────────

export interface RotationProductItem {
  id: string
  imageUrl?: string
  priceText: string
  action?: WidgetAction
}

export interface TheRotationWidget extends BaseWidget {
  widgetType: 'THE_ROTATION'
  data: {
    heroImageUrl?: string
    title: string
    subtitle: string
    taglines: string[]
    viewAllAction?: WidgetAction
    products: RotationProductItem[]
  }
}

// ── Placeholder Block ─────────────────────────────────────────────────────────

export interface PlaceholderBlockWidget extends BaseWidget {
  widgetType: 'PLACEHOLDER_BLOCK'
  data: {
    height: number
    label: string
    backgroundColor?: string
  }
}

export interface CartProductWidget {
  id: string
  widgetType: 'CART_PRODUCT'
  order: number
  data: {
    title: string
    subtitle?: string
    overlayingTexts: string[]
    overlayingTitle: string
    backgroundMediaType: string
    backgroundMediaValue: string
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

export interface CartBannerWidget {
  id: string
  widgetType: 'CART_BANNER'
  order: number
  data: {
    title: string
    couponCode: string
    couponBenefit: string
    viewMoreText: string
    viewAllText: string
    isViewAllEnabled: boolean
    buttonText: string
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

export interface CartSummaryWidget {
  id: string
  widgetType: 'CART_SUMMARY'
  order: number
  data: {
    title: string
    subtotal: string
    discount: string
    shipping: string
    grandTotal: string
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

export interface CartCheckoutWidget {
  id: string
  widgetType: 'CART_CHECKOUT'
  order: number
  data: {
    title: string
    price: string
    priceLabel: string
    buttonText: string
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

export interface ProfileBannerWidget {
  id: string
  widgetType: 'PROFILE_BANNER'
  order: number
  data: {
    title: string
    subtitle: string
    logoUrl: string
    backgroundMediaType: string
    backgroundMediaValue: string
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

export interface ProfileListItem {
  id: string
  title: string
  icon?: string
  url?: string
}

export interface ProfileListWidget {
  id: string
  widgetType: 'PROFILE_LIST'
  order: number
  data: {
    title: string
    subtitle?: string
    items: ProfileListItem[]
    moreItems?: ProfileListItem[]
  }
  styles?: {
    backgroundColor?: string
    paddingTop?: number
    paddingBottom?: number
  }
}

// ── Master Discriminated Union ────────────────────────────────────────────────

export type UIWidget =
  | BannerWidget
  | ProductGridWidget
  | FeaturedCollectionWidget
  | CollectionGridWidget
  | PlaceholderBlockWidget
  | NewDropWidget
  | GifBannerWidget
  | StyleSpotlightWidget
  | EditorialLookbookWidget
  | TrendsCollageWidget
  | IrresistibleDealsWidget
  | CategoryShowcaseWidget
  | TheRotationWidget
  | ValuePropsWidget
  | CartProductWidget
  | CartBannerWidget
  | CartSummaryWidget
  | CartCheckoutWidget
  | ProfileBannerWidget
  | ProfileListWidget
