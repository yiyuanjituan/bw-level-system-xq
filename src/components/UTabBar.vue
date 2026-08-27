<script setup lang="ts">
import { $t } from "@/locales";
import { showCustomToast } from "@/hooks/useCommon";
import { setTabBarName } from "@/hooks/useTransition";
import router from "@/router";
import routes from "@/router/routes";
import useAuthStore from "@/store/modules/user";
import { flattenRoutes } from "@/utils/common";
import { bus } from "@/utils/mitt";
import homeIcon from "@/assets/tabbar/u-series/home.avif";
import homeActiveIcon from "@/assets/tabbar/u-series/home-active.avif";
import promotionIcon from "@/assets/tabbar/u-series/promotion.avif";
import promotionActiveIcon from "@/assets/tabbar/u-series/promotion-active.avif";
import depositIcon from "@/assets/tabbar/u-series/deposit.webp";
import withdrawIcon from "@/assets/tabbar/u-series/withdraw.avif";
import mineIcon from "@/assets/tabbar/u-series/mine.avif";
import mineActiveIcon from "@/assets/tabbar/u-series/mine-active.avif";
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

type TabBarAction = "recharge" | "withdraw";

interface UTabBarItem {
  name: string;
  path: string;
  defaultIcon: string;
  activeIcon: string;
  isTabBar: boolean;
  action?: TabBarAction;
  badge?: string;
}

const route = useRoute();
const auth = useAuthStore();

const tabBar = computed<UTabBarItem[]>(() => [
  {
    name: $t("首页"),
    path: "/index",
    defaultIcon: homeIcon,
    activeIcon: homeActiveIcon,
    isTabBar: true
  },
  {
    name: $t("优惠"),
    path: "/home/event",
    defaultIcon: promotionIcon,
    activeIcon: promotionActiveIcon,
    isTabBar: true
  },
  {
    name: $t("存款"),
    path: "/recharge",
    defaultIcon: depositIcon,
    activeIcon: depositIcon,
    isTabBar: false,
    action: "recharge",
    badge: $t("送3%")
  },
  {
    name: $t("提现"),
    path: "/home/withdraw",
    defaultIcon: withdrawIcon,
    activeIcon: withdrawIcon,
    isTabBar: false,
    action: "withdraw"
  },
  {
    name: $t("我的"),
    path: "/home/mine",
    defaultIcon: mineIcon,
    activeIcon: mineActiveIcon,
    isTabBar: true
  }
]);

const activeIndex = computed(() => {
  const matchedIndex = tabBar.value.findIndex(item => item.path === route.path);
  if (matchedIndex >= 0) return matchedIndex;

  const routeInfo = flattenRoutes(routes).find(item => item.path === route.path);
  return routeInfo?.meta?.tabBarOrder ?? routeInfo?.meta?.order ?? 0;
});

function handleWithdraw() {
  if (!auth.token || !auth.user?.id) {
    router.push("/home/login");
    return;
  }

  if (!auth.user.hasPayPassword) {
    router.push("/home/security?active=5");
    showCustomToast({
      type: "warning",
      message: $t("为了资金安全，需先设置提现密码哦！")
    });
    return;
  }

  router.push("/home/withdraw");
}

function handleClick(item: UTabBarItem) {
  if (item.action === "recharge") {
    bus.emit("showRecharge");
    return;
  }

  if (item.action === "withdraw") {
    handleWithdraw();
    return;
  }

  const nextIndex = tabBar.value.findIndex(tab => tab.path === item.path);
  const currentIndex = tabBar.value.findIndex(tab => tab.path === route.path);
  setTabBarName(nextIndex > currentIndex ? "page-slide-forward" : "page-slide-backward");

  if (item.isTabBar) {
    router.replace({ path: item.path });
    return;
  }

  router.push({ path: item.path });
}

function handleSwitchTab(path: string) {
  const item = tabBar.value.find(tab => tab.path === path);
  if (item) handleClick(item);
}

onMounted(() => {
  bus.on("switchTab", handleSwitchTab);
});

onUnmounted(() => {
  bus.off("switchTab", handleSwitchTab);
});
</script>

<template>
  <footer class="u-tabbar-footer">
    <nav class="u-tabbar" aria-label="主导航">
      <button
        v-for="(item, index) in tabBar"
        :key="item.path"
        type="button"
        class="u-tabbar__item"
        :class="{
          'u-tabbar__item--active': activeIndex === index,
          'u-tabbar__item--deposit': item.action === 'recharge'
        }"
        :aria-current="activeIndex === index ? 'page' : undefined"
        @click.stop="handleClick(item)"
      >
        <span class="u-tabbar__content">
          <span class="u-tabbar__icon-wrap" aria-hidden="true">
            <img
              class="u-tabbar__icon"
              :src="activeIndex === index ? item.activeIcon : item.defaultIcon"
              alt=""
            />
            <span v-if="item.badge" class="u-tabbar__badge">{{ item.badge }}</span>
          </span>
          <span class="u-tabbar__text">{{ item.name }}</span>
        </span>
      </button>
    </nav>
  </footer>
</template>

<style lang="less" scoped>
.u-tabbar-footer {
  width: 100%;
  flex: none;
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.u-tabbar {
  width: 100%;
  min-height: calc(55px + var(--skin__safe-area-inset-bottom, 0px));
  padding-bottom: var(--skin__safe-area-inset-bottom, 0px);
  box-sizing: border-box;
  display: flex;
  position: relative;
  overflow: visible;
  color: var(--skin__btmnav_def, var(--skin__neutral_2));
  background-color: var(--skin__web_btmnav_db, var(--skin__bg_2));
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
}

:global([dir="rtl"]) .u-tabbar {
  box-shadow: -1px 0 3px rgba(0, 0, 0, 0.1);
}

.u-tabbar__item {
  width: 20%;
  height: 55px;
  min-width: 0;
  padding: 0;
  border: 0;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  align-items: stretch;
  color: inherit;
  font: inherit;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}

.u-tabbar__content {
  width: 100%;
  height: 100%;
  padding: 0 2.5px 7.5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  text-align: center;
}

.u-tabbar__icon-wrap {
  width: auto;
  height: 27.5px;
  display: block;
  position: relative;
  line-height: 0;
}

.u-tabbar__icon {
  width: auto;
  height: 27.5px;
  display: block;
  object-fit: contain;
}

.u-tabbar__text {
  max-width: 100%;
  margin-top: 1px;
  overflow: hidden;
  color: var(--skin__btmnav_def, var(--skin__neutral_2));
  font-size: 10px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.u-tabbar__item--active .u-tabbar__text {
  color: var(--skin__btmnav_active, var(--skin__primary));
}

.u-tabbar__item--deposit .u-tabbar__icon-wrap {
  width: 65px;
  height: 65px;
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
}

.u-tabbar__item--deposit .u-tabbar__icon {
  width: 65px;
  height: 65px;
}

.u-tabbar__badge {
  max-width: 60px;
  padding: 2px 5px;
  border-radius: 999px;
  position: absolute;
  top: 0;
  right: -5px;
  z-index: 2;
  overflow: hidden;
  color: var(--skin__text_primary, #fff);
  background-color: var(--skin__accent_2);
  font-size: 9px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global([dir="rtl"]) .u-tabbar__badge {
  right: auto;
  left: -5px;
}
</style>
