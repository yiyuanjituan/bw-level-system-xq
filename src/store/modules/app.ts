import { defineStore } from 'pinia'
import { ref } from "vue";
import { getCommonInfo, getConfig, getThemeConfig } from "@/api/common";
import type { GameImageDisplay, HomePageSection, MineHeroStyle, MineMenuItem, MinePageSection, MineQuickAction, MineTemplateName, ThemeConfigResponse } from "@/api/common";
import {
  DEFAULT_THEME_TEMPLATE,
  normalizeThemeConfig
} from "@/config/theme-config";
import {
  DEFAULT_GAME_IMAGE_DISPLAY,
  DEFAULT_HOME_FOOTER_CONFIG,
  DEFAULT_HOME_PAGE_SECTIONS,
  DEFAULT_MINE_HERO_STYLE,
  DEFAULT_MINE_PAGE_LAYOUT,
  DEFAULT_MINE_TEMPLATE,
  cloneHomeFooterConfig,
  normalizeHomePageLayout,
  normalizeMinePageLayout,
} from "@/config/page-config";
import {
  SITE_ACTIVITY_CACHE_KEY,
  SITE_CONFIG_CACHE_KEY,
  SITE_GAME_CACHE_KEY
} from "@/utils/appCache";
import type { AppInitializationResult } from "@/utils/site";
import { isYimenApp } from "@/utils/yimenApp";
import { updatePwaMetadata } from "@/utils/pwa";

// 站点图标必须写入 HTML head；接口刷新后覆盖已有节点，避免重复添加 link。
const updateFavicon = (iconUrl?: string) => {
  const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']") || document.createElement("link");

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
const isPlainObject = (value: unknown): value is Record<string, any> => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};
const isThemeConfigLike = (value: unknown): value is Partial<ThemeConfigResponse> => {
  return isPlainObject(value)
    && (isPlainObject(value.variables) || isPlainObject(value.pageLayouts) || value.theme !== undefined || value.preset !== undefined);
};

const readLocalJson = <T>(key: string, fallback: T): T => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

const createEmptyAppInfo = () => ({
  countryList: [],
  home_popup: [],
});

const normalizeAppInfo = (value: any) => {
  const appInfo = {
    ...createEmptyAppInfo(),
    ...(value && typeof value === 'object' ? value : {}),
    countryList: Array.isArray(value?.countryList) ? value.countryList : [],
    home_popup: Array.isArray(value?.home_popup) ? value.home_popup : [],
  };

  delete appInfo.theme_config;
  return appInfo;
};

const getPersistedAppInfo = () => {
  return normalizeAppInfo(readLocalJson(SITE_CONFIG_CACHE_KEY, null));
};

export interface PreviewStateReplacement {
  scope: "theme" | "page";
  pageCode?: "home" | "mine";
  data?: unknown;
}

