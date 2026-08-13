<template>
  <SvgIcons />
  <router-view v-slot="{ Component, route }">
    <transition :name="systemTransitionName">
      <component :is="Component" :key="route.matched[0]?.path || route.path" class="page-content" />
    </transition>
  </router-view>
  <ui-toast />
  <ui-dialog />
  <van-watermark content="YG游戏" opacity="0.04" v-if="app.appInfo?.isDemo" />
  <FindUs :ref="setRefs('findUs')" />
  <recharge-drawer :ref="setRefs('rechargeDrawer')" />
  <recharge-detail-drawer :ref="setRefs('rechargeDetailDrawer')" />
  <recharge-record :ref="setRefs('rechargeRecordRef')" />
  <download-tip :ref="setRefs('downloadTip')" />
  <WithdrawSuccessNotify :ref="setRefs('withdrawSuccessRef')" />
  <dialog-tip :ref="setRefs('dialogTipRef')" />
  <football-dialog v-if="false" />
  <redpack-dialog />
</template>

<script setup lang="ts">
import { systemTransitionName } from './hooks/useTransition';
import UiToast from '@/components/UI/toast.vue';
import UiDialog from '@/components/UI/dialog.vue';
import RedpackDialog from '@/components/Dialog/RedpackDialog.vue';
import { onMounted, onUnmounted } from 'vue';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';
import { bus, userMoneyIn } from '@/utils/mitt';
import router from '@/router';
import useDataStore from '@/store/modules/data';
import { useRefs } from '@/hooks/useRefs';
import { useRoute } from 'vue-router';
import { connectSse, disconnectSse } from '@/utils/sse';
import { startVersionUpdateCheck } from '@/utils/versionUpdate';
import { useTelegramWebAppStart } from '@/hooks/useTelegramWebAppStart';

const { refs, setRefs } = useRefs();
const app = useAppStore();
const auth = useAuthStore();
const appData = useDataStore();
const route = useRoute();
const { handleTelegramWebAppStart } = useTelegramWebAppStart();
const popupRefMap = {
  find_us: 'findUs',
  popup_notice: 'dialogTipRef',
  download_tip: 'downloadTip'
} as const;

type HomePopupKey = keyof typeof popupRefMap;

const popupQueue: HomePopupKey[] = [];
let popupTimer: ReturnType<typeof setTimeout> | undefined;
let stopVersionUpdateCheck: (() => void) | undefined;

const busListen = () => {
  bus.on('moneyIn', () => {
    if (auth.token) userMoneyIn(appData.enterGameInfo.venueId).then(() => auth.updateInfo());
    appData.setEnterInfo(void 0, void 0);
  });

  bus.on('logout', () => {
    auth.logout();
    refs['rechargeDrawer']?.close();
    router.replace({ path: '/home/login' });
  });

  bus.on('findUs', refs['findUs']?.open);
  bus.on('showRecharge', refs['rechargeDrawer']?.open);
  bus.on('showRechargeDetail', refs['rechargeDetailDrawer']?.open);
  bus.on('showRechargeRecord', refs['rechargeRecordRef']?.open)
  bus.on('showWithdrawSuccess', (res) => refs['withdrawSuccessRef']?.open?.(res))
};

function isHomePopupKey(value: unknown): value is HomePopupKey {
  return typeof value === 'string' && value in popupRefMap;
}

function stopPopupQueueListener() {
  bus.off('closed-popup', handleClosedPopup);
}

function openPopupByKey(popupKey: HomePopupKey) {
  if (popupKey === 'download_tip' && route.name !== 'Index') {
    return false;
  }

  const popupRef = refs[popupRefMap[popupKey]];

  if (!popupRef?.open) {
    return false;
  }

  if (popupKey === 'popup_notice') {
    return popupRef.open({});
  }

  return popupRef.open();
}

function openNextPopup() {
  while (popupQueue.length) {
    const popupKey = popupQueue.shift();

    if (!popupKey) {
      break;
    }

    const result = openPopupByKey(popupKey);

    if (result === false) {
      continue;
    }

    return;
  }

  stopPopupQueueListener();
}

function handleClosedPopup() {
  openNextPopup();
}

function checkPopupTip() {
  if (popupTimer) {
    clearTimeout(popupTimer);
  }

  popupTimer = setTimeout(() => {
    const popupList = Array.isArray(app.appInfo.home_popup)
      ? app.appInfo.home_popup.filter(isHomePopupKey)
      : [];

    if (!popupList.length) {
      stopPopupQueueListener();
      return;
    }

    popupQueue.splice(0, popupQueue.length, ...popupList);
    stopPopupQueueListener();
    bus.on('closed-popup', handleClosedPopup);
    openNextPopup();
  }, 1500);
}

onMounted(async () => {
  stopVersionUpdateCheck = startVersionUpdateCheck();
  busListen();
  await handleTelegramWebAppStart();
  app.refreshData();
  app.updateDownloadBtn(true);

  if (auth.token) {
    connectSse(auth.token);
    auth.updateInfo();
  }

  checkPopupTip();
});

onUnmounted(() => {
  stopVersionUpdateCheck?.();
  disconnectSse();
  stopPopupQueueListener();

  if (popupTimer) {
    clearTimeout(popupTimer);
  }
});
</script>
<style lang="less">
.none-enter-active,
.none-leave-active {
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.none-enter-from {
  transform: translateX(0%);
}

.none-enter-to {
  transform: translateX(0);
}

.none-leave-from {
  transform: translateX(0);
}

.none-leave-to {
  transform: translateX(0%);
}
</style>
