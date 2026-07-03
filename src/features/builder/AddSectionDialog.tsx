import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/common/Spinner";
import { SECTION_CATALOG } from "@/config/sectionCatalog";
import { useCreateSection } from "@/hooks/useSections";
import type { CreateSectionPayload } from "@/types";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  existingCount: number;
}

export function AddSectionDialog({
  open,
  onOpenChange,
  pageId,
  existingCount,
}: AddSectionDialogProps) {
  const [search, setSearch] = useState("");
  const createSection = useCreateSection(pageId);

  const filtered = SECTION_CATALOG.filter(
    (d) =>
      d.label.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (def: (typeof SECTION_CATALOG)[number]) => {
    const key = `${def.type.toUpperCase()}_${Date.now().toString(36)}`;
    const payload: CreateSectionPayload = {
      sectionKey: key,
      sectionType: def.type,
      title: def.label,
      subtitle: null,
      layoutType: def.defaultLayout,
      visibilityType: "BOTH",
      sortOrder: existingCount,
      configJson: def.defaultConfig,
    };
    createSection.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a section</DialogTitle>
          <DialogDescription>
            Choose a block to add to this page. You can configure it after adding.
          </DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          placeholder="Search sections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto scrollbar-thin sm:grid-cols-2">
          {filtered.map((def) => (
            <button
              key={def.type}
              disabled={createSection.isPending}
              onClick={() => handleAdd(def)}
              className="group flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <def.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{def.label}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {def.description}
                </span>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No sections match “{search}”.
            </p>
          )}
        </div>

        {createSection.isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Adding section…
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
