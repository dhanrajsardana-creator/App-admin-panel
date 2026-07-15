import { useState } from "react";
import { Trash2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/common/Spinner";
import { useCreateSection } from "@/hooks/useSections";
import type { CreateSectionPayload } from "@/types";
import { toast } from "sonner";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  existingCount: number;
}

const CONFIG_KEYS = [
  { key: "backgroundMediaType", type: "string" },
  { key: "backgroundMediaValue", type: "string" },
  { key: "overlayingTexts", type: "string[]" },
  { key: "overlayingTitle", type: "string" },
  { key: "viewAllButtonText", type: "string" },
  { key: "viewAllRedirectType", type: "string" },
  { key: "viewAllRedirectValue", type: "string" },
  { key: "isBrandLogoEnabled", type: "boolean" },
  { key: "isSearchBoxEnabled", type: "boolean" },
  { key: "searchBoxFixedPlaceholder", type: "string" },
  { key: "searchBoxRotationalPlaceholders", type: "string[]" },
  { key: "iconName", type: "string" },
  { key: "exampleData", type: "string[]" },
  { key: "columns", type: "number" },
  { key: "showSectionTitle", type: "boolean" },
  { key: "gap", type: "number" },
  { key: "maxItems", type: "number" },
  { key: "cardStyle", type: "string" },
  { key: "cardWidth", type: "number" },
  { key: "showBrand", type: "boolean" },
  { key: "showPrice", type: "boolean" },
  { key: "cardShadow", type: "boolean" },
  { key: "showRating", type: "boolean" },
  { key: "sourceType", type: "string" },
  { key: "aspectRatio", type: "string" },
  { key: "desktopAspectRatio", type: "string" },
  { key: "showViewAll", type: "boolean" },
  { key: "viewAllText", type: "string" },
  { key: "badgeBgColor", type: "string" },
  { key: "badgeTextColor", type: "string" },
  { key: "badgePosition", type: "string" },
  { key: "showSubtitle", type: "boolean" },
  { key: "showWishlist", type: "boolean" },
  { key: "showAddToCart", type: "boolean" },
  { key: "showComparePrice", type: "boolean" },
  { key: "showDiscountBadge", type: "boolean" },
  { key: "subtitleColor", type: "string" },
  { key: "cardBorderRadius", type: "number" },
  { key: "badgeBorderRadius", type: "number" },
  { key: "collectionHandle", type: "string" },
  { key: "sectionTitleSize", type: "number" },
  { key: "sectionTitleColor", type: "string" },
  { key: "sectionTitleWeight", type: "string" },
  { key: "showBadge", type: "boolean" },
  { key: "textColor", type: "string" },
  { key: "buttonText", type: "string" },
  { key: "showButton", type: "boolean" },
  { key: "buttonColor", type: "string" },
  { key: "buttonStyle", type: "string" },
  { key: "overlayColor", type: "string" },
  { key: "textMaxWidth", type: "number" },
  { key: "textPosition", type: "string" },
  { key: "titleFontSize", type: "number" },
  { key: "subtitleFontSize", type: "number" },
  { key: "buttonFontSize", type: "number" },
  { key: "imageObjectFit", type: "string" },
  { key: "imageObjectPosition", type: "string" },
  { key: "overlayOpacity", type: "number" },
  { key: "buttonTextColor", type: "string" },
  { key: "titleFontWeight", type: "string" },
  { key: "buttonBorderColor", type: "string" },
  { key: "buttonBorderRadius", type: "number" },
  { key: "itemPriceLabel", type: "string" },
];

