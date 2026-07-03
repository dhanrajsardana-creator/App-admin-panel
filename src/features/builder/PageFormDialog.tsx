import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useCreatePage, useUpdatePage } from "@/hooks/usePages";
import type { Page, PageStatus, PageType, Platform } from "@/types";

const PAGE_TYPES: PageType[] = [
  "HOME",
  "COLLECTION",
  "PRODUCT",
  "CART",
  "ACCOUNT",
  "LANDING",
  "CUSTOM",
];
const PLATFORMS: Platform[] = ["MOBILE", "WEB", "BOTH"];
const STATUSES: PageStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

interface FormValues {
  name: string;
  slug: string;
  pageKey: string;
  platform: Platform;
  pageType: PageType;
  status: PageStatus;
  title: string;
  description: string;
}

interface PageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this page; otherwise it creates. */
  page?: Page | null;
  /** Pre-fill the pageType when creating from a system-page slot. */
  defaultPageType?: PageType;
  onCreated?: (page: Page) => void;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function PageFormDialog({
  open,
  onOpenChange,
  page,
  defaultPageType,
  onCreated,
}: PageFormDialogProps) {
  const isEdit = !!page;
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      pageKey: "",
      platform: "MOBILE",
      pageType: defaultPageType ?? "HOME",
      status: "DRAFT",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: page?.name ?? "",
      slug: page?.slug ?? "",
      pageKey: page?.pageKey ?? "",
      platform: page?.platform ?? "MOBILE",
      pageType: page?.pageType ?? defaultPageType ?? "HOME",
      status: page?.status ?? "DRAFT",
      title: page?.title ?? "",
      description: page?.description ?? "",
    });
  }, [open, page, defaultPageType, reset]);

  const onSubmit = (values: FormValues) => {
    if (isEdit && page) {
      updatePage.mutate(
        { id: page.id, payload: values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPage.mutate(values, {
        onSuccess: (created) => {
          onOpenChange(false);
          onCreated?.(created);
        },
      });
    }
  };

  const pending = createPage.isPending || updatePage.isPending;
  const watchName = watch("name");
  const watchType = watch("pageType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit page" : "Create page"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the page details."
              : "Add a new page to your mobile app."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3"
          id="page-form"
        >
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              {...register("name", { required: true })}
              placeholder="Home Page"
              onBlur={(e) => {
                if (!watch("slug")) setValue("slug", slugify(e.target.value));
                if (!watch("pageKey"))
                  setValue(
                    "pageKey",
                    `${slugify(e.target.value).replace(/-/g, "_").toUpperCase()}_PAGE`
                  );
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input {...register("slug", { required: true })} placeholder="home" />
            </div>
            <div className="space-y-1.5">
              <Label>Page key</Label>
              <Input
                {...register("pageKey", { required: true })}
                placeholder="HOME_PAGE"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={watchType}
                onValueChange={(v) => setValue("pageType", v as PageType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={watch("platform")}
                onValueChange={(v) => setValue("platform", v as Platform)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as PageStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>SEO title (optional)</Label>
            <Input {...register("title")} placeholder={watchName || "Page title"} />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea {...register("description")} placeholder="Short description" />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="page-form" disabled={pending}>
            {pending && <Spinner />}
            {isEdit ? "Save changes" : "Create page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
