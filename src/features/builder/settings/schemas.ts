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
  { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background image / media URL", group: "content" },
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
      { kind: "tuple3_text", key: "overlayingTexts", label1: "Primary Heading", label2: "Secondary Heading", label3: "Badge/Offer Text", placeholder1: "THE COLLECTIVES", placeholder2: "GET THE VIBES", placeholder3: "UNDER 799 ONLY", group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      { kind: "number", key: "columns", label: "Columns", min: 1, max: 4, group: "style" },
      { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
    ]
  },

  promo_hero: {
    fields: [
      { kind: "text", key: "heading", label: "Heading text", placeholder: "YOUR PERFECT SUMMER VIBE", group: "content" },
      { kind: "text", key: "subheadingText", label: "Subheading text", placeholder: "DEALS THAT'S HARD TO RESISTS", group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background image URL", placeholder: "/promo/summer-bg.png", group: "content" },
      { kind: "text", key: "card1Text", label: "Card 1 Text", placeholder: "SHOP TOPWEAR", group: "content" },
      { kind: "media_url", key: "card1Image", label: "Card 1 Image URL", placeholder: "/promo/card-topwear.png", group: "content" },
      { kind: "text", key: "card1CollectionId", label: "Card 1 Collection ID", placeholder: "e.g. 44961808", group: "content" },
      { kind: "text", key: "card2Text", label: "Card 2 Text", placeholder: "SHOP BOTTOMWEAR", group: "content" },
      { kind: "media_url", key: "card2Image", label: "Card 2 Image URL", placeholder: "/promo/card-bottomwear.png", group: "content" },
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
      ], group: "content", isRoot: true },
      { kind: "redirect_value", typeKey: "redirectType", key: "redirectValue", label: "Redirect Value", group: "content", isRoot: true },
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
      { kind: "media_url", key: "backgroundImage", label: "Background image URL", group: "content" },
      { kind: "text", key: "productCount", label: "Product count text", group: "content" },
    ],
  },

  shop_the_look: {
    fields: [
      { kind: "media_url", key: "backgroundImage", label: "Look image URL", group: "content" },
      { kind: "switch", key: "showMemberPrice", label: "Show member price", group: "style" },
    ],
  },

  hero_carousel: {
    fields: [
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background image URL", group: "content" },
      { kind: "tuple_text", key: "overlayingTexts", placeholder1: "BEYOND", placeholder2: "ORDINARY", group: "content" },
    ],
  },

  video_banner: {
    fields: [
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Video URL", group: "content" },
      { kind: "switch", key: "autoPlay", label: "Autoplay", group: "style" },
      { kind: "switch", key: "loop", label: "Loop", group: "style" },
      { kind: "switch", key: "muted", label: "Muted", group: "style" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "number", key: "overlayOpacity", label: "Overlay opacity", min: 0, max: 1, step: 0.05, group: "style" },
    ],
  },

  sale_banner: {
    fields: [
      { kind: "text", key: "discountLabel", label: "Discount label", group: "content" },
      { kind: "text", key: "buttonText", label: "Button text", group: "content" },
      { kind: "switch", key: "showButton", label: "Show button", group: "style" },
      { kind: "switch", key: "showCountdown", label: "Show countdown", group: "style" },
      { kind: "media_url", key: "backgroundImage", label: "Background image URL", group: "content" },
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
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
      { kind: "switch", key: "showTabs", label: "Show items as tabs", group: "style" },
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "style" },
      { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      { kind: "text", key: "memberLabel", label: "Member price label", group: "content" },
    ],
  },
  
  category_products_shelf: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "style" },
      { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      { kind: "text", key: "memberLabel", label: "Member price label", group: "content" },
    ],
  },
  collection_with_products: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
      { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      { kind: "switch", key: "isDarkModeEnabled", label: "Dark mode", group: "style" },
      { kind: "switch", key: "showPrice", label: "Show Price", group: "style" },
      { kind: "number", key: "maxItems", label: "Max Items", group: "style", min: 1, max: 20 },
    ],
  },

  collection_carousel: {
    fields: [
      { kind: "number", key: "cardBorderRadius", label: "Card radius", min: 0, max: 32, group: "style" },
      { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
    ],
  },

  category_grid: {
    fields: [
      { kind: "text", key: "title", label: "Section title", isRoot: true, placeholder: "ARE WE FEELING SMOOTH OR WILD?", group: "content" },
      { kind: "switch", key: "showSectionTitle", label: "Show section title", group: "style" },
      { kind: "switch", key: "showLabel", label: "Show labels", group: "style" },
      { kind: "number", key: "columns", label: "Columns", min: 2, max: 5, group: "style" },
    ],
  },

  lookbook_grid: {
    fields: [
      { kind: "tuple3_text", key: "overlayingTexts", label1: "Tagline 1", label2: "Tagline 2", label3: "Tagline 3", placeholder1: "EXPLOSIVE", placeholder2: "DRAMA", placeholder3: "STYLISH", group: "content" },
      { kind: "text", key: "overlayingTitle", label: "Subtitle", placeholder: "POWERLOOK PRESENTS", group: "content" },
      { kind: "text", key: "viewAllButtonText", label: "View All Button Text", placeholder: "VIEW ALL", group: "content" },
      { kind: "select", key: "backgroundMediaType", label: "Background Media Type", options: [{ label: "IMAGE", value: "IMAGE" }, { label: "GIF", value: "GIF" }], group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", label: "Background Media URL", group: "content" },
      { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
      { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
    ],
  },

  offer_strip: {
    fields: [
      { kind: "switch", key: "autoScroll", label: "Auto scroll", group: "style" },
      { kind: "number", key: "scrollSpeed", label: "Scroll speed (ms)", min: 500, step: 250, group: "content" },
      { kind: "switch", key: "showDivider", label: "Show divider", group: "style" },
      { kind: "text", key: "dividerChar", label: "Divider character", group: "content" },
      { kind: "color", key: "textColor", label: "Text color", group: "style" },
      { kind: "number", key: "fontSize", label: "Font size", min: 8, max: 24, group: "style" },
      { kind: "number", key: "paddingVertical", label: "Vertical padding", min: 0, max: 32, group: "style" },
    ],
  },

  search_bar: {
    fields: [
      { kind: "text", key: "placeholder", label: "Placeholder", group: "content" },
      { kind: "switch", key: "showVoiceSearch", label: "Voice search", group: "style" },
      { kind: "switch", key: "showCameraSearch", label: "Camera search", group: "style" },
      { kind: "switch", key: "showTrendingTags", label: "Trending tags", group: "style" },
      { kind: "text", key: "trendingTagsLabel", label: "Trending label", group: "content" },
      { kind: "color", key: "backgroundColor", label: "Background color", group: "style" },
      { kind: "number", key: "borderRadius", label: "Corner radius", min: 0, max: 32, group: "style" },
    ],
  },

  rich_text: {
    fields: [
      { kind: "switch", key: "showTitle", label: "Show title", group: "style" },
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

  list: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
    ],
  },
  input_field: {
    fields: [
      { kind: "text", key: "searchBoxFixedPlaceholder", label: "Search box fixed prefix", placeholder: "Search for", group: "content" },
      { kind: "tags", key: "searchBoxRotationalPlaceholders", label: "Search box rotating placeholders", placeholder: "e.g. T-shirts, Jackets… (Enter to add)", group: "content" },
    ],
  },
  badges: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "tags", key: "exampleData", label: "Example Data (Searches)", placeholder: "e.g. Brown Korean Pant, Denim... (Enter to add)", group: "content" },
    ],
  },
  carousel: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
    ],
  },
  cart_product: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
      { kind: "cart_product_labels", key: "overlayingTexts", label: "Cart Card Labels", group: "content" },
      { kind: "text", key: "overlayingTitle", label: "Saved Banner Text", group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
    ],
  },
  cart_banner: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "couponCode", label: "Coupon Code", group: "content" },
      { kind: "text", key: "couponBenefit", label: "Coupon Benefit", group: "content" },
      { kind: "text", key: "viewMoreText", label: "View More Text", group: "content" },
      { kind: "text", key: "viewAllText", label: "View All Text", group: "content" },
      { kind: "switch", key: "isViewAllEnabled", label: "Enable View All", group: "style" },
      { kind: "text", key: "buttonText", label: "Button Text", group: "content" },
    ],
  },
  cart_summary: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtotal", label: "Subtotal Value", group: "content" },
      { kind: "text", key: "discount", label: "Discount Value", group: "content" },
      { kind: "text", key: "shipping", label: "Shipping Text", group: "content" },
      { kind: "text", key: "grandTotal", label: "Grand Total Value", group: "content" },
    ],
  },
  cart_checkout: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "price", label: "Price Value", group: "content" },
      { kind: "text", key: "priceLabel", label: "Price Label", group: "content" },
      { kind: "text", key: "buttonText", label: "Button Text", group: "content" },
    ],
  },
  profile_banner: {
    fields: [
      { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Subtitle", group: "content" },
      { kind: "media_url", key: "logoUrl", label: "Logo URL", group: "content" },
      { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "style" },
    ],
  },
  profile_list: {
    fields: [
      { kind: "text", key: "title", label: "Group 1 Title", group: "content", isRoot: true },
      { kind: "text", key: "subtitle", label: "Group 2 Title (e.g. MORE)", group: "content", isRoot: true },
      { kind: "tags", key: "overlayingTexts", label: "List Menu Items (array)", group: "content" },
    ],
  },
};

