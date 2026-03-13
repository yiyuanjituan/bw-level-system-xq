<script setup lang="ts">
defineOptions({
  name: "UiBadge"
});

interface Props {
  size?: number | number[];
  zIndex?: number;
  content?: number | string;
}
const props = withDefaults(defineProps<Props>(), {
  size: 3,
  zIndex: 1,
  content: 0
});
</script>

<template>
  <div class="ui-badge-wrapper">
    <slot />
    <div
      v-if="props.content && props.content != '0'"
      class="ui-badge ui-badge--top-right ui-badge--fixed"
      :style="{
        top: `${typeof props.size == 'number' ? props.size : props.size[0]}px`,
        right: `${
          typeof props.size == 'number' ? props.size : props.size[1]
        }px`,
        zIndex: props.zIndex
      }"
    >
      <div class="ui-badge__content">{{ (typeof props.content == 'number' && props.content > 99) ? '99+' : props.content }}</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-badge-wrapper {
  position: relative;
  display: inline-block;
  .ui-badge {
    display: inline-block;
    box-sizing: border-box;
    min-width: 16px;
    padding: 0 4px;
    color: #fff;
    height: 13px;
    text-align: center;
    background: #ea4e3d;
    border-radius: 6.5px 6.5px 6.5px 0;
    font-size: 9px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    line-height: 13px;
    letter-spacing: normal;
    overflow: visible;
    vertical-align: middle;
    position: relative;
    &--fixed {
      position: absolute;
      transform-origin: 100%;
    }
    &--top-right {
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }
    &::before {
      content: "";
      display: inline-block;
      position: absolute;
      bottom: -3px;
      z-index: 20;
      left: 0;
      width: 0;
      height: 0;
      border-left: 3.95px solid #ea4e3d;
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
  }
}
</style>
