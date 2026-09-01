<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { service } from '@/api/service';
import { showCustomToast } from '@/hooks/useCommon';
import { $t } from '@/locales';
import { formatMoney } from '@/utils/common';

defineOptions({ name: 'MineWalletCard' });

const walletInfo = ref<Record<string, any>>({});
const walletIsLoading = ref(false);
const walletHasLoaded = ref(false);
const isCollapsed = ref(false);

const walletAmount = computed(() => {
  const value = walletInfo.value.rmbBalance ?? walletInfo.value.walletBalance ?? walletInfo.value.balance;
  return value === undefined || value === null || value === '' ? '--' : formatMoney(value);
});
const scoreAmount = computed(() => {
  const value =
    walletInfo.value.qpoint ??
    walletInfo.value.pointBalance ??
    walletInfo.value.points ??
    walletInfo.value.point ??
    walletInfo.value.integral ??
    walletInfo.value.score;
  return value === undefined || value === null || value === '' ? '--' : formatMoney(value);
});
const walletUrl = computed(() => walletInfo.value.walletUrl || walletInfo.value.bindUrl || walletInfo.value.buyUrl);
const bindUrl = computed(() => walletInfo.value.bindUrl);
const buyUrl = computed(() => walletInfo.value.buyUrl || walletInfo.value.walletUrl || walletInfo.value.bindUrl);
const lotteryUrl = computed(() => walletInfo.value.lotteryUrl || walletInfo.value.drawUrl || walletInfo.value.walletUrl);
const walletIsUnbound = computed(() => {
  const bindStatus = Number(walletInfo.value.bind);
  return walletHasLoaded.value && Number.isFinite(bindStatus) && bindStatus !== 1;
});

function openExternal(url?: unknown) {
  if (typeof url !== 'string' || !url.trim()) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value;
}

function handleBindWallet() {
  if (!bindUrl.value) {
    showCustomToast({ type: 'warning', message: $t('暂未获取NO钱包绑定地址') });
    return;
  }
  openExternal(bindUrl.value);
}

async function loadWalletInfo() {
  if (walletIsLoading.value) return;

  walletIsLoading.value = true;
  try {
    const response = await service.base.recharge.siteWalletInfo({ keyword: 'wallet-no' });
    walletInfo.value = response && typeof response === 'object' ? response : {};
    walletHasLoaded.value = true;
  } catch (error) {
    console.error('获取个人中心钱包信息失败，失败原因：', error);
  } finally {
    walletIsLoading.value = false;
  }
}

onMounted(() => {
  void loadWalletInfo();
});
</script>

