<script setup lang="ts">
import createIcon from "@/assets/home/promote/action-create-subordinate.avif";
import rebateIcon from "@/assets/home/promote/action-rebate-ratio.avif";

withDefaults(
  defineProps<{
    showCreateSubordinate?: boolean;
  }>(),
  {
    showCreateSubordinate: true
  }
);

defineEmits<{
  selectTab: [active: "createSubordinate" | "rebateRatio"];
}>();

</script>

<template>
  <nav class="quick-actions" :aria-label="$t('推广快捷入口')">
    <button v-if="showCreateSubordinate" type="button" class="quick-actions__item quick-actions__item--primary" @click="$emit('selectTab', 'createSubordinate')">
      <span class="quick-actions__text-wrap"><img :src="createIcon" alt="" /><span class="quick-actions__title">{{ $t("创建下级") }}</span></span>
      <svg-icon name="arrow-back" class-name="quick-actions__arrow" aria-hidden="true" />
    </button>
    <button type="button" class="quick-actions__item quick-actions__item--accent" @click="$emit('selectTab', 'rebateRatio')">
      <span class="quick-actions__text-wrap"><img :src="rebateIcon" alt="" /><span class="quick-actions__title">{{ $t("返佣比例") }}</span></span>
      <svg-icon name="arrow-back" class-name="quick-actions__arrow" aria-hidden="true" />
    </button>
  </nav>
</template>

<style scoped lang="less">
.quick-actions {
  display: flex;
  gap: 10px;
  padding: 0 10px;
  margin-bottom: 10px;
}

.quick-actions__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  height: 40px;
  padding: 0 5px;
  border: 0;
  border-radius: 8px;
  color: var(--skin__text_primary, #fff);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  cursor: pointer;

}

.quick-actions__text-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  img {
    flex: none;
    width: 22px;
  }
}

.quick-actions__title {
  display: -webkit-box;
  flex: 1;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:deep(.quick-actions__arrow) {
  flex: none;
  color: var(--skin__bg_2);
  font-size: 10px;
  font-weight: 400;
  opacity: 0.7;
  transform: translateY(0.5px) rotate(180deg);
}

.quick-actions__item--primary {
  background: var(--skin__primary);
  box-shadow: 0 1px 2px rgba(var(--skin__primary__toRgbString), 0.1);
}

.quick-actions__item--accent {
  color: var(--skin__text_accent3, #fff);
  background: var(--skin__accent_3);
  box-shadow: 0 1px 2px rgba(var(--skin__accent_3__toRgbString), 0.1);
}
</style>
