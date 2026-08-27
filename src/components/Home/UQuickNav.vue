<script setup lang="ts">
import { computed, ref } from "vue";
import router from "@/router";
import { $t } from "@/locales";
import { showCustomToast } from "@/hooks/useCommon";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import ULanguageDialog from "@/components/Home/ULanguageDialog.vue";
import UMorePopover from "@/components/Home/UMorePopover.vue";
import useAppStore from "@/store/modules/app";
import useAuthStore from "@/store/modules/user";
import { bus } from "@/utils/mitt";
import serviceIcon from "@/assets/home/u-series/icon_dt_1kf.png";
import vipIcon from "@/assets/home/u-series/icon_dt_1vip.png";
import shareIcon from "@/assets/home/u-series/icon_dt_1tg.png";
import moreIcon from "@/assets/home/u-series/icon_dt_1gd.png";
import registerDecoration from "@/assets/home/u-series/apng_btn_zctx.webp";

defineOptions({
  name: "UHomeQuickNav"
});

const app = useAppStore();
const auth = useAuthStore();
const walletIsLoading = ref(false);
const languageDialogVisible = ref(false);
const currencyInfo = computed(() => {
  const currencyList = Array.isArray(app.appInfo?.countryList) ? app.appInfo.countryList : [];
  return currencyList.find(currency => currency.id == auth.user.currencyId);
});
const quickLinks = computed(() => [
  { key: "service", title: $t("客服"), icon: serviceIcon },
  { key: "vip", title: "VIP", icon: vipIcon },
  { key: "share", title: $t("分享赚钱"), icon: shareIcon }
]);

function openQuickLink(key: string) {
  if (key === "service") {
    bus.emit("findUs");
    return;
  }
  if (key === "vip") {
    void router.push("/home/vip");
    return;
  }
  if (key === "share") {
    void router.push("/home/promote");
  }
}

function openMoreLink(key: string) {
  if (key === "deposit") return bus.emit("showRecharge");
  if (key === "withdraw") return bus.emit("switchTab", "/home/withdraw");
  if (key === "app-download") return bus.emit("showDownloadTip");
  if (key === "language") {
    languageDialogVisible.value = true;
    return;
  }
  if (key === "find-us") return bus.emit("findUs");
  if (key === "lucky-wheel") {
    showCustomToast({ type: "text", message: $t("敬请期待") });
    return;
  }

  const routeMap: Record<string, string> = {
    event: "/home/event",
    task: "/home/task",
    yuebao: "/home/yuebao",
    cashback: "/home/cashback",
    feedback: "/home/notice?noticeType=5",
    security: "/home/security",
    profile: "/home/setting",
    "account-detail": "/home/report?reportCurrent=3",
    "bet-record": "/home/report?reportCurrent=2",
    "personal-report": "/home/report?reportCurrent=1",
    claim: "/home/canReceive",
    "withdraw-manage": "/home/withdraw?active=10",
    "bet-task": "/home/task",
    share: "/home/promote",
    recent: "/home/plazza?active=profile",
    favorite: "/home/plazza?active=profile",
    "claim-record": "/home/records"
  };
  const targetRoute = routeMap[key];
  if (targetRoute) void router.push(targetRoute);
}

async function updateWallet() {
  if (walletIsLoading.value) return;

  walletIsLoading.value = true;
  try {
    await auth.updateInfo();
  } finally {
    walletIsLoading.value = false;
  }
}
</script>

<template>
  <nav class="u-quick-nav" :aria-label="$t('更多')">
    <div v-if="auth.token" class="u-quick-nav__wallet">
      <button type="button" class="u-quick-nav__deposit" @click="bus.emit('showRecharge')">
        {{ $t("存款") }}
      </button>
      <button
        type="button"
        class="u-quick-nav__balance"
        :aria-label="$t('刷新余额')"
        @click="updateWallet"
      >
        <HomeSkeletonImage
          v-if="currencyInfo?.icon"
          :src="currencyInfo.icon"
          class="u-quick-nav__currency"
          alt=""
          fit="cover"
        />
        <span>{{ walletIsLoading ? $t("加载中") : auth.user.money }}</span>
      </button>
    </div>
    <div v-else class="u-quick-nav__guest">
      <button type="button" class="u-quick-nav__guest-button" @click="router.push('/home/login')">
        {{ $t("登 录") }}
      </button>
      <button
        type="button"
        class="u-quick-nav__guest-button u-quick-nav__guest-button--register"
        @click="router.push('/home/register')"
      >
        <span>{{ $t("注 册") }}</span>
        <img :src="registerDecoration" alt="" />
      </button>
    </div>

    <div class="u-quick-nav__links">
      <button
        v-for="link in quickLinks"
        :key="link.key"
        type="button"
        class="u-quick-nav__link"
        @click="openQuickLink(link.key)"
      >
        <img :src="link.icon" alt="" />
        <span>{{ link.title }}</span>
      </button>
      <UMorePopover @select="openMoreLink">
        <button id="moreClick" type="button" class="u-quick-nav__link">
          <img :src="moreIcon" alt="" />
          <span>{{ $t("更多") }}</span>
        </button>
      </UMorePopover>
    </div>
  </nav>
  <ULanguageDialog v-model="languageDialogVisible" />
</template>

<style scoped lang="less">
.u-quick-nav {
  margin: 8px 6px 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.u-quick-nav__guest,
.u-quick-nav__wallet {
  width: 125px;
  flex: none;
}

.u-quick-nav__guest {
  display: flex;
  align-items: center;
  gap: 10px;
}

.u-quick-nav__guest-button,
.u-quick-nav__deposit {
  position: relative;
  width: 60px;
  height: 25px;
  padding: 0 4px;
  overflow: hidden;
  border: 1px solid var(--skin__primary);
  border-radius: 5px;
  color: var(--skin__primary);
  background: transparent;
  font-size: 11px;
  cursor: pointer;

  &--register {
    color: var(--skin__text_primary);
    background: var(--skin__primary);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      position: absolute;
      pointer-events: none;
      object-fit: cover;
    }

    span {
      position: relative;
      z-index: 1;
    }

    img {
      max-width: 110px;
      height: auto;
      width: unset !important;
      position: absolute;
    }
  }
}

.u-quick-nav__wallet {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 5px;
}

.u-quick-nav__deposit {
  width: 48px;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
}

.u-quick-nav__balance {
  height: 25px;
  min-width: 0;
  padding: 0 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid var(--skin__border);
  border-radius: 5px;
  color: var(--skin__lead);
  background: rgba(var(--skin__bg_2__toRgbString), 0.75);
  font-size: 10px;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.u-quick-nav__currency {
  width: 15px;
  height: 15px;
  flex: none;
  border-radius: 50%;
}

.u-quick-nav__links {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;

  > .u-quick-nav__link,
  :deep(.u-more-popover__reference) {
    min-width: 45px;
    max-width: 50px;
    margin-right: 2.5px;
    flex: 1;
  }
}

:global([dir="rtl"]) .u-quick-nav__links {
  > .u-quick-nav__link,
  :deep(.u-more-popover__reference) {
    margin-right: 0;
    margin-left: 2.5px;
  }
}

.u-quick-nav__link {
  width: 100%;
  min-width: 0;
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 10px;
  line-height: 1.2;
  cursor: pointer;

  img {
    width: 29px;
    height: 25px;
    margin-bottom: 3px;
    object-fit: contain;
  }

  span {
    width: 100%;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
