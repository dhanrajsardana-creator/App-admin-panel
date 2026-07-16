import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Percent,
  ChevronDown,
  Smartphone,
  Check,
  Loader2,
  Coffee,
  LogOut,
  User,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ENV } from "@/config/env";
import { useBuilderStore } from "@/store/builderStore";
import { usePage, usePublishPage } from "@/hooks/usePages";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { key: "design", label: "Design", icon: LayoutDashboard },
  { key: "discounts", label: "Discounts", icon: Percent },
];

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const navigate = useNavigate();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const previewSource = useBuilderStore((s) => s.previewSource);
  const setPreviewSource = useBuilderStore((s) => s.setPreviewSource);
  const pendingEdits = useBuilderStore((s) => s.pendingEdits);

  const hasChanges = Object.keys(pendingEdits).length > 0;

  const { data: page } = usePage(selectedPageId);
  const publish = usePublishPage();
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
      {/* Brand + nav */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{ENV.appName}</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Unsaved-changes indicator */}
        <div className="mr-1 hidden items-center gap-1.5 text-xs sm:flex">
          {publish.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Publishing…</span>
            </>
          ) : hasChanges ? (
            <>
              {/* Pulsing amber dot */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Unsaved changes
              </span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-muted-foreground">Up to date</span>
            </>
          )}
        </div>

        {/* Preview toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPreviewSource(previewSource === "mobile" ? "draft" : "mobile")
          }
          className={cn(previewSource === "mobile" && "border-primary text-primary")}
        >
          <Smartphone className="h-4 w-4" />
          {previewSource === "mobile" ? "Mobile API" : "Preview"}
        </Button>

        {/* Publish button — highlighted when there are unsaved changes */}
        <Button
          size="sm"
          disabled={!page || publish.isPending}
          onClick={() => page && publish.mutate(page)}
          className={cn(
            hasChanges && !publish.isPending &&
              "animate-pulse bg-primary shadow-[0_0_12px_2px] shadow-primary/40"
          )}
        >
          {publish.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Publish{hasChanges ? " *" : ""}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-1 rounded-full border bg-background py-0.5 pl-0.5 pr-2 hover:bg-accent">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user?.name ?? user?.email ?? "Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
