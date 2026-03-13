<script setup lang="ts">

interface Props {
  info: any
}
const props = withDefaults(defineProps<Props>(), {
  info: () => ({}),
});
</script>

<template>
  <div class="scroll-box">
    <div class="header-bg">
      <div class="inner-box"></div>
    </div>
    <div class="head-box"></div>
    <div class="content" v-html="props.info.data"></div>
  </div>
</template>

<style scoped lang="less">
.scroll-box {
  width: 100%;
  //flex: 1;
  padding-bottom: 10px;
  margin-bottom: 10px;
  color: white;
  background: #222832;
  //overflow: auto;

  .header-bg {
    height: 0;
    .inner-box {
      background-image: url("@/assets/home/active_shading.avif");
      width: 100%;
      height: 78px;
      background-repeat: no-repeat;
      background-position: center !important;
      background-size: cover !important;
      z-index: 0;
    }
  }
  .head-box {
    height: 20px;
  }
  .content {
    font-size: 12px;
    p { margin: 0 }
  }
  .content * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
</style>