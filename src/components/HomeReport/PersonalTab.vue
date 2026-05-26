<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import type { AccountTimeRange, SelectOption, SummaryItem } from "@/components/HomeReport/types";
import HomeReportSummaryBar from "@/components/HomeReport/SummaryBar.vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import { service } from "@/api/service";
import { formatMoney, toNumber } from "@/utils/common";

type PersonalFilterOption = SelectOption & {
  value: number | string;
};

interface PersonalReportSummary {
  totalBetCount?: number;
  totalValidBetAmount?: number;
  totalTaxAmount?: number;
  totalNetAmount?: number;
}

interface PersonalReportListItem {
  id?: number | string;
  reportDate?: string;
  type?: number;
  apiCode?: string;
  playType?: string;
  betAmount?: number;
  validBetAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  betCount?: number;
  short_image?: string;
}

interface PersonalReportData {
  page: number;
  limit: number;
  total: number;
  summary: PersonalReportSummary;
  list: PersonalReportListItem[];
}

const typeOptions: PersonalFilterOption[] = [
  { label: "全部类型", value: "all" },
  { label: "真人", value: 1 },
  { label: "捕鱼", value: 2 },
  { label: "电子", value: 3 },
  { label: "彩票", value: 4 },
  { label: "体育", value: 5 },
  { label: "棋牌", value: 6 },
  { label: "电竞", value: 7 }
];

const platformOptions: PersonalFilterOption[] = [{ label: "全部平台", value: "all" }];

const typeFilterValue = ref<number | string>(typeOptions[0]?.value ?? "all");
const platformFilterValue = ref<number | string>(platformOptions[0]?.value ?? "all");
const timeRange = ref<AccountTimeRange>(createTodayRange());
const reportData = ref<PersonalReportData>(createDefaultReportData());
const isLoading = ref(false);
let latestRequestId = 0;

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

function createDefaultReportData(): PersonalReportData {
  return {
    page: 1,
    limit: 20,
    total: 0,
    summary: {},
    list: []
  };
}

function createQueryParams() {
  return {
    startTime: timeRange.value.startTime,
    endTime: timeRange.value.endTime,
    type: typeFilterValue.value === "all" ? "" : typeFilterValue.value
  };
}

function normalizeReportData(response: any): PersonalReportData {
  return {
    page: Math.max(Number(response?.page) || 1, 1),
    limit: Math.max(Number(response?.limit) || 20, 1),
    total: Math.max(Number(response?.total) || 0, 0),
    summary: response?.summary ?? {},
    list: Array.isArray(response?.list) ? response.list : []
  };
}

async function init() {
  const requestId = ++latestRequestId;
  isLoading.value = true;

  try {
    const response = await service.v1.user.personalReport(createQueryParams());
    if (requestId === latestRequestId) {
      reportData.value = normalizeReportData(response?.data ?? response);
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
}

const totalBetCount = computed(() => toNumber(reportData.value.summary?.totalBetCount));
const totalValidBetAmount = computed(() => toNumber(reportData.value.summary?.totalValidBetAmount));
const totalTaxAmount = computed(() => toNumber(reportData.value.summary?.totalTaxAmount));
const totalNetAmount = computed(() => toNumber(reportData.value.summary?.totalNetAmount));

const summaryItems = computed<SummaryItem[]>(() => [
  { label: "累计注单数", value: totalBetCount.value },
  { label: "累计有效投注", value: `￥${formatMoney(totalValidBetAmount.value)}` },
  { label: "累计预扣税", value: `￥${formatMoney(totalTaxAmount.value)}`, color: "warn" },
  {
    label: "累计输赢",
    value: `￥${formatMoney(totalNetAmount.value)}`,
    color: totalNetAmount.value < 0 ? "danger" : "success"
  }
]);

const hasListData = computed(() => reportData.value.list.length > 0);
const hasSummaryData = computed(() => {
  return (
    totalBetCount.value > 0 ||
    totalValidBetAmount.value !== 0 ||
    totalTaxAmount.value !== 0 ||
    totalNetAmount.value !== 0
  );
});

const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无记录";
  }

  return `${timeRange.value.label}暂无记录`;
});

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, typeFilterValue], () => {
  void init();
});
onMounted(() => {
  void init();
});
</script>

