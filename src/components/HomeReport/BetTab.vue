<script setup lang="ts">
import { $t } from "@/locales";
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import UiEmpty from "@/components/UI/empty.vue";
import Copy from "@/components/Common/Copy.vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange, SelectOption } from "@/components/HomeReport/types";
import { service } from "@/api/service";
import UiLoading from "@/components/UI/loading.vue";
import { formatMoney } from "@/utils/common";

type BetFilterOption = SelectOption & {
  value: number | string;
};

type BetStatus = 1 | 2 | 3 | 4;

interface GameRecordItem {
  id?: number | string;
  type?: number;
  betId?: string;
  isThird?: number;
  apiCode?: string;
  isKill?: number;
  playType?: string;
  betNumber?: string;
  odds?: string;
  short_image?: string;
  betAmount?: number;
  validBetAmount?: number;
  netAmount?: number;
  status?: number;
  betTime?: string | Date;
}

interface BetPageData {
  page: number;
  limit: number;
  total: number;
  list: GameRecordItem[];
}

const statusOptions = computed<BetFilterOption[]>(() => [
  { label: $t("全部状态"), value: "all" },
  { label: $t("已结算"), value: 1 },
  { label: $t("未结算"), value: 2 },
  { label: $t("无效注单"), value: 3 },
  { label: $t("已退款"), value: 4 }
]);

const typeOptions = computed<(BetFilterOption & { image?: string })[]>(() => [
  { label: $t("全部类型"), value: "all" },
  { label: $t("真人"), value: 1, image: "game-icon_dtfl_zr_0" },
  { label: $t("捕鱼"), value: 2, image: "game-icon_dtfl_by_0" },
  { label: $t("电子"), value: 3, image: "game-icon_dtfl_dz_0" },
  { label: $t("彩票"), value: 4, image: "game-icon_dtfl_cp_0" },
  { label: $t("体育"), value: 5, image: "game-icon_dtfl_ty_0" },
  { label: $t("棋牌"), value: 6, image: "game-icon_dtfl_qp_0" },
  { label: $t("电竞"), value: 7, image: "game-icon_dtfl_dianjing_0" }
]);

const platformOptions: BetFilterOption[] = [{ label: "全部平台", value: "all" }];
const statusFilterValue = ref<number | string>("all");
const typeFilterValue = ref<number | string>("all");
const platformFilterValue = ref(platformOptions[0]?.value ?? "all");
const timeRange = ref<AccountTimeRange>(createTodayRange());
const pageData = ref<BetPageData>(createDefaultPageData());
const isListLoading = ref(false);
const isLoadingMore = ref(false);
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

function createDefaultPageData(): BetPageData {
  return {
    page: 1,
    limit: 20,
    total: 0,
    list: []
  };
}

function handleSeeMore() {
  timeRange.value = {
    mode: "yesterday",
    label: "昨日",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix(),
    startDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    endDate: dayjs().subtract(1, "day").format("YYYY-MM-DD")
  };
}

function formatRecordTime(value: string | Date | undefined) {
  return dayjs(value).format("YYYY/MM/DD HH:mm:ss");
}

function getStatusLabel(status: BetStatus) {
  if (status === 2) return $t("未结算");
  if (status === 3) return $t("无效注单");
  if (status === 4) return $t("已退款");
  return $t("已结算");
}

function getWinLossClass(value: number) {
  if (value >= 0) return "record-card__amount--win";
  if (value < 0) return "record-card__amount--lose";
  return "record-card__amount--win";
}

function createQueryParamsByPage(page: number) {
  return {
    page,
    limit: 20,
    startTime: timeRange.value.startTime,
    endTime: timeRange.value.endTime,
    status: statusFilterValue.value === "all" ? "" : statusFilterValue.value,
    type: typeFilterValue.value === "all" ? "" : typeFilterValue.value
  };
}

async function init() {
  await fetchPage(1, false);
}

function normalizePageData(response: any): BetPageData {
  return {
    page: Math.max(Number(response?.page) || 1, 1),
    limit: Math.max(Number(response?.limit) || 20, 1),
    total: Math.max(Number(response?.total) || 0, 0),
    list: Array.isArray(response?.list) ? response.list : []
  };
}

async function fetchPage(page: number, append: boolean) {
  const requestId = ++latestRequestId;

  if (append) {
    isLoadingMore.value = true;
  } else {
    isListLoading.value = true;
  }

  try {
    const response = await service.v1.user.gamePageList(createQueryParamsByPage(page));
    if (requestId === latestRequestId) {
      const nextPageData = normalizePageData(response);
      pageData.value = {
        page: nextPageData.page,
        limit: nextPageData.limit,
        total: nextPageData.total,
        list: append ? pageData.value.list.concat(nextPageData.list) : nextPageData.list
      };
    }
  } finally {
    if (requestId === latestRequestId) {
      if (append) {
        isLoadingMore.value = false;
      } else {
        isListLoading.value = false;
      }
    }
  }
}

const hasListData = computed(() => pageData.value.list.length > 0);
const hasMoreData = computed(() => {
  return pageData.value.total > pageData.value.list.length;
});
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无记录";
  }

  return `${timeRange.value.label}暂无记录`;
});

function handleListScroll(event: Event) {
  if (isListLoading.value || isLoadingMore.value || !hasMoreData.value) {
    return;
  }

  const target = event.target as HTMLElement | null;
  if (!target) {
    return;
  }

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
  if (distanceToBottom > 48) {
    return;
  }

  void fetchPage(pageData.value.page + 1, true);
}

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, statusFilterValue, typeFilterValue], () => {
  void init();
});

