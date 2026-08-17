import { getAppContainerConfig } from '@/utils/runtimeConfig';

const STATUS_BAR_HEIGHT_CSS_VARIABLE = '--app__status-bar-height';

let bridgeLoadingPromise: Promise<void> | null = null;
let bridgeLoadingUrl = '';

type BridgeObject = Record<string, unknown>;

function getBridgeObject(config: AppContainerRuntimeConfig) {
  const globalName = config.bridge?.globalName?.trim();
  if (!globalName) return undefined;

  const bridge = (window as unknown as Record<string, unknown>)[globalName];
  const isBridgeObject = bridge && (typeof bridge === 'object' || typeof bridge === 'function');
  return isBridgeObject ? bridge as BridgeObject : undefined;
}

function normalizeStatusBarHeight(value: unknown) {
  const height = Number(value);
  return Number.isFinite(height) && height > 0 && height <= 200 ? height : undefined;
}

function extractStatusBarHeight(config: AppContainerRuntimeConfig, result: unknown) {
  if (typeof result === 'number' || typeof result === 'string') {
    return normalizeStatusBarHeight(result);
  }
  if (!result || typeof result !== 'object') return undefined;

  const heightProperty = config.statusBar?.heightProperty?.trim() || 'height';
  return normalizeStatusBarHeight((result as Record<string, unknown>)[heightProperty]);
}

function applyAppContainerDocumentState(config: AppContainerRuntimeConfig | undefined, active: boolean) {
  const root = document.documentElement;
  if (!active || !config) {
    root.removeAttribute('data-app-container');
    root.removeAttribute('data-app-status-bar-overlay');
    root.style.removeProperty(STATUS_BAR_HEIGHT_CSS_VARIABLE);
    return;
  }

  const statusBar = config.statusBar;
  const overlays = statusBar?.enabled === true && statusBar.options?.overlays === true;
  const fallbackHeight = overlays ? normalizeStatusBarHeight(statusBar?.fallbackHeight) ?? 0 : 0;

  root.setAttribute('data-app-container', 'true');
  root.setAttribute('data-app-status-bar-overlay', String(overlays));
  root.style.setProperty(STATUS_BAR_HEIGHT_CSS_VARIABLE, `${fallbackHeight}px`);
}

export function isAppContainer() {
  if (typeof window === 'undefined') return false;

  const config = getAppContainerConfig();
  if (config?.enabled !== true) return false;

  const userAgentPattern = config.userAgentPattern?.trim();
  if (userAgentPattern) {
    try {
      if (new RegExp(userAgentPattern, 'i').test(window.navigator.userAgent)) return true;
    } catch {
      // 配置中的正则无效时继续尝试 Bridge 属性，避免整个登录流程中断。
    }
  }

  const bridge = getBridgeObject(config);
  const inAppProperty = config.bridge?.inAppProperty?.trim();
  return Boolean(inAppProperty && bridge?.[inAppProperty]);
}

function loadBridge(config: AppContainerRuntimeConfig) {
  const bridgeUrl = config.bridge?.scriptUrl?.trim();
  if (!bridgeUrl || getBridgeObject(config)) return Promise.resolve();
  if (bridgeLoadingPromise && bridgeLoadingUrl === bridgeUrl) return bridgeLoadingPromise;

  bridgeLoadingUrl = bridgeUrl;
  bridgeLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-app-container-bridge]');
    const script = existingScript || document.createElement('script');
    const timeout = Number(config.bridge?.loadTimeout) > 0 ? Number(config.bridge?.loadTimeout) : 2000;
    const timeoutId = window.setTimeout(() => {
      reject(new Error('App容器Bridge加载超时'));
    }, timeout);
    const handleLoad = () => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    const handleError = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('App容器Bridge加载失败'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.src = bridgeUrl;
      script.async = true;
      script.dataset.appContainerBridge = '1';
      document.head.appendChild(script);
    }
  });

  return bridgeLoadingPromise;
}

