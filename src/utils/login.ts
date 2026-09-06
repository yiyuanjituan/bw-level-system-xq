import router from "@/router";
import useAppStore from "@/store/modules/app";
import { bus } from "@/utils/mitt";

export type LoginEntryTab = 0 | 1;

/**
 * 所有未登录入口统一从这里进入，保证后台配置切换后不会遗漏某个页面。
 */
export function openLoginEntry(tab: LoginEntryTab = 1) {
  const app = useAppStore();
  if (Number(app.appInfo?.loginMode) === 2) {
    bus.emit("showLogin", tab);
    return;
  }

  void router.push(tab === 0 ? "/home/register" : "/home/login");
}

export function isLoginDialogMode(appInfo: unknown) {
  return Number((appInfo as { loginMode?: unknown })?.loginMode) === 2;
}
