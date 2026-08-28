import { defineStore } from 'pinia'
import { ref } from "vue";
import { getCommonInfo, getConfig, getThemeConfig } from "@/api/common";
import type { MineHeroStyle, MineTemplateName } from "@/api/common";
import { APP_PREFIX_KEY } from "@/utils/site";

// 站点图标必须写入 HTML head；接口刷新后覆盖已有节点，避免重复添加 link。
const updateFavicon = (iconUrl?: string) => {
  const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    || document.createElement("link");

  iconLink.rel = "icon";
  iconLink.href = iconUrl || "/favicon.ico";

  if (!iconLink.parentElement) {
    document.head.appendChild(iconLink);
  }
};

// 十六进制颜色转 RGB 通道值，供 rgba(var(--xxx__toRgbString), .1) 这类样式使用。
const toRgbChannels = (color: string) => {
  if (!color) return "";

  if (color.startsWith("#")) {
    let hexColor = color.slice(1);
    if (hexColor.length === 3 || hexColor.length === 4) {
      hexColor = hexColor.split("").map((char) => char + char).join("");
    }
    if (hexColor.length === 8) hexColor = hexColor.slice(0, 6);
    if (hexColor.length !== 6) return "";

    return [0, 2, 4]
      .map((offset) => parseInt(hexColor.slice(offset, offset + 2), 16))
      .join(",");
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
  if (!rgbMatch) return "";
  return rgbMatch[1].split(",").slice(0, 3).map((channel) => channel.trim()).join(",");
};

export const applyThemeVariables = (themeConfig?: { variables?: Record<string, string> }) => {
  const variables = themeConfig?.variables;
  if (!variables) return;

  Object.entries(variables).forEach(([variableName, variableValue]) => {
    if (variableName && variableValue) document.documentElement.style.setProperty(variableName, variableValue);

    const rgbValue = toRgbChannels(String(variableValue));
    if (rgbValue) document.documentElement.style.setProperty(`${variableName}__toRgbString`, rgbValue);
  });
};

const normalizeThemeTemplate = (value: unknown): 0 | 1 => Number(value) === 1 ? 1 : 0;
const normalizeMineTemplate = (value: unknown): MineTemplateName => value === "TemplateTwo" ? "TemplateTwo" : "TemplateOne";
const normalizeMineHeroStyle = (value: unknown): MineHeroStyle => value === "common" || value === "common82" ? value : "blue";

const createEmptyAppInfo = () => ({
  countryList: [],
  home_popup: [],
});

const normalizeAppInfo = (value: any) => ({
  ...createEmptyAppInfo(),
  ...(value && typeof value === 'object' ? value : {}),
  countryList: Array.isArray(value?.countryList) ? value.countryList : [],
  home_popup: Array.isArray(value?.home_popup) ? value.home_popup : [],
});

const getPersistedAppInfo = () => {
  try {
    const value = JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_config`) || "null");
    return normalizeAppInfo(value);
  } catch {
    return createEmptyAppInfo();
  }
};

export const useAppStore = defineStore('app', () => {
  const appInfo = ref<any>(getPersistedAppInfo())
  const venueList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_game`)))
  const activityList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_activity`) || '{}'))
  const gameList = ref<{ id: number, children: any[] }[]>([])
  const isShowDownload = ref(true)
  const themeTemplate = ref<0 | 1>(normalizeThemeTemplate(appInfo.value?.theme_config?.theme))
  const mineTemplate = ref<MineTemplateName>(normalizeMineTemplate(appInfo.value?.theme_config?.mineTemplate))
  const mineHeroStyle = ref<MineHeroStyle>(normalizeMineHeroStyle(appInfo.value?.theme_config?.assets?.mineHeroStyle))
  updateFavicon(appInfo.value?.favicon)
  applyThemeVariables(appInfo.value?.theme_config)

  const refreshData = () => {
    getConfig().then((res) => {
      appInfo.value = normalizeAppInfo(res)
      updateFavicon(res?.favicon)
      if (res?.theme_config) {
        themeTemplate.value = normalizeThemeTemplate(res.theme_config.theme)
        mineTemplate.value = normalizeMineTemplate(res.theme_config.mineTemplate)
        mineHeroStyle.value = normalizeMineHeroStyle(res.theme_config.assets?.mineHeroStyle)
        applyThemeVariables(res.theme_config)
      }
    })
    getCommonInfo().then((res) => venueList.value = res.venueList)
    getThemeConfig().then((res) => {
      themeTemplate.value = normalizeThemeTemplate(res?.theme)
      mineTemplate.value = normalizeMineTemplate(res?.mineTemplate)
      mineHeroStyle.value = normalizeMineHeroStyle(res?.assets?.mineHeroStyle)
      appInfo.value = {
        ...(appInfo.value || {}),
        theme_config: res
      }
      applyThemeVariables(res)
    })
  }

  const updateDownloadBtn = (value: boolean) => {
    isShowDownload.value = value
  }

  const setGameList = (id: number, list: any[]) => {
    // 判断id对应的数据是否存在
    const index = gameList.value.findIndex((item) => item.id === id)
    if (index > -1) {
      gameList.value[index].children = list
    } else {
      gameList.value.push({ id, children: list })
    }
  }

  const updateActivity = (value: any) => {
    activityList.value = value
  }

  return {
    appInfo,
    themeTemplate,
    mineTemplate,
    mineHeroStyle,
    isShowDownload,
    venueList,
    gameList,
    activityList,
    refreshData,
    updateDownloadBtn,
    setGameList,
    updateActivity
  }
}, {
  persist: true,
})

export default useAppStore