function setAppContainerStatusBar(config: AppContainerRuntimeConfig, bridge: BridgeObject) {
  const methodName = config.statusBar?.setMethod?.trim();
  const method = methodName ? bridge[methodName] : undefined;
  if (typeof method !== 'function') return;

  try {
    method.call(bridge, config.statusBar?.options || {}, () => undefined);
  } catch {
    // 原生状态栏设置失败时保留 CSS 兜底高度，确保页面顶部内容仍可操作。
  }
}

function getAppContainerStatusBarHeight(config: AppContainerRuntimeConfig, bridge: BridgeObject) {
  const methodName = config.statusBar?.getMethod?.trim();
  const method = methodName ? bridge[methodName] : undefined;
  if (typeof method !== 'function') return Promise.resolve<number | undefined>(undefined);

  const callbackTimeout = Number(config.statusBar?.callbackTimeout) > 0
    ? Number(config.statusBar?.callbackTimeout)
    : 1500;

  return new Promise<number | undefined>(resolve => {
    let settled = false;
    const finish = (height?: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(height);
    };
    const timeoutId = window.setTimeout(() => finish(), callbackTimeout);

    try {
      const callback = (successOrResult: unknown, result?: unknown) => {
        const callbackResult = typeof successOrResult === 'boolean'
          ? successOrResult ? result : undefined
          : successOrResult;
        finish(extractStatusBarHeight(config, callbackResult));
      };
      const returnedValue = method.call(bridge, callback);

      if (returnedValue && typeof returnedValue.then === 'function') {
        returnedValue.then(
          (result: unknown) => finish(extractStatusBarHeight(config, result)),
          () => finish()
        );
      } else if (returnedValue !== undefined && typeof returnedValue !== 'boolean') {
        finish(extractStatusBarHeight(config, returnedValue));
      }
    } catch {
      finish();
    }
  });
}

export async function initializeAppContainer() {
  if (typeof window === 'undefined') return;

  const config = getAppContainerConfig();
  const active = Boolean(config && isAppContainer());
  applyAppContainerDocumentState(config, active);
  if (!active || !config || config.statusBar?.enabled !== true) return;

  try {
    await loadBridge(config);
    const bridge = getBridgeObject(config);
    if (!bridge) return;

    setAppContainerStatusBar(config, bridge);
    const statusBarHeight = await getAppContainerStatusBarHeight(config, bridge);
    if (statusBarHeight) {
      document.documentElement.style.setProperty(STATUS_BAR_HEIGHT_CSS_VARIABLE, `${statusBarHeight}px`);
    }
  } catch {
    // Bridge不可用时继续使用配置中的兜底高度，不影响H5页面运行。
  }
}

export async function openAppContainerSystemBrowser(url: string) {
  if (!isAppContainer()) return false;

  const config = getAppContainerConfig();
  const methodName = config?.bridge?.openInBrowserMethod?.trim();
  if (!config || !methodName) return false;

  try {
    await loadBridge(config);
    const bridge = getBridgeObject(config);
    const openInBrowser = bridge?.[methodName];
    if (typeof openInBrowser !== 'function') return false;

    openInBrowser.call(bridge, url);
    return true;
  } catch {
    return false;
  }
}

export function createAppContainerLaunchUrl(targetUrl: string) {
  const config = getAppContainerConfig();
  if (config?.enabled !== true) return '';

  const launch = config.launch;
  const schemeText = launch?.scheme?.trim();
  const schemeSeparatorIndex = schemeText?.indexOf(':') ?? -1;
  const scheme = schemeSeparatorIndex >= 0 ? schemeText?.slice(0, schemeSeparatorIndex) : schemeText;
  const path = launch?.path?.trim().replace(/^\/+/, '');
  const urlParam = launch?.urlParam?.trim();
  if (!scheme || !urlParam) return '';

  const launchPath = path ? `://${path}` : '://';
  return `${scheme}${launchPath}?${encodeURIComponent(urlParam)}=${encodeURIComponent(targetUrl)}`;
}

export function appendAppContainerBrowserFallback(url: string) {
  const fallback = getAppContainerConfig()?.browserFallback;
  const queryParam = fallback?.queryParam?.trim();
  if (!queryParam) return url;

  try {
    const targetUrl = new URL(url);
    targetUrl.searchParams.set(queryParam, fallback?.queryValue ?? '1');
    return targetUrl.toString();
  } catch {
    return url;
  }
}
