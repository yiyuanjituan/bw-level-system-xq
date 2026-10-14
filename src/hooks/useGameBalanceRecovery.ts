import { watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import useAuthStore from '@/store/modules/user';
import { recoverGameBalances } from '@/utils/gameBalanceRecovery';

export function useGameBalanceRecovery(isReady: Ref<boolean>) {
  const auth = useAuthStore();
  const route = useRoute();
  let startupRecoveryToken = '';

  async function recoverGameBalance(venueId?: number) {
    const token = auth.token;
    if (!token) return;

    try {
      await recoverGameBalances(token, venueId);
    } catch {
      // 回归失败仍刷新大厅余额，下一次打开网站时重新尝试。
    } finally {
      if (auth.token === token) await auth.updateInfo().catch(() => undefined);
    }
  }

  watch(
    () => [isReady.value, route.path, auth.token],
    () => {
      if (!auth.token) {
        startupRecoveryToken = '';
        return;
      }
      if (!isReady.value || !['/index', '/home/mine'].includes(route.path)
        || startupRecoveryToken === auth.token) return;

      // 每次打开网站、登录后只自动回归一次，首页和个人中心切换不重复请求。
      startupRecoveryToken = auth.token;
      void recoverGameBalance();
    },
    { immediate: true, flush: 'post' }
  );

  return { recoverGameBalance };
}
