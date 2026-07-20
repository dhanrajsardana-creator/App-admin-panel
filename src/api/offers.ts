import { api } from "./axios";
import type {
  ApiResponse,
  Offer,
  CreateOfferPayload,
  UpdateOfferPayload,
} from "@/types";

export const offersApi = {
  list: async (isActive?: boolean): Promise<Offer[]> => {
    const params = isActive !== undefined ? { isActive } : undefined;
    const { data } = await api.get<ApiResponse<Offer[]>>("/cms/offers", { params });
    return data.data;
  },

  create: async (payload: CreateOfferPayload): Promise<Offer> => {
    const { data } = await api.post<ApiResponse<Offer>>("/cms/offers", payload);
    return data.data;
  },

  update: async (offerId: string, payload: UpdateOfferPayload): Promise<Offer> => {
    const { data } = await api.put<ApiResponse<Offer>>(
      `/cms/offers/${offerId}`,
      payload
    );
    return data.data;
  },

  remove: async (offerId: string): Promise<void> => {
    await api.delete(`/cms/offers/${offerId}`);
  },
};
