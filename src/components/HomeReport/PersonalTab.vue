<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  AccountTimeRange,
  SelectOption,
  SummaryItem
} from "@/components/HomeReport/types";
import HomeReportSummaryBar from "@/components/HomeReport/SummaryBar.vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import UiEmpty from "@/components/UI/empty.vue";
import dayjs from "dayjs";

type PersonalFilterOption = SelectOption & {
  value: number;
};

const summaryItems: SummaryItem[] = [
  { label: "累计注单数", value: 0 },
  { label: "累计有效投注", value: '￥0.00' },
  { label: "累计预扣税", value: '￥0.00' },
  { label: "累计输赢", value: '￥0.00', color: "danger" }
];

const typeOptions: PersonalFilterOption[] = [
  { label: "全部类型", value: 0 },
  { label: "充值报表", value: 1 },
  { label: "提现报表", value: 2 },
  { label: "优惠报表", value: 3 }
];

const platformOptions: PersonalFilterOption[] = [
  { label: "全部平台", value: 0 },
  { label: "体育", value: 1 },
  { label: "真人", value: 2 },
  { label: "电子", value: 3 }
];

const typeFilterValue = ref(typeOptions[0]?.value ?? 0);
const platformFilterValue = ref(platformOptions[0]?.value ?? 0);
const timeRange = ref<AccountTimeRange>(createTodayRange());

function createTodayRange(): AccountTimeRange {
  const today = dayjs().format("YYYY-MM-DD");

  return {
    mode: "today",
    label: "今日",
    startTime: dayjs(today).startOf("day").unix(),
    endTime: dayjs(today).endOf("day").unix(),
    startDate: today,
    endDate: today
  };
}

function handleSeeMore() {
  const yesterday = dayjs().subtract(1, "day");

  timeRange.value = {
    mode: "yesterday",
    label: "昨日",
    startTime: yesterday.startOf("day").unix(),
    endTime: yesterday.endOf("day").unix(),
    startDate: yesterday.format("YYYY-MM-DD"),
    endDate: yesterday.format("YYYY-MM-DD")
  };
}

const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无记录";
  }

  return `${timeRange.value.label}暂无记录`;
});
</script>

<template>
  <div class="personal-tab">
    <section class="filter-row">
      <div class="filter-row__left">
        <AccountTimeFilter v-model="timeRange" />
        <div class="filter-select">
          <x-select
            v-model="typeFilterValue"
            :options="typeOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

        <div class="filter-select">
          <x-select
            v-model="platformFilterValue"
            :options="platformOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>
      </div>

      <div class="sort-entry" v-if="false">
        <span>排序</span>
        <svg-icon
          name="arrow-back"
          class-name="sort-entry__icon rotate-[90deg]"
        />
      </div>
    </section>

    <section class="content-area">
      <ui-empty>
        <template #text>
          <div class="empty-state__text">
            <span>{{ emptyStateText }}</span>
            <template v-if="timeRange.mode === 'today'">
              <span>，可</span>
              <span class="empty-state__link" @click="handleSeeMore"
                >查看更多</span
              >
            </template>
          </div>
        </template>
      </ui-empty>
    </section>

    <HomeReportSummaryBar :items="summaryItems" />
  </div>
</template>

<style scoped lang="less">
.personal-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
}

.filter-row__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-select {
  width: 81px;
  flex-shrink: 0;
}

.filter-select :deep(.x-select) {
  height: 25px;
  padding: 0 10px;
  border: 1px solid var(--skin__neutral_3);
  border-radius: 14px;
  background: #191919;
  color: var(--skin__neutral_2, var(--skin__lead));
}

.filter-select :deep(.x-select--focused) {
  border-color: #dfbe5b;
  color: #dfbe5b;
}

.filter-select :deep(.x-select__wrap) {
  line-height: 25px;
}

.filter-select :deep(.x-select__label),
.filter-select :deep(.x-select__placeholder) {
  font-size: 10px;
  color: inherit;
}

.filter-select :deep(.x-select__suffix) {
  margin-left: 6px;
  font-size: 10px;
}

.sort-entry {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-height: 0;
  display: flex;
}

.empty-state__text {
  color: var(--skin__neutral_2, var(--skin__lead));
  font-size: 13px;
  line-height: 1.5;
}

.empty-state__link {
  color: #dfbe5b;
  cursor: pointer;
}
</style>
