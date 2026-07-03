import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/common/Spinner";
import { useCreateItem, useUpdateItem } from "@/hooks/useItems";
import type { JsonMap, SectionItem, UpdateItemPayload } from "@/types";

const REFERENCE_TYPES = [
  "NONE",
  "COLLECTION",
  "PRODUCT",
  "CATEGORY",
  "RECENTLY_VIEWED_PRODUCTS",
  "URL",
];

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  item?: SectionItem | null;
  defaultSortOrder: number;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  sectionId,
  item,
  defaultSortOrder,
}: ItemFormDialogProps) {
  const isEdit = !!item;
  const createItem = useCreateItem(sectionId);
  const updateItem = useUpdateItem(sectionId);

  const [form, setForm] = useState<UpdateItemPayload>({});
  const [metaText, setMetaText] = useState("{}");
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: item?.title ?? "",
      subtitle: item?.subtitle ?? "",
      imageUrl: item?.imageUrl ?? "",
      videoUrl: item?.videoUrl ?? "",
      badgeText: item?.badgeText ?? "",
      itemType: item?.itemType ?? "",
      referenceType: item?.referenceType ?? "NONE",
      referenceId: item?.referenceId ?? "",
      redirectType: item?.redirectType ?? "",
      redirectValue: item?.redirectValue ?? "",
      metadataJson: item?.metadataJson ?? {},
    });
    setMetaText(JSON.stringify(item?.metadataJson ?? {}, null, 2));
    setMetaError(null);
  }, [open, item]);

  const set = (key: keyof UpdateItemPayload, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    let metadataJson: JsonMap = {};
    try {
      metadataJson = metaText.trim() ? JSON.parse(metaText) : {};
    } catch {
      setMetaError("Invalid JSON");
      return;
    }
    const payload: UpdateItemPayload = {
      ...form,
      referenceType:
        form.referenceType === "NONE" ? null : (form.referenceType as string),
      metadataJson,
    };
    if (isEdit && item) {
      updateItem.mutate(
        { id: item.id, payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createItem.mutate(
        { ...payload, sortOrder: defaultSortOrder },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const pending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>
            Items hold the content rendered inside this section.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={(form.title as string) ?? ""}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle</Label>
            <Input
              value={(form.subtitle as string) ?? ""}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={(form.imageUrl as string) ?? ""}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Upload image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result;
                  if (typeof result === "string") {
                    set("imageUrl", result);
                    set("metadataJson", {
                      ...(form.metadataJson ?? {}),
                      backgroundMediaValue: result,
                    });
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {((form.metadataJson as JsonMap)?.backgroundMediaValue as string) ||
            (form.imageUrl as string) ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={
                    ((form.metadataJson as JsonMap)?.backgroundMediaValue as string) ||
                    (form.imageUrl as string)
                  }
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Badge text</Label>
              <Input
                value={(form.badgeText as string) ?? ""}
                onChange={(e) => set("badgeText", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Item type</Label>
              <Input
                value={(form.itemType as string) ?? ""}
                onChange={(e) => set("itemType", e.target.value)}
                placeholder="product, category…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reference type</Label>
              <Select
                value={(form.referenceType as string) ?? "NONE"}
                onValueChange={(v) => set("referenceType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFERENCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference ID</Label>
              <Input
                value={(form.referenceId as string) ?? ""}
                onChange={(e) => set("referenceId", e.target.value)}
                placeholder="449620410618"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Metadata JSON</Label>
            <Textarea
              value={metaText}
              onChange={(e) => {
                setMetaText(e.target.value);
                setMetaError(null);
              }}
              className="min-h-[120px] font-mono text-xs"
            />
            {metaError && (
              <p className="text-xs text-destructive">{metaError}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={pending}>
            {pending && <Spinner />}
            {isEdit ? "Save item" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
