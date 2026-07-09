/**
 * Central runtime configuration. Every tunable / secret-ish value is sourced
 * from Vite env vars (`.env`) so nothing important is hard-coded in the app.
 * Vite only exposes vars prefixed with `VITE_` to the client.
 */
const e = import.meta.env;

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === "") return fallback;
  return v === "true" || v === "1";
}

function int(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? n : fallback;
}

export const ENV = {
  /** Production / Staging base URL */
  prod_url: e.VITE_PROD_URL ?? "https://stage-api.powerlook.in/api/v1/",
  /** Testing base URL */
  test_url: e.VITE_TEST_URL ?? "https://dentilabial-noel-improbably.ngrok-free.dev/api/v1/",
  /** CMS API base, e.g. https://host/api/v1 */
  apiBaseUrl: e.VITE_API_BASE_URL ?? "https://stage-api.powerlook.in/api/v1/",
  /** Axios request timeout (ms). */
  apiTimeout: int(e.VITE_API_TIMEOUT, 30_000),
  /** Send the ngrok interstitial bypass header (only needed for ngrok hosts). */
  ngrokSkipWarning: bool(e.VITE_NGROK_SKIP_WARNING, true),

  /** Backend OAuth entry point (relative to apiBaseUrl). */
  authLoginPath: e.VITE_AUTH_LOGIN_PATH ?? "/auth/shopify",
  /** localStorage key the JWT is stored under. */
  tokenStorageKey: e.VITE_TOKEN_STORAGE_KEY ?? "cms_admin_token",

  /** Branding shown in the admin chrome and the mobile preview header. */
  appName: e.VITE_APP_NAME ?? "Mobile App Builder",
  storeBrandName: e.VITE_STORE_BRAND_NAME ?? "POWERLOOK",

  /** Page key auto-selected on first load. */
  defaultPageKey: e.VITE_DEFAULT_PAGE_KEY ?? "HOME_PAGE",

  /** Whether the Shopify catalog integration (via dev proxy) is enabled. */
  shopifyEnabled: bool(e.VITE_SHOPIFY_ENABLED, false),

  /** Shopify Storefront API (public token, called directly from the browser). */
  shopifyStorefrontDomain: e.VITE_SHOPIFY_STOREFRONT_DOMAIN ?? "",
  shopifyStorefrontApiVersion: e.VITE_SHOPIFY_STOREFRONT_API_VERSION ?? "2024-01",
  shopifyStorefrontToken: e.VITE_SHOPIFY_STOREFRONT_TOKEN ?? "",
} as const;
