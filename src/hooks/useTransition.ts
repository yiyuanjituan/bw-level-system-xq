import { ref } from "vue";
import { toRouteType } from "@/router";

export const systemTransitionName = ref("none");
export const tabbarTransitionName = ref("page-slide-forward");

export const setSystemName = (name: string) => {
  systemTransitionName.value = name;
};

export const setTabBarName = (name: string) => {
  tabbarTransitionName.value = name;
};

function isBackNavigation(from: any, state: any) {
  if (!state) return false;
  return state.forward === from.fullPath || state.forward === from.path;
}

export const autoCalculateTransitionName = (
  from: any,
  to: toRouteType,
  state: any
) => {
  if (from.path === "/") {
    setSystemName("none");
    setTimeout(() => setSystemName("page-slide-forward"), 100);
    return;
  }

  if (to.meta.isTabBar && from.meta.isTabBar) {
    setSystemName("none");
    return;
  }

  if (from.meta.isTabBar && !to.meta.isTabBar) {
    setSystemName("page-slide-forward");
    setTabBarName("page-slide-forward");
    return;
  }

  if (!from.meta.isTabBar && !to.meta.isTabBar) {
    const animation = isBackNavigation(from, state)
      ? "page-slide-backward"
      : "page-slide-forward";
    setSystemName(animation);
    setTabBarName(animation);
    return;
  }

  setSystemName("page-slide-backward");
  setTabBarName("page-slide-backward");
};
