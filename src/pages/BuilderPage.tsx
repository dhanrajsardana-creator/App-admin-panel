import { useEffect } from "react";
import { TopBar } from "@/features/builder/TopBar";
import { LeftSidebar } from "@/features/builder/LeftSidebar";
import { CenterPreview } from "@/features/builder/CenterPreview";
import { RightPanel } from "@/features/builder/RightPanel";
import { usePages } from "@/hooks/usePages";
import { useBuilderStore } from "@/store/builderStore";
import { ENV } from "@/config/env";

export function BuilderPage() {
  const { data: pages } = usePages();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectPage = useBuilderStore((s) => s.selectPage);

  // Auto-select the Home page (or the first page) once pages load.
  useEffect(() => {
    if (selectedPageId || !pages || pages.length === 0) return;
    const home =
      pages.find((p) => p.pageKey === ENV.defaultPageKey) ??
      pages.find((p) => p.pageType === "HOME") ??
      pages[0];
    selectPage(home.id);
  }, [pages, selectedPageId, selectPage]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <CenterPreview />
        <RightPanel />
      </div>
    </div>
  );
}
