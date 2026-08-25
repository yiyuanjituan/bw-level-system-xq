<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromoteSubordinateBettingDetail } from "@/api/common";
import vipBadgeIcon from "@/assets/home/promote/vip-badge.avif";
import Copy from "@/components/Common/Copy.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import type {
  PromoteBettingDetailItem,
  PromoteBettingDetailResponse
} from "../types";

const props = defineProps<{
  show: boolean;
  userIdx: number;
  vipLevel: number;
  startTime: number;
  endTime: number;
}>();

const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
}>();

const DEFAULT_PAGE_SIZE = 20;
const selectedType = ref(0);
const gameTypeOptions = ref<Array<{ label: string; value: number }>>([
  { label: "全部类型", value: 0 }
]);
const records = ref<PromoteBettingDetailItem[]>([]);
const summary = ref<PromoteBettingDetailResponse["summary"]>({
  totalBetCount: 0,
  totalValidBetAmount: 0,
  totalNetAmount: 0
});
const page = ref(1);
const loading = ref(false);
const failed = ref(false);
const finished = ref(false);
let latestRequestId = 0;

const hasRecords = computed(() => records.value.length > 0);
const dateRangeText = computed(() => ({
  start: props.startTime ? dayjs(props.startTime * 1000).format("YYYY/MM/DD") : "-",
  end: props.endTime ? dayjs(props.endTime * 1000).format("YYYY/MM/DD") : "-"
}));

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function getWinLossClass(value: unknown) {
  const amount = Number(value);
  return {
    "number--green": amount < 0,
    "number--red": amount > 0
  };
}

function normalizeResponse(response: unknown): PromoteBettingDetailResponse {
  const source = (response as any)?.data ?? response ?? {};
  const sourceSummary = (source as any).summary ?? {};
  return {
    list: Array.isArray((source as any).list) ? (source as any).list : [],
    gameTypes: Array.isArray((source as any).gameTypes) ? (source as any).gameTypes : [],
    summary: {
      totalBetCount: Math.max(Math.trunc(Number(sourceSummary.totalBetCount) || 0), 0),
      totalValidBetAmount: Number(sourceSummary.totalValidBetAmount) || 0,
      totalNetAmount: Number(sourceSummary.totalNetAmount) || 0
    },
    page: Math.max(Number((source as any).page) || 1, 1),
    pageSize: Math.max(Number((source as any).pageSize) || DEFAULT_PAGE_SIZE, 1),
    total: Math.max(Number((source as any).total) || 0, 0),
    more: Boolean((source as any).more),
    startTime: Number((source as any).startTime) || 0,
    endTime: Number((source as any).endTime) || 0
  };
}

