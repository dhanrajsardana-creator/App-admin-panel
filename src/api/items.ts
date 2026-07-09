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
    const body: Record<string, any> = {};
    if (payload.metadataJson !== undefined)       body.metadataJson = payload.metadataJson;
    if (payload.imageUrl !== undefined)           body.imageUrl = payload.imageUrl;
    if (payload.mobileImageUrl !== undefined)     body.mobileImageUrl = payload.mobileImageUrl;
    if (payload.title !== undefined)              body.title = payload.title;
    if (payload.subtitle !== undefined)           body.subtitle = payload.subtitle;
    if (payload.sortOrder !== undefined)          body.sortOrder = payload.sortOrder;
    if (payload.itemType !== undefined)           body.itemType = payload.itemType;
    if (payload.referenceType !== undefined)      body.referenceType = payload.referenceType;
    if (payload.referenceId !== undefined)        body.referenceId = payload.referenceId;
    if (payload.redirectType !== undefined)       body.redirectType = payload.redirectType;
    if (payload.redirectValue !== undefined)      body.redirectValue = payload.redirectValue;
    if (payload.badgeText !== undefined)          body.badgeText = payload.badgeText;
    if (payload.videoUrl !== undefined)           body.videoUrl = payload.videoUrl;
    if (payload.isActive !== undefined)           body.isActive = payload.isActive;

    const { data } = await api.put<ApiResponse<SectionItem>>(
      `/cms/items/${itemId}`,
      Object.keys(body).length > 0 ? body : payload
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
