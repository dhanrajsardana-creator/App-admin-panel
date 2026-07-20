import { useEffect, useMemo } from "react";
import { RefreshCw, Smartphone, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FullSpinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builderStore";
import { usePage } from "@/hooks/usePages";
import { usePageSections } from "@/hooks/useSections";
import { useMobilePreview } from "@/hooks/useMobilePreview";
import { useShopifyProducts } from "@/hooks/useShopify";
import { ENV } from "@/config/env";
import { bffAdapter } from "@/helpers/bffAdapter";
import { PhoneFrame } from "./PhoneFrame";
import { SectionBlock } from "./SectionBlock";
import { CatalogPreview } from "./CatalogPreview";
import { ProductPagePreview } from "./ProductPagePreview";
import { AppScreenPreview } from "./AppScreenPreview";
import { WidgetRenderer } from "./widgets/WidgetRenderers";

export function CenterPreview() {
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const previewSource = useBuilderStore((s) => s.previewSource);
  const catalogPreview = useBuilderStore((s) => s.catalogPreview);
  const appScreen = useBuilderStore((s) => s.appScreen);
  const pdpPreviewHandle = useBuilderStore((s) => s.pdpPreviewHandle);
  const setPdpPreviewHandle = useBuilderStore((s) => s.setPdpPreviewHandle);

  const { data: page } = usePage(selectedPageId);
  const { data: draftSections, isLoading: loadingDraft } =
    usePageSections(page?.pageKey ?? null);

  const isMobileMode = previewSource === "mobile";
  const mobile = useMobilePreview(page?.pageKey ?? null, isMobileMode);

  // PRODUCT-type pages preview as a real product detail page (Storefront data).
  const isPdp = page?.pageType === "PRODUCT" && ENV.shopifyEnabled && page?.pageKey !== "SEARCH_HOME";
  const products = useShopifyProducts();

  // Scroll selected section into view inside the mobile preview frame
  useEffect(() => {
    if (!selectedSectionId) return;
    const timer = setTimeout(() => {
      const element = document.getElementById(`section-${selectedSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  // Draft mode: raw sections sorted by sortOrder (unchanged behaviour).
  const draftSectionsSorted = useMemo(() => {
    return [...(draftSections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [draftSections]);

  // Mobile mode: sections sorted → run through bffAdapter → UIWidget[].
  // This is the SAME pipeline the real mobile app uses:
  //   BFFSection[] → bffAdapter.sectionToWidget() → UIWidget[] → WidgetRenderer
  const mobileWidgets = useMemo(() => {
    const rawSections = [...(mobile.data?.sections ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    return rawSections
      .map((section) => bffAdapter.sectionToWidget(section))
      .filter((w): w is NonNullable<typeof w> => w !== null);
  }, [mobile.data]);

  // A static app screen (wishlist/account) opened from the bottom tab bar.
  if (appScreen) {
    return (
      <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-muted/30">
        <div className="flex w-full items-center justify-center gap-2 px-4 py-3">
          <Badge variant="secondary">App screen</Badge>
          <span className="text-sm font-medium capitalize text-muted-foreground">
            {appScreen}
          </span>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-auto pb-8">
          <PhoneFrame>
            <AppScreenPreview screen={appScreen} />
          </PhoneFrame>
        </div>
      </main>
    );
  }

  // A live Shopify collection/product was picked from the left panel.
  if (catalogPreview) {
    const catalogLabel =
      catalogPreview.kind === "collection-index"
        ? "Collections"
        : catalogPreview.kind === "product-index"
        ? "Products"
        : catalogPreview.title;
    return (
      <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-muted/30">
        <div className="flex w-full items-center justify-center gap-2 px-4 py-3">
          <Badge variant="default">Live Shopify</Badge>
          <span className="max-w-[240px] truncate text-sm font-medium text-muted-foreground">
            {catalogLabel}
          </span>
        </div>
        <div className="flex flex-1 items-start justify-center overflow-auto pb-8">
          <PhoneFrame>
            <CatalogPreview catalog={catalogPreview} />
          </PhoneFrame>
        </div>
      </main>
    );
  }

  if (!selectedPageId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/30 text-center">
        <Smartphone className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Select a page to start designing
        </p>
        <p className="text-xs text-muted-foreground/70">
          Pick a page from the left, or create a new one.
        </p>
      </main>
    );
  }

  const loading = isMobileMode ? mobile.isLoading : loadingDraft;

  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-muted/30">
      {/* Preview toolbar */}
      <div className="flex w-full items-center justify-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant={isMobileMode ? "default" : "secondary"}>
            {isMobileMode ? "Live Mobile API" : "Draft preview"}
          </Badge>
          {/* PDP: pick which live product the template previews with. */}
          {isPdp && (
            <select
              value={pdpPreviewHandle ?? products.data?.[0]?.handle ?? ""}
              onChange={(e) => setPdpPreviewHandle(e.target.value || null)}
              className="max-w-[220px] truncate rounded-md border bg-background px-2 py-1 text-xs"
              title="Preview this page with a live product"
            >
              {(products.data ?? []).map((p) => (
                <option key={p.id} value={p.handle}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
          {isMobileMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => mobile.refetch()}
              disabled={mobile.isFetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", mobile.isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex flex-1 items-start justify-center overflow-auto pb-8">
        <PhoneFrame>
          {loading ? (
            <FullSpinner label="Loading preview…" />
          ) : isPdp ? (
            <ProductPagePreview
              sections={draftSectionsSorted}
              selectable={!isMobileMode}
              selectedSectionId={selectedSectionId}
              onSelectSection={selectSection}
            />
          ) : isMobileMode ? (
            // ── Live Mobile API mode ─────────────────────────────────────────
            // Sections go through bffAdapter → UIWidget → WidgetRenderer,
            // exactly mirroring the real mobile app's rendering pipeline.
            mobileWidgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
                <MousePointerClick className="h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-500">
                  No widgets returned by the mobile API
                </p>
                <p className="text-xs text-zinc-400">
                  Make sure this page is published and has sections configured.
                </p>
              </div>
            ) : (
              mobileWidgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} />
              ))
            )
          ) : draftSectionsSorted.length === 0 ? (
            // ── Draft preview mode ───────────────────────────────────────────
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
              <MousePointerClick className="h-8 w-8 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">
                This page has no sections yet
              </p>
              <p className="text-xs text-zinc-400">
                Add a section from the left panel to see it here.
              </p>
            </div>
          ) : (
            draftSectionsSorted.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                embeddedItems={undefined}
                selectable={true}
                selected={selectedSectionId === section.id}
                onSelect={() => selectSection(section.id)}
              />
            ))
          )}
        </PhoneFrame>
      </div>
    </main>
  );
}