export function getSectionSchema(sectionType: string, sectionKey?: string): SectionSchema {
  if (sectionKey === "DEALS_SHOWCASE") {
    return {
      fields: [
        { kind: "text", key: "subtitle", label: "Subtitle text", group: "content", isRoot: true },
        { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
        { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
        { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
        { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
        { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      ],
    };
  }
  if (sectionKey === "STYLE_SPOTLIGHT") {
    return {
      fields: [
        { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
        { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
        { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
        { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
        { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
        { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
        { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      ],
    };
  }

  if (sectionKey === "TRENDING_SHOWCASE") {
    return {
      fields: [
        { kind: "text", key: "title", label: "Title", group: "content", isRoot: true },
        { kind: "text", key: "subtitle", label: "Subtitle", group: "content", isRoot: true },
        { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
        { kind: "switch", key: "isViewAllButtonEnabled", label: "Enable View All Button", group: "style" },
        { kind: "text", key: "viewAllButtonText", label: "View All Button Text", group: "content" },
        { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
        { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
      ],
    };
  }

  if (sectionKey === "THE_ROTATION" || sectionKey === "LOOKBOOK_ROTATION") {
    return {
      fields: [
        { kind: "tuple3_text", key: "overlayingTexts", label1: "Tagline 1", label2: "Tagline 2", label3: "Tagline 3", placeholder1: "EXPLOSIVE", placeholder2: "DRAMA", placeholder3: "STYLISH", group: "content" },
        { kind: "text", key: "overlayingTitle", label: "Subtitle", placeholder: "POWERLOOK PRESENTS", group: "content" },
        { kind: "text", key: "viewAllButtonText", label: "View All Button Text", placeholder: "VIEW ALL", group: "content" },
        { kind: "select", key: "backgroundMediaType", label: "Background Media Type", options: [{ label: "IMAGE", value: "IMAGE" }, { label: "GIF", value: "GIF" }], group: "content" },
        { kind: "media_url", key: "backgroundMediaValue", label: "Background Media URL", group: "content" },
        { kind: "select", key: "viewAllRedirectType", label: "View All Redirect Type", options: [{ label: "Collection", value: "COLLECTION" }, { label: "Product", value: "PRODUCT" }, { label: "URL", value: "URL" }], group: "content" },
        { kind: "redirect_value", typeKey: "viewAllRedirectType", key: "viewAllRedirectValue", label: "View All Redirect Value", group: "content" },
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
          group: "style",
        },
        // ── Search box ──────────────────────────────────────────────────────
        {
          kind: "switch",
          key: "isSearchBoxEnabled",
          label: "Show search box",
          group: "style",
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
          kind: "media_url",
          key: "backgroundMediaValue",
          typeKey: "backgroundMediaType",
          label: "Background Media URL",
          group: "content",
        },
        // ── Overlay text ────────────────────────────────────────────────────
        {
          kind: "tuple_text",
          key: "overlayingTexts",
          label1: "Primary Heading",
          label2: "Secondary Heading",
          placeholder1: "BEYOND",
          placeholder2: "ORDINARY",
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
          kind: "switch",
          key: "isViewAllButtonEnabled",
          label: "Enable View All Button",
          group: "style",
        },
        {
          kind: "text",
          key: "viewAllButtonText",
          label: "View All Button Text",
          placeholder: "Shop Now",
          group: "content",
        },
        {
          kind: "select",
          key: "viewAllRedirectType",
          label: "View All Redirect Type",
          group: "content",
          options: [
            { value: "COLLECTION", label: "Collection" },
            { value: "LANDING", label: "Landing page" },
            { value: "NONE", label: "None" },
          ],
        },
        {
          kind: "text",
          key: "viewAllRedirectValue",
          label: "View All Redirect Value",
          placeholder: "e.g. new-arrivals-view-all",
          group: "content",
        },
      ],
    };
  }
  if (sectionKey === "HOMEPAGE_EXCLUSIVE_OFFERS") {
    return {
      fields: [
        { kind: "text", key: "title", label: "Section title", isRoot: true, group: "content" },
        { kind: "text", key: "subtitle", label: "Section subtitle", isRoot: true, group: "content" },
        { kind: "select", key: "redirectType", label: "Redirect Type", options: [
          { label: "NONE", value: "NONE" },
          { label: "COLLECTION", value: "COLLECTION" },
          { label: "PRODUCT", value: "PRODUCT" },
          { label: "URL", value: "URL" }
        ], group: "content", isRoot: true },
        { kind: "redirect_value", typeKey: "redirectType", key: "redirectValue", label: "Redirect Value", group: "content", isRoot: true },
        { kind: "media_url", key: "backgroundMediaValue", typeKey: "backgroundMediaType", label: "Background Media URL", group: "content" },
      ],
    };
  }

  return SECTION_SCHEMAS[sectionType?.toLowerCase()] ?? { fields: [] };
}
