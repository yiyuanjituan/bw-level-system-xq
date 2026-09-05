<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'HomeExpandMore'
});

/**
 * 通用“展开更多”按钮：文案 = 另有{n}款游戏 + “展开”箭头。
 * 点击后仅 emit expand，由父级负责把区域切到全量并隐藏本按钮（参考稿：展开后该区域不再出现“收起”）。
 */
const props = withDefaults(
  defineProps<{
    count?: number;
    text?: string;
  }>(),
  {
    count: 0,
    text: ''
  }
);

const emit = defineEmits<{
  (event: 'expand'): void;
}>();

const displayText = computed(() => (
  props.text || $t('另有{count}款游戏', { count: props.count || 0 })
));
</script>

<template>
  <button type="button" class="home-expand-more" @click="emit('expand')">
    <span class="home-expand-more__text">{{ displayText }}</span>
    <span class="home-expand-more__action">
      {{ $t('展开') }}
      <svg-icon name="comm_icon_jzgd" class-name="home-expand-more__arrow" />
    </span>
  </button>
</template>

<style scoped lang="less">
.home-expand-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  user-select: none;

  &__text {
    color: var(--skin__neutral_2);
  }

  &__action {
    display: inline-flex;
    margin-inline-start: 5px;
    color: var(--skin__primary);
  }

  &__arrow {
    position: relative;
    top: 1px;
    width: 10px;
    height: 10px;
    margin-left: 5px;
    color: inherit;
  }
}
</style>
