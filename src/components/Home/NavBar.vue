<script setup lang="ts" name="HomeNavBar">
import { $t } from "@/locales";
import { computed, ref } from "vue";
import router from "@/router";
import UiButton from "@/components/Common/Button.vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import useAppStore from "@/store/modules/app";
import useAuthStore from "@/store/modules/user";
import { bus } from "@/utils/mitt";
import { isYimenApp } from "@/utils/yimenApp";

defineOptions({
  name: "HomeNavBar"
});

const auth = useAuthStore();
const app = useAppStore();
const inApp = isYimenApp();
const walletIsLoading = ref(false);

const showDownloadApp = computed(() => app.isShowDownload && !inApp);
const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(currency => currency.id == auth.user.currencyId);
});

function handleToLogin() {
  router.push("/home/login");
}

function handleToRegister() {
  router.push("/home/register");
}

function handleRecharge() {
  bus.emit("showRecharge");
}

function closeDownload() {
  app.updateDownloadBtn(false);
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
  <header class="home-nav">
    <div class="home-nav__safe-area" :class="{ 'home-nav__safe-area--download': showDownloadApp }"></div>

    <div
      v-if="!inApp"
      class="home-download-tip"
      :class="{ 'home-download-tip--hidden': !showDownloadApp }"
    >
      <button
        type="button"
        class="home-download-tip__close"
        :aria-label="$t('关闭')"
        @click="closeDownload"
      >
        <svg-icon name="comm_icon_x" class-name="home-download-tip__close-icon" />
      </button>

      <div class="home-download-tip__content">
        <home-skeleton-image
          v-if="app.appInfo.logo"
          class="home-download-tip__logo"
          :src="app.appInfo.logo"
          alt="logo"
          fit="contain"
          loading="eager"
        />
        <div class="home-download-tip__text">
          <p><strong>{{ $t("下载APP，可参与领取更多优惠！") }}</strong></p>
        </div>
      </div>

      <ui-button type="primary" size="small" class="home-download-tip__button">
        {{ $t("立即下载") }}
      </ui-button>
    </div>

    <div class="home-nav__toolbar">
      <div class="home-nav__brand">
        <home-skeleton-image
          v-if="app.appInfo.logo"
          class="home-nav__logo"
          :src="app.appInfo.logo"
          alt="logo"
          fit="contain"
          loading="eager"
        />
      </div>

      <div class="home-nav__actions">
        <template v-if="auth.token">
          <ui-button
            type="primary"
            size="small"
            class="home-nav__recharge-button"
            @click="handleRecharge"
          >
            {{ $t("存 款") }}
          </ui-button>

          <div class="home-wallet" aria-live="polite">
            <div class="home-wallet__currency-frame">
              <home-skeleton-image
                v-if="currencyInfo?.icon"
                class="home-wallet__currency-icon"
                :src="currencyInfo.icon"
                alt=""
                fit="cover"
                loading="eager"
              />
            </div>

            <div class="home-wallet__content">
              <span v-if="!walletIsLoading" class="home-wallet__amount" dir="ltr">
                {{ auth.user.money }}
              </span>
              <span v-else class="home-wallet__loading">{{ $t("加载中") }}</span>
            </div>

            <button
              type="button"
              class="home-wallet__refresh"
              :class="{ 'home-wallet__refresh--loading': walletIsLoading }"
              :aria-label="$t('刷新余额')"
              @click="updateWallet"
            >
              <svg-icon name="comm_icon_sx" class-name="home-wallet__refresh-icon" />
            </button>
          </div>
        </template>

        <div v-else class="home-nav__guest-actions">
          <ui-button
            type="primary"
            size="small"
            class="home-nav__guest-button home-nav__guest-button--login"
            @click="handleToLogin"
          >
            {{ $t("登 录") }}
          </ui-button>
          <ui-button
            size="small"
            class="home-nav__guest-button home-nav__guest-button--register"
            @click="handleToRegister"
          >
            {{ $t("注 册") }}
          </ui-button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.home-nav {
  width: 100%;
  flex: none;
  color: var(--skin__lead);
  background: var(--skin__bs_topnav_bg);
}

.home-nav__safe-area {
  height: var(--status-bar-height);
  background: var(--skin__bs_topnav_bg);
  transition: background-color 0.3s;

  &--download {
    background: var(--top_bg_color);
  }
}

.home-download-tip {
  width: 100%;
  height: 30px;
  padding: 0 10px 0 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--top_bg_color);
  transition: height 0.3s;

  &--hidden {
    height: 0;
  }
}

