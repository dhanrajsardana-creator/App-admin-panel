# Mobile App Builder — CMS Admin Dashboard

A production-ready **React + TypeScript** CMS admin dashboard for managing a
mobile app's content, in the style of **Appbrew / Shopify Theme Editor /
Builder.io**. Business users can create pages, add and reorder sections,
configure section settings, manage section items, preview the mobile layout
live, and publish changes.

The backend CMS APIs are consumed as-is — **no backend is implemented here**.

> Source-of-truth model: **Page → Section → Item**. The mobile APIs
> (`/cms/mobile/*`) are used only for **preview validation**, never as the
> editing store.

---

## Tech stack

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | React 18 + TypeScript + Vite            |
| Styling            | Tailwind CSS + shadcn-style UI (Radix)  |
| Server state       | TanStack Query (React Query)            |
| Client state       | Zustand                                 |
| Forms              | React Hook Form                         |
| Drag & drop        | dnd-kit                                 |
| HTTP               | Axios (with interceptors)               |
| Icons / toasts     | lucide-react / sonner                   |

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure the API base URL
cp .env.example .env
#   then edit .env:
#   VITE_API_BASE_URL=https://your-host/api/v1

# 3. Run
npm run dev      # http://localhost:5173

# Build / type-check
npm run build
npm run lint
```

The repo ships with `.env` pointing at the provided live API so it runs out of
the box.

### Authentication

- **Continue with Shopify** redirects to `GET /auth/shopify` (the backend's
  OAuth entry point). On return, `/auth/callback` reads the `?token=…` JWT and
  stores it.
- The Axios request interceptor attaches `Authorization: Bearer <token>` to
  every call; a `401` clears the token and the route guard returns to `/login`.
- A **demo mode** (token-optional) entry is provided on the login screen so the
  builder can be explored against the open read endpoints.
- A **Profile** screen (`/profile`) shows the signed-in user and session.

---

## Folder structure

```
src/
├── api/                # Axios instance + endpoint modules
│   ├── axios.ts        #   interceptors, token store, error normalization
│   ├── pages.ts        #   /cms/pages CRUD + publish
│   ├── sections.ts     #   /cms/.../sections CRUD + reorder
│   ├── items.ts        #   /cms/.../items CRUD + reorder
│   ├── mobile.ts       #   /cms/mobile/* preview endpoints
│   └── auth.ts         #   Shopify OAuth + /auth/me
├── components/
│   ├── ui/             # shadcn-style primitives (button, dialog, select…)
│   └── common/         # Spinner, ColorField, ConfirmDialog
├── config/
│   ├── sectionCatalog.ts  # section palette + default configs
│   └── pageNav.ts         # system page nav (Home, Collections…)
├── features/builder/
│   ├── TopBar / LeftSidebar / CenterPreview / RightPanel
│   ├── PhoneFrame / SectionBlock / SectionList
│   ├── AddSectionDialog / PageFormDialog
│   ├── sections/       # dynamic section RENDERERS + registry
│   └── settings/       # schema-driven settings forms + ItemManager
├── hooks/              # React Query hooks + helpers
├── pages/              # Builder / Login / AuthCallback / Profile routes
├── store/              # Zustand builder store
├── types/              # TypeScript domain types (from real API shapes)
└── utils/              # safe JSON accessors
```

---

## How the pieces map to the spec

- **Three-panel layout** — `BuilderPage`: `LeftSidebar` (pages + draggable
  sections), `CenterPreview` (mobile phone frame), `RightPanel` (dynamic
  settings).
- **Dynamic section registry** — `features/builder/sections/registry.tsx` maps
  `sectionType` → renderer component, with a graceful fallback. Renderers cover
  banner, hero carousel, product shelf, category grid, lookbook, offer strip,
  sale banner, video banner, rich text, search bar, services, and more.
- **Mobile preview renderer** — a real React rendering engine (not a
  screenshot) that reads `title`, `subtitle`, `configJson` and `items` exactly
  as the mobile app consumes them. Toggle the top-bar **Preview** button to
  switch between the local **Draft** render and the **Live Mobile API**
  (`/cms/mobile/home`, `/cms/mobile/pages/{pageKey}`) with a **Refresh** button.
- **Drag & drop** — dnd-kit reorders both sections and items; order updates
  locally instantly and persists via `sortOrder` PUTs (optimistic).
- **Settings panel** — schema-driven (`settings/schemas.ts`). Edits patch the
  React Query cache immediately for **instant preview**, then **auto-save**
  (debounced) via `PUT /cms/sections/{id}`.
- **State** — Zustand holds `selectedPage / selectedSection / selectedItem`,
  preview source and save status; React Query owns server data
  (`sections`, `items`, `previewData`).

### Feature checklist

✓ Create / Edit / Delete Page ✓ Add / Edit / Delete / Reorder Section
✓ Manage Items (add / edit / delete / reorder) ✓ Live mobile preview
✓ Auto-save ✓ Manual publish ✓ Loading states ✓ Error handling (toasts)
✓ Search ✓ Responsive panels ✓ Shopify login + Profile
