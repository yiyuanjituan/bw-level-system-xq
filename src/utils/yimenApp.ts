import jsBridge from "ym-jsbridge";
import packageInfo from "../../package.json";

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

function getFirstText(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function getUserAgentDeviceModel() {
  const userAgent = navigator.userAgent;
  const androidModel = userAgent.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i)?.[1];
  if (androidModel) return androidModel.replace(/\s+wv$/i, "").trim();
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/iPhone/i.test(userAgent)) return "iPhone";
  return "移动设备";
}

function readBridgeInfo(reader: (callback: (info: Record<string, unknown>) => void) => void) {
  return new Promise<Record<string, unknown>>((resolve) => {
    let completed = false;
    const finish = (info: Record<string, unknown> = {}) => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeoutId);
      resolve(info);
    };
    const timeoutId = window.setTimeout(() => finish(), 800);

    runWhenYimenReady(() => {
      try {
        reader((info) => finish(info && typeof info === "object" ? info : {}));
      } catch {
        finish();
      }
    });
  });
}

export function getAppDeviceVersionFallbackLabel() {
  const platform = jsBridge.ios ? "iOS" : jsBridge.harmony ? "HarmonyOS" : "Android";
  const fallbackVersion = jsBridge.appVersion > 0 ? String(jsBridge.appVersion) : packageInfo.version;

  return `${platform} · ${getUserAgentDeviceModel()} / v${fallbackVersion}`;
}

export async function getAppDeviceVersionLabel() {
  const platform = jsBridge.ios ? "iOS" : jsBridge.harmony ? "HarmonyOS" : "Android";
  const fallbackVersion = jsBridge.appVersion > 0 ? String(jsBridge.appVersion) : packageInfo.version;

  if (!isYimenApp()) {
    return getAppDeviceVersionFallbackLabel();
  }

  const [appInfo, deviceInfo] = await Promise.all([
    readBridgeInfo((callback) => jsBridge.appInfo(callback)),
    readBridgeInfo((callback) => jsBridge.deviceInfo(callback)),
  ]);
  const model = getFirstText(deviceInfo, ["model", "deviceModel", "deviceName", "name"])
    || getUserAgentDeviceModel();
  const systemVersion = getFirstText(deviceInfo, ["systemVersion", "osVersion", "release"]);
  const version = getFirstText(appInfo, ["versionName", "appVersion", "version"])
    || fallbackVersion;
  const systemLabel = systemVersion ? `${platform} ${systemVersion}` : platform;

  return `${systemLabel} · ${model} / v${version.replace(/^v/i, "")}`;
}
