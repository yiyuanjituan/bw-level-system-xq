import type { Pinia } from 'pinia';
import useAppStore, { applyThemeVariables } from '@/store/modules/app';

export function isThemePreviewMode() {
  if (typeof window === 'undefined') return false;
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  return new URLSearchParams(window.location.search).get('preview') === '1'
    || new URLSearchParams(hashQuery).get('preview') === '1';
}

interface ThemePreviewPayload {
  theme?: number;
  mineTemplate?: 'TemplateOne' | 'TemplateTwo';
  variables?: Record<string, string>;
  assets?: {
    mineHeroStyle?: 'blue' | 'common' | 'common82';
  };
}

const isPreviewMessage = (value: unknown): value is { type: string; payload?: ThemePreviewPayload } => {
  return Boolean(value && typeof value === 'object' && (value as { type?: unknown }).type === 'YG_THEME_PREVIEW_UPDATE');
};

export function initThemePreviewBridge(pinia: Pinia) {
  if (!isThemePreviewMode()) return;

  const app = useAppStore(pinia);
  const parentOrigin = document.referrer ? new URL(document.referrer).origin : '';

  const applyPayload = (payload?: ThemePreviewPayload) => {
    if (!payload) return;
    if (payload.theme === 0 || payload.theme === 1) app.themeTemplate = payload.theme;
    if (payload.mineTemplate === 'TemplateOne' || payload.mineTemplate === 'TemplateTwo') {
      app.mineTemplate = payload.mineTemplate;
    }
    applyThemeVariables({ variables: payload.variables });

    if (payload.assets?.mineHeroStyle === 'blue' || payload.assets?.mineHeroStyle === 'common' || payload.assets?.mineHeroStyle === 'common82') {
      app.mineHeroStyle = payload.assets.mineHeroStyle;
    }
  };

  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (parentOrigin && event.origin !== parentOrigin) return;
    if (!isPreviewMessage(event.data)) return;
    applyPayload(event.data.payload);
  };

  window.addEventListener('message', handleMessage);
  window.parent?.postMessage({ type: 'YG_THEME_PREVIEW_READY', version: 1 }, parentOrigin || '*');

  return () => window.removeEventListener('message', handleMessage);
}
