<script setup lang="ts">
import { $t } from "@/locales";
import { computed, ref, watch } from 'vue';
import { createNoWalletUser, createOrder, getSiteWalletInfo } from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import { formatMoney, openUrlInNewWindow } from '@/utils/common';
import { bus } from '@/utils/mitt';
import useAppStore from '@/store/modules/app';

type PayTypeMode = 'usdt' | 'user_language';

interface CountryInfo {
  id: number | string;
  uRate?: number | string;
}

interface RechargeChannel {
  id: number;
  name?: string;
  tip?: string;
  frontShow?: boolean;
  siteWallet?: number;
  siteWalletKeyword?: string;
  download_tip?: string;
  wallet_url?: string;
  quickList?: Array<number | string>;
  giftRatio?: number | string;
  min?: number | string;
  max?: number | string;
}

interface RechargeGroup {
  id: number;
  name?: string;
  tip?: string;
  image?: string;
  type?: number;
  country_id?: number | string;
  download_tip?: string;
  wallet_url?: string;
  tipRichText?: string;
  children?: RechargeChannel[];
}

interface SiteWalletInfo {
  bind?: number;
  buyUrl?: string;
  bindUrl?: string;
  qAccount?: string;
  rmbBalance?: number | string;
  [key: string]: unknown;
}

interface QuickAmountOption {
  amount: number;
  displayAmount: number;
}

interface AmountSummary {
  label: string;
  value: string;
}

interface Props {
  listData?: RechargeGroup[];
}

const EMPTY_GROUP: RechargeGroup = { id: 0 };
const EMPTY_CHANNEL: RechargeChannel = { id: 0 };

const props = withDefaults(defineProps<Props>(), {
  listData: () => []
});

const emits = defineEmits<{
  (event: 'close'): void;
}>();

const app = useAppStore();

const payTypeMode = ref<PayTypeMode>('user_language');
const showAllWallets = ref(true);
const showAllChildren = ref(true);
const isLoading = ref(false);
const activeGroupId = ref(0);
const activeChannelId = ref(0);
const inputAmount = ref<number>();
const selectedQuickAmount = ref<number>();
const isGetSiteWallet = ref(false);
const siteWalletInfo = ref<SiteWalletInfo>({});
const isRefreshWallet = ref(false);

const countryList = computed<CountryInfo[]>(() => app.appInfo?.countryList ?? []);
const activeGroup = computed<RechargeGroup>(() => props.listData.find(item => item.id == activeGroupId.value) ?? props.listData[0] ?? EMPTY_GROUP);
const activeChildren = computed<RechargeChannel[]>(() => activeGroup.value.children ?? []);
const activeInfo = computed<RechargeChannel>(() => activeChildren.value.find(item => item.id == activeChannelId.value) ?? EMPTY_CHANNEL);
const currentRate = computed(() => {
  const rate = Number(countryList.value.find(item => item.id == activeGroup.value.country_id)?.uRate);
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
});
const visibleWallets = computed(() => (showAllWallets.value ? props.listData : props.listData.slice(0, 6)));
const visibleChildren = computed(() => (showAllChildren.value ? activeChildren.value : activeChildren.value.slice(0, 6)));
const quickAmounts = computed(() => {
  return (activeInfo.value.quickList ?? []).map(item => Number(item)).filter(item => Number.isFinite(item));
});
const giftRatio = computed(() => {
  const value = Number(activeInfo.value.giftRatio);
  return Number.isFinite(value) ? value : 0;
});
const quickAmountOptions = computed<QuickAmountOption[]>(() => {
  return quickAmounts.value.map(amount => ({
    amount,
    displayAmount: getQuickDisplayAmount(amount)
  }));
});
const isCryptoRecharge = computed(() => activeGroup.value.type == 2);
const isUsdtPayMode = computed(() => activeGroup.value.type == 2 && payTypeMode.value == 'usdt');
const payModeTitle = computed(() => (isUsdtPayMode.value ? '上分数量' : '存款金额'));
const inputPrefix = computed(() => (isUsdtPayMode.value ? 'U' : '￥'));
const inputPlaceholder = computed(() => `最低${activeInfo.value.min ?? 0} ~ 最高${activeInfo.value.max ?? 0}`);
const showGroupDownloadTip = computed(() => {
  return Boolean(
    activeGroup.value.download_tip &&
      activeGroup.value.wallet_url &&
      (!activeInfo.value.id || !(activeInfo.value.download_tip && activeInfo.value.wallet_url))
  );
});
const showChildDownloadTip = computed(() => Boolean(activeInfo.value.download_tip && activeInfo.value.wallet_url));
const showChildrenSection = computed(() => activeChildren.value.filter(item => item.frontShow).length > 1);
const showBoundNoWallet = computed(() => {
  return (
    activeInfo.value.siteWallet == 1 && isGetSiteWallet.value && activeInfo.value.siteWalletKeyword == 'wallet-no' && siteWalletInfo.value.bind == 1
  );
});
const showRechargeForm = computed(() => activeInfo.value.siteWallet == 0 || [1].includes(Number(siteWalletInfo.value.bind)));
const showBindActions = computed(() => {
  return (
    activeInfo.value.siteWallet == 1 && activeInfo.value.siteWalletKeyword == 'wallet-no' && [2, 3].includes(Number(siteWalletInfo.value.bind))
  );
});

