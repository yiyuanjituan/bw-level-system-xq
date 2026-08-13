import { userTelegramWebAppComplete } from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import router from '@/router';
import useAuthStore from '@/store/modules/user';
import { bus } from '@/utils/mitt';

type TelegramWebAppEvent = 'recharge' | 'withdraw';

const eventHandlers: Record<
  TelegramWebAppEvent,
  (auth: ReturnType<typeof useAuthStore>) => void
> = {
  recharge: () => bus.emit('showRecharge'),
  withdraw: auth => {
    if (auth.user.hasPayPassword) {
      router.push('/home/withdraw');
      return;
    }

    showCustomToast({
      type: 'warning',
      message: '为了资金安全，需先设置提现密码哦！'
    });
    router.push({
      path: '/home/security',
      query: { active: '5', redirect: '/home/withdraw' }
    });
  }
};

function removeStartParam(currentUrl: URL) {
  currentUrl.searchParams.delete('tgWebAppStartParam');
  window.history.replaceState(
    window.history.state,
    '',
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
  );
}

export function useTelegramWebAppStart() {
  const auth = useAuthStore();

  async function handleTelegramWebAppStart() {
    const currentUrl = new URL(window.location.href);
    const startParam = currentUrl.searchParams.get('tgWebAppStartParam');
    if (!startParam) return;

    const telegramWebApp = (window as any).Telegram?.WebApp;
    const initData = String(telegramWebApp?.initData || '');
    telegramWebApp?.ready?.();
    if (!initData) {
      showCustomToast({
        type: 'fail',
        message: '无法读取 Telegram 身份信息，请从机器人按钮重新进入'
      });
      return;
    }

    try {
      const result = await userTelegramWebAppComplete({
        startParam,
        initData,
        deviceInfo: { loginType: 'H5', deviceType: 'Telegram Web App' }
      });
      auth.setToken(result?.token);
      await auth.updateInfo();
      removeStartParam(currentUrl);

      const eventName = String(result?.event || '') as TelegramWebAppEvent;
      eventHandlers[eventName]?.(auth);
    } catch {
      showCustomToast({
        type: 'fail',
        message: 'Telegram 自动登录失败，请从机器人按钮重新进入'
      });
    }
  }

  return { handleTelegramWebAppStart };
}
