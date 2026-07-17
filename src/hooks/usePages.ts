import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { pagesApi } from "@/api/pages";
import { sectionsApi } from "@/api/sections";
import { itemsApi } from "@/api/items";
import { qk } from "./queryKeys";
import { useBuilderStore } from "@/store/builderStore";
import type { CreatePagePayload, Page, UpdatePagePayload } from "@/types";

export function usePages() {
  return useQuery({
    queryKey: qk.pages,
    queryFn: pagesApi.list,
  });
}

export function usePage(pageId: string | null) {
  return useQuery({
    queryKey: pageId ? qk.page(pageId) : ["pages", "none"],
    queryFn: () => pagesApi.get(pageId as string),
    enabled: !!pageId,
  });
}

export function usePageByKey(pageKey: string | null) {
  return useQuery({
    queryKey: pageKey ? qk.pageByKey(pageKey) : ["pages", "byKey", "none"],
    queryFn: () => pagesApi.getByKey(pageKey as string),
    enabled: !!pageKey,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePagePayload) => pagesApi.create(payload),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: qk.pages });
      toast.success(`Page "${page.name}" created`);
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to create page"),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePagePayload }) =>
      pagesApi.update(id, payload),
    onSuccess: (page: Page) => {
      qc.invalidateQueries({ queryKey: qk.pages });
      qc.invalidateQueries({ queryKey: qk.page(page.id) });
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to update page"),
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pages });
      toast.success("Page deleted");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete page"),
  });
}

export function usePublishPage() {
  const qc = useQueryClient();
  const flushPendingEdits = useBuilderStore((s) => s.flushPendingEdits);
  const flushPendingItemActions = useBuilderStore((s) => s.flushPendingItemActions);

  return useMutation({
    mutationFn: async (page: Page) => {
      // Clear out the pending edits flags, since we are doing a bulk update
      flushPendingEdits();
      flushPendingItemActions();

      // Read the currently mutated full page tree from the react-query cache
      const cachedPage = qc.getQueryData<Page>(qk.pageByKey(page.pageKey));
      if (!cachedPage) {
        throw new Error("Page data missing from cache");
      }

      // We need to strip out the 'temp-' prefix from any locally created IDs
      // so the backend knows to create them as new entities.
        // we must clean up extraneous fields before sending
        const payload: any = {
          id: cachedPage.id,
          sections: (cachedPage.sections || []).map((section) => {
            const { id: secId, visibilityType, configJson, ...restSec } = section;
            const isTempSec = secId.startsWith("temp-");
            
            // Clean up configJson
            let cleanedConfigJson = configJson;
            if (configJson && typeof configJson === 'object') {
              const { theme, isDark, ...restConfig } = configJson as any;
              cleanedConfigJson = restConfig;
            }
            
            return {
              ...restSec,
              configJson: cleanedConfigJson,
              ...(isTempSec ? {} : { id: secId }),
              visibilityType: "BOTH",
              items: (section.items || []).map((item: any) => {
                const { id: itemId, sectionId: itemSecId, itemType, resolved, buttonText, metadataJson, ...restItem } = item;
              const isTempItem = itemId.startsWith("temp-");
              
              let finalItemType = itemType;
              if (!finalItemType) {
                const st = section.sectionType?.toLowerCase();
                if (st === "hero_carousel") finalItemType = "hero_full_size_photo";
                else if (st === "category_grid") finalItemType = "category";
                else if (st === "lookbook_grid") finalItemType = "lookbook_card";
                else if (st === "mood_grid") finalItemType = "mood_card";
                else if (st === "promo_hero" || st === "exlusive_offers" || st === "carousel") finalItemType = "promo_banner";
                else if (st === "list" || st === "profile_list") finalItemType = "NAVIGATION_ITEM";
                else finalItemType = "product";
              }

              let cleanedMetadataJson: any = {};
              if (typeof metadataJson === 'object' && metadataJson !== null) {
                const { dark_mode, ...restMeta } = metadataJson as any;
                cleanedMetadataJson = restMeta;
              }

              return {
                ...restItem,
                ...(isTempItem ? {} : { id: itemId }),
                ...(isTempSec ? {} : { sectionId: itemSecId }),
                itemType: finalItemType,
                metadataJson: cleanedMetadataJson,
              };
            }),
          };
        }),
      };

      // ── Bulk update the entire page tree ─────────────────────────────────
      await pagesApi.bulkUpdate(page.id, payload);

      // ── Publish the page ───────────────────────────────────────────────
      return await pagesApi.publish(page.id);
    },
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: qk.pages });
      qc.invalidateQueries({ queryKey: qk.page(page.id) });
      qc.invalidateQueries({ queryKey: qk.pageByKey(page.pageKey) });
      qc.invalidateQueries({ queryKey: ["mobile"] });
      toast.success("Published successfully");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to publish"),
  });
}
