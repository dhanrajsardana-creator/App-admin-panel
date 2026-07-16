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
      // ── 1. Flush any locally-queued section edits to the API ──────────────
      const pending = flushPendingEdits();
      // ── 2. Flush pending item actions sequentially ───────────────────────
      const itemActions = flushPendingItemActions();

      try {
        if (pending.length > 0) {
          await Promise.all(
            pending.map(({ id, payload }) => sectionsApi.update(id, payload))
          );
        }

        if (itemActions.length > 0) {
          const idMap = new Map<string, string>(); // Maps temp IDs to real IDs

          for (const action of itemActions) {
            if (action.type === 'CREATE') {
              const created = await itemsApi.create(action.sectionId, action.payload);
              idMap.set(action.tempId, created.id);
            } else if (action.type === 'UPDATE') {
              const realId = idMap.get(action.itemId) || action.itemId;
              await itemsApi.update(realId, action.payload);
            } else if (action.type === 'DELETE') {
              const realId = idMap.get(action.itemId) || action.itemId;
              await itemsApi.remove(realId);
            } else if (action.type === 'REORDER') {
              const mappedOrdered = action.ordered.map(o => ({
                id: idMap.get(o.id) || o.id,
                sortOrder: o.sortOrder
              }));
              await itemsApi.reorder(mappedOrdered);
            }
          }
        }

        // ── 3. Publish the page ───────────────────────────────────────────────
        return await pagesApi.publish(page.id);
      } catch (err) {
        // Restore pending edits and item actions so they aren't lost on failure
        const restoredEdits: Record<string, UpdateSectionPayload> = {};
        for (const { id, payload } of pending) {
          restoredEdits[id] = payload;
        }
        useBuilderStore.setState({
          pendingEdits: {
            ...useBuilderStore.getState().pendingEdits,
            ...restoredEdits,
          },
          pendingItemActions: [
            ...itemActions,
            ...useBuilderStore.getState().pendingItemActions,
          ],
        });
        throw err;
      }
    },
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: qk.pages });
      qc.invalidateQueries({ queryKey: qk.page(page.id) });
      // Re-fetch sections so the UI reflects the freshly-saved state.
      qc.invalidateQueries({ queryKey: qk.sections(page.id) });
      toast.success("Published successfully");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to publish"),
  });
}
