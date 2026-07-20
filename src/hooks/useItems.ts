import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { itemsApi } from "@/api/items";
import { qk } from "./queryKeys";
import { useBuilderStore } from "@/store/builderStore";
import type { SectionItem, UpdateItemPayload, Page, Section } from "@/types";

export function useItems(sectionId: string | null) {
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const qc = useQueryClient();

  const pages = qc.getQueryData<Page[]>(qk.pages);
  const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;

  const { data: page, isLoading, error } = useQuery({
    queryKey: pageKey ? qk.pageByKey(pageKey) : ["pages", "byKey", "none"],
    enabled: !!pageKey,
  });

  const section = page?.sections?.find(s => s.id === sectionId);

  return {
    data: section?.items ?? [],
    isLoading,
    error,
  };
}

export function usePatchItemCache(sectionId: string | null) {
  const qc = useQueryClient();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);

  return (itemId: string, patch: UpdateItemPayload) => {
    if (!sectionId) return;
    const pages = qc.getQueryData<Page[]>(qk.pages);
    const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;
    if (!pageKey) return;

    qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: (prev.sections ?? []).map(s => 
          s.id === sectionId 
            ? { ...s, items: (s.items ?? []).map(it => it.id === itemId ? { ...it, ...patch } as SectionItem : it) } 
            : s
        ),
      };
    });
  };
}

export function useCreateItem(sectionId: string | null) {
  const qc = useQueryClient();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);

  return useMutation({
    mutationFn: async (payload: UpdateItemPayload) => {
      if (!sectionId) throw new Error("No section ID");
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;
      if (!pageKey) throw new Error("No pageKey found");

      const newItem = { id: tempId, sectionId, ...payload } as unknown as SectionItem;

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).map(s => 
            s.id === sectionId ? { ...s, items: [...(s.items ?? []), newItem] } : s
          ),
        };
      });
      return { id: tempId };
    },
    onSuccess: (data) => {
      queueItemAction({ type: 'CREATE', sectionId: sectionId!, tempId: data.id, payload: {} as any }); // dummy to mark dirty
      toast.success("Item added locally (Unsaved)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to add item"),
  });
}

export function useUpdateItem(sectionId: string | null) {
  const qc = useQueryClient();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateItemPayload }) => {
      if (!sectionId) throw new Error("No section ID");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;
      if (!pageKey) throw new Error("No pageKey found");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).map(s => 
            s.id === sectionId 
              ? { ...s, items: (s.items ?? []).map(it => it.id === id ? { ...it, ...payload } as SectionItem : it) } 
              : s
          ),
        };
      });
    },
    onSuccess: () => {
      queueItemAction({ type: 'UPDATE', sectionId: sectionId!, itemId: "", payload: {} as any }); // dummy to mark dirty
      toast.success("Item updated locally (Unsaved)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to save item"),
  });
}

export function useDeleteItem(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  const selectItem = useBuilderStore((s) => s.selectItem);
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!sectionId) throw new Error("No section ID");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;
      if (!pageKey) throw new Error("No pageKey found");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).map(s => 
            s.id === sectionId 
              ? { ...s, items: (s.items ?? []).filter(it => it.id !== id) } 
              : s
          ),
        };
      });
    },
    onSuccess: () => {
      queueItemAction({ type: 'DELETE', sectionId: sectionId!, itemId: "" }); // mark dirty
      selectItem(null);
      toast.success("Item deleted locally (Unsaved)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete item"),
  });
}

export function useReorderItems(sectionId: string | null) {
  const qc = useQueryClient();
  const queueItemAction = useBuilderStore((s) => s.queueItemAction);
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);

  return useMutation({
    mutationFn: async (ordered: SectionItem[]) => {
      if (!sectionId) throw new Error("No section ID");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === selectedPageId)?.pageKey;
      if (!pageKey) throw new Error("No pageKey found");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).map(s => 
            s.id === sectionId 
              ? { ...s, items: ordered.map((it, i) => ({ ...it, sortOrder: i })) } 
              : s
          ),
        };
      });
    },
    onSuccess: () => {
      queueItemAction({ type: 'REORDER', sectionId: sectionId!, ordered: [] }); // mark dirty
    },
    onError: () => {
      toast.error("Failed to reorder items");
    },
  });
}
