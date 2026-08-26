<script setup lang="ts">
import router from '@/router';
import useHomeDataStore, { type BannerItem } from '@/store/modules/home';

defineOptions({
  name: "HomeBanner"
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
  <div v-if="home.homeBannerList.length" class="home-banner">
    <van-swipe class="home-banner__swipe" :autoplay="30000" indicator-color="white">
      <van-swipe-item
        v-for="item in home.homeBannerList"
        :key="item.id"
        @click="handleBannerClick(item)"
      >
        <img
          :src="item.image"
          alt=""
          class="home-banner__image"
        />
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<style scoped lang="less">
.home-banner {
  margin-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  height: 105px;

  &__swipe {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
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
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
