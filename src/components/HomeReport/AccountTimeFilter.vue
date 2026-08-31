<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import type { AccountTimeFilterMode, AccountTimeRange } from "@/components/HomeReport/types";

defineOptions({
  name: "AccountTimeFilter"
});

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
    class="account-time-filter__popover"
    trigger="manual"
    placement="bottom-start"
    theme="light"
    :aria-label="$t('选择日期')"
    :show-arrow="false"
    :offset="[0, 8]"
    teleport="body"
  >
    <template #reference>
      <button
        class="time-trigger"
        :class="{ 'time-trigger--active': showPopover }"
        type="button"
        aria-haspopup="dialog"
        :aria-expanded="showPopover"
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
      <div class="time-panel__quick-area">
        <div class="time-panel__quick">
          <button
            type="button"
            class="time-panel__quick-item"
            :class="{ 'time-panel__quick-item--active': draftMode === 'today' }"
            :aria-pressed="draftMode === 'today'"
            @click="selectQuickMode('today')"
          >
            {{ $t("今日") }}
          </button>
          <button
            type="button"
            class="time-panel__quick-item"
            :class="{ 'time-panel__quick-item--active': draftMode === 'yesterday' }"
            :aria-pressed="draftMode === 'yesterday'"
            @click="selectQuickMode('yesterday')"
          >
            {{ $t("昨日") }}
          </button>
        </div>
      </div>

      <div class="time-panel__title">{{ $t("自定义") }}</div>

      <ul class="time-panel__picker-header">
        <li><span>{{ $t("开始日期") }}</span></li>
        <li><span>{{ $t("结束日期") }}</span></li>
      </ul>

      <div class="time-panel__picker-row">
        <div class="time-panel__picker-item">
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
        </div>
        <div class="picker-content-item-line"></div>
        <div class="time-panel__picker-item">
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
      </div>

      <ul class="time-panel__actions">
        <li>
          <x-button class="time-panel__action" plain type="primary" @click="handleCancel">
            {{ $t("取消") }}
          </x-button>
        </li>
        <li>
          <x-button class="time-panel__action" @click="handleConfirm">
            {{ $t("确认") }}
          </x-button>
        </li>
      </ul>
    </div>
  </van-popover>
</template>

<style scoped lang="less">
.time-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-width: 65px;
  height: 25px;
  padding: 0 10px;
  gap: 6px;
  color: var(--skin__neutral_2, var(--skin__lead));
  font-family: inherit;
  background: var(--skin__bg_2, #191919);
  border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
  border-radius: 14px;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;

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
    transition: color 0.2s ease, transform 0.3s linear;
  }

  &:focus-visible {
    outline: 2px solid var(--skin__primary);
    outline-offset: 2px;
  }
}

.time-trigger--active {
  color: var(--skin__primary);
  border-color: var(--skin__primary);

  .time-trigger__arrow {
    color: var(--skin__primary);
  }
}

.time-panel {
  display: flex;
  flex-direction: column;
  width: min(355px, calc(100vw - 20px));
  overflow: hidden;
  color: var(--skin__neutral_2);
  background: var(--skin__bg_2);
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .time-panel__quick {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }

  .time-panel__quick-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100% - 20px) / 3);
    height: 35px;
    padding: 0;
    color: var(--skin__lead);
    font-family: inherit;
    font-size: 12px;
    line-height: 1;
    text-align: center;
    background: transparent;
    border: var(--lobby__px, 0.5px) solid var(--skin__border);
    border-radius: 7px;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;

    &:focus-visible {
      outline: 2px solid var(--skin__primary);
      outline-offset: -2px;
    }
  }

  .time-panel__quick-item--active {
    color: var(--skin__primary);
    border-color: var(--skin__primary);
  }

  .time-panel__title {
    padding: 5px 10px;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
  }

  .time-panel__picker-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    margin: 0 0 5px;
    overflow: hidden;
    font-size: 12px;

    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50%;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    span {
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
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    margin-bottom: 10px;

    .time-panel__picker-item {
      width: 50%;
      min-width: 0;
      padding: 0 10px;
      box-sizing: border-box;
    }

    .picker-content-item-line {
      width: 0.5px;
      height: 175px;
      margin: 0 5px;
      background-color: var(--skin__border);
      z-index: 10;
    }
  }

  .time-panel__picker {
    width: 100%;
    overflow: hidden;
  }

  .time-panel__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
    padding: 0 10px;
    margin: 0 0 10px;
    overflow: hidden;

    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50%;
      padding: 0;
      margin: 0;
      list-style: none;
    }
  }

  .time-panel__action {
    width: 100%;
    height: 40px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  :deep(.van-picker) {
    background: transparent;
  }

  :deep(.van-picker-column) {
    color: #6f6f6f;
    font-size: 12px;
    z-index: 2;
  }

  :deep(.van-picker__columns) {
    background: transparent;
  }

  :deep(.van-picker-column__item) {
    color: #6f6f6f;
    font-size: 12px;
    background: transparent;
  }

  :deep(.van-picker-column__item--selected) {
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 600;
  }

  :deep(.van-picker-column__item--selected + .van-picker-column__item) {
    color: var(--skin__neutral_1);
  }

  :deep(.van-picker-column__item--selected + .van-picker-column__item + .van-picker-column__item) {
    color: var(--skin__neutral_2);
  }

  :deep(.van-picker__mask) {
    background-image:
      linear-gradient(
        180deg,
        rgba(var(--skin__bg_2__toRgbString), 0.9),
        rgba(var(--skin__bg_2__toRgbString), 0.4)
      ),
      linear-gradient(
        0deg,
        rgba(var(--skin__bg_2__toRgbString), 0.9),
        rgba(var(--skin__bg_2__toRgbString), 0.4)
      );
    z-index: 3;
  }

  :deep(.van-picker__frame) {
    right: 0;
    left: 0;
    background-color: transparent;
    border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);

    &::after {
      display: none;
    }
  }
}

:deep(.account-time-filter__popover.van-popover) {
  overflow: visible;
  background: transparent;
}

:deep(.account-time-filter__popover .van-popover__content) {
  overflow: hidden;
  background: var(--skin__bg_2);
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(var(--skin__web_left_bg_shadow_active__toRgbString), 0.3);
}
</style>
