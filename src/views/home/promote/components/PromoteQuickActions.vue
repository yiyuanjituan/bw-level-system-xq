<script setup lang="ts">
import createIcon from "@/assets/home/promote/action-create-subordinate.avif";
import rebateIcon from "@/assets/home/promote/action-rebate-ratio.avif";

defineEmits<{
  selectTab: [active: "createSubordinate" | "rebateRatio"];
}>();

</script>

<template>
  <nav class="quick-actions" aria-label="推广快捷入口">
    <button type="button" class="quick-actions__item quick-actions__item--primary" @click="$emit('selectTab', 'createSubordinate')">
      <span class="quick-actions__text-wrap"><img :src="createIcon" alt="" /><span class="quick-actions__title">创建下级</span></span>
      <svg-icon name="arrow-back" class-name="quick-actions__arrow" aria-hidden="true" />
    </button>
    <button type="button" class="quick-actions__item quick-actions__item--accent" @click="$emit('selectTab', 'rebateRatio')">
      <span class="quick-actions__text-wrap"><img :src="rebateIcon" alt="" /><span class="quick-actions__title">返佣比例</span></span>
      <svg-icon name="arrow-back" class-name="quick-actions__arrow" aria-hidden="true" />
    </button>
  </nav>
</template>

<style scoped lang="less">
.quick-actions {
  display: flex;
  gap: 0.2rem;
  padding: 0 0.2rem;
  margin-bottom: 0.2rem;
}

.quick-actions__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  height: 0.8rem;
  padding: 0 0.1rem;
  border: 0;
  border-radius: 0.16rem;
  color: var(--skin__text_primary, #fff);
  font-size: 0.24rem;
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
    width: 0.44rem;
  }
}

.quick-actions__title {
  display: -webkit-box;
  flex: 1;
  margin-left: 0.08rem;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:deep(.quick-actions__arrow) {
  flex: none;
  color: var(--skin__bg_2);
  font-size: 0.2rem;
  font-weight: 400;
  opacity: 0.7;
  transform: translateY(0.01rem) rotate(180deg);
}

.quick-actions__item--primary {
  background: var(--skin__primary);
  box-shadow: 0 0.02rem 0.04rem rgba(var(--skin__primary__toRgbString), 0.1);
}

.quick-actions__item--accent {
  color: var(--skin__text_accent3, #fff);
  background: var(--skin__accent_3);
  box-shadow: 0 0.02rem 0.04rem rgba(var(--skin__accent_3__toRgbString), 0.1);
}
</style>
