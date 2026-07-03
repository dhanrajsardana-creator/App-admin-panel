# ─── Stage 1: build the Vite/React static bundle ─────────────────────────────
FROM docker.io/library/node:22-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# VITE_* vars are compiled INTO the static bundle, so they must be present at
# build time. Pass them via --build-arg (see docker-compose.yaml -> build.args).
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=30000
ARG VITE_NGROK_SKIP_WARNING=false
ARG VITE_AUTH_LOGIN_PATH=/auth/shopify
ARG VITE_TOKEN_STORAGE_KEY=cms_admin_token
ARG VITE_APP_NAME="Mobile App Builder"
ARG VITE_STORE_BRAND_NAME=POWERLOOK
ARG VITE_DEFAULT_PAGE_KEY=HOME_PAGE
ARG VITE_SHOPIFY_ENABLED=true

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_NGROK_SKIP_WARNING=$VITE_NGROK_SKIP_WARNING \
    VITE_AUTH_LOGIN_PATH=$VITE_AUTH_LOGIN_PATH \
    VITE_TOKEN_STORAGE_KEY=$VITE_TOKEN_STORAGE_KEY \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_STORE_BRAND_NAME=$VITE_STORE_BRAND_NAME \
    VITE_DEFAULT_PAGE_KEY=$VITE_DEFAULT_PAGE_KEY \
    VITE_SHOPIFY_ENABLED=$VITE_SHOPIFY_ENABLED

COPY . .
RUN npm run build

# ─── Stage 2: serve the static bundle with nginx ─────────────────────────────
FROM docker.io/library/nginx:1.27-alpine AS runtime

# SPA-aware config (history-API fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
