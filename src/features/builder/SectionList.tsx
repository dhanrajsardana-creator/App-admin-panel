import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Code2,
  FolderOpen,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Spinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/hooks/queryKeys";
import { usePages } from "@/hooks/usePages";
import { getSectionDef, sectionLabel } from "@/config/sectionCatalog";
import { useBuilderStore } from "@/store/builderStore";
import {
  useDeleteSection,
  useReorderSections,
  useSections,
  useUpdateSection,
  usePatchSectionCache,
} from "@/hooks/useSections";
import { useItems } from "@/hooks/useItems";
import { useShopifyResolver, type ResolvedRef } from "@/hooks/useShopify";
import { AddSectionDialog } from "./AddSectionDialog";
import type { Section, SectionItem } from "@/types";

/**
 * Resolves a section's items to the real Shopify collections/products they
 * reference and renders them as compact chips — so the left bar shows exactly
 * which store items each section is showing.
 */
function SectionRefs({
  sectionId,
  resolve,
}: {
  sectionId: string;
  resolve: (id?: string | null, type?: string | null) => ResolvedRef | null;
}) {
  const { data: items } = useItems(sectionId);
  if (!items || items.length === 0) return null;

  const refs = items
    .map((it) => ({ it, r: resolve(it.referenceId, it.referenceType) }))
    .filter((x) => x.r) as { it: SectionItem; r: ResolvedRef }[];

  if (refs.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1 pl-6">
      {refs.slice(0, 4).map(({ it, r }) => (
        <span
          key={it.id}
          title={`${r.kind}: ${r.title}${
            r.productsCount ? ` (${r.productsCount} products)` : ""
          }`}
          className="inline-flex max-w-[120px] items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          {r.kind === "collection" ? (
            <FolderOpen className="h-2.5 w-2.5 shrink-0" />
          ) : (
            <Package className="h-2.5 w-2.5 shrink-0" />
          )}
          <span className="truncate">{r.title}</span>
        </span>
      ))}
      {refs.length > 4 && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          +{refs.length - 4}
        </span>
      )}
    </div>
  );
}

function SortableSectionRow({
  section,
  selected,
  shopifyEnabled,
  resolve,
  onSelect,
  onToggleVisible,
  onDelete,
  isPdp,
}: {
  section: Section;
  selected: boolean;
  shopifyEnabled: boolean;
  resolve: (id?: string | null, type?: string | null) => ResolvedRef | null;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  isPdp?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  const def = getSectionDef(section.sectionType);
  const Icon = def?.icon ?? Code2;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border px-2 py-2 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-accent",
        !section.isVisible && "opacity-60"
      )}
    >
      <div className="flex items-center gap-1">
        <button
          className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {section.title || sectionLabel(section.sectionType)}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {sectionLabel(section.sectionType)}
            </span>
          </span>
        </button>

        <button
          onClick={onToggleVisible}
          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          title={section.isVisible ? "Hide section" : "Show section"}
        >
          {section.isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
        {!isPdp && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            title="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {shopifyEnabled && <SectionRefs sectionId={section.id} resolve={resolve} />}
    </div>
  );
}

export function SectionList({ pageId }: { pageId: string }) {
  const { data: sections, isLoading } = useSections(pageId);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit);

  const { data: pages } = usePages();
  const page = pages?.find((p) => p.id === pageId) ?? null;
  const isPdp = page?.pageType === "PRODUCT" && page?.pageKey !== "SEARCH_HOME";

  const qc = useQueryClient();
  const patchCache = usePatchSectionCache(pageId);

  const reorder = useReorderSections(pageId);
  const updateSection = useUpdateSection(pageId);
  const deleteSection = useDeleteSection(pageId);
  const { resolve, enabled: shopifyEnabled } = useShopifyResolver();

  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Section | null>(null);
  const [localOrder, setLocalOrder] = useState<Section[]>([]);

  // Keep a local ordered copy so drag feels instant; sync when server data changes.
  useEffect(() => {
    if (sections) {
      const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
      setLocalOrder(sorted);
    }
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localOrder.findIndex((s) => s.id === active.id);
    const newIndex = localOrder.findIndex((s) => s.id === over.id);
    const next = arrayMove(localOrder, oldIndex, newIndex);
    setLocalOrder(next);

    if (isPdp) {
      // Optimistically update the react-query cache with new sortOrders
      const nextWithSort = next.map((s, i) => ({ ...s, sortOrder: i }));
      qc.setQueryData<Section[]>(qk.sections(pageId), nextWithSort);
      // Queue sortOrder edits in the builderStore
      nextWithSort.forEach((s) => {
        queueSectionEdit(s.id, { sortOrder: s.sortOrder });
      });
    } else {
      reorder.mutate(next);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sections {localOrder.length > 0 && `(${localOrder.length})`}
        </h3>
        {!isPdp && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setAddOpen(true)}
            title="Add section"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto scrollbar-thin pr-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : localOrder.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No sections yet.</p>
            {!isPdp && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-4 w-4" /> Add your first section
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localOrder.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {localOrder.map((section) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  selected={selectedSectionId === section.id}
                  shopifyEnabled={shopifyEnabled}
                  resolve={resolve}
                  onSelect={() => selectSection(section.id)}
                  onToggleVisible={() => {
                    if (isPdp) {
                      const nextVisible = !section.isVisible;
                      patchCache(section.id, { isVisible: nextVisible });
                      queueSectionEdit(section.id, { isVisible: nextVisible });
                    } else {
                      updateSection.mutate({
                        id: section.id,
                        payload: { isVisible: !section.isVisible },
                      });
                    }
                  }}
                  onDelete={() => setPendingDelete(section)}
                  isPdp={isPdp}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {!isPdp && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      )}

      <AddSectionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        pageId={pageId}
        existingCount={localOrder.length}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete section?"
        description={`"${
          pendingDelete?.title || sectionLabel(pendingDelete?.sectionType ?? "")
        }" and its items will be removed.`}
        destructive
        confirmLabel="Delete"
        loading={deleteSection.isPending}
        onConfirm={() =>
          pendingDelete &&
          deleteSection.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          })
        }
      />

    </div>
  );
}
