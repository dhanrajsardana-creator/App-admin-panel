import type { CreateSectionPayload } from "@/types";

/**
 * The full Figma "Powerlook App" homepage structure, expressed as editable CMS
 * sections. Loading this replaces the Home page's sections so the preview shows
 * the Figma design — and every block stays editable via the right panel.
 *
 * Renderers fall back to Figma-accurate defaults when a section has no items,
 * so the page looks right immediately; the admin can then attach real content.
 */
type TemplateSection = Omit<CreateSectionPayload, "sectionKey" | "sortOrder">;

const SECTIONS: TemplateSection[] = [
  {
    sectionType: "offer_strip",
    title: "End of Season Sale — Up to 60% Off",
    layoutType: "CAROUSEL",
    configJson: {
      autoScroll: true,
      scrollSpeed: 3000,
      showDivider: true,
      dividerChar: "|",
      textColor: "#ffffff",
      paddingVertical: 8,
    },
  },
  {
    sectionType: "hero_carousel",
    title: "",
    layoutType: "FULL_WIDTH",
    configJson: {
      showSearch: true,
      searchPlaceholder: "Search for T Shirt",
      showDots: true,
      overlayOpacity: 0.15,
    },
  },
  {
    sectionType: "mood_grid",
    title: "ARE WE FEELING SMOOTH OR WILD?",
    layoutType: "GRID",
    configJson: { columns: 3 },
  },
  {
    sectionType: "new_drop_products",
    title: "NEW DROP",
    layoutType: "FULL_WIDTH",
    configJson: { priceLabel: "GET IT FOR ₹599", buttonText: "SHOP NOW" },
  },
  {
    sectionType: "exlusive_offers",
    title: "EXCLUSIVE OFFERS",
    layoutType: "FULL_WIDTH",
    configJson: {},
  },
  {
    sectionType: "product_shelf",
    title: "New Arrivals",
    subtitle: "Fresh drops just for you",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, viewAllText: "View All", showMemberPrice: true },
  },
  {
    sectionType: "promo_hero",
    title: "YOUR PERFECT SUMMER VIBE",
    layoutType: "FULL_WIDTH",
    configJson: { subheadingText: "DEALS THAT'S HARD TO RESISTS" },
  },
  {
    sectionType: "category_banner",
    title: "BEYOND ORDINARY",
    layoutType: "FULL_WIDTH",
    configJson: { productCount: "1280 PRODUCTS" },
  },
  {
    sectionType: "product_shelf",
    title: "DROP IT LIKE IT'S HOT",
    subtitle: "The hottest styles, picked for your vibe",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, showMemberPrice: true },
  },
  {
    sectionType: "category_banner",
    title: "TOPWEAR",
    layoutType: "FULL_WIDTH",
    configJson: { productCount: "640 PRODUCTS" },
  },
  {
    sectionType: "product_shelf",
    title: "T-Shirts",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, viewAllText: "View All T-Shirts", showMemberPrice: true },
  },
  {
    sectionType: "shop_the_look",
    title: "SHOP THE LOOK",
    layoutType: "FULL_WIDTH",
    configJson: { showMemberPrice: true },
  },
  {
    sectionType: "product_shelf",
    title: "Shirts",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, showMemberPrice: true },
  },
  {
    sectionType: "category_banner",
    title: "BOTTOMS",
    layoutType: "FULL_WIDTH",
    configJson: { productCount: "1280 PRODUCTS" },
  },
  {
    sectionType: "product_shelf",
    title: "Denim",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, viewAllText: "View All Denims", showMemberPrice: true },
  },
  {
    sectionType: "product_shelf",
    title: "Textured Polos",
    layoutType: "CAROUSEL",
    configJson: { maxItems: 6, showViewAll: true, showMemberPrice: true },
  },
  {
    sectionType: "category_banner",
    title: "STREET WEAR",
    layoutType: "FULL_WIDTH",
    configJson: { productCount: "420 PRODUCTS" },
  },
  {
    sectionType: "services_information",
    title: "Why Powerlook",
    layoutType: "FULL_WIDTH",
    configJson: {},
  },
];

/** Materialise the template into create-payloads with keys + sort order. */
export function buildFigmaHomeTemplate(): CreateSectionPayload[] {
  return SECTIONS.map((s, i) => ({
    ...s,
    sectionKey: `figma_${String(i + 1).padStart(2, "0")}_${s.sectionType}`,
    sortOrder: i,
  }));
}
