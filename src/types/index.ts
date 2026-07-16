// ============================================================================
// Core CMS domain types — modeled from the live API responses.
// Source of truth hierarchy:  Page -> Section -> Item
// ============================================================================

export type Platform = "MOBILE" | "WEB" | "BOTH";
export type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PageType =
  | "HOME"
  | "COLLECTION"
  | "PRODUCT"
  | "PRODUCT_LISTING"
  | "CART"
  | "ACCOUNT"
  | "LANDING"
  | "CUSTOM";

export type VisibilityType = "MOBILE" | "WEB" | "BOTH" | null;

export type LayoutType =
  | "FULL_WIDTH"
  | "CAROUSEL"
  | "GRID"
  | "TWO_COLUMN"
  | "LIST"
  | string;

// configJson / metadataJson are intentionally open maps — every section type
// uses a different shape and the mobile app reads them verbatim.
export type JsonMap = Record<string, unknown>;

export interface SeoMeta {
  id: string;
  pageId: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

export interface SectionItem {
  id: string;
  sectionId: string;
  itemType: string | null;
  referenceId: string | null;
  referenceType: string | null;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  redirectType: string | null;
  redirectValue: string | null;
  badgeText: string | null;
  metadataJson: JsonMap | null;
  sortOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
  resolved?: any;
}

export interface Section {
  id: string;
  pageId: string;
  sectionKey: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  layoutType: LayoutType;
  sortOrder: number;
  visibilityType: VisibilityType;
  isVisible: boolean;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  configJson: JsonMap;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  // present on mobile responses
  items?: SectionItem[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  pageKey: string;
  platform: Platform;
  title: string | null;
  description: string | null;
  pageType: PageType;
  status: PageStatus;
  isPublished: boolean;
  currentVersion: number;
  publishedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  seo?: SeoMeta | null;
}

// ----------------------------------------------------------------------------
// API envelope
// ----------------------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
}

// ----------------------------------------------------------------------------
// Request payloads
// ----------------------------------------------------------------------------
export interface CreatePagePayload {
  name: string;
  slug: string;
  pageKey: string;
  platform?: Platform;
  pageType?: PageType;
  status?: PageStatus;
  title?: string | null;
  description?: string | null;
}

export type UpdatePagePayload = Partial<CreatePagePayload> & {
  isPublished?: boolean;
};

export interface CreateSectionPayload {
  sectionKey: string;
  sectionType: string | null;
  title?: string | null;
  subtitle?: string | null;
  layoutType: LayoutType;
  visibilityType?: VisibilityType;
  isVisible?: boolean;
  sortOrder: number;
  configJson?: JsonMap;
}

export type UpdateSectionPayload = Partial<{
  title: string | null;
  subtitle: string | null;
  sectionKey: string;
  sectionType: string;
  layoutType: LayoutType;
  visibilityType: VisibilityType;
  isVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  backgroundColor: string | null;
  backgroundImage: string | null;
  configJson: JsonMap;
}>;

export type UpdateItemPayload = Partial<{
  itemType: string | null;
  referenceType: string | null;
  referenceId: string | null;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  redirectType: string | null;
  redirectValue: string | null;
  badgeText: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: JsonMap | null;
}>;

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  shop?: string;
  avatar?: string;
  role?: string;
  [key: string]: unknown;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  shopifyDiscountId: string;
  displayOrder: number;
  isActive: boolean;
  startAt: string;
  endAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateOfferPayload = Omit<Offer, "id" | "createdAt" | "updatedAt">;
export type UpdateOfferPayload = Partial<CreateOfferPayload>;
