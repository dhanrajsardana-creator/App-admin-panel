import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Coffee, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tokenStore } from "@/api/axios";
import { ENV } from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [devToken, setDevToken] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Demo entry: the CMS read endpoints are open, so a sentinel token lets the
  // dashboard be explored without completing the full Shopify OAuth round-trip.
  const continueDemo = () => {
    tokenStore.set(devToken.trim() || "demo-session");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-blue-700 p-10 text-white md:flex">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-semibold">{ENV.appName}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              Design your store's mobile experience.
            </h1>
            <p className="mt-3 text-sm text-white/80">
              Build pages, arrange sections and preview exactly what your
              shoppers will see — all without code.
            </p>
          </div>
          <p className="text-xs text-white/60">Powered by your Shopify store</p>
        </div>

        {/* Login form */}
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
          <div>
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your app content.
            </p>
          </div>

          <Button size="lg" onClick={login} className="w-full">
            <ShoppingBag className="h-4 w-4" />
            Continue with Shopify
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Label>Paste an access token (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={devToken}
                onChange={(e) => setDevToken(e.target.value)}
                placeholder="JWT token"
                className="font-mono text-xs"
              />
              <Button variant="outline" onClick={continueDemo}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Continue without a token to explore the builder in demo mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
