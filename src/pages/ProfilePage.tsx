import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Mail, Store, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const initial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase();

  const rows = [
    { icon: User, label: "Name", value: user?.name ?? "—" },
    { icon: Mail, label: "Email", value: user?.email ?? "—" },
    { icon: Store, label: "Shop", value: user?.shop ?? "—" },
    { icon: Shield, label: "Role", value: user?.role ?? "Admin" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-semibold">Profile</h1>
      </header>

      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {initial}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {user?.name ?? "Store Admin"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.email ?? "Signed in"}
              </p>
              <Badge className="mt-1" variant="success">
                Connected
              </Badge>
            </div>
          </div>

          <div className="mt-6 divide-y rounded-lg border">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <r.icon className="h-4 w-4 text-muted-foreground" />
                <span className="w-24 text-muted-foreground">{r.label}</span>
                <span className="flex-1 font-medium">{String(r.value)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Session token
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
              {token ? `${token.slice(0, 32)}${token.length > 32 ? "…" : ""}` : "—"}
            </p>
          </div>

          <Button
            variant="destructive"
            className="mt-6 w-full"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
