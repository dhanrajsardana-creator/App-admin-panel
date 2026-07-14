import { useEffect, useState, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUploadInput } from "@/components/common/ImageUploadInput";
import { Spinner } from "@/components/common/Spinner";
import { useCreateItem, useUpdateItem } from "@/hooks/useItems";
import { useShopifyProducts, useShopifyCollections } from "@/hooks/useShopify";
import type { JsonMap, SectionItem, UpdateItemPayload } from "@/types";
import { SearchableInput } from "@/components/common/SearchableInput";

// ── Item Form Dialog ────────────────────────────────────────────────────────

// ── Inline metadata form ────────────────────────────────────────────────────
// Renders each key of a flat JSON object as a labeled input.
// Booleans → Switch, everything else → text Input.
// Layout: flex-wrap, 3 fields per row.
function MetadataFields({
  meta,
  onChange,
}: {
  meta: JsonMap;
  onChange: (next: JsonMap) => void;
}) {
  const keys = Object.keys(meta);
  if (keys.length === 0) return null;

  const patch = (k: string, v: unknown) => onChange({ ...meta, [k]: v });
  const label = (k: string) =>
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Metadata
      </Label>
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        {keys.map((k) => {
          const val = meta[k];
          const isBool = typeof val === "boolean";
          return (
            <div
              key={k}
              className="flex min-w-0 flex-col gap-1"
              style={{ flexBasis: "calc(33.333% - 8px)", flexGrow: 0, flexShrink: 0 }}
            >
              <Label className="truncate text-[11px]">{label(k)}</Label>
              {isBool ? (
                <Switch
                  checked={val as boolean}
                  onCheckedChange={(v) => patch(k, v)}
                />
              ) : (
                <Input
                  value={String(val ?? "")}
                  onChange={(e) => patch(k, e.target.value)}
                  className="h-8 text-xs"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  sectionType?: string;
  item?: SectionItem | null;
  defaultSortOrder: number;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  sectionId,
  sectionType,
  item,
  defaultSortOrder,
}: ItemFormDialogProps) {
  const isEdit = !!item;
  const createItem = useCreateItem(sectionId);
  const updateItem = useUpdateItem(sectionId);
  const isNewDrop = sectionType === "new_drop_products";
  const isProductShelf = sectionType === "product_shelf";
  const isCategoryProductsShelf = sectionType === "category_products_shelf";
  const { data: allProducts } = useShopifyProducts();
  const { data: allCollections } = useShopifyCollections();

  const [form, setForm] = useState<UpdateItemPayload>({});
  const [metaJson, setMetaJson] = useState<JsonMap>({});

  useEffect(() => {
    if (!open) return;
    const initialMeta = (item?.metadataJson ?? {}) as JsonMap;
    setForm({
      title: item?.title ?? "",
      subtitle: item?.subtitle ?? "",
      imageUrl: item?.imageUrl ?? "",
      mobileImageUrl: item?.mobileImageUrl ?? "",
      videoUrl: item?.videoUrl ?? "",
      badgeText: item?.badgeText ?? "",
      itemType: item?.itemType ?? ((isNewDrop || isProductShelf || isCategoryProductsShelf) ? "product" : ""),
      referenceType: item?.referenceType ?? ((isNewDrop || isProductShelf || isCategoryProductsShelf) ? "PRODUCT" : "NONE"),
      referenceId: item?.referenceId ?? "",
      redirectType: item?.redirectType ?? "",
      redirectValue: item?.redirectValue ?? "",
      metadataJson: initialMeta,
    });
    setMetaJson(initialMeta);
  }, [open, item, isNewDrop, isProductShelf, isCategoryProductsShelf]);

  useEffect(() => {
    if (form.referenceType === "PRODUCT" && form.referenceId && allProducts) {
      const product = allProducts.find((p) => String(p.id) === String(form.referenceId));
      if (product) {
        setForm((f) => ({
          ...f,
          title: f.title || product.title,
          imageUrl: f.imageUrl || product.imageUrl,
          mobileImageUrl: f.mobileImageUrl || product.imageUrl,
          redirectType: "PRODUCT",
          redirectValue: product.id,
        }));
      }
    }
  }, [form.referenceId, form.referenceType, allProducts]);

  const set = (key: keyof UpdateItemPayload, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    let metadataJson: JsonMap = { ...metaJson };
    if (sectionType === "hero_carousel") {
      const titleVal = (form.title as string) || "BEYOND";
      const subtitleVal = (form.subtitle as string) || "ORDINARY";
      const imageVal = (form.imageUrl as string) || "";
      metadataJson.overlayingTexts = [titleVal, subtitleVal];
      metadataJson.backgroundMediaType = "IMAGE";
      metadataJson.backgroundMediaValue = imageVal;
    }
    if (sectionType === "lookbook_grid") {
      const titleVal = (form.title as string) || "SHOP";
      const imageVal = (form.imageUrl as string) || "";
      metadataJson.overlayingTexts = [titleVal];
      metadataJson.backgroundMediaType = metadataJson.backgroundMediaType || "IMAGE";
      metadataJson.backgroundMediaValue = imageVal;
    }
    const payload: UpdateItemPayload = {
      ...form,
      referenceType:
        !form.referenceType || form.referenceType === "NONE" ? null : (form.referenceType as string),
      referenceId: !form.referenceId ? null : (form.referenceId as string),
      redirectType:
        !form.redirectType || form.redirectType === "NONE" ? null : (form.redirectType as string),
      redirectValue: !form.redirectValue ? null : (form.redirectValue as string),
      metadataJson,
    };
    if (form.referenceType === "PRODUCT" && form.referenceId && allProducts) {
      const product = allProducts.find((p) => String(p.id) === String(form.referenceId));
      if (product) {
        payload.title = payload.title || product.title;
        payload.imageUrl = payload.imageUrl || product.imageUrl;
        payload.mobileImageUrl = payload.mobileImageUrl || product.imageUrl;
        payload.redirectType = "PRODUCT";
        payload.redirectValue = product.id;
        payload.metadataJson = {
          ...(payload.metadataJson ?? {}),
          productHandle: product.handle,
          productId: product.id,
        };
      }
    }
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
  const isHeroCarousel = sectionType === "hero_carousel";
  const isMoodGrid = sectionType === "mood_grid";
  const isPromoHero = sectionType === "promo_hero";
  const isCategoryGrid = sectionType === "category_grid";
  const isExclusiveOffers = sectionType === "exlusive_offers";
  const isLookbookGrid = sectionType === "lookbook_grid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>
            Items hold the content rendered inside this section.
          </DialogDescription>
        </DialogHeader>

        {isHeroCarousel || isLookbookGrid ? (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>{isLookbookGrid ? "Card Label (e.g. SHOP TOPWEAR)" : "Overlay Title (BEYOND)"}</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            {!isLookbookGrid && (
              <div className="space-y-1.5">
                <Label>Overlay Subtitle (ORDINARY)</Label>
                <Input
                  value={(form.subtitle as string) ?? ""}
                  onChange={(e) => set("subtitle", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Image URL / Link</Label>
              <Input
                value={(form.imageUrl as string) ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, imageUrl: val, mobileImageUrl: val }));
                }}
                placeholder="https://…"
              />
            </div>
            {(form.imageUrl as string) ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={form.imageUrl as string}
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : isMoodGrid ? (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL / Link</Label>
              <Input
                value={(form.imageUrl as string) ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, imageUrl: val, mobileImageUrl: val }));
                }}
                placeholder="https://…"
              />
            </div>
            {(form.imageUrl as string) ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={form.imageUrl as string}
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : (isCategoryGrid || isExclusiveOffers) ? (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Redirect Type</Label>
                <Select
                  value={(form.redirectType as string) ?? "NONE"}
                  onValueChange={(v) => set("redirectType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">NONE</SelectItem>
                    <SelectItem value="COLLECTION">COLLECTION</SelectItem>
                    <SelectItem value="PRODUCT">PRODUCT</SelectItem>
                    <SelectItem value="URL">URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Redirect Value</Label>
                {form.redirectType === "PRODUCT" || form.redirectType === "COLLECTION" || form.redirectType === "CATEGORY" ? (
                  <SearchableInput
                    value={(form.redirectValue as string) ?? ""}
                    placeholder="Search handle..."
                    options={
                      form.redirectType === "PRODUCT" 
                        ? (allProducts || []).map(p => ({ label: p.title, value: p.handle }))
                        : (allCollections || []).map(c => ({ label: c.title, value: c.handle }))
                    }
                    onChange={(val) => {
                      setForm(f => {
                        const next = { ...f, redirectValue: val };
                        if (next.redirectType === "PRODUCT") {
                          const p = allProducts?.find(p => p.handle === val);
                          if (p) { next.referenceType = "PRODUCT"; next.referenceId = p.id; }
                        } else {
                          const c = allCollections?.find(c => c.handle === val);
                          if (c) { next.referenceType = "COLLECTION"; next.referenceId = c.id; }
                        }
                        return next;
                      });
                    }}
                  />
                ) : (
                  <Input
                    value={(form.redirectValue as string) ?? ""}
                    onChange={(e) => set("redirectValue", e.target.value)}
                    placeholder="e.g. bottoms-jeans-cargo"
                  />
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Media Type</Label>
                <Select
                  value={((form.metadataJson as Record<string, unknown>)?.backgroundMediaType as string) || "IMAGE"}
                  onValueChange={(v) => {
                    setForm((f) => ({
                      ...f,
                      metadataJson: {
                        ...((f.metadataJson as Record<string, unknown>) ?? {}),
                        backgroundMediaType: v,
                      },
                    }));
                    setMetaJson((m) => ({ ...m, backgroundMediaType: v }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">IMAGE</SelectItem>
                    <SelectItem value="GIF">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Media URL</Label>
                <Input
                  value={(((form.metadataJson as Record<string, unknown>)?.backgroundMediaValue as string) || (form.imageUrl as string)) ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({ 
                      ...f, 
                      imageUrl: val,
                      mobileImageUrl: val,
                      metadataJson: { 
                        ...((f.metadataJson as Record<string, unknown>) ?? {}), 
                        backgroundMediaValue: val,
                      } 
                    }));
                    setMetaJson((m) => ({
                      ...m,
                      backgroundMediaValue: val,
                    }));
                  }}
                  placeholder="https://…"
                />
              </div>
            </div>
            {(((form.metadataJson as Record<string, unknown>)?.backgroundMediaValue as string) || (form.imageUrl as string)) ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={(((form.metadataJson as Record<string, unknown>)?.backgroundMediaValue as string) || (form.imageUrl as string))}
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : (isNewDrop || isProductShelf || isCategoryProductsShelf) ? (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Tab Title</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Best Sellers"
              />
            </div>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Redirect Type</Label>
                <Select
                  value={(form.redirectType as string) ?? "NONE"}
                  onValueChange={(v) => set("redirectType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">NONE</SelectItem>
                    <SelectItem value="COLLECTION">COLLECTION</SelectItem>
                    <SelectItem value="PRODUCT">PRODUCT</SelectItem>
                    <SelectItem value="URL">URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Redirect Value</Label>
                {form.redirectType === "PRODUCT" || form.redirectType === "COLLECTION" || form.redirectType === "CATEGORY" ? (
                  <SearchableInput
                    value={(form.redirectValue as string) ?? ""}
                    placeholder="Search handle..."
                    options={
                      form.redirectType === "PRODUCT" 
                        ? (allProducts || []).map(p => ({ label: p.title, value: p.handle }))
                        : (allCollections || []).map(c => ({ label: c.title, value: c.handle }))
                    }
                    onChange={(val) => {
                      setForm(f => {
                        const next = { ...f, redirectValue: val };
                        if (next.redirectType === "PRODUCT") {
                          const p = allProducts?.find(p => p.handle === val);
                          if (p) { next.referenceType = "PRODUCT"; next.referenceId = p.id; }
                        } else {
                          const c = allCollections?.find(c => c.handle === val);
                          if (c) { next.referenceType = "COLLECTION"; next.referenceId = c.id; }
                        }
                        return next;
                      });
                    }}
                  />
                ) : (
                  <Input
                    value={(form.redirectValue as string) ?? ""}
                    onChange={(e) => set("redirectValue", e.target.value)}
                    placeholder="e.g. tops-tshirts"
                  />
                )}
              </div>
            </div>
          </div>
        ) : isPromoHero ? (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Card Text</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL / Link</Label>
              <ImageUploadInput
                value={(form.imageUrl as string) ?? ""}
                onChange={(val) => {
                  setForm((f) => ({ ...f, imageUrl: val, mobileImageUrl: val }));
                }}
                placeholder="https://…"
              />
            </div>
            {(form.imageUrl as string) ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={form.imageUrl as string}
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={(form.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            {!isProductShelf && (
              <div className="space-y-1.5">
                <Label>Subtitle</Label>
                <Input
                  value={(form.subtitle as string) ?? ""}
                  onChange={(e) => set("subtitle", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <ImageUploadInput
                value={(form.imageUrl as string) ?? ""}
                onChange={(val) => {
                  setForm((f) => ({
                    ...f,
                    imageUrl: val,
                    mobileImageUrl: val,
                    metadataJson: {
                      ...(f.metadataJson ?? {}),
                      backgroundMediaValue: val,
                    },
                  }));
                }}
                placeholder="https://…"
              />
            </div>
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
            {(form.imageUrl as string) && isProductShelf ? (
              <div className="overflow-hidden rounded-md border bg-muted p-1">
                <img
                  src={form.imageUrl as string}
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="grid gap-3">
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



            {Object.keys(metaJson).length > 0 && (
              <MetadataFields
                meta={metaJson}
                onChange={(next) => {
                  setMetaJson(next);
                  setForm((f) => ({ ...f, metadataJson: next }));
                }}
              />
            )}
          </div>
        )}

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