:global([dir="rtl"]) .home-download-tip {
  padding: 0 0 0 10px;
}

.home-download-tip__close {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--top_close_icon_color);
  background: transparent;
  cursor: pointer;
}

:deep(.home-download-tip__close-icon) {
  width: 10px;
  height: 10px;
}

.home-download-tip__content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.home-download-tip__logo {
  width: 90px;
  height: 25px;
  flex: none;
  background-color: transparent;
}

.home-download-tip__text {
  flex: 1;
  min-width: 0;
  max-height: 25px;
  margin: 0 5px;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 10px;
  line-height: 13px;
  text-align: start;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  p {
    margin: 0;
  }
}

:deep(.home-download-tip__button) {
  width: 60px;
  height: 20px;
  padding: 0 5px;
  flex-shrink: 0;
  border-color: var(--top_download_icon_color);
  border-radius: 5px;
  color: var(--skin__text_primary);
  background: var(--top_download_icon_color);
  font-size: 9px;
  line-height: 1.2;
  text-align: center;
}

:deep(.home-download-tip__button .ui-button__text) {
  white-space: normal;
  word-break: keep-all;
}

.home-nav__toolbar {
  height: 55px;
  padding: 0 10px 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--lobby__px) solid var(--skin__border);
  background: var(--skin__bs_topnav_bg);
}

.home-nav__brand {
  max-width: 140px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: none;
}

.home-nav__logo {
  width: 100%;
  height: 100%;
  background-color: transparent;
  :deep(img) {
    max-width: 100%;
    width: unset !important;
  }
}

.home-nav__actions {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  overflow: hidden;
}

:deep(.home-nav__recharge-button) {
  width: 70px;
  height: 30px;
  padding: 0 8px;
  border-color: var(--skin__primary);
  border-radius: 999px;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  font-size: 12px;
}

.home-wallet {
  height: 30px;
  max-width: 158px;
  min-width: 0;
  padding: 0 8px 0 2px;
  display: flex;
  align-items: center;
  flex: none;
  overflow: hidden;
  border-radius: 999px;
  background: var(--skin__bs_topnav_wallet_bg);
}

:global([dir="rtl"]) .home-wallet {
  padding: 0 2px 0 8px;
}

.home-wallet__currency-frame {
  width: 17px;
  height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 50%;
  background: url("@/assets/common/img_hb_frame.avif") center / cover no-repeat;
}

.home-wallet__currency-icon {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.home-wallet__content {
  min-width: 0;
  margin-left: 4px;
  display: flex;
  align-items: center;
}

:global([dir="rtl"]) .home-wallet__content {
  margin-right: 4px;
  margin-left: 0;
}

.home-wallet__amount {
  max-width: 78px;
  display: block;
  overflow: hidden;
  color: var(--skin__accent_3);
  border-bottom: 1px solid var(--skin__accent_3);
  font-size: 12px;
  line-height: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.home-wallet__loading {
  color: var(--skin__neutral_2);
  font-size: 10px;
  white-space: nowrap;
}

.home-wallet__refresh {
  width: 20px;
  height: 20px;
  margin-left: 4px;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--skin__alt_border);
  background: transparent;
  cursor: pointer;

  &--loading {
    animation: home-wallet-spin 0.3s linear infinite;
  }
}

:global([dir="rtl"]) .home-wallet__refresh {
  margin-right: 4px;
  margin-left: 0;
}

:deep(.home-wallet__refresh-icon) {
  width: 15px;
  height: 15px;
}

.home-nav__guest-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}

:deep(.home-nav__guest-button) {
  width: 68px;
  height: 27px;
  padding: 0 5px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 5px;
  font-size: 11px;
}

:deep(.home-nav__guest-button--login) {
  color: var(--skin__text_primary);
  background: var(--skin__primary);
}

:deep(.home-nav__guest-button--register) {
  color: var(--skin__primary);
  background: transparent;
}

:deep(.home-nav__guest-button .ui-button__text),
:deep(.home-nav__recharge-button .ui-button__text) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@keyframes home-wallet-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
