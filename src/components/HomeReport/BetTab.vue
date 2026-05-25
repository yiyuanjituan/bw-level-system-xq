<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import UiEmpty from "@/components/UI/empty.vue";
import Copy from "@/components/Common/Copy.vue";
import type { AccountTimeFilterMode, AccountTimeRange, SelectOption } from "@/components/HomeReport/types";

type BetFilterOption = SelectOption & {
  value: string;
};

type BetStatus = "settled" | "pending" | "cancelled";
type BetResult = "win" | "lose" | "draw";

interface BetRecord {
  id: string;
  title: string;
  stake: number;
  validStake: number;
  winLoss: number;
  settledAt: string;
  orderNo: string;
  status: BetStatus;
  betType: string;
  platform: string;
  result: BetResult;
}

const minDate = dayjs().subtract(3, "month").toDate();
const maxDate = dayjs().toDate();
const showPopover = ref(false);
const draftMode = ref<AccountTimeFilterMode>("custom");
const draftStartDate = ref<string[]>([]);
const draftEndDate = ref<string[]>([]);

const statusOptions: BetFilterOption[] = [
  { label: "全部状态", value: "all" },
  { label: "已结算", value: "settled" },
  { label: "未结算", value: "pending" },
  { label: "已撤单", value: "cancelled" }
];

const typeOptions: BetFilterOption[] = [
  { label: "全部类型", value: "all" },
  { label: "单注", value: "single" },
  { label: "串关", value: "parlay" },
  { label: "追号", value: "chase" }
];

const platformOptions: BetFilterOption[] = [
  { label: "全部平台", value: "all" },
  { label: "体育", value: "sports" },
  { label: "真人", value: "casino" },
  { label: "电子", value: "slots" }
];

const resultOptions: BetFilterOption[] = [
  { label: "全部结果", value: "all" },
  { label: "输", value: "lose" },
  { label: "赢", value: "win" },
  { label: "和", value: "draw" }
];

const betRecords = ref<BetRecord[]>([
  {
    id: "1",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:57",
    orderNo: "2057415341902137862",
    status: "settled",
    betType: "single",
    platform: "sports",
    result: "lose"
  },
  {
    id: "2",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:56",
    orderNo: "2057415338362143747",
    status: "settled",
    betType: "single",
    platform: "sports",
    result: "lose"
  },
  {
    id: "3",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:55",
    orderNo: "2057415334734070278",
    status: "settled",
    betType: "single",
    platform: "sports",
    result: "lose"
  },
  {
    id: "4",
    title: "梦娱探秘宝典",
    stake: 0,
    validStake: 0,
    winLoss: 0,
    settledAt: "2026-05-21 18:58:51",
    orderNo: "2057415320083367936",
    status: "settled",
    betType: "chase",
    platform: "casino",
    result: "draw"
  },
  {
    id: "5",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: 0.5,
    settledAt: "2026-05-21 18:58:51",
    orderNo: "2057415311434714633",
    status: "settled",
    betType: "parlay",
    platform: "sports",
    result: "win"
  },
  {
    id: "6",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:48",
    orderNo: "2057415303047880081",
    status: "settled",
    betType: "single",
    platform: "slots",
    result: "lose"
  },
  {
    id: "7",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:48",
    orderNo: "2057415307743723521",
    status: "pending",
    betType: "single",
    platform: "sports",
    result: "lose"
  },
  {
    id: "8",
    title: "梦娱探秘宝典",
    stake: 0.4,
    validStake: 0.4,
    winLoss: -0.4,
    settledAt: "2026-05-21 18:58:44",
    orderNo: "2057415291033618970",
    status: "cancelled",
    betType: "single",
    platform: "casino",
    result: "lose"
  }
]);

const statusFilterValue = ref(statusOptions[0]?.value ?? "all");
const typeFilterValue = ref(typeOptions[0]?.value ?? "all");
const platformFilterValue = ref(platformOptions[0]?.value ?? "all");
const resultFilterValue = ref(resultOptions[0]?.value ?? "all");
const timeRange = ref<AccountTimeRange>(createDefaultRange());

function toPickerValue(dateText: string) {
  const parsedDate = dayjs(dateText);

  if (!parsedDate.isValid()) {
    return dayjs().format("YYYY-MM-DD").split("-");
  }

  return parsedDate.format("YYYY-MM-DD").split("-");
}

function parsePickerValue(dateValue: string[]) {
  return `${dateValue[0]}-${String(dateValue[1]).padStart(2, "0")}-${String(dateValue[2]).padStart(2, "0")}`;
}

