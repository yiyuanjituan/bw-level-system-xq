<script setup lang="ts">
defineOptions({
  name: "MineBanner"
});
</script>

<template>
  <div class="banner-box">
    <van-swipe class="my-swipe" :autoplay="30000" indicator-color="white">
      <van-swipe-item v-for="i in 6" :key="i">
        <img
          src="https://146.103.80.124:5001/active/ActiveImg40068704388241324.avif"
          alt="."
          class="swiper-bg"
        />
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<style scoped lang="less">
.banner-box {
  margin-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
  width: 100%;
  height: 160px;

  .my-swipe {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: #202329;
    --van-swipe-indicator-size: 5px;
    --van-swipe-indicator-margin: 5px;

    :deep(.van-swipe__indicator) {
      border-radius: 5px !important;
      margin-left: 3px;
      margin-right: 3px;
    }
    :deep(.van-swipe__indicator--active) {
      width: 12px !important;
    }
    .swiper-bg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
