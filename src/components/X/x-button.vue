<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "x-button"
});

type ButtonType = "default" | "primary" | "success" | "danger" | "warning";
type ButtonSize = "large" | "normal" | "small" | "mini";
type NativeType = "button" | "submit" | "reset";

interface Props {
  type?: ButtonType;
  size?: ButtonSize;
  nativeType?: NativeType;
  disabled?: boolean;
  loading?: boolean;
  plain?: boolean;
  block?: boolean;
  round?: boolean;
  square?: boolean;
  hairline?: boolean;
  autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "default",
  size: "normal",
  nativeType: "button",
  disabled: false,
  loading: false,
  plain: false,
  block: false,
  round: false,
  square: false,
  hairline: false,
  autofocus: false
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const isDisabled = computed(() => props.disabled || props.loading);

const classes = computed(() => [
  "x-button",
  `x-button--${props.type}`,
  `x-button--${props.size}`,
  {
    "x-button--plain": props.plain,
    "x-button--block": props.block,
    "x-button--disabled": props.disabled,
    "x-button--loading": props.loading,
    "x-button--round": props.round,
    "x-button--square": props.square,
    "x-button--hairline": props.hairline
  }
]);

function handleClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <button
    :class="classes"
    :type="nativeType"
    :disabled="isDisabled"
    :autofocus="autofocus"
    @click="handleClick"
  >
    <span class="x-button__content">
      <span v-if="loading" class="x-button__loading">
        <slot name="loading">
          <svg-icon name="loading" />
        </slot>
      </span>
      <span v-else-if="$slots.icon" class="x-button__icon">
        <slot name="icon" />
      </span>
      <span v-if="$slots.default" class="x-button__text">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped lang="less">
.x-button {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  height: 35px;
  padding: 0;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  border-radius: 7px;
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-appearance: none;
  appearance: none;
  -webkit-font-smoothing: auto;

  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: #000;
    border-color: #000;
    border-radius: inherit;
    transform: translate(-50%, -50%);
    opacity: 0;
    content: " ";
  }

  &:active::before {
    opacity: 0.1;
  }

  &--loading::before,
  &--disabled::before {
    display: none;
  }

  &--default,
  &--primary {
    color: var(--skin__text_primary);
    background: var(--skin__primary);
    border: var(--lobby__px) solid var(--skin__primary);
  }

  &--success {
    color: #fff;
    background: var(--skin__accent_1);
    border: var(--lobby__px) solid var(--skin__accent_1);
  }

  &--danger {
    color: #fff;
    background: var(--skin__accent_2);
    border: var(--lobby__px) solid var(--skin__accent_2);
  }

  &--warning {
    color: var(--skin__text_accent3);
    background: var(--skin__accent_3);
    border: var(--lobby__px) solid var(--skin__accent_3);
  }

  &--plain {
    background: transparent;
  }

  &--plain&--primary {
    color: var(--skin__primary);
  }

  &--plain&--default {
    border-color: var(--skin__border);
    color: var(--skin__neutral_1);
  }

  &--plain&--success {
    color: var(--skin__accent_1);
  }

  &--plain&--danger {
    color: var(--skin__accent_2);
  }

  &--plain&--warning {
    color: var(--skin__accent_3);
  }

  &--plain&--disabled {
    color: var(--skin__disabled-bg-color__custom);
  }

  &--large {
    width: 100%;
    height: 35px;
  }

  &--normal {
    height: 35px;
    width: 110px;
    padding: 0 7.5px;
    font-size: 12px;
  }

  &--small {
    height: 25px;
    width: 60px;
    padding: 0 2.5px;
    font-size: 10px;
    border-radius: 5px;
  }

  &--mini {
    height: 20px;
    width: 50px;
    padding: 0 2px;
    font-size: 9px;
    border-radius: 4px;
  }

  &--mini + &--mini {
    margin-left: 2px;
  }

  &--block {
    display: block;
    width: 100%;
  }

  &--disabled {
    cursor: not-allowed;
    color: var(--skin__bg_2);
    background: var(--skin__neutral_2);
    border: var(--lobby__px) solid var(--skin__neutral_2);
  }

  &--loading {
    cursor: default;
  }

  &--round {
    border-radius: 499.5px;
  }

  &--square {
    border-radius: 0;
  }

  &--hairline {
    position: relative;
    border-width: 0;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &__loading {
    color: inherit;
    font-size: inherit;
    margin-right: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    animation: x-button-rotating 1s linear infinite;
  }

  &__icon {
    font-size: inherit;
    line-height: inherit;
    margin-right: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &--hairline::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: var(--lobby__px) solid;
    border-color: inherit;
    border-radius: 4px;
  }

  &--hairline&--round::after {
    border-radius: 499.5px;
  }

  &--hairline&--square::after {
    border-radius: 0;
  }
}

[dir="rtl"] .x-button::before {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}

[dir="rtl"] .x-button__loading {
  margin-right: 0;
  margin-left: 2px;
}

[dir="rtl"] .x-button__icon {
  margin-right: 0;
  margin-left: 2px;
}

[dir="rtl"] .x-button--mini + .x-button--mini {
  margin-left: 0;
  margin-right: 2px;
}

@keyframes x-button-rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