<template>
  <div class="personal-tab">
    <section class="filter-row">
      <div class="filter-row__scroll">
        <AccountTimeFilter v-model="timeRange" />

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="typeFilterValue"
            :options="typeOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="platformFilterValue"
            :options="platformOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>
      </div>
    </section>

    <section class="content-area">
      <div v-if="isLoading && !hasListData && !hasSummaryData" class="content-state">
        <ui-loading />
      </div>

      <ui-empty v-else-if="!hasListData && !hasSummaryData">
        <template #text>
          <div class="empty-state__text">
            <span>{{ emptyStateText }}</span>
            <template v-if="timeRange.mode === 'today'">
              <span>，可</span>
              <span class="empty-state__link" @click="handleSeeMore">查看更多</span>
            </template>
          </div>
        </template>
      </ui-empty>

      <div v-else-if="hasListData" class="record-list">
        <article
          v-for="(item, index) in reportData.list"
          :key="item.id ?? `${item.reportDate ?? ''}-${item.apiCode ?? ''}-${item.playType ?? ''}-${index}`"
          class="record-card"
        >
          <div class="record-card__row">
            <div class="darken flex items-center">
              <img :src="item.short_image" alt="." class="h-[13px] mr-[1px]" />
              {{ typeOptions.find(v => v.value == item.type)?.label }}/<span>{{ item.playType }}</span>
            </div>
            <span>{{ item.reportDate }}</span>
          </div>

          <div class="record-card__row">
            <span>
              <label>投注&nbsp;</label>
              <span dir="ltr" class="darken link">{{ formatMoney(item.betAmount) }}</span>
            </span>
            <span>
              <label>总输赢&nbsp;</label>
              <span dir="ltr" class="darken">
                <span dir="ltr" class="green" v-if="item.netAmount < 0">{{ formatMoney(item.netAmount) }}</span>
                <span dir="ltr" class="red" v-if="item.netAmount >= 0">{{ formatMoney(item.netAmount) }}</span>
              </span>
            </span>
          </div>
          <div class="record-card__row">
            <span>
              <label>有效投注&nbsp;</label>
              <span dir="ltr" class="darken link">{{ formatMoney(item.validBetAmount) }}</span>
            </span>
            <span>
              <label>注单数&nbsp;</label>
              <span dir="ltr" class="darken hb">{{ item.betCount }}</span>
            </span>
          </div>
        </article>
      </div>

      <div v-else class="content-state content-state--placeholder">
        <span class="content-state__tip">当前筛选下暂无明细</span>
      </div>
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
  padding: 10px 0;
}

.filter-row__scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-left: 10px;
  padding-right: 10px;
}

.filter-select {
  flex-shrink: 0;
}

.filter-select--sm {
  width: 81px;
}

.filter-select :deep(.x-select) {
  height: 25px;
  padding: 0 10px;
  border: 1px solid var(--skin__neutral_3);
  border-radius: 14px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2, var(--skin__lead));
}

.filter-select :deep(.x-select--focused) {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
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

.content-area {
  flex: 1;
  min-height: 0;
  display: flex;
}

.content-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-state--placeholder {
  padding-bottom: 24px;
}

.content-state__tip {
  color: var(--skin__neutral_1);
  font-size: 12px;
}

.record-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 10px 10px;
}

.record-card {
  padding: 10px;
  font-size: 10px;
  border-radius: 7px;
  color: var(--skin__neutral_2);
  min-height: 55px;
  .darken {
    color: var(--skin__lead);
  }
  .green {
    color: var(--skin__accent_1);
  }
  .red {
    color: var(--skin__accent_2);
  }
  .hb {
    color: var(--skin__neutral_1);
  }
}

.record-card:nth-child(2n + 1) {
  background-color: var(--skin__bg_2);
}

.record-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: var(--skin__neutral_2);
  margin-bottom: 5px;
  .link {
    color: var(--skin__primary);
    text-decoration: underline;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.record-card__title {
  min-width: 0;
  flex: 1;
  color: var(--skin__lead);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.record-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 10px;
}

.record-card__metric--right {
  justify-content: flex-end;
}

.record-card__metric-label {
  color: var(--skin__neutral_2);
}

.record-card__metric-value {
  color: var(--skin__lead);
  font-size: 11px;
  font-weight: 600;
}

.record-card__metric-value--win {
  color: var(--skin__accent_2);
}

.record-card__metric-value--lose {
  color: var(--skin__accent_1);
}

.record-card__metric-value--draw {
  color: var(--skin__primary);
}

.empty-state__text {
  color: var(--skin__neutral_2, var(--skin__lead));
  font-size: 13px;
  line-height: 1.5;
}

.empty-state__link {
  color: var(--skin__primary);
  cursor: pointer;
}
</style>
