<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { createClaimDefaultRange, type ClaimDateRangeValue } from "./types";

const props = defineProps<{
  modelValue?: ClaimDateRangeValue | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: ClaimDateRangeValue): void;
  (event: "change", value: ClaimDateRangeValue): void;
}>();

const minDate = dayjs().subtract(3, "month").toDate();
const maxDate = dayjs().toDate();
const showPopover = ref(false);
const draftMode = ref<ClaimDateRangeValue["mode"]>("today");
const draftStartDate = ref<string[]>([]);
const draftEndDate = ref<string[]>([]);

function toPickerValue(dateText: string) {
  const parsedDate = dayjs(dateText);
  return (parsedDate.isValid() ? parsedDate : dayjs()).format("YYYY-MM-DD").split("-");
}

function parsePickerValue(dateValue: string[]) {
  return `${dateValue[0]}-${String(dateValue[1]).padStart(2, "0")}-${String(dateValue[2]).padStart(2, "0")}`;
}

function createRange(mode: ClaimDateRangeValue["mode"], startDate: string, endDate: string): ClaimDateRangeValue {
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);
  const normalizedStartDay = startDay.isAfter(endDay) ? endDay : startDay;
  const normalizedEndDay = startDay.isAfter(endDay) ? startDay : endDay;

  return {
    mode,
    startTime: normalizedStartDay.startOf("day").unix(),
    endTime: normalizedEndDay.endOf("day").unix(),
    startDate: normalizedStartDay.format("YYYY-MM-DD"),
    endDate: normalizedEndDay.format("YYYY-MM-DD")
  };
}

function createPresetRange(mode: "today" | "yesterday") {
  const targetDate = mode === "yesterday" ? dayjs().subtract(1, "day") : dayjs();
  const dateText = targetDate.format("YYYY-MM-DD");
  return createRange(mode, dateText, dateText);
}

function syncDraft(rangeValue: ClaimDateRangeValue) {
  draftMode.value = rangeValue.mode;
  draftStartDate.value = toPickerValue(rangeValue.startDate);
  draftEndDate.value = toPickerValue(rangeValue.endDate);
}

const currentRange = computed(() => props.modelValue ?? createClaimDefaultRange());
const rangeText = computed(() => {
  if (!currentRange.value) return "请选择日期范围";
  const startDate = dayjs(currentRange.value.startDate).format("YYYY/MM/DD");
  const endDate = dayjs(currentRange.value.endDate).format("YYYY/MM/DD");
  return `${startDate} - ${endDate}`;
});

function togglePopover() {
  if (!showPopover.value) {
    syncDraft(currentRange.value ?? createPresetRange("today"));
  }
  showPopover.value = !showPopover.value;
}

function selectQuickMode(mode: "today" | "yesterday") {
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
    syncDraft(rangeValue ?? createClaimDefaultRange());
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
        class="claim-date-range__trigger"
        :class="{
          'claim-date-range__trigger--active': showPopover,
          'claim-date-range__trigger--filled': currentRange
        }"
        type="button"
        @click.stop="togglePopover"
      >
        <svg-icon name="icon_wd_zcrq" class-name="claim-date-range__calendar" />
        <span class="claim-date-range__required">*</span>
        <span class="claim-date-range__value">{{ rangeText }}</span>
        <svg-icon
          name="comm_icon_fh"
          class-name="claim-date-range__arrow"
          :class="{ 'claim-date-range__arrow--active': showPopover }"
        />
      </button>
    </template>

    <div class="claim-date-range__panel">
      <div class="claim-date-range__quick">
        <button
          type="button"
          :class="{ 'is-active': draftMode === 'today' }"
          @click="selectQuickMode('today')"
        >
          {{ $t("今日") }}
        </button>
        <button
          type="button"
          :class="{ 'is-active': draftMode === 'yesterday' }"
          @click="selectQuickMode('yesterday')"
        >
          {{ $t("昨日") }}
        </button>
      </div>

      <div class="claim-date-range__title">{{ $t("自定义") }}</div>
      <div class="claim-date-range__picker-heading">
        <span>{{ $t("开始日期") }}</span>
        <span>{{ $t("结束日期") }}</span>
      </div>
      <div class="claim-date-range__picker-row">
        <van-date-picker
          v-model="draftStartDate"
          :columns-type="['year', 'month', 'day']"
          :min-date="minDate"
          :max-date="maxDate"
          :show-toolbar="false"
          :option-height="35"
          :visible-option-num="5"
          @change="markCustomMode"
        />
        <i></i>
        <van-date-picker
          v-model="draftEndDate"
          :columns-type="['year', 'month', 'day']"
          :min-date="minDate"
          :max-date="maxDate"
          :show-toolbar="false"
          :option-height="35"
          :visible-option-num="5"
          @change="markCustomMode"
        />
      </div>
      <div class="claim-date-range__actions">
        <x-button plain type="primary" @click="handleCancel">{{ $t("取消") }}</x-button>
        <x-button type="primary" @click="handleConfirm">{{ $t("确认") }}</x-button>
      </div>
    </div>
  </van-popover>
