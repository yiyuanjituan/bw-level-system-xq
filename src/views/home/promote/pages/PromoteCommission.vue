<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { showFailToast, showSuccessToast } from "vant";
import { getPromoteCommission, receivePromoteCommission } from "@/api/common";
import DateRangePicker from "@/components/Common/DateRangePicker.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import type { DateRangeValue } from "@/components/Common/DateRangePicker.vue";
import type {
  PromoteCommissionRecord,
  PromoteCommissionResponse,
  PromoteInfo
} from "../types";

defineOptions({
  name: "PromoteCommission"
});

const props = defineProps<{
  info?: PromoteInfo | null;
}>();

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
const records = ref<PromoteCommissionRecord[]>([]);
const loading = ref(false);
const finished = ref(false);
const requestFailed = ref(false);
const nextCursorId = ref<number | null>(null);
const latestRequestId = ref(0);
const receivingId = ref(0);
const nowTimestamp = ref(Date.now());
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const settlementCycleName = computed(() => props.info?.config.settlementCycleName || "-");
const countdownParts = computed(() => {
  const settlementTimestamp = Number(props.info?.config.nextSettlementTimestamp) || 0;
  if (!settlementTimestamp) {
    return { days: "--", clock: "" };
  }

  const remainingSeconds = Math.max(
    Math.floor((settlementTimestamp - nowTimestamp.value) / 1000),
    0
  );
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

function normalizeResponse(response: PromoteCommissionResponse | unknown): PromoteCommissionResponse {
  const source = (response as any)?.data ?? response ?? {};
  const rawList = Array.isArray((source as any).list) ? (source as any).list : [];

  return {
    list: rawList.map((record: any) => ({
      id: Number(record?.id) || 0,
      settlementDate: String(record?.settlementDate || ""),
      subordinateCount: Math.max(Math.trunc(Number(record?.subordinateCount) || 0), 0),
      validSubordinateCount: Math.max(Math.trunc(Number(record?.validSubordinateCount) || 0), 0),
      performance: Number(record?.performance) || 0,
      directCommission: Number(record?.directCommission) || 0,
      otherCommission: Number(record?.otherCommission) || 0,
      commission: Number(record?.commission) || 0,
      receivedCommission: Number(record?.receivedCommission) || 0,
      status: ([1, 2, 3].includes(Number(record?.status)) ? Number(record.status) : 1) as 1 | 2 | 3,
      canReceive: Boolean(record?.canReceive),
      receiveTime: Number(record?.receiveTime) || 0
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

async function handleReceive(record: PromoteCommissionRecord) {
  if (!record.canReceive || receivingId.value) return;

  receivingId.value = record.id;
  try {
    const response: any = await receivePromoteCommission(record.id);
    const result = response?.data ?? response ?? {};
    record.receivedCommission = Number(result.receivedCommission) || record.commission;
    record.status = 3;
    record.canReceive = false;
    showSuccessToast({ message: result.duplicated ? "该佣金已领取" : "佣金领取成功" });
  } catch (error: any) {
    showFailToast({ message: String(error?.message || "佣金领取失败，请稍后重试") });
  } finally {
    receivingId.value = 0;
  }
}

async function loadCommission(reset = false) {
  if (loading.value && !reset) return;

  if (reset) {
    records.value = [];
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
    nextCursorId.value = response.nextCursorId;
    requestFailed.value = false;
    finished.value = !response.more || !response.nextCursorId;
  } catch {
    if (requestId !== latestRequestId.value) return;

    requestFailed.value = true;
    finished.value = true;
    if (reset) records.value = [];
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
        <date-range-picker v-model="selectedTimeRange" />
      </div>

      <div class="commission-list">
        <div v-if="loading && !hasRecords" class="commission-state"><ui-loading /></div>
        <ui-empty
          v-else-if="!hasRecords"
          :text="requestFailed ? '加载失败，请重试' : '暂无内容'"
        >
          <template #text="{ text }">
            <span class="commission-empty-text">
              <span>{{ text }}</span>
              <div
                class="commission-retry"
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
          @load="loadCommission(false)"
        >
          <template #loading><div class="commission-loading"><ui-loading /></div></template>
          <article v-for="record in records" :key="record.id" class="commission-record">
            <div class="commission-record__row">
              <span><label>结算日期</label><strong>{{ record.settlementDate || "-" }}</strong></span>
              <span><label>本期业绩</label><strong>{{ formatMoney(record.performance) }}</strong></span>
            </div>
            <div class="commission-record__row">
              <span><label>直属佣金</label><strong>{{ formatMoney(record.directCommission) }}</strong></span>
              <span><label>其他佣金</label><strong>{{ formatMoney(record.otherCommission) }}</strong></span>
            </div>
            <div class="commission-record__row">
              <span><label>本期佣金</label><strong>{{ formatMoney(record.commission) }}</strong></span>
              <span><label>实发佣金</label><strong>{{ formatMoney(record.receivedCommission) }}</strong></span>
            </div>
            <div v-if="record.commission > 0" class="commission-record__action">
              <button
                type="button"
                :disabled="!record.canReceive || Boolean(receivingId)"
                @click="handleReceive(record)"
              >
                {{ record.status === 3 ? "已领取" : receivingId === record.id ? "领取中..." : "领取佣金" }}
              </button>
            </div>
          </article>
          <button v-if="requestFailed" class="commission-load-error" type="button" @click="handleRetry">
            {{ $t("加载失败，点击重试") }}
          </button>
        </van-list>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.commission-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--skin__bg_1);
}

.settlement-summary {
  flex-shrink: 0;
  padding: 8px 10px;
  font-size: 10px;
  background: var(--skin__bg_2);
}

.settlement-summary__content {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.settlement-summary__item {
  display: flex;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  min-width: 145px;
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
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 10px;
  overflow: hidden;
}

.commission-tools {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.commission-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.commission-state,
.commission-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 80px;
}

.commission-state {
  height: 100%;
}

.commission-empty-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.commission-retry {
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

.commission-record {
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;

  &:nth-child(odd) {
    background: var(--skin__bg_2);
  }
}

.commission-record__row {
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

.commission-record__action {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;

  button {
    min-width: 70px;
    padding: 5px 12px;
    border-radius: 12px;
    color: var(--skin__text_primary);
    background: var(--skin__primary);

    &:disabled {
      color: var(--skin__neutral_2);
      background: var(--skin__neutral_3);
    }
  }
}

.commission-load-error {
  display: block;
  width: 100%;
  padding: 10px;
  color: var(--skin__primary);
  font-size: 11px;
  text-align: center;
}

[dir="rtl"] {
  .settlement-summary__item label,
  .commission-record__row label {
    margin-right: 0;
    margin-left: 5px;
  }
}
</style>
