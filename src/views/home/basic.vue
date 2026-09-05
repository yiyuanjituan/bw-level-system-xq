<script setup lang="ts">
import { ref } from 'vue';
import BasicHeader from '@/components/HomeBasic/BasicHeader.vue';
import BasicBanner from '@/components/HomeBasic/BasicBanner.vue';
import BasicNotice from '@/components/HomeBasic/BasicNotice.vue';
import BasicNavContainer from '@/components/HomeBasic/BasicNavContainer.vue';
import BasicGameList from '@/components/HomeBasic/BasicGameList.vue';
import HomeFooter from '@/components/Home/Footer.vue';

defineOptions({
  name: 'BasicHome'
});
const gameList = ref<InstanceType<typeof BasicGameList> | null>(null);
</script>

<template>
  <div class="basic-home">
    <BasicHeader class="basic-home__header" @search="gameList?.openSearch()" />

    <main class="basic-home__scroll">
      <BasicBanner />
      <BasicNotice />
      <BasicNavContainer @select-hot="gameList?.selectHotFilter($event)" />
      <section class="basic-home__game" data-home-game-section>
        <BasicGameList ref="gameList" />
      </section>
      <HomeFooter class="basic-home__footer" />
    </main>
  </div>
</template>

<style scoped lang="less">
.basic-home {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background-color: var(--skin__home_bg);

  &__header {
    flex: none;
    width: 100%;
    z-index: 10;
  }

  &__scroll {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--skin__home_bg);
    background-image: url('@/assets/home/bg_pattern_tile.avif');
    background-position: center;
    background-size: 90px 90px;
    scrollbar-width: thin;
    scrollbar-color: var(--skin__border) transparent;
    -webkit-overflow-scrolling: touch;
  }

  &__game {
    width: 100%;
    margin-top: 10px;
  }

  &__footer {
    width: 100%;
  }
}
</style>
