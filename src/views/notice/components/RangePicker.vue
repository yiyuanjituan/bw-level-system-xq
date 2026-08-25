<script setup lang="ts">
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { computed, ref, useSlots, watch } from "vue";

dayjs.extend(isoWeek);

export interface RangeOption {
  text: string;
  value: string;
  startTime: number;
  endTime: number;
}

const defaultOptions: RangeOption[] = [
  {
    text: "今日",
    value: "today",
    startTime: dayjs().startOf("day").unix(),
    endTime: dayjs().endOf("day").unix()
  },
  {
    text: "昨日",
    value: "yesterday",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix()
  },
  {
    text: "本周",
    value: "this-week",
    startTime: dayjs().startOf("isoWeek").unix(),
    endTime: dayjs().endOf("isoWeek").unix()
  },
  {
    text: "上周",
    value: "last-week",
    startTime: dayjs().subtract(1, "week").startOf("isoWeek").unix(),
    endTime: dayjs().subtract(1, "week").endOf("isoWeek").unix()
  },
  {
    text: "本月",
    value: "this-month",
    startTime: dayjs().startOf("month").unix(),
    endTime: dayjs().endOf("month").unix()
  },
  {
    text: "上月",
    value: "last-month",
    startTime: dayjs().subtract(1, "month").startOf("month").unix(),
    endTime: dayjs().subtract(1, "month").endOf("month").unix()
  },
  {
    text: "全部",
    value: "all",
    startTime: 0,
    endTime: 0
  }
];

interface Props {
  options?: RangeOption[];
}

const modelValue = defineModel<string>();
const props = defineProps<Props>();
const slots = useSlots();
const dropdownItemRef = ref<any>();
const isOpen = ref(false);
const draftValue = ref("");

const emit = defineEmits<{
  (e: "change", value: string, option: RangeOption): void;
}>();

const rangeOptions = computed(() => {
  return props.options?.length ? props.options : defaultOptions;
});

// 保持稳定的兜底选项，避免外部传入无效值时无法映射到可用范围。
function getFallbackOption() {
  return rangeOptions.value.find(option => option.value === "all") ?? rangeOptions.value[0];
}

function normalizeValue(value: unknown) {
  const currentValue = Array.isArray(value) ? value[0] : value;
  const stringValue = String(currentValue ?? getFallbackOption().value);
  const matchedOption = rangeOptions.value.find(option => option.value === stringValue);

  return matchedOption?.value ?? getFallbackOption().value;
}

function getSelectedOption(value: string) {
  return rangeOptions.value.find(option => option.value === value) ?? getFallbackOption();
}

const selectedValue = computed(() => normalizeValue(modelValue.value));
const selectedOption = computed(() => getSelectedOption(selectedValue.value));
const hasCustomTrigger = computed(() => Boolean(slots.trigger));
// 面板内使用草稿值，用户取消时不会直接改动已确认的选中项。
const draftOption = computed(() => getSelectedOption(draftValue.value));

function closeDropdown() {
  dropdownItemRef.value?.toggle(false);
}

function handleOpen() {
  isOpen.value = true;
  draftValue.value = selectedValue.value;
}

function handleClose() {
  isOpen.value = false;
  draftValue.value = selectedValue.value;
}

function handleSelect(option: RangeOption) {
  draftValue.value = option.value;
}

function handleCancel() {
  closeDropdown();
}

function handleConfirm() {
  const option = getSelectedOption(draftValue.value);

  if (selectedValue.value !== option.value) {
    modelValue.value = option.value;
    emit("change", option.value, option);
  }

  closeDropdown();
}

watch(
  modelValue,
  (value) => {
    const nextValue = normalizeValue(value);

    if (nextValue !== value) {
      modelValue.value = nextValue;
    }

    // 弹层打开时保留临时草稿值，等待用户确认或取消。
    if (!isOpen.value) {
      draftValue.value = nextValue;
    }
  },
  { immediate: true }
);

