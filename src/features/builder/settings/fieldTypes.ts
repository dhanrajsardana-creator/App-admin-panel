export type FieldGroup = "content" | "style";

export type FieldDef = (
  | { kind: "text"; key: string; label: string; placeholder?: string; group: FieldGroup }
  | { kind: "textarea"; key: string; label: string; placeholder?: string; group: FieldGroup }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; step?: number; group: FieldGroup }
  | { kind: "color"; key: string; label: string; group: FieldGroup }
  | { kind: "switch"; key: string; label: string; group: FieldGroup }
  | { kind: "file"; key: string; label: string; group: FieldGroup }
  | {
    kind: "select";
    key: string;
    label: string;
    options: { value: string; label: string }[];
    group: FieldGroup;
  }
  | { kind: "tags"; key: string; label: string; placeholder?: string; group: FieldGroup }
  | { kind: "media_url"; key: string; typeKey?: string; label: string; group: FieldGroup }
) & { isRoot?: boolean };

export interface SectionSchema {
  fields: FieldDef[];
}
