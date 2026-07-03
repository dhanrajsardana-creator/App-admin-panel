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
  return useMutation({
    mutationFn: (payload: UpdateItemPayload) =>
      itemsApi.create(sectionId as string, payload),
    onSuccess: () => {
      if (sectionId) qc.invalidateQueries({ queryKey: qk.items(sectionId) });
      toast.success("Item added");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to add item"),
  });
}

export function useUpdateItem(sectionId: string | null) {
  const qc = useQueryClient();
  const beginSave = useBuilderStore((s) => s.beginSave);
  const endSave = useBuilderStore((s) => s.endSave);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateItemPayload }) => {
      beginSave();
      return itemsApi.update(id, payload);
    },
    onSettled: () => {
      endSave();
      if (sectionId) qc.invalidateQueries({ queryKey: qk.items(sectionId) });
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to save item"),
  });
}

export function useDeleteItem(sectionId: string | null) {
  const qc = useQueryClient();
  const selectItem = useBuilderStore((s) => s.selectItem);
  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      if (sectionId) qc.invalidateQueries({ queryKey: qk.items(sectionId) });
      selectItem(null);
      toast.success("Item deleted");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete item"),
  });
}

export function useReorderItems(sectionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ordered: SectionItem[]) => {
      await itemsApi.reorder(ordered.map((it, i) => ({ id: it.id, sortOrder: i })));
    },
    onMutate: async (ordered: SectionItem[]) => {
      if (!sectionId) return;
      await qc.cancelQueries({ queryKey: qk.items(sectionId) });
      const prev = qc.getQueryData<SectionItem[]>(qk.items(sectionId));
      qc.setQueryData<SectionItem[]>(
        qk.items(sectionId),
        ordered.map((it, i) => ({ ...it, sortOrder: i }))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (sectionId && ctx?.prev) qc.setQueryData(qk.items(sectionId), ctx.prev);
      toast.error("Failed to reorder items");
    },
    onSettled: () => {
      if (sectionId) qc.invalidateQueries({ queryKey: qk.items(sectionId) });
    },
  });
}
