<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { service } from "@/api/service";
import Copy from "@/components/Common/Copy.vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange, SelectOption as ReportSelectOption } from "@/components/HomeReport/types";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";

type WithdrawStatusOption = ReportSelectOption & {
  value: string | number;
};

interface WithdrawRecordItem {
  [key: string]: any;
}

interface WithdrawRecordState {
  list: WithdrawRecordItem[];
  totalAmount: number;
}

const FALLBACK_ICON = "/siteadmin/pay-icon/icon_wallet_normal.png";

const statusOptions: WithdrawStatusOption[] = [
  { label: "全部状态", value: 0 },
  { label: "审核中", value: 1 },
  { label: "出款中", value: 2 },
  { label: "提现成功", value: 3 },
  { label: "提现拒绝", value: 4 }
];

const timeRange = ref<AccountTimeRange>(createTodayRange());
const statusFilterValue = ref<string | number>(statusOptions[0]?.value ?? 0);
const isLoading = ref(false);
const recordState = ref<WithdrawRecordState>({
  list: [],
  totalAmount: 0
});

let latestRequestId = 0;

const hasListData = computed(() => recordState.value.list.length > 0);
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无内容";
  }

  return `${timeRange.value.label}暂无内容`;
});

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

function createQueryParams() {
  return {
    page: 1,
    limit: 20,
    startTime: timeRange.value.startTime,
    endTime: timeRange.value.endTime,
    status: statusFilterValue.value
  };
}

function toNumber(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: unknown) {
  return `\uFFE5${toNumber(value).toFixed(2)}`;
}

function parseList(source: any) {
  const list = source?.list ?? source?.records ?? source?.rows ?? source?.data?.list;
  return Array.isArray(list) ? list : [];
}

function parseTotalAmount(source: any) {
  return toNumber(
    source?.totalWithdraw ??
      source?.totalAmount ??
      source?.totalMoney ??
      source?.withdrawMoney ??
      source?.sumAmount ??
      source?.amount
  );
}

function normalizeResponse(response: any): WithdrawRecordState {
  const source = response?.data ?? response ?? {};

  return {
    list: parseList(source),
    totalAmount: parseTotalAmount(source)
  };
}

function formatRecordTime(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "number") {
    const parsed = String(value).length <= 10 ? dayjs.unix(value) : dayjs(value);
    return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm:ss") : "--";
  }

  if (typeof value === "string" || value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm:ss") : "--";
  }

  return "--";
}

function getRecordKey(item: WithdrawRecordItem, index: number) {
  return item?.id ?? item?.orderNo ?? item?.order_sn ?? item?.billNo ?? item?.trade_no ?? index;
}

function getRecordIcon(item: WithdrawRecordItem) {
  return item?.bank_icon ?? item?.wallet_icon ?? item?.icon ?? FALLBACK_ICON;
}

function getRecordTitle(item: WithdrawRecordItem) {
  return item?.title ?? item?.typeName ?? item?.type_name ?? item?.bank_name ?? "提现到三方钱包";
}

function getRecordOrderNo(item: WithdrawRecordItem) {
  return String(item?.orderNo ?? item?.order_sn ?? item?.trade_no ?? item?.billNo ?? item?.sn ?? "");
}

function getRecordRemark(item: WithdrawRecordItem) {
  return String(item?.remark ?? item?.memo ?? item?.desc ?? item?.description ?? "");
}

function getRecordAmount(item: WithdrawRecordItem) {
  const amount = toNumber(item?.amount ?? item?.money ?? item?.withdraw_money ?? item?.apply_amount);
  return `-${formatAmount(amount).replace("-", "")}`;
}

function getRecordTime(item: WithdrawRecordItem) {
  return formatRecordTime(item?.createTime ?? item?.create_time ?? item?.created_at ?? item?.add_time);
}

function getStatusText(item: WithdrawRecordItem) {
  if (item?.statusName || item?.status_name || item?.statusText) {
    return String(item.statusName ?? item.status_name ?? item.statusText);
  }

  const status = Number(item?.status);
  if (status === 1) return "审核中";
  if (status === 2) return "出款中";
  if (status === 3) return "提现成功";
  if (status === 4) return "提现拒绝";
  if (status === 5) return "提现取消";
  return "处理中";
}

function getStatusClass(item: WithdrawRecordItem) {
  const text = getStatusText(item);

  if (text.includes("成功")) return "record-card__status--success";
  if (text.includes("取消")) return "record-card__status--cancel";
  if (text.includes("拒绝") || text.includes("失败")) return "record-card__status--danger";
  return "record-card__status--pending";
}

function handleSeeMore() {
  const yesterday = dayjs().subtract(1, "day");

  timeRange.value = {
    mode: "yesterday",
    label: "昨日",
    startTime: yesterday.startOf("day").unix(),
    endTime: yesterday.endOf("day").unix(),
    startDate: yesterday.format("YYYY-MM-DD"),
    endDate: yesterday.format("YYYY-MM-DD")
  };
}

