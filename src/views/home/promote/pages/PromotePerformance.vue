<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromotePerformance } from "@/api/common";
import DateRangePicker from "@/components/Common/DateRangePicker.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
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
  mode: "today",
  label: "今日",
  startTime: today.startOf("day").unix(),
  endTime: today.endOf("day").unix(),
  startDate: today.format("YYYY-MM-DD"),
  endDate: today.format("YYYY-MM-DD")
});
const records = ref<PromotePerformanceRecord[]>([]);
const loading = ref(false);
const finished = ref(false);
const requestFailed = ref(false);
const nextCursorId = ref<number | null>(null);
let latestRequestId = 0;

const hasRecords = computed(() => records.value.length > 0);

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function normalizeResponse(response: PromotePerformanceResponse | unknown): PromotePerformanceResponse {
  const source = (response as any)?.data ?? response ?? {};
  const rawList = Array.isArray((source as any).list) ? (source as any).list : [];

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
    nextCursorId.value = response.nextCursorId;
    requestFailed.value = false;
    finished.value = !response.more || !response.nextCursorId;
  } catch {
    if (requestId !== latestRequestId) return;

    requestFailed.value = true;
    finished.value = true;
    if (reset) records.value = [];
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

function handleRetry() {
  finished.value = false;
  void loadPerformance(records.value.length === 0);
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
      <date-range-picker v-model="selectedTimeRange" />
    </div>

    <div class="performance-list">
      <div v-if="loading && !hasRecords" class="performance-state"><ui-loading /></div>
      <ui-empty
        v-else-if="!hasRecords"
        :text="requestFailed ? '加载失败，请重试' : '暂无内容'"
      >
        <template #text="{ text }">
          <span class="performance-empty-text">
            <span>{{ text }}</span>
            <div
              class="performance-retry"
              role="button"
              tabindex="0"
              :aria-label="$t('重新加载')"
              @click="handleRetry"
              @keydown.enter.space.prevent="handleRetry"
            >
              <svg viewBox="0 0 28 28" aria-hidden="true">
                <path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" />
              </svg>
            </div>
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
            <span><label>统计日期</label><strong>{{ record.statisticDate || "-" }}</strong></span>
            <span><label>总业绩</label><strong>{{ formatMoney(record.totalPerformance) }}</strong></span>
          </div>
          <div class="performance-record__row">
            <span><label>直属业绩</label><strong>{{ formatMoney(record.directPerformance) }}</strong></span>
            <span><label>其他业绩</label><strong>{{ formatMoney(record.otherPerformance) }}</strong></span>
          </div>
          <div class="performance-record__row">
            <span><label>总贡献</label><strong>{{ formatMoney(record.totalContribute) }}</strong></span>
            <span><label>直属贡献</label><strong>{{ formatMoney(record.directContribute) }}</strong></span>
          </div>
        </article>
        <button v-if="requestFailed" class="performance-load-error" type="button" @click="handleRetry">
          {{ $t("加载失败，点击重试") }}
        </button>
      </van-list>
    </div>
  </div>
</template>

<style scoped lang="less">
.performance-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
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
  color: var(--skin__primary);
  cursor: pointer;

  svg {
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

  &:not(:last-child) {
    margin-bottom: 5px;
  }

  span {
    display: flex;
    width: 50%;
    align-items: center;
    flex-wrap: wrap;
  }

  label {
    margin-right: 5px;
    color: var(--skin__neutral_2);
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }
}

.performance-load-error {
  display: block;
  width: 100%;
  padding: 10px;
  color: var(--skin__primary);
  font-size: 11px;
  text-align: center;
}

[dir="rtl"] .performance-record__row label {
  margin-right: 0;
  margin-left: 5px;
}
</style>