function normalizeMoney(value: number) {
  return Number(value.toFixed(2));
}

function isUsdtMode(mode = payTypeMode.value) {
  return activeGroup.value.type == 2 && mode == 'usdt';
}

function getOrderAmountByInput(amount: number, mode = payTypeMode.value) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (!isUsdtMode(mode)) {
    return normalizeMoney(amount);
  }

  if (!currentRate.value) {
    return 0;
  }

  return normalizeMoney(amount * currentRate.value);
}

const orderAmount = computed(() => {
  return getOrderAmountByInput(Number(inputAmount.value));
});
const cryptoTransferAmount = computed(() => {
  const amount = Number(inputAmount.value);
  if (!isCryptoRecharge.value || !Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  if (isUsdtPayMode.value) {
    return normalizeMoney(amount);
  }

  if (!currentRate.value) {
    return 0;
  }

  return normalizeMoney(amount / currentRate.value);
});
const amountSummary = computed<AmountSummary | null>(() => {
  const amount = Number(inputAmount.value);
  if (!Number.isFinite(amount) || amount <= 0 || !currentRate.value) {
    return null;
  }

  if (payTypeMode.value == 'user_language') {
    return {
      label: '支付金额≈',
      value: `${formatMoney(amount / currentRate.value)}USDT`
    };
  }

  return {
    label: '到账金额≈',
    value: `￥${formatMoney(amount * currentRate.value)}`
  };
});

function resetAmountState() {
  inputAmount.value = void 0;
  selectedQuickAmount.value = void 0;
}

function resetWalletState() {
  isGetSiteWallet.value = false;
  siteWalletInfo.value = {};
}

function getQuickInputAmount(amount: number, mode = payTypeMode.value) {
  if (activeGroup.value.type != 2 || isUsdtMode(mode)) {
    return amount;
  }

  return Math.trunc(amount * currentRate.value);
}

function getQuickDisplayAmount(amount: number, mode = payTypeMode.value) {
  return getQuickInputAmount(amount, mode);
}

function getQuickGiftAmount(amount: number) {
  return getOrderAmountByInput(getQuickInputAmount(amount)) * giftRatio.value;
}

function syncSelectedQuickAmount() {
  const currentAmount = Number(inputAmount.value);
  if (!Number.isFinite(currentAmount)) {
    selectedQuickAmount.value = void 0;
    return;
  }

  const matchedAmount = quickAmounts.value.find(amount => currentAmount === getQuickInputAmount(amount));
  selectedQuickAmount.value = matchedAmount;
}

function handleChangePayMode() {
  payTypeMode.value = payTypeMode.value == 'usdt' ? 'user_language' : 'usdt';
}

function refreshSiteWallet() {
  isRefreshWallet.value = true;
  getSiteWalletData().finally(() => {
    isRefreshWallet.value = false;
  });
}

function clickToBuyBalance() {
  if (siteWalletInfo.value.buyUrl) {
    window.open(siteWalletInfo.value.buyUrl);
  }
}

function handleChangeActiveId(record: RechargeGroup) {
  if (activeGroupId.value == record.id) return;
  activeGroupId.value = record.id;
  activeChannelId.value = 0;
  resetAmountState();
  resetWalletState();
}

function handleChangeActiveChildrenId(record: RechargeChannel) {
  if (activeChannelId.value == record.id) return;
  activeChannelId.value = record.id;
  resetAmountState();
  resetWalletState();
}

function handleQuickAmountClick(amount: number) {
  selectedQuickAmount.value = amount;
  inputAmount.value = getQuickInputAmount(amount);
}

function isQuickAmountActive(amount: number) {
  return selectedQuickAmount.value === amount;
}

async function getSiteWalletData() {
  if (!activeInfo.value.id) return;

  isGetSiteWallet.value = true;
  const response = await getSiteWalletInfo({ id: activeInfo.value.id });
  siteWalletInfo.value = response ?? {};
}

function handleBindNoWallet() {
  if (siteWalletInfo.value.bindUrl) {
    window.open(siteWalletInfo.value.bindUrl);
  }
}

function createBindUserByNo() {
  createNoWalletUser({ id: activeInfo.value.id }).then(res => {
    window.open(res.buyUrl);
    getSiteWalletData();
  });
}

function handleSubmit() {
  const channelId = activeChannelId.value;
  const amount = Number(inputAmount.value);
  const submitAmount = orderAmount.value;

  if (!channelId) {
    return showCustomToast({ type: 'warning', message: $t("订单创建错误") });
  }

  if (!amount) {
    return showCustomToast({ type: 'fail', message: $t("请输入支付金额") });
  }

  if (!submitAmount) {
    return showCustomToast({ type: 'fail', message: $t("金额换算错误") });
  }

  if (isCryptoRecharge.value && !cryptoTransferAmount.value) {
    return showCustomToast({ type: 'fail', message: $t("金额换算错误") });
  }

  const orderPayload: Record<string, number> = { id: channelId, money: submitAmount };
  if (isCryptoRecharge.value) {
    orderPayload.cryptoAmount = cryptoTransferAmount.value;
  }

  isLoading.value = true;
  createOrder(orderPayload)
    .then(res => {
      const url = res?.url;
      if (!url) {
        return showCustomToast({ type: 'warning', message: $t("订单创建错误") });
      }
      // 站内支付跳转的模式内部跳转
      if (res.mode == 'inner') {
        emits('close');
        return bus.emit('showRechargeDetail', { id: res.orderId });
      }

      openUrlInNewWindow(url);
      emits('close');
      bus.emit('showRechargeDetail', { id: res.orderId });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

watch(
  () => props.listData,
  list => {
    if (!list.length) {
      activeGroupId.value = 0;
      activeChannelId.value = 0;
      resetAmountState();
      resetWalletState();
      return;
    }

    const hasActiveGroup = list.some(item => item.id == activeGroupId.value);
    if (!hasActiveGroup) {
      activeGroupId.value = list[0].id;
      activeChannelId.value = 0;
      resetAmountState();
      resetWalletState();
    }
  },
  { immediate: true }
);

watch(
  () => activeChildren.value,
  children => {
    if (!children.length) {
      if (activeChannelId.value !== 0) {
        activeChannelId.value = 0;
        resetAmountState();
        resetWalletState();
      }
      return;
    }

    const hasActiveChild = children.some(item => item.id == activeChannelId.value);
    if (!hasActiveChild) {
      activeChannelId.value = children[0].id;
      resetAmountState();
      resetWalletState();
    }
  },
  { immediate: true }
);

watch(
  () => [activeInfo.value.id, activeInfo.value.siteWallet],
  ([id, siteWallet]) => {
    if (id && siteWallet && !isGetSiteWallet.value) {
      getSiteWalletData();
    }
  },
  { immediate: true }
);

watch(
  () => [activeInfo.value.id, quickAmounts.value],
  () => {
    syncSelectedQuickAmount();
  },
  { immediate: true }
);

watch(
  () => inputAmount.value,
  () => {
    syncSelectedQuickAmount();
  }
);

watch(
  () => [payTypeMode.value, currentRate.value],
  () => {
    syncSelectedQuickAmount();
  }
);
</script>

<template>
  <div class="body-content">
    <div class="grid-box">
      <recharge-badge
        v-for="item in visibleWallets"
        :key="item.id"
        class="item"
        :class="{ 'active-item': activeGroupId == item.id }"
        :content="item.tip"
        @click="handleChangeActiveId(item)"
      >
        <div class="app-icon">
          <van-image width="100%" height="100%" :src="item.image">
            <template #error>.</template>
          </van-image>
        </div>
        <div class="label-container">
          <span class="label">{{ item.name }}</span>
        </div>
      </recharge-badge>
    </div>

    <div v-if="showGroupDownloadTip" class="download-app">
      <span class="inline-flex items-center text-[11px]">
        <svg-icon name="comm_icon_xz" class-name="text-[9px] mr-[5px]" />
        {{ activeGroup.download_tip }}
      </span>
    </div>

    <div v-if="props.listData.length > 6" class="fold">
      <span class="btn" @click="showAllWallets = !showAllWallets">
        <span class="text">{{ showAllWallets ? '收起' : '展开' }}</span>
        <span class="arrow" :class="{ 'arrow-show': showAllWallets }"></span>
      </span>
    </div>

    <div class="line" style="border-width: var(--lobby__px)"></div>

    <template v-if="showChildrenSection">
      <div class="grid-box">
        <recharge-badge
          v-for="item in visibleChildren"
          :key="item.id"
          class="item"
          :class="{ 'active-item': activeChannelId == item.id }"
          :content="item.tip"
          @click="handleChangeActiveChildrenId(item)"
        >
          <div class="label-container">
            <span class="label">{{ item.name }}</span>
          </div>
        </recharge-badge>
      </div>

      <div v-if="showChildDownloadTip" class="download-app">
        <span class="inline-flex items-center text-[11px]">
          <svg-icon name="comm_icon_xz" class-name="text-[9px] mr-[5px]" />
          {{ activeInfo.download_tip }}
        </span>
      </div>

      <div v-if="activeChildren.length > 6" class="fold">
        <span class="btn" @click="showAllChildren = !showAllChildren">
          <span class="text">{{ showAllChildren ? '收起' : '展开' }}</span>
          <span class="arrow" :class="{ 'arrow-show': showAllChildren }"></span>
        </span>
      </div>

      <div class="line" style="border-width: var(--lobby__px)"></div>
    </template>

    <template v-if="showBoundNoWallet">
      <div class="no-balance">
        <div class="noWallet-id">
          <img src="/siteadmin/skin/lobby_asset/icon_cz_no.avif" alt="" class="mr-[5px] w-[25px]" />
          <span>钱包账号：</span>
          <span class="id">{{ siteWalletInfo.qAccount }}</span>
          <span class="copy-id">
            <copy :text="String(siteWalletInfo.qAccount ?? '')" />
          </span>
        </div>
        <div class="bind-wallet">
          <span>NO钱包余额</span>
          <span class="balance">{{ (Number(siteWalletInfo.rmbBalance) ?? 0).toFixed(2) }}</span>
          <span class="refresh-icon" :class="{ animate__spin: isRefreshWallet }" @click="refreshSiteWallet">
            <svg-icon name="comm_icon_sx" />
          </span>
          <x-button type="primary" size="mini" class="buy-balance-btn" @click="clickToBuyBalance">购买余额</x-button>
        </div>
      </div>
    </template>

    <template v-if="showRechargeForm">
      <div class="title-box">
        <span>{{ payModeTitle }}</span>
        <div class="no-poster" v-html="activeGroup.tipRichText"></div>
      </div>

      <div class="grid-box quickly-list">
        <recharge-badge
          v-for="option in quickAmountOptions"
          :key="option.amount"
          class="item"
          :class="{ 'active-item': isQuickAmountActive(option.amount) }"
          @click="handleQuickAmountClick(option.amount)"
        >
          <div class="label-container">
            <span class="label">{{ option.displayAmount }}</span>
            <div v-if="giftRatio > 0" class="reward-box">
              <span class="reward">+{{ formatMoney(getQuickGiftAmount(option.amount)) }}</span>
            </div>
          </div>
        </recharge-badge>
      </div>

      <div class="form-input-box">
        <div class="input-box">
          <x-input v-model="inputAmount" class="input-input" :placeholder="inputPlaceholder">
            <template #prefix>
              <span class="" style="color: var(--skin__lead)">{{ inputPrefix }}</span>
            </template>
          </x-input>
          <div v-if="activeGroup.type == 2" class="change-pay-mode" @click="handleChangePayMode">
            <svg-icon name="comm_icon_qhhb" />
          </div>
        </div>
      </div>

      <div class="channel-exchange-rate" v-if="activeGroup.type == 2">
        <div class="left">
          <span class="label">汇率</span>
          <div>
            <span dir="ltr" class="rate">1 :{{ currentRate || '--' }}</span>
            <svg-icon name="comm_icon_retry" class-name="retry-icon" @click="app.refreshData()" />
          </div>
        </div>
        <div v-if="amountSummary" class="amount">
          {{ amountSummary.label }}
          <span dir="ltr">{{ amountSummary.value }}</span>
        </div>
      </div>

      <x-button @click="handleSubmit" class="button" type="primary" :loading="isLoading">{{ $t("立即存款") }}</x-button>
    </template>

    <template v-if="showBindActions">
      <div class="bind-container">
        <div class="bindTips">
          <p>{{ $t("已有账号，可登录绑定") }}</p>
          <p>{{ $t("首次使用，只需设置支付密码") }}</p>
        </div>
        <div class="content">
          <div class="bind">
            <x-button type="primary" plain @click="handleBindNoWallet">{{ $t("立即绑定") }}</x-button>
          </div>
          <div class="setting">
            <x-button type="primary" @click="createBindUserByNo">{{ $t("立即设置") }}</x-button>
          </div>
        </div>
        <div class="no-poster">
          <p>
            <span style="font-family: 'Segoe UI'">{{ $t("用NO钱包，赚积分，抽大奖，最高") }}</span>
            <span style="color: #e67e23">88888.88</span>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.body-content {
  padding: 18px 10px 0;
  height: 100%;
  overflow-y: scroll;
}
.grid-box {
  display: grid;
  gap: 11px;
  grid-template-columns: repeat(3, 1fr);
  .item {
    display: inline-flex;
    align-items: center;
    flex: 1;
    height: 37px;
    border: thin solid var(--skin__border);
    border-radius: 5px;
    position: relative;
    .app-icon {
      margin-right: 5px;
      margin-left: 5px;
      height: 27px;
      width: 27px;
    }
    .label-container {
      flex: 1;
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-direction: column;
      margin-right: 5px;
      .label {
        text-align: center;
        word-break: break-all;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  .active-item {
    border-color: var(--skin__filter_active);
    color: var(--skin__primary);
  }
}
.line {
  width: 100%;
  border-bottom: solid var(--skin__border);
  border-color: var(--skin__border) !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  margin-bottom: 10px;
  margin-top: 10px;
}
.download-app {
  margin: 10px 0 5px;
  color: var(--skin__primary);
}
.fold {
  text-align: center;
  color: var(--skin__primary);
  display: flex;
  justify-content: center;
  font-size: 12px;
  margin-top: 2.5px;
  .btn {
    display: flex;
    align-items: baseline;
    justify-content: center;
    .text {
      margin-right: 8px;
    }
    .arrow {
      display: inline-block;
      border-right: 2px solid var(--skin__primary);
      border-top: 2px solid var(--skin__primary);
      height: 8px;
      width: 8px;
      transform: rotate(-45deg) translateY(3px);
    }
    .arrow-show {
      transform: rotate(135deg) translateY(3px);
    }
  }
}
.title-box {
  display: flex;
  justify-content: space-between;
  position: relative;
  color: var(--skin__lead);
  margin-bottom: 10px;
  .no-poster {
    text-align: right;
    color: var(--skin__neutral_2);
    flex: 1;
    margin-left: 10px;
    font-size: 11px !important;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.quickly-list {
  margin-bottom: 10px;
  grid-template-columns: repeat(4, 1fr);
  .item {
    height: 39.5px;
    background: var(--skin__bg_1);
    border: 0.5px solid var(--skin__bg_1);
    display: flex;
    align-items: center;
    border-radius: 5px;
    position: relative;
    .label-container {
      color: var(--skin__lead);
      font-size: 13px;
      line-height: 23.5px;
      font-weight: 700;
      flex: 1;
      min-width: 0;
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-right: 0 !important;
      .reward-box {
        width: 100%;
        line-height: 16px;
        background: var(--skin__bg_2);
        border-radius: 0 0 5px 5px;
        text-align: center;
        vertical-align: top;
        .reward {
          display: inline-block;
          width: 100%;
          font-size: 11px;
          font-weight: 700;
          background: color-mix(in srgb, var(--skin__accent_3) 15%, transparent);
          color: var(--skin__accent_3);
          text-align: center;
          line-height: 16.5px;
          border-radius: 0 0 5px 5px;
          vertical-align: top;
        }
      }
    }
  }
  .active-item {
    border-color: var(--skin__primary);
  }
}

.form-input-box {
  width: 355px;
  display: flex;
  flex-direction: column;
  position: relative;
  .input-box {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    .change-pay-mode {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42.5px;
      height: 35px;
      margin-left: 10px;
      background-color: var(--skin__bg_2);
      border: thin solid var(--skin__neutral_3);
      border-radius: 5px;
      color: var(--skin__primary);
      font-size: 19px;
    }

    .input-input {
      :deep(.x-input__field) {
        font-size: 15px;
        font-weight: 700;
      }

      :deep(.x-input__field::placeholder) {
        font-size: 11px;
        font-weight: normal;
      }
    }
    :deep(.x-input--focused) {
      border-color: var(--skin__neutral_3) !important;
    }
  }
}
.button {
  --ui-button-text-color: white !important;
  --ui-button-border-color: transparent !important;
  width: 100%;
  margin-top: 10px;
  height: 35px;
}
.bind-container {
  text-align: center;
  .bindTips {
    display: flex;
    padding-bottom: 5px;

    p {
      font-size: 11px;
      color: var(--skin__neutral_2);
      flex: 1;
      text-align: center;
      margin: 0 5px;
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .bind {
      margin-right: 5px;
      flex: 1;
      button {
        width: 100%;
        color: var(--skin__primary);
      }
    }
    .setting {
      margin-left: 5px;
      flex: 1;
      button {
        width: 100%;
        color: var(--skin__text_primary);
        border-color: transparent !important;
      }
    }
  }
  .no-poster {
    color: var(--skin__lead);
    flex: 1;
    margin-left: 10px;
    text-align: center;
    font-size: 12px !important;

    p {
      margin: 0;
    }
  }
}
.no-balance {
  margin-bottom: 15px;
  .noWallet-id {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    color: var(--skin__lead);
    font-size: 12px;
    padding-bottom: 5px;
    > span {
      line-height: 12px;
      color: var(--skin__lead);
    }
    .id {
      color: var(--skin__neutral_2);
    }
    .copy-id {
      font-size: 15px;
      margin-left: 5px;
      line-height: 12px;
      color: var(--skin__primary);
      cursor: pointer;
    }
  }
  .bind-wallet {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    color: var(--skin__neutral_2);
    font-size: 12px;
    .balance {
      display: inline-flex;
      align-items: center;
      margin: 0 5px;
      color: var(--skin__primary);
      font-size: 16px;
    }
    .refresh-icon {
      vertical-align: middle;
      color: var(--skin__primary);
    }
    .animate__spin {
      animation: spin 0.3s linear infinite;
    }
    .buy-balance-btn {
      margin-left: 10px;
      height: 20px;
      width: auto;
      font-size: 9px;
      border-radius: 4px;
      padding: 0 5px;
      color: var(--skin__text_primary);
      background: var(--skin__primary);
      border: var(--lobby__px) solid var(--skin__primary);
    }
  }
}
.channel-exchange-rate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 0 2.5px;
  .left {
    display: flex;
    align-items: center;
    white-space: nowrap;
    font-size: 12px;
    .label {
      color: var(--skin__neutral_2);
      margin-right: 5px;
      line-height: 13px;
    }
  }
  > div {
    display: flex;
    align-items: center;
  }
  .rate {
    margin-right: 5px;
    line-height: 13px;
  }
  .retry-icon {
    vertical-align: middle;
    color: var(--skin__primary);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .amount {
    color: var(--skin__accent_3);
    font-weight: 700;
    text-align: right;
    font-size: 12px;
  }
}
</style>
