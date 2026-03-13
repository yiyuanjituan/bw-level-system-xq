<script setup lang="ts">
import router from "@/router";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { setSystemName, setTabBarName } from "@/hooks/useTransition";
import routes from "@/router/routes";
import { flattenRoutes } from "@/utils/common";

const active = ref(0);
const route = useRoute();

const tabBar = ref<any[]>([
  {
    name: "首页",
    path: "/index",
    light_prefix: "icon_btm_sy",
    active_icon: "icon_btm_sy1",
    default_icon: "icon_btm_sy0",
    isTabBar: true
  },
  {
    name: "优惠",
    path: "/home/event",
    light_prefix: "icon_btm_yh",
    active_icon: "icon_btm_yh1",
    default_icon: "icon_btm_yh0",
    isTabBar: true
  },
  {
    name: "存款",
    path: "/about",
    light_prefix: "icon_btm_cz",
    active_icon: "icon_btm_cz1",
    default_icon: "icon_btm_cz0",
    isTabBar: true
  },
  {
    name: "客服",
    path: "/home/login",
    light_prefix: "icon_btm_kf",
    active_icon: "icon_btm_kf1",
    default_icon: "icon_btm_kf0",
    isTabBar: false
  },
  {
    name: "我的",
    path: "/home/mine",
    light_prefix: "icon_btm_wd",
    active_icon: "icon_btm_wd1",
    default_icon: "icon_btm_wd0",
    isTabBar: true
  }
]);

watch(() => route.path, path => {
    const newRoute = flattenRoutes(routes);
    const info = newRoute.find(v => v.path === path);
    active.value = info.meta?.order;
  },
  { immediate: true }
);

function handleClick(item: any) {
  const nextIndex = tabBar.value.findIndex(v => v.path === item.path);
  const nowIndex = tabBar.value.findIndex(v => v.path === route.path);
  let animation = "page-slide-backward";
  if (nextIndex > nowIndex) animation = "page-slide-forward";
  // 路由排序
  const newRoute = flattenRoutes(routes);
  const newNext = newRoute.find(v => v.path === item.path);
  const newNow = newRoute.find(v => v.path === route.path);
  if (newNext?.meta?.isTabBar && newNow?.meta?.isTabBar) {
    animation = "page-slide-backward";
    if (newNext.meta?.order > newNow.meta?.order)
      animation = "page-slide-forward";
  }
  // 路由排序
  setTabBarName(animation);
  if (item.isTabBar) {
    router.replace({ path: item.path });
  } else {
    router.push({ path: item.path });
  }
}
</script>

<template>
  <div class="tab-list">
    <div
      v-for="(item, index) in tabBar"
      :key="index"
      class="ui-tab-bar-item"
      @click="handleClick(item)"
    >
      <div class="item">
        <div class="inline-block relative">
          <i v-show="active !== index">
            <i
              class="text-[24px] text-[#68707B] inline-flex h-[25px] w-auto items-center justify-center absolute"
            >
              <svg
                width="1em"
                height="1em"
                fill="currentColor"
                class=""
                style="width: inherit; height: inherit"
              >
                <use :xlink:href="`#${item.light_prefix}`" />
              </svg>
            </i>
            <i
              class="text-[24px] text-[#F0C059] inline-flex h-[25px] w-auto items-center justify-center"
            >
              <svg
                width="1em"
                height="1em"
                fill="currentColor"
                class=""
                style="width: inherit; height: inherit"
              >
                <use :xlink:href="`#${item.default_icon}`" />
              </svg>
            </i>
          </i>
          <i
            v-show="active === index"
            class="text-[24px] text-[#F0C059] inline-flex h-[25px] w-auto items-center justify-center"
          >
            <svg
              width="1em"
              height="1em"
              fill="currentColor"
              class=""
              style="width: inherit; height: inherit"
            >
              <use :xlink:href="`#${item.active_icon}`" />
            </svg>
          </i>
        </div>
        <span class="text" :class="{ '!text-[#F0C059]': active === index }">{{
          item.name
        }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tab-list {
  height: 62px;
  background: #1c1e23;
  z-index: 1;
  display: flex;
  box-sizing: content-box;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
  color: white;

  .ui-tab-bar-item {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: inherit;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;

    .item {
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
      padding: 0 2.5px;

      .text {
        color: #68707b;
        font-size: 12px;
        word-break: break-word;
        display: -webkit-box;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        height: 27px;
        line-height: 1.2;
        overflow: hidden;
        z-index: 2;
      }
    }
  }
}
</style>
