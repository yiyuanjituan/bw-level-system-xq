<script setup lang="ts">
import { computed, ref } from "vue";

defineOptions({
  name: "x-date-picker"
});

interface PickerConfirmParams {
  selectedValues: Array<string | number>;
}

interface Props {
  disabled?: boolean;
  title?: string;
  placeholder?: string;
  suffixIcon?: string;
  suffixIconName?: string;
  minDate?: Date;
  maxDate?: Date;
  optionHeight?: number;
  visibleOptionNum?: number;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  title: "选择日期",
  placeholder: "年 / 月 / 日",
  suffixIcon: "",
  suffixIconName: "",
  minDate: () => new Date(1900, 0, 1),
  maxDate: () => new Date(),
  optionHeight: 35,
  visibleOptionNum: 6,
  zIndex: 2002
});

const modelValue = defineModel<string>({ default: "" });
const showPicker = ref(false);
const pickerValue = ref<string[]>([]);

const emit = defineEmits<{
  (event: "change", value: string): void;
  (event: "confirm", value: string): void;
  (event: "cancel"): void;
  (event: "focus"): void;
  (event: "blur"): void;
}>();

const displayValue = computed(() => modelValue.value ? modelValue.value.replaceAll("-", "/") : "");

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function getInitialValue() {
  const minValue = formatDate(props.minDate);
  const maxValue = formatDate(props.maxDate);
  const currentValue = modelValue.value;

  if (!isValidDate(currentValue)) {
    return maxValue;
  }

  if (currentValue < minValue) {
    return minValue;
  }

  if (currentValue > maxValue) {
    return maxValue;
  }

  return currentValue;
}

function openPicker() {
  if (props.disabled) {
    return;
  }

  pickerValue.value = getInitialValue().split("-");
  showPicker.value = true;
  emit("focus");
}

function handleConfirm({ selectedValues }: PickerConfirmParams) {
  const value = selectedValues
    .map((selectedValue, index) => index === 0 ? String(selectedValue) : String(selectedValue).padStart(2, "0"))
    .join("-");

  modelValue.value = value;
  showPicker.value = false;
  emit("change", value);
  emit("confirm", value);
}

function handleCancel() {
  showPicker.value = false;
  emit("cancel");
}

function handleClosed() {
  emit("blur");
}
</script>

<template>
  <div class="x-date-picker">
    <button
      type="button"
      class="x-date-picker__trigger"
      :class="{ 'x-date-picker__trigger--disabled': disabled }"
      :disabled="disabled"
      @click="openPicker"
    >
      <span
        class="x-date-picker__value"
        :class="{ 'x-date-picker__placeholder': !displayValue }"
      >
        {{ displayValue || placeholder }}
      </span>
      <svg-icon v-if="suffixIconName" :name="suffixIconName" class-name="x-date-picker__arrow-svg" />
      <img v-else-if="suffixIcon" :src="suffixIcon" class="x-date-picker__arrow-image" alt="" />
      <svg-icon v-else name="arrow-back" class-name="x-date-picker__arrow" />
    </button>

    <van-popup
      v-model:show="showPicker"
      class="x-date-picker__popup"
      position="bottom"
      teleport="body"
      :z-index="zIndex"
      :overlay-style="{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }"
      @closed="handleClosed"
    >
      <van-date-picker
        v-model="pickerValue"
        :title="title"
        cancel-button-text="取消"
        confirm-button-text="确定"
        :columns-type="['year', 'month', 'day']"
        :min-date="minDate"
        :max-date="maxDate"
        :option-height="optionHeight"
        :visible-option-num="visibleOptionNum"
        @cancel="handleCancel"
        @confirm="handleConfirm"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.x-date-picker {
  width: 100%;
}

.x-date-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 35px;
  padding: 0 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
  border-radius: 7px;
  box-sizing: border-box;
  color: var(--skin__lead);
  font-family: inherit;
  text-align: left;
  background: var(--skin__bg_2);
  cursor: pointer;

  &:focus {
    border-color: var(--skin__primary);
    outline: 0;
  }

  &--disabled {
    color: var(--skin__neutral_2);
    background: var(--skin__bg_1);
    cursor: default;
  }
}

.x-date-picker__value {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.x-date-picker__placeholder {
  color: var(--skin__neutral_2);
}

.x-date-picker__arrow {
  width: 9px;
  height: 9px;
  color: var(--skin__neutral_2);
  transform: rotate(-90deg);
}

.x-date-picker__arrow-image {
  flex-shrink: 0;
  width: 7px;
  height: 11px;
  margin-left: 8px;
  object-fit: contain;
  transform: rotate(180deg);
}

.x-date-picker__arrow-svg {
  flex-shrink: 0;
  width: 7px;
  height: 11px;
  margin-left: 8px;
  color: var(--skin__neutral_2);
  transform: rotate(180deg);
}

.x-date-picker__popup {
  padding-bottom: var(--skin__safe-area-inset-bottom);
  background: var(--skin__bg_2);

  :deep(.van-picker) {
    background: var(--skin__bg_2);
  }

  :deep(.van-picker__toolbar) {
    height: 40px;
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
  }

  :deep(.van-picker__cancel),
  :deep(.van-picker__confirm),
  :deep(.van-picker__title) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.van-picker__cancel),
  :deep(.van-picker__confirm) {
    height: 100%;
    padding: 0 15px;
  }

  :deep(.van-picker__cancel) {
    color: var(--skin__neutral_2);
    text-align: left;
  }

  :deep(.van-picker__title) {
    color: var(--skin__lead);
    text-align: center;
  }

  :deep(.van-picker__confirm) {
    color: var(--skin__primary);
    text-align: right;
  }

  :deep(.van-picker__columns) {
    direction: ltr;
    background: var(--skin__bg_2);
  }

  :deep(.van-picker-column__item) {
    padding: 0 4px;
    color: var(--skin__neutral_2);
    font-size: 11px;
  }

  :deep(.van-picker-column__item--selected) {
    color: var(--skin__lead);
    font-size: 15px;
  }

  :deep(.van-picker__mask) {
    background-image:
      linear-gradient(180deg, rgba(var(--skin__bg_2__toRgbString), 0.9), rgba(var(--skin__bg_2__toRgbString), 0.4)),
      linear-gradient(0deg, rgba(var(--skin__bg_2__toRgbString), 0.9), rgba(var(--skin__bg_2__toRgbString), 0.4));
  }

  :deep(.van-picker__frame) {
    right: 0;
    left: 0;
    border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
    background: transparent !important;

    &::after {
      display: none;
    }
  }
}
</style>
