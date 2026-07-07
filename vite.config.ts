import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_ ones, which stay server-side only).
  const env = loadEnv(mode, process.cwd(), "");

  const shopDomain = env.SHOPIFY_STORE_DOMAIN || "";
  const apiVersion = env.SHOPIFY_API_VERSION || "2025-07";
  const adminToken = env.SHOPIFY_ADMIN_TOKEN || "";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: shopDomain
        ? {
            // Browser calls /shopify-admin/graphql; the dev server forwards it
            // to Shopify with the Admin token attached HERE (never in the client
            // bundle). Bypasses CORS and keeps the secret server-side.
            "/shopify-admin/graphql": {
              target: `https://${shopDomain}`,
              changeOrigin: true,
              secure: true,
              rewrite: () => `/api/${apiVersion}/graphql.json`,
              configure: (proxy) => {
                proxy.on("proxyReq", (proxyReq) => {
                  if (adminToken) {
                    proxyReq.setHeader("X-Shopify-Access-Token", adminToken);
                  }
                  proxyReq.setHeader("Content-Type", "application/json");
                });
                // An expired/invalid Admin token makes Shopify reply 401 with
                // `WWW-Authenticate: Basic`, which triggers the browser's native
                // login popup. Strip it so the app shows its own error instead.
                proxy.on("proxyRes", (proxyRes) => {
                  delete proxyRes.headers["www-authenticate"];
                });
              },
            },
          }
        : undefined,
    },
  };
});
