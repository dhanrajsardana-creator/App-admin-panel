import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staticPagesApi } from "@/api/staticPages";
import type {
  CreateStaticPagePayload,
  UpdateStaticPagePayload,
} from "@/types/staticPages";

const STATIC_PAGES_KEY = ["static-pages"] as const;

// ── List ─────────────────────────────────────────────────────────────────────
export function useStaticPages() {
  return useQuery({
    queryKey: STATIC_PAGES_KEY,
    queryFn: staticPagesApi.list,
  });
}

// ── Create ───────────────────────────────────────────────────────────────────
export function useCreateStaticPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaticPagePayload) =>
      staticPagesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STATIC_PAGES_KEY });
      toast.success("Static page created");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to create static page");
    },
  });
}

// ── Update ───────────────────────────────────────────────────────────────────
export function useUpdateStaticPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStaticPagePayload;
    }) => staticPagesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STATIC_PAGES_KEY });
      toast.success("Static page saved");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to save static page");
    },
  });
}

// ── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteStaticPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staticPagesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STATIC_PAGES_KEY });
      toast.success("Static page deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Failed to delete static page");
    },
  });
}