onMounted(() => {
  void init();
});
</script>

<template>
  <div class="bet-tab">
    <section class="filter-row">
      <div class="filter-row__scroll">
        <AccountTimeFilter v-model="timeRange" />

        <div class="filter-select filter-select--sm">
          <x-select
            v-model="statusFilterValue"
            :options="statusOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>

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
      <div v-if="isListLoading && !hasListData" class="content-state">
        <ui-loading />
      </div>

      <ui-empty v-else-if="!hasListData">
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

      <div v-else class="record-list" @scroll.passive="handleListScroll">
        <article v-for="item in pageData.list" :key="item.id" class="record-card">
          <div class="record-card__row">
            <span class="ellipsis-box">
              <img :src="item.short_image" alt="" srcset="" />
              <span class="darken">{{ item.playType }}</span>
            </span>
            <span class="groupFlex">
              <span class="label">下注金额</span>
              <span class="darken fw-[700]">&nbsp;{{ formatMoney(item.betAmount) }}</span>
            </span>
            <span class="groupFlex justify-end">
              <span class="label">输赢</span>
              <span class="darken fw-[700]" :class="getWinLossClass(item.netAmount)">
                &nbsp;{{ formatMoney(item.netAmount) }}
              </span>
            </span>
          </div>

          <div class="record-card__row">
            <span>
              <span>{{ formatRecordTime(item.betTime) }}</span>
            </span>
            <span class="groupFlex">
              <span class="label">有效投注</span>
              <span class="fw-[700]">&nbsp;{{ formatMoney(item.validBetAmount) }}</span>
            </span>
          </div>

          <div class="record-card__row space-box">
            <span class="recordId">
              <span class="leading-[13px] flex items-center">
                <svg-icon
                  :name="typeOptions?.find(v => v.value == item.type)?.image"
                  class="text-[17px]"
                />&nbsp;注单号&nbsp;
              </span>
              <span class="id">
                <span dir="ltr">{{ item.betId }}</span>
              </span>
              <span class="copy-box ml-[8px] flex items-center">
                <copy :text="item.betId" class-name="!text-[11px]" />
              </span>
            </span>
            <span class="status-box" :class="`record-card__status--${item.status}`">
              {{ getStatusLabel(item.status as any) }}
            </span>
          </div>
        </article>

        <div v-if="isLoadingMore" class="list-footer">{{ $t("加载中...") }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.bet-tab {
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

.record-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 10px 10px;
}

.list-footer {
  padding: 12px 0 4px;
  text-align: center;
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 1;
}

.list-footer--end {
  color: var(--skin__neutral_1);
}

.record-card {
  display: flex;
  flex-direction: column;
  min-height: 55px;
  padding: 10px 10px 5px;
  font-size: 10px;
  color: var(--skin__neutral_2);
  &:nth-child(2n + 1) {
    background-color: var(--skin__bg_2);
    border-radius: 7px;
  }
}

.record-card__row {
  display: flex;
  align-items: center;
  font-size: 10px;
  color: var(--skin__neutral_2);
  margin-bottom: 5px;
  > span {
    width: 33%;
  }
  .ellipsis-box {
    max-width: 225px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    img {
      font-size: 17px;
      height: 13px;
      margin-right: 1px;
      vertical-align: middle;
    }
  }
  .groupFlex {
    display: flex;
    font-size: 10px;
    .label {
      max-width: 95px;
      overflow-wrap: break-word;
      white-space: nowrap;
      text-align: left;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .darken {
    color: var(--skin__lead);
  }
}
.space-box {
  justify-content: space-between;
  .recordId {
    display: flex;
    align-items: center;
    max-width: 220px;
    width: auto;
    .id {
      flex: 1 1 0%;
      direction: rtl;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: var(--skin__neutral_1);
    }
  }

  .status-box {
    width: 34%;
    text-align: right;
  }
}

.record-card__title {
  flex: 1;
  min-width: 0;
  color: var(--skin__lead);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  padding-left: 12px;
}

.record-card__title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--skin__neutral_2);
  border-radius: 2px;
  box-sizing: border-box;
}

.record-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: 10px;
}

.record-card__metric-label {
  color: var(--skin__neutral_2);
}

.record-card__metric-value,
.record-card__sub-value {
  color: var(--skin__lead);
  font-size: 11px;
  font-weight: 600;
}

.record-card__result {
  min-width: 78px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  text-align: right;
}

.record-card__amount {
  font-size: 11px;
  font-weight: 700;
}

.record-card__amount--win {
  color: var(--skin__accent_2) !important;
}

.record-card__amount--lose {
  color: var(--skin__accent_1) !important;
}

.record-card__amount--draw {
  color: var(--skin__primary) !important;
}

.record-card__time {
  flex: 1;
  min-width: 0;
  font-size: 10px;
  line-height: 1.4;
}

.record-card__order {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.record-card__order-label {
  flex-shrink: 0;
  color: var(--skin__neutral_1);
  font-size: 10px;
}

.record-card__order-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: var(--skin__neutral_2, var(--skin__lead));
}

.record-card__order :deep(.copy-icon) {
  flex-shrink: 0;
}

.record-card__order :deep(.record-card__copy-icon) {
  font-size: 12px;
}

.record-card__status {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
}

.record-card__status--1 {
  color: var(--skin__accent_1);
}

.record-card__status--2 {
  color: var(--skin__primary);
}

.record-card__status--3,
.record-card__status--4 {
  color: var(--skin__neutral_1);
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
