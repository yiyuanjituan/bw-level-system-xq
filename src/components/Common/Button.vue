<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: 'ui-button'
})

// 按钮类型
type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
// 按钮大小
type ButtonSize = 'large' | 'default' | 'small' | 'mini'
// 原生类型
type NativeType = 'button' | 'submit' | 'reset'

interface Props {
  // 按钮类型
  type?: ButtonType
  // 按钮大小
  size?: ButtonSize
  // 原生类型
  nativeType?: NativeType
  // 加载状态
  loading?: boolean
  // 朴素按钮
  plain?: boolean
  // 圆角按钮
  round?: boolean
  // 圆形按钮
  circle?: boolean
  // 禁用状态
  disabled?: boolean
  // 块级按钮
  block?: boolean
  // 文字按钮
  text?: boolean
  // 幽灵按钮（背景透明，带边框）
  ghost?: boolean
  // 自定义颜色
  color?: string
  // 自定义文字颜色
  textColor?: string
  // 加载图标大小
  loadingSize?: string
  // 图标名称（如果使用图标库）
  icon?: string
  // 图标位置
  iconPosition?: 'left' | 'right'
  // 自动获取焦点
  autofocus?: boolean
  // 自定义类名
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  nativeType: 'button',
  loading: false,
  plain: false,
  round: false,
  circle: false,
  disabled: false,
  block: false,
  text: false,
  ghost: false,
  color: '',
  textColor: '',
  loadingSize: '16px',
  icon: '',
  iconPosition: 'left',
  autofocus: false,
  customClass: '',
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

// 按钮类名计算
const buttonClasses = computed(() => [
  'ui-button',
  `ui-button--${props.type}`,
  `ui-button--${props.size}`,
  {
    'ui-button--plain': props.plain,
    'ui-button--round': props.round,
    'ui-button--circle': props.circle,
    'ui-button--disabled': props.disabled,
    'ui-button--loading': props.loading,
    'ui-button--block': props.block,
    'ui-button--text': props.text,
    'ui-button--ghost': props.ghost,
    'is-disabled': props.disabled,
    'is-loading': props.loading,
    'has-icon': props.icon && !props.loading,
  },
  props.customClass,
])

// 按钮样式计算
const buttonStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.color) {
    styles['--ui-button-color'] = props.color
    styles['--ui-button-hover-color'] = adjustColor(props.color, 20)
    styles['--ui-button-active-color'] = adjustColor(props.color, -20)
  }

  if (props.textColor) {
    styles['--ui-button-text-color'] = props.textColor
    styles['--ui-button-hover-text-color'] = adjustColor(props.textColor, 20)
  }

  return styles
})

// 辅助函数：调整颜色亮度
const adjustColor = (color: string, percent: number): string => {
  // 简单的颜色调整，实际项目中可以使用color库
  return color
}

// 加载动画样式
const loadingStyle = computed(() => ({
  width: props.loading ? props.loadingSize : '0px',
  height: props.loading ? props.loadingSize : '0px',
}))

// 判断是否只有图标
const isIconOnly = computed(() => {
  return !props.loading && props.icon
})
</script>

<template>
  <button
    class="ui-button"
    :class="buttonClasses"
    :style="buttonStyles"
    :type="nativeType"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    @click="handleClick"
  >
    <span class="ui-button__content">
      <!-- 左侧加载图标 -->
      <span
        class="ui-button__loading"
        :style="loadingStyle"
      >
        <svg-icon name="loading" />
      </span>

      <!-- 左侧图标 -->
      <span
        v-if="icon && iconPosition === 'left' && !isIconOnly"
        class="ui-button__icon ui-button__icon--left"
      >
        <svg-icon
          v-if="icon.startsWith('svg:')"
          :name="icon.replace('svg:', '')"
          class-name="ui-button__icon-svg"
        />
        <i v-else :class="icon"></i>
      </span>

      <!-- 文本内容 -->
      <span
        v-if="$slots.default"
        class="ui-button__text"
        :class="{ 'ui-button__text--hidden': loading }"
      >
        <slot />
      </span>

      <!-- 右侧图标 -->
      <span
        v-else-if="icon && iconPosition === 'right' && !isIconOnly"
        class="ui-button__icon ui-button__icon--right"
      >
        <svg-icon
          v-if="icon.startsWith('svg:')"
          :name="icon.replace('svg:', '')"
          class-name="ui-button__icon-svg"
        />
        <i v-else :class="icon"></i>
      </span>

      <!-- 只有图标的情况 -->
      <span
        v-else-if="icon && isIconOnly"
        class="ui-button__icon ui-button__icon--only"
      >
        <svg-icon
          v-if="icon.startsWith('svg:')"
          :name="icon.replace('svg:', '')"
          class-name="ui-button__icon-svg"
        />
        <i v-else :class="icon"></i>
      </span>
    </span>
  </button>
</template>

