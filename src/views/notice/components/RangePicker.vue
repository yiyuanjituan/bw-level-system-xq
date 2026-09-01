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

function togglePopover() {
  if (!isOpen.value) {
    draftValue.value = selectedValue.value;
  }

  isOpen.value = !isOpen.value;
}

function handleClose() {
  draftValue.value = selectedValue.value;
}

function handleSelect(option: RangeOption) {
  draftValue.value = option.value;
}

function handleCancel() {
  isOpen.value = false;
}

function handleConfirm() {
  const option = getSelectedOption(draftValue.value);

  if (selectedValue.value !== option.value) {
    modelValue.value = option.value;
    emit("change", option.value, option);
  }

  isOpen.value = false;
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
    <van-popover
      v-model:show="isOpen"
      trigger="manual"
      placement="bottom-start"
      theme="light"
      :show-arrow="false"
      :offset="[0, 8]"
      teleport="body"
      @close="handleClose"
    >
      <template #reference>
        <div class="range-picker__reference" @click.stop="togglePopover">
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
        </div>
      </template>

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
          <x-button
            class="range-picker__action range-picker__action--ghost"
            plain
            type="primary"
            @click="handleCancel"
          >
            {{ $t("取消") }}
          </x-button>
          <x-button
            class="range-picker__action range-picker__action--primary"
            type="primary"
            @click="handleConfirm"
          >
            {{ $t("确认") }}
          </x-button>
        </div>
      </div>
    </van-popover>
  </div>
</template>

<style scoped lang="less">
.range-picker {
  display: inline-block;
  min-width: 65px;
  height: 25px;

  :deep(.van-popover) {
    background: transparent;
  }

  :deep(.van-popover__wrapper) {
    display: block;
    width: 100%;
    height: 25px;
  }

  :deep(.van-popover__content) {
    overflow: visible;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    height: 25px;
    min-height: 25px;
    padding: 0 10px;
    border: 1px solid var(--skin__border);
    box-sizing: border-box;
    border-radius: 9999px;
    background: var(--skin__bg_2);
    color: var(--skin__neutral_2);
    font-size: 10px;
    line-height: 25px;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  &__trigger.is-open {
    border-color: var(--skin__primary);
    color: var(--skin__primary);
  }

  &__trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--custom-trigger {
    min-width: 0;
  }

  &__reference {
    display: block;
    width: 100%;
    height: 25px;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    width: min(355px, calc(100vw - 20px));
    margin: 0 auto;
    padding: 0;
    color: var(--skin__neutral_2);
    background: var(--skin__bg_2);
    border: var(--lobby__px) solid var(--skin__border);
    border-radius: 7px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }

  &__grid {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  &__option {
    height: 35px;
    padding: 0;
    border: var(--lobby__px) solid var(--skin__border);
    box-sizing: border-box;
    border-radius: 7px;
    background: transparent;
    color: var(--skin__lead);
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  &__option.is-active {
    color: var(--skin__primary);
    border-color: var(--skin__primary);
    background: transparent;
  }

  &__actions {
    display: flex;
    align-items: center;
    height: 40px;
    margin: 0 0 10px;
    padding: 0 10px;
    gap: 10px;
    overflow: hidden;
  }

  &__action {
    flex: 1;
    min-width: 0;
    width: 100%;
    height: 40px;
    padding: 0;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 400;
    transition: opacity 0.2s ease;
  }

  &__action--ghost {
    color: var(--skin__primary);
    border-color: var(--skin__primary);
    background: transparent;
  }

  &__action--primary {
    color: var(--skin__text_primary);
    border-color: var(--skin__primary);
    background: var(--skin__primary);
  }
}
</style>
