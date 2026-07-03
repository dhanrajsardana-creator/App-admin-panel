/**
 * The Figma "Powerlook App" homepage, section by section, assembled from the
 * per-section images cropped out of the Figma export (public/figma-home).
 *
 * Rendered as the Home page body inside the builder's PhoneFrame so the admin
 * preview matches the Figma design exactly, independent of backend section data.
 *
 * Backend Section Mapping (from home-page-structure.txt):
 * 1. Offer Strip - sectionType: "offer_strip" (native BFF component)
 * 2. Hero Banner / Hero Carousel - sectionKey: "HOME_HERO_CAROUSEL" (HeroBanner)
 * 3. Category Grid - sectionKey: "HOME_CATEGORY_GRID" (CollectionGrid)
 * 4. Product Shelf / New Arrivals - sectionKey: "HOME_NEW_ARRIVALS" (ProductGrid)
 * 5. New Drop - sectionKey: "HOMEPAGE_NEW_DROP" (NewDrop)
 * 6. Exclusive Offers / GIF Banner - sectionKey: "HOMEPAGE_EXCLUSIVE_OFFERS" (GifBanner)
 * 7. Style Spotlight - sectionKey: "STYLE_SPOTLIGHT" (StyleSpotlight)
 * 8. Editorial Lookbook - sectionKey: "HOME_LOOKBOOK_GRID" (EditorialLookbook)
 * 9. Category Showcase - sectionKey: "COLLECTIONS_SHOWCASE" (CategoryShowcase)
 * 10. Featured Collection - sectionKey: "FEATURED_COLLECTION" (FeaturedCollection)
 * 11. Value Props / Service Offering - sectionKey: "SERVICE_OFFERING" (ValueProps)
 * 12. Trends Collage - sectionKey: "TRENDING_SHOWCASE" (TrendsCollage)
 * 13. Irresistible Deals - sectionKey: "DEALS_SHOWCASE" (IrresistibleDeals)
 */

// Section image slugs in top-to-bottom order matching the structured layout
export const FIGMA_HOME_SECTIONS = [
  // [2] Hero Banner / Hero Carousel
  "01-hero",
  // [3] Category Grid (Popular Categories)
  "02-popular-category",
  // [5] New Drop
  "03-new-drop",
  // [6] Exclusive Offers / GIF Banner
  "04-exclusive-offers",
  // [4] Product Shelf / New Arrivals
  "05-new-arrivals",
  // [7-8] Style / Editorial content
  "06-perfect-summer-vibe",
  "07-banner-a",
  // [12] Trends Collage / USP
  "08-trending-usp",
  "09-banner-b",
  // [9] Category Showcase sections
  "10-category-banner-1",
  "11-tshirts",
  // [13] Irresistible Deals
  "12-irresistible-deals",
  // [9] Category Showcase - continued
  "13-z-collective",
  "14-category-banner-2",
  "15-shirts",
  "16-the-rotation",
  "17-instas-heartthrob",
  "18-category-banner-3",
  "19-textured-polos",
  "20-street-wear",
  "21-category-banner-4",
  "22-denim",
  // [10] Featured Collection / Shop the Look
  "23-shop-the-look",
  // [9] Category Showcase - continued
  "24-category-banner-5",
  // [11] Value Props / Service Offering (USPs)
  "25-banner-c",
  "26-usps",
  // [4] Product Shelf variations
  "27-new-arrivals-tabs",
];

/** The stacked Figma section images (no phone chrome). */
export function FigmaHomeSections() {
  return (
    <div className="bg-black">
      {FIGMA_HOME_SECTIONS.map((slug) => (
        <img
          key={slug}
          src={`/figma-home/${slug}.png`}
          alt={slug}
          className="block w-full select-none"
          draggable={false}
        />
      ))}
    </div>
  );
}
