import { api } from "./axios";
import type { ApiResponse } from "@/types";
import type {
  StaticPage,
  CreateStaticPagePayload,
  UpdateStaticPagePayload,
} from "@/types/staticPages";

export const staticPagesApi = {
  list: async (): Promise<StaticPage[]> => {
    const { data } = await api.get<ApiResponse<StaticPage[]>>(
      "/admin/static-pages"
    );
    return data.data;
  },

  get: async (pageId: string): Promise<StaticPage> => {
    const { data } = await api.get<ApiResponse<StaticPage>>(
      `/admin/static-pages/${pageId}`
    );
    return data.data;
  },

  create: async (payload: CreateStaticPagePayload): Promise<StaticPage> => {
    const { data } = await api.post<ApiResponse<StaticPage>>(
      "/admin/static-pages",
      payload
    );
    return data.data;
  },

  update: async (
    pageId: string,
    payload: UpdateStaticPagePayload
  ): Promise<StaticPage> => {
    const { data } = await api.put<ApiResponse<StaticPage>>(
      `/admin/static-pages/${pageId}`,
      payload
    );
    return data.data;
  },

  remove: async (pageId: string): Promise<void> => {
    await api.delete(`/admin/static-pages/${pageId}`);
  },
};
