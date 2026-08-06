<script setup lang="ts">
import { computed, useSlots } from "vue";

defineOptions({
  name: "x-badge"
});

type BadgePosition =
  | "auto"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface Props {
  content?: number | string;
  max?: number;
  dot?: boolean;
  showZero?: boolean;
  fixed?: boolean;
  position?: BadgePosition;
  bgColor?: string;
  translateX?: boolean;
  translateY?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: "",
  max: 99,
  dot: false,
  showZero: false,
  fixed: true,
  position: "top-right",
  bgColor: "var(--skin__accent_2)",
  translateX: true,
  translateY: true
});

const slots = useSlots();

const shouldShow = computed(() => {
  if (props.dot) return true;
  if (slots.content) return true;
  if (props.content === "" || props.content === null || props.content === undefined) return false;
  if (!props.showZero && Number(props.content) === 0) return false;
  return true;
});

const displayText = computed(() => {
  if (props.dot) return "";
  if (typeof props.content === "number" && props.content > props.max) {
    return `${props.max}+`;
  }
  return String(props.content);
});

const badgeClasses = computed(() => [
  "x-badge",
  `x-badge--${props.position}`,
  {
    "x-badge--fixed": props.fixed,
    "x-badge--dot": props.dot,
    "x-badge--no-translate-x": !props.translateX,
    "x-badge--no-translate-y": !props.translateY
  }
]);

const badgeStyles = computed(() => ({
  "--badge-bg-color": props.bgColor
}));
</script>

<template>
  <span class="x-badge__wrapper">
    <slot />
    <span v-if="shouldShow" :class="badgeClasses" :style="badgeStyles">
      <span class="x-badge__content">
        <slot name="content">{{ displayText }}</slot>
      </span>
    </span>
  </span>
</template>

<style scoped lang="less">
.x-badge__wrapper {
  position: relative;
  display: inline-block;
}

.x-badge {
  display: inline-block;
  box-sizing: border-box;
  min-width: 16px;
  padding: 0 4px;
  color: #fff;
  height: 14px;
  text-align: center;
  background: var(--badge-bg-color);
  border-radius: 6.5px 6.5px 6.5px 0;
  font-size: 9px;
  line-height: 14px;
  overflow: visible;
  vertical-align: middle;
  position: relative;
  --badge-translate-x: 0;
  --badge-translate-y: 0;
  transform: translate(var(--badge-translate-x), var(--badge-translate-y));

  &::before {
    content: "";
    display: inline-block;
    position: absolute;
    bottom: -3px;
    z-index: 20;
    left: 0;
    width: 0;
    height: 0;
    border-left: 3.95px solid var(--badge-bg-color);
    border-top: 3.3px solid transparent;
    border-bottom: 3.3px solid transparent;
    font-size: 0;
  }

  &__content {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;
    z-index: 1;
  }

  &--fixed {
    position: absolute;
    transform-origin: 100%;
  }

  &--auto {
    top: 0;
    right: 0;
    --badge-translate-x: 5px;
    --badge-translate-y: -50%;
  }

  &--top-left {
    top: 0;
    left: 0;
    --badge-translate-x: -50%;
    --badge-translate-y: -50%;
  }

  &--top-center {
    top: 0;
    left: 50%;
    --badge-translate-y: -50%;
  }

  &--top-right {
    top: 0;
    right: 0;
    --badge-translate-x: 50%;
    --badge-translate-y: -50%;
  }

  &--bottom-left {
    bottom: 0;
    left: 0;
    --badge-translate-x: -50%;
    --badge-translate-y: 50%;
  }

  &--bottom-right {
    bottom: 0;
    right: 0;
    --badge-translate-x: 50%;
    --badge-translate-y: 50%;
  }

  &--dot {
    top: 0;
    right: 0;
    --badge-translate-x: 50%;
    --badge-translate-y: -50%;
    width: 8px;
    min-width: 0;
    height: 8px;
    border-radius: 100%;
    border: none;
    padding: 0;
  }

  &--dot::before {
    display: none;
  }

  &--no-translate-x {
    --badge-translate-x: 0;
  }

  &--no-translate-y {
    --badge-translate-y: 0;
  }
}

[dir="rtl"] .x-badge {
  border-radius: 6.5px 6.5px 0 6.5px;
}

[dir="rtl"] .x-badge::before {
  left: auto;
  right: 0;
  border-left: none;
  border-right: 3.95px solid var(--badge-bg-color);
}
</style>

