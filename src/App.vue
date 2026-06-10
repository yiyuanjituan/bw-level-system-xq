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
  <download-tip />
</template>

<script setup lang="ts">
import { systemTransitionName } from "./hooks/useTransition";
import UiToast from "@/components/UI/toast.vue";
import UiDialog from "@/components/UI/dialog.vue";
import { onMounted } from "vue";
import useAppStore from "@/store/modules/app";
import useAuthStore from "@/store/modules/user";
import { bus, userMoneyIn } from "@/utils/mitt";
import router from "@/router";
import useDataStore from "@/store/modules/data";
import { useRefs } from "@/hooks/useRefs";

const { refs, setRefs } = useRefs();
const app = useAppStore();
const auth = useAuthStore();
const appData = useDataStore();

const busListen = () => {
  // 资金回归
  bus.on("moneyIn", () => {
    if (auth.token) userMoneyIn(appData.enterGameInfo.venueId).then(() => auth.updateInfo());
    appData.setEnterInfo(void 0, void 0);
  });
  // 退出登录
  bus.on("logout", () => {
    auth.logout();
    refs["rechargeDrawer"]?.close();
    router.replace({ path: "/home/login" });
  });
  // 点开找到我们
  bus.on("findUs", refs["findUs"]?.open);
  // 点击充值按钮
  bus.on("showRecharge", refs["rechargeDrawer"]?.open);
  bus.on("showRechargeDetail", refs["rechargeDetailDrawer"]?.open);
};

onMounted(() => {
  busListen();
  app.refreshData();
  app.updateDownloadBtn(true);
  if (auth.token) {
    auth.updateInfo();
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