async function loadRecords(reset = false) {
  if (!props.userIdx || (loading.value && !reset)) return;

  if (reset) {
    page.value = 1;
    records.value = [];
    failed.value = false;
    finished.value = false;
  }

  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const response = normalizeResponse(await getPromoteSubordinateBettingDetail({
      userIdx: props.userIdx,
      type: selectedType.value,
      startTime: props.startTime,
      endTime: props.endTime,
      page: page.value,
      size: DEFAULT_PAGE_SIZE
    }));
    if (requestId !== latestRequestId) return;

    records.value = reset ? response.list : [...records.value, ...response.list];
    summary.value = response.summary;
    gameTypeOptions.value = [
      { label: "全部类型", value: 0 },
      ...response.gameTypes.filter(option => Number(option.value) > 0)
    ];
    failed.value = false;
    finished.value = !response.more || records.value.length >= response.total;
    if (!finished.value) page.value += 1;
  } catch {
    if (requestId !== latestRequestId) return;
    failed.value = true;
    finished.value = true;
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

function closeDialog() {
  emit("update:show", false);
}

watch(
  [() => props.show, () => props.userIdx, () => props.startTime, () => props.endTime],
  ([show]) => {
    if (!show) return;
    if (selectedType.value !== 0) {
      selectedType.value = 0;
      return;
    }
    void loadRecords(true);
  }
);

watch(selectedType, () => {
  if (props.show) void loadRecords(true);
});
</script>

<template>
  <van-dialog
    :show="show"
    :title="$t('投注明细')"
    :width="350"
    :z-index="2020"
    :show-confirm-button="false"
    :show-cancel-button="false"
    close-on-click-overlay
    destroy-on-close
    class-name="betting-detail-dialog"
    teleport="body"
    @update:show="emit('update:show', $event)"
  >
    <div class="dialog-content">
      <div class="modal-header">
        <span class="type-select">
          <x-select
            v-model="selectedType"
            placement="bottom"
            :options="gameTypeOptions"
            value-key="value"
            label-key="label"
          />
        </span>
        <span class="date-range">
          <label>日期</label>
          <span class="value">{{ dateRangeText.start }}</span>
          <span>-</span>
          <span class="value">{{ dateRangeText.end }}</span>
        </span>
      </div>

      <div class="record-list">
        <div v-if="loading && !hasRecords" class="state"><ui-loading /></div>
        <ui-empty
          v-else-if="!hasRecords"
          :text="failed ? '加载失败，请重试' : '暂无内容'"
        >
          <template #text="{ text }">
            <span class="empty-text">
              <span>{{ text }}</span>
              <button v-if="failed" class="inline-retry" type="button" @click="loadRecords(true)">
                重新加载
              </button>
            </span>
          </template>
        </ui-empty>

        <van-list
          v-else
          :loading="loading"
          :finished="finished"
          :immediate-check="false"
          @load="loadRecords(false)"
        >
          <template #loading>
            <div class="loading"><ui-loading /></div>
          </template>

          <div v-for="record in records" :key="`${record.type}-${record.apiCode}-${record.playType}`" class="record-item">
            <div class="row">
              <span class="column">
                <span class="account-column">
                  <span class="vip-badge">
                    <img :src="vipBadgeIcon" alt="" />
                    <span class="vip-level">{{ vipLevel }}</span>
                  </span>
                  <span class="member-account">
                    <span class="member-id">{{ userIdx }}</span>
                    <copy class="copy-button" :text="String(userIdx)" />
                  </span>
                </span>
              </span>
            </div>
            <div class="row">
              <span class="column">
                <label>游戏平台</label>
                <span class="number value">
                  {{ record.apiCode || "-" }}
                  <span v-if="record.typeName" class="suffix">({{ record.typeName }})</span>
                </span>
              </span>
              <span class="column">
                <label>游戏名称</label>
                <span class="number value">{{ record.playType || "-" }}</span>
              </span>
            </div>
            <div class="row">
              <span class="column">
                <label>有效投注</label>
                <span class="number value">{{ formatMoney(record.validBetAmount) }}</span>
              </span>
              <span class="column">
                <label>会员输赢</label>
                <span class="number value" :class="getWinLossClass(record.netAmount)">
                  {{ formatMoney(record.netAmount) }}
                </span>
              </span>
            </div>
          </div>

          <button v-if="failed" class="retry-button" type="button" @click="loadRecords(false)">
            加载失败，点击重试
          </button>
        </van-list>
      </div>

      <div class="summary-footer">
        <span class="summary-item">
          <label>总有效投注</label>
          <span class="number value">{{ formatMoney(summary.totalValidBetAmount) }}</span>
        </span>
        <span class="summary-item">
          <label>总注单数</label>
          <span class="number value">{{ summary.totalBetCount }}</span>
        </span>
        <span class="summary-item">
          <label>总输赢</label>
          <span class="number value" :class="getWinLossClass(summary.totalNetAmount)">
            {{ formatMoney(summary.totalNetAmount) }}
          </span>
        </span>
      </div>
    </div>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" role="button" tabindex="0" :aria-label="$t('关闭')" @click="closeDialog" @keydown.enter="closeDialog">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
.dialog-content {
  box-sizing: border-box;
  padding: 0 10px 10px;
  color: var(--skin__lead);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  color: var(--skin__lead);
  font-size: 10px;
}

.type-select {
  display: inline-flex;
  width: 85px;
}

:deep(.type-select .x-popover__reference) {
  width: 100%;
}

:deep(.type-select .x-select) {
  box-sizing: border-box;
  width: 85px;
  height: 25px;
  padding: 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 25px;
  background: var(--skin__bg_2);
  color: var(--skin__lead);
  font-size: 10px;
}

:deep(.type-select .x-select__label) {
  max-width: 60px;
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-range {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.date-range label {
  margin-right: 2.5px;
  color: var(--skin__neutral_2);
}

.date-range .value {
  margin: 0 2px;
}

.record-list {
  position: relative;
  min-height: 150px;
  max-height: 400px;
  overflow-y: auto;
}

.state,
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.state {
  height: 150px;
}

.loading {
  padding: 10px;
}

.record-item {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
}

.record-item:nth-child(odd) {
  background-color: var(--skin__bg_1);
}

.record-item:nth-child(even) {
  background-color: var(--skin__bg_2);
}

.row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.row:not(:last-child) {
  margin-bottom: 5px;
}

.column {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 50%;
  color: var(--skin__neutral_2);
}

.column label {
  margin-right: 5px;
}

.number {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__lead);
  word-break: break-all;
}

.value {
  margin-right: 2px;
  color: var(--skin__lead);
}

.suffix {
  color: var(--skin__neutral_2);
}

.number--green {
  color: var(--skin__accent_1);
}

.number--red {
  color: var(--skin__accent_2);
}

.account-column,
.member-account {
  display: inline-flex;
  align-items: center;
}

.vip-badge {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 12px;
  border-radius: 2px 0;
  background-color: #c12929;
  line-height: 1;
}

.vip-badge img {
  width: 8px;
  height: 8px;
}

.vip-level {
  padding-right: 3px;
  margin-left: -2px;
  background-image: linear-gradient(to bottom, #f7ea94 -5%, #e5b952 58%, #ce9510 114%);
  background-clip: text;
  color: transparent;
  font-size: 9px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
}

.member-account {
  margin-right: 5px;
  color: var(--skin__lead);
}

.member-id {
  color: var(--skin__primary);
  border-bottom: var(--lobby__px) solid var(--skin__primary);
}

.copy-button {
  padding: 0;
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transform: translateY(2px);
}

.retry-button {
  display: block;
  width: 100%;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--skin__danger, #e95b5b);
  text-align: center;
  cursor: pointer;
}

.empty-text {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.inline-retry {
  padding: 2px 6px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 8px;
  background: transparent;
  color: var(--skin__primary);
  font-size: 9px;
  cursor: pointer;
}

.summary-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  width: 50%;
  margin-bottom: 5px;
  color: var(--skin__lead);
  font-size: 10px;
}

.summary-item label {
  width: 50%;
  margin-right: 5px;
  color: var(--skin__neutral_2);
  word-break: break-all;
}

.footer-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 45px;
  padding-top: 15px;
}

.close-icon {
  color: white;
  font-size: 30px;
  cursor: pointer;
}

:global(.betting-detail-dialog) {
  max-width: calc(100vw - 20px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

:global(.betting-detail-dialog .van-dialog__header) {
  position: relative;
  z-index: 1;
  padding: 10px 15px 15px;
  border: var(--lobby__px) solid var(--skin__border);
  border-bottom: 1px solid var(--skin__bg_2);
  border-radius: 10px 10px 0 0;
  margin-bottom: -1px;
  background: var(--skin__bg_2);
  color: var(--skin__lead);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  box-shadow: none;
}

:global(.betting-detail-dialog .van-dialog__content) {
  padding: 0;
  border: var(--lobby__px) solid var(--skin__border);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: var(--skin__bg_2);
}

:global(.betting-detail-dialog .van-dialog__footer) {
  background: transparent;
}

[dir="rtl"] {
  .column label,
  .date-range label,
  .summary-item label,
  .value,
  .member-account {
    margin-right: 0;
    margin-left: 5px;
  }

  .vip-badge {
    right: 0;
    left: auto;
    border-radius: 0 2px;
  }

  .copy-button {
    margin-right: 8px;
    margin-left: 0;
  }
}
</style>
