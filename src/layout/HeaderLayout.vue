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
              <ui-badge :content="0" :size="[-1, -10]">
                {{ item.name }}
              </ui-badge>
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
import UiBadge from "@/components/UI/badge.vue";
import { handleBack } from "@/utils/common";

const route = useRoute();
const list = ref([
  { name: "活动", path: "/home/event" },
  { name: "任务", path: "/home/task" },
  { name: "VIP", path: "/home/vip" },
  { name: "返水", path: "/home/task" },
  { name: "待领取", path: "/home/task" },
  { name: "利息宝", path: "/home/yuebao" },
  { name: "领取记录", path: "/home/records" }
]);
const active = ref(0);
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
onMounted(() => {
  const path = route.path;
  active.value = list.value.findIndex(item => item.path === path);
});
</script>

<style lang="less" scoped>
.header-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(28, 30, 35);
  color: white;

  .base-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 45px;
    background-color: #1c1e23;
    border-bottom: 1px solid #313843;
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
      --van-tab-text-color: white;
      --van-padding-xs: 0px;
      --van-padding-sm: 15px;
      --van-tabs-bottom-bar-color: #f0c059;
      --van-tab-active-text-color: #f0c059;
      --van-tabs-bottom-bar-height: 2px;
      --van-tab-font-size: 12px;
      --van-tabs-bottom-bar-width: 24px;
      --van-tabs-nav-background: transparent;

      :deep(.van-tabs) {
        height: 100%;
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
