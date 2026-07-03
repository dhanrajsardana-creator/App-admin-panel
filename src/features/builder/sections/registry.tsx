import type { ComponentType } from "react";
import type { SectionRendererProps } from "./types";
import {
  BannerSection,
  HeroCarouselSection,
  VideoBannerSection,
  SaleBannerSection,
} from "./BannerSections";
import {
  ProductShelfSection,
  CollectionCarouselSection,
  FeaturedCollectionSection,
} from "./ProductSections";
import { CategoryGridSection, LookbookGridSection } from "./GridSections";
import {
  PromoHeroSection,
  NewDropSection,
  ExclusiveOffersSection,
  MoodGridSection,
  CategoryBannerSection,
  ShopTheLookSection,
} from "./PromoSections";
import {
  OfferStripSection,
  SearchBarSection,
  RichTextSection,
  ServicesSection,
} from "./TextSections";
import { FallbackSection } from "./FallbackSection";

type Renderer = ComponentType<SectionRendererProps>;

/**
 * Dynamic section registry. Keys are lower-cased sectionType values so the
 * lookup tolerates the mixed casing the API returns (BANNER vs offer_strip).
 */
const REGISTRY: Record<string, Renderer> = {
  // Banner family
  banner: BannerSection,
  hero_carousel: HeroCarouselSection,
  new_drop_products: NewDropSection,
  exlusive_offers: ExclusiveOffersSection,
  video_banner: VideoBannerSection,
  sale_banner: SaleBannerSection,
  promo_hero: PromoHeroSection,
  mood_grid: MoodGridSection,
  category_banner: CategoryBannerSection,
  shop_the_look: ShopTheLookSection,
  featured_collection_products: FeaturedCollectionSection,

  // Product family
  product_shelf: ProductShelfSection,
  collection_carousel: CollectionCarouselSection,
  collection_with_products: ProductShelfSection,

  // Grid family
  category_grid: CategoryGridSection,
  lookbook_grid: LookbookGridSection,

  // Text / utility family
  offer_strip: OfferStripSection,
  search_bar: SearchBarSection,
  rich_text: RichTextSection,
  services_information: ServicesSection,
};

export function getSectionRenderer(sectionType: string): Renderer {
  return REGISTRY[sectionType?.toLowerCase()] ?? FallbackSection;
}
