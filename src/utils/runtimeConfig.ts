export function getRuntimeBaseURL() {
  const runtimeBaseURL = typeof window === "undefined"
    ? undefined
    : window.__APP_RUNTIME_CONFIG__?.baseURL;

  if (typeof runtimeBaseURL === "string") {
    return runtimeBaseURL.trim();
  }

  return import.meta.env.VITE_BASE_API || "";
}
