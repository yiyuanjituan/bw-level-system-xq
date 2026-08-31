<script setup lang="ts">
import { computed, ref } from "vue";
import router from "@/router";
import { $t } from "@/locales";
import { showCustomToast } from "@/hooks/useCommon";
import CommonCopy from "@/components/Common/Copy.vue";
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
import vipBadgeIcon from "@/assets/setting/vip.avif";

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
const displayName = computed(() => {
  if (auth.user.showAccount === 2 && auth.user.phone) {
    const prefix = currencyInfo.value?.numberPrefix ? `+${currencyInfo.value.numberPrefix} ` : "";
    return `${prefix}***${String(auth.user.phone).slice(-3)}`;
  }

  if (auth.user.showAccount === 0) return auth.user.unionid || "--";

  return auth.user.account || auth.user.nickName || auth.user.unionid || "--";
});
const copyText = computed(() => {
  if (auth.user.showAccount === 0) return auth.user.unionid || "";
  if (auth.user.showAccount === 1 || auth.user.showAccount === undefined) {
    return auth.user.account || "";
  }
  return "";
});
const vipLevel = computed(() => Number(auth.user.level) || 0);
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
    <div v-if="auth.token" class="u-quick-nav__account">
      <div class="u-quick-nav__account-top">
        <span class="u-quick-nav__vip-badge" :aria-label="`VIP ${vipLevel}`">
          <img :src="vipBadgeIcon" alt="" />
          <span>{{ vipLevel }}</span>
        </span>
        <span class="u-quick-nav__username">{{ displayName }}</span>
        <CommonCopy
          v-if="copyText"
          class="u-quick-nav__copy"
          class-name="u-quick-nav__copy-icon"
          :text="copyText"
        />
      </div>

      <button
        type="button"
        class="u-quick-nav__balance"
        :aria-label="$t('刷新余额')"
        @click="updateWallet"
      >
        <span class="u-quick-nav__currency-frame">
          <HomeSkeletonImage
            v-if="currencyInfo?.icon"
            :src="currencyInfo.icon"
            class="u-quick-nav__currency"
            alt=""
            fit="cover"
          />
        </span>
        <span class="u-quick-nav__balance-value">
          {{ walletIsLoading ? $t("加载中") : auth.user.money }}
        </span>
        <svg-icon
          name="comm_icon_sx"
          class-name="u-quick-nav__refresh"
          :class="{ 'u-quick-nav__refresh--loading': walletIsLoading }"
        />
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
.u-quick-nav__account {
  width: 125px;
  flex: none;
}

.u-quick-nav__guest {
  display: flex;
  align-items: center;
  gap: 10px;
}

.u-quick-nav__guest-button {
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

.u-quick-nav__account {
  height: 40px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.u-quick-nav__account-top {
  min-width: 0;
  height: 17px;
  display: flex;
  align-items: center;
}

.u-quick-nav__vip-badge {
  width: 29px;
  height: 12px;
  padding: 0 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  box-sizing: border-box;
  border-radius: 7px 0 5px;
  color: #fff;
  background: #24b299;

  img {
    width: 15px;
    height: 7px;
    object-fit: contain;
  }

  span {
    margin-left: 1px;
    font-size: 9px;
    font-style: italic;
    line-height: 1;
  }
}

.u-quick-nav__username {
  min-width: 0;
  max-width: 83px;
  margin-left: 4px;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.u-quick-nav__copy {
  width: 16px;
  height: 16px;
  margin-left: 3px;
  flex: none;
  color: var(--skin__primary);
}

:deep(.u-quick-nav__copy-icon) {
  width: 14px;
  height: 14px;
  font-size: 14px !important;
}

.u-quick-nav__balance {
  width: 100%;
  height: 20px;
  min-width: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 0;
  color: var(--skin__lead);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  text-align: start;

  .u-quick-nav__balance-value {
    min-width: 0;
    max-width: 86px;
    overflow: hidden;
    border-bottom: 1px solid var(--skin__accent_3);
    color: var(--skin__accent_3);
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.u-quick-nav__currency-frame {
  width: 17px;
  height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 50%;
  background: url("@/assets/common/img_hb_frame.avif") center / cover no-repeat;
}

.u-quick-nav__currency {
  width: 15px;
  height: 15px;
  flex: none;
  border-radius: 50%;
}

.u-quick-nav__refresh {
  width: 15px;
  height: 15px;
  margin-left: 1px;
  flex: none;
  color: var(--skin__primary);

  &--loading {
    animation: u-quick-nav-spin 0.3s linear infinite;
  }
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

:global([dir="rtl"]) .u-quick-nav__username,
:global([dir="rtl"]) .u-quick-nav__copy {
  margin-right: 4px;
  margin-left: 0;
}

:global([dir="rtl"]) .u-quick-nav__copy {
  margin-right: 3px;
}

:global([dir="rtl"]) .u-quick-nav__refresh {
  margin-right: 1px;
  margin-left: 0;
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

@keyframes u-quick-nav-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
