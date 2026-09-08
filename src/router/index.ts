import { createRouter, createWebHashHistory, createWebHistory, type RouteLocationNormalized } from 'vue-router';
import routes from './routes';
import { useCachedViewStoreHook } from '@/store/modules/cachedView';
import NProgress from '@/utils/progress';
import { autoCalculateTransitionName } from '@/hooks/useTransition';
import { bus } from '@/utils/mitt';
import { getStoredInviteCode, normalizeInviteCode, saveInviteCode } from '@/utils/inviteCode';

const router = createRouter({
  history: import.meta.env.BASE_URL === './' ? createWebHashHistory() : createWebHistory(),
  routes
});

export interface toRouteType extends RouteLocationNormalized {
  meta: {
    isTabBar: any;
    order?: number;
    tabBarOrder?: number;
    title?: string;
    noCache?: boolean;
  };
}

router.beforeEach((to: toRouteType, from, next) => {
  NProgress.start();
  const routeInviteCode = normalizeInviteCode(to.query.dl);
  // 推广链接中的邀请码需要跨页面保留，确保用户稍后注册时仍能自动带入。
  saveInviteCode(routeInviteCode);
  const inviteCode = routeInviteCode || getStoredInviteCode();

  // 内部路由跳转未携带参数时自动补回邀请码，避免切换页面后注册链路丢失。
  if (inviteCode && !routeInviteCode) {
    next({
      path: to.path,
      query: { ...to.query, dl: inviteCode },
      hash: to.hash,
      replace: true
    });
    return;
  }

  // 路由缓存
  useCachedViewStoreHook().addCachedView(to);

  autoCalculateTransitionName(from, to, window.history.state);

  if (from.path === '/home/embedded' && to.path !== '/home/embedded') {
    bus.emit('moneyIn');
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
