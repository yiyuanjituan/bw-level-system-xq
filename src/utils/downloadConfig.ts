export type DownloadOptionType = "pwa" | "android-native" | "ios-enterprise" | "ios-mobileconfig";

export interface DownloadConfig {
  enabled?: boolean | number | string;
  logo?: string;
  description?: string;
  androidPwaEnabled?: boolean | number | string;
  androidPwaSize?: string;
  androidNativeUrl?: string;
  androidNativeSize?: string;
  iosEnterpriseUrl?: string;
  iosEnterpriseSize?: string;
  iosMobileConfigUrl?: string;
}

export interface DownloadOption {
  type: DownloadOptionType;
  label: "极速APP" | "原生APP" | "企业APP" | "描述文件";
  size: string;
  url: string;
}

function isEnabled(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function getPlatform() {
  if (typeof navigator === "undefined") return "unknown";

  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIos = /iPad|iPhone|iPod/i.test(userAgent)
    || (platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "unknown";
}

export function getDownloadOptions(config?: DownloadConfig | null): DownloadOption[] {
  if (!config || !isEnabled(config.enabled)) return [];

  const platform = getPlatform();

  if (platform === "android") {
    const options: DownloadOption[] = [];
    const androidNativeUrl = normalizeText(config.androidNativeUrl);

    if (isEnabled(config.androidPwaEnabled)) {
      options.push({
        type: "pwa",
        label: "极速APP",
        size: normalizeText(config.androidPwaSize),
        url: ""
      });
    }

    if (androidNativeUrl) {
      options.push({
        type: "android-native",
        label: "原生APP",
        size: normalizeText(config.androidNativeSize),
        url: androidNativeUrl
      });
    }

    return options;
  }

  if (platform === "ios") {
    const options: DownloadOption[] = [];
    const iosEnterpriseUrl = normalizeText(config.iosEnterpriseUrl);
    const iosMobileConfigUrl = normalizeText(config.iosMobileConfigUrl);

    if (iosEnterpriseUrl) {
      options.push({
        type: "ios-enterprise",
        label: "企业APP",
        size: normalizeText(config.iosEnterpriseSize),
        url: iosEnterpriseUrl
      });
    }

    if (iosMobileConfigUrl) {
      options.push({
        type: "ios-mobileconfig",
        label: "描述文件",
        size: "",
        url: iosMobileConfigUrl
      });
    }

    return options;
  }

  return [];
}

export function hasAvailableDownloadOption(config?: DownloadConfig | null) {
  return getDownloadOptions(config).length > 0;
}
