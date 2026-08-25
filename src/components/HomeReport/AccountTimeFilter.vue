<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import type { AccountTimeFilterMode, AccountTimeRange } from "@/components/HomeReport/types";

const props = defineProps<{
  modelValue?: AccountTimeRange;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: AccountTimeRange): void;
  (event: "change", value: AccountTimeRange): void;
}>();

const minDate = dayjs().subtract(3, "month").toDate();
const maxDate = dayjs().toDate();
const showPopover = ref(false);
const draftMode = ref<AccountTimeFilterMode>("today");
const draftStartDate = ref<string[]>([]);
const draftEndDate = ref<string[]>([]);

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
  let normalizedStartDay = startDay;
  let normalizedEndDay = endDay;

  // 自定义时间允许用户任意滚动，这里统一纠正顺序，避免开始时间晚于结束时间。
  if (startDay.isAfter(endDay)) {
    normalizedStartDay = endDay;
    normalizedEndDay = startDay;
  }

  const normalizedStartDate = normalizedStartDay.format("YYYY-MM-DD");
  const normalizedEndDate = normalizedEndDay.format("YYYY-MM-DD");
  const label = mode === "custom"
    ? `${normalizedStartDay.format("MM/DD")}-${normalizedEndDay.format("MM/DD")}`
    : mode === "yesterday"
      ? "昨日"
      : "今日";

  return {
    mode,
    label,
    startTime: normalizedStartDay.startOf("day").unix(),
    endTime: normalizedEndDay.endOf("day").unix(),
    startDate: normalizedStartDate,
    endDate: normalizedEndDate
  } satisfies AccountTimeRange;
}

function createPresetRange(mode: Extract<AccountTimeFilterMode, "today" | "yesterday">) {
  const targetDate = mode === "yesterday" ? dayjs().subtract(1, "day") : dayjs();

  return createRange(mode, targetDate.format("YYYY-MM-DD"), targetDate.format("YYYY-MM-DD"));
}

function syncDraft(rangeValue: AccountTimeRange) {
  draftMode.value = rangeValue.mode;
  draftStartDate.value = toPickerValue(rangeValue.startDate);
  draftEndDate.value = toPickerValue(rangeValue.endDate);
}

const currentRange = computed(() => props.modelValue ?? createPresetRange("today"));
const currentLabel = computed(() => currentRange.value.label);

function togglePopover() {
  if (!showPopover.value) {
    syncDraft(currentRange.value);
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
  syncDraft(currentRange.value);
  showPopover.value = false;
}

function handleConfirm() {
  const nextRange = draftMode.value === "custom"
    ? createRange("custom", parsePickerValue(draftStartDate.value), parsePickerValue(draftEndDate.value))
    : createPresetRange(draftMode.value);

  emit("update:modelValue", nextRange);
  emit("change", nextRange);
  showPopover.value = false;
}

watch(
  () => props.modelValue,
  rangeValue => {
    syncDraft(rangeValue ?? createPresetRange("today"));
  },
  { immediate: true, deep: true }
);
</script>

<template>
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
        <span class="time-trigger__text">{{ currentLabel }}</span>
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
          {{ $t("今日") }}
        </button>
        <button
          class="time-panel__quick-item"
          :class="{ 'time-panel__quick-item--active': draftMode === 'yesterday' }"
          @click="selectQuickMode('yesterday')"
        >
          {{ $t("昨日") }}
        </button>
      </div>

      <div class="time-panel__title">{{ $t("自定义") }}</div>

      <div class="time-panel__picker-header">
        <span>{{ $t("开始日期") }}</span>
        <span>{{ $t("结束日期") }}</span>
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
        <div class="picker-content-item-line"></div>
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
        <x-button class="flex-1 !h-[40px]" plain type="primary" @click="handleCancel">{{ $t("取消") }}</x-button>
        <x-button class="flex-1 !h-[40px]" @click="handleConfirm">{{ $t("确认") }}</x-button>
      </div>
    </div>
  </van-popover>
</template>

<style scoped lang="less">
.time-trigger {
  min-width: 65px;
  height: 25px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--skin__neutral_3);
  border-radius: 14px;
  background: #191919;
  color: var(--skin__neutral_2, var(--skin__lead));
  box-sizing: border-box;

  .time-trigger__text {
    flex: 1;
    min-width: 0;
    font-size: 10px;
    line-height: 1;
    white-space: nowrap;
  }

  .time-trigger__arrow {
    font-size: 10px;
    color: var(--skin__neutral_2, var(--skin__lead));
  }
}

.time-trigger--active {
  border-color: #dfbe5b;
  color: #dfbe5b;

  .time-trigger__arrow {
    color: #dfbe5b;
  }
}

.time-panel {
  width: 355px;
  border: var(--lobby__px) solid var(--skin__border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: var(--skin__neutral_2);

  .time-panel__quick {
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .time-panel__quick-item {
    width: calc((100% - 20px) / 3);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 35px;
    font-size: 12px;
    box-sizing: border-box;
    border-radius: 7px;
    border: var(--lobby__px) solid var(--skin__border);
    user-select: none;
    cursor: pointer;
    color: var(--skin__lead);
    text-align: center;
    line-height: 1;
  }

  .time-panel__quick-item--active {
    border-color: #dfbe5b;
    color: #dfbe5b;
  }

  .time-panel__title {
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    padding: 5px 10px;
    line-height: 1;
  }

  .time-panel__picker-header {
    overflow: hidden;
    padding: 0 10px;
    gap: 10px;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    font-size: 12px;
    span {
      width: 50%;
      padding: 0;
      margin: 0;
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      color: var(--skin__neutral_1);
    }
  }

  .time-panel__picker-row {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    .picker-content-item-line {
      width: 0.5px;
      height: 155px;
      background-color: var(--skin__border);
      z-index: 10;
      margin: 0 5px;
    }
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
    overflow: hidden;
    padding: 0 10px;
    gap: 10px;
  }

  .time-panel__action {
    height: 40px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
  }

  .time-panel__action--ghost {
    border: 1px solid #dfbe5b;
    background: transparent;
    color: #dfbe5b;
  }

  .time-panel__action--primary {
    border: 0;
    background: #dfbe5b;
    color: #ffffff;
  }

  :deep(.van-picker) {
    background: transparent;
  }

  :deep(.van-picker-column) {
    font-size: 12px;
    color: #6f6f6f;
  }

  :deep(.van-picker__columns) {
    background: transparent;
  }

  :deep(.van-picker-column__item) {
    color: #6f6f6f;
    font-size: 12px;
  }

  :deep(.van-picker-column__item--selected) {
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 600;
  }

  :deep(.van-picker__mask) {
    background-image: linear-gradient(180deg, rgba(26, 26, 26, 0.94), rgba(26, 26, 26, 0.6)), linear-gradient(0deg, rgba(26, 26, 26, 0.94), rgba(26, 26, 26, 0.6));
  }

  :deep(.van-picker__frame) {
    left: 0;
    right: 0;
    border-bottom: var(--lobby__px) solid var(--skin__border);
    border-top: var(--lobby__px) solid var(--skin__border);
    background-color: transparent;
    &::after {
      content: "";
      display: none;
    }
  }
}
</style>