<template>
  <div class="mine-wallet-card" :class="{ 'mine-wallet-card--collapsed': isCollapsed }" :aria-expanded="!isCollapsed">
    <button type="button" class="mine-wallet-card__expand" :aria-label="isCollapsed ? $t('展开钱包') : $t('收起钱包')" @click="toggleCollapsed">
      <svg-icon name="template-one-comm_icon_NOlogo2" class="mine-wallet-card__collapse-logo" />
      <svg-icon name="comm_icon_fh" class="mine-wallet-card__collapse-arrow" />
    </button>

    <div v-show="!isCollapsed" class="mine-wallet-card__content" :class="{ 'mine-wallet-card__content--unbound': walletIsUnbound }">
      <template v-if="walletIsUnbound">
        <p class="mine-wallet-card__unbound-area">
          <span class="mine-wallet-card__unbound-text">{{ $t('绑定') }}</span>
          <svg-icon name="template-one-comm_icon_NOlogo1" class="mine-wallet-card__logo mine-wallet-card__unbound-logo" />
          <span class="mine-wallet-card__unbound-text">{{ $t('钱包充提自由+抽') }}</span>
          <span class="mine-wallet-card__prize" dir="ltr">88,888.88</span>
          <span class="mine-wallet-card__unbound-text">{{ $t('大奖') }}</span>
        </p>
        <div class="mine-wallet-card__bind-area">
          <button type="button" class="mine-wallet-card__bind-button" @click="handleBindWallet">
            {{ $t('绑定') }}
          </button>
          <button
            type="button"
            class="mine-wallet-card__retry mine-wallet-card__bind-retry"
            :class="{ 'mine-wallet-card__retry--loading': walletIsLoading }"
            :aria-label="$t('刷新钱包')"
            @click="loadWalletInfo"
          >
            <svg-icon name="comm_icon_retry" />
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mine-wallet-card__handle">
          <p class="mine-wallet-card__buy-area">
            <svg-icon name="template-one-comm_icon_NOlogo1" class="mine-wallet-card__logo" />
            <span class="mine-wallet-card__label">{{ $t('钱包') }}</span>
            <span class="mine-wallet-card__number" dir="ltr">{{ walletAmount }}</span>
            <button
              type="button"
              class="mine-wallet-card__retry"
              :class="{ 'mine-wallet-card__retry--loading': walletIsLoading }"
              :aria-label="$t('刷新钱包')"
              @click="loadWalletInfo"
            >
              <svg-icon name="comm_icon_retry" />
            </button>
            <button type="button" class="mine-wallet-card__buy-button" @click="openExternal(buyUrl)">
              {{ $t('购买') }}
            </button>
          </p>

          <p class="mine-wallet-card__score">
            <span class="mine-wallet-card__label">{{ $t('积分') }}</span>
            <span class="mine-wallet-card__number" dir="ltr">{{ scoreAmount }}</span>
            <button type="button" class="mine-wallet-card__lottery-button" @click="openExternal(lotteryUrl)">
              {{ $t('抽奖') }}
            </button>
          </p>
        </div>

        <button type="button" class="mine-wallet-card__link" :aria-label="$t('钱包')" @click="openExternal(walletUrl)">
          <svg-icon name="comm_icon_fh" />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-wallet-card {
  --mine-wallet-background: var(--skin__bg_2);
  --mine-wallet-content-color: var(--skin__lead);
  --mine-wallet-label-color: var(--skin__neutral_2);
  --mine-wallet-logo-color: var(--skin__primary);
  --mine-wallet-button-background: var(--skin__primary);
  --mine-wallet-button-color: var(--skin__text_primary);
  --mine-wallet-lottery-background: var(--skin__accent_3);
  --mine-wallet-lottery-color: var(--skin__text_accent3, var(--skin__text_primary));
  --mine-wallet-arrow-color: var(--skin__neutral_2);
  --mine-wallet-expand-background: rgba(var(--skin__border__toRgbString, 120, 120, 120), 0.5);
  width: 350px;
  max-width: 100%;
  min-height: 40px;
  margin: 10px auto 0;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 10px;
  color: var(--mine-wallet-content-color);
  background: var(--mine-wallet-background);
  box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
}

.mine-wallet-card--collapsed {
  width: 12.5px !important;
  min-height: 40px;
  margin: 0;
  position: absolute;
  top: 23.5px;
  left: 0;
  z-index: 21;
  border-radius: 0 5px 5px 0;
  transform: translateY(-50%);
}

.mine-wallet-card__expand {
  width: 12.5px;
  height: 33px;
  padding: 3.5px 0;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 0 5px 5px 0;
  color: #fff;
  background: var(--mine-wallet-expand-background);
  cursor: pointer;
}

.mine-wallet-card__collapse-logo {
  color: var(--mine-wallet-logo-color);
  font-size: 15px;
  opacity: 0.8;
}

.mine-wallet-card__collapse-arrow {
  color: #fff;
  font-size: 8px;
  opacity: 0.6;
}

.mine-wallet-card--collapsed .mine-wallet-card__collapse-arrow {
  color: var(--mine-wallet-arrow-color);
  opacity: 1;
  transform: rotate(180deg);
}

