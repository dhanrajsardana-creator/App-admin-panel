import type { FieldDef, SectionSchema } from "./fieldTypes";

const textPosition: FieldDef = {
  kind: "select",
  key: "textPosition",
  label: "Text position",
  group: "style",
  options: [
    { value: "top", label: "Top" },
    { value: "center", label: "Center" },
    { value: "bottom", label: "Bottom" },
  ],
};

const buttonStyle: FieldDef = {
  kind: "select",
  key: "buttonStyle",
  label: "Button style",
  group: "style",
  options: [
    { value: "filled", label: "Filled" },
    { value: "outline", label: "Outline" },
    { value: "text", label: "Text only" },
  ],
};

// Shared overlay/CTA fields used by the banner family.
const bannerFields: FieldDef[] = [
  { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
  { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
  { kind: "text", key: "backgroundMediaValue", label: "Background image / media URL", group: "content" },
  { kind: "text", key: "buttonText", label: "Button text", group: "content" },
  textPosition,
  { kind: "color", key: "textColor", label: "Text color", group: "style" },
  { kind: "color", key: "buttonColor", label: "Button color", group: "style" },
  { kind: "color", key: "buttonTextColor", label: "Button text color", group: "style" },
  buttonStyle,
  { kind: "number", key: "overlayOpacity", label: "Overlay opacity", min: 0, max: 1, step: 0.05, group: "style" },
];

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  banner: { fields: bannerFields },
  featured_collection_products: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
      { kind: "number", key: "columns", label: "Columns", min: 1, max: 4, group: "style" },
      { kind: "number", key: "maxItems", label: "Max products", min: 1, max: 30, group: "content" },
      { kind: "text", key: "buttonText", label: "View all button text", group: "content" },
    ]
  },

  promo_hero: {
    fields: [
      { kind: "text", key: "heading", label: "Heading text", placeholder: "YOUR PERFECT SUMMER VIBE", group: "content" },
      { kind: "text", key: "subheadingText", label: "Subheading text", placeholder: "DEALS THAT'S HARD TO RESISTS", group: "content" },
      { kind: "text", key: "backgroundMediaValue", label: "Background image URL", placeholder: "/promo/summer-bg.png", group: "content" },
      { kind: "text", key: "card1Text", label: "Card 1 Text", placeholder: "SHOP TOPWEAR", group: "content" },
      { kind: "text", key: "card1Image", label: "Card 1 Image URL", placeholder: "/promo/card-topwear.png", group: "content" },
      { kind: "text", key: "card1CollectionId", label: "Card 1 Collection ID", placeholder: "e.g. 44961808", group: "content" },
      { kind: "text", key: "card2Text", label: "Card 2 Text", placeholder: "SHOP BOTTOMWEAR", group: "content" },
      { kind: "text", key: "card2Image", label: "Card 2 Image URL", placeholder: "/promo/card-bottomwear.png", group: "content" },
      { kind: "text", key: "card2CollectionId", label: "Card 2 Collection ID", placeholder: "e.g. 44961809", group: "content" },
    ],
  },

  new_drop_products: {
    fields: [
      { kind: "text", key: "title", label: "Section title", isRoot: true, group: "content" },
      { kind: "text", key: "itemPriceLabel", label: "Price label (e.g. Get it For)", group: "content" },
      { kind: "text", key: "buttonText", label: "Button text", group: "content" },
    ],
  },

  exlusive_offers: {
    fields: [
      { kind: "text", key: "title", label: "Section title", isRoot: true, group: "content" },
      { kind: "select", key: "redirectType", label: "Redirect Type", options: [
        { label: "NONE", value: "NONE" },
        { label: "COLLECTION", value: "COLLECTION" },
        { label: "PRODUCT", value: "PRODUCT" },
        { label: "URL", value: "URL" }
      ], group: "content" },
      { kind: "text", key: "redirectValue", label: "Redirect Value", group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
    ],
  },

  mood_grid: {
    fields: [
      { kind: "text", key: "title", label: "Section title", placeholder: "ARE WE FEELING SMOOTH OR WILD?", group: "content" },
    ],
  },

  category_banner: {
    fields: [
      { kind: "text", key: "backgroundImage", label: "Background image URL", group: "content" },
      { kind: "text", key: "productCount", label: "Product count text", group: "content" },
    ],
  },

  shop_the_look: {
    fields: [
      { kind: "text", key: "backgroundImage", label: "Look image URL", group: "content" },
      { kind: "switch", key: "showMemberPrice", label: "Show member price", group: "style" },
    ],
  },

  hero_carousel: {
    fields: [
      { kind: "text", key: "backgroundMediaValue", label: "Background image URL", group: "content" },
      { kind: "text", key: "overlayTitle", label: "Overlay title (BEYOND)", placeholder: "BEYOND", group: "content" },
      { kind: "text", key: "overlaySubtitle", label: "Overlay subtitle (ORDINARY)", placeholder: "ORDINARY", group: "content" },
    ],
  },

  video_banner: {
    fields: [
      { kind: "text", key: "backgroundMediaValue", label: "Video URL", group: "content" },
      { kind: "switch", key: "autoPlay", label: "Autoplay", group: "content" },
      { kind: "switch", key: "loop", label: "Loop", group: "content" },
      { kind: "switch", key: "muted", label: "Muted", group: "content" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "number", key: "overlayOpacity", label: "Overlay opacity", min: 0, max: 1, step: 0.05, group: "style" },
    ],
  },

  sale_banner: {
    fields: [
      { kind: "text", key: "discountLabel", label: "Discount label", group: "content" },
      { kind: "text", key: "buttonText", label: "Button text", group: "content" },
      { kind: "switch", key: "showButton", label: "Show button", group: "content" },
      { kind: "switch", key: "showCountdown", label: "Show countdown", group: "content" },
      { kind: "text", key: "backgroundImage", label: "Background image URL", group: "content" },
      { kind: "color", key: "backgroundColor", label: "Background color", group: "style" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "color", key: "buttonColor", label: "Button color", group: "style" },
      { kind: "color", key: "buttonTextColor", label: "Button text color", group: "style" },
      {
        kind: "select", key: "textAlign", label: "Text align", group: "style",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
    ],
  },

  product_shelf: {
    fields: [
      { kind: "number", key: "maxItems", label: "Max products", min: 1, max: 30, group: "content" },
      { kind: "switch", key: "showViewAll", label: "Show 'View all'", group: "content" },
      { kind: "text", key: "viewAllText", label: "'View all' text", group: "content" },
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "content" },
      { kind: "text", key: "memberLabel", label: "Member price label", group: "content" },
    ],
  },
  collection_with_products: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "number", key: "maxItems", label: "Max products", min: 1, max: 30, group: "content" },
      { kind: "text", key: "backgroundMediaValue", label: "Background media URL", group: "content" },
      { kind: "text", key: "buttonText", label: "Button text", group: "content" },
    ],
  },

  collection_carousel: {
    fields: [
      { kind: "number", key: "productLimit", label: "Product limit", min: 1, max: 30, group: "content" },
      { kind: "switch", key: "showViewAll", label: "Show 'View all'", group: "content" },
      { kind: "text", key: "viewAllText", label: "'View all' text", group: "content" },
      { kind: "number", key: "cardBorderRadius", label: "Card radius", min: 0, max: 32, group: "style" },
    ],
  },

  category_grid: {
    fields: [
      { kind: "text", key: "title", label: "Section title", placeholder: "WE FEELING SMOOTH OR WILD", group: "content" },
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "content" },
      { kind: "switch", key: "showLabel", label: "Show labels", group: "content" },
      { kind: "number", key: "columns", label: "Columns", min: 2, max: 5, group: "style" },
    ],
  },

  lookbook_grid: {
    fields: [
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "content" },
      { kind: "switch", key: "showLabel", label: "Show labels", group: "content" },
      { kind: "switch", key: "showOverlay", label: "Show overlay", group: "style" },
      { kind: "number", key: "overlayOpacity", label: "Overlay opacity", min: 0, max: 1, step: 0.05, group: "style" },
      { kind: "number", key: "columns", label: "Columns", min: 1, max: 3, group: "style" },
      { kind: "number", key: "gap", label: "Gap (px)", min: 0, max: 24, group: "style" },
      { kind: "number", key: "borderRadius", label: "Corner radius", min: 0, max: 32, group: "style" },
    ],
  },

  offer_strip: {
    fields: [
      { kind: "switch", key: "autoScroll", label: "Auto scroll", group: "content" },
      { kind: "number", key: "scrollSpeed", label: "Scroll speed (ms)", min: 500, step: 250, group: "content" },
      { kind: "switch", key: "showDivider", label: "Show divider", group: "content" },
      { kind: "text", key: "dividerChar", label: "Divider character", group: "content" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "number", key: "fontSize", label: "Font size", min: 8, max: 24, group: "style" },
      { kind: "number", key: "paddingVertical", label: "Vertical padding", min: 0, max: 32, group: "style" },
    ],
  },

  search_bar: {
    fields: [
      { kind: "text", key: "placeholder", label: "Placeholder", group: "content" },
      { kind: "switch", key: "showVoiceSearch", label: "Voice search", group: "content" },
      { kind: "switch", key: "showCameraSearch", label: "Camera search", group: "content" },
      { kind: "switch", key: "showTrendingTags", label: "Trending tags", group: "content" },
      { kind: "text", key: "trendingTagsLabel", label: "Trending label", group: "content" },
      { kind: "color", key: "backgroundColor", label: "Background color", group: "style" },
      { kind: "number", key: "borderRadius", label: "Corner radius", min: 0, max: 32, group: "style" },
    ],
  },

  rich_text: {
    fields: [
      { kind: "switch", key: "showTitle", label: "Show title", group: "content" },
      { kind: "textarea", key: "htmlContent", label: "Content (HTML allowed)", group: "content" },
      {
        kind: "select", key: "textAlign", label: "Text align", group: "style",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
      { kind: "number", key: "fontSize", label: "Font size", min: 10, max: 28, group: "style" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "color", key: "titleColor", label: "Title color", group: "style" },
      { kind: "number", key: "titleSize", label: "Title size", min: 14, max: 40, group: "style" },
    ],
  },

  services_information: { fields: [] },
};

