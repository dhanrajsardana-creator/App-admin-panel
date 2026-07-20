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
  Page,
} from "@/types";

export function useSections(pageId: string | null) {
  return useQuery({
    queryKey: pageId ? qk.sections(pageId) : ["sections", "none"],
    queryFn: () => sectionsApi.listByPage(pageId as string),
    enabled: !!pageId,
  });
}

import { usePageByKey } from "./usePages";

export function usePageSections(pageKey: string | null) {
  const { data: page, isLoading, error } = usePageByKey(pageKey);
  return {
    data: page?.sections,
    isLoading,
    error,
  };
}

/** Synchronously patch a section in the cache — used for instant preview. */
export function usePatchSectionCache(pageKey: string | null) {
  const qc = useQueryClient();
  return (sectionId: string, patch: UpdateSectionPayload) => {
    if (!pageKey) return;
    qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: (prev.sections ?? []).map((s) =>
          s.id === sectionId ? ({ ...s, ...patch } as Section) : s
        ),
      };
    });
  };
}

export function useCreateSection(pageId: string | null) {
  const qc = useQueryClient();
  const selectSection = useBuilderStore((s) => s.selectSection);
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit);
  
  return useMutation({
    mutationFn: async (payload: CreateSectionPayload) => {
      if (!pageId) throw new Error("No pageId");
      
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === pageId)?.pageKey;
      if (!pageKey) throw new Error("Could not find pageKey for pageId");

      const newSection: Section = {
        id: `temp-${crypto.randomUUID()}`,
        ...payload,
        items: [],
      } as any;

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: [...(prev.sections ?? []), newSection],
        };
      });

      return newSection;
    },
    onSuccess: (section) => {
      if (section) {
        queueSectionEdit(section.id, { ...section }); // Mark as dirty
        selectSection(section.id);
        toast.success("Section added locally (Unsaved)");
      }
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to add section"),
  });
}

export function useUpdateSection(pageId: string | null) {
  const qc = useQueryClient();
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit);
  
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSectionPayload;
    }) => {
      if (!pageId) throw new Error("No pageId");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === pageId)?.pageKey;
      if (!pageKey) throw new Error("Could not find pageKey for pageId");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).map(s => 
            s.id === id ? { ...s, ...payload } as Section : s
          ),
        };
      });

      return { id, payload };
    },
    onSuccess: ({ id, payload }) => {
      queueSectionEdit(id, payload);
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to save section"),
  });
}

export function useDeleteSection(pageId: string | null) {
  const qc = useQueryClient();
  const selectSection = useBuilderStore((s) => s.selectSection);
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit); // To trigger save banner

  return useMutation({
    mutationFn: async (id: string) => {
      if (!pageId) throw new Error("No pageId");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === pageId)?.pageKey;
      if (!pageKey) throw new Error("Could not find pageKey for pageId");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: (prev.sections ?? []).filter(s => s.id !== id),
        };
      });
      return id;
    },
    onSuccess: (id) => {
      queueSectionEdit(id, {}); // Trigger dirty state
      selectSection(null);
      toast.success("Section deleted locally (Unsaved)");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete section"),
  });
}

export function useReorderSections(pageId: string | null) {
  const qc = useQueryClient();
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit);

  return useMutation({
    mutationFn: async (ordered: Section[]) => {
      if (!pageId) throw new Error("No pageId");
      const pages = qc.getQueryData<Page[]>(qk.pages);
      const pageKey = pages?.find(p => p.id === pageId)?.pageKey;
      if (!pageKey) throw new Error("Could not find pageKey for pageId");

      qc.setQueryData<Page>(qk.pageByKey(pageKey), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: ordered.map((s, i) => ({ ...s, sortOrder: i })),
        };
      });
      
      return ordered;
    },
    onSuccess: (ordered) => {
      // Just mark first item dirty to show banner
      if (ordered.length > 0) {
        queueSectionEdit(ordered[0].id, {}); 
      }
    },
    onError: () => {
      toast.error("Failed to reorder sections");
    }
  });
}
