<script setup lang="ts">
import { $t } from "@/locales";
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import HomeReportSummaryBar from "@/components/HomeReport/SummaryBar.vue";
import { showCustomToast } from "@/hooks/useCommon";
import type { AccountTimeRange, ReportCurrent, SelectOption, SummaryItem } from "@/components/HomeReport/types";
import useAuthStore from "@/store/modules/user";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import { service } from "@/api/service";
import router from "@/router";
import { useStorage } from "@vueuse/core";

const emit = defineEmits<{
  (event: "refresh-balance"): void;
  (event: "switch-report", value: ReportCurrent): void;
}>();

type AccountFilterOption = SelectOption & {
  value: number | string;
};

type AccountListItem = Record<string, any>;

interface AccountPageData {
  page: number;
  limit: number;
  total: number;
  list: AccountListItem[];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const auth = useAuthStore();
const isWalletLoading = ref(false);
const isListLoading = ref(false);
let latestRequestId = 0;

const detailData = useStorage("money-detail-data", {});
const categoryOptions: AccountFilterOption[] = [
  { label: "账变大类", value: 0 },
  { label: "资金切换", value: 1 },
  { label: "会员充值", value: 2 },
  { label: "会员提现", value: 3 },
  { label: "银商结算", value: 4 },
  { label: "资金修正", value: 5 },
  { label: "活动", value: 6 },
  { label: "返水", value: 7 },
  { label: "返佣", value: 8 },
  { label: "利息宝", value: 9 },
  { label: "任务", value: 10 },
  { label: "VIP奖励", value: 11 },
  { label: "充值优惠", value: 12 },
  { label: "奖励", value: 13 },
  { label: "担保理赔", value: 14 },
  { label: "代理转账", value: 15 },
  { label: "信用借款", value: 16 }
];

const detailOptions: AccountFilterOption[] = [
  { label: "小类明细", value: "" }
  // { label: "人工加款", value: "人工加款" },
  // { label: "活动派发", value: "活动派发" },
  // { label: "提现退回", value: "提现退回" }
];

const summaryItems: SummaryItem[] = [
  { label: "累计充值", value: "￥0.00", color: "success" },
  { label: "累计提现", value: "￥0.00", color: "danger" },
  { label: "累计领取", value: "￥0.00", color: "warn" }
];

function createTodayRange(): AccountTimeRange {
  const today = dayjs().format("YYYY-MM-DD");

  return {
    mode: "today",
    label: "今日",
    startTime: dayjs(today).startOf("day").unix(),
    endTime: dayjs(today).endOf("day").unix(),
    startDate: today,
    endDate: today
  };
}

function createDefaultPageData(): AccountPageData {
  return {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    list: []
  };
}

const timeRange = ref<AccountTimeRange>(createTodayRange());
const categoryFilterValue = ref<number | string>(categoryOptions[0]?.value ?? 0);
const detailFilterValue = ref<number | string>(detailOptions[0]?.value ?? "");
const pageData = ref<AccountPageData>(createDefaultPageData());

const hasListData = computed(() => pageData.value.list.length > 0);
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无记录";
  }

  return `${timeRange.value.label}暂无记录`;
});

function formatMoney(value: number) {
  return Number(value || 0).toFixed(2);
}

function normalizePageData(response: any): AccountPageData {
  const source = response?.data ?? response ?? {};

  return {
    page: Math.max(Number(source?.page) || DEFAULT_PAGE, 1),
    limit: Math.max(Number(source?.limit) || DEFAULT_LIMIT, 1),
    total: Math.max(Number(source?.total) || 0, 0),
    list: Array.isArray(source?.list) ? source.list : []
  };
}

function createQueryParams() {
  return {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    mode: Number(categoryFilterValue.value) || 0,
    title: String(detailFilterValue.value ?? ""),
    startTime: timeRange.value.startTime,
    endTime: timeRange.value.endTime
  };
}

function getRecordKey(item: AccountListItem, index: number) {
  return item?.id ?? item?.orderNo ?? item?.billNo ?? item?.createTime ?? index;
}

function handleSeeMore() {
  timeRange.value = {
    mode: "yesterday",
    label: "昨日",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix(),
    startDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    endDate: dayjs().subtract(1, "day").format("YYYY-MM-DD")
  };
}

function handleRefreshBalance() {
  if (isWalletLoading.value) {
    return;
  }

  isWalletLoading.value = true;

  auth
    .updateInfo()
    .then(() => {
      showCustomToast({ type: "success", message: $t("余额刷新成功") });
    })
    .finally(() => {
      isWalletLoading.value = false;
    });
}

function handleRetrieveBalance() {
  emit("switch-report", "4");
}

