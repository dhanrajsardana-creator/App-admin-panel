import { api } from "./axios";
import type { ApiResponse, Page } from "@/types";

// The mobile preview endpoints return the page exactly as the mobile app
// consumes it (sections + nested items resolved). Used for preview validation.
export const mobileApi = {
  home: async (): Promise<Page> => {
    const { data } = await api.get<ApiResponse<Page>>("/cms/mobile/home");
    return data.data;
  },

  pageByKey: async (pageKey: string): Promise<Page> => {
    const { data } = await api.get<ApiResponse<{ page: Page } | Page>>(
      `/cms/mobile/pages/${pageKey}`
    );
    // This endpoint nests the page under `data.page`; home returns it flat.
    const payload = data.data as { page?: Page };
    return (payload.page ?? data.data) as Page;
  },
};
