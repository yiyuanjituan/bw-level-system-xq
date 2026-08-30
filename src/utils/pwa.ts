type SitePwaConfig = {
  favicon?: string;
  logo?: string;
  title?: string;
};

type InstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
}

export type PwaInstallResult = "accepted" | "dismissed" | "installed" | "ios-guide" | "browser-guide";

let installPrompt: BeforeInstallPromptEvent | null = null;
let manifestRevision = 0;

function getBasePath() {
  const basePath = import.meta.env.BASE_URL || "/";
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function resolveUrl(value?: string) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  if (!normalizedValue) return "";

  try {
    return new URL(normalizedValue, window.location.href).href;
  } catch {
    return "";
  }
}

function getIconType(iconUrl: string) {
  const pathname = new URL(iconUrl).pathname.toLowerCase();
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".avif")) return "image/avif";
  if (pathname.endsWith(".png")) return "image/png";
  return undefined;
}

function setMetaContent(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function setAppleTouchIcon(iconUrl: string) {
  let iconLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "apple-touch-icon";
    iconLink.setAttribute("sizes", "180x180");
    document.head.appendChild(iconLink);
  }
  iconLink.href = iconUrl;
}

async function updateServiceWorkerManifest(manifest: Record<string, unknown>, basePath: string) {
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!manifestLink || !("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const activeWorker = registration.active;
    if (!activeWorker) return;

    await new Promise<void>((resolve) => {
      const channel = new MessageChannel();
      const timeout = window.setTimeout(resolve, 1000);
      channel.port1.onmessage = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      activeWorker.postMessage({ type: "update-pwa-manifest", manifest }, [channel.port2]);
    });

    manifestRevision += 1;
    manifestLink.href = `${basePath}manifest.webmanifest?pwa_revision=${manifestRevision}`;
  } catch {
    // Service Worker 尚未接管页面时保留静态 manifest，避免影响 Chrome 的安装识别。
  }
}

export function updatePwaMetadata(config?: SitePwaConfig) {
  if (typeof window === "undefined") return;

  const basePath = getBasePath();
  const fallbackIcon180 = new URL(`${basePath}pwa/icon-180.png`, window.location.origin).href;
  const fallbackIcon192 = new URL(`${basePath}pwa/icon-192.png`, window.location.origin).href;
  const fallbackIcon512 = new URL(`${basePath}pwa/icon-512.png`, window.location.origin).href;
  const remoteIcon = resolveUrl(config?.favicon) || resolveUrl(config?.logo);
  const appName = String(config?.title || "YGAME").trim() || "YGAME";
  const shortName = Array.from(appName).slice(0, 12).join("");
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--skin__primary").trim() || "#20b98b";
  const appUrl = new URL(basePath, window.location.origin).href;
  const remoteIconType = remoteIcon ? getIconType(remoteIcon) : undefined;
  const remoteManifestIcon = remoteIcon
    ? {
        src: remoteIcon,
        ...(remoteIconType ? { type: remoteIconType } : {}),
        purpose: "any"
      }
    : null;
  const icons = remoteManifestIcon
    ? [
        { ...remoteManifestIcon, sizes: "192x192" },
        { ...remoteManifestIcon, sizes: "512x512" },
        { src: fallbackIcon192, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: fallbackIcon512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    : [
        { src: fallbackIcon192, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: fallbackIcon512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ];

  const manifest = {
    id: appUrl,
    name: appName,
    short_name: shortName,
    lang: document.documentElement.lang || "zh-CN",
    start_url: appUrl,
    scope: appUrl,
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: themeColor,
    prefer_related_applications: false,
    icons
  };
  setMetaContent("application-name", appName);
  setMetaContent("apple-mobile-web-app-title", appName);
  setMetaContent("theme-color", themeColor);
  setAppleTouchIcon(remoteIcon || fallbackIcon180);
  void updateServiceWorkerManifest(manifest, basePath);
}

export function isPwaInstalled() {
  if (typeof window === "undefined") return false;

  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || standaloneNavigator.standalone === true;
}

function isIos() {
  const platform = navigator.platform || "";
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export async function requestPwaInstall(): Promise<PwaInstallResult> {
  if (isPwaInstalled()) return "installed";

  if (installPrompt) {
    const currentPrompt = installPrompt;
    installPrompt = null;
    await currentPrompt.prompt();
    const choice = await currentPrompt.userChoice;
    return choice.outcome;
  }

  return isIos() ? "ios-guide" : "browser-guide";
}

export function registerPwa() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const basePath = getBasePath();
    navigator.serviceWorker.register(`${basePath}sw.js`, {
      scope: basePath,
      updateViaCache: "none"
    }).then((registration) => registration.update()).catch(() => void 0);
  }, { once: true });
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
  });
}
