import type { GameImageDisplay, MineHeroStyle, MineTemplateName, ThemeConfigResponse } from "@/api/common";

export interface ThemeVariableConfig {
  name: string;
  label: string;
  defaultValue: string;
}

export const DEFAULT_THEME_TEMPLATE = 0;
export const DEFAULT_MINE_TEMPLATE: MineTemplateName = "TemplateOne";
export const DEFAULT_MINE_HERO_STYLE: MineHeroStyle = "blue";
export const DEFAULT_GAME_IMAGE_DISPLAY: GameImageDisplay = "long";
export const DEFAULT_THEME_PRESET = "theme-1";

export const THEME_VARIABLE_CONFIGS: ThemeVariableConfig[] = [
  { name: "--skin__bg_1", label: "页面背景", defaultValue: "#000000" },
  { name: "--skin__bg_2", label: "卡片背景", defaultValue: "#191919" },
  { name: "--skin__lead", label: "主要文字", defaultValue: "#FFFFFF" },
  { name: "--skin__neutral_1", label: "辅助文字", defaultValue: "#BCBCBC" },
  { name: "--skin__neutral_2", label: "次要文字", defaultValue: "#656565" },
  { name: "--skin__neutral_3", label: "弱化文字", defaultValue: "#525252" },
  { name: "--skin__primary", label: "品牌主色", defaultValue: "#DFBE5B" },
  { name: "--skin__alt_primary", label: "备用主色", defaultValue: "#DFBE5B" },
  { name: "--skin__border", label: "边框", defaultValue: "#242424" },
  { name: "--skin__alt_border", label: "备用边框", defaultValue: "#DFBE5B" },
  { name: "--skin__accent_1", label: "强调色 1", defaultValue: "#1FE11F" },
  { name: "--skin__accent_2", label: "强调色 2", defaultValue: "#F84673" },
  { name: "--skin__accent_3", label: "强调色 3", defaultValue: "#FFAA09" },
  { name: "--skin__filter_active", label: "筛选选中色", defaultValue: "#DFBE5B" },
  { name: "--skin__text_primary", label: "状态栏文字", defaultValue: "#FFFFFF" },
  { name: "--skin__left_nav_def", label: "导航默认色", defaultValue: "#BCBCBC" },
  { name: "--skin__left_nav_active", label: "导航选中色", defaultValue: "#FFFFFF" },
  { name: "--skin__web_left_bg_shadow", label: "背景阴影", defaultValue: "#0000001F" },
  { name: "--skin__label_text_accent3", label: "标签文字", defaultValue: "#FFFFFF" },
  { name: "--skin__tg_primary", label: "推广主色", defaultValue: "#F8F0D9" },
  { name: "--skin__tg_accent_1", label: "推广强调色 1", defaultValue: "#CCF1CB" },
  { name: "--skin__tg_accent_3", label: "推广强调色 3", defaultValue: "#FEEDCD" },
  { name: "--skin__bs_topnav_bg", label: "首页顶部背景", defaultValue: "#191919" },
  { name: "--skin__home_bg", label: "首页背景", defaultValue: "#000000" },
  { name: "--skin__ddt_bg", label: "图片背景色", defaultValue: "#1B1B1B" },
  { name: "--skin__bs_topnav_wallet_bg", label: "钱包背景", defaultValue: "rgba(255, 255, 255, 0.08)" },
  { name: "--top_bg_color", label: "下载栏背景", defaultValue: "#282525CC" },
  { name: "--top_close_icon_color", label: "下载栏关闭图标", defaultValue: "#B9B55CFF" },
  { name: "--top_download_icon_color", label: "下载栏按钮", defaultValue: "#B9B55CFF" },
];

export const DEFAULT_THEME_VARIABLES = THEME_VARIABLE_CONFIGS.reduce<Record<string, string>>(
  (variables, config) => {
    variables[config.name] = config.defaultValue;
    return variables;
  },
  {}
);

export const DEFAULT_THEME_CONFIG: ThemeConfigResponse = {
  theme: DEFAULT_THEME_TEMPLATE,
  templateTag: "",
  mineTemplate: DEFAULT_MINE_TEMPLATE,
  preset: DEFAULT_THEME_PRESET,
  variables: { ...DEFAULT_THEME_VARIABLES },
  assets: {
    mineHeroStyle: DEFAULT_MINE_HERO_STYLE,
    gameImageDisplay: DEFAULT_GAME_IMAGE_DISPLAY,
  },
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

export function normalizeThemeConfig(value?: Partial<ThemeConfigResponse> | null): ThemeConfigResponse {
  const source = isPlainObject(value) ? value : {};
  const sourceVariables = isPlainObject(source.variables) ? source.variables : {};
  const variables = { ...DEFAULT_THEME_VARIABLES };

  Object.entries(sourceVariables).forEach(([name, variableValue]) => {
    if (typeof variableValue !== "string") return;

    const normalizedValue = variableValue.trim();
    if (normalizedValue) variables[name] = normalizedValue;
  });

  return {
    theme: Number(source.theme) === 1 ? 1 : DEFAULT_THEME_TEMPLATE,
    templateTag: typeof source.templateTag === "string" ? source.templateTag : "",
    mineTemplate: source.mineTemplate === "TemplateTwo" ? "TemplateTwo" : DEFAULT_MINE_TEMPLATE,
    preset: typeof source.preset === "string" && source.preset.trim()
      ? source.preset.trim()
      : DEFAULT_THEME_PRESET,
    variables,
    assets: {
      mineHeroStyle: source.assets?.mineHeroStyle === "common" || source.assets?.mineHeroStyle === "common82"
        ? source.assets.mineHeroStyle
        : DEFAULT_MINE_HERO_STYLE,
      gameImageDisplay: source.assets?.gameImageDisplay === "long" || source.assets?.gameImageDisplay === "square"
        ? source.assets.gameImageDisplay
        : DEFAULT_GAME_IMAGE_DISPLAY,
    },
  };
}
