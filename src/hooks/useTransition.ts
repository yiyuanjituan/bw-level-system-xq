import { ref } from "vue";
import { toRouteType } from "@/router";

export const systemTransitionName = ref("none");
export const tabbarTransitionName = ref("page-slide-forward");

export const setSystemName = name => {
  systemTransitionName.value = name;
};
export const setTabBarName = name => {
  tabbarTransitionName.value = name;
};

export const autoCalculateTransitionName = (
  from: any,
  to: toRouteType,
  state: any,
) => {
  if (from.path == "/") {
    // 初始化动画
    setSystemName("none");
    setTimeout(() => setSystemName("page-slide-forward"), 100);
    return
  }
  if (to.meta.isTabBar && from.meta.isTabBar) {
    return setSystemName("none");
  }
  if (from.meta.isTabBar && !to.meta.isTabBar) {
    return setSystemName("page-slide-forward");
  }
  if (!from.meta.isTabBar && !to.meta.isTabBar) {
    // 通过[state]判断层级
  }

  setSystemName("page-slide-backward");
};
