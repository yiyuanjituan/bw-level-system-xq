import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized
} from "vue-router";
import routes from "./routes";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import NProgress from "@/utils/progress";
import { autoCalculateTransitionName, setSystemName } from "@/hooks/useTransition";
import { bus } from "@/utils/mitt";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export interface toRouteType extends RouteLocationNormalized {
  meta: {
    isTabBar: any;
    title?: string;
    noCache?: boolean;
  };
}

router.beforeEach((to: toRouteType, from, next) => {
  NProgress.start();
  // 路由缓存
  useCachedViewStoreHook().addCachedView(to);

  autoCalculateTransitionName(from, to, window.history.state);

  if (from.path === '/home/embedded' && to.path !== '/home/embedded') {
    bus.emit('moneyIn')
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