<style scoped lang="less">
.ui-button {
  // CSS 变量
  --ui-button-font-weight: 400;
  --ui-button-border-color: var(--ui-button-color, currentColor);
  --ui-button-bg-color: var(--ui-button-color, #f0c059);
  --ui-button-text-color: var(--ui-button-text-color, #874404);
  --ui-button-disabled-opacity: 0.5;
  --ui-button-hover-opacity: 0.8;
  --ui-button-active-opacity: 0.6;

  // 基础样式
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transition: all 0.1s linear;
  appearance: none;
  border: none;
  user-select: none;
  vertical-align: middle;
  font-family: inherit;

  // 禁用状态
  &.is-disabled {
    opacity: var(--ui-button-disabled-opacity);
    cursor: not-allowed;
    pointer-events: none;
  }

  // 加载状态
  &.is-loading {
    cursor: default;
    pointer-events: none;
  }

  // 块级按钮
  &.ui-button--block {
    display: flex;
    width: 100%;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100%;
  }

  &__text {
    font-size: inherit;
    line-height: 1.2;

    &--hidden {
      opacity: 1;
    }
  }

  // 图标样式
  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;

    &-svg {
      width: 1.2em;
      height: 1.2em;
    }
  }

  // 加载动画
  &__loading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    animation: rotating 1s linear infinite;
    transition: all 0.4s;

    &-spinner {
      width: 100%;
      height: 100%;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-right-color: currentColor;
      border-radius: 50%;
    }
  }

  // 按钮类型
  &--default {
    color: var(--ui-button-text-color);
    background: var(--ui-button-bg-color);
    border: 1px solid var(--ui-button-border-color);

    &:active:not(.is-disabled):not(.is-loading) {
      opacity: var(--ui-button-hover-opacity);
    }

    &:active:not(.is-disabled):not(.is-loading) {
      opacity: var(--ui-button-active-opacity);
    }

    &.ui-button--plain {
      background: transparent;
      color: var(--ui-button-bg-color);
    }

    &.ui-button--text {
      background: transparent;
      border-color: transparent;
      color: var(--ui-button-bg-color);

      &:active:not(.is-disabled):not(.is-loading) {
        background: rgba(var(--ui-button-bg-color-rgb), 0.1);
      }
    }

    &.ui-button--ghost {
      background: transparent;
      color: var(--ui-button-bg-color);

      &:active:not(.is-disabled):not(.is-loading) {
        background: var(--ui-button-bg-color);
        color: var(--ui-button-text-color);
      }
    }
  }

  // 各种类型的颜色定义
  &--primary {
    --ui-button-bg-color: #f0c059;
    --ui-button-text-color: #874404;
  }

  &--success {
    --ui-button-bg-color: #67c23a;
    --ui-button-text-color: #ffffff;
  }

  &--warning {
    --ui-button-bg-color: #e6a23c;
    --ui-button-text-color: #ffffff;
  }

  &--danger {
    --ui-button-bg-color: #f56c6c;
    --ui-button-text-color: #ffffff;
  }

  &--info {
    --ui-button-bg-color: #909399;
    --ui-button-text-color: #ffffff;
  }

  // 按钮大小
  &--large {
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    border-radius: 8px;

    &.ui-button--circle {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
    }
  }

  &--default {
    height: 35px;
    padding: 0 15px;
    font-size: 12px;
    border-radius: 7px;

    &.ui-button--circle {
      width: 35px;
      height: 35px;
      padding: 0;
      border-radius: 50%;
    }
  }

  &--small {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
    border-radius: 6px;

    &.ui-button--circle {
      width: 30px;
      height: 30px;
      padding: 0;
      border-radius: 50%;
    }
  }

  &--mini {
    height: 25px;
    padding: 0 10px;
    font-size: 10px;
    border-radius: 5px;

    &.ui-button--circle {
      width: 25px;
      height: 25px;
      padding: 0;
      border-radius: 50%;
    }
  }

  // 圆角按钮
  &--round {
    border-radius: 20px;
  }

  // 朴素按钮
  &--plain {
    background: transparent;
    border-width: 1px;

    &:active:not(.is-disabled):not(.is-loading) {
      background: transparent;
    }
  }

  // 文字按钮
  &--text {
    background: transparent;
    border: none;

    &:active:not(.is-disabled):not(.is-loading) {
      text-decoration: underline;
    }
  }
}

// 旋转动画
@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 原有加载动画保留（可选）
.ui-dot-loading {
  --double-size: 6px;
  --double-space: 12px;
  --left-space: calc(-1 * var(--double-space));
  --right-space: var(--double-space);
  --opacity: 0.15;

  width: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__icon {
    width: var(--double-size);
    aspect-ratio: 1;
    border-radius: 50%;
    transform: scale(.5);
    transform-origin: center center;
    animation: _dot_loading 1s infinite linear alternate;
  }
}

@keyframes _dot_loading {
  0% {
    box-shadow: var(--right-space) 0 rgba(135, 68, 4, 1), var(--left-space) 0 rgba(135, 68, 4, var(--opacity));
    background: rgba(135, 68, 4, 1);
  }
  33% {
    box-shadow: var(--right-space) 0 rgba(135, 68, 4, 1), var(--left-space) 0 rgba(135, 68, 4, var(--opacity));
    background: rgba(135, 68, 4, var(--opacity));
  }
  66% {
    box-shadow: var(--right-space) 0 rgba(135, 68, 4, var(--opacity)), var(--left-space) 0 rgba(135, 68, 4, 1);
    background: rgba(135, 68, 4, var(--opacity));
  }
  100% {
    box-shadow: var(--right-space) 0 rgba(135, 68, 4, var(--opacity)), var(--left-space) 0 rgba(135, 68, 4, 1);
    background: rgba(135, 68, 4, 1);
  }
}
</style>