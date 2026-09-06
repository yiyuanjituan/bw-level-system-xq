type LangType = I18nType.LangType;

export interface LanguageOption {
  value: LangType;
  label: string;
  nativeLabel: string;
  direction: "ltr" | "rtl";
}

export const languageOptions: LanguageOption[] = [
  { value: "zh-cn", label: "简体中文", nativeLabel: "简体中文", direction: "ltr" },
  { value: "zh-tw", label: "繁體中文", nativeLabel: "繁體中文", direction: "ltr" },
  { value: "en", label: "English", nativeLabel: "English", direction: "ltr" },
  { value: "ja", label: "日本語", nativeLabel: "日本語", direction: "ltr" },
  { value: "fr", label: "Français", nativeLabel: "Français", direction: "ltr" },
  { value: "ms", label: "Bahasa Melayu", nativeLabel: "Bahasa Melayu", direction: "ltr" },
  { value: "th-TH", label: "ไทย", nativeLabel: "ไทย", direction: "ltr" },
  { value: "ug", label: "ئۇيغۇرچە", nativeLabel: "ئۇيغۇرچە", direction: "rtl" }
];

export const languageNames = Object.fromEntries(
  languageOptions.map(language => [language.value, language.nativeLabel])
) as Record<LangType, string>;
