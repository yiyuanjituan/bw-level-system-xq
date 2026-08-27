import type { RouteLocationRaw } from "vue-router";

export type MineTemplateActionKey =
  | "withdraw"
  | "deposit"
  | "yuebao"
  | "records"
  | "withdraw-manage"
  | "promote"
  | "claim"
  | "profile"
  | "security"
  | "find-us"
  | "language"
  | "faq"
  | "feedback"
  | "devices"
  | "about"
  | "logout"
  | "login"
  | "register"
  | "service"
  | "message";

export type MineTemplateBadgeTone = "primary" | "success" | "danger" | "muted";

export interface MineTemplateActionItem {
  key: MineTemplateActionKey | string;
  label: string;
  icon?: string;
  activeIcon?: string;
  image?: string;
  badge?: string | number;
  badgeTone?: MineTemplateBadgeTone;
  extra?: string | string[];
  extraTone?: MineTemplateBadgeTone;
  route?: RouteLocationRaw;
  iconMode?: "normal" | "claim";
  hiddenWhenLogout?: boolean;
  disabled?: boolean;
}

export interface MineTemplateMenuGroup {
  key: string;
  items: MineTemplateActionItem[];
}

export type MineTemplateSelectSource = "quick" | "menu" | "guest" | "header" | "user";

export interface MineTemplateSelectPayload {
  source: MineTemplateSelectSource;
  action: string;
  item?: MineTemplateActionItem;
}
