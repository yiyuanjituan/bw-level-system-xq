import { getAppContainerConfig } from '@/utils/runtimeConfig';

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
