<template>
  <div class="header-layout">
    <div class="base-header">
      <div class="left-icon" @click="handleBack()">
        <i class="ui-arrow inline-flex justify-center items-center">
          <svg width="1em" height="1em" fill="currentColor" class="">
            <use xlink:href="#ui-arrow-418a3a"></use>
          </svg>
        </i>
      </div>
      <div class="right-box">
        <van-tabs v-model:active="active" @change="handleHeaderChange">
          <van-tab
            v-for="item in list"
            :title="item.name"
            :key="item.name"
          >
            <template #title>
              <x-badge
                class="header-reward-badge"
                :content="item.source ? canReceiveCounts[item.source] : 0"
              >
                {{ item.name }}
              </x-badge>
            </template>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div class="content-area">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName">
          <component :is="Component" class="page-content" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setTabBarName } from "@/hooks/useTransition";
import router from "@/router";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import XBadge from "@/components/X/x-badge.vue";
import { handleBack } from "@/utils/common";
import { getCanReceiveList, type CanReceiveSource } from "@/api/common";

interface HeaderTab {
  name: string;
  path: string;
  source?: CanReceiveSource;
}

const route = useRoute();
const list = ref<HeaderTab[]>([
  { name: "活动", path: "/home/event", source: 2 },
  { name: "任务", path: "/home/task", source: 3 },
  { name: "VIP", path: "/home/vip", source: 4 },
  { name: "返水", path: "/home/cashback", source: 5 },
  { name: "待领取", path: "/home/canReceive" },
  { name: "利息宝", path: "/home/yuebao", source: 6 },
  { name: "领取记录", path: "/home/records" }
]);
const active = ref(0);
const canReceiveCounts = ref<Record<CanReceiveSource, number>>({
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0
});
const transitionName = ref("page-slide-forward");

function handleHeaderChange(index: number) {
  setTabBarName("none");
  const path = list.value[index].path;
  const nowIndex = list.value.findIndex(v => v.path === route.path);
  transitionName.value = nowIndex >= index ? "page-slide-backward" : "page-slide-forward";
  router.replace(path);
}

watch(
  () => route.path,
  path => {
    active.value = list.value.findIndex(item => item.path === path);
  }
);
onMounted(async () => {
  const path = route.path;
  active.value = list.value.findIndex(item => item.path === path);

  try {
    const response = await getCanReceiveList();
    const sourceCounts: Record<CanReceiveSource, number> = {
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    };
    response?.list?.forEach(reward => {
      sourceCounts[reward.source] += 1;
    });
    canReceiveCounts.value = sourceCounts;
  } catch {
    canReceiveCounts.value = {
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    };
  }
});
</script>

<style lang="less" scoped>
.header-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);
  color: var(--skin__lead);

  .base-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--status-bar-height);
    height: calc(45px + var(--status-bar-height));
    background-color: var(--skin__bg_2);
    border-bottom: 1px solid var(--skin__border);
    width: 100%;
    box-sizing: border-box;

    .left-icon {
      width: 40px;
      height: 100%;
      padding-left: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #adb6c3;
      font-size: 12px;
      box-sizing: border-box;
    }
    .right-box {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: white;
      font-size: 15px;
      flex: 1;

      --van-tabs-line-height: 100%;
      --van-tab-text-color: var(--skin__lead);
      --van-padding-xs: 0px;
      --van-padding-sm: 15px;
      --van-tabs-bottom-bar-color: var(--skin__primary);
      --van-tab-active-text-color: var(--skin__primary);
      --van-tabs-bottom-bar-height: 2px;
      --van-tab-font-size: 12px;
      --van-tabs-bottom-bar-width: 24px;
      --van-tabs-nav-background: transparent;

      :deep(.van-tabs) {
        height: 100%;
      }

      :deep(.header-reward-badge .x-badge--top-right) {
        --badge-translate-x: calc(100% + 2px);
      }
    }
  }

  .content-area {
    position: relative;
    width: 100%;
    flex: 1;

    .page-content {
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
