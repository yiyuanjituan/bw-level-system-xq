<script setup lang="ts">
import type { MineTemplateActionItem } from "./types";

defineOptions({
  name: "TemplateTwoQuickNav"
});

defineProps<{
  items: MineTemplateActionItem[];
}>();

const emit = defineEmits<{
  select: [item: MineTemplateActionItem];
}>();
</script>

<template>
  <nav class="mine-template-two-quick" aria-label="个人中心快捷入口">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="mine-template-two-quick__item"
      :disabled="item.disabled"
      @click="emit('select', item)"
    >
      <span class="mine-template-two-quick__icon-wrap">
        <img v-if="item.image" class="mine-template-two-quick__image" :src="item.image" alt="" />
        <template v-else>
          <svg-icon
            v-if="item.icon"
            :name="item.icon"
            class="mine-template-two-quick__svg mine-template-two-quick__svg--base"
          />
          <svg-icon
            v-if="item.activeIcon"
            :name="item.activeIcon"
            class="mine-template-two-quick__svg mine-template-two-quick__svg--active"
          />
        </template>
        <span
          v-if="item.badge"
          class="mine-template-two-quick__badge"
          :class="`mine-template-two-quick__badge--${item.badgeTone || 'danger'}`"
        >
          {{ item.badge }}
        </span>
      </span>
      <span class="mine-template-two-quick__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="less">
.mine-template-two-quick {
  width: calc(100% - 10px);
  max-width: 355px;
  margin: 17px auto 0;
  padding: 5px 0 0;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.mine-template-two-quick__item {
  min-width: 0;
  min-height: 66px;
  padding: 0;
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: 0;
  color: var(--skin__lead);
  background: transparent;
  font: inherit;
  font-size: 11px;
  text-align: center;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.mine-template-two-quick__icon-wrap {
  width: 27.5px;
  height: 27.5px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-template-two-quick__image {
  width: 27.5px;
  height: 27.5px;
  object-fit: contain;
}

.mine-template-two-quick__svg {
  position: absolute;
  inset: 0;
  font-size: 27.5px;

  &--base {
    color: var(--skin__primary);
  }

  &--active {
    color: var(--skin__primary);
  }
}

.mine-template-two-quick__badge {
  max-width: 53px;
  height: 13px;
  padding: 0 4px;
  position: absolute;
  top: -2.5px;
  left: 50%;
  z-index: 2;
  overflow: hidden;
  border-radius: 6.5px 6.5px 6.5px 0;
  color: #fff;
  font-size: 9px;
  line-height: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translate(-50%, -2.5px);

  &--danger {
    background: var(--skin__accent_2);
  }

  &--success {
    background: var(--skin__accent_1);
  }

  &--primary {
    color: var(--skin__text_primary);
    background: var(--skin__primary);
  }

  &--muted {
    background: var(--skin__neutral_2);
  }
}

.mine-template-two-quick__label {
  max-width: 56px;
  max-height: 30px;
  margin-top: 1px;
  display: -webkit-box;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 11px;
  line-height: 15px;
  text-align: center;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:global([dir="rtl"]) .mine-template-two-quick__badge {
  right: 50%;
  left: auto;
  border-radius: 6.5px 6.5px 0;
  transform: translate(50%, -2.5px);
}
</style>
