<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { X_FORM_CONTEXT_KEY, X_FORM_ITEM_PROP_KEY } from "./x-form-context";
import XPopover from "./x-popover.vue";

defineOptions({
  name: "x-select"
});

interface SelectOption {
  id?: string | number;
  value?: string | number;
  label?: string;
  icon?: string;
  disabled?: boolean;
  [key: string]: any;
}

type SelectModelValue = string | number | SelectOption | null | undefined;

interface Props {
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixColor?: string;
  options: SelectOption[];
  showArrow?: boolean;
  clearable?: boolean;
  valueKey?: string;
  labelKey?: string;
  iconKey?: string;
  validateEvent?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  fitOptionWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  placeholder: "请选择",
  prefix: "",
  suffix: "",
  suffixColor: "",
  options: () => [],
  showArrow: true,
  clearable: false,
  valueKey: "id",
  labelKey: "label",
  iconKey: "icon",
  validateEvent: true,
  placement: "bottom",
  fitOptionWidth: false
});

const modelValue = defineModel<SelectModelValue>({ default: "" });
const isOpen = ref(false);
const triggerRef = ref<HTMLElement>();
const dropdownWidth = ref(0);
const formContext = inject(X_FORM_CONTEXT_KEY, null);
const itemProp = inject(X_FORM_ITEM_PROP_KEY, null);
const prop = computed(() => itemProp?.value || "");

const emit = defineEmits<{
  (e: "change", value: string | number | ""): void;
  (e: "focus"): void;
  (e: "blur"): void;
}>();

function getOptionValue(option: SelectOption) {
  if (!option) return "";
  const configuredValue = option?.[props.valueKey];
  const fallbackValue = option?.id ?? option?.value ?? option?.key;
  return configuredValue ?? fallbackValue ?? "";
}

function getOptionLabel(option: SelectOption) {
  return (option?.[props.labelKey] ?? option?.label ?? "") as string;
}

function getOptionIcon(option: SelectOption) {
  return (option?.[props.iconKey] ?? option?.icon ?? "") as string;
}

function isEmptyValue(value: unknown) {
  return value === "" || value === null || value === undefined;
}

function isOptionLike(value: unknown): value is SelectOption {
  return !!value && typeof value === "object";
}

function getComparableValue(value: unknown) {
  if (value && typeof value === "object") {
    const optionLike = value as SelectOption;
    const configuredValue = optionLike?.[props.valueKey];
    const fallbackValue = optionLike?.id ?? optionLike?.value ?? optionLike?.key;
    return configuredValue ?? fallbackValue ?? value;
  }
  return value;
}

function normalizeComparableValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  return value;
}

const selectedOption = computed(() => {
  const currentValue = getComparableValue(modelValue.value);
  if (isEmptyValue(currentValue)) return null;
  return props.options.find(opt => isSameValue(getOptionValue(opt), currentValue));
});

const displayOption = computed<SelectOption | null>(() => {
  if (selectedOption.value) return selectedOption.value;
  if (isOptionLike(modelValue.value)) return modelValue.value;
  return null;
});

const displayLabel = computed(() => {
  if (displayOption.value) return getOptionLabel(displayOption.value);
  return isEmptyValue(modelValue.value) ? "" : String(modelValue.value).trim();
});

const displayIcon = computed(() => {
  if (!displayOption.value) return "";
  return getOptionIcon(displayOption.value);
});

const hasValue = computed(() => !isEmptyValue(modelValue.value));
const hasDisplayValue = computed(() => displayLabel.value !== "");
const hasError = computed(() => {
  if (!prop.value) return false;
  return !!formContext?.errors.value?.[prop.value];
});

const dropdownStyle = computed(() => {
  if (!dropdownWidth.value) {
    return props.fitOptionWidth
      ? { width: "max-content", maxWidth: "calc(100vw - 16px)" }
      : { width: "100%" };
  }

  if (props.fitOptionWidth) {
    return {
      minWidth: `${dropdownWidth.value}px`,
      width: "max-content",
      maxWidth: "calc(100vw - 16px)"
    };
  }

  return {
    width: `${dropdownWidth.value}px`
  };
});

function fieldHasRules() {
  const field = prop.value;
  return !!(field && formContext?.rules.value?.[field]);
}

function isSameValue(a: unknown, b: unknown) {
  const normalizedA = normalizeComparableValue(a);
  const normalizedB = normalizeComparableValue(b);

  if (normalizedA === normalizedB) return true;
  if (normalizedA === null || normalizedA === undefined || normalizedB === null || normalizedB === undefined) return false;
  return String(normalizedA) === String(normalizedB);
}

function validateValue(trigger: string, value?: unknown) {
  if (!props.validateEvent || !fieldHasRules() || !prop.value) return;
  formContext?.validateField(prop.value, trigger, value).catch(() => {});
}

function runValidation(trigger: string) {
  if (!props.validateEvent || !fieldHasRules() || !prop.value) return;
  formContext?.validateField(prop.value, trigger).catch(() => {});
}

function syncDropdownWidth() {
  dropdownWidth.value = triggerRef.value?.offsetWidth ?? 0;
}

function togglePopover() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) emit("focus");
  else {
    emit("blur");
    runValidation("blur");
  }
}

function closePopover() {
  if (isOpen.value) {
    isOpen.value = false;
    emit("blur");
    runValidation("blur");
  }
}

function handleSelect(option: SelectOption) {
  if (props.disabled || option.disabled) return;
  const value = getOptionValue(option) as string | number;
  modelValue.value = value;
  emit("change", value);
  validateValue("change", value);
  closePopover();
}

function clearValue(event: Event) {
  event.stopPropagation();
  modelValue.value = "";
  emit("change", "");
  validateValue("change", "");
}

watch(isOpen, async (value) => {
  if (value) {
    await nextTick();
    syncDropdownWidth();
  }
});

watch(
  () => getComparableValue(modelValue.value),
  (value, oldValue) => {
    if (isSameValue(value, oldValue)) return;
    runValidation("change");
  }
);

onMounted(() => {
  syncDropdownWidth();
  window.addEventListener("resize", syncDropdownWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncDropdownWidth);
});
</script>

<template>
  <x-popover
    v-model:show="isOpen"
    trigger="manual"
    :offset="[0, 0]"
    :placement="placement"
    @update:show="value => { if (!value) closePopover(); }"
  >
    <template #reference>
      <div
        ref="triggerRef"
        class="x-select"
        :class="{
          'x-select--focused': isOpen,
          'x-select--disabled': disabled,
          'x-select--invalid': hasError && !isOpen
        }"
        @click.stop="togglePopover"
      >
        <span class="x-select__prefix" v-if="$slots.prefix || prefix">
          <slot name="prefix" v-if="$slots.prefix" />
          <svg-icon v-else :name="prefix" class-name="x-select__prefix-icon" />
        </span>

        <div class="x-select__wrap">
          <span class="x-select__required-star" v-if="required && !hasValue">*</span>
          <div class="x-select__value">
            <span class="x-select__placeholder" v-if="!hasDisplayValue">{{ placeholder }}</span>
            <template v-else>
              <span class="x-select__icon-wrap" v-if="displayIcon">
                <img :src="displayIcon" class="x-select__icon" alt="." />
              </span>
              <span class="x-select__label">{{ displayLabel }}</span>
            </template>
          </div>
        </div>

        <span v-if="clearable && hasValue && !disabled" class="x-select__suffix x-select__clear" @click="clearValue">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" />
            <path d="M4 4L10 10M4 10L10 4" stroke="currentColor" stroke-width="1" />
          </svg>
        </span>

        <span class="x-select__suffix" v-else-if="$slots.suffix || suffix || showArrow">
          <slot name="suffix" v-if="$slots.suffix" />
          <svg-icon v-else-if="suffix" :name="suffix" class-name="x-select__suffix-icon" :style="{ color: suffixColor }" />
          <i v-else class="inline-flex justify-center items-center text-[9px]">
            <svg
              width="1em"
              height="1em"
              fill="currentColor"
              class="transition-all duration-500"
              :class="[isOpen ? 'rotate-[450deg]' : 'rotate-[270deg]']"
            >
              <use xlink:href="#ui-arrow-418a3a"></use>
            </svg>
          </i>
        </span>
      </div>
    </template>

    <div
      class="x-select-options"
      :class="{ 'x-select-options--fit-option-width': props.fitOptionWidth }"
      :style="dropdownStyle"
    >
      <div class="x-select-options__scroll">
        <div
          class="x-select-options__item"
          v-for="option in options"
          :key="String(getOptionValue(option))"
          :class="{
            'is-active': selectedOption && isSameValue(getOptionValue(option), getOptionValue(selectedOption)),
            'is-disabled': option.disabled
          }"
          @click="handleSelect(option)"
        >
          <div class="x-select-options__content">
            <img v-if="getOptionIcon(option)" :src="getOptionIcon(option)" class="x-select-options__icon" alt="." />
            <span>{{ getOptionLabel(option) }}</span>
          </div>
        </div>
      </div>
    </div>
  </x-popover>
</template>

<style scoped lang="less">
.x-select {
  border: var(--lobby__px) solid var(--skin__border);
  height: 35px;
  width: 100%;
  border-radius: 5px;
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--skin__bg_2);
  color: var(--skin__neutral_2);
  font-size: 11px;
  padding: 0 10px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  cursor: pointer;

  &--focused {
    border-color: var(--skin__primary);
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--invalid {
    border-color: var(--skin__accent_2);
  }

  &__prefix {
    padding-right: 5px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__prefix-icon,
  &__suffix-icon {
    width: 15px;
    height: 15px;
  }

  &__wrap {
    flex: 1 1 0;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
    min-width: 0;
  }

  &__required-star {
    color: var(--skin__accent_2);
    width: 6px;
    flex-shrink: 0;
  }

  &__value {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    padding-left: 2px;
  }

  &__placeholder {
    color: var(--skin__neutral_2);
  }

  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-right: 5px;
  }

  &__icon {
    width: 18px;
    height: 18px;
    border-radius: 9999px;
  }

  &__label {
    color: var(--skin__lead);
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 5px;
  }

  &__clear {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.x-select-options {
  padding: 7.5px 1.5px;
  box-sizing: border-box;
  max-height: 285px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 7px;
  color: var(--skin__lead);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

  &__scroll {
    max-height: 208px;
    overflow: auto;
  }

  &__item {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: start;
    font-size: 11px;
    padding: 0 10px;
    cursor: pointer;
    color: var(--skin__neutral_2);

    &:hover:not(.is-disabled) {
      background-color: var(--skin__bg_1);
    }

    &.is-active {
      color: var(--skin__primary);
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__content {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    flex: 1;
    display: flex;
    align-items: center;
    color: var(--skin__neutral_2);
    font-size: 11px;
  }

  &__item.is-active &__content {
    color: var(--skin__primary);
  }

  &__icon {
    margin-right: 5px;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
  }
}

.x-select-options--fit-option-width {
  width: max-content;
}

.x-select-options--fit-option-width .x-select-options__item {
  min-width: 100%;
}

[dir="rtl"] .x-select__prefix {
  padding-right: 0;
  padding-left: 5px;
}

[dir="rtl"] .x-select__suffix {
  margin-left: 0;
  margin-right: 5px;
}

[dir="rtl"] .x-select__icon-wrap {
  padding-right: 0;
  padding-left: 5px;
}

[dir="rtl"] .x-select-options__icon {
  margin-right: 0;
  margin-left: 5px;
}
</style>

