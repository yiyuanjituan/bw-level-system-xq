<script setup lang="ts">
import { handleBack } from "@/utils/common";

interface Props {
  title?: string;
  backClassName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  backClassName: ""
});
</script>

<template>
  <header class="sub-header">
    <div class="arrow-left" :class="props.backClassName" @click="handleBack">
      <svg-icon name="arrow-back"></svg-icon>
    </div>
    <div class="title">
      <slot name="title"></slot>
      <template v-if="!$slots.title">
        <div class="title-inner">{{ props.title }}</div>
      </template>
    </div>
    <div v-if="$slots.right" class="right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<style scoped lang="less">
.sub-header {
  --skin__neutral_1: #bcbcbc;

  position: relative;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--status-bar-height);
  height: calc(var(--status-bar-height) + 45px);
  min-height: calc(var(--status-bar-height) + 45px);
  background-color: var(--skin__bg_2);
  border-bottom: 1px solid var(--skin__border);
  box-sizing: border-box;
  width: 100%;
  .arrow-left {
    position: absolute;
    min-width: 40px;
    flex-shrink: 0;
    padding-left: 10px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--skin__neutral_1);
    font-size: 12px;
  }
  .title {
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--skin__lead);
    font-size: 15px;
    .title-inner {
      width: 100%;
      max-width: 215px;
      text-align: center;
      word-break: break-all;
      unicode-bidi: plaintext;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .right {
    position: absolute;
    right: 10px;
    top: var(--status-bar-height);
    display: flex;
    align-items: center;
    height: 45px;
  }
}
</style>