export function AddSectionDialog({
  open,
  onOpenChange,
  pageId,
  existingCount,
}: AddSectionDialogProps) {
  const createSection = useCreateSection(pageId);

  // Form states
  const [sectionKey, setSectionKey] = useState("SEARCH_HOME_CATEGORY_LIST");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [configJson, setConfigJson] = useState<Record<string, any>>({});

  // Builder states
  const [keySearch, setKeySearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<(typeof CONFIG_KEYS)[number] | null>(null);
  const [fieldValue, setFieldValue] = useState("");

  const filteredKeys = CONFIG_KEYS.filter(
    (k) =>
      k.key.toLowerCase().includes(keySearch.toLowerCase()) &&
      !Object.keys(configJson).includes(k.key)
  );

  const handleAddField = () => {
    if (!selectedKey) return;

    let parsedValue: any = fieldValue;
    if (selectedKey.type === "boolean") {
      parsedValue = fieldValue === "true";
    } else if (selectedKey.type === "number") {
      parsedValue = Number(fieldValue) || 0;
    } else if (selectedKey.type === "string[]") {
      parsedValue = fieldValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    setConfigJson((prev) => ({
      ...prev,
      [selectedKey.key]: parsedValue,
    }));

    // Reset picker
    setSelectedKey(null);
    setFieldValue("");
    setKeySearch("");
  };

  const handleCreate = () => {
    if (!sectionKey.trim()) {
      toast.error("Section key is required");
      return;
    }

    const payload: CreateSectionPayload = {
      sectionKey,
      sectionType: null,
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      layoutType: "FULL_WIDTH",
      visibilityType: "BOTH",
      isVisible,
      sortOrder: existingCount,
      configJson,
    };

    createSection.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset states
        setSectionKey("SEARCH_HOME_CATEGORY_LIST");
        setTitle("");
        setSubtitle("");
        setIsVisible(true);
        setConfigJson({});
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Create Section</DialogTitle>
          <DialogDescription>
            Configure and add a new section block to your page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Section Key */}
          <div className="space-y-1.5">
            <Label>Section Key</Label>
            <Input
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value.replace(/\s+/g, ""))}
              placeholder="e.g. SEARCH_HOME_CATEGORY_LIST"
            />
          </div>

          {/* Editable Title & Subtitle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Featured Products"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Trending items"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <Label>Is Visible</Label>
            <Select
              value={isVisible ? "true" : "false"}
              onValueChange={(v) => setIsVisible(v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* configJson Builder */}
          <div className="space-y-2 border-t pt-3">
            <Label className="text-sm font-semibold">Config Fields (configJson)</Label>

            {/* Current Config Values */}
            {Object.keys(configJson).length > 0 ? (
              <div className="space-y-1 rounded-md border bg-muted/40 p-2.5 max-h-40 overflow-y-auto scrollbar-thin">
                {Object.entries(configJson).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between text-xs border-b pb-1 last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-muted-foreground">{k}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[180px]">
                        {JSON.stringify(v)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...configJson };
                          delete next[k];
                          setConfigJson(next);
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No config fields added yet.
              </p>
            )}

            {/* Field Picker */}
            <div className="rounded-md border p-2.5 space-y-2 bg-muted/20">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                Add Field
              </span>

              {!selectedKey ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search config keys…"
                      value={keySearch}
                      onChange={(e) => setKeySearch(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto border rounded divide-y bg-background text-xs scrollbar-thin">
                    {filteredKeys.map((k) => (
                      <button
                        key={k.key}
                        type="button"
                        onClick={() => {
                          setSelectedKey(k);
                          if (k.type === "boolean") setFieldValue("true");
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-accent transition-colors flex justify-between"
                      >
                        <span>{k.key}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {k.type}
                        </span>
                      </button>
                    ))}
                    {filteredKeys.length === 0 && (
                      <p className="text-center p-2 text-muted-foreground">
                        No matching keys.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-medium">{selectedKey.key}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(null)}
                      className="text-[10px] text-muted-foreground underline hover:text-foreground"
                    >
                      Change key
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      {selectedKey.type === "boolean" ? (
                        <Select value={fieldValue} onValueChange={setFieldValue}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">true</SelectItem>
                            <SelectItem value="false">false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : selectedKey.type === "number" ? (
                        <Input
                          type="number"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          placeholder="e.g. 12"
                          className="h-8 text-xs"
                        />
                      ) : (
                        <Input
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          placeholder={
                            selectedKey.type === "string[]"
                              ? "e.g. value1, value2"
                              : "Enter value"
                          }
                          className="h-8 text-xs"
                        />
                      )}
                      {selectedKey.type === "string[]" && (
                        <span className="text-[10px] text-muted-foreground">
                          Separate multiple values with commas
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddField}
                      className="h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={createSection.isPending}
          >
            {createSection.isPending && <Spinner />}
            Create Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
