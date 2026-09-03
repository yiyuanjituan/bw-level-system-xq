<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromoteCommission } from "@/api/common";
import DateRangePicker from "@/components/Common/DateRangePicker.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import PromoteCommissionDirectDialog from "../components/PromoteCommissionDirectDialog.vue";
import type { DateRangeValue } from "@/components/Common/DateRangePicker.vue";
import type {
  PromoteCommissionRecord,
  PromoteCommissionResponse,
  PromoteInfo
} from "../types";

defineOptions({ name: "PromoteCommission" });

const props = defineProps<{ info?: PromoteInfo | null }>();

const DEFAULT_PAGE_SIZE = 20;
const today = dayjs();
const selectedTimeRange = ref<DateRangeValue>({
  mode: "all",
  label: "全部",
  startTime: today.subtract(89, "day").startOf("day").unix(),
  endTime: today.endOf("day").unix(),
  startDate: today.subtract(89, "day").format("YYYY-MM-DD"),
  endDate: today.format("YYYY-MM-DD")
});
const records = ref<PromoteCommissionRecord[]>([]);
const summary = ref<PromoteCommissionResponse["summary"] | null>(null);
const loading = ref(false);
const finished = ref(false);
const requestFailed = ref(false);
const footerCollapsed = ref(true);
const directDialogVisible = ref(false);
const selectedSettlementId = ref(0);
const nextCursorId = ref<number | null>(null);
const latestRequestId = ref(0);
const nowTimestamp = ref(Date.now());
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const settlementCycleName = computed(() => props.info?.config.settlementCycleName || "-");
const countdownParts = computed(() => {
  const settlementTimestamp = Number(props.info?.config.nextSettlementTimestamp) || 0;
  if (!settlementTimestamp) return { days: "--", clock: "" };

  const remainingSeconds = Math.max(Math.floor((settlementTimestamp - nowTimestamp.value) / 1000), 0);
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    days: `${days}天`,
    clock: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  };
});
const hasRecords = computed(() => records.value.length > 0);

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function formatSettlementDate(value: string) {
  const settlementDate = dayjs(value);
  return settlementDate.isValid() ? settlementDate.format("YYYY/MM/DD") : "-";
}

function getDirectMemberCount(record: PromoteCommissionRecord) {
  return Math.max(Math.trunc(Number(record.directMemberCount) || 0), 0);
}

function getOtherMemberCount(record: PromoteCommissionRecord) {
  return Math.max(Math.trunc(Number(record.otherMemberCount) || 0), 0);
}

function openDirectCommission(record: PromoteCommissionRecord) {
  selectedSettlementId.value = record.id;
  directDialogVisible.value = true;
}

function normalizeResponse(response: PromoteCommissionResponse | unknown): PromoteCommissionResponse {
  const source = (response as any)?.data ?? response ?? {};
  const rawList = Array.isArray((source as any).list) ? (source as any).list : [];
  const rawSummary = (source as any).summary ?? {};

  return {
    list: rawList.map((record: any) => ({
      id: Number(record?.id) || 0,
      settlementDate: String(record?.settlementDate || ""),
      subordinateCount: Math.max(Math.trunc(Number(record?.subordinateCount) || 0), 0),
      validSubordinateCount: Math.max(Math.trunc(Number(record?.validSubordinateCount) || 0), 0),
      directMemberCount: Math.max(Math.trunc(Number(record?.directMemberCount) || 0), 0),
      otherMemberCount: Math.max(Math.trunc(Number(record?.otherMemberCount) || 0), 0),
      performance: Number(record?.performance) || 0,
      directCommission: Number(record?.directCommission) || 0,
      otherCommission: Number(record?.otherCommission) || 0,
      commission: Number(record?.commission) || 0,
      receivedCommission: Number(record?.receivedCommission) || 0,
      status: ([1, 2, 3].includes(Number(record?.status)) ? Number(record.status) : 1) as 1 | 2 | 3,
      canReceive: Boolean(record?.canReceive),
      receiveTime: Number(record?.receiveTime) || 0
    })),
    summary: {
      commission: Number(rawSummary.commission) || 0,
      directCommission: Number(rawSummary.directCommission) || 0,
      otherCommission: Number(rawSummary.otherCommission) || 0
    },
    pageSize: Math.max(Math.trunc(Number((source as any).pageSize) || DEFAULT_PAGE_SIZE), 1),
    more: Boolean((source as any).more),
    nextCursorId: Number.isInteger(Number((source as any).nextCursorId))
      && Number((source as any).nextCursorId) > 0
      ? Number((source as any).nextCursorId)
      : null,
    startTime: Number((source as any).startTime) || 0,
    endTime: Number((source as any).endTime) || 0
  };
}

async function loadCommission(reset = false) {
  if (loading.value && !reset) return;

  if (reset) {
    records.value = [];
    summary.value = null;
    nextCursorId.value = null;
    finished.value = false;
    requestFailed.value = false;
  }

  const requestId = ++latestRequestId.value;
  loading.value = true;
  try {
    const response = normalizeResponse(await getPromoteCommission({
      size: DEFAULT_PAGE_SIZE,
      startTime: selectedTimeRange.value.startTime,
      endTime: selectedTimeRange.value.endTime,
      ...(nextCursorId.value ? { cursorId: nextCursorId.value } : {})
    }));
    if (requestId !== latestRequestId.value) return;

    records.value = reset ? response.list : [...records.value, ...response.list];
    summary.value = response.summary;
    nextCursorId.value = response.nextCursorId;
    requestFailed.value = false;
    finished.value = !response.more || !response.nextCursorId;
  } catch {
    if (requestId !== latestRequestId.value) return;

    requestFailed.value = true;
    finished.value = true;
    if (reset) {
      records.value = [];
      summary.value = null;
    }
  } finally {
    if (requestId === latestRequestId.value) loading.value = false;
  }
}

function handleRetry() {
  finished.value = false;
  void loadCommission(records.value.length === 0);
}

watch(
  [() => selectedTimeRange.value.startTime, () => selectedTimeRange.value.endTime],
  () => void loadCommission(true),
  { immediate: true }
);

