import { api } from "./axios";
import type { ApiResponse, SectionItem, UpdateItemPayload } from "@/types";

export const itemsApi = {
  listBySection: async (sectionId: string): Promise<SectionItem[]> => {
    const { data } = await api.get<ApiResponse<SectionItem[]>>(
      `/cms/sections/${sectionId}/items`
    );
    return data.data;
  },

  // Some backends expose item creation under the section; supported here too.
  create: async (
    sectionId: string,
    payload: UpdateItemPayload
  ): Promise<SectionItem> => {
    const { data } = await api.post<ApiResponse<SectionItem>>(
      `/cms/sections/${sectionId}/items`,
      payload
    );
    return data.data;
  },

  update: async (
    itemId: string,
    payload: UpdateItemPayload
  ): Promise<SectionItem> => {
    const { data } = await api.put<ApiResponse<SectionItem>>(
      `/cms/items/${itemId}`,
      payload
    );
    return data.data;
  },

  remove: async (itemId: string): Promise<void> => {
    await api.delete(`/cms/items/${itemId}`);
  },

  reorder: async (ordered: { id: string; sortOrder: number }[]): Promise<void> => {
    await Promise.all(
      ordered.map(({ id, sortOrder }) =>
        api.put(`/cms/items/${id}`, { sortOrder })
      )
    );
  },
};
