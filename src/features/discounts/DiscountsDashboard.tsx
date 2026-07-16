import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Percent,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Ticket,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { useShopifyDiscounts, getShopifyDiscountTypeLabel } from "@/hooks/useShopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Spinner } from "@/components/common/Spinner";
import type { Offer, CreateOfferPayload } from "@/types";

// Date helper functions
const formatDate = (isoString?: string) => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const toLocalDatetime = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

const toISODatetime = (localString?: string) => {
  if (!localString) return "";
  try {
    return new Date(localString).toISOString();
  } catch {
    return "";
  }
};

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Offer | null;
  prefillShopify?: any;
}

function OfferFormDialog({ open, onOpenChange, offer, prefillShopify }: OfferFormDialogProps) {
  const isEdit = !!offer;
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const pending = createOffer.isPending || updateOffer.isPending;

  // Fetch Shopify discounts
  const { data: shopifyDiscounts, isLoading: shopifyLoading, isError: shopifyError } = useShopifyDiscounts();

  // Group Shopify discounts by type (bifurcation)
  const groupedShopifyDiscounts = useMemo(() => {
    if (!shopifyDiscounts) return {};
    const groups: Record<string, typeof shopifyDiscounts> = {};
    shopifyDiscounts.forEach((sd) => {
      const label = getShopifyDiscountTypeLabel(sd.typename);
      if (!groups[label]) groups[label] = [];
      groups[label].push(sd);
    });
    return groups;
  }, [shopifyDiscounts]);

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<CreateOfferPayload>({
    defaultValues: {
      title: "",
      description: "",
      badgeText: "",
      shopifyDiscountId: "",
      displayOrder: 1,
      isActive: true,
      startAt: "",
      endAt: "",
    },
  });

  // reset form values when opening or switching offer
  useEffect(() => {
    if (!open) return;
    if (offer) {
      reset({
        title: offer.title ?? "",
        description: offer.description ?? "",
        badgeText: offer.badgeText ?? "",
        shopifyDiscountId: offer.shopifyDiscountId ?? "",
        displayOrder: offer.displayOrder ?? 1,
        isActive: offer.isActive ?? true,
        startAt: offer.startAt ? toLocalDatetime(offer.startAt) : "",
        endAt: offer.endAt ? toLocalDatetime(offer.endAt) : "",
      });
    } else if (prefillShopify) {
      reset({
        title: prefillShopify.title ?? "",
        description: prefillShopify.summary || prefillShopify.title || "",
        badgeText: prefillShopify.codes?.[0] || (prefillShopify.title ? prefillShopify.title.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10) : ""),
        shopifyDiscountId: prefillShopify.id ?? "",
        displayOrder: 1,
        isActive: prefillShopify.status === "ACTIVE",
        startAt: prefillShopify.startsAt ? toLocalDatetime(prefillShopify.startsAt) : "",
        endAt: prefillShopify.endsAt ? toLocalDatetime(prefillShopify.endsAt) : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        badgeText: "",
        shopifyDiscountId: "",
        displayOrder: 1,
        isActive: true,
        startAt: "",
        endAt: "",
      });
    }
  }, [open, offer, prefillShopify, reset]);

  const handleShopifyDiscountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gid = e.target.value;
    if (!gid) return;

    if (gid === "custom") {
      setValue("shopifyDiscountId", "");
      return;
    }

    const matched = shopifyDiscounts?.find((sd) => sd.id === gid);
    if (!matched) return;

    setValue("shopifyDiscountId", matched.id);
    setValue("title", matched.title);
    setValue("description", matched.summary || matched.title);
    
    // Auto-fill code/badge text from first code
    if (matched.codes && matched.codes.length > 0) {
      setValue("badgeText", matched.codes[0]);
    } else {
      // If it is automatic discount (no code), use a slugified/clean uppercase version of title
      const codeSuggestion = matched.title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .map((w) => w.substring(0, 3).toUpperCase())
        .join("")
        .slice(0, 10);
      setValue("badgeText", codeSuggestion || "AUTO_DISC");
    }

    if (matched.startsAt) {
      setValue("startAt", toLocalDatetime(matched.startsAt));
    }
    if (matched.endsAt) {
      setValue("endAt", toLocalDatetime(matched.endsAt));
    } else {
      setValue("endAt", "");
    }
    setValue("isActive", matched.status === "ACTIVE");
  };

  const onSubmit = (values: any) => {
    const payload = {
      ...values,
      displayOrder: Number(values.displayOrder),
      startAt: toISODatetime(values.startAt),
      endAt: toISODatetime(values.endAt),
    };

    if (isEdit && offer) {
      updateOffer.mutate(
        { id: offer.id, payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createOffer.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit CMS Discount Link" : "Link Shopify Discount to CMS"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this discount offer's CMS configuration."
              : "Register this Shopify discount in the CMS to render in the mobile app."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="offer-form">
          {/* Shopify Link Dropdown (Grouped / Bifurcated) */}
          {!isEdit && (
            <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-primary" />
                  Select Shopify Discount (Auto-fill)
                </Label>
                {shopifyLoading && <Spinner className="h-3 w-3" />}
              </div>

              {shopifyError ? (
                <p className="text-[11px] text-destructive">Failed to load Shopify discounts. Enter GID manually below.</p>
              ) : (
                <select
                  onChange={handleShopifyDiscountChange}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={prefillShopify?.id ?? ""}
                >
                  <option value="">-- Choose from Shopify --</option>
                  {Object.entries(groupedShopifyDiscounts).map(([groupName, items]) => (
                    <optgroup key={groupName} label={groupName}>
                      {items.map((item) => {
                        const codeLabel = item.codes.length > 0 ? ` (Code: ${item.codes.join(", ")})` : "";
                        return (
                          <option key={item.id} value={item.id}>
                            {item.title}{codeLabel}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                  <option value="custom">-- Custom GID --</option>
                </select>
              )}
              <p className="text-[10px] text-muted-foreground">
                Selecting a discount will automatically populate the details below.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="shopifyDiscountId">Shopify Discount ID / GID</Label>
            <Input
              id="shopifyDiscountId"
              {...register("shopifyDiscountId", { required: "Shopify Discount ID is required" })}
              placeholder="gid://shopify/DiscountCodeNode/1423878684922"
              className="font-mono text-xs"
              readOnly={isEdit}
            />
            {errors.shopifyDiscountId && <p className="text-xs text-destructive">{errors.shopifyDiscountId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Flat ₹600.00 Off"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="e.g. 10% off Not For Sale"
              rows={2}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="badgeText">Badge Text (Code)</Label>
              <Input
                id="badgeText"
                {...register("badgeText", { required: "Badge Text is required" })}
                placeholder="e.g. CLAIM10"
              />
              {errors.badgeText && <p className="text-xs text-destructive">{errors.badgeText.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                {...register("displayOrder", { required: "Display order is required", min: 1 })}
                placeholder="1"
              />
              {errors.displayOrder && <p className="text-xs text-destructive">{errors.displayOrder.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startAt">Starts At</Label>
              <Input
                id="startAt"
                type="datetime-local"
                {...register("startAt", { required: "Start date is required" })}
              />
              {errors.startAt && <p className="text-xs text-destructive">{errors.startAt.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endAt">Ends At</Label>
              <Input
                id="endAt"
                type="datetime-local"
                {...register("endAt", { required: "End date is required" })}
              />
              {errors.endAt && <p className="text-xs text-destructive">{errors.endAt.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
              <p className="text-xs text-muted-foreground">Toggle whether this discount is currently claimable.</p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="offer-form" disabled={pending}>
            {pending && <Spinner className="mr-2" />}
            {isEdit ? "Save Changes" : "Link Discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DiscountsDashboard() {
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<"all" | "active">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [prefillShopify, setPrefillShopify] = useState<any>(null);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  // Sourced primary list from Shopify GraphQL API
  const { data: shopifyDiscounts, isLoading: shopifyLoading, isError: shopifyError, refetch: refetchShopify } = useShopifyDiscounts();
  // Sourced CMS configurations in background to determine link status
  const { data: cmsOffers, isLoading: cmsLoading, isError: cmsError, refetch: refetchCms } = useOffers();

  const deleteOffer = useDeleteOffer();

  const isLoading = shopifyLoading || cmsLoading;
  const isError = shopifyError || cmsError;

  const refetchAll = () => {
    refetchShopify();
    refetchCms();
  };

  // Map shopify discount GID to CMS Offer config
  const shopifyToCmsMap = useMemo(() => {
    const map = new Map<string, Offer>();
    if (cmsOffers) {
      cmsOffers.forEach((offer) => {
        if (offer.shopifyDiscountId) {
          map.set(offer.shopifyDiscountId, offer);
        }
      });
    }
    return map;
  }, [cmsOffers]);

  // Filter Shopify discounts based on status and search
  const filteredShopifyDiscounts = useMemo(() => {
    if (!shopifyDiscounts) return [];
    const q = search.toLowerCase().trim();

    let list = shopifyDiscounts;
    if (isActiveFilter === "active") {
      list = shopifyDiscounts.filter((sd) => sd.status === "ACTIVE");
    }

    if (!q) return list;
    return list.filter(
      (o) =>
        (o.title || "").toLowerCase().includes(q) ||
        (o.summary || "").toLowerCase().includes(q) ||
        (o.codes || []).some((c) => c.toLowerCase().includes(q))
    );
  }, [shopifyDiscounts, search, isActiveFilter]);

  const handleAddClick = (prefill?: any) => {
    setSelectedOffer(null);
    setPrefillShopify(prefill || null);
    setFormOpen(true);
  };

  const handleEditClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setPrefillShopify(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!offerToDelete) return;
    deleteOffer.mutate(offerToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setOfferToDelete(null);
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts & Offers</h1>
          <p className="text-sm text-muted-foreground">
            Manage Shopify discounts and synchronize them with the mobile app CMS.
          </p>
        </div>
        <Button onClick={() => handleAddClick(null)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Link Custom GID
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Shopify title, summary, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Shopify Status:</span>
            <div className="inline-flex rounded-lg border bg-muted p-0.5">
              <button
                onClick={() => setIsActiveFilter("active")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  isActiveFilter === "active"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setIsActiveFilter("all")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  isActiveFilter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Shopify Offers
              </button>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={refetchAll} title="Refresh list" className="h-9 w-9">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main content table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <Spinner className="h-8 w-8 text-primary" />
            <span className="text-sm text-muted-foreground">Loading Shopify discounts...</span>
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center p-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Failed to load discounts</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                There was an error communicating with Shopify or the CMS backend. Check API access tokens.
              </p>
            </div>
            <Button variant="outline" onClick={refetchAll} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        ) : filteredShopifyDiscounts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center p-6">
            <Ticket className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-medium text-base">No Shopify discounts found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                No active or matching discounts found in your Shopify Admin store.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Shopify Discount</th>
                  <th className="px-6 py-4">Discount Type</th>
                  <th className="px-6 py-4">Shopify Code</th>
                  <th className="px-6 py-4">Shopify Status</th>
                  <th className="px-6 py-4">CMS Config Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredShopifyDiscounts.map((item) => {
                  const cmsOffer = shopifyToCmsMap.get(item.id);
                  const discountType = getShopifyDiscountTypeLabel(item.typename);

                  return (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground">{item.title}</div>
                          {item.summary && <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>}
                          <div className="text-[10px] font-mono text-muted-foreground">GID: {item.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-xs text-foreground bg-secondary px-2.5 py-1 rounded-md border">
                          {discountType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.codes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.codes.map((c) => (
                              <span key={c} className="font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Automatic</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/30"
                              : item.status === "EXPIRED"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/30"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cmsOffer ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              Linked
                            </span>
                            <div className="text-[10px] text-muted-foreground space-y-0.5">
                              <div>Order: <span className="font-semibold text-foreground">{cmsOffer.displayOrder}</span></div>
                              <div className="flex items-center gap-1">
                                <span>CMS Status:</span>
                                <span className={`h-1.5 w-1.5 rounded-full ${cmsOffer.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                                <span className="font-semibold">{cmsOffer.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800/30 dark:text-zinc-400 border-zinc-200/30">
                            Not Linked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {cmsOffer ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(cmsOffer)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit CMS config"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(cmsOffer)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Unlink / Delete from CMS"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddClick(item)}
                              className="h-8 gap-1 text-xs border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary transition-all"
                            >
                              <Plus className="h-3 w-3" /> Link to CMS
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offer creation/edit form */}
      <OfferFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        offer={selectedOffer}
        prefillShopify={prefillShopify}
      />

      {/* Deletion confirm dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Unlink Discount from CMS"
        description={`Are you sure you want to remove the discount "${offerToDelete?.title}" from CMS? It will no longer show in the mobile app, but will remain on Shopify.`}
        confirmLabel="Unlink"
        destructive
        loading={deleteOffer.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