.mine-wallet-card__content {
  min-width: 0;
  padding: 5px 10px 5px 8.5px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-wallet-card__content--unbound {
  padding: 5px 10px;
}

.mine-wallet-card__unbound-area {
  max-width: 251.5px;
  margin: 0;
  padding-top: 1px;
  color: var(--mine-wallet-content-color);
  font-size: 0;
  line-height: 20px;
  word-break: break-all;
}

.mine-wallet-card__unbound-text,
.mine-wallet-card__prize {
  font-size: 12px;
}

.mine-wallet-card__unbound-logo {
  padding-bottom: 2px;
}

.mine-wallet-card__prize {
  margin: 0 2.5px;
  color: var(--skin__accent_3);
  font-weight: 700;
}

.mine-wallet-card__bind-area {
  flex: none;
  display: flex;
  align-items: center;
}

.mine-wallet-card__handle {
  min-width: 0;
  width: 100%;
  display: flex;
  align-items: center;
}

.mine-wallet-card__buy-area,
.mine-wallet-card__score {
  margin: 0;
  display: inline-flex;
  align-items: center;
  color: var(--mine-wallet-content-color);
  font-size: 12px;
  line-height: 20px;
  word-break: break-all;
}

.mine-wallet-card__buy-area {
  min-width: 0;
  align-self: flex-start;
}

.mine-wallet-card__score {
  margin-right: 10px;
  margin-left: auto;
  justify-content: flex-end;
}

.mine-wallet-card__logo {
  margin: 0 2.5px;
  flex: none;
  color: var(--mine-wallet-logo-color);
  font-size: 18px;
  vertical-align: middle;
}

.mine-wallet-card__label {
  margin: -0.5px 2.5px 0;
  color: var(--mine-wallet-label-color);
  white-space: nowrap;
}

.mine-wallet-card__number {
  max-width: 72px;
  padding-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-wallet-card__buy-button,
.mine-wallet-card__bind-button,
.mine-wallet-card__lottery-button {
  min-width: 35px;
  max-width: 62.5px;
  height: 20px;
  padding: 0 2.5px;
  border: 0;
  border-radius: 5px;
  color: var(--mine-wallet-button-color);
  font-size: 9px;
  line-height: 100%;
  word-break: break-word;
  cursor: pointer;
}

.mine-wallet-card__buy-button {
  background: var(--mine-wallet-button-background);
}

.mine-wallet-card__bind-button {
  padding: 4px 5px;
  background: var(--mine-wallet-button-background);
}

.mine-wallet-card__lottery-button {
  margin-left: 5px;
  color: var(--mine-wallet-lottery-color);
  background: var(--mine-wallet-lottery-background);
}

.mine-wallet-card__retry {
  width: 14px;
  height: 20px;
  margin: 0 10px 0 5px;
  padding: 0;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__primary);
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}

.mine-wallet-card__retry--loading {
  animation: mine-wallet-rotate 0.5s linear infinite;
}

.mine-wallet-card__retry.mine-wallet-card__bind-retry {
  margin: 0 0 0 10px;
}

.mine-wallet-card__link {
  width: 11px;
  height: 18px;
  padding: 0;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--mine-wallet-arrow-color);
  background: transparent;
  font-size: 8px;
  cursor: pointer;
  transform: rotate(180deg);
}

.mine-wallet-card button:focus-visible {
  outline: 2px solid var(--skin__primary);
  outline-offset: 1px;
}

@keyframes mine-wallet-rotate {
  to {
    transform: rotate(360deg);
  }
}

:global([dir='rtl']) .mine-wallet-card--collapsed {
  right: 0;
  left: auto;
  border-radius: 5px 0 0 5px;
}

:global([dir='rtl']) .mine-wallet-card__expand {
  border-radius: 5px 0 0 5px;
}

:global([dir='rtl']) .mine-wallet-card__content {
  padding: 5px 8.5px 5px 10px;
}

:global([dir='rtl']) .mine-wallet-card__content--unbound {
  padding: 5px 10px;
}

:global([dir='rtl']) .mine-wallet-card__score {
  margin-right: auto;
  margin-left: 10px;
}

:global([dir='rtl']) .mine-wallet-card__lottery-button {
  margin-right: 5px;
  margin-left: 0;
}

:global([dir='rtl']) .mine-wallet-card__retry.mine-wallet-card__bind-retry {
  margin: 0 10px 0 0;
}

:global([dir='rtl']) .mine-wallet-card__link {
  transform: none;
}

:global([dir='rtl']) .mine-wallet-card--collapsed .mine-wallet-card__collapse-arrow {
  transform: rotate(-180deg);
}

@media (max-width: 360px) {
  .mine-wallet-card__retry {
    margin-right: 5px;
    margin-left: 3px;
  }

  .mine-wallet-card__score {
    margin-right: 5px;
  }

  .mine-wallet-card__number {
    max-width: 52px;
  }
}
</style>
