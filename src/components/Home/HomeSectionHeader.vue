<script setup lang="ts">
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'HomeSectionHeader'
});

/**
 * 通用分区标题行：左侧图标+标题，右侧可选“全部”跳转入口。
 * 样式对应参考稿 ._game-headline（标题图标、右侧触发器）。
 */
const props = withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    showAll?: boolean;
  }>(),
  {
    icon: '',
    showAll: false
  }
);

const emit = defineEmits<{
  (event: 'all'): void;
}>();

function handleAll() {
  if (props.showAll) emit('all');
}
</script>

<template>
  <div class="home-section-header">
    <div class="home-section-header__title">
      <home-skeleton-image
        v-if="icon"
        :src="icon"
        alt="."
        class="home-section-header__icon"
        fit="contain"
        loading="lazy"
      />
      <p class="home-section-header__text">{{ title }}</p>
    </div>
    <div
      v-if="showAll"
      class="home-section-header__trigger"
      role="button"
      tabindex="0"
      @click="handleAll"
      @keydown.enter="handleAll"
    >
      <div class="home-section-header__click-area">{{ $t('全部') }}</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.home-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 26px;
  margin-bottom: 10px;

  &__title {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__icon {
    flex: none;
    width: 26px;
    height: 26px;
    margin-inline-end: 2.5px;
    background-color: transparent;
  }

  &__text {
    margin: 0;
    overflow: hidden;
    color: var(--skin__lead);
    font-size: 15px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__trigger {
    flex: none;
    color: var(--skin__neutral_2);
    font-size: 12px;
    line-height: 20px;
    cursor: pointer;
    user-select: none;
  }

  &__click-area {
    display: inline-block;
    margin: -6px -10px;
    padding: 6px 10px;
  }
}
</style>
