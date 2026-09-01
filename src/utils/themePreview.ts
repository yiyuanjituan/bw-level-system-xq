import type { Pinia } from 'pinia';
import useAppStore, { type PreviewStateReplacement } from '@/store/modules/app';

const PREVIEW_UPDATE_MESSAGE = 'YG_PREVIEW_STATE_REPLACE';
const PREVIEW_READY_MESSAGE = 'YG_PREVIEW_READY';

export function isThemePreviewMode() {
  if (typeof window === 'undefined') return false;
  return getPreviewParam('preview') === '1';
}

function getPreviewParam(name: string) {
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  return new URLSearchParams(window.location.search).get(name)
    || new URLSearchParams(hashQuery).get(name)
    || '';
}

function normalizeHttpOrigin(value: string) {
  if (!value) return '';
  try {
    const parsedUrl = new URL(value);
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.origin : '';
  } catch {
    return '';
  }
}

interface PreviewReplaceMessage {
  type: typeof PREVIEW_UPDATE_MESSAGE;
  version: number;
  payload: PreviewStateReplacement;
}

const isPreviewReplaceMessage = (value: unknown): value is PreviewReplaceMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<PreviewReplaceMessage>;
  return message.type === PREVIEW_UPDATE_MESSAGE
    && Boolean(message.payload && typeof message.payload === 'object')
    && (message.payload?.scope === 'theme' || message.payload?.scope === 'page');
};

export function initThemePreviewBridge(pinia: Pinia) {
  if (!isThemePreviewMode()) return;

  const app = useAppStore(pinia);
  // 优先使用后台显式传入的来源，referrer 被浏览器策略移除时仍能完成跨域握手。
  const parentOrigin = normalizeHttpOrigin(getPreviewParam('parentOrigin'))
    || normalizeHttpOrigin(document.referrer);

  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (parentOrigin && event.origin !== parentOrigin) return;
    if (!isPreviewReplaceMessage(event.data)) return;

    // 所有装修消息都携带完整作用域数据，由 Store 一次性替换对应状态。
    app.replacePreviewState(event.data.payload);
  };

  window.addEventListener('message', handleMessage);
  window.parent?.postMessage({ type: PREVIEW_READY_MESSAGE, version: 2 }, parentOrigin || '*');

  return () => window.removeEventListener('message', handleMessage);
}