function createRange(mode: AccountTimeFilterMode, startDate: string, endDate: string) {
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);
  const normalizedStartDay = startDay.isAfter(endDay) ? endDay : startDay;
  const normalizedEndDay = startDay.isAfter(endDay) ? startDay : endDay;
  const normalizedStartDate = normalizedStartDay.format("YYYY-MM-DD");
  const normalizedEndDate = normalizedEndDay.format("YYYY-MM-DD");

  return {
    mode,
    label:
      mode === "custom"
        ? `${normalizedStartDay.format("MM/DD")}-${normalizedEndDay.format("MM/DD")}`
        : mode === "yesterday"
        ? "昨日"
        : "今日",
    startTime: normalizedStartDay.startOf("day").unix(),
    endTime: normalizedEndDay.endOf("day").unix(),
    startDate: normalizedStartDate,
    endDate: normalizedEndDate
  } satisfies AccountTimeRange;
}

function createPresetRange(mode: Extract<AccountTimeFilterMode, "today" | "yesterday">) {
  const targetDate = mode === "yesterday" ? dayjs().subtract(1, "day") : dayjs();
  const dateText = targetDate.format("YYYY-MM-DD");

  return createRange(mode, dateText, dateText);
}

function createDefaultRange() {
  return createRange(
    "custom",
    dayjs().subtract(44, "day").format("YYYY-MM-DD"),
    dayjs().subtract(1, "day").format("YYYY-MM-DD")
  );
}

function syncDraft(rangeValue: AccountTimeRange) {
  draftMode.value = rangeValue.mode;
  draftStartDate.value = toPickerValue(rangeValue.startDate);
  draftEndDate.value = toPickerValue(rangeValue.endDate);
}

function togglePopover() {
  if (!showPopover.value) {
    syncDraft(timeRange.value);
  }

  showPopover.value = !showPopover.value;
}

function selectQuickMode(mode: Extract<AccountTimeFilterMode, "today" | "yesterday">) {
  draftMode.value = mode;
  const quickRange = createPresetRange(mode);
  draftStartDate.value = toPickerValue(quickRange.startDate);
  draftEndDate.value = toPickerValue(quickRange.endDate);
}

function markCustomMode() {
  draftMode.value = "custom";
}

function handleCancel() {
  syncDraft(timeRange.value);
  showPopover.value = false;
}

function handleConfirm() {
  timeRange.value =
    draftMode.value === "custom"
      ? createRange("custom", parsePickerValue(draftStartDate.value), parsePickerValue(draftEndDate.value))
      : createPresetRange(draftMode.value);

  showPopover.value = false;
}

function handleSeeMore() {
  timeRange.value = createDefaultRange();
}

function formatMoney(value: number) {
  return Number(value || 0).toFixed(2);
}

function formatRecordTime(value: string) {
  return dayjs(value).format("YYYY/MM/DD HH:mm:ss");
}

function getStatusLabel(status: BetStatus) {
  if (status === "pending") return "未结算";
  if (status === "cancelled") return "已撤单";
  return "已结算";
}

function getWinLossClass(value: number) {
  if (value > 0) return "record-card__amount--win";
  if (value < 0) return "record-card__amount--lose";
  return "record-card__amount--draw";
}

const triggerLabel = computed(() => {
  if (timeRange.value.mode !== "custom") {
    return timeRange.value.label;
  }

  return `${timeRange.value.startDate.replaceAll("-", "/")} - ${timeRange.value.endDate.replaceAll("-", "/")}`;
});

const filteredRecords = computed(() => {
  return betRecords.value.filter(item => {
    const recordTime = dayjs(item.settledAt).unix();
    const matchTime = recordTime >= timeRange.value.startTime && recordTime <= timeRange.value.endTime;
    const matchStatus = statusFilterValue.value === "all" || item.status === statusFilterValue.value;
    const matchType = typeFilterValue.value === "all" || item.betType === typeFilterValue.value;
    const matchPlatform = platformFilterValue.value === "all" || item.platform === platformFilterValue.value;
    const matchResult = resultFilterValue.value === "all" || item.result === resultFilterValue.value;

    return matchTime && matchStatus && matchType && matchPlatform && matchResult;
  });
});

const hasListData = computed(() => filteredRecords.value.length > 0);
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无记录";
  }

  return `${timeRange.value.label}暂无记录`;
});

