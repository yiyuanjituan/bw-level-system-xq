<script setup lang="ts">
import { computed } from 'vue';
import useAppStore from '@/store/modules/app';
import searchIcon from '@/assets/home/basic/icon_dt_1ss.avif';

defineOptions({
  name: 'BasicHeader'
});

const emit = defineEmits<{ search: [] }>();
const app = useAppStore();
const siteLogo = computed(() => app.appInfo?.logo as string | undefined);
</script>

<template>
  <header class="basic-header">
    <div class="basic-header__container">
      <div class="basic-header__section basic-header__section--left">
        <div v-if="siteLogo" class="basic-header__logo-box">
          <img class="basic-header__logo" :src="siteLogo" alt="logo" loading="eager" />
        </div>
      </div>
      <div class="basic-header__section basic-header__section--right">
        <button type="button" class="basic-header__search" @click="emit('search')">
          <img class="basic-header__search-icon" :src="searchIcon" alt="" />
          <span>{{ $t('搜索') }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.basic-header {
  // 顶部通栏：与参考稿 .lobby-home-header-container 相同职责（顶部栏 + 搜索入口）
  width: 100%;
  height: 45px;
  padding: 0 10px 0 5px;
  box-sizing: border-box;
  color: var(--skin__lead);
  background-color: var(--skin__bs_topnav_bg);
  border-bottom: var(--lobby__px) solid var(--skin__border);

  &__container {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    height: 100%;
  }

  &__section {
    display: flex;
    align-items: center;
    height: 100%;
    z-index: 2;

    &--left {
      justify-content: flex-start;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    &--right {
      justify-content: flex-end;
      flex-shrink: 0;
    }
  }

  &__logo-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 38px;
    width: 207.5px;
    max-width: 100%;
  }

  &__logo {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    vertical-align: middle;
    cursor: pointer;
  }

  &__search {
    padding: 0;
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    max-width: 51px;
    font-size: 11px;
    color: var(--skin__neutral_1);
    cursor: pointer;
    user-select: none;

    img {
      display: block;
      width: 27px;
      height: 27px;
    }

    > span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 51px;
      line-height: 1.2;
    }
  }
}
</style>
