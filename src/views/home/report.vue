<script setup lang="ts">
import { $t } from "@/locales";
import { computed, ref, watch, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showCustomToast } from "@/hooks/useCommon";
import AccountTab from "@/components/HomeReport/AccountTab.vue";
import BetTab from "@/components/HomeReport/BetTab.vue";
import PersonalTab from "@/components/HomeReport/PersonalTab.vue";
import RetrieveTab from "@/components/HomeReport/RetrieveTab.vue";
import type { ReportCurrent } from "@/components/HomeReport/types";
import useAuthStore from "@/store/modules/user";
import { handleBack } from "@/utils/common";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const reportTabs = [
  { label: "账户明细", value: "3" },
  { label: "投注记录", value: "2" },
  { label: "个人报表", value: "1" },
  { label: "找回余额", value: "4" }
] as const;

const defaultReportCurrent: ReportCurrent = "3";
const activeCurrent = ref<ReportCurrent>(defaultReportCurrent);

const walletIsLoading = ref(false);

const reportComponentMap: Record<ReportCurrent, Component> = {
  "1": PersonalTab,
  "2": BetTab,
  "3": AccountTab,
  "4": RetrieveTab
};

function normalizeReportCurrent(reportCurrent: unknown): ReportCurrent {
  const value = String(Array.isArray(reportCurrent) ? reportCurrent[0] : reportCurrent ?? defaultReportCurrent);

  return reportTabs.some(item => item.value === value) ? (value as ReportCurrent) : defaultReportCurrent;
}

function getCurrentReportCurrent() {
  return normalizeReportCurrent(route.query.reportCurrent);
}

const currentBalance = computed(() => Number(auth.user.money) || 0);
const currentComponent = computed(() => reportComponentMap[activeCurrent.value]);

function syncRouteQuery(reportCurrent: ReportCurrent) {
  if (getCurrentReportCurrent() === reportCurrent) {
    return;
  }

  router.replace({
    query: {
      ...route.query,
      reportCurrent
    }
  });
}

function handleCurrentChange(value: ReportCurrent) {
  activeCurrent.value = value;
}

function refreshBalance() {
  walletIsLoading.value = true;

  auth.updateInfo()
    .then(() => {
      showCustomToast({ type: "success", message: $t("余额刷新成功") });
    })
    .finally(() => {
      walletIsLoading.value = false;
    });
}

watch(
  () => route.query.reportCurrent,
  reportCurrent => {
    activeCurrent.value = normalizeReportCurrent(reportCurrent);
  },
  { immediate: true }
);

watch(activeCurrent, value => {
  syncRouteQuery(value);
});
</script>

<template>
  <div class="report-page">
    <header class="page-header">
      <div class="page-header__back" @click="handleBack">
        <svg-icon name="arrow-back" class-name="text-[12px]" />
      </div>
      <div class="page-header__tabs">
        <van-tabs shrink v-model:active="activeCurrent">
          <van-tab
            v-for="item in reportTabs"
            :key="item.value"
            :name="item.value"
            :title="item.label"
          />
        </van-tabs>
      </div>
    </header>

    <div class="page-content">
      <component
        :is="currentComponent"
        :current-balance="currentBalance"
        :wallet-is-loading="walletIsLoading"
        @refresh-balance="refreshBalance"
        @switch-report="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.report-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);

  .page-header {
    position: relative;
    display: flex;
    align-items: center;
    padding-top: var(--status-bar-height);
    height: calc(45px + var(--status-bar-height));
    background: var(--skin__bg_2);
    border-bottom: 1px solid var(--skin__border);

    .page-header__back {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--skin__neutral_1);
      flex-shrink: 0;
      padding-left: 10px;
      padding-right: 20px;
    }

    .page-header__tabs {
      flex: 1;
      min-width: 0;
      padding-right: 5px;

      --van-tabs-line-height: 100%;
      --van-tab-text-color: var(--skin__lead);
      --van-tab-active-text-color: var(--skin__primary);
      --van-tabs-bottom-bar-color: var(--skin__primary);
      --van-tabs-bottom-bar-height: 1px;
      --van-tabs-bottom-bar-width: 48px;
      --van-tab-font-size: 12px;
      --van-tabs-nav-background: transparent;
      --van-padding-sm: 0px;
      --van-font-bold: normal;
      --van-padding-xs: 0px;

      :deep(.van-tabs__wrap) {
        height: 45px;
      }

      :deep(.van-tab) {
        padding: 0;
        flex: none;
        margin-right: 30px;
      }

      :deep(.van-tabs__line) {
        //bottom: 9px;
      }

      :deep(.van-tab__text) {
        line-height: 1;
      }
    }
  }

  .page-content {
    flex: 1;
    min-height: 0;
  }
}
</style>