</template>

<style scoped lang="less">
.claim-date-range__trigger {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 35px;
  padding: 0 30px 0 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
  border-radius: 7px;
  color: var(--skin__neutral_3);
  font-family: inherit;
  font-size: 11px;
  text-align: left;
  background: var(--skin__bg_2);
  box-sizing: border-box;
}

.claim-date-range__trigger--active {
  border-color: var(--skin__primary);
}

.claim-date-range__trigger--filled .claim-date-range__value {
  color: var(--skin__lead);
}

.claim-date-range__calendar {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  color: var(--skin__neutral_2);
}

.claim-date-range__required {
  flex-shrink: 0;
  margin: 1px 5px 0;
  color: var(--skin__accent_2);
}

.claim-date-range__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.claim-date-range__arrow {
  position: absolute;
  right: 11px;
  width: 7px;
  height: 12px;
  color: var(--skin__neutral_2);
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.claim-date-range__arrow--active {
  transform: rotate(90deg);
}

.claim-date-range__panel {
  width: min(355px, calc(100vw - 20px));
  padding: 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  color: var(--skin__neutral_2);
  background: var(--skin__bg_2);
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  box-sizing: border-box;
}

.claim-date-range__quick {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.claim-date-range__quick button {
  flex: 1;
  height: 35px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px;
  color: var(--skin__lead);
  font-size: 12px;
  background: transparent;
}

.claim-date-range__quick button.is-active {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
}

.claim-date-range__title {
  margin-bottom: 5px;
  color: var(--skin__lead);
  font-size: 12px;
}

.claim-date-range__picker-heading,
.claim-date-range__picker-row {
  display: flex;
  align-items: center;
}

.claim-date-range__picker-heading span {
  flex: 1;
  color: var(--skin__neutral_1);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.claim-date-range__picker-row {
  margin-bottom: 10px;
}

.claim-date-range__picker-row > :deep(.van-picker) {
  flex: 0 0 calc((100% - 11px) / 2);
  width: calc((100% - 11px) / 2);
  min-width: 0;
  padding: 0 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.claim-date-range__picker-row > i {
  width: var(--lobby__px, 0.5px);
  height: 155px;
  margin: 0 5px;
  background: var(--skin__border);
}

.claim-date-range__panel :deep(.van-picker) {
  background: transparent;
}

.claim-date-range__panel :deep(.van-picker-column__item) {
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.claim-date-range__panel :deep(.van-picker-column__item--selected) {
  color: var(--skin__lead);
  font-size: 12px;
  font-weight: 600;
}

.claim-date-range__panel :deep(.van-picker__mask) {
  background-image:
    linear-gradient(180deg, rgba(var(--skin__bg_2__toRgbString), 0.94), rgba(var(--skin__bg_2__toRgbString), 0.6)),
    linear-gradient(0deg, rgba(var(--skin__bg_2__toRgbString), 0.94), rgba(var(--skin__bg_2__toRgbString), 0.6));
}

.claim-date-range__panel :deep(.van-picker__frame) {
  right: 0;
  left: 0;
  border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
  background: transparent;
}

.claim-date-range__panel :deep(.van-picker__frame::after) {
  display: none;
}

.claim-date-range__actions {
  display: flex;
  gap: 10px;
}

.claim-date-range__actions :deep(.x-button) {
  flex: 1;
  width: auto;
  height: 40px;
}

[dir="rtl"] .claim-date-range__trigger {
  padding-right: 10px;
  padding-left: 30px;
  text-align: right;
}

[dir="rtl"] .claim-date-range__arrow {
  right: auto;
  left: 11px;
}
</style>
