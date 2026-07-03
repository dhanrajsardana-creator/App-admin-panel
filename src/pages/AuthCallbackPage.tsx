import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStore } from "@/api/axios";
import { FullSpinner } from "@/components/common/Spinner";

/**
 * Landing route for the Shopify OAuth redirect. The backend appends the JWT as
 * ?token=… (or #token=…); we persist it and bounce into the builder.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search || window.location.hash.replace(/^#/, "?")
    );
    const token =
      params.get("token") ||
      params.get("access_token") ||
      params.get("jwt");

    if (token) {
      tokenStore.set(token);
      navigate("/", { replace: true });
    } else {
      // Login redirect disabled while login functionality is turned off.
      // navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <FullSpinner label="Signing you in…" />;
}
