import { createI18n } from "vue-i18n";
import type { TranslateOptions } from "vue-i18n";
import zhCN from "vant/es/locale/lang/zh-CN.mjs";
import zhTW from "vant/es/locale/lang/zh-TW.mjs";
import enUS from "vant/es/locale/lang/en-US.mjs";
import jaJP from "vant/es/locale/lang/ja-JP.mjs";
import frFR from "vant/es/locale/lang/fr-FR.mjs";
import thTH from "vant/es/locale/lang/th-TH.mjs";
import messages from "./locales";
import { languageNames, languageOptions } from "./language";
import { getCookie, setCookie } from "@/utils/auth";

const defaultLanguage = "zh-cn";

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale: defaultLanguage, // 当前语言翻译缺失时显示的语言
  messages
});

interface T {
  (key: I18nType.I18nKey): string;
  (
    key: I18nType.I18nKey,
    plural: number,
    options?: TranslateOptions<I18nType.LangType>
  ): string;
  (
    key: I18nType.I18nKey,
    defaultMsg: string,
    options?: TranslateOptions<I18nType.I18nKey>
  ): string;
  (
    key: I18nType.I18nKey,
    list: unknown[],
    options?: TranslateOptions<I18nType.I18nKey>
  ): string;
  (key: I18nType.I18nKey, list: unknown[], plural: number): string;
  (key: I18nType.I18nKey, list: unknown[], defaultMsg: string): string;
  (
    key: I18nType.I18nKey,
    named: Record<string, unknown>,
    options?: TranslateOptions<I18nType.LangType>
  ): string;
  (
    key: I18nType.I18nKey,
    named: Record<string, unknown>,
    plural: number
  ): string;
  (
    key: I18nType.I18nKey,
    named: Record<string, unknown>,
    defaultMsg: string
  ): string;
}

export const $t = i18n.global.t as T;
export const $locale = i18n.global.locale;
export const vantLocales = {
  "zh-cn": zhCN,
  "zh-tw": zhTW,
  en: enUS,
  ja: jaJP,
  fr: frFR,
  ms: enUS,
  "th-TH": thTH,
  ug: enUS
};

function getDefaultLanguage(): I18nType.LangType {
  const locales = Object.keys(messages) as I18nType.LangType[];
  // 1. 优先从 cookies 中取得语言
  const chosenLanguage = normalizeLanguage(String(getCookie("lang") || ""));
  if (chosenLanguage && locales.includes(chosenLanguage)) return chosenLanguage;

  // 2. 其次从浏览器中取得默认语言
  const browserLanguage = normalizeLanguage(typeof navigator === "undefined" ? "" : navigator.language);
  if (browserLanguage && locales.includes(browserLanguage)) return browserLanguage;

  // 3. 最后默认语言
  return defaultLanguage;
}

export function setLocale(locale: I18nType.LangType) {
  if (!languageOptions.some(language => language.value === locale)) return;
  i18n.global.locale.value = locale;
  setCookie("lang", locale);
  applyLocaleDocument(locale);
}

function normalizeLanguage(value: string): I18nType.LangType | undefined {
  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, I18nType.LangType> = {
    "zh": "zh-cn",
    "zh-cn": "zh-cn",
    "zh-hans": "zh-cn",
    "zh-tw": "zh-tw",
    "zh-hk": "zh-tw",
    "zh-mo": "zh-tw",
    "zh-hant": "zh-tw",
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    ja: "ja",
    "ja-jp": "ja",
    fr: "fr",
    "fr-fr": "fr",
    ms: "ms",
    "ms-my": "ms",
    th: "th-TH",
    "th-th": "th-TH",
    ug: "ug",
    "ug-cn": "ug"
  };
  return aliases[normalized];
}

function applyLocaleDocument(locale: I18nType.LangType) {
  if (typeof document === "undefined") return;
  const language = languageOptions.find(item => item.value === locale);
  document.documentElement.lang = locale;
  // 根节点保持 LTR，避免 Vant、弹窗和游戏布局在 RTL 下整体反转；需要 RTL 的维吾尔语文本由业务组件局部处理。
  document.documentElement.dir = "ltr";
  document.documentElement.dataset.localeDirection = language?.direction ?? "ltr";
}

applyLocaleDocument(getDefaultLanguage());

export { languageNames };

export default i18n;