export function getSectionSchema(sectionType: string, sectionKey?: string): SectionSchema {
  if (sectionKey === "DEALS_SHOWCASE") {
    return {
      fields: [
        { kind: "text", key: "subtitle", label: "Subtitle text", group: "content", isRoot: true },
        { kind: "number", key: "maxItems", label: "Max products", min: 1, max: 30, group: "content" },
        { kind: "text", key: "buttonText", label: "Button text", group: "content" },
      ],
    };
  }
  if (sectionKey === "STYLE_SPOTLIGHT") {
    return {
      fields: [
        { kind: "text", key: "backgroundMediaValue", label: "Background image / media URL", group: "content" },
        { kind: "text", key: "buttonText", label: "Button text", group: "content" },
      ],
    };
  }

  if (sectionKey === "TRENDING_SHOWCASE") {
    return {
      fields: [
        { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
        { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
        { kind: "text", key: "backgroundMediaValue", label: "Background image / media URL", group: "content" },
        { kind: "text", key: "buttonText", label: "Button text", group: "content" },
      ],
    };
  }
  if (sectionKey === "HOME_HERO_CAROUSEL") {
    return {
      fields: [
        // ── Brand logo ──────────────────────────────────────────────────────
        {
          kind: "switch",
          key: "isBrandLogoEnabled",
          label: "Show brand logo",
          group: "content",
        },
        // ── Search box ──────────────────────────────────────────────────────
        {
          kind: "switch",
          key: "isSearchBoxEnabled",
          label: "Show search box",
          group: "content",
        },
        {
          kind: "text",
          key: "searchBoxFixedPlaceholder",
          label: "Search box fixed prefix",
          placeholder: "Search for",
          group: "content",
        },
        {
          kind: "tags",
          key: "searchBoxRotationalPlaceholders",
          label: "Search box rotating placeholders",
          placeholder: "e.g. T-shirts, Jackets… (Enter to add)",
          group: "content",
        },
        // ── Background ──────────────────────────────────────────────────────
        {
          kind: "select",
          key: "backgroundMediaType",
          label: "Background media type",
          group: "content",
          options: [
            { value: "IMAGE", label: "Image" },
            { value: "VIDEO", label: "Video" },
          ],
        },
        {
          kind: "text",
          key: "backgroundMediaValue",
          label: "Background image / video URL",
          placeholder: "https://…",
          group: "content",
        },
        // ── Overlay text ────────────────────────────────────────────────────
        {
          kind: "tags",
          key: "overlayingTexts",
          label: "Overlaying texts (e.g. BEYOND, ORDINARY)",
          placeholder: "e.g. BEYOND (Enter to add)",
          group: "content",
        },
        {
          kind: "text",
          key: "overlayingTitle",
          label: "Overlaying title",
          placeholder: "Powerlook Presents",
          group: "content",
        },
        // ── View-all CTA ────────────────────────────────────────────────────
        {
          kind: "text",
          key: "viewAllButtonText",
          label: "View all button text",
          placeholder: "Shop Now",
          group: "content",
        },
        {
          kind: "select",
          key: "viewAllRedirectType",
          label: "View all redirect type",
          group: "content",
          options: [
            { value: "COLLECTION", label: "Collection" },
            { value: "LANDING", label: "Landing page" },
            { value: "NONE", label: "None" },
          ],
        },
        {
          kind: "text",
          key: "viewAllValue",
          label: "View all redirect value",
          placeholder: "e.g. new-arrivals-view-all",
          group: "content",
        },
      ],
    };
  }
  return SECTION_SCHEMAS[sectionType?.toLowerCase()] ?? { fields: [] };
}
