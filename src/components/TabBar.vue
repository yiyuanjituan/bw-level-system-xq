<script setup lang="ts">
import { $t } from "@/locales";
import router from "@/router";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { setTabBarName } from "@/hooks/useTransition";
import routes from "@/router/routes";
import { flattenRoutes } from "@/utils/common";
import { bus } from "@/utils/mitt";

const active = ref(0);
const route = useRoute();

interface TabBarItem {
  name: string;
  path: string;
  light_prefix: string;
  active_icon: string;
  default_icon: string;
  isTabBar: boolean;
}

function getTabBarOrder(meta?: { order?: number; tabBarOrder?: number }) {
  return meta?.tabBarOrder ?? meta?.order ?? 0;
}

const tabBar = computed<TabBarItem[]>(() => [
  {
    name: $t("首页"),
    path: "/index",
    light_prefix: "icon_btm_sy",
    active_icon: "icon_btm_sy1",
    default_icon: "icon_btm_sy0",
    isTabBar: true
  },
  {
    name: $t("优惠"),
    path: "/home/event",
    light_prefix: "icon_btm_yh",
    active_icon: "icon_btm_yh1",
    default_icon: "icon_btm_yh0",
    isTabBar: true
  },
  {
    name: $t("存款"),
    path: "/recharge",
    light_prefix: "icon_btm_cz",
    active_icon: "icon_btm_cz0",
    default_icon: "icon_btm_cz0",
    isTabBar: true
  },
  {
    name: $t("客服"),
    path: "/home/notice",
    light_prefix: "icon_btm_kf",
    active_icon: "icon_btm_kf1",
    default_icon: "icon_btm_kf0",
    isTabBar: false
  },
  {
    name: $t("我的"),
    path: "/home/mine",
    light_prefix: "icon_btm_wd",
    active_icon: "icon_btm_wd1",
    default_icon: "icon_btm_wd0",
    isTabBar: true
  }
]);

watch(
  () => route.path,
  path => {
    const matchedTabIndex = tabBar.value.findIndex(v => v.path === path);
    if (matchedTabIndex >= 0) {
      active.value = matchedTabIndex;
      return;
    }

    const newRoute = flattenRoutes(routes);
    const info = newRoute.find(v => v.path === path);
    active.value = getTabBarOrder(info?.meta);
  },
  { immediate: true }
);

function getActiveIcon(item: TabBarItem) {
  return item.active_icon || item.default_icon;
}

function handleClick(item?: TabBarItem) {
  if (!item) return;

  if (item.path === "/recharge") {
    return bus.emit("showRecharge");
  }
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
    if (getTabBarOrder(newNext.meta) > getTabBarOrder(newNow.meta)) animation = "page-slide-forward";
  }
  // 路由排序
  setTabBarName(animation);
  if (item.isTabBar) {
    router.replace({ path: item.path });
  } else {
    router.push({ path: item.path });
  }
}

function handleClickByPath(path: string) {
  const record = tabBar.value.find(v => v.path === path);
  handleClick(record);
}

function handleJump(path: string) {
  const record = tabBar.value.find(v => v.path == path);
  if (record) handleClick(record);
}

onMounted(() => {
  bus.on("switchTab", handleJump);
});
onUnmounted(() => {
  bus.off("switchTab");
});
</script>

<template>
  <footer class="tab-bar-footer">
    <div class="tab-bar-shell">
      <nav class="app-tabbar" aria-label="主导航">
        <div
          v-for="(item, index) in tabBar"
          :key="item.path"
          class="app-tabbar__item"
          :class="{ 'app-tabbar__item--active': active === index }"
          role="button"
          tabindex="0"
          @click.stop="handleClickByPath(item.path)"
          @keydown.enter.prevent="handleClickByPath(item.path)"
          @keydown.space.prevent="handleClickByPath(item.path)"
        >
          <span class="app-tabbar__content">
            <span class="app-tabbar__icon-group" aria-hidden="true">
              <span v-if="active !== index" class="app-tabbar__icon-stack">
                <svg-icon :name="item.light_prefix" class-name="app-tabbar__icon app-tabbar__icon--outside" />
                <svg-icon :name="item.default_icon" class-name="app-tabbar__icon app-tabbar__icon--core" />
              </span>
              <svg-icon v-else :name="getActiveIcon(item)" class-name="app-tabbar__icon app-tabbar__icon--active" />
            </span>
            <span class="app-tabbar__text">{{ item.name }}</span>
          </span>
        </div>
      </nav>
    </div>
  </footer>
</template>

<style lang="less" scoped>
.tab-bar-footer {
  width: 100%;
  flex: none;
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.tab-bar-shell {
  width: 100%;
}

.app-tabbar {
  --app-tabbar-icon-size: 25px;

  width: 100%;
  min-height: calc(62px + var(--skin__safe-area-inset-bottom, 0px));
  padding-bottom: var(--skin__safe-area-inset-bottom, 0px);
  box-sizing: border-box;
  display: flex;
  position: relative;
  z-index: 20;
  overflow: hidden;
  color: var(--skin__btmnav_def, var(--skin__neutral_2));
  background-color: var(--skin__web_btmnav_db, var(--skin__bg_2));
  background-position: center bottom;
  background-repeat: no-repeat;
  background-size: 100% auto;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
}

:global([dir="rtl"]) .app-tabbar {
  box-shadow: -1px 0 3px rgba(0, 0, 0, 0.1);
}

.app-tabbar__item {
  width: 20%;
  height: 62px;
  min-width: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: inherit;
  font: inherit;
  line-height: 1;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  pointer-events: auto;
}

.app-tabbar__content {
  width: 100%;
  height: 100%;
  padding: 7px 2.5px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  pointer-events: none;
}

.app-tabbar__icon-group {
  height: var(--app-tabbar-icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  line-height: 0;
}

.app-tabbar__icon-stack {
  width: auto;
  height: var(--app-tabbar-icon-size);
  position: relative;
  display: block;
  line-height: 0;
}

:deep(.app-tabbar__icon) {
  width: auto;
  height: var(--app-tabbar-icon-size);
  display: block;
  font-size: var(--app-tabbar-icon-size);
  line-height: 0;
}

:deep(.app-tabbar__icon--outside) {
  position: absolute;
  inset: 0 auto auto 0;
  color: var(--skin__btmnav_def, var(--skin__neutral_2));
}

:deep(.app-tabbar__icon--core),
:deep(.app-tabbar__icon--active) {
  position: relative;
  color: var(--skin__btmnav_active, var(--skin__primary));
}

.app-tabbar__text {
  max-width: 100%;
  height: 27px;
  margin-top: 1px;
  color: var(--skin__btmnav_def, var(--skin__neutral_2));
  display: -webkit-box;
  overflow: hidden;
  z-index: 2;
  font-size: 12px;
  line-height: 1.2;
  text-overflow: ellipsis;
  vertical-align: middle;
  word-break: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.app-tabbar__text:lang(vi),
.app-tabbar__text:lang(my) {
  font-size: 10px;
  line-height: 1.4;
}

.app-tabbar__item--active .app-tabbar__text {
  color: var(--skin__btmnav_active, var(--skin__primary));
}
</style>
