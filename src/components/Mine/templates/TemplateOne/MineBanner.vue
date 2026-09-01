<script setup lang="ts">
import router from '@/router';
import useHomeDataStore, { type BannerItem } from '@/store/modules/home';

defineOptions({
  name: 'MineBanner'
});

const home = useHomeDataStore();

function handleBannerClick(item: BannerItem) {
  if (item.jumpMode === 0 || !item.url) return;

  if (item.jumpMode === 1) {
    void router.push(item.url);
    return;
  }

  window.open(item.url, '_blank');
}
</script>

<template>
  <div v-if="home.mineBannerList.length" class="banner-box">
    <van-swipe class="my-swipe" :autoplay="30000" indicator-color="white">
      <van-swipe-item v-for="item in home.mineBannerList" :key="item.id" @click="handleBannerClick(item)">
        <img :src="item.image" alt="" class="swiper-bg" />
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<style scoped lang="less">
.banner-box {
  margin-top: 10px;
  padding-left: 12.5px;
  padding-right: 12.5px;
  margin-bottom: 0;
  width: 100%;
  height: 160px;

  .my-swipe {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: var(--skin__bg_2);
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
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
