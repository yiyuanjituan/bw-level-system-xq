<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromotePerformance } from "@/api/common";
import DateRangePicker from "@/components/Common/DateRangePicker.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import PromotePerformanceDirectDialog from "../components/PromotePerformanceDirectDialog.vue";
import type { DateRangeValue } from "@/components/Common/DateRangePicker.vue";
import type {
  PromotePerformanceRecord,
  PromotePerformanceResponse
} from "../types";

defineOptions({
  name: "PromotePerformance"
});

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
const records = ref<PromotePerformanceRecord[]>([]);
const summary = ref<PromotePerformanceResponse["summary"] | null>(null);
const loading = ref(false);
const finished = ref(false);
const requestFailed = ref(false);
const footerCollapsed = ref(true);
const nextCursorId = ref<number | null>(null);
const directDialogVisible = ref(false);
const selectedSettlementId = ref(0);
let latestRequestId = 0;

const hasRecords = computed(() => records.value.length > 0);

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function formatOptionalMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount !== 0 ? amount.toFixed(2) : "-";
}

function formatStatisticDate(value: string) {
  const statisticDate = dayjs(value);
  return statisticDate.isValid() ? statisticDate.format("YYYY/MM/DD") : "-";
}

function normalizeResponse(response: PromotePerformanceResponse | unknown): PromotePerformanceResponse {
  const source = (response as any)?.data ?? response ?? {};
  const rawList = Array.isArray((source as any).list) ? (source as any).list : [];
  const rawSummary = (source as any).summary ?? {};

  return {
    list: rawList.map((record: any) => ({
      id: Number(record?.id) || 0,
      statisticDate: String(record?.statisticDate || ""),
      totalPerformance: Number(record?.totalPerformance) || 0,
      directPerformance: Number(record?.directPerformance) || 0,
      otherPerformance: Number(record?.otherPerformance) || 0,
      totalContribute: Number(record?.totalContribute) || 0,
      directContribute: Number(record?.directContribute) || 0,
      otherContribute: Number(record?.otherContribute) || 0
    })),
    summary: {
      totalPerformance: Number(rawSummary.totalPerformance) || 0,
      directPerformance: Number(rawSummary.directPerformance) || 0,
      otherPerformance: Number(rawSummary.otherPerformance) || 0
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

async function loadPerformance(reset = false) {
  if (loading.value && !reset) return;

  if (reset) {
    records.value = [];
    summary.value = null;
    nextCursorId.value = null;
    finished.value = false;
    requestFailed.value = false;
  }

  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const response = normalizeResponse(await getPromotePerformance({
      size: DEFAULT_PAGE_SIZE,
      startTime: selectedTimeRange.value.startTime,
      endTime: selectedTimeRange.value.endTime,
      ...(nextCursorId.value ? { cursorId: nextCursorId.value } : {})
    }));
    if (requestId !== latestRequestId) return;

    records.value = reset ? response.list : [...records.value, ...response.list];
    summary.value = response.summary;
    nextCursorId.value = response.nextCursorId;
    requestFailed.value = false;
    finished.value = !response.more || !response.nextCursorId;
  } catch {
    if (requestId !== latestRequestId) return;

    requestFailed.value = true;
    finished.value = true;
    if (reset) {
      records.value = [];
      summary.value = null;
    }
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

function handleRetry() {
  finished.value = false;
  void loadPerformance(records.value.length === 0);
}

function openDirectPerformance(record: PromotePerformanceRecord) {
  if (!record.id) return;

  selectedSettlementId.value = record.id;
  directDialogVisible.value = true;
}

watch(
  [() => selectedTimeRange.value.startTime, () => selectedTimeRange.value.endTime],
  () => void loadPerformance(true),
  { immediate: true }
);
</script>

<template>
  <div class="performance-page">
    <div class="performance-tools">
      <date-range-picker v-model="selectedTimeRange" :quick-modes="['all', 'today', 'yesterday']" />
    </div>

    <div class="performance-list">
      <div v-if="loading && !hasRecords" class="performance-state"><ui-loading /></div>
      <ui-empty v-else-if="!hasRecords" :text="requestFailed ? '加载失败，请重试' : '暂无内容'">
        <template #text="{ text }">
          <span class="performance-empty-text">
            <span>{{ text }}</span>
            <button
              class="performance-retry"
              type="button"
              :aria-label="$t('重新加载')"
              @click="handleRetry"
            >
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
        @load="loadPerformance(false)"
      >
        <template #loading><div class="performance-loading"><ui-loading /></div></template>
        <article v-for="record in records" :key="record.id" class="performance-record">
          <div class="performance-record__row">
            <span class="performance-record__column">
              <label>结算日期</label>
              <span class="performance-record__value">{{ formatStatisticDate(record.statisticDate) }}</span>
            </span>
            <span class="performance-record__column">
              <label>总业绩</label>
              <span class="performance-record__value">{{ formatMoney(record.totalPerformance) }}</span>
            </span>
          </div>
          <div class="performance-record__row">
            <span class="performance-record__column">
              <label>直属业绩</label>
              <button
                class="performance-record__value performance-record__value--button"
                :class="{ 'performance-record__value--link': Boolean(record.id) }"
                type="button"
                :disabled="!record.id"
                :aria-label="`查看${formatMoney(record.directPerformance)}直属业绩明细`"
                @click="openDirectPerformance(record)"
              >{{ formatMoney(record.directPerformance) }}</button>
            </span>
            <span class="performance-record__column">
              <label>其他业绩</label>
              <span class="performance-record__value" :class="{ 'performance-record__value--empty': !record.otherPerformance }">
                {{ formatOptionalMoney(record.otherPerformance) }}
              </span>
            </span>
          </div>
        </article>
        <button v-if="requestFailed" class="performance-load-error" type="button" @click="handleRetry">
          {{ $t("加载失败，点击重试") }}
        </button>
      </van-list>
    </div>

    <div v-if="summary" class="performance-footer" :class="{ 'performance-footer--collapsed': footerCollapsed }">
      <button
        class="performance-footer__toggle"
        type="button"
        :aria-expanded="!footerCollapsed"
        @click="footerCollapsed = !footerCollapsed"
      >
        <svg-icon name="promote-collapse-arrow" class="performance-footer__arrow" />
        {{ footerCollapsed ? "展示" : "收起" }}
      </button>
      <div class="performance-footer__content">
        <span class="performance-footer__item">
          <label>总业绩</label>
          <span>{{ formatMoney(summary.totalPerformance) }}</span>
        </span>
        <span class="performance-footer__item">
          <label>直属业绩</label>
          <span>{{ formatMoney(summary.directPerformance) }}</span>
        </span>
        <span class="performance-footer__item">
          <label>其他业绩</label>
          <span :class="{ 'performance-record__value--empty': !summary.otherPerformance }">
            {{ formatOptionalMoney(summary.otherPerformance) }}
          </span>
        </span>
      </div>
    </div>

    <promote-performance-direct-dialog
      v-model:show="directDialogVisible"
      :settlement-id="selectedSettlementId"
    />
  </div>
</template>

<style scoped lang="less">
.performance-page {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.performance-tools {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: flex-start;
  width: max-content;
  margin-bottom: 10px;
}

.performance-list {
  flex: 1;
  min-height: 0;
  padding-bottom: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.performance-state,
.performance-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 80px;
}

.performance-state {
  height: 100%;
}

.performance-empty-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.performance-retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
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

.performance-record {
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;

  &:nth-child(odd) {
    background: var(--skin__bg_2);
  }
}

.performance-record__row {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
}

.performance-record__column {
  display: flex;
  width: 50%;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  color: var(--skin__neutral_2);

  label {
    margin-right: 5px;
  }
}

.performance-record__value {
  margin-right: 2px;
  color: var(--skin__lead);
  word-break: break-all;
}

.performance-record__value--button {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
}

.performance-record__value--link {
  color: var(--skin__primary);
  border-bottom: var(--lobby__px) solid currentColor;
}

.performance-record__value--empty {
  color: var(--skin__neutral_2);
}

.performance-load-error {
  display: block;
  width: 100%;
  padding: 10px;
  color: var(--skin__primary);
  font-size: 11px;
  text-align: center;
}

.performance-footer {
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

.performance-footer--collapsed {
  transform: translateY(100%);

  .performance-footer__arrow { transform: rotate(180deg); }
}

.performance-footer__toggle {
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

.performance-footer__arrow {
  width: 10px;
  height: 10px;
  margin-right: 5px;
  fill: currentColor;
  transition: transform 0.3s;
}

.performance-footer__content {
  display: flex;
  width: 100%;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.performance-footer__item {
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
  .performance-record__column label,
  .performance-record__value,
  .performance-footer__arrow,
  .performance-footer__item label,
  .performance-footer__item > span {
    margin-right: 0;
    margin-left: 5px;
  }

  .performance-footer {
    right: 0;
    left: auto;
  }
}
</style>
