<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { handleBack } from "@/utils/common";

const route = useRoute();
const router = useRouter();

const withdrawTabs = ["20", "10", "3"] as const;
const defaultWithdrawActive = withdrawTabs[0];
type WithdrawActive = (typeof withdrawTabs)[number];

const active = ref<WithdrawActive>(defaultWithdrawActive);

function normalizeActive(value: unknown): WithdrawActive {
  const activeValue = String(Array.isArray(value) ? value[0] : value ?? defaultWithdrawActive);

  return withdrawTabs.includes(activeValue as WithdrawActive) ? (activeValue as WithdrawActive) : defaultWithdrawActive;
}

function getCurrentActive() {
  const value = Array.isArray(route.query.active) ? route.query.active[0] : route.query.active;

  return String(value ?? "");
}

function syncRouteQuery(value: WithdrawActive) {
  if (getCurrentActive() === value) {
    return;
  }

  router.replace({
    query: {
      ...route.query,
      active: value
    }
  });
}

watch(
  () => route.query.active,
  value => {
    const normalizedActive = normalizeActive(value);

    active.value = normalizedActive;
    syncRouteQuery(normalizedActive);
  },
  { immediate: true }
);

function jumpToService() {
  router.push('/home/notice?noticeType=4')
}

watch(active, value => {
  syncRouteQuery(value);
});
</script>

<template>
  <div class="security-container">
    <div class="sub-header">
      <div class="arrow-left" @click="handleBack">
        <svg-icon name="arrow-back"></svg-icon>
      </div>
      <div class="title" />
      <div class="actions">
        <svg-icon name="icon_sys_menu_service" @click="jumpToService"></svg-icon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-box">
      <van-tabs v-model:active="active" shrink swipeable>
        <van-tab :title="$t('申请提现')" name="20"><apply-withdraw /></van-tab>
        <van-tab :title="$t('收款账户')" name="10"><receipt-account /></van-tab>
        <van-tab :title="$t('提现记录')" name="3"><withdraw-record /></van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.security-container {
  --skin__primary: #dfbe5b;
  --van-tab-active-text-color: var(--skin__primary);
  --van-tab-text-color: white;

  height: 100%;
  background: #000;

  .sub-header {
    --skin__lead: white;
    --skin__neutral_1: #bcbcbc;

    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--status-bar-height);
    height: calc(45px + var(--status-bar-height));
    background-color: #191919;
    border-bottom: 1px solid #242424;
    width: 100%;
    .arrow-left {
      position: absolute;
      min-width: 40px;
      flex-shrink: 0;
      z-index: 9;

      display: flex;
      align-items: center;
      height: 100%;
      color: var(--skin__neutral_1);
      font-size: 12px;
      padding-left: 10px;
    }
    .actions {
      display: flex;
      align-items: center;
      height: 45px;
      padding: 0 10px;
      color: #dfbe5b;
      font-size: 25px;
      position: absolute;
      right: 0;
      z-index: 20;
    }
  }

  .content-box {
    --van-tabs-line-height: 45px;
    --van-tabs-nav-background: transparent;
    --van-padding-xs: 15px;

    position: absolute;
    top: var(--status-bar-height);
    left: 0;
    right: 0;
    bottom: 0;

    :deep(.van-tabs) {
      height: 100%;
    }

    :deep(.van-tabs__content) {
      height: calc(100% - 45px);
      .van-tab__panel {
        height: 100%;
      }
    }

    :deep(.van-tabs__nav) {
      --van-tab-font-size: 12px;
      padding-left: 30px;
    }
  }
}
</style>
