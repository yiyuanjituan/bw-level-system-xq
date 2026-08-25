<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "ui-pagination"
});

const props = withDefaults(defineProps<{
  modelValue: number;
  total: number;
  pageSize?: number;
}>(), {
  pageSize: 30
});

const emit = defineEmits<{
  (event: "update:modelValue", page: number): void;
}>();

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const pageItems = computed<(number | string)[]>(() => {
  if (pageCount.value <= 5) {
    return Array.from({ length: pageCount.value }, (_, index) => index + 1);
  }

  const currentPage = Math.min(Math.max(props.modelValue, 1), pageCount.value);
  if (currentPage <= 3) return [1, 2, 3, "next-ellipsis", pageCount.value];
  if (currentPage >= pageCount.value - 2) {
    return [1, "previous-ellipsis", pageCount.value - 2, pageCount.value - 1, pageCount.value];
  }
  return [1, "previous-ellipsis", currentPage, "next-ellipsis", pageCount.value];
});

function changePage(page: number) {
  const nextPage = Math.min(Math.max(page, 1), pageCount.value);
  if (nextPage === props.modelValue) return;
  emit("update:modelValue", nextPage);
}
</script>

<template>
  <div class="ui-pagination">
    <div class="ui-pagination__button">
      <button
        type="button"
        class="flex items-center justify-center text-[10px] pl-[1px]"
        :disabled="modelValue <= 1"
        :aria-label="$t('上一页')"
        @click="changePage(modelValue - 1)"
      >
        <svg-icon name="arrow-back"></svg-icon>
      </button>
    </div>
    <ul class="ui-pagination__items">
      <li
        v-for="pageItem in pageItems"
        :key="pageItem"
        class="ui-pagination__item ui-pagination__item--page hairline--surround"
        :class="{
          'ui-pagination__item--active': pageItem === modelValue,
          'ui-pagination__item--ellipsis': typeof pageItem !== 'number'
        }"
        @click="typeof pageItem === 'number' && changePage(pageItem)"
      >
        <div>{{ typeof pageItem === "number" ? pageItem : "···" }}</div>
      </li>
    </ul>
    <div class="ui-pagination__button">
      <button
        type="button"
        class="flex items-center justify-center text-[10px] pl-[1px] rotate-180"
        :disabled="modelValue >= pageCount"
        :aria-label="$t('下一页')"
        @click="changePage(modelValue + 1)"
      >
        <svg-icon name="arrow-back"></svg-icon>
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-pagination {
  margin: 0 auto;
  width: fit-content;
  font-size: 10px;
  display: flex;
  align-items: center;

  &__button {
    flex: 1;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    text-align: center;
    height: 25px;
    >button {
      width: 25px;
      height: 25px;
      margin: 0 auto;
      border: 1px solid #242424;
      background: #191919;
      border-radius: 5px;
      color: #DFBE5B;
      &:disabled {
        color: #666;
        cursor: not-allowed;
      }
    }
  }
  &__items {
    flex: 1;
    display: flex;
  }
  &__item--page {
    flex-grow: 0;
  }
  &__item {
    flex: 1;
    box-sizing: border-box;
    color: #FFFFFF;
    background: #191919;
    cursor: pointer;
    user-select: none;
    border: 1px solid #242424;
    margin: 0 3.75px;
    font-weight: 400;
    min-width: 25px;
    height: 25px;
  }
  &__item--active {
    color: #191919;
    background: var(--skin__primary);
    border-color: var(--skin__primary);
  }
  &__item--ellipsis {
    cursor: default;
  }
  &__item, &__page-desc {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
  }
}
</style>
