<script setup lang="ts">
import HomeBanner from '@/components/Home/Banner.vue';
import useHomeDataStore from '@/store/modules/home';

defineOptions({
  name: 'BasicBanner'
});
const home = useHomeDataStore();
</script>

<template>
  <!-- 与参考稿 banner-box-3 一致：10px 外距、2.1rem 高、圆角裁剪的整块轮播 -->
  <section v-if="home.homeBannerList.length" id="bannerClick" class="basic-banner" data-sensors-click="true">
    <home-banner class="basic-banner__inner" />
  </section>
</template>

<style scoped lang="less">
.basic-banner {
  width: auto;
  height: 105px;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;

  &__inner {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;

    :deep(.van-swipe__indicators) {
      bottom: 5px;
    }

    :deep(.van-swipe__indicator) {
      background-color: #fff;
      opacity: 0.5;
    }

    :deep(.van-swipe__indicator--active) {
      width: 5px !important;
      opacity: 1;
    }
  }
}
</style>
