// ============================================================================
// Static Pages domain types — modeled from the API spec.
// ============================================================================

export type StaticPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type StaticPagePlatform = "MOBILE" | "WEB" | "BOTH";
export type StaticPageType =
  | "ABOUT_US"
  | "PRIVACY_POLICY"
  | "TERMS_AND_CONDITIONS"
  | "REFUND_POLICY"
  | "SHIPPING_POLICY"
  | "CONTACT_US"
  | "FAQ"
  | "CUSTOM";

export interface StaticPage {
  id: string;
  pageType: StaticPageType;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content: string;
  platform: StaticPagePlatform;
  status: StaticPageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaticPagePayload {
  pageType: StaticPageType;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: string;
  platform: StaticPagePlatform;
  status?: StaticPageStatus;
}

export type UpdateStaticPagePayload = Partial<{
  title: string;
  content: string;
  status: StaticPageStatus;
  metaTitle: string;
  metaDescription: string;
  platform: StaticPagePlatform;
  slug: string;
}>;
