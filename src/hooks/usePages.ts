import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { pagesApi } from "@/api/pages";
import { qk } from "./queryKeys";
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
  return useMutation({
    mutationFn: (id: string) => pagesApi.publish(id),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: qk.pages });
      qc.invalidateQueries({ queryKey: qk.page(page.id) });
      toast.success("Published successfully");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to publish"),
  });
}
