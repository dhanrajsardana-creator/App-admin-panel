import { useQuery } from "@tanstack/react-query";
import { mobileApi } from "@/api/mobile";
import { qk } from "./queryKeys";

/**
 * Fetches the live mobile API representation of a page for preview validation.
 * HOME_PAGE uses the dedicated /mobile/home endpoint; everything else uses
 * /mobile/pages/{pageKey}. Disabled until explicitly enabled by the caller.
 */
export function useMobilePreview(pageKey: string | null, enabled: boolean) {
  const isHome = pageKey === "HOME_PAGE";
  return useQuery({
    queryKey: isHome ? qk.mobileHome : qk.mobilePage(pageKey ?? "none"),
    queryFn: () =>
      isHome ? mobileApi.home() : mobileApi.pageByKey(pageKey as string),
    enabled: enabled && !!pageKey,
    staleTime: 0,
  });
}
