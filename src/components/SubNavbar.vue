<script setup lang="ts">
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
});

function handleBack() {
  let nowUrl = route.path
  console.log(nowUrl);
  router.back()
}

</script>

<template>
  <header class="sub-header">
    <div class="arrow-left" @click="handleBack">
      <svg-icon name="arrow-back"></svg-icon>
    </div>
    <div class="title">
      <slot name="title"></slot>
      <template v-if="!$slots.title"><div class="title-inner">{{ props.title }}</div></template>
    </div>
  </header>
</template>

<style scoped lang="less">
.sub-header {
  --skin__lead: white;
  --skin__neutral_1: #BCBCBC;

  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  background-color: #191919;
  border-bottom: 1px solid #242424;
  width: 100%;
  .arrow-left {
    position: absolute;
    min-width: 40px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--skin__neutral_1);
    font-size: 15px;
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
}
</style>