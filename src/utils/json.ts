import type { JsonMap } from "@/types";

/** Safe typed accessors for the open-ended configJson / metadataJson maps. */
export function str(map: JsonMap | null | undefined, key: string, fallback = ""): string {
  const v = map?.[key];
  return typeof v === "string" ? v : fallback;
}

export function num(
  map: JsonMap | null | undefined,
  key: string,
  fallback = 0
): number {
  const v = map?.[key];
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)))
    return Number(v);
  return fallback;
}

export function bool(
  map: JsonMap | null | undefined,
  key: string,
  fallback = false
): boolean {
  const v = map?.[key];
  return typeof v === "boolean" ? v : fallback;
}

export function arr<T = unknown>(
  map: JsonMap | null | undefined,
  key: string
): T[] {
  const v = map?.[key];
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Returns a new map with `key` set, omitting empty-string values cleanly. */
export function setKey(map: JsonMap | null | undefined, key: string, value: unknown): JsonMap {
  return { ...(map ?? {}), [key]: value };
}
