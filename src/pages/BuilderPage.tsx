import { useEffect, useState } from "react";
import { TopBar } from "@/features/builder/TopBar";
import { LeftSidebar } from "@/features/builder/LeftSidebar";
import { CenterPreview } from "@/features/builder/CenterPreview";
import { RightPanel } from "@/features/builder/RightPanel";
import { usePages } from "@/hooks/usePages";
import { useBuilderStore } from "@/store/builderStore";
import { useStaticPages } from "@/hooks/useStaticPages";
import { ENV } from "@/config/env";
import { DiscountsDashboard } from "@/features/discounts/DiscountsDashboard";
import { StaticPageEditor } from "@/features/staticPages/StaticPageEditor";

export function BuilderPage() {
  const { data: pages } = usePages();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectPage = useBuilderStore((s) => s.selectPage);
  const selectedStaticPageId = useBuilderStore((s) => s.selectedStaticPageId);
  const [activeTab, setActiveTab] = useState("design");

  // Fetch static pages so we can look up the selected one.
  const { data: staticPages } = useStaticPages();
  const selectedStaticPage = staticPages?.find((sp) => sp.id === selectedStaticPageId) ?? null;

  // Auto-select the Home page (or the first page) once pages load.
  useEffect(() => {
    if (selectedPageId || selectedStaticPageId || !pages || pages.length === 0) return;
    const home =
      pages.find((p) => p.pageKey === ENV.defaultPageKey) ??
      pages.find((p) => p.pageType === "HOME") ??
      pages[0];
    selectPage(home.id);
  }, [pages, selectedPageId, selectedStaticPageId, selectPage]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "design" ? (
        <div className="flex min-h-0 flex-1">
          <LeftSidebar />
          {/* When a static page is active, replace center+right with the CKEditor panel */}
          {selectedStaticPage ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <StaticPageEditor page={selectedStaticPage} />
            </div>
          ) : (
            <>
              <CenterPreview />
              <RightPanel />
            </>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-auto bg-background p-6">
          <DiscountsDashboard />
        </div>
      )}
    </div>
  );
}
