<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import HomeNavBar from '@/components/Home/NavBar.vue';
import HomeBanner from '@/components/Home/Banner.vue';
import HomeNotice from '@/components/Home/Notice.vue';
import HomeGameList from '@/components/Home/GameList.vue';
import HomeFloat from '@/components/Home/Float.vue';

const scrollEndDelay = 160;
const isHomeScrolling = ref(false);
let scrollEndTimer: number | null = null;

function handleHomeScroll() {
  isHomeScrolling.value = true;

  if (scrollEndTimer) {
    window.clearTimeout(scrollEndTimer);
  }

  scrollEndTimer = window.setTimeout(() => {
    isHomeScrolling.value = false;
    scrollEndTimer = null;
  }, scrollEndDelay);
}

onBeforeUnmount(() => {
  if (scrollEndTimer) {
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = null;
  }
});
</script>

<template>
  <div class="home-page">
    <HomeNavBar />
    <main class="home-page__scroll" id="scroll-box" @scroll="handleHomeScroll">
      <HomeBanner />
      <HomeNotice />
      <section class="home-page__game-list">
        <HomeGameList />
      </section>
    </main>
    <van-back-top target="#scroll-box" class="home-back-top">
      <svg-icon name="comm_icon_top" class-name="home-back-top__icon" />
      <span class="home-back-top__text">{{ $t("返回顶部") }}</span>
    </van-back-top>
    <HomeFloat :is-put="isHomeScrolling" />
  </div>
</template>

<style scoped lang="less">
.home-page {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--skin__home_bg);
}

.home-page__scroll {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: var(--skin__home_bg);
  background-image: url("@/assets/home/bg_pattern_tile.avif");
  background-position: center;
  background-size: 90px 90px;
}

.home-page__game-list {
  margin-top: 10px;
  padding-bottom: 20px;
}

.home-back-top {
  --van-back-top-bottom: 77px;
  --van-back-top-right: calc(50vw - 33px);
  width: 66px;
  height: 20px;
  border-radius: 10px;
  border: solid 1px #dfbe5b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: white;
  flex-direction: row;
  background: #191919;
  font-size: 9px;

  &__text {
    line-height: 9px;
    margin-left: 5px;
    white-space: nowrap;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    scale: 0.98;
  }

  :deep(.home-back-top__icon) {
    width: 10px;
    height: 10px;
  }
}
</style>
