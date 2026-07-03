/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_NGROK_SKIP_WARNING?: string;
  readonly VITE_AUTH_LOGIN_PATH?: string;
  readonly VITE_TOKEN_STORAGE_KEY?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_STORE_BRAND_NAME?: string;
  readonly VITE_DEFAULT_PAGE_KEY?: string;
  readonly VITE_SHOPIFY_ENABLED?: string;
  readonly VITE_SHOPIFY_STOREFRONT_DOMAIN?: string;
  readonly VITE_SHOPIFY_STOREFRONT_API_VERSION?: string;
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
