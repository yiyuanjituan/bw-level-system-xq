import { getCommonInfo, getConfig, getThemeConfig } from '@/api/common';
import type { ThemeConfigResponse } from '@/api/common';
import setPageTitle from '@/utils/set-page-title';
import {
  APP_PREFIX_KEY,
  SITE_CONFIG_CACHE_KEY,
  SITE_GAME_CACHE_KEY
} from '@/utils/appCache';

export { APP_PREFIX_KEY };

function isPreviewLocation() {
  if (typeof window === 'undefined') return false;
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  return new URLSearchParams(window.location.search).get('preview') === '1'
    || new URLSearchParams(hashQuery).get('preview') === '1';
}

export interface AppInitializationResult {
  siteConfig?: any;
  themeConfig?: ThemeConfigResponse;
  commonInfo?: any;
}

export interface AppLoadingProgress {
  progress: number;
  status: string;
}

export async function initApp(onProgress?: (state: AppLoadingProgress) => void): Promise<AppInitializationResult> {
  getLocalSize();
  let completedTasks = 0;
  const progressStates: AppLoadingProgress[] = [
    { progress: 34, status: "正在同步应用配置" },
    { progress: 58, status: "正在加载主题资源" },
    { progress: 82, status: "正在准备首页数据" },
  ];
  const trackProgress = <T>(request: Promise<T>) => request.finally(() => {
    const state = progressStates[Math.min(completedTasks, progressStates.length - 1)];
    completedTasks += 1;
    onProgress?.(state);
  });

  onProgress?.({ progress: 10, status: "正在连接服务" });
  await new Promise((resolve) => window.setTimeout(resolve, 3000));
  const [siteConfig, themeConfig, commonInfo] = await Promise.all([
    trackProgress(getSiteConfig()),
    trackProgress(getThemeData()),
    trackProgress(getHomeData()),
  ]);

  onProgress?.({ progress: 90, status: "正在应用远程配置" });
  return { siteConfig, themeConfig, commonInfo };
}

function getSiteConfig() {
  return new Promise((resolve, reject) => {
    getConfig()
      .then(res => {
        if (!isPreviewLocation()) {
          const cachedSiteConfig = { ...(res || {}) };
          delete cachedSiteConfig.theme_config;
          localStorage.setItem(SITE_CONFIG_CACHE_KEY, JSON.stringify(cachedSiteConfig));
        }
        setPageTitle(res.page_title || res.title);
        resolve(res);
      })
      .catch(err => resolve(void 0));
  });
}

function getHomeData() {
  return new Promise((resolve, reject) => {
    getCommonInfo()
      .then(res => {
        if (!isPreviewLocation()) {
          localStorage.setItem(SITE_GAME_CACHE_KEY, JSON.stringify(res));
        }
        resolve(res);
      })
      .catch(err => resolve(void 0));
  });
}

function getThemeData(): Promise<ThemeConfigResponse | undefined> {
  return new Promise((resolve) => {
    // 装修预览也必须加载当前站点主题，页面装修消息只包含布局，不能用本地 theme.less 代替远程配色。
    getThemeConfig()
      .then(res => resolve(res))
      .catch(() => resolve(void 0));
  });
}

export function toggleFullScreen() {
  // 获取文档的全屏相关元素（处理不同浏览器的兼容性）
  const doc: any = window.document;
  const docEl = doc.documentElement;

  // 检查当前是否处于全屏状态
  const isFullScreen = !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );

  // 如果不是全屏，就进入全屏；否则退出全屏
  if (!isFullScreen) {
    // 进入全屏（兼容不同浏览器）
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      // Chrome/Safari
      docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      // Firefox
      docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      // IE/Edge
      docEl.msRequestFullscreen();
    }
  } else {
    // 退出全屏（兼容不同浏览器）
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }
}

export function isFullscreen() {
  const doc: any = document;
  return !!(
    (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement || // Safari/Chrome
      doc.mozFullScreenElement || // Firefox
      doc.msFullscreenElement
    ) // IE/Edge
  );
}

export function getLocalSize() {
  const htmlDom = document.body;
  htmlDom.style.setProperty('--window-height', window.innerHeight + 'px');
  htmlDom.style.setProperty('--lobby__screen-height', window.innerHeight + 'px');
  htmlDom.style.setProperty('--window-width', window.innerWidth + 'px');
  window.addEventListener('resize', data => {
    htmlDom.style.setProperty('--window-width', window.innerWidth + 'px');
    htmlDom.style.setProperty('--window-height', window.innerHeight + 'px');
    htmlDom.style.setProperty('--lobby__screen-height', window.innerHeight + 'px');
  });
}

function initSiteLocalData() {}
