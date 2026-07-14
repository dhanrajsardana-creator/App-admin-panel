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
  | { kind: "tuple_text"; key: string; label1: string; label2: string; placeholder1?: string; placeholder2?: string; group: FieldGroup }
  | { kind: "tuple3_text"; key: string; label1: string; label2: string; label3: string; placeholder1?: string; placeholder2?: string; placeholder3?: string; group: FieldGroup }
  | { kind: "media_url"; key: string; typeKey?: string; label: string; placeholder?: string; group: FieldGroup }
  | { kind: "redirect_value"; key: string; typeKey: string; label: string; placeholder?: string; group: FieldGroup }
) & { isRoot?: boolean };

export interface SectionSchema {
  fields: FieldDef[];
}
