<script setup lang="ts">
import { ref } from 'vue';
import BasicHeader from '@/components/HomeBasic/BasicHeader.vue';
import BasicBanner from '@/components/HomeBasic/BasicBanner.vue';
import BasicNotice from '@/components/HomeBasic/BasicNotice.vue';
import BasicNavContainer from '@/components/HomeBasic/BasicNavContainer.vue';
import BasicGameList from '@/components/HomeBasic/BasicGameList.vue';
import HomeFooter from '@/components/Home/Footer.vue';

defineOptions({ name: 'BasicHome' });

const catalogRef = ref<InstanceType<typeof BasicGameList>>();
</script>

<template>
  <div class="basic-home">
    <BasicHeader />
    <main class="basic-home__scroll">
      <div class="basic-home__content">
        <BasicBanner />
        <BasicNotice />
        <BasicNavContainer @select-hot="catalogRef?.selectHotFilter($event)" />
        <section class="basic-home__catalog" data-home-game-section>
          <BasicGameList ref="catalogRef" />
        </section>
      </div>
      <HomeFooter />
    </main>
  </div>
</template>

<style scoped lang="less">
.basic-home {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background-color: var(--skin__home_bg);

  &__scroll {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-color: var(--skin__border) transparent;
    scrollbar-width: thin;
  }

  &__content {
    display: flow-root;
    padding-bottom: 15px;
    background: url('@/assets/home/bg_pattern_tile.avif') center top / 90px 90px;
  }

  &__catalog {
    margin-top: 10px;
  }
}
</style>
