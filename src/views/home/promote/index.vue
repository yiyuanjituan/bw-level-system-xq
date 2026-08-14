<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPromoteInfo } from "@/api/common";
import SubNavbar from "@/components/SubNavbar.vue";
import PromoteCreateSubordinate from "./pages/PromoteCreateSubordinate.vue";
import PromoteCommission from "./pages/PromoteCommission.vue";
import PromoteData from "./pages/PromoteData.vue";
import PromoteHome from "./pages/PromoteHome.vue";
import PromotePerformance from "./pages/PromotePerformance.vue";
import PromoteRebateRatio from "./pages/PromoteRebateRatio.vue";
import PromoteShare from "./pages/PromoteShare.vue";
import PromoteSubordinate from "./pages/PromoteSubordinate.vue";
import PromoteSubordinateBetting from "./pages/PromoteSubordinateBetting.vue";
import PromoteSubordinateFinance from "./pages/PromoteSubordinateFinance.vue";
import PromoteSubordinateReceive from "./pages/PromoteSubordinateReceive.vue";
import type { PromoteInfo } from "./types";

const route = useRoute();
const router = useRouter();

const promoteTabs = [
  { label: "首页", value: "index" },
  { label: "推广分享", value: "share" },
  { label: "下级信息", value: "subordinate" },
  { label: "我的数据", value: "data" },
  { label: "我的业绩", value: "performance" },
  { label: "我的佣金", value: "commission" },
  { label: "下级投注", value: "subordinateBetting" },
  { label: "下级财务", value: "subordinateFinance" },
  { label: "下级领取", value: "subordinateReceive" },
  { label: "创建下级", value: "createSubordinate" },
  { label: "返佣比例", value: "rebateRatio" },
] as const;

type PromoteTabValue = (typeof promoteTabs)[number]["value"];

const defaultActive: PromoteTabValue = "index";
const activeTab = ref<PromoteTabValue>(defaultActive);
const promoteInfo = ref<PromoteInfo | null>(null);
const promoteInfoLoaded = ref(false);
const isLoggedIn = computed(() => Boolean(promoteInfo.value?.user?.account));
const visiblePromoteTabs = computed(() =>
  promoteTabs.filter(tab => tab.value !== "createSubordinate" || isLoggedIn.value)
);

function normalizeActive(active: unknown): PromoteTabValue {
  const activeValue = String(Array.isArray(active) ? active[0] : active ?? defaultActive);
  return promoteTabs.some(tab => tab.value === activeValue)
    ? (activeValue as PromoteTabValue)
    : defaultActive;
}

function syncRouteActive(active: PromoteTabValue) {
  if (route.query.active === active) return;

  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      active
    }
  });
}

watch(
  () => route.query.active,
  active => {
    const normalizedActive = normalizeActive(active);
    activeTab.value = normalizedActive;

    // 缺失或非法参数统一回落到首页，保证地址可以直接复制和恢复。
    if (active !== normalizedActive) {
      syncRouteActive(normalizedActive);
    }
  },
  { immediate: true }
);

watch(activeTab, active => {
  syncRouteActive(active);
});

watch([promoteInfoLoaded, isLoggedIn], ([loaded, loggedIn]) => {
  if (!loaded || loggedIn || activeTab.value !== "createSubordinate")
    return;

  activeTab.value = defaultActive;
});

onMounted(() => {
  void getPromoteInfo()
    .then(info => {
      promoteInfo.value = info as PromoteInfo;
    })
    .catch(() => {
      promoteInfo.value = null;
    })
    .finally(() => {
      promoteInfoLoaded.value = true;
    });

});
</script>

<template>
  <main class="promote-page">
    <sub-navbar title="分享赚钱" />

    <van-tabs
      v-model:active="activeTab"
      class="promote-tabs"
      shrink
      animated
    >
      <van-tab
        v-for="tab in visiblePromoteTabs"
        :key="tab.value"
        :name="tab.value"
        :title="tab.label"
      >
        <section class="promote-panel">
          <promote-home
            v-if="tab.value === 'index'"
            :info="promoteInfo"
            @select-tab="activeTab = $event"
          />
          <promote-share
            v-else-if="tab.value === 'share'"
            :info="promoteInfo"
          />
          <promote-subordinate v-else-if="tab.value === 'subordinate'" />
          <promote-data v-else-if="tab.value === 'data'" />
          <promote-performance v-else-if="tab.value === 'performance'" />
          <promote-commission
            v-else-if="tab.value === 'commission'"
            :info="promoteInfo"
          />
          <promote-subordinate-betting v-else-if="tab.value === 'subordinateBetting'" />
          <promote-subordinate-finance v-else-if="tab.value === 'subordinateFinance'" />
          <promote-subordinate-receive v-else-if="tab.value === 'subordinateReceive'" />
          <promote-create-subordinate
            v-else-if="tab.value === 'createSubordinate'"
            :invite-code="promoteInfo?.user?.inviteCode || ''"
          />
          <promote-rebate-ratio
            v-else-if="tab.value === 'rebateRatio'"
            :info="promoteInfo"
          />
        </section>
      </van-tab>
    </van-tabs>
  </main>
</template>

<style scoped lang="less">
.promote-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.promote-tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  --van-tabs-line-height: 35px;
  --van-tabs-nav-background: #191919;
  --van-tab-text-color: var(--skin__lead);
  --van-tab-active-text-color: var(--skin__primary);
  --van-tabs-bottom-bar-color: var(--skin__primary);
  --van-tabs-bottom-bar-width: 20px;
  --van-tabs-bottom-bar-height: 2px;
  --van-tab-font-size: 11px;
  --van-font-bold: 400;
  --van-padding-base: 10px;

  :deep(.van-tab__text) {
    line-height: 100%;
  }

  :deep(.van-tabs__wrap) {
    flex-shrink: 0;
    border-bottom: 1px solid #242424;
  }

  :deep(.van-tabs__nav) {
    padding-left: 0;
    padding-right: 0;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 10px;
  }

  :deep(.van-tabs__content) {
    flex: 1;
    min-height: 0;
  }

  :deep(.van-tabs__track),
  :deep(.van-tab__panel) {
    height: 100%;
  }
}

.promote-panel {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
  overflow-y: auto;
  color: var(--skin__neutral_2);
  font-size: 12px;
  background: var(--skin__bg_1);
  -webkit-overflow-scrolling: touch;
}

</style>
