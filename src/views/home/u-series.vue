<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import HomeBanner from "@/components/Home/Banner.vue";
import HomeNotice from "@/components/Home/Notice.vue";
import HomeFloat from "@/components/Home/Float.vue";
import HomeBackTop from "@/components/Home/BackTop.vue";
import UHeader from "@/components/Home/UHeader.vue";
import UQuickNav from "@/components/Home/UQuickNav.vue";
import UGameList from "@/components/Home/UGameList.vue";
import UContact from "@/components/Home/UContact.vue";

defineOptions({
  name: "UHome"
});

const scrollEndDelay = 160;
const isHomeScrolling = ref(false);
const showHeaderBackground = ref(false);
let scrollEndTimer: number | null = null;

function handleHomeScroll(event: Event) {
  const scrollContainer = event.currentTarget as HTMLElement;
  isHomeScrolling.value = true;
  showHeaderBackground.value = scrollContainer.scrollTop > 24;

  if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
  scrollEndTimer = window.setTimeout(() => {
    isHomeScrolling.value = false;
    scrollEndTimer = null;
  }, scrollEndDelay);
}

onBeforeUnmount(() => {
  if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
});
</script>

<template>
  <div class="u-home">
    <UHeader :solid="showHeaderBackground" />
    <main id="u-home-scroll" class="u-home__scroll" @scroll="handleHomeScroll">
      <section class="u-home__hero">
        <HomeBanner />
      </section>
      <HomeNotice class="u-home__notice" />
      <UQuickNav />
      <UGameList />
      <UFooterBox />
    </main>
    <HomeBackTop target="#u-home-scroll" :is-put="isHomeScrolling" />
    <HomeFloat :is-put="isHomeScrolling" />
  </div>
</template>

<style scoped lang="less">
.u-home {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background-color: var(--skin__home_bg);

  &::before {
    position: absolute;
    content: "";
    background-image: url("@/assets/home/u-series/img_db_dt_bg.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    pointer-events: none;
  }
}

.u-home__scroll {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: transparent;
}

.u-home__hero {
  min-height: 170px;
}

.u-home__hero :deep(.home-banner) {
  height: 170px;
  margin-top: 0;
  padding: 0;
}

.u-home__hero :deep(.home-banner__swipe) {
  border-radius: 0;
}

:deep(.u-home__notice.home-notice) {
  --van-notice-bar-height: 21px;
  --van-notice-bar-font-size: 10px;
  height: 21px;
  margin: 5px 10px 0;
  padding: 0 10px;
  border: 1px solid var(--skin__bg_2);
  border-radius: 11px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.75);
}

:deep(.u-home__notice .home-notice__speaker) {
  width: 15px;
  height: 14px;
}

:deep(.u-home__notice .home-notice__swipe),
:deep(.u-home__notice .van-swipe-item) {
  height: 21px;
}

:deep(.u-home__notice .home-notice__message) {
  width: 24px;
  height: 21px;
  margin-left: 4px;
}

:deep(.u-home__notice .home-notice__message-icon) {
  width: 24px;
  height: 21px;
}

@media (min-width: 560px) {
  .u-home__hero,
  .u-home__hero :deep(.home-banner) {
    min-height: 220px;
    height: 220px;
  }
}
</style>