export const useAppStore = defineStore('app', () => {
  const appLoadingStartedAt = Date.now()
  const persistedAppInfo = getPersistedAppInfo()
  const appInfo = ref<any>(persistedAppInfo)
  const venueList = ref<any>(readLocalJson(SITE_GAME_CACHE_KEY, null))
  const activityList = ref<any>(readLocalJson(SITE_ACTIVITY_CACHE_KEY, {}))
  const gameList = ref<{ id: number, children: any[] }[]>([])
  const isShowDownload = ref(true)
  const isAppReady = ref(false)
  const appLoadingProgress = ref(6)
  const appLoadingStatus = ref("正在启动应用")
  const themeTemplate = ref<0 | 1>(DEFAULT_THEME_TEMPLATE)
  const mineTemplate = ref<MineTemplateName>(DEFAULT_MINE_TEMPLATE)
  const mineHeroStyle = ref<MineHeroStyle>(DEFAULT_MINE_HERO_STYLE)
  const mineHeroImage = ref('')
  const gameImageDisplay = ref<GameImageDisplay>(DEFAULT_GAME_IMAGE_DISPLAY)
  const homePageSections = ref<HomePageSection[]>(DEFAULT_HOME_PAGE_SECTIONS.map(section => ({ ...section })))
  const homeFooterConfig = ref(cloneHomeFooterConfig(DEFAULT_HOME_FOOTER_CONFIG))
  const homePageLayoutVersion = ref(0)
  const minePageSections = ref<MinePageSection[]>(DEFAULT_MINE_PAGE_LAYOUT.sections.map(section => ({ ...section })))
  const mineQuickActions = ref<MineQuickAction[]>(DEFAULT_MINE_PAGE_LAYOUT.config.quickActions.map(item => ({ ...item })))
  const mineMenuItems = ref<MineMenuItem[]>(DEFAULT_MINE_PAGE_LAYOUT.config.menuItems.map(item => ({ ...item })))
  const minePageLayoutVersion = ref(0)
  updateFavicon(appInfo.value?.favicon)
  updatePwaMetadata(appInfo.value)

  const applyThemeConfig = (themeConfig?: unknown) => {
    if (!isThemeConfigLike(themeConfig)) return;

    const normalizedThemeConfig = normalizeThemeConfig(themeConfig)
    const homePageLayout = normalizeHomePageLayout(normalizedThemeConfig.pageLayouts?.home)
    const minePageLayout = normalizeMinePageLayout(normalizedThemeConfig.pageLayouts?.mine)

    themeTemplate.value = normalizeThemeTemplate(normalizedThemeConfig.theme)
    mineTemplate.value = minePageLayout.config.template
    mineHeroStyle.value = minePageLayout.config.heroStyle
    mineHeroImage.value = minePageLayout.config.heroImage || ''
    gameImageDisplay.value = homePageLayout.config.gameImageDisplay
    homePageSections.value = homePageLayout.sections.map(section => ({ ...section }))
    homeFooterConfig.value = cloneHomeFooterConfig(homePageLayout.config.footer)
    minePageSections.value = minePageLayout.sections.map(section => ({ ...section }))
    mineQuickActions.value = minePageLayout.config.quickActions.map(item => ({ ...item }))
    mineMenuItems.value = minePageLayout.config.menuItems.map(item => ({ ...item }))
    appInfo.value = {
      ...(appInfo.value || {}),
      theme_config: normalizedThemeConfig
    }
    applyThemeVariables(normalizedThemeConfig)
  }

  const replacePreviewState = (replacement: PreviewStateReplacement) => {
    if (replacement.scope === "theme") {
      // 主题装修发送的是完整主题数据，但不应覆盖由页面装修独立维护的首页与个人中心布局。
      applyThemeConfig({
        ...(isPlainObject(replacement.data) ? replacement.data : {}),
        pageLayouts: {
          home: {
            sections: homePageSections.value.map(section => ({ ...section })),
            config: {
              gameImageDisplay: gameImageDisplay.value,
              footer: cloneHomeFooterConfig(homeFooterConfig.value)
            }
          },
          mine: {
            sections: minePageSections.value.map(section => ({ ...section })),
            config: {
              template: mineTemplate.value,
              heroStyle: mineHeroStyle.value,
              heroImage: mineHeroImage.value,
              quickActions: mineQuickActions.value.map(item => ({ ...item })),
              menuItems: mineMenuItems.value.map(item => ({ ...item }))
            }
          }
        }
      })
      return
    }

    if (replacement.scope !== "page" || !isPlainObject(replacement.data)) return

    if (replacement.pageCode === "home") {
      const homePageLayout = normalizeHomePageLayout(replacement.data)
      // 使用新数组整体替换布局，全局缓存同时供首页和子游戏页消费。
      homePageSections.value = homePageLayout.sections.map(section => ({ ...section }))
      gameImageDisplay.value = homePageLayout.config.gameImageDisplay
      homeFooterConfig.value = cloneHomeFooterConfig(homePageLayout.config.footer)
      homePageLayoutVersion.value += 1
      return
    }

    if (replacement.pageCode === "mine") {
      const minePageLayout = normalizeMinePageLayout(replacement.data)
      // 整体替换个人中心状态：区块、模板、顶部样式、自定义背景、快捷入口与功能菜单。
      minePageSections.value = minePageLayout.sections.map(section => ({ ...section }))
      mineTemplate.value = minePageLayout.config.template
      mineHeroStyle.value = minePageLayout.config.heroStyle
      mineHeroImage.value = minePageLayout.config.heroImage || ''
      mineQuickActions.value = minePageLayout.config.quickActions.map(item => ({ ...item }))
      mineMenuItems.value = minePageLayout.config.menuItems.map(item => ({ ...item }))
      minePageLayoutVersion.value += 1
    }
  }

  const applySiteConfig = (siteConfig?: unknown) => {
    if (!isPlainObject(siteConfig)) return;

    const currentThemeConfig = appInfo.value?.theme_config;
    appInfo.value = {
      ...normalizeAppInfo(siteConfig),
      ...(currentThemeConfig ? { theme_config: currentThemeConfig } : {})
    }
    updateFavicon(siteConfig.favicon)
    updatePwaMetadata(siteConfig)
  }

  const updateAppLoadingState = (progress: number, status: string) => {
    appLoadingProgress.value = Math.min(100, Math.max(appLoadingProgress.value, Math.round(progress)))
    if (status) appLoadingStatus.value = status
  }

  const completeAppInitialization = async (initialization: AppInitializationResult) => {
    applySiteConfig(initialization.siteConfig)

    const remoteThemeConfig = initialization.themeConfig
      || initialization.siteConfig?.theme_config;
    if (remoteThemeConfig) applyThemeConfig(remoteThemeConfig)

    if (initialization.commonInfo?.venueList) {
      venueList.value = initialization.commonInfo.venueList
    }

    updateAppLoadingState(96, "正在渲染首页")
    if (isYimenApp()) {
      const remainingDuration = Math.max(0, 1800 - (Date.now() - appLoadingStartedAt))
      if (remainingDuration > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingDuration))
      }
      updateAppLoadingState(100, "加载完成")
      await new Promise((resolve) => window.setTimeout(resolve, 1500))
    }
    isAppReady.value = true
  }

  const refreshThemeConfig = async () => {
    try {
      applyThemeConfig(await getThemeConfig())
    } catch (error) {
      console.error("刷新前台装修配置失败，失败原因：", error)
    }
  }

  const refreshData = () => {
    getConfig().then((res) => {
      applySiteConfig(res)
      if (res?.theme_config) {
        applyThemeConfig(res.theme_config)
      }
    })
    getCommonInfo().then((res) => venueList.value = res.venueList)
    void refreshThemeConfig()
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
    mineHeroImage,
    gameImageDisplay,
    homePageSections,
    homeFooterConfig,
    homePageLayoutVersion,
    minePageSections,
    mineQuickActions,
    mineMenuItems,
    minePageLayoutVersion,
    isAppReady,
    appLoadingProgress,
    appLoadingStatus,
    isShowDownload,
    venueList,
    gameList,
    activityList,
    refreshData,
    refreshThemeConfig,
    updateDownloadBtn,
    updateAppLoadingState,
    completeAppInitialization,
    replacePreviewState,
    setGameList,
    updateActivity
  }
}, {
  persist: {
    omit: ["isAppReady", "appLoadingProgress", "appLoadingStatus", "themeTemplate", "mineTemplate", "mineHeroStyle", "mineHeroImage", "gameImageDisplay", "homePageSections", "homeFooterConfig", "homePageLayoutVersion", "minePageSections", "mineQuickActions", "mineMenuItems", "minePageLayoutVersion", "appInfo.theme_config"],
    afterHydrate: ({ store }) => {
      (store as any).isAppReady = false;
      (store as any).appLoadingProgress = 6;
      (store as any).appLoadingStatus = "正在启动应用";
      (store as any).appInfo = normalizeAppInfo((store as any).appInfo);
      (store as any).themeTemplate = DEFAULT_THEME_TEMPLATE;
      (store as any).mineTemplate = DEFAULT_MINE_TEMPLATE;
      (store as any).mineHeroStyle = DEFAULT_MINE_HERO_STYLE;
      (store as any).mineHeroImage = '';
      (store as any).gameImageDisplay = DEFAULT_GAME_IMAGE_DISPLAY;
      (store as any).homePageSections = DEFAULT_HOME_PAGE_SECTIONS.map(section => ({ ...section }));
      (store as any).homeFooterConfig = cloneHomeFooterConfig(DEFAULT_HOME_FOOTER_CONFIG);
      (store as any).homePageLayoutVersion = 0;
      (store as any).minePageSections = DEFAULT_MINE_PAGE_LAYOUT.sections.map(section => ({ ...section }));
      (store as any).mineQuickActions = DEFAULT_MINE_PAGE_LAYOUT.config.quickActions.map(item => ({ ...item }));
      (store as any).mineMenuItems = DEFAULT_MINE_PAGE_LAYOUT.config.menuItems.map(item => ({ ...item }));
      (store as any).minePageLayoutVersion = 0;
    }
  },
})

export default useAppStore
