import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { sectionsApi } from "@/api/sections";
import { qk } from "./queryKeys";
import { useBuilderStore } from "@/store/builderStore";
import type {
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from "@/types";

export function useSections(pageId: string | null) {
  return useQuery({
    queryKey: pageId ? qk.sections(pageId) : ["sections", "none"],
    queryFn: () => sectionsApi.listByPage(pageId as string),
    enabled: !!pageId,
  });
}

/** Synchronously patch a section in the cache — used for instant preview. */
export function usePatchSectionCache(pageId: string | null) {
  const qc = useQueryClient();
  return (sectionId: string, patch: UpdateSectionPayload) => {
    if (!pageId) return;
    qc.setQueryData<Section[]>(qk.sections(pageId), (prev) =>
      (prev ?? []).map((s) =>
        s.id === sectionId ? ({ ...s, ...patch } as Section) : s
      )
    );
  };
}

export function useCreateSection(pageId: string | null) {
  const qc = useQueryClient();
  const selectSection = useBuilderStore((s) => s.selectSection);
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) =>
      sectionsApi.create(pageId as string, payload),
    onSuccess: (section) => {
      if (pageId) {
        qc.invalidateQueries({ queryKey: qk.sections(pageId) });
        qc.invalidateQueries({ queryKey: ["mobile"] });
      }
      selectSection(section.id);
      toast.success("Section added");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to add section"),
  });
}

export function useUpdateSection(pageId: string | null) {
  const qc = useQueryClient();
  const beginSave = useBuilderStore((s) => s.beginSave);
  const endSave = useBuilderStore((s) => s.endSave);
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSectionPayload;
    }) => {
      beginSave();
      return sectionsApi.update(id, payload);
    },
    onSettled: (section) => {
      endSave();
      if (pageId) {
        qc.invalidateQueries({ queryKey: qk.sections(pageId) });
        qc.invalidateQueries({ queryKey: ["mobile"] });
      }
      if (section) qc.invalidateQueries({ queryKey: qk.items(section.id) });
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to save section"),
  });
}

export function useDeleteSection(pageId: string | null) {
  const qc = useQueryClient();
  const selectSection = useBuilderStore((s) => s.selectSection);
  return useMutation({
    mutationFn: (id: string) => sectionsApi.remove(id),
    onSuccess: () => {
      if (pageId) {
        qc.invalidateQueries({ queryKey: qk.sections(pageId) });
        qc.invalidateQueries({ queryKey: ["mobile"] });
      }
      selectSection(null);
      toast.success("Section deleted");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete section"),
  });
}

export function useReorderSections(pageId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // Optimistically reorder, then persist all sortOrders.
    mutationFn: async (ordered: Section[]) => {
      await sectionsApi.reorder(
        ordered.map((s, i) => ({ id: s.id, sortOrder: i }))
      );
    },
    onMutate: async (ordered: Section[]) => {
      if (!pageId) return;
      await qc.cancelQueries({ queryKey: qk.sections(pageId) });
      const prev = qc.getQueryData<Section[]>(qk.sections(pageId));
      qc.setQueryData<Section[]>(
        qk.sections(pageId),
        ordered.map((s, i) => ({ ...s, sortOrder: i }))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (pageId && ctx?.prev) qc.setQueryData(qk.sections(pageId), ctx.prev);
      toast.error("Failed to reorder sections");
    },
    onSettled: () => {
      if (pageId) {
        qc.invalidateQueries({ queryKey: qk.sections(pageId) });
        qc.invalidateQueries({ queryKey: ["mobile"] });
      }
    },
  });
}
