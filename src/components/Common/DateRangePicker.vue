<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { formatResponsiveSize } from "@/utils/viewport";

defineOptions({
  name: "DateRangePicker"
});

type DateRangeMode = "all" | "today" | "yesterday" | "custom";
type QuickMode = Extract<DateRangeMode, "all" | "today" | "yesterday">;

export interface DateRangeValue {
  mode: DateRangeMode;
  label: string;
  startTime: number;
  endTime: number;
  startDate: string;
  endDate: string;
}

const QUICK_MODE_LABELS: Record<QuickMode, string> = {
  all: "全部",
  today: "今日",
  yesterday: "昨日"
};

const DEFAULT_PICKER_WIDTH = 152;
const DEFAULT_PANEL_WIDTH = 355;

const props = withDefaults(defineProps<{
  modelValue?: DateRangeValue;
  panelWidth?: number | string;
  pickerWidth?: number | string;
  quickModes?: QuickMode[];
}>(), {
  panelWidth: DEFAULT_PANEL_WIDTH,
  quickModes: () => ["today", "yesterday"]
});

const emit = defineEmits<{
  (event: "update:modelValue", value: DateRangeValue): void;
  (event: "change", value: DateRangeValue): void;
}>();

const minDate = dayjs().subtract(3, "month").toDate();
const maxDate = dayjs().toDate();
const showPopover = ref(false);
const draftMode = ref<DateRangeMode>("today");
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

function createRange(mode: DateRangeMode, startDate: string, endDate: string) {
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);
  let normalizedStartDay = startDay;
  let normalizedEndDay = endDay;

  if (startDay.isAfter(endDay)) {
    normalizedStartDay = endDay;
    normalizedEndDay = startDay;
  }

  const normalizedStartDate = normalizedStartDay.format("YYYY-MM-DD");
  const normalizedEndDate = normalizedEndDay.format("YYYY-MM-DD");
  const label = mode === "custom"
    ? `${normalizedStartDay.format("MM/DD")}-${normalizedEndDay.format("MM/DD")}`
    : QUICK_MODE_LABELS[mode];

  return {
    mode,
    label,
    startTime: normalizedStartDay.startOf("day").unix(),
    endTime: normalizedEndDay.endOf("day").unix(),
    startDate: normalizedStartDate,
    endDate: normalizedEndDate
  } satisfies DateRangeValue;
}

function createPresetRange(mode: QuickMode) {
  if (mode === "all") {
    const endDay = dayjs();
    return createRange(mode, endDay.subtract(89, "day").format("YYYY-MM-DD"), endDay.format("YYYY-MM-DD"));
  }

  const targetDate = mode === "yesterday" ? dayjs().subtract(1, "day") : dayjs();
  return createRange(mode, targetDate.format("YYYY-MM-DD"), targetDate.format("YYYY-MM-DD"));
}

function syncDraft(rangeValue: DateRangeValue) {
  draftMode.value = rangeValue.mode;
  draftStartDate.value = toPickerValue(rangeValue.startDate);
  draftEndDate.value = toPickerValue(rangeValue.endDate);
}

const currentRange = computed(() => props.modelValue ?? createPresetRange("today"));
const currentLabel = computed(() => currentRange.value.label);
const hasCustomPickerWidth = computed(() => props.pickerWidth !== undefined && props.pickerWidth !== null && props.pickerWidth !== "");
const resolvedPanelWidth = computed(() => formatResponsiveSize(props.panelWidth, DEFAULT_PANEL_WIDTH));
const resolvedPickerWidth = computed(() => formatResponsiveSize(props.pickerWidth, DEFAULT_PICKER_WIDTH));
const panelStyle = computed(() => ({
  "--date-range-panel-width": resolvedPanelWidth.value,
  ...(hasCustomPickerWidth.value ? { "--date-range-picker-width": resolvedPickerWidth.value } : {})
}));
const visibleQuickModes = computed(() => props.quickModes.filter(mode => ["all", "today", "yesterday"].includes(mode)));
const hasQuickModes = computed(() => visibleQuickModes.value.length > 0);

function togglePopover() {
  if (!showPopover.value) {
    syncDraft(currentRange.value);
  }

  showPopover.value = !showPopover.value;
}

function selectQuickMode(mode: QuickMode) {
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

    <div class="time-panel" :class="{ 'time-panel--fixed-picker': hasCustomPickerWidth }" :style="panelStyle">
      <div v-if="hasQuickModes" class="time-panel__quick">
        <div
          v-for="mode in visibleQuickModes"
          :key="mode"
          class="time-panel__quick-item"
          :class="{ 'time-panel__quick-item--active': draftMode === mode }"
          role="button"
          tabindex="0"
          :aria-pressed="draftMode === mode"
          @click="selectQuickMode(mode)"
          @keydown.enter.space.prevent="selectQuickMode(mode)"
        >
          {{ QUICK_MODE_LABELS[mode] }}
        </div>
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
  border: 1px solid var(--skin__border);
  border-radius: 9999px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2, var(--skin__lead));
  box-sizing: border-box;
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
  }
}

.time-trigger--active {
  border-color: var(--skin__primary);
  color: var(--skin__primary);

  .time-trigger__arrow {
    color: var(--skin__primary);
  }
}

.time-panel {
  width: var(--date-range-panel-width);
  background: var(--skin__bg_2);
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
    flex: 1;
    min-width: 0;
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
    border-color: var(--skin__primary);
    color: var(--skin__primary);
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
    min-width: 0;
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

  :deep(.van-picker) {
    background: transparent;
  }

  :deep(.van-picker-column) {
    font-size: 12px;
    color: var(--skin__neutral_2);
  }

  :deep(.van-picker__columns) {
    background: transparent;
  }

  :deep(.van-picker-column__item) {
    color: var(--skin__neutral_2);
    font-size: 12px;
  }

  :deep(.van-picker-column__item--selected) {
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 600;
  }

  :deep(.van-picker__mask) {
    background-image: linear-gradient(180deg, rgba(var(--skin__bg_2__toRgbString), 0.94), rgba(var(--skin__bg_2__toRgbString), 0.6)), linear-gradient(0deg, rgba(var(--skin__bg_2__toRgbString), 0.94), rgba(var(--skin__bg_2__toRgbString), 0.6));
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

.time-panel--fixed-picker {
  .time-panel__picker {
    flex: 0 0 auto;
    width: calc(var(--date-range-picker-width) + 20px);
  }
}

</style>
