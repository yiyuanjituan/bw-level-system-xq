<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import HomeNavBar from '@/components/Home/NavBar.vue';
import HomeBanner from '@/components/Home/Banner.vue';
import HomeNotice from '@/components/Home/Notice.vue';
import HomeGameList from '@/components/Home/GameList.vue';
import HomeFloat from '@/components/Home/Float.vue';
import HomeBackTop from '@/components/Home/BackTop.vue';

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
    <HomeBackTop target="#scroll-box" :is-put="isHomeScrolling" />
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

</style>