watch(
  timeRange,
  value => {
    syncDraft(value);
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="bet-tab">
    <section class="filter-row">
      <div class="filter-row__scroll">
        <van-popover
          v-model:show="showPopover"
          trigger="manual"
          placement="bottom-start"
          :show-arrow="false"
          :offset="[0, 8]"
          teleport="body"
        >
          <template #reference>
            <button
              class="time-trigger"
              :class="{ 'time-trigger--active': showPopover }"
              type="button"
              @click.stop="togglePopover"
            >
              <span class="time-trigger__text">{{ triggerLabel }}</span>
              <svg-icon
                name="arrow-back"
                :class-name="showPopover ? 'rotate-[90deg]' : 'rotate-[-90deg]'"
                class="time-trigger__arrow"
              />
            </button>
          </template>

          <div class="time-panel">
            <div class="time-panel__quick">
              <button
                class="time-panel__quick-item"
                :class="{ 'time-panel__quick-item--active': draftMode === 'today' }"
                @click="selectQuickMode('today')"
              >
                今日
              </button>
              <button
                class="time-panel__quick-item"
                :class="{ 'time-panel__quick-item--active': draftMode === 'yesterday' }"
                @click="selectQuickMode('yesterday')"
              >
                昨日
              </button>
              <button
                class="time-panel__quick-item"
                :class="{ 'time-panel__quick-item--active': draftMode === 'custom' }"
                @click="markCustomMode"
              >
                自定义
              </button>
            </div>

            <div class="time-panel__picker-header">
              <span>开始日期</span>
              <span>结束日期</span>
            </div>

            <div class="time-panel__picker-row">
              <van-date-picker
                v-model="draftStartDate"
                class="time-panel__picker"
                :columns-type="['year', 'month', 'day']"
                :min-date="minDate"
                :max-date="maxDate"
                :show-toolbar="false"
                :option-height="35"
                :visible-option-num="5"
                @change="markCustomMode"
              />
              <div class="time-panel__divider"></div>
              <van-date-picker
                v-model="draftEndDate"
                class="time-panel__picker"
                :columns-type="['year', 'month', 'day']"
                :min-date="minDate"
                :max-date="maxDate"
                :show-toolbar="false"
                :option-height="35"
                :visible-option-num="5"
                @change="markCustomMode"
              />
            </div>

            <div class="time-panel__actions">
              <x-button class="flex-1 !h-[40px]" plain type="primary" @click="handleCancel"> 取消 </x-button>
              <x-button class="flex-1 !h-[40px]" @click="handleConfirm">确认</x-button>
            </div>
          </div>
        </van-popover>

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="statusFilterValue"
            :options="statusOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="typeFilterValue"
            :options="typeOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="platformFilterValue"
            :options="platformOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="resultFilterValue"
            :options="resultOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>
      </div>
    </section>

    <section class="content-area">
      <ui-empty v-if="!hasListData">
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
        <article v-for="item in filteredRecords" :key="item.id" class="record-card">
          <div class="record-card__row record-card__row--top">
            <div class="record-card__title">{{ item.title }}</div>
            <div class="record-card__metric">
              <span class="record-card__metric-label">下注金额</span>
              <span class="record-card__metric-value">{{ formatMoney(item.stake) }}</span>
            </div>
            <div class="record-card__result">
              <span class="record-card__metric-label">输赢</span>
              <span class="record-card__amount" :class="getWinLossClass(item.winLoss)">
                {{ formatMoney(item.winLoss) }}
              </span>
            </div>
          </div>

          <div class="record-card__row record-card__row--middle">
            <div class="record-card__time">{{ formatRecordTime(item.settledAt) }}</div>
            <div class="record-card__metric">
              <span class="record-card__metric-label">有效投注</span>
              <span class="record-card__sub-value">{{ formatMoney(item.validStake) }}</span>
            </div>
          </div>

          <div class="record-card__row record-card__row--bottom">
            <div class="record-card__order">
              <span class="record-card__order-label">注单号</span>
              <span class="record-card__order-value">{{ item.orderNo }}</span>
              <Copy :text="item.orderNo" class-name="record-card__copy-icon" />
            </div>
            <div class="record-card__status" :class="`record-card__status--${item.status}`">
              {{ getStatusLabel(item.status) }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.bet-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-row {
  padding: 10px;
}

.filter-row__scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.time-trigger {
  min-width: 166px;
  max-width: 166px;
  height: 25px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--skin__neutral_3);
  border-radius: 14px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2, var(--skin__lead));
  box-sizing: border-box;
  flex-shrink: 0;
}

.time-trigger__text {
  flex: 1;
  min-width: 0;
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-trigger__arrow {
  font-size: 10px;
  color: inherit;
}

.time-trigger--active {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
}

.filter-select {
  flex-shrink: 0;
}

.filter-select--sm {
  width: 81px;
}

.filter-select :deep(.x-select) {
  height: 25px;
  padding: 0 10px;
  border: 1px solid var(--skin__neutral_3);
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

.record-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 10px 10px;
}

.record-card {
  padding: 10px;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px var(--skin__bg-shadow__custom);
  color: var(--skin__neutral_2);
}

.record-card + .record-card {
  margin-top: 8px;
}

.record-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-card__row + .record-card__row {
  margin-top: 6px;
}

.record-card__row--top {
  align-items: flex-start;
}

.record-card__title {
  flex: 1;
  min-width: 0;
  color: var(--skin__lead);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  padding-left: 12px;
}

.record-card__title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--skin__neutral_2);
  border-radius: 2px;
  box-sizing: border-box;
}

