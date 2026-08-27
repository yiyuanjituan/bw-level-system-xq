import { createRouter, createWebHashHistory, type RouteLocationNormalized } from 'vue-router';
import routes from './routes';
import { useCachedViewStoreHook } from '@/store/modules/cachedView';
import NProgress from '@/utils/progress';
import { autoCalculateTransitionName } from '@/hooks/useTransition';
import { bus } from '@/utils/mitt';
import { saveInviteCode } from '@/utils/inviteCode';

const router = createRouter({
  history: createWebHashHistory(),
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
  // 推广链接中的邀请码需要跨页面保留，确保用户稍后注册时仍能自动带入
  saveInviteCode(to.query.dl);

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
