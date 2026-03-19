<script setup lang="ts">
import { inject, ref, computed } from "vue";

defineOptions({
  name: "ui-input"
});

// 输入框类型
type InputType = 'text' | 'password' | 'number' | 'email' | 'tel' | 'url' | 'search'

interface Props {
  // 基础属性
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: InputType;
  placeholder?: string;
  maxlength?: number;
  minlength?: number;

  // 密码相关
  password?: boolean;
  showPasswordToggle?: boolean;
  showEye?: boolean; // 兼容旧属性

  // 图标相关
  prefix?: string;
  suffix?: string;
  suffix_color?: string;

  // 大小
  size?: 'large' | 'default' | 'small' | 'mini';

  // 清除按钮
  clearable?: boolean;

  // 自动获取焦点
  autofocus?: boolean;

  // 数字输入限制
  min?: number;
  max?: number;
  step?: number;

  // 前缀/后缀文本
  prefixText?: string;
  suffixText?: string;

  // 验证状态
  validateEvent?: boolean;

  // 自定义类名
  inputClass?: string;

  // 自动完成
  autocomplete?: string;

  // 名称
  name?: string;
}
type ModelValue = string | number;
const modelValue = defineModel<ModelValue>({ default: '' })

// 内部状态
const showPassword = ref<boolean>(false);
const isFocused = ref<boolean>(false);
const inputRef = ref<HTMLInputElement>();

// 表单校验注入
const rules = inject("formRules");
const prop: any = inject("prop");
const validateField: any = inject("validateField");

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  type: 'text',
  placeholder: "请输入...",
  maxlength: 255,
  minlength: 0,
  password: false,
  showPasswordToggle: false,
  showEye: false,
  prefix: '',
  suffix: '',
  suffix_color: '',
  size: 'default',
  clearable: false,
  autofocus: false,
  min: undefined,
  max: undefined,
  step: undefined,
  prefixText: '',
  suffixText: '',
  validateEvent: true,
  inputClass: '',
  autocomplete: 'off',
  name: '',
});

const emit = defineEmits<{
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'change', value: string | number): void;
  (e: 'input', value: string | number): void;
  (e: 'clear'): void;
  (e: 'keydown', event: KeyboardEvent): void;
}>();

// 计算实际输入类型
const inputType = computed(() => {
  if (props.showEye || props.showPasswordToggle) {
    return showPassword.value ? props.type : 'password';
  }
  return props.type;
});

// 是否有值
const hasValue = computed(() => {
  return modelValue.value !== '' && modelValue.value !== null && modelValue.value !== undefined;
});

// 是否可清除
const showClear = computed(() => {
  return props.clearable && hasValue.value && !props.disabled && !props.readonly && isFocused.value;
});

// 处理输入
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let value: string | number = target.value;

  // 数字类型处理
  if (props.type === 'number') {
    if (value === '') {
      value = '';
    } else {
      const num = Number(value);
      if (!isNaN(num)) {
        value = num;
      }
    }
  }

  modelValue.value = value;
  emit('input', value);

  // 触发表单校验
  if (props.validateEvent && prop && rules?.[prop]?.length) {
    validateField?.(prop);
  }
};

// 处理变化
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('change', target.value);
};

// 处理聚焦
const handleFocus = (e: FocusEvent) => {
  isFocused.value = true;
  emit('focus', e);
};

// 处理失焦
const handleBlur = (e: FocusEvent) => {
  isFocused.value = false;
  emit('blur', e);

  // 触发表单校验
  if (props.validateEvent && prop && rules?.[prop]?.length) {
    validateField?.(prop);
  }
};

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  emit('keydown', e);
};

// 处理清除
const handleClear = () => {
  if (props.disabled || props.readonly) return;

  modelValue.value = '';
  emit('input', '');
  emit('change', '');
  emit('clear');

  // 聚焦到输入框
  inputRef.value?.focus();

  // 触发表单校验
  if (props.validateEvent && prop && rules?.[prop]?.length) {
    validateField?.(prop);
  }
};

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 组件类名计算
const wrapperClasses = computed(() => [
  'ui-input',
  `ui-input--${props.size}`,
  {
    'ui-input--disabled': props.disabled,
    'ui-input--readonly': props.readonly,
    'ui-input--focused': isFocused.value,
    'ui-input--has-value': hasValue.value,
    'ui-input--clearable': props.clearable,
    'ui-input--required': props.required,
  }
]);

// 输入框类名计算
const inputClasses = computed(() => [
  'ui-input__field',
  props.inputClass,
  {
    'ui-input__field--with-prefix': props.prefix || props.prefixText,
    'ui-input__field--with-suffix': props.suffix || props.suffixText,
    'ui-input__field--with-eye': props.showEye || props.showPasswordToggle,
    'ui-input__field--with-clear': props.clearable,
  }
]);
</script>

<template>
  <div
    class="ui-input-wrapper"
    :class="wrapperClasses"
    @click="inputRef?.focus()"
  >
    <!-- 前缀图标 -->
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

    <!-- 输入区域 -->
    <div class="ui-input__wrap">
      <!-- 必填星号 -->
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

    <!-- 后缀区域 -->
    <span class="ui-input__suffix" v-if="$slots.suffix || suffix || suffixText || showClear || showEye || showPasswordToggle">
      <!-- 清除按钮 -->
      <span
        v-if="showClear"
        class="ui-input__clear"
        @click.stop="handleClear"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
          <path d="M4 4L10 10M4 10L10 4" stroke="currentColor" stroke-width="1"/>
        </svg>
      </span>

      <!-- 密码切换 -->
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

      <!-- 自定义后缀 -->
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

  // 聚焦状态
  &.ui-input--focused {
    border-color: #f0c059;
  }

  // 禁用状态
  &.ui-input--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--skin__bg_1);
    border-color: var(--skin__border);

    .ui-input__field {
      cursor: not-allowed;
    }
  }

  // 只读状态
  &.ui-input--readonly {
    //background-color: #2a2c33;

    .ui-input__field {
      cursor: default;
    }
  }

  // 必填状态
  &.ui-input--required:not(.ui-input--focused):not(.ui-input--has-value) {
    border-color: #ea4e3d;
  }

  // 不同尺寸
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

  // 前缀
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

  // 输入区域包装
  &__wrap {
    flex: 1;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
    min-width: 0; // 防止flex溢出
  }

  // 必填星号
  &__required-star {
    display: block;
    color: #ea4e3d;
    width: 6px;
    height: 100%;
    flex-shrink: 0;
  }

  // 输入容器
  &__container {
    flex: 1;
    display: flex;
    padding-left: 2px;
    min-width: 0; // 防止flex溢出
  }

  // 输入框
  &__field {
    background-color: transparent;
    border: 0;
    color: white;
    width: 100%;
    height: 100%;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    min-width: 0; // 防止flex溢出

    &::placeholder {
      color: #525252;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: white;
      -webkit-box-shadow: 0 0 0px 1000px #1c1e23 inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  // 后缀
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

  // 清除按钮
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

  // 密码切换按钮
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

// 为了兼容旧样式
.ui-input {
  // 继承新样式
  .ui-input-wrapper();
}
</style>