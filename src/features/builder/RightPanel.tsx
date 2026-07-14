import { useCallback } from "react";
import { SlidersHorizontal, FileText, Paintbrush, Layers, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useSections, usePatchSectionCache, useDeleteSection } from "@/hooks/useSections";
import { usePages } from "@/hooks/usePages";
import { useBuilderStore } from "@/store/builderStore";
import { sectionLabel } from "@/config/sectionCatalog";
import { getSectionSchema } from "./settings/schemas";
import { FieldControl } from "./settings/FieldControl";
import { ItemManager } from "./settings/ItemManager";
import { useState } from "react";
import type { JsonMap, UpdateSectionPayload } from "@/types";

export function RightPanel() {
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const queueSectionEdit = useBuilderStore((s) => s.queueSectionEdit);

  const { data: pages } = usePages();
  const page = pages?.find((p) => p.id === selectedPageId) ?? null;
  const isPdp = page?.pageType === "PRODUCT";

  const { data: sections } = useSections(selectedPageId);
  const section = sections?.find((s) => s.id === selectedSectionId) ?? null;

  const patchCache = usePatchSectionCache(selectedPageId);
  const deleteSection = useDeleteSection(selectedPageId);

  const [confirmDelete, setConfirmDelete] = useState(false);

  /**
   * Patch a top-level section field (title/subtitle/visibility…).
   * Updates the local preview cache immediately AND queues the edit for Publish.
   */
  const patchField = useCallback(
    (patch: UpdateSectionPayload) => {
      if (!section) return;
      patchCache(section.id, patch); // instant preview
      queueSectionEdit(section.id, patch); // hold for Publish
    },
    [section, patchCache, queueSectionEdit]
  );

  /**
   * Patch a single configJson key.
   * Updates the local preview cache immediately AND queues the edit for Publish.
   */
  const patchConfig = useCallback(
    (key: string, value: unknown) => {
      if (!section) return;
      const nextConfig: JsonMap = { ...(section.configJson ?? {}), [key]: value };
      patchCache(section.id, { configJson: nextConfig }); // instant preview
      queueSectionEdit(section.id, { configJson: nextConfig }); // hold for Publish
    },
    [section, patchCache, queueSectionEdit]
  );

  if (!section) {
    return (
      <aside className="flex w-80 shrink-0 flex-col items-center justify-center border-l bg-card p-6 text-center">
        <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          No section selected
        </p>
        <p className="text-xs text-muted-foreground/70">
          Select a section in the preview or sidebar to edit its settings.
        </p>
      </aside>
    );
  }

  if (isPdp) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {section.title || sectionLabel(section.sectionType)}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {sectionLabel(section.sectionType)}
            </p>
          </div>
          <button
            onClick={() => selectSection(null)}
            className="text-lg leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="text-sm font-medium text-foreground">Visible</Label>
            <Switch
              checked={section.isVisible}
              onCheckedChange={(v) => patchField({ isVisible: v })}
            />
          </div>
        </div>
      </aside>
    );
  }

  const schema = getSectionSchema(section.sectionType, section.sectionKey);
  const config = section.configJson ?? {};
  const contentFields = schema.fields.filter((f) => f.group === "content");
  const styleFields = schema.fields.filter((f) => f.group === "style");

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {section.title || sectionLabel(section.sectionType)}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {sectionLabel(section.sectionType)}
          </p>
        </div>
        <button
          onClick={() => selectSection(null)}
          className="text-lg leading-none text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="content">
              <FileText /> Content
            </TabsTrigger>
            <TabsTrigger value="style">
              <Paintbrush /> Style
            </TabsTrigger>
            {section.sectionType !== "exlusive_offers" && section.sectionType !== "collection_with_products" && (
              <TabsTrigger value="items">
                <Layers /> Items
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4">
          {/* CONTENT */}
          <TabsContent value="content" className="mt-0 space-y-4">
            {contentFields.length > 0 ? (
              <div className="space-y-3">
                {contentFields.map((f) => (
                  <FieldControl
                    key={f.key}
                    field={f}
                    config={f.isRoot ? (section as unknown as JsonMap) : config}
                    onChange={f.isRoot ? (key, val) => patchField({ [key]: val }) : patchConfig}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No content settings for this section type.
              </p>
            )}
          </TabsContent>

          {/* STYLE */}
          <TabsContent value="style" className="mt-0 space-y-3">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label className="text-sm text-foreground">Visible</Label>
              <Switch
                checked={section.isVisible}
                onCheckedChange={(v) => patchField({ isVisible: v })}
              />
            </div>

            {styleFields.length > 0 ? (
              <div className="space-y-3 border-t pt-3">
                {styleFields.map((f) => (
                  <FieldControl
                    key={f.key}
                    field={f}
                    config={f.isRoot ? (section as unknown as JsonMap) : config}
                    onChange={f.isRoot ? (key, val) => patchField({ [key]: val }) : patchConfig}
                  />
                ))}
              </div>
            ) : (
              <p className="pt-2 text-xs text-muted-foreground">
                This section has no style options.
              </p>
            )}
          </TabsContent>

          {section.sectionType !== "exlusive_offers" && (
            <TabsContent value="items" className="mt-0">
              <ItemManager section={section} />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Footer actions */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" /> Delete section
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete section?"
        description="This section and its items will be permanently removed."
        destructive
        confirmLabel="Delete"
        loading={deleteSection.isPending}
        onConfirm={() =>
          deleteSection.mutate(section.id, {
            onSuccess: () => setConfirmDelete(false),
          })
        }
      />
    </aside>
  );
}
