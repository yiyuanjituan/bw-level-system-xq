import { getCommonInfo, getConfig } from "@/api/common";
import setPageTitle from "@/utils/set-page-title";

export const APP_PREFIX_KEY = "YG_PREFIX";

export function initApp() {
  return Promise.all([getSiteConfig(), getHomeData(), getLocalSize()]);
}

function getSiteConfig() {
  return new Promise((resolve, reject) => {
    getConfig().then((res) => {
      localStorage.setItem(`${APP_PREFIX_KEY}_site_config`, JSON.stringify(res));
      setPageTitle(res.title);
      resolve(res)
    }).catch((err) => resolve(void 0))
  })
}

function getHomeData() {
  return new Promise((resolve, reject) => {
    getCommonInfo().then((res) => {
      localStorage.setItem(`${APP_PREFIX_KEY}_site_game`, JSON.stringify(res));
      resolve(res)
    }).catch((err) => resolve(void 0))
  })
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
    } else if (docEl.webkitRequestFullscreen) { // Chrome/Safari
      docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) { // Firefox
      docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) { // IE/Edge
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
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||  // Safari/Chrome
    doc.mozFullScreenElement ||     // Firefox
    doc.msFullscreenElement         // IE/Edge
  );
}

export function getLocalSize() {
  const htmlDom = document.body
  htmlDom.style.setProperty('--window-height', window.innerHeight + 'px')
  htmlDom.style.setProperty('--lobby__screen-height', window.innerHeight + 'px')
  htmlDom.style.setProperty('--window-width', window.innerWidth + 'px')
  window.addEventListener('resize', (data) => {
    htmlDom.style.setProperty('--window-width', window.innerWidth + 'px')
    htmlDom.style.setProperty('--window-height', window.innerHeight + 'px')
    htmlDom.style.setProperty('--lobby__screen-height', window.innerHeight + 'px')
  })
}

function initSiteLocalData() {

}