<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from "vue";
import { X_FORM_CONTEXT_KEY, X_FORM_ITEM_PROP_KEY } from "./x-form-context";

defineOptions({
  name: "x-input"
});

type InputType = "text" | "password" | "number" | "email" | "tel" | "url" | "search" | "textarea";
type InputSize = "large" | "default" | "small" | "mini";
type ModelValue = string | number;
type TextareaAutoSize = boolean | { minRows?: number; maxRows?: number };

interface Props {
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: InputType;
  size?: InputSize;
  placeholder?: string;
  maxlength?: number;
  minlength?: number;
  clearable?: boolean;
  autofocus?: boolean;
  prefix?: string;
  suffix?: string;
  prefixText?: string;
  suffixText?: string;
  showPasswordToggle?: boolean;
  showEye?: boolean;
  min?: number;
  max?: number;
  step?: number;
  autocomplete?: string;
  name?: string;
  validateEvent?: boolean;
  rows?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
  autosize?: TextareaAutoSize;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  type: "text",
  size: "default",
  placeholder: "请输入",
  maxlength: 255,
  minlength: 0,
  clearable: false,
  autofocus: false,
  prefix: "",
  suffix: "",
  prefixText: "",
  suffixText: "",
  showPasswordToggle: false,
  showEye: false,
  min: undefined,
  max: undefined,
  step: undefined,
  autocomplete: "off",
  name: "",
  validateEvent: true,
  rows: 3,
  resize: "none",
  autosize: false
});

const modelValue = defineModel<ModelValue>({ default: "" });
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>();
const isFocused = ref(false);
const showPassword = ref(false);
const formContext = inject(X_FORM_CONTEXT_KEY, null);
const itemProp = inject(X_FORM_ITEM_PROP_KEY, null);
const prop = computed(() => itemProp?.value || "");

const emit = defineEmits<{
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", value: string | number): void;
  (e: "input", value: string | number): void;
  (e: "clear"): void;
  (e: "keydown", event: KeyboardEvent): void;
}>();

