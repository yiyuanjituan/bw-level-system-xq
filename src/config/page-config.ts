import type {
  GameImageDisplay,
  HomePageConfig,
  HomePageLayout,
  HomePageSection,
  HomePageSectionKey,
  MineHeroStyle,
  MineMenuItem,
  MineMenuItemKey,
  MinePageConfig,
  MinePageLayout,
  MinePageSection,
  MinePageSectionKey,
  MineQuickAction,
  MineQuickActionKey,
  MineTemplateName,
} from "@/api/common";

export const DEFAULT_GAME_IMAGE_DISPLAY: GameImageDisplay = "long";
export const HOME_PAGE_SECTION_KEYS: HomePageSectionKey[] = ["banner", "notice", "gameList"];
export const DEFAULT_HOME_PAGE_SECTIONS: HomePageSection[] = HOME_PAGE_SECTION_KEYS.map(key => ({
  key,
  visible: true,
}));
export const DEFAULT_HOME_PAGE_CONFIG: HomePageConfig = {
  gameImageDisplay: DEFAULT_GAME_IMAGE_DISPLAY,
};
export const DEFAULT_HOME_PAGE_LAYOUT: HomePageLayout = {
  sections: DEFAULT_HOME_PAGE_SECTIONS.map(section => ({ ...section })),
  config: { ...DEFAULT_HOME_PAGE_CONFIG },
};

// ---------------- 个人中心页面配置 ----------------

export const DEFAULT_MINE_TEMPLATE: MineTemplateName = "TemplateOne";
export const DEFAULT_MINE_HERO_STYLE: MineHeroStyle = "blue";
export const MINE_PAGE_SECTION_KEYS: MinePageSectionKey[] = ["profile", "quick", "vip", "banner", "menu"];
export const MINE_QUICK_ACTION_KEYS: MineQuickActionKey[] = ["withdraw", "deposit", "yuebao"];
export const MINE_MENU_ITEM_KEYS: MineMenuItemKey[] = [
  "records",
  "balanceRecovery",
  "accountDetails",
  "betRecords",
  "withdrawManage",
  "personalReport",
  "vip",
  "promote",
  "claim",
  "plazza",
  "profile",
  "security",
  "findUs",
  "language",
  "faq",
  "feedback",
  "devices",
  "about",
  "logout",
];
// 安全相关入口不可隐藏，避免装修后用户找不到关键能力。
export const REQUIRED_MINE_MENU_ITEM_KEYS: MineMenuItemKey[] = ["security", "logout"];

