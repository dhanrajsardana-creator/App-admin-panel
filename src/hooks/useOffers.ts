import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { offersApi } from "@/api/offers";
import { qk } from "./queryKeys";
import type { CreateOfferPayload, Offer, UpdateOfferPayload } from "@/types";

export function useOffers(isActive?: boolean) {
  return useQuery({
    queryKey: qk.offers(isActive),
    queryFn: () => offersApi.list(isActive),
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offersApi.create(payload),
    onSuccess: (offer) => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success(`Discount "${offer.title}" created`);
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to create discount"),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOfferPayload }) =>
      offersApi.update(id, payload),
    onSuccess: (offer: Offer) => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success(`Discount "${offer.title}" updated`);
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to update discount"),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Discount deleted");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Failed to delete discount"),
  });
}