watch(
  () => props.options,
  () => {
    const nextValue = normalizeValue(modelValue.value);

    if (nextValue !== modelValue.value) {
      modelValue.value = nextValue;
    }

    // 仅在用户未操作弹层时，选项变更才同步刷新草稿值。
    if (!isOpen.value) {
      draftValue.value = nextValue;
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div
    class="range-picker"
    :class="{ 'range-picker--custom-trigger': hasCustomTrigger }"
  >
    <van-dropdown-menu active-color="#DFBE5B" direction="down">
      <van-dropdown-item
        ref="dropdownItemRef"
        @open="handleOpen"
        @close="handleClose"
      >
        <template #title>
          <slot
            name="trigger"
            :selected-option="selectedOption"
            :selected-value="selectedValue"
            :is-open="isOpen"
          >
            <div
              class="range-picker__trigger"
              :class="{ 'is-open': isOpen }"
            >
              <span class="range-picker__trigger-label">{{ selectedOption.text }}</span>
              <svg-icon name="arrow-back" :class-name="isOpen ? 'rotate-[90deg]' : 'rotate-[-90deg]'" class="text-[10px]" style="transition: all .3s" />
            </div>
          </slot>
        </template>

        <div class="range-picker__popup">
          <div class="range-picker__panel">
            <div class="range-picker__grid">
              <button
                v-for="option in rangeOptions"
                :key="option.value"
                class="range-picker__option"
                :class="{ 'is-active': option.value === draftOption.value }"
                type="button"
                @click="handleSelect(option)"
              >
                {{ option.text }}
              </button>
            </div>

            <div class="range-picker__actions">
              <button
                class="range-picker__action range-picker__action--ghost"
                type="button"
                @click="handleCancel"
              >
                {{ $t("取消") }}
              </button>
              <button
                class="range-picker__action range-picker__action--primary"
                type="button"
                @click="handleConfirm"
              >
                {{ $t("确认") }}
              </button>
            </div>
          </div>
        </div>
      </van-dropdown-item>
    </van-dropdown-menu>
  </div>
</template>

<style scoped lang="less">
.range-picker {
  display: inline-block;
  min-width: 65px;

  --van-dropdown-menu-height: 25px;
  --van-dropdown-menu-title-font-size: 10px;
  --van-dropdown-menu-title-text-color: #dfbe5b;
  --van-dropdown-menu-title-active-text-color: #dfbe5b;
  --van-dropdown-menu-background: transparent;

  :deep(.van-dropdown-menu) {
    width: 100%;
    background: transparent;
  }

  :deep(.van-dropdown-menu__bar) {
    height: var(--van-dropdown-menu-height) !important;
    background: transparent;
    box-shadow: none;
  }

  :deep(.van-dropdown-menu__item) {
    justify-content: flex-start;
  }

  :deep(.van-dropdown-menu__title) {
    width: 100%;
    padding: 0;
    line-height: 1;
    text-align: left;
    border: 0;
    color: inherit;
    border-radius: 0;
    background: transparent;
  }

  :deep(.van-dropdown-menu__title--active) {
    color: inherit;
  }

  :deep(.van-dropdown-menu__title::after) {
    display: none;
  }

  :deep(.van-dropdown-menu__title .van-ellipsis) {
    overflow: visible;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 25px;
    padding: 0 10px 0 12px;
    border: 1px solid var(--skin__border);
    box-sizing: border-box;
    border-radius: 9999px;
    background: #161616;
    color: var(--skin__neutral_2);
    font-size: 10px;
    line-height: 25px;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  &__trigger.is-open {
    border-color: var(--skin__primary);
    color: #dfbe5b;
  }

  &__trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__trigger-arrow {
    flex: none;
    width: 0;
    height: 0;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    border-top: 5px solid currentColor;
    transition: transform 0.2s ease;
  }

  &__trigger.is-open &__trigger-arrow {
    transform: rotate(180deg);
  }

  &--custom-trigger {
    min-width: 0;
  }

  :deep(.van-dropdown-item__content) {
    background: transparent;
    box-shadow: none;
    transition: opacity 0.2s ease !important;
    transform: none !important;
  }

  :deep(.van-dropdown-item__content.van-popup-slide-top-enter-active),
  :deep(.van-dropdown-item__content.van-popup-slide-top-leave-active) {
    transition: opacity 0.2s ease !important;
  }

  :deep(.van-dropdown-item__content.van-popup-slide-top-enter-from),
  :deep(.van-dropdown-item__content.van-popup-slide-top-leave-active) {
    opacity: 0;
    transform: none !important;
  }

  &__popup {
    padding: 4px 10px 0;
    background: transparent;
  }

  &__panel {
    width: min(355px, calc(100vw - 20px));
    margin: 0 auto;
    padding: 10px;
    background: #1d1d1d;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.36);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  &__option {
    height: 35px;
    border: 1px solid #2a2a2a;
    box-sizing: border-box;
    border-radius: 7px;
    background: #1d1d1d;
    color: #fff;
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  &__option.is-active {
    color: #dfbe5b;
    border-color: #dfbe5b;
    background: rgba(223, 190, 91, 0.04);
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  &__action {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  &__action--ghost {
    color: #dfbe5b;
    border: 1px solid #dfbe5b;
    background: transparent;
  }

  &__action--primary {
    color: #fff;
    border: 1px solid #dfbe5b;
    background: #dfbe5b;
  }
}
</style>
