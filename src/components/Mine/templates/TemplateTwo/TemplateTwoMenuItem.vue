<script setup lang="ts">
import { computed } from "vue";
import type { MineTemplateActionItem } from "./types";

defineOptions({
  name: "TemplateTwoMenuItem"
});

const props = defineProps<{
  item: MineTemplateActionItem;
}>();

const emit = defineEmits<{
  select: [item: MineTemplateActionItem];
}>();

const extraLines = computed(() => {
  if (!props.item.extra) return [];
  return Array.isArray(props.item.extra) ? props.item.extra : [props.item.extra];
});
</script>

<template>
  <button
    type="button"
    class="mine-template-two-menu-item"
    :disabled="item.disabled"
    @click="emit('select', item)"
  >
    <span class="mine-template-two-menu-item__left">
      <span
        class="mine-template-two-menu-item__icon"
        :class="{ 'mine-template-two-menu-item__icon--claim': item.iconMode === 'claim' }"
      >
        <template v-if="item.iconMode === 'claim'">
          <svg-icon
            name="mine-template-two-comm_icon_dblp_1"
            class="mine-template-two-menu-item__claim-first"
          />
          <svg-icon
            name="mine-template-two-comm_icon_dblp_2"
            class="mine-template-two-menu-item__claim-second"
          />
          <svg-icon
            name="mine-template-two-comm_icon_gou"
            class="mine-template-two-menu-item__claim-check"
          />
        </template>
        <template v-else>
          <svg-icon
            v-if="item.icon"
            :name="item.icon"
            class="mine-template-two-menu-item__svg mine-template-two-menu-item__svg--base"
          />
          <svg-icon
            v-if="item.activeIcon"
            :name="item.activeIcon"
            class="mine-template-two-menu-item__svg mine-template-two-menu-item__svg--active"
          />
        </template>
      </span>
      <span class="mine-template-two-menu-item__label">{{ item.label }}</span>
    </span>

    <span class="mine-template-two-menu-item__right">
      <span
        v-if="extraLines.length"
        class="mine-template-two-menu-item__extra"
        :class="`mine-template-two-menu-item__extra--${item.extraTone || 'muted'}`"
      >
        <span v-for="line in extraLines" :key="line">{{ line }}</span>
      </span>
      <svg-icon name="mine-template-two-comm_icon_fh" class="mine-template-two-menu-item__arrow" />
    </span>
  </button>
</template>

<style scoped lang="less">
.mine-template-two-menu-item {
  width: 100%;
  height: 40px;
  min-height: 40px;
  padding: 0 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  color: var(--skin__lead);
  background: var(--skin__bg_2);
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.mine-template-two-menu-item__left,
.mine-template-two-menu-item__right {
  min-width: 0;
  display: flex;
  align-items: center;
}

.mine-template-two-menu-item__left {
  flex: 1;
  overflow: hidden;
}

.mine-template-two-menu-item__right {
  max-width: 58%;
  justify-content: flex-end;
}

.mine-template-two-menu-item__icon {
  width: 20px;
  height: 20px;
  flex: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-template-two-menu-item__svg {
  position: absolute;
  inset: 0;
  font-size: 20px;

  &--base {
    color: var(--skin__primary);
  }

  &--active {
    color: var(--skin__primary);
  }
}

.mine-template-two-menu-item__icon--claim {
  color: var(--skin__accent_1);
}

.mine-template-two-menu-item__claim-first,
.mine-template-two-menu-item__claim-second {
  position: absolute;
  inset: 0;
  font-size: 20px;
}

.mine-template-two-menu-item__claim-second {
  color: var(--skin__accent_3);
}

.mine-template-two-menu-item__claim-check {
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  margin: auto;
  color: #fff;
  font-size: 6px;
}

.mine-template-two-menu-item__label {
  min-width: 0;
  margin-left: 12px;
  flex: 1;
  display: -webkit-box;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.mine-template-two-menu-item__extra {
  width: auto;
  min-width: 130px;
  max-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  overflow: hidden;
  font-size: 11px;
  line-height: 15px;
  text-align: right;

  span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--primary {
    color: var(--skin__primary);
  }

  &--success {
    color: var(--skin__accent_1);
  }

  &--danger {
    color: var(--skin__accent_2);
  }

  &--muted {
    color: var(--skin__neutral_2);
  }
}

.mine-template-two-menu-item__arrow {
  width: 12px;
  height: 12px;
  margin-left: 5px;
  flex: none;
  color: var(--skin__neutral_2);
  font-size: 12px;
  transform: rotate(180deg);
}

:global([dir="rtl"]) .mine-template-two-menu-item {
  text-align: right;
}

:global([dir="rtl"]) .mine-template-two-menu-item__label {
  margin-right: 12px;
  margin-left: 0;
}

:global([dir="rtl"]) .mine-template-two-menu-item__extra {
  align-items: flex-start;
  text-align: left;
}

:global([dir="rtl"]) .mine-template-two-menu-item__arrow {
  margin-right: 5px;
  margin-left: 0;
  transform: rotate(-180deg);
}
</style>
