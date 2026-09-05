<script setup lang="ts" generic="T extends string">
interface LineTabItem {
  key: T;
  label: string;
}

defineOptions({
  name: 'HomeLineTabs'
});

const props = defineProps<{
  tabs: LineTabItem[];
  activeKey?: T;
}>();

const emit = defineEmits<{
  (event: 'update:activeKey', key: T): void;
  (event: 'change', key: T): void;
}>();

function pick(key: T) {
  if (key === props.activeKey) return;
  emit('update:activeKey', key);
  emit('change', key);
}
</script>

<template>
  <!-- 手写筛选条：对齐参考稿 .ui-tabs 顶部样式（下边框 + 激活下划线） -->
  <div class="home-line-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="home-line-tabs__tab"
      :class="{ 'home-line-tabs__tab--active': tab.key === activeKey }"
      role="tab"
      :aria-selected="tab.key === activeKey"
      @click="pick(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped lang="less">
.home-line-tabs {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 35px;
  box-sizing: border-box;
  border-bottom: thin solid var(--skin__border);
  background-color: transparent;

  &__tab {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 35px;
    padding: 0 14px;
    border: 0;
    color: var(--skin__lead);
    background-color: transparent;
    font-size: 12px;
    line-height: 35px;
    text-align: center;
    cursor: pointer;
    user-select: none;

    &--active {
      color: var(--skin__primary);

      &::after {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 24px;
        height: 3px;
        border-radius: 0;
        content: '';
        background-color: var(--skin__primary);
        transform: translateX(-50%);
      }
    }
  }
}
</style>
