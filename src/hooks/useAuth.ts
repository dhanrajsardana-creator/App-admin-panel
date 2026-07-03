import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authApi } from "@/api/auth";
import { tokenStore } from "@/api/axios";
import { qk } from "./queryKeys";

export function useAuth() {
  const qc = useQueryClient();
  const token = tokenStore.get();

  const meQuery = useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(() => {
    // Login disabled while auth is commented out.
    // window.location.href = authApi.shopifyLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenStore.clear();
    qc.clear();
    window.location.href = "/login";
  }, [qc]);

  return {
    token,
    isAuthenticated: !!token,
    user: meQuery.data,
    isLoadingUser: meQuery.isLoading,
    login,
    logout,
  };
}
