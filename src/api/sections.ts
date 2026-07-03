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
    const { data } = await api.put<ApiResponse<Section>>(
      `/cms/sections/${sectionId}`,
      payload
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
