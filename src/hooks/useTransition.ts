import { ref } from "vue";
import type { toRouteType } from "@/router";

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

function getLayoutPath(route: any) {
  return route.matched?.[0]?.path || route.path;
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

  const isSameLayout = getLayoutPath(from) === getLayoutPath(to);

  if (to.meta.isTabBar && from.meta.isTabBar) {
    setSystemName("none");
    return;
  }

  if (isSameLayout) {
    setSystemName("none");
    const animation = isBackNavigation(from, state)
      ? "page-slide-backward"
      : "page-slide-forward";
    setTabBarName(animation);
    return;
  }

  // 跨布局时只执行整屏动画，避免离场页面叠加内外两层位移。
  setTabBarName("none");
  setSystemName(to.meta.isTabBar ? "page-slide-backward" : "page-slide-forward");
};
