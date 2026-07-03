import { api } from "./axios";
import type {
  ApiResponse,
  CreatePagePayload,
  Page,
  UpdatePagePayload,
} from "@/types";

export const pagesApi = {
  list: async (): Promise<Page[]> => {
    const { data } = await api.get<ApiResponse<Page[]>>("/cms/pages");
    return data.data;
  },

  get: async (pageId: string): Promise<Page> => {
    const { data } = await api.get<ApiResponse<Page>>(`/cms/pages/${pageId}`);
    return data.data;
  },

  create: async (payload: CreatePagePayload): Promise<Page> => {
    const { data } = await api.post<ApiResponse<Page>>("/cms/pages", payload);
    return data.data;
  },

  update: async (pageId: string, payload: UpdatePagePayload): Promise<Page> => {
    const { data } = await api.put<ApiResponse<Page>>(
      `/cms/pages/${pageId}`,
      payload
    );
    return data.data;
  },

  remove: async (pageId: string): Promise<void> => {
    await api.delete(`/cms/pages/${pageId}`);
  },

  // Publish helper — flips status to PUBLISHED. The backend stamps publishedAt.
  publish: async (pageId: string): Promise<Page> => {
    const { data } = await api.put<ApiResponse<Page>>(`/cms/pages/${pageId}`, {
      status: "PUBLISHED",
      isPublished: true,
    });
    return data.data;
  },
};
