import { api, API_BASE_URL } from "./axios";
import { ENV } from "@/config/env";
import type { ApiResponse, AuthUser } from "@/types";

export const authApi = {
  // Full-page redirect into the Shopify OAuth flow handled by the backend.
  // The backend redirects back to the app with a token (see useAuth).
  shopifyLoginUrl: () => `${API_BASE_URL}${ENV.authLoginPath}`,

  me: async (): Promise<AuthUser> => {
    const { data } = await api.get<ApiResponse<AuthUser> | AuthUser>(
      "/auth/me"
    );
    // Tolerate both envelope and bare-object responses.
    const maybe = data as ApiResponse<AuthUser>;
    return (maybe?.data ?? data) as AuthUser;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local logout still proceeds even if the call fails.
    }
  },
};
