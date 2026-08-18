import jsBridge from "ym-jsbridge";

const STATUS_BAR_HEIGHT_VARIABLE = "--status-bar-height";

function normalizeStatusBarHeight(statusBar: unknown) {
  const heightValue = statusBar && typeof statusBar === "object"
    ? (statusBar as { height?: unknown }).height
    : statusBar;

  const height = Number(heightValue);
  return Number.isFinite(height) && height > 0 && height <= 200 ? height : undefined;
}

export function initializeStatusBarHeight() {
  if (typeof document === "undefined" || !jsBridge.inApp) return;

  try {
    jsBridge.ready(() => {
      try {
        jsBridge.getStatusBar((success, statusBar) => {
          if (!success) return;

          const height = normalizeStatusBarHeight(statusBar);
          if (!height) return;

          document.documentElement.style.setProperty(STATUS_BAR_HEIGHT_VARIABLE, `${height}px`);
        });
      } catch {
        // Bridge调用失败时保留默认高度，避免影响H5和旧版容器启动。
      }
    });
  } catch {
    // Bridge初始化失败时保留默认高度。
  }
}
