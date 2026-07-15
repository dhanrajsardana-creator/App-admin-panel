import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Boxes,
  MoreVertical,
  Pencil,
  Trash2,
  Circle,
  Copy,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/common/Spinner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SYSTEM_PAGES, CUSTOM_PAGE_TYPES } from "@/config/pageNav";
import { ENV } from "@/config/env";
import { useDeletePage, usePages } from "@/hooks/usePages";
import { useShopifyCollections, useShopifyProducts } from "@/hooks/useShopify";
import { useBuilderStore } from "@/store/builderStore";
import { SectionList } from "./SectionList";
import { PageFormDialog } from "./PageFormDialog";
import { PreviewImage } from "./sections/primitives";
import type { Page, PageType } from "@/types";

/** Expandable list of live Shopify collections/products under a system slot. */
function CatalogSlot({
  icon: Icon,
  label,
  source,
  open,
  onToggle,
  search,
}: {
  icon: LucideIcon;
  label: string;
  source: "collections" | "products";
  open: boolean;
  onToggle: () => void;
  search: string;
}) {
  const collectionsQ = useShopifyCollections();
  const productsQ = useShopifyProducts();
  const selectCatalog = useBuilderStore((s) => s.selectCatalog);
  const catalogPreview = useBuilderStore((s) => s.catalogPreview);
  const q = search.trim().toLowerCase();

  const isCollections = source === "collections";
  const query = isCollections ? collectionsQ : productsQ;
  const kind = isCollections ? "collection" : "product";

  const rows = (query.data ?? [])
    .map((item) => ({
      id: item.id,
      title: item.title,
      handle: item.handle,
      imageUrl: item.imageUrl,
      meta:
        "productsCount" in item
          ? (item as { productsCount: number }).productsCount > 0
            ? `${(item as { productsCount: number }).productsCount} products`
            : ""
          : (item as { productType: string | null }).productType ?? "",
    }))
    .filter((r) => !q || r.title.toLowerCase().includes(q));

  const copyId = (id: string, title: string) => {
    navigator.clipboard?.writeText(id).then(
      () => toast.success(`Copied ${isCollections ? "collection" : "product"} ID`, {
        description: `${title} · ${id}`,
      }),
      () => toast.error("Could not copy ID")
    );
  };

  const indexKind = isCollections ? "collection-index" : "product-index";
  const indexActive = catalogPreview?.kind === indexKind;

  return (
    <div>
      <button
        onClick={() => {
          // Show the full list screen in the preview, and expand the sublist.
          selectCatalog({ kind: indexKind });
          if (!open) onToggle();
        }}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent",
          indexActive ? "bg-primary/10 font-medium text-primary" : "text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {query.isFetched && (
          <span className="text-[11px] text-muted-foreground">{rows.length}</span>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="rounded p-0.5 hover:bg-background"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      </button>

      {open && (
        <div className="ml-3 space-y-0.5 border-l pl-2">
          {query.isLoading ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Spinner /> Loading {source}…
            </div>
          ) : query.isError ? (
            <p className="px-2 py-1.5 text-xs text-destructive">
              Couldn't load Shopify {source}. Check the dev proxy / token.
            </p>
          ) : rows.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No {source} found.
            </p>
          ) : (
            <div className="max-h-72 space-y-0.5 overflow-y-auto scrollbar-thin pr-1">
              {rows.map((r) => {
                const active =
                  catalogPreview?.kind === kind && catalogPreview.id === r.id;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <button
                      onClick={() =>
                        selectCatalog({
                          kind,
                          id: r.id,
                          handle: r.handle,
                          title: r.title,
                          imageUrl: r.imageUrl,
                        })
                      }
                      title={`Preview ${r.title}`}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded bg-muted">
                        <PreviewImage src={r.imageUrl} className="h-full w-full" />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px]">{r.title}</span>
                        {r.meta && (
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {r.meta}
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => copyId(r.id, r.title)}
                      title="Copy ID"
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-background hover:text-foreground group-hover:opacity-100"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A single selectable page row (used inside expandable groups). */
function PageRow({
  page,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  page: Page;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "hover:bg-accent"
      )}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
      >
        <Circle
          className={cn(
            "h-2 w-2 shrink-0",
            page.isPublished
              ? "fill-emerald-500 text-emerald-500"
              : "fill-amber-400 text-amber-400"
          )}
        />
        <span className="truncate">{page.name}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded p-0.5 opacity-0 hover:bg-background group-hover:opacity-100">
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** An expandable group header (Custom pages / Others). */
function GroupHeader({
  icon: Icon,
  label,
  count,
  open,
  onToggle,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground hover:bg-accent"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <span className="text-[11px] text-muted-foreground">{count}</span>
      )}
      {open ? (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

/** The selected page's sections, rendered inline directly beneath its row. */
function InlineSections({ pageId }: { pageId: string }) {
  return (
    <div className="my-1.5 ml-2 border-l-2 border-primary/40 pl-2.5">
      <SectionList pageId={pageId} />
    </div>
  );
}

export function LeftSidebar() {
  const { data: pages, isLoading } = usePages();
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectPage = useBuilderStore((s) => s.selectPage);
  const search = useBuilderStore((s) => s.pageSearch);
  const setSearch = useBuilderStore((s) => s.setPageSearch);

  const deletePage = useDeletePage();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    custom: true,
    others: true,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<PageType>("CUSTOM");
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null);
  // Whether the selected page's inline sections are collapsed (hidden).
  const [sectionsHidden, setSectionsHidden] = useState(false);

  const toggleGroup = (key: string) =>
    setOpenGroups((g) => ({ ...g, [key]: !g[key] }));

  // Click a page: select it (showing sections), or toggle sections if already selected.
  const handlePageClick = (id: string) => {
    if (id === selectedPageId) {
      setSectionsHidden((h) => !h);
    } else {
      selectPage(id);
      setSectionsHidden(false);
    }
  };

  const q = search.trim().toLowerCase();
  const matches = (p: Page) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    p.slug.toLowerCase().includes(q) ||
    p.pageKey.toLowerCase().includes(q);

  const allPages = useMemo(() => (pages ?? []).filter(matches), [pages, q]);

  const resolvePageGroupType = (p: Page): PageType => {
    const key = p.pageKey.toUpperCase();
    if (key.includes("HOME")) return "HOME";
    if (key.includes("COLLECTION")) return "COLLECTION";
    if (key.includes("PRODUCT") || key === "SEARCH_HOME") return "PRODUCT";
    if (key.includes("CART")) return "CART";
    if (key.includes("ACCOUNT") || key.includes("PROFILE")) return "ACCOUNT";
    return p.pageType;
  };

  // Group pages: one bucket per system slot, plus Custom and Others.
  const { slots, customPages, otherPages } = useMemo(() => {
    const systemTypes = new Set<PageType>(SYSTEM_PAGES.map((s) => s.pageType));
    const slots = SYSTEM_PAGES.map((slot) => ({
      ...slot,
      pages: allPages.filter((p) => resolvePageGroupType(p) === slot.pageType),
    }));
    const customPages = allPages.filter((p) =>
      CUSTOM_PAGE_TYPES.includes(resolvePageGroupType(p))
    );
    const otherPages = allPages.filter((p) => {
      const resolvedType = resolvePageGroupType(p);
      return !systemTypes.has(resolvedType) && !CUSTOM_PAGE_TYPES.includes(resolvedType);
    });
    return { slots, customPages, otherPages };
  }, [allPages]);

  const selectedPage = (pages ?? []).find((p) => p.id === selectedPageId) ?? null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r bg-card">
      {/* Selected page header */}
      {selectedPage && (
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-semibold">
              {selectedPage.name}
            </span>
            <Badge variant={selectedPage.isPublished ? "success" : "warning"}>
              {selectedPage.isPublished ? "Live" : "Draft"}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {selectedPage.publishedAt
              ? `Last published: ${new Date(
                  selectedPage.publishedAt
                ).toLocaleString()}`
              : `/${selectedPage.slug.replace(/^\//, "")}`}
          </p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin p-3">
        {/* Pages header + search */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pages
          </h3>
          <Button
            size="icon-sm"
            onClick={() => {
              setCreateType("CUSTOM");
              setCreateOpen(true);
            }}
            title="Create page"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="pl-8"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : (
          <nav className="space-y-0.5">
            {/* System slots */}
            {slots.map((slot) => {
              const single = slot.pages.length <= 1;
              const slotPage = slot.pages[0];
              const isOpen = openGroups[slot.key] ?? false;
              const containsSelected = slot.pages.some(
                (p) => p.id === selectedPageId
              );

              // No CMS page but a catalog source → browse live Shopify data.
              if (!slotPage && slot.catalog && ENV.shopifyEnabled) {
                return (
                  <CatalogSlot
                    key={slot.key}
                    icon={slot.icon}
                    label={slot.label}
                    source={slot.catalog}
                    open={openGroups[slot.key] ?? false}
                    onToggle={() => toggleGroup(slot.key)}
                    search={search}
                  />
                );
              }

              // 0–1 page → a direct row (create if empty, select if present).
              if (single) {
                const active = !!slotPage && slotPage.id === selectedPageId;
                return (
                  <div key={slot.key}>
                    <button
                      onClick={() => {
                        if (slotPage) handlePageClick(slotPage.id);
                        else {
                          setCreateType(slot.pageType);
                          setCreateOpen(true);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <slot.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{slot.label}</span>
                      {!slotPage && (
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    {active && slotPage && !sectionsHidden && (
                      <InlineSections pageId={slotPage.id} />
                    )}
                  </div>
                );
              }

              // Multiple pages of this type → expandable group.
              return (
                <div key={slot.key}>
                  <button
                    onClick={() => toggleGroup(slot.key)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent",
                      containsSelected && !isOpen
                        ? "font-medium text-primary"
                        : "text-foreground"
                    )}
                  >
                    <slot.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{slot.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {slot.pages.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="ml-3 space-y-0.5 border-l pl-2">
                      {slot.pages.map((p) => (
                        <div key={p.id}>
                          <PageRow
                            page={p}
                            active={p.id === selectedPageId}
                            onSelect={() => handlePageClick(p.id)}
                            onEdit={() => setEditPage(p)}
                            onDelete={() => setPendingDelete(p)}
                          />
                          {p.id === selectedPageId && !sectionsHidden && (
                            <InlineSections pageId={p.id} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom pages group */}
            <GroupHeader
              icon={FileText}
              label="Custom pages"
              count={customPages.length}
              open={openGroups.custom}
              onToggle={() => toggleGroup("custom")}
            />
            {openGroups.custom && (
              <div className="ml-3 space-y-0.5 border-l pl-2">
                {customPages.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    No custom pages
                  </p>
                ) : (
                  customPages.map((p) => (
                    <div key={p.id}>
                      <PageRow
                        page={p}
                        active={p.id === selectedPageId}
                        onSelect={() => handlePageClick(p.id)}
                        onEdit={() => setEditPage(p)}
                        onDelete={() => setPendingDelete(p)}
                      />
                      {p.id === selectedPageId && !sectionsHidden && (
                        <InlineSections pageId={p.id} />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Others group (page types without a dedicated slot, e.g. CATEGORY) */}
            {otherPages.length > 0 && (
              <>
                <GroupHeader
                  icon={Boxes}
                  label="Others"
                  count={otherPages.length}
                  open={openGroups.others}
                  onToggle={() => toggleGroup("others")}
                />
                {openGroups.others && (
                  <div className="ml-3 space-y-0.5 border-l pl-2">
                    {otherPages.map((p) => (
                      <div key={p.id}>
                        <PageRow
                          page={p}
                          active={p.id === selectedPageId}
                          onSelect={() => handlePageClick(p.id)}
                          onEdit={() => setEditPage(p)}
                          onDelete={() => setPendingDelete(p)}
                        />
                        {p.id === selectedPageId && !sectionsHidden && (
                          <InlineSections pageId={p.id} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </nav>
        )}

      </div>

      {/* Page edit footer when a page is selected */}
      {selectedPage && (
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setEditPage(selectedPage)}
          >
            <Pencil className="h-4 w-4" /> Page settings
          </Button>
        </div>
      )}

      <PageFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultPageType={createType}
        onCreated={(p) => selectPage(p.id)}
      />
      <PageFormDialog
        open={!!editPage}
        onOpenChange={(o) => !o && setEditPage(null)}
        page={editPage}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete page?"
        description={`"${pendingDelete?.name}" and all its sections will be permanently removed.`}
        destructive
        confirmLabel="Delete page"
        loading={deletePage.isPending}
        onConfirm={() =>
          pendingDelete &&
          deletePage.mutate(pendingDelete.id, {
            onSuccess: () => {
              if (pendingDelete.id === selectedPageId) selectPage(null);
              setPendingDelete(null);
            },
          })
        }
      />
    </aside>
  );
}
