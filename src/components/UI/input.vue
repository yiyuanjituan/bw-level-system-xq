<script setup lang="ts">
import { $t } from "@/locales";
import { computed, inject, ref } from "vue";
import { FORM_CONTEXT_KEY, FORM_ITEM_PROP_KEY } from "./form-context";

defineOptions({
  name: "ui-input"
});

type InputType = "text" | "password" | "number" | "email" | "tel" | "url" | "search";

interface Props {
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: InputType;
  placeholder?: string;
  maxlength?: number;
  minlength?: number;
  password?: boolean;
  showPasswordToggle?: boolean;
  showEye?: boolean;
  prefix?: string;
  suffix?: string;
  suffix_color?: string;
  size?: "large" | "default" | "small" | "mini";
  clearable?: boolean;
  autofocus?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefixText?: string;
  suffixText?: string;
  validateEvent?: boolean;
  inputClass?: string;
  autocomplete?: string;
  name?: string;
}

type ModelValue = string | number;

const modelValue = defineModel<ModelValue>({ default: "" });
const showPassword = ref(false);
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement>();

const formContext = inject(FORM_CONTEXT_KEY, null);
const legacyProp = inject<any>("prop", "");
const itemProp = inject(FORM_ITEM_PROP_KEY, null);
const prop = computed(() => itemProp?.value || legacyProp || "");

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  type: "text",
  placeholder: $t("请输入..."),
  maxlength: 255,
  minlength: 0,
  password: false,
  showPasswordToggle: false,
  showEye: false,
  prefix: "",
  suffix: "",
  suffix_color: "",
  size: "default",
  clearable: false,
  autofocus: false,
  min: undefined,
  max: undefined,
  step: undefined,
  prefixText: "",
  suffixText: "",
  validateEvent: true,
  inputClass: "",
  autocomplete: "off",
  name: ""
});

const emit = defineEmits<{
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", value: string | number): void;
  (e: "input", value: string | number): void;
  (e: "clear"): void;
  (e: "keydown", event: KeyboardEvent): void;
}>();

const inputType = computed(() => {
  if (props.showEye || props.showPasswordToggle)
    return showPassword.value ? "text" : "password";
  return props.type;
});

const hasValue = computed(() => {
  return modelValue.value !== "" && modelValue.value !== null && modelValue.value !== undefined;
});

const showClear = computed(() => {
  return props.clearable && hasValue.value && !props.disabled && !props.readonly && isFocused.value;
});

const hasError = computed(() => {
  const field = prop.value;
  if (!field)
    return false;
  return !!formContext?.errors.value?.[field];
});

function fieldHasRules() {
  const field = prop.value;
  return !!(field && formContext?.rules.value?.[field]);
}

function runValidation(trigger: string) {
  if (!props.validateEvent || !fieldHasRules() || !prop.value)
    return;
  formContext?.validateField(prop.value, trigger).catch(() => {});
}

function normalizeValue(rawValue: string) {
  if (props.type !== "number")
    return rawValue;
  if (rawValue === "")
    return "";
  const numericValue = Number(rawValue);
  return Number.isNaN(numericValue) ? rawValue : numericValue;
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const nextValue = normalizeValue(target.value);
  modelValue.value = nextValue;
  emit("input", nextValue);
  runValidation("input");
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const nextValue = normalizeValue(target.value);
  emit("change", nextValue);
  runValidation("change");
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit("blur", event);
  runValidation("blur");
};

const handleKeydown = (event: KeyboardEvent) => {
  emit("keydown", event);
};