const inputType = computed(() => {
  if (props.type === "textarea") return "text";
  if (props.showEye || props.showPasswordToggle) {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});

const hasValue = computed(() => modelValue.value !== "" && modelValue.value !== null && modelValue.value !== undefined);

const showClear = computed(() => {
  return props.clearable && hasValue.value && !props.disabled && !props.readonly && isFocused.value;
});

const hasError = computed(() => {
  if (!prop.value) return false;
  return !!formContext?.errors.value?.[prop.value];
});

const isTextarea = computed(() => props.type === "textarea");

const wrapperClasses = computed(() => [
  "x-input",
  `x-input--${props.size}`,
  {
    "x-input--textarea": isTextarea.value,
    "x-input--focused": isFocused.value,
    "x-input--disabled": props.disabled,
    "x-input--readonly": props.readonly,
    "x-input--invalid": hasError.value
  }
]);

const textareaStyle = computed(() => ({
  resize: props.resize
}));

function fieldHasRules() {
  const field = prop.value;
  return !!(field && formContext?.rules.value?.[field]);
}

function runValidation(trigger: string) {
  if (!props.validateEvent || !fieldHasRules() || !prop.value) return;
  formContext?.validateField(prop.value, trigger).catch(() => {});
}

function normalizeValue(raw: string) {
  if (props.type !== "number") return raw;
  if (raw === "") return "";
  const numericValue = Number(raw);
  return Number.isNaN(numericValue) ? raw : numericValue;
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const value = normalizeValue(target.value);
  modelValue.value = value;
  emit("input", value);
  adjustTextareaHeight();
  runValidation("input");
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const value = normalizeValue(target.value);
  emit("change", value);
  runValidation("change");
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true;
  emit("focus", event);
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false;
  emit("blur", event);
  runValidation("blur");
}

function handleClear() {
  if (props.disabled || props.readonly) return;
  modelValue.value = "";
  emit("input", "");
  emit("change", "");
  emit("clear");
  inputRef.value?.focus();
  runValidation("change");
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function getLineHeight(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(computedStyle.lineHeight);
  if (!Number.isNaN(lineHeight)) return lineHeight;
  const fontSize = Number.parseFloat(computedStyle.fontSize);
  return Number.isNaN(fontSize) ? 18 : fontSize * 1.4;
}

function getAutosizeRows() {
  if (typeof props.autosize !== "object") return {};
  return props.autosize;
}

function adjustTextareaHeight() {
  if (!isTextarea.value || !props.autosize) return;
  const textarea = inputRef.value as HTMLTextAreaElement | undefined;
  if (!textarea) return;

  const { minRows, maxRows } = getAutosizeRows();
  const lineHeight = getLineHeight(textarea);
  textarea.style.height = "auto";

  const minHeight = minRows ? lineHeight * minRows : 0;
  const maxHeight = maxRows ? lineHeight * maxRows : Number.POSITIVE_INFINITY;
  const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

watch(
  () => [modelValue.value, props.type, props.autosize],
  () => {
    nextTick(adjustTextareaHeight);
  },
  { immediate: true }
);
</script>

<template>
  <div class="x-input-wrapper" :class="wrapperClasses" @click="inputRef?.focus()">
    <span class="x-input__prefix" v-if="$slots.prefix || prefix || prefixText">
      <slot name="prefix" v-if="$slots.prefix" />
      <svg-icon v-else-if="prefix" :name="prefix" class-name="x-input__prefix-icon" />
      <span v-else class="x-input__prefix-text">{{ prefixText }}</span>
    </span>

    <div class="x-input__wrap">
      <span class="x-input__required-star" v-if="required && !hasValue">*</span>
      <textarea
        v-if="isTextarea"
        ref="inputRef"
        class="x-input__field x-input__textarea"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :name="name"
        :rows="rows"
        :style="textareaStyle"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="e => emit('keydown', e)"
      />
      <input
        v-else
        ref="inputRef"
        class="x-input__field"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :name="name"
        :min="min"
        :max="max"
        :step="step"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="e => emit('keydown', e)"
      />
    </div>

    <span
      class="x-input__suffix"
      v-if="$slots.suffix || suffix || suffixText || showClear || showEye || showPasswordToggle"
    >
      <span v-if="showClear" class="x-input__clear" @click.stop="handleClear">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" />
          <path d="M4 4L10 10M4 10L10 4" stroke="currentColor" stroke-width="1" />
        </svg>
      </span>
      <span
        v-else-if="!$slots.suffix && !suffix && !suffixText && (showEye || showPasswordToggle)"
        class="x-input__password-toggle"
        @click.stop="togglePassword"
      >
        <svg-icon :name="showPassword ? 'eye_show' : 'eye_hide'" class-name="x-input__suffix-icon" />
      </span>
      <template v-else>
        <slot name="suffix" v-if="$slots.suffix" />
        <svg-icon v-else-if="suffix" :name="suffix" class-name="x-input__suffix-icon" />
        <span v-else class="x-input__suffix-text">{{ suffixText }}</span>
      </template>
    </span>
  </div>
</template>

<style scoped lang="less">
.x-input-wrapper {
  border: var(--lobby__px) solid var(--skin__neutral_3);
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
  cursor: text;
  box-sizing: border-box;

  &.x-input--focused {
    border-color: var(--skin__primary);
  }

  &.x-input--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.x-input--invalid {
    border-color: var(--skin__accent_2);
  }

  &.x-input--large {
    height: 42px;
    font-size: 14px;
  }

  &.x-input--small {
    height: 30px;
    font-size: 11px;
  }

  &.x-input--mini {
    height: 26px;
    font-size: 10px;
    padding: 0 8px;
  }

  &.x-input--textarea {
    height: auto;
    min-height: 80px;
    align-items: flex-start;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

.x-input__prefix {
  padding-right: 5px;
  display: flex;
  align-items: center;
  height: 100%;
}

[dir="rtl"] .x-input__prefix {
  padding-right: 0;
  padding-left: 5px;
}

.x-input__prefix-icon,
.x-input__suffix-icon {
  width: 15px;
  height: 15px;
}

.x-input__wrap {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 0;
}

.x-input__required-star {
  color: var(--skin__accent_2);
  width: 6px;
  flex-shrink: 0;
}

.x-input__field {
  background-color: transparent;
  border: 0;
  color: var(--skin__lead);
  width: 100%;
  height: 100%;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  min-width: 0;
}

.x-input__field::placeholder {
  color: var(--skin__neutral_2);
}

.x-input__textarea {
  display: block;
  min-height: 64px;
  line-height: 1.5;
  padding: 0;
  overflow: auto;
}

.x-input--textarea .x-input__wrap {
  align-items: flex-start;
}

.x-input--textarea .x-input__suffix {
  height: auto;
  padding-top: 2px;
}

.x-input__suffix {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 5px;
}

[dir="rtl"] .x-input__suffix {
  margin-left: 0;
  margin-right: 5px;
}

.x-input__clear,
.x-input__password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