.record-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: 10px;
}

.record-card__metric-label {
  color: var(--skin__neutral_2);
}

.record-card__metric-value,
.record-card__sub-value {
  color: var(--skin__lead);
  font-size: 11px;
  font-weight: 600;
}

.record-card__result {
  min-width: 78px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  text-align: right;
}

.record-card__amount {
  font-size: 11px;
  font-weight: 700;
}

.record-card__amount--win {
  color: var(--skin__accent_2);
}

.record-card__amount--lose {
  color: var(--skin__accent_1);
}

.record-card__amount--draw {
  color: var(--skin__primary);
}

.record-card__time {
  flex: 1;
  min-width: 0;
  font-size: 10px;
  line-height: 1.4;
}

.record-card__order {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.record-card__order-label {
  flex-shrink: 0;
  color: var(--skin__neutral_1);
  font-size: 10px;
}

.record-card__order-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: var(--skin__neutral_2, var(--skin__lead));
}

.record-card__order :deep(.copy-icon) {
  flex-shrink: 0;
}

.record-card__order :deep(.record-card__copy-icon) {
  font-size: 12px;
  color: var(--skin__primary);
}

.record-card__status {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
}

.record-card__status--settled {
  color: var(--skin__accent_1);
}

.record-card__status--pending {
  color: var(--skin__primary);
}

.record-card__status--cancelled {
  color: var(--skin__neutral_1);
}

.empty-state__text {
  color: var(--skin__neutral_2, var(--skin__lead));
  font-size: 13px;
  line-height: 1.5;
}

.empty-state__link {
  color: var(--skin__primary);
  cursor: pointer;
}

.time-panel {
  width: 355px;
  border: var(--lobby__px) solid var(--skin__border);
  box-shadow: 0 2px 6px var(--skin__bg-shadow__custom);
  box-sizing: border-box;
  color: var(--skin__neutral_2);
}

.time-panel__quick {
  padding: 10px;
  display: flex;
  gap: 10px;
}

.time-panel__quick-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  font-size: 12px;
  box-sizing: border-box;
  border-radius: 7px;
  border: var(--lobby__px) solid var(--skin__border);
  color: var(--skin__lead);
  line-height: 1;
}

.time-panel__quick-item--active {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
}

.time-panel__picker-header {
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.time-panel__picker-header span {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--skin__neutral_1);
}

.time-panel__picker-row {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.time-panel__divider {
  width: 0.5px;
  height: 155px;
  background-color: var(--skin__border);
  margin: 0 5px;
  z-index: 1;
}

.time-panel__picker {
  flex: 1;
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.time-panel__actions {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
}

.time-panel :deep(.van-picker) {
  background: transparent;
}

.time-panel :deep(.van-picker-column),
.time-panel :deep(.van-picker-column__item) {
  font-size: 12px;
  color: var(--skin__neutral_2);
}

.time-panel :deep(.van-picker-column__item--selected) {
  color: var(--skin__lead);
  font-weight: 600;
}

.time-panel :deep(.van-picker__columns) {
  background: transparent;
}

.time-panel :deep(.van-picker__mask) {
  background-image: linear-gradient(
      180deg,
      color-mix(in srgb, var(--skin__bg_2) 94%, transparent),
      color-mix(in srgb, var(--skin__bg_2) 60%, transparent)
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--skin__bg_2) 94%, transparent),
      color-mix(in srgb, var(--skin__bg_2) 60%, transparent)
    );
}

.time-panel :deep(.van-picker__frame) {
  left: 0;
  right: 0;
  border-top: var(--lobby__px) solid var(--skin__border);
  border-bottom: var(--lobby__px) solid var(--skin__border);
  background: transparent;
}

.time-panel :deep(.van-picker__frame)::after {
  display: none;
}
</style>