async function init() {
  const requestId = ++latestRequestId;
  isListLoading.value = true;

  try {
    const response = await service.v1.user.accountPageList(createQueryParams());
    if (requestId === latestRequestId) {
      pageData.value = normalizePageData(response);
    }
  } finally {
    if (requestId === latestRequestId) {
      isListLoading.value = false;
    }
  }
}

function handleToAccountDetail(record: any) {
  detailData.value = record;
  router.push(`/home/account-detail?orderNo=${record.order_sn}&id=${record.id}`);
}

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, categoryFilterValue, detailFilterValue], () => {
  void init();
});

onMounted(() => {
  void init();
});
</script>

<template>
  <div class="account-tab">
    <section class="balance-card">
      <div class="balance-card__top">
        <div class="balance-card__info">
          <span class="balance-card__label">当前余额</span>
          <span class="balance-card__amount">{{ formatMoney(Number(auth.user?.money)) }}</span>
          <svg-icon
            name="comm_icon_sx"
            class-name="balance-card__refresh"
            :class="{ animate__spin: isWalletLoading }"
            @click="handleRefreshBalance"
          />
        </div>
        <button class="balance-card__action" type="button" @click="handleRetrieveBalance">
          <span>找回余额</span>
          <svg-icon name="arrow-back" class-name="balance-card__action-arrow" />
        </button>
      </div>
      <div class="balance-card__tip">若进出游戏时余额丢失，可通过找回余额自助恢复。</div>
    </section>

    <section class="filter-row">
      <AccountTimeFilter v-model="timeRange" />

      <div class="filter-select">
        <x-select
          v-model="categoryFilterValue"
          :options="categoryOptions"
          value-key="value"
          placement="bottom"
          fit-option-width
        />
      </div>

      <div class="filter-select">
        <x-select v-model="detailFilterValue" :options="detailOptions" value-key="value" placement="bottom" />
      </div>
    </section>

    <section class="content-area">
      <div v-if="isListLoading && !hasListData" class="content-state">
        <ui-loading />
      </div>

      <ui-empty v-else-if="!hasListData">
        <template #text>
          <div class="empty-state__text">
            <span>{{ emptyStateText }}</span>
            <template v-if="timeRange.mode === 'today'">
              <span>，可</span>
              <span class="empty-state__link" @click="handleSeeMore">查看更多</span>
            </template>
          </div>
        </template>
      </ui-empty>

      <div v-else class="record-list">
        <div
          v-for="(item, index) in pageData.list"
          :key="getRecordKey(item, index)"
          class="record-card"
          @click="handleToAccountDetail(item)"
        >
          <div class="main">
            <div class="light">
              <div class="left-title">
                <span class="text">
                  {{ categoryOptions.find(v => v.value == item.mode)?.label }}
                </span>
                <span class="type-name"> ({{ item.title }}) </span>
              </div>
              <div>
                {{ dayjs(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}
              </div>
            </div>
            <div class="light all-right">
              <div class="mb-[5px] heigh-[14px] wallet-text">
                {{ item.money }}
              </div>
              <div class="h-[17px] wallet-type-text">余额钱包</div>
            </div>
          </div>
          <svg-icon
            name="comm_icon_fh"
            class-name="rotate-[180deg] text-[13px] ml-[10px]"
            style="color: var(--skin__neutral_2)"
          />

          <!--          <div class="record-card__top">-->
          <!--            <div class="record-card__title">{{ getRecordTitle(item) }}</div>-->
          <!--            <div class="record-card__amount" :class="getRecordAmountClass(item)">-->
          <!--              {{ getRecordAmountText(item) }}-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="record-card__time">{{ getRecordTime(item) }}</div>-->

          <!--          <div class="record-card__bottom">-->
          <!--            <div class="record-card__remark">{{ getRecordRemark(item) }}</div>-->
          <!--            <div class="record-card__status">{{ getRecordStatus(item) }}</div>-->
          <!--          </div>-->
        </div>
      </div>
    </section>

    <HomeReportSummaryBar :items="summaryItems" />
  </div>
</template>

<style scoped lang="less">
.account-tab {
  height: 100%;
  display: flex;
  flex-direction: column;

  .balance-card {
    margin: 10px 10px 0;
    padding: 10px;
    background: #191919;
    border-radius: 5px;
    box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.16);
  }

  .balance-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .balance-card__info {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .balance-card__label {
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 12px;
    white-space: nowrap;
  }

  .balance-card__amount {
    margin: 0 5px;
    color: #dfbe5b;
    font-size: 12px;
    line-height: 1;
  }

  .balance-card__refresh {
    color: #dfbe5b;
    font-size: 13px;
  }

  .animate__spin {
    animation: account-tab-spin 0.3s linear infinite;
  }

  @keyframes account-tab-spin {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .balance-card__action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #dfbe5b;
    font-size: 12px;
    white-space: nowrap;
  }

  .balance-card__action-arrow {
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 10px;
    transform: rotate(180deg);
  }

  .balance-card__tip {
    margin-top: 7px;
    color: #6f6f6f;
    font-size: 11px;
    line-height: 1.35;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
  }

  .filter-select {
    width: 81px;
    flex-shrink: 0;
  }

  .filter-select :deep(.x-select) {
    height: 25px;
    padding: 0 10px;
    border: 1px solid var(--skin__neutral_3);
    border-radius: 14px;
    background: #191919;
    color: var(--skin__neutral_2, var(--skin__lead));
  }

  .filter-select :deep(.x-select--focused) {
    border-color: #dfbe5b;
    color: #dfbe5b;
  }

  .filter-select :deep(.x-select__wrap) {
    line-height: 25px;
  }

  .filter-select :deep(.x-select__label),
  .filter-select :deep(.x-select__placeholder) {
    font-size: 10px;
    color: inherit;
  }

  .filter-select :deep(.x-select__suffix) {
    margin-left: 6px;
    font-size: 10px;
  }

  .content-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .content-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .record-list {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0 10px 10px;
  }

  .record-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7.5px 10px;
    font-size: 10px;
    border-radius: 7px;
    color: var(--skin__neutral_2);
    min-height: 55px;
    &:nth-child(odd) {
      background: var(--skin__bg_2);
    }
    .main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .light {
        color: var(--skin__neutral_2);
        > div {
          line-height: 1;
        }
        .left-title {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          max-width: 210px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: 15px;
          .text {
            color: var(--skin__lead);
            font-weight: 700;
            font-size: 11px;
          }
          .type-name {
            margin-left: 5px;
            vertical-align: middle;
            color: var(--skin__lead);
          }
        }
      }
      .all-right {
        text-align: right;
        color: var(--skin__neutral_2);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .wallet-text {
          font-size: 12px;
          color: var(--skin__lead);
          flex: none;
        }
        .wallet-type-text {
          display: inline-flex;
          align-items: center;
          max-width: 225px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex: none;
          font-size: 10px;
        }
      }
    }
  }

  .record-card__top,
  .record-card__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .record-card__title,
  .record-card__remark {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .record-card__title {
    color: #ffffff;
    font-size: 12px;
    line-height: 1.4;
  }

  .record-card__amount {
    flex-shrink: 0;
    color: #dfbe5b;
    font-size: 12px;
    line-height: 1.4;
  }

  .record-card__amount--success {
    color: #1fe11f;
  }

  .record-card__amount--danger {
    color: #ff5b5b;
  }

  .record-card__time {
    margin-top: 6px;
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 10px;
    line-height: 1.4;
  }

  .record-card__bottom {
    margin-top: 8px;
    align-items: flex-start;
  }

  .record-card__remark,
  .record-card__status {
    color: #6f6f6f;
    font-size: 10px;
    line-height: 1.4;
  }

  .record-card__status {
    flex-shrink: 0;
    text-align: right;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 20px 72px;
    color: var(--skin__neutral_2, var(--skin__lead));
  }

  .empty-state__graphic {
    position: relative;
    width: 110px;
    height: 110px;
    margin-bottom: 16px;
  }

  .empty-state__disc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0.08) 58%,
      rgba(255, 255, 255, 0.04)
    );
  }

  .empty-state__box {
    position: absolute;
    width: 36px;
    height: 24px;
    border-radius: 4px;
    background: linear-gradient(180deg, #fefefe 0%, #dde2eb 100%);
    box-shadow: 0 8px 14px rgba(136, 145, 165, 0.16);
  }

  .empty-state__box::before {
    content: "";
    position: absolute;
    left: 4px;
    right: 4px;
    top: -7px;
    height: 10px;
    background: linear-gradient(180deg, #eef2f8 0%, #d6dce7 100%);
    clip-path: polygon(0 100%, 50% 0, 100% 100%);
  }

  .empty-state__box--top {
    left: 37px;
    top: 29px;
    transform: rotate(8deg);
  }

  .empty-state__box--left {
    left: 20px;
    top: 44px;
    transform: rotate(-20deg);
  }

  .empty-state__box--right {
    right: 18px;
    top: 45px;
    transform: rotate(22deg);
  }

  .empty-state__text {
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 13px;
    line-height: 1.5;
  }

  .empty-state__link {
    color: #dfbe5b;
  }
}
</style>