onMounted(() => {
  countdownTimer = setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <div class="commission-page">
    <section class="settlement-summary">
      <div class="settlement-summary__content">
        <span class="settlement-summary__item">
          <label>结算周期</label>
          <span class="settlement-summary__value">{{ settlementCycleName }}</span>
        </span>
        <span class="settlement-summary__item">
          <label>距离下次结算</label>
          <span class="settlement-summary__countdown">
            <i>{{ countdownParts.days }}</i>
            <i v-if="countdownParts.clock">{{ countdownParts.clock }}</i>
          </span>
        </span>
      </div>
    </section>

    <section class="commission-layout">
      <div class="commission-tools">
        <date-range-picker v-model="selectedTimeRange" :quick-modes="['all', 'today', 'yesterday']" />
      </div>

      <div class="commission-list">
        <div v-if="loading && !hasRecords" class="commission-state"><ui-loading /></div>
        <ui-empty v-else-if="!hasRecords" :text="requestFailed ? '加载失败，请重试' : '暂无内容'">
          <template #text="{ text }">
            <span class="commission-empty-text">
              <span>{{ text }}</span>
              <button class="commission-retry" type="button" :aria-label="$t('重新加载')" @click="handleRetry">
                <svg-icon name="comm_icon_retry" />
              </button>
            </span>
          </template>
        </ui-empty>

        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          :immediate-check="false"
          @load="loadCommission(false)"
        >
          <template #loading><div class="commission-loading"><ui-loading /></div></template>
          <article v-for="record in records" :key="record.id" class="commission-record">
            <div class="commission-record__row">
              <span class="commission-record__column">
                <label>结算日</label>
                <span class="commission-record__value">{{ formatSettlementDate(record.settlementDate) }}</span>
              </span>
              <span class="commission-record__column">
                <label>总佣金</label>
                <span class="commission-record__value commission-record__value--highlight">{{ formatMoney(record.commission) }}</span>
              </span>
            </div>
            <div class="commission-record__row">
              <span class="commission-record__column">
                <label>直属佣金</label>
                <button
                  type="button"
                  class="commission-record__amount commission-record__amount--link"
                  :aria-label="`查看${formatMoney(record.directCommission)}直属佣金明细`"
                  @click="openDirectCommission(record)"
                >
                  <span class="commission-record__value commission-record__value--highlight">{{ formatMoney(record.directCommission) }}</span>
                  <span>({{ getDirectMemberCount(record) }})</span>
                </button>
              </span>
              <span class="commission-record__column">
                <label>其他佣金</label>
                <span class="commission-record__amount">
                  <span class="commission-record__value commission-record__value--highlight">{{ formatMoney(record.otherCommission) }}</span>
                  <span>({{ getOtherMemberCount(record) }})</span>
                </span>
              </span>
            </div>
          </article>
          <button v-if="requestFailed" class="commission-load-error" type="button" @click="handleRetry">
            {{ $t("加载失败，点击重试") }}
          </button>
        </van-list>
      </div>
    </section>

    <div v-if="summary" class="commission-footer" :class="{ 'commission-footer--collapsed': footerCollapsed }">
      <button
        class="commission-footer__toggle"
        type="button"
        :aria-expanded="!footerCollapsed"
        @click="footerCollapsed = !footerCollapsed"
      >
        <svg-icon name="promote-collapse-arrow" class="commission-footer__arrow" />
        {{ footerCollapsed ? "展示" : "收起" }}
      </button>
      <div class="commission-footer__content">
        <span class="commission-footer__item">
          <label>总佣金</label>
          <span>{{ formatMoney(summary.commission) }}</span>
        </span>
        <span class="commission-footer__item">
          <label>直属佣金</label>
          <span>{{ formatMoney(summary.directCommission) }}</span>
        </span>
        <span class="commission-footer__item">
          <label>其他佣金</label>
          <span>{{ formatMoney(summary.otherCommission) }}</span>
        </span>
      </div>
    </div>

    <promote-commission-direct-dialog
      v-model:show="directDialogVisible"
      :settlement-id="selectedSettlementId"
    />
  </div>
</template>

<style scoped lang="less">
.commission-page {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.settlement-summary {
  flex-shrink: 0;
  padding: 8px 10px;
  background: var(--skin__bg_2);
  font-size: 10px;
}

.settlement-summary__content {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.settlement-summary__item {
  display: flex;
  min-width: 145px;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.6;

  label {
    margin-right: 5px;
    color: var(--skin__neutral_2);
  }
}

.settlement-summary__value,
.settlement-summary__countdown {
  color: var(--skin__lead);
}

.settlement-summary__countdown {
  display: inline-flex;
  gap: 3px;

  i {
    font-style: normal;
    white-space: nowrap;
  }
}

.commission-layout {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;
}

.commission-tools {
  display: flex;
  width: 100%;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.commission-list {
  min-height: 0;
  flex: 1;
  padding-bottom: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.commission-state,
.commission-loading {
  display: flex;
  width: 100%;
  min-height: 80px;
  align-items: center;
  justify-content: center;
}

.commission-state { height: 100%; }

.commission-empty-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.commission-retry {
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;

  :deep(.svg-icon) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

.commission-record {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;

  &:nth-child(odd) { background: var(--skin__bg_2); }
}

.commission-record__row {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:not(:last-child) { margin-bottom: 5px; }
}

.commission-record__column {
  display: flex;
  width: 50%;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  color: var(--skin__neutral_2);

  label { margin-right: 5px; }
}

.commission-record__value {
  margin-right: 2px;
  color: var(--skin__lead);
  word-break: break-all;
}

.commission-record__value--highlight { color: var(--skin__accent_3); }

.commission-record__amount {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__lead);
}

.commission-record__amount--link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__lead);
  cursor: pointer;

  .commission-record__value {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.commission-load-error {
  display: block;
  width: 100%;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  font-size: 11px;
  text-align: center;
}

.commission-footer {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  min-height: 20px;
  box-sizing: border-box;
  padding: 10px 10px calc(10px + var(--skin__safe-area-inset-bottom, 0px));
  background: var(--skin__bg_2);
  box-shadow: 0 3px 9px rgba(var(--skin__bg-shadow__custom), 0.06);
  color: var(--skin__lead);
  font-size: 11px;
  line-height: 11px;
  transition: transform 0.3s;
}

.commission-footer--collapsed {
  transform: translateY(100%);

  .commission-footer__arrow { transform: rotate(180deg); }
}

.commission-footer__toggle {
  position: absolute;
  top: -18px;
  left: 50%;
  display: flex;
  height: 18px;
  align-items: center;
  padding: 0 8px;
  border: 0;
  border-radius: 7px 7px 0 0;
  background: var(--skin__bg_2);
  color: var(--skin__primary);
  font-size: 10px;
  line-height: 18px;
  cursor: pointer;
  transform: translateX(-50%);
}

.commission-footer__arrow {
  width: 10px;
  height: 10px;
  margin-right: 5px;
  fill: currentColor;
  transition: transform 0.3s;
}

.commission-footer__content {
  display: flex;
  width: 100%;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.commission-footer__item {
  display: flex;
  width: 50%;
  align-items: flex-start;
  margin-bottom: 5px;

  label,
  > span {
    flex: 1;
    margin-right: 5px;
  }

  label {
    color: var(--skin__neutral_2);
    word-wrap: break-word;
  }

  &:last-child { margin-bottom: 0; }
}

[dir="rtl"] {
  .settlement-summary__item label,
  .commission-record__column label,
  .commission-record__value,
  .commission-footer__arrow,
  .commission-footer__item label,
  .commission-footer__item > span {
    margin-right: 0;
    margin-left: 5px;
  }

  .commission-footer {
    right: 0;
    left: auto;
  }
}
</style>