const handleClear = () => {
  if (props.disabled || props.readonly)
    return;

  modelValue.value = "";
  emit("input", "");
  emit("change", "");
  emit("clear");
  inputRef.value?.focus();
  runValidation("change");
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const wrapperClasses = computed(() => [
  "ui-input",
  `ui-input--${props.size}`,
  {
    "ui-input--disabled": props.disabled,
    "ui-input--readonly": props.readonly,
    "ui-input--focused": isFocused.value,
    "ui-input--has-value": hasValue.value,
    "ui-input--clearable": props.clearable,
    "ui-input--required": props.required,
    "ui-input--invalid": hasError.value
  }
]);

const inputClasses = computed(() => [
  "ui-input__field",
  props.inputClass,
  {
    "ui-input__field--with-prefix": props.prefix || props.prefixText,
    "ui-input__field--with-suffix": props.suffix || props.suffixText,
    "ui-input__field--with-eye": props.showEye || props.showPasswordToggle,
    "ui-input__field--with-clear": props.clearable
  }
]);
</script>

<template>
  <div
    class="ui-input-wrapper"
    :class="wrapperClasses"
    @click="inputRef?.focus()"
  >
    <span class="ui-input__prefix" v-if="$slots.prefix || prefix || prefixText">
      <slot name="prefix" v-if="$slots.prefix" />
      <svg-icon
        v-else-if="prefix"
        :name="prefix"
        class-name="ui-input__prefix-icon"
      />
      <span v-else-if="prefixText" class="ui-input__prefix-text">
        {{ prefixText }}
      </span>
    </span>

    <div class="ui-input__wrap">
      <span class="ui-input__required-star" v-if="required && !hasValue">*</span>

      <div class="ui-input__container">
        <input
          ref="inputRef"
          class="ui-input__field"
          :class="inputClasses"
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
          @keydown="handleKeydown"
        />
      </div>
    </div>

    <span class="ui-input__suffix" v-if="$slots.suffix || suffix || suffixText || showClear || showEye || showPasswordToggle">
      <span
        v-if="showClear"
        class="ui-input__clear"
        @click.stop="handleClear"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1" />
          <path d="M4 4L10 10M4 10L10 4" stroke="currentColor" stroke-width="1" />
        </svg>
      </span>

      <span
        v-else-if="!$slots.suffix && !suffix && !suffixText && (showEye || showPasswordToggle)"
        class="ui-input__password-toggle"
        @click.stop="togglePassword"
      >
        <svg-icon
          :name="showPassword ? 'eye_show' : 'eye_hide'"
          class-name="ui-input__suffix-icon"
          :class="{ 'ui-input__suffix-icon--active': showPassword }"
        />
      </span>

      <template v-else>
        <slot name="suffix" v-if="$slots.suffix" />
        <svg-icon
          v-else-if="suffix"
          :name="suffix"
          class-name="ui-input__suffix-icon"
          :style="{ color: suffix_color }"
        />
        <span v-else-if="suffixText" class="ui-input__suffix-text">
          {{ suffixText }}
        </span>
      </template>
    </span>
  </div>
</template>

<style scoped lang="less">
.ui-input-wrapper {
  border: 1px solid var(--skin__neutral_3);
  height: 35px;
  width: 100%;
  border-radius: 5px;
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--skin__bg_2);
  color: #68707b;
  font-size: 11px;
  padding: 0 10px;
  transition: all 0.2s ease;
  cursor: text;
  box-sizing: border-box;

  &.ui-input--focused {
    border-color: #f0c059;
  }

  &.ui-input--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--skin__bg_1);
    border-color: var(--skin__border);

    .ui-input__field {
      cursor: not-allowed;
    }
  }

  &.ui-input--readonly {
    .ui-input__field {
      cursor: default;
    }
  }

  &.ui-input--invalid:not(.ui-input--focused) {
    border-color: #ea4e3d;
  }

  &--large {
    height: 42px;
    font-size: 14px;

    .ui-input__field {
      font-size: 14px;
    }
  }

  &--default {
    height: 35px;
    font-size: 11px;
  }

  &--small {
    height: 30px;
    font-size: 11px;

    .ui-input__prefix-icon,
    .ui-input__suffix-icon {
      width: 13px;
      height: 13px;
    }
  }

  &--mini {
    height: 26px;
    font-size: 10px;
    padding: 0 8px;

    .ui-input__prefix-icon,
    .ui-input__suffix-icon {
      width: 12px;
      height: 12px;
    }
  }

  &__prefix {
    padding-right: 5px;
    display: flex;
    align-items: center;
    height: 100%;
    color: currentColor;

    &-icon {
      width: 15px;
      height: 15px;
    }

    &-text {
      font-size: inherit;
      color: #9aa4b2;
    }
  }

  &__wrap {
    flex: 1;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
    min-width: 0;
  }

  &__required-star {
    display: block;
    color: #ea4e3d;
    width: 6px;
    height: 100%;
    flex-shrink: 0;
  }

  &__container {
    flex: 1;
    display: flex;
    padding-left: 2px;
    min-width: 0;
  }

  &__field {
    background-color: transparent;
    border: 0;
    color: white;
    width: 100%;
    height: 100%;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    min-width: 0;

    &::placeholder {
      color: #525252;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: white;
      -webkit-box-shadow: 0 0 0 1000px #1c1e23 inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 5px;
    color: currentColor;

    &-icon {
      width: 15px;
      height: 15px;
      transition: color 0.2s;

      &--active {
        color: #f0c059;
      }
    }

    &-text {
      font-size: inherit;
      color: #9aa4b2;
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #68707b;
    transition: color 0.2s;

    &:hover {
      color: #f0c059;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &__password-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #68707b;
    transition: color 0.2s;

    &:hover {
      color: #f0c059;
    }
  }
}

.ui-input {
  .ui-input-wrapper();
}
</style>
