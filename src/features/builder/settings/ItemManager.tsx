import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useDeleteItem,
  useItems,
  useReorderItems,
} from "@/hooks/useItems";
import { itemImage } from "@/features/builder/sections/primitives";
import { ItemFormDialog } from "./ItemFormDialog";
import type { Section, SectionItem } from "@/types";

function SortableItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: SectionItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const img = itemImage(item);
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="group flex items-center gap-2 rounded-md border bg-card p-2"
    >
      <button
        className="cursor-grab touch-none text-muted-foreground/60"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.title || item.itemType || "Untitled item"}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.referenceType
            ? `${item.referenceType}${item.referenceId ? ` · ${item.referenceId}` : ""}`
            : item.subtitle || "—"}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="rounded p-1 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ItemManager({ section }: { section: Section }) {
  const { data: items, isLoading } = useItems(section.id);
  const reorder = useReorderItems(section.id);
  const deleteItem = useDeleteItem(section.id);

  const [order, setOrder] = useState<SectionItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SectionItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SectionItem | null>(null);

  useEffect(() => {
    if (items)
      setOrder([...items].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      order,
      order.findIndex((i) => i.id === active.id),
      order.findIndex((i) => i.id === over.id)
    );
    setOrder(next);
    reorder.mutate(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Items {order.length > 0 && `(${order.length})`}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditItem(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : order.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          No items yet. Add slides, products or categories to this section.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={order.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {order.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => {
                    setEditItem(item);
                    setFormOpen(true);
                  }}
                  onDelete={() => setPendingDelete(item)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        sectionId={section.id}
        item={editItem}
        defaultSortOrder={order.length}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Delete item?"
        destructive
        confirmLabel="Delete"
        loading={deleteItem.isPending}
        onConfirm={() =>
          pendingDelete &&
          deleteItem.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          })
        }
      />
    </div>
  );
}
