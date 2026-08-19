import jsBridge from "ym-jsbridge";

const STATUS_BAR_HEIGHT_VARIABLE = "--status-bar-height";

type StatusBarOptions = {
  visible?: boolean;
  contentStyle?: "default" | "light" | "dark";
  backgroundColor?: string;
  overlays?: boolean;
};

type StatusBarCallback = (success: boolean, result: unknown) => void;

function normalizeStatusBarHeight(statusBar: unknown) {
  const heightValue = statusBar && typeof statusBar === "object"
    ? (statusBar as { height?: unknown }).height
    : statusBar;

  const height = Number(heightValue);
  return Number.isFinite(height) && height > 0 && height <= 200 ? height : undefined;
}

export function isYimenApp() {
  return typeof window !== "undefined" && jsBridge.inApp;
}

function runWhenYimenReady(action: () => void) {
  if (!isYimenApp()) return;

  try {
    jsBridge.ready(() => {
      try {
        action();
      } catch {
        // Bridge调用失败时保持H5行为，避免影响页面启动。
      }
    });
  } catch {
    // Bridge初始化失败时保持H5行为。
  }
}

export function setStatusBar(options: StatusBarOptions, callback?: StatusBarCallback) {
  runWhenYimenReady(() => {
    jsBridge.setStatusBar(options, callback);
  });
}

export function initializeStatusBarHeight() {
  if (typeof document === "undefined") return;

  runWhenYimenReady(() => {
    jsBridge.getStatusBar((success, statusBar) => {
      if (!success) return;

      const height = normalizeStatusBarHeight(statusBar);
      if (!height) return;

      document.documentElement.style.setProperty(STATUS_BAR_HEIGHT_VARIABLE, `${height}px`);
    });
  });
}