export const DEFAULT_MINE_PAGE_SECTIONS: MinePageSection[] = MINE_PAGE_SECTION_KEYS.map(key => ({
  key,
  visible: true,
}));
export const DEFAULT_MINE_PAGE_CONFIG: MinePageConfig = {
  template: DEFAULT_MINE_TEMPLATE,
  heroStyle: DEFAULT_MINE_HERO_STYLE,
  quickActions: MINE_QUICK_ACTION_KEYS.map(key => ({ key, visible: true })),
  menuItems: MINE_MENU_ITEM_KEYS.map(key => ({ key, visible: true })),
};
export const DEFAULT_MINE_PAGE_LAYOUT: MinePageLayout = {
  sections: DEFAULT_MINE_PAGE_SECTIONS.map(section => ({ ...section })),
  config: {
    ...DEFAULT_MINE_PAGE_CONFIG,
    quickActions: DEFAULT_MINE_PAGE_CONFIG.quickActions.map(item => ({ ...item })),
    menuItems: DEFAULT_MINE_PAGE_CONFIG.menuItems.map(item => ({ ...item })),
  },
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

function normalizeVisibilityItems<Key extends string>(
  value: unknown,
  allowedKeys: readonly Key[],
  requiredKeys: readonly Key[] = [],
  defaults: { key: Key; visible: boolean }[]
): { key: Key; visible: boolean }[] {
  const source = Array.isArray(value) ? value : [];
  const normalizedItems: { key: Key; visible: boolean }[] = [];

  source.forEach(item => {
    if (!isPlainObject(item)) return;
    const itemKey = String(item.key || "") as Key;
    if (
      allowedKeys.includes(itemKey)
      && !normalizedItems.some(currentItem => currentItem.key === itemKey)
    ) {
      normalizedItems.push({
        key: itemKey,
        visible: requiredKeys.includes(itemKey) || item.visible !== false,
      });
    }
  });

  defaults.forEach(item => {
    if (!normalizedItems.some(currentItem => currentItem.key === item.key)) {
      normalizedItems.push({ ...item });
    }
  });
  return normalizedItems;
}

export function normalizeHomePageSections(value: unknown): HomePageSection[] {
  const source = Array.isArray(value) ? value : [];
  const normalizedSections: HomePageSection[] = [];

  source.forEach(section => {
    if (!isPlainObject(section)) return;
    const sectionKey = String(section.key || "") as HomePageSectionKey;
    if (
      HOME_PAGE_SECTION_KEYS.includes(sectionKey)
      && !normalizedSections.some(currentSection => currentSection.key === sectionKey)
    ) {
      normalizedSections.push({ key: sectionKey, visible: section.visible !== false });
    }
  });

  DEFAULT_HOME_PAGE_SECTIONS.forEach(section => {
    if (!normalizedSections.some(currentSection => currentSection.key === section.key)) {
      normalizedSections.push({ ...section });
    }
  });
  return normalizedSections;
}

export function normalizeHomePageConfig(value: unknown): HomePageConfig {
  const source = isPlainObject(value) ? value : {};
  return {
    gameImageDisplay: source.gameImageDisplay === "square" ? "square" : DEFAULT_GAME_IMAGE_DISPLAY,
  };
}

export function normalizeHomePageLayout(value: unknown): HomePageLayout {
  const source = isPlainObject(value) ? value : {};
  return {
    sections: normalizeHomePageSections(source.sections),
    config: normalizeHomePageConfig(source.config),
  };
}

export function normalizeMinePageSections(value: unknown): MinePageSection[] {
  return normalizeVisibilityItems(
    value,
    MINE_PAGE_SECTION_KEYS,
    [],
    DEFAULT_MINE_PAGE_SECTIONS
  ) as MinePageSection[];
}

export function normalizeMinePageConfig(value: unknown): MinePageConfig {
  const source = isPlainObject(value) ? value : {};
  const heroStyle = source.heroStyle === "common" || source.heroStyle === "common82" || source.heroStyle === "custom"
    ? source.heroStyle
    : DEFAULT_MINE_HERO_STYLE;
  const heroImage = typeof source.heroImage === "string" ? source.heroImage.trim() : "";
  return {
    template: source.template === "TemplateTwo" ? "TemplateTwo" : DEFAULT_MINE_TEMPLATE,
    // 自定义模式必须携带图片，否则回退蓝色顶部图，避免前台出现空背景。
    heroStyle: heroStyle === "custom" && !heroImage ? DEFAULT_MINE_HERO_STYLE : heroStyle,
    heroImage,
    quickActions: normalizeVisibilityItems(
      source.quickActions,
      MINE_QUICK_ACTION_KEYS,
      [],
      DEFAULT_MINE_PAGE_CONFIG.quickActions
    ) as MineQuickAction[],
    menuItems: normalizeVisibilityItems(
      source.menuItems,
      MINE_MENU_ITEM_KEYS,
      REQUIRED_MINE_MENU_ITEM_KEYS,
      DEFAULT_MINE_PAGE_CONFIG.menuItems
    ) as MineMenuItem[],
  };
}

export function normalizeMinePageLayout(value: unknown): MinePageLayout {
  const source = isPlainObject(value) ? value : {};
  return {
    sections: normalizeMinePageSections(source.sections),
    config: normalizeMinePageConfig(source.config),
  };
}
