<script setup lang="ts">
import { ref } from "vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange } from "@/components/HomeReport/types";
import UiEmpty from "@/components/UI/empty.vue";

interface SortOption {
  label: string;
  value: "lastLoginTime" | "directChildCount" | "deposit" | "validBet";
}

const sortOptions: SortOption[] = [
  { label: "登录日期排序", value: "lastLoginTime" },
  { label: "下级人数排序", value: "directChildCount" },
  { label: "充值金额排序", value: "deposit" },
  { label: "有效投注排序", value: "validBet" }
];

const selectedSort = ref<SortOption["value"]>("lastLoginTime");
const memberId = ref("");
const selectedTimeRange = ref<AccountTimeRange>();
const searchFocused = ref(false);
function handleSearch() {
  memberId.value = memberId.value.trim();
}
</script>

<template>
  <div class="_prmote-base-layout_1wp13_1 _layout_1wp13_69 promote-subordinate">
    <div
      class="_main_1msyu_70 lobby-scroll lobby-scroll--x _header-wrap_1wp13_75"
    >
      <div class="_search-tools_1wp13_65">
        <account-time-filter v-model="selectedTimeRange" />

        <span class="_sort-select-wrapper_1i8tv_59 promote-subordinate__sort">
          <x-select
            v-model="selectedSort"
            placement="bottom"
            :options="sortOptions"
            value-key="value"
            label-key="label"
          />
        </span>

        <x-input
          v-model="memberId"
          class="ui-select-input ui-select-input--hasSuffix _search-input_m6ujo_59 _animation_m6ujo_71 promote-subordinate__search"
          :class="{ '_focus_m6ujo_68': searchFocused }"
          type="search"
          placeholder="会员ID"
          aria-label="会员ID"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keydown.enter.prevent="handleSearch"
        >
          <template #suffix>
            <button
              class="lobby-image _search-icon_m6ujo_88 promote-subordinate__search-button"
              type="button"
              aria-label="搜索会员"
              @click.stop="handleSearch"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 3a7.5 7.5 0 1 0 4.72 13.33l4.22 4.22 1.06-1.06-4.22-4.22A7.5 7.5 0 0 0 10.5 3Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
              </svg>
            </button>
          </template>
        </x-input>
      </div>
    </div>

    <div
      class="_main_1msyu_70 lobby-scroll lobby-scroll--y lobby-scroll--system-scrollbar _list_1wp13_79 _list-wrap_1wp13_79 promote-subordinate__list"
    >
      <ui-empty class="ui-list ui-list__center" text="暂无内容">
        <template #text="{ text }">
          <span class="_noContent_1e2kx_59 promote-subordinate__empty-text">
            <span>{{ text }}</span>
            <button
              class="lobby-image ui-retry__icon _retry_1e2kx_65 promote-subordinate__retry"
              type="button"
              aria-label="重新加载"
              @click="handleSearch"
            >
              <svg viewBox="0 0 28 28" aria-hidden="true">
                <path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" />
              </svg>
            </button>
          </span>
        </template>
      </ui-empty>
    </div>
  </div>
</template>

<style scoped lang="less">
.promote-subordinate {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

:deep(.time-trigger) {
  border: var(--lobby__px) solid var(--skin__border);
}

:deep(.promote-subordinate__search) {
  width: 100px;
  height: 25px;
  box-sizing: border-box;
  padding: 0 8px 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 25px;
  font-size: 10px;
  transition: all 0.5s 0.3s;
}

:deep(.promote-subordinate__search._focus_m6ujo_68) {
  border-color: var(--skin__primary);
}

:deep(.promote-subordinate__search._focus_m6ujo_68._animation_m6ujo_71) {
  flex: 1;
  transition-delay: 0s;
}

:deep(.promote-subordinate__search .x-input__wrap) {
  height: 100%;
  line-height: 25px;
}

:deep(.promote-subordinate__search .x-input__field) {
  color: var(--skin__lead);
  font-size: 10px;
}

:deep(.promote-subordinate__search .x-input__field::placeholder) {
  color: var(--skin__neutral_3);
  opacity: 1;
}

:deep(.promote-subordinate__search .x-input__suffix) {
  margin-left: 5px;
}

:deep(.promote-subordinate__search ._search-icon_m6ujo_88) {
  width: 14px;
  height: 14px;
  color: var(--skin__primary);
  cursor: pointer;
}

.promote-subordinate__sort {
  display: inline-flex;
  flex: none;
  width: 110px;
}

:deep(.promote-subordinate__sort .x-popover__reference) {
  width: 100%;
}

:deep(.promote-subordinate__sort .x-select) {
  height: 25px;
  padding: 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 25px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2);
  font-size: 10px;
}

:deep(.promote-subordinate__sort .x-select__wrap),
:deep(.promote-subordinate__sort .x-select__value) {
  min-width: 0;
}

:deep(.promote-subordinate__sort .x-select__label) {
  display: inline-block;
  flex: none;
  height: auto;
  max-width: 85px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  font-size: 10px;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.promote-subordinate__sort .x-select__suffix) {
  flex: none;
  width: 10px;
  margin-left: 4px;
  color: var(--skin__neutral_2);
}

[dir="rtl"] :deep(.promote-subordinate__search) {
  margin-right: 10px;
  margin-left: 0;
  padding-right: 10px;
  padding-left: 8px;
}

[dir="rtl"] :deep(.promote-subordinate__search .x-input__suffix) {
  margin-right: 5px;
  margin-left: 0;
}

[dir="rtl"] :deep(.promote-subordinate__sort .x-select__suffix) {
  margin-right: 4px;
  margin-left: 0;
}

.promote-subordinate__search-button,
.promote-subordinate__retry {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

.promote-subordinate__list {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
}

.promote-subordinate__empty-text {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.promote-subordinate__retry {
  width: 15px;
  height: 15px;
}
</style>
