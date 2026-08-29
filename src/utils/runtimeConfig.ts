import {
  normalizeLoadingType,
  type AppLoadingType,
} from "@/config/loading-config";

function getRuntimeConfig() {
  return typeof window === "undefined" ? undefined : window.__APP_RUNTIME_CONFIG__;
}

export function getRuntimeBaseURL() {
  const runtimeBaseURL = getRuntimeConfig()?.baseURL;

  if (typeof runtimeBaseURL === "string") {
    return runtimeBaseURL.trim();
  }

  return import.meta.env.VITE_BASE_API || "";
}

export function getRuntimeLoadingType(): AppLoadingType {
  return normalizeLoadingType(getRuntimeConfig()?.loadingType);
}
