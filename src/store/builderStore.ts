import { create } from "zustand";
import type { UpdateSectionPayload } from "@/types";

export type PreviewSource = "draft" | "mobile";

/** Static app screens reachable from the preview's bottom tab bar. */
export type AppScreen = "wishlist" | "account" | null;

/**
 * A live Shopify target previewed in the phone frame.
 * - "collection-index" / "product-index" render the full list screen.
 * - "collection" / "product" render a single item (id/handle/title required).
 */
export interface CatalogPreview {
  kind: "collection" | "product" | "collection-index" | "product-index";
  id?: string;
  handle?: string;
  title?: string;
  imageUrl?: string | null;
}

interface BuilderState {
  // --- Selection --------------------------------------------------------
  selectedPageId: string | null;
  selectedSectionId: string | null;
  selectedItemId: string | null;
  /** When set, the preview renders this live Shopify item instead of a page. */
  catalogPreview: CatalogPreview | null;
  /** Back-stack of previously viewed catalog screens (for in-preview nav). */
  catalogHistory: CatalogPreview[];
  /** Product handle bound to the PRODUCT-page template preview (null = first). */
  pdpPreviewHandle: string | null;
  /** A static app screen (wishlist/account) shown from the bottom tab bar. */
  appScreen: AppScreen;

  // --- UI ---------------------------------------------------------------
  pageSearch: string;
  /** "draft" renders local builder state; "mobile" renders the live mobile API. */
  previewSource: PreviewSource;

  /**
   * Pending section edits that have NOT yet been pushed to the API.
   * Keyed by section id; value is the accumulated patch to send on Publish.
   */
  pendingEdits: Record<string, UpdateSectionPayload>;

  // --- Actions ----------------------------------------------------------
  selectPage: (pageId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectItem: (itemId: string | null) => void;
  /** Navigate to a catalog screen. `push` keeps a back-stack entry. */
  selectCatalog: (
    catalog: CatalogPreview | null,
    opts?: { push?: boolean }
  ) => void;
  /** Pop the catalog back-stack, returning to the previous screen. */
  catalogBack: () => void;
  setPdpPreviewHandle: (handle: string | null) => void;
  /** Show a static app screen (wishlist/account) from the bottom tab bar. */
  setAppScreen: (screen: AppScreen) => void;
  setPageSearch: (q: string) => void;
  setPreviewSource: (s: PreviewSource) => void;

  /**
   * Merge `patch` into the pending edits for `sectionId`.
   * Does NOT call the API — changes are held locally until Publish.
   */
  queueSectionEdit: (sectionId: string, patch: UpdateSectionPayload) => void;

  /** Returns true if there are any unsaved pending edits. */
  hasPendingEdits: () => boolean;

  /**
   * Consume and clear all pending edits, returning them as an array of
   * { id, payload } pairs so the caller can flush them to the API.
   */
  flushPendingEdits: () => Array<{ id: string; payload: UpdateSectionPayload }>;

  // Kept for backwards-compat with any code that still calls these — now no-ops.
  beginSave: () => void;
  endSave: () => void;
  lastSavedAt: number | null;
  savingCount: number;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  selectedPageId: null,
  selectedSectionId: null,
  selectedItemId: null,
  catalogPreview: null,
  catalogHistory: [],
  pdpPreviewHandle: null,
  appScreen: null,
  pageSearch: "",
  previewSource: "draft",
  pendingEdits: {},
  // backwards-compat stubs
  savingCount: 0,
  lastSavedAt: null,

  selectPage: (pageId) =>
    set({
      selectedPageId: pageId,
      // Reset deeper selections when switching pages.
      selectedSectionId: null,
      selectedItemId: null,
      // Selecting a CMS page leaves the live-catalog / app-screen preview.
      catalogPreview: null,
      catalogHistory: [],
      appScreen: null,
      // Discard unsaved edits when switching pages.
      pendingEdits: {},
    }),

  selectSection: (sectionId) =>
    set({ selectedSectionId: sectionId, selectedItemId: null }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  selectCatalog: (catalog, opts) =>
    set((st) => ({
      catalogPreview: catalog,
      catalogHistory: opts?.push
        ? st.catalogPreview
          ? [...st.catalogHistory, st.catalogPreview]
          : st.catalogHistory
        : [],
      appScreen: null,
      selectedSectionId: null,
      selectedItemId: null,
    })),

  catalogBack: () =>
    set((st) => {
      if (st.catalogHistory.length === 0) return {};
      const history = st.catalogHistory.slice(0, -1);
      const prev = st.catalogHistory[st.catalogHistory.length - 1];
      return { catalogPreview: prev, catalogHistory: history };
    }),

  setPdpPreviewHandle: (handle) => set({ pdpPreviewHandle: handle }),

  setAppScreen: (screen) =>
    set({
      appScreen: screen,
      catalogPreview: null,
      catalogHistory: [],
      selectedSectionId: null,
      selectedItemId: null,
    }),

  setPageSearch: (q) => set({ pageSearch: q }),

  setPreviewSource: (s) => set({ previewSource: s }),

  queueSectionEdit: (sectionId, patch) =>
    set((st) => ({
      pendingEdits: {
        ...st.pendingEdits,
        [sectionId]: {
          ...(st.pendingEdits[sectionId] ?? {}),
          ...patch,
          // Deep-merge configJson so individual key edits accumulate correctly.
          ...(patch.configJson != null
            ? {
                configJson: {
                  ...(st.pendingEdits[sectionId]?.configJson ?? {}),
                  ...patch.configJson,
                },
              }
            : {}),
        },
      },
    })),

  hasPendingEdits: () => Object.keys(get().pendingEdits).length > 0,

  flushPendingEdits: () => {
    const edits = get().pendingEdits;
    set({ pendingEdits: {} });
    return Object.entries(edits).map(([id, payload]) => ({ id, payload }));
  },

  // No-op stubs kept for backwards compat
  beginSave: () => {},
  endSave: () => {},
}));
