import { api } from "./axios";
import type {
  ApiResponse,
  CreateSectionPayload,
  Section,
  UpdateSectionPayload,
} from "@/types";

export const sectionsApi = {
  listByPage: async (pageId: string): Promise<Section[]> => {
    const { data } = await api.get<ApiResponse<Section[]>>(
      `/cms/pages/${pageId}/sections`
    );
    return data.data;
  },

  create: async (
    pageId: string,
    payload: CreateSectionPayload
  ): Promise<Section> => {
    const { data } = await api.post<ApiResponse<Section>>(
      `/cms/pages/${pageId}/sections`,
      payload
    );
    return data.data;
  },

  update: async (
    sectionId: string,
    payload: UpdateSectionPayload
  ): Promise<Section> => {
    const body: Record<string, any> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.subtitle !== undefined) body.subtitle = payload.subtitle;
    if (payload.sectionKey !== undefined) body.sectionKey = payload.sectionKey;
    if (payload.sectionType !== undefined) body.sectionType = payload.sectionType;
    if (payload.layoutType !== undefined) body.layoutType = payload.layoutType;
    if (payload.visibilityType !== undefined) body.visibilityType = payload.visibilityType;
    if (payload.isVisible !== undefined) body.isVisible = payload.isVisible;
    if (payload.isActive !== undefined) body.isActive = payload.isActive;
    if (payload.sortOrder !== undefined) body.sortOrder = payload.sortOrder;
    if (payload.backgroundColor !== undefined) body.backgroundColor = payload.backgroundColor;
    if (payload.backgroundImage !== undefined) body.backgroundImage = payload.backgroundImage;
    if (payload.configJson !== undefined) body.configJson = payload.configJson;

    const { data } = await api.put<ApiResponse<Section>>(
      `/cms/sections/${sectionId}`,
      Object.keys(body).length > 0 ? body : payload
    );
    return data.data;
  },

  remove: async (sectionId: string): Promise<void> => {
    await api.delete(`/cms/sections/${sectionId}`);
  },

  // Persist a reorder by writing each section's new sortOrder.
  reorder: async (ordered: { id: string; sortOrder: number }[]): Promise<void> => {
    await Promise.all(
      ordered.map(({ id, sortOrder }) =>
        api.put(`/cms/sections/${id}`, { sortOrder })
      )
    );
  },
};
