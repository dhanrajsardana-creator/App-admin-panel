import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { itemsApi } from "@/api/items";
import { qk } from "./queryKeys";
import { useBuilderStore } from "@/store/builderStore";
import type { SectionItem, UpdateItemPayload } from "@/types";

export function useItems(sectionId: string | null) {
  return useQuery({
    queryKey: sectionId ? qk.items(sectionId) : ["items", "none"],
    queryFn: () => itemsApi.listBySection(sectionId as string),
    enabled: !!sectionId,
  });
}

export function usePatchItemCache(sectionId: string | null) {
  const qc = useQueryClient();
  return (itemId: string, patch: UpdateItemPayload) => {
    if (!sectionId) return;
    qc.setQueryData<SectionItem[]>(qk.items(sectionId), (prev) =>
      (prev ?? []).map((it) =>
        it.id === itemId ? ({ ...it, ...patch } as SectionItem) : it
      )
    );
  };
}

export function useCreateItem(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  return useMutation({
    mutationFn: async (payload: UpdateItemPayload) => {
      if (!sectionId) throw new Error("No section ID");
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      queueItemAction({ type: 'CREATE', sectionId, tempId, payload });
      qc.setQueryData<SectionItem[]>(qk.items(sectionId), (prev) => [
        ...(prev ?? []),
        { id: tempId, sectionId, ...payload } as unknown as SectionItem,
      ]);
      return { id: tempId }; // Mock return since mutation success expects data sometimes
    },
    onSuccess: () => {
      toast.success("Item added locally (Publish to save)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to add item"),
  });
}

export function useUpdateItem(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateItemPayload }) => {
      if (!sectionId) throw new Error("No section ID");
      queueItemAction({ type: 'UPDATE', sectionId, itemId: id, payload });
      qc.setQueryData<SectionItem[]>(qk.items(sectionId), (prev) =>
        (prev ?? []).map((it) =>
          it.id === id ? ({ ...it, ...payload } as SectionItem) : it
        )
      );
    },
    onSuccess: () => {
      toast.success("Item updated locally (Publish to save)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to save item"),
  });
}

export function useDeleteItem(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  const selectItem = useBuilderStore((s) => s.selectItem);
  return useMutation({
    mutationFn: async (id: string) => {
      if (!sectionId) throw new Error("No section ID");
      queueItemAction({ type: 'DELETE', sectionId, itemId: id });
      qc.setQueryData<SectionItem[]>(qk.items(sectionId), (prev) =>
        (prev ?? []).filter((it) => it.id !== id)
      );
    },
    onSuccess: () => {
      selectItem(null);
      toast.success("Item deleted locally (Publish to save)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete item"),
  });
}

export function useReorderItems(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  return useMutation({
    mutationFn: async (ordered: SectionItem[]) => {
      if (!sectionId) throw new Error("No section ID");
      const mapped = ordered.map((it, i) => ({ id: it.id, sortOrder: i }));
      queueItemAction({ type: 'REORDER', sectionId, ordered: mapped });
      
      qc.setQueryData<SectionItem[]>(
        qk.items(sectionId),
        ordered.map((it, i) => ({ ...it, sortOrder: i }))
      );
    },
    onSuccess: () => {
      // toast.success("Items reordered locally"); // Optional, might be noisy
    },
    onError: () => {
      toast.error("Failed to reorder items");
    },
  });
}
