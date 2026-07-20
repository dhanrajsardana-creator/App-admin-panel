import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  Link,
  List,
  BlockQuote,
  Indent,
  Table,
  TableToolbar,
  HorizontalLine,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { Save, Loader2, Globe, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateStaticPage } from "@/hooks/useStaticPages";
import type { StaticPage, StaticPageStatus, StaticPagePlatform } from "@/types/staticPages";

interface StaticPageEditorProps {
  page: StaticPage;
}

const STATUS_OPTIONS: { value: StaticPageStatus; label: string; color: string }[] = [
  { value: "PUBLISHED", label: "Published", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400" },
  { value: "DRAFT", label: "Draft", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400" },
  { value: "ARCHIVED", label: "Archived", color: "text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800/30" },
];

const PLATFORM_OPTIONS: { value: StaticPagePlatform; label: string; icon: typeof Globe }[] = [
  { value: "BOTH", label: "Both", icon: Globe },
  { value: "MOBILE", label: "Mobile", icon: Smartphone },
  { value: "WEB", label: "Web", icon: Monitor },
];

export function StaticPageEditor({ page }: StaticPageEditorProps) {
  const updatePage = useUpdateStaticPage();

  const [title, setTitle] = useState(page.title ?? "");
  const [slug, setSlug] = useState(page.slug ?? "");
  const [metaTitle, setMetaTitle] = useState(page.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription ?? "");
  const [content, setContent] = useState(page.content ?? "");
  const [status, setStatus] = useState<StaticPageStatus>(page.status ?? "DRAFT");
  const [platform, setPlatform] = useState<StaticPagePlatform>(page.platform ?? "BOTH");

  // Sync fields when a different page is selected
  useEffect(() => {
    setTitle(page.title ?? "");
    setSlug(page.slug ?? "");
    setMetaTitle(page.metaTitle ?? "");
    setMetaDescription(page.metaDescription ?? "");
    setContent(page.content ?? "");
    setStatus(page.status ?? "DRAFT");
    setPlatform(page.platform ?? "BOTH");
  }, [page.id]);

  const handleSave = () => {
    updatePage.mutate({
      id: page.id,
      payload: { title, slug, metaTitle, metaDescription, content, status, platform },
    });
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[1];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Editor Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-card px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold">{page.title}</h2>
          <p className="text-xs text-muted-foreground">/{page.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status toggle */}
          <div className="flex overflow-hidden rounded-lg border text-xs">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  status === s.value
                    ? `${s.color} border-r last:border-r-0`
                    : "text-muted-foreground hover:bg-accent border-r last:border-r-0"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Platform toggle */}
          <div className="flex overflow-hidden rounded-lg border text-xs">
            {PLATFORM_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                title={p.label}
                className={`flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors border-r last:border-r-0 ${
                  platform === p.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <p.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={updatePage.isPending}
            className="gap-1.5"
          >
            {updatePage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Scrollable editor body */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        {/* Meta fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sp-title">Page Title</Label>
            <Input
              id="sp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. About Us"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-slug">Slug</Label>
            <Input
              id="sp-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. about-us"
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-meta-title">Meta Title</Label>
            <Input
              id="sp-meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-meta-desc">Meta Description</Label>
            <Input
              id="sp-meta-desc"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description"
            />
          </div>
        </div>

        {/* CKEditor */}
        <div className="space-y-1.5">
          <Label>Content</Label>
          <div className="ck-editor-wrapper overflow-hidden rounded-lg border">
            <CKEditor
              editor={ClassicEditor}
              data={content}
              config={{
                licenseKey: "GPL",
                plugins: [
                  Essentials,
                  Paragraph,
                  Bold,
                  Italic,
                  Heading,
                  Link,
                  List,
                  BlockQuote,
                  Indent,
                  Table,
                  TableToolbar,
                  HorizontalLine,
                ],
                toolbar: {
                  items: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "|",
                    "bulletedList",
                    "numberedList",
                    "indent",
                    "outdent",
                    "|",
                    "blockQuote",
                    "insertTable",
                    "horizontalLine",
                    "|",
                    "undo",
                    "redo",
                  ],
                },
                table: {
                  contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                },
              }}
              onChange={(_event, editor) => {
                setContent(editor.getData());
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