async function init() {
  const requestId = ++latestRequestId;
  isLoading.value = true;

  try {
    const response = await service.base.withdraw.records(createQueryParams());

    if (requestId === latestRequestId) {
      recordState.value = normalizeResponse(response);
    }
  } catch (_error) {
    if (requestId === latestRequestId) {
      recordState.value = {
        list: [],
        totalAmount: 0
      };
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
}

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, statusFilterValue], () => {
  void init();
});

onMounted(() => {
  void init();
});
</script>

<template>
  <div class="withdraw-record">
    <section class="toolbar">
      <div class="toolbar__filters">
        <AccountTimeFilter v-model="timeRange" />

        <div class="filter-select">
          <x-select
            v-model="statusFilterValue"
            :options="statusOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>
      </div>

      <div class="toolbar__summary">
        <div class="toolbar__summary-label">累计提现</div>
        <div class="toolbar__summary-value">
          <span>{{ formatAmount(recordState.totalAmount) }}</span>
          <svg-icon
            name="comm_icon_retry"
            class-name="toolbar__summary-refresh"
            :class="{ 'toolbar__summary-refresh--spin': isLoading }"
            @click="init"
          />
        </div>
      </div>
    </section>

    <section class="content-area">
      <div v-if="isLoading && !hasListData" class="content-state">
        <ui-loading />
      </div>

      <div v-else-if="hasListData" class="record-list">
        <div v-for="(item, index) in recordState.list" :key="getRecordKey(item, index)" class="record-card">
          <div class="record-card__left">
            <div class="record-card__icon-box">
              <img :src="getRecordIcon(item)" alt="." class="record-card__icon" />
            </div>

            <div class="record-card__content">
              <div class="record-card__top">
                <div class="record-card__title">{{ getRecordTitle(item) }}</div>
                <div class="record-card__amount">{{ getRecordAmount(item) }}</div>
              </div>

              <div class="record-card__meta">
                <span>{{ getRecordTime(item) }}</span>
                <template v-if="getRecordOrderNo(item)">
                  <span>{{ getRecordOrderNo(item) }}</span>
                  <Copy :text="getRecordOrderNo(item)" class-name="record-card__copy" />
                </template>
              </div>

              <div v-if="getRecordRemark(item)" class="record-card__remark">
                {{ getRecordRemark(item) }}
              </div>
            </div>
          </div>

          <div class="record-card__right">
            <div class="record-card__status" :class="getStatusClass(item)">
              {{ getStatusText(item) }}
            </div>
            <svg-icon name="comm_icon_fh" class-name="record-card__arrow rotate-[180deg]" />
          </div>
        </div>
      </div>

      <ui-empty v-else>
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
    </section>
  </div>
</template>

<style scoped lang="less">
.withdraw-record {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
}

.toolbar__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-select {
  width: 83px;
  flex-shrink: 0;
}

.filter-select :deep(.x-select) {
  height: 25px;
  padding: 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 14px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2, var(--skin__lead));
}

.filter-select :deep(.x-select--focused) {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
}

.filter-select :deep(.x-select__wrap) {
  line-height: 25px;
}

.filter-select :deep(.x-select__label),
.filter-select :deep(.x-select__placeholder) {
  font-size: 10px;
  color: var(--skin__neutral_2, var(--skin__lead));
}

.filter-select :deep(.x-select__suffix) {
  margin-left: 6px;
  font-size: 10px;
}

.toolbar__summary {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-top: 1px;
}

.toolbar__summary-label {
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 1;
}

.toolbar__summary-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.toolbar__summary-refresh {
  color: var(--skin__primary);
  font-size: 13px;
}

.toolbar__summary-refresh--spin {
  animation: withdraw-record-spin 0.7s linear infinite;
}

@keyframes withdraw-record-spin {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
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
  padding: 0 10px 12px;
}

.record-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
}

.record-card + .record-card {
  margin-top: 10px;
}

.record-card__left {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.record-card__icon-box {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: var(--skin__bg_1);
  border: var(--lobby__px) solid var(--skin__border);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-card__icon {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.record-card__content {
  min-width: 0;
  flex: 1;
}

.record-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.record-card__title {
  min-width: 0;
  flex: 1;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-card__amount {
  flex-shrink: 0;
  color: var(--skin__lead);
  font-size: 13px;
  line-height: 1.2;
  font-weight: 700;
}

.record-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
  color: var(--skin__neutral_2);
  font-size: 10px;
  line-height: 1.4;
}

.record-card__meta :deep(.copy-icon) {
  line-height: 1;
}

.record-card__copy {
  color: var(--skin__primary);
  font-size: 12px;
}

.record-card__remark {
  margin-top: 4px;
  color: var(--skin__neutral_1);
  font-size: 10px;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-card__right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
}

.record-card__status {
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
}

.record-card__status--success {
  color: var(--skin__accent_1);
}

.record-card__status--danger {
  color: var(--skin__accent_2);
}

.record-card__status--cancel {
  color: var(--skin__neutral_1);
}

.record-card__status--pending {
  color: var(--skin__primary);
}

.record-card__arrow {
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.empty-state__text {
  color: var(--skin__neutral_2);
  font-size: 13px;
  line-height: 1.5;
}

.empty-state__link {
  color: var(--skin__primary);
}

.content-area :deep(.empty-box) {
  padding-bottom: 70px;
}
</style>
