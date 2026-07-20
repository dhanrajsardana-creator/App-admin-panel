import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateStaticPage, useUpdateStaticPage } from "@/hooks/useStaticPages";
import type {
  StaticPage,
  StaticPageType,
  StaticPagePlatform,
  CreateStaticPagePayload,
} from "@/types/staticPages";

const PAGE_TYPES: StaticPageType[] = [
  "ABOUT_US",
  "PRIVACY_POLICY",
  "TERMS_AND_CONDITIONS",
  "REFUND_POLICY",
  "SHIPPING_POLICY",
  "CONTACT_US",
  "FAQ",
  "CUSTOM",
];

const PLATFORMS: StaticPagePlatform[] = ["BOTH", "MOBILE", "WEB"];

interface StaticPageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: StaticPage | null;
  onCreated?: (page: StaticPage) => void;
}

export function StaticPageFormDialog({
  open,
  onOpenChange,
  page,
  onCreated,
}: StaticPageFormDialogProps) {
  const isEdit = !!page;
  const createPage = useCreateStaticPage();
  const updatePage = useUpdateStaticPage();
  const pending = createPage.isPending || updatePage.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateStaticPagePayload>({
    defaultValues: {
      pageType: "CUSTOM",
      slug: "",
      title: "",
      metaTitle: "",
      metaDescription: "",
      content: "",
      platform: "BOTH",
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (page) {
      reset({
        pageType: page.pageType,
        slug: page.slug,
        title: page.title,
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
        content: page.content,
        platform: page.platform,
        status: page.status,
      });
    } else {
      reset({
        pageType: "CUSTOM",
        slug: "",
        title: "",
        metaTitle: "",
        metaDescription: "",
        content: "",
        platform: "BOTH",
        status: "DRAFT",
      });
    }
  }, [open, page, reset]);

  const onSubmit = (values: CreateStaticPagePayload) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Static Page" : "Create Static Page"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the settings for this static page."
              : "Fill in the details for the new static page."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="static-page-form">
          {/* Page Type */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-pageType">Page Type</Label>
            <Controller
              name="pageType"
              control={control}
              rules={{ required: "Page type is required" }}
              render={({ field }) => (
                <select
                  id="spf-pageType"
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {PAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.pageType && (
              <p className="text-xs text-destructive">{errors.pageType.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-title">Title</Label>
            <Input
              id="spf-title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. About Us"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-slug">Slug</Label>
            <Input
              id="spf-slug"
              {...register("slug", { required: "Slug is required" })}
              placeholder="e.g. about-us"
              className="font-mono text-xs"
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Meta Title */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-metaTitle">Meta Title</Label>
            <Input
              id="spf-metaTitle"
              {...register("metaTitle")}
              placeholder="SEO page title"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-metaDesc">Meta Description</Label>
            <Input
              id="spf-metaDesc"
              {...register("metaDescription")}
              placeholder="Short SEO description"
            />
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <Label htmlFor="spf-platform">Platform</Label>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <select
                  id="spf-platform"
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="static-page-form" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
