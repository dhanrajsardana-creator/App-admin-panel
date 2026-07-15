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
import { Spinner } from "@/components/common/Spinner";
import { useCreatePage, useUpdatePage } from "@/hooks/usePages";
import type { Page, PageType } from "@/types";

interface FormValues {
  name: string;
  slug: string;
  pageKey: string;
  title: string;
  description: string;
}

interface PageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this page; otherwise it creates. */
  page?: Page | null;
  /** Pre-fill the pageType when creating from a system-page slot. */
  defaultPageType?: any;
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
      title: page?.title ?? "",
      description: page?.description ?? "",
    });
  }, [open, page, reset]);

  const getPageTypeFromKey = (key: string): PageType => {
    const upper = key.toUpperCase();
    if (upper.includes("HOME")) return "HOME";
    if (upper.includes("COLLECTION")) return "COLLECTION";
    if (upper.includes("PRODUCT") || upper.includes("SEARCH_HOME")) return "PRODUCT";
    if (upper.includes("CART")) return "CART";
    if (upper.includes("ACCOUNT")) return "ACCOUNT";
    return "CUSTOM";
  };

  const onSubmit = (values: FormValues) => {
    const resolvedPageType = page?.pageType ?? getPageTypeFromKey(values.pageKey);

    const payload = {
      name: values.name,
      slug: values.slug,
      pageKey: values.pageKey,
      title: values.title || null,
      description: values.description || null,
      platform: page?.platform ?? "BOTH",
      pageType: resolvedPageType,
      status: page?.status ?? "DRAFT",
    };

    if (isEdit && page) {
      updatePage.mutate(
        { id: page.id, payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPage.mutate(payload, {
        onSuccess: (created) => {
          onOpenChange(false);
          onCreated?.(created);
        },
      });
    }
  };

  const pending = createPage.isPending || updatePage.isPending;
  const watchName = watch("name");

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
