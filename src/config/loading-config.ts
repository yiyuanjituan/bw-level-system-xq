export type AppLoadingType = "dots" | "ring" | "pulse";

export const DEFAULT_LOADING_TYPE: AppLoadingType = "dots";

export function normalizeLoadingType(value: unknown): AppLoadingType {
  return value === "ring" || value === "pulse" ? value : DEFAULT_LOADING_TYPE;
}
