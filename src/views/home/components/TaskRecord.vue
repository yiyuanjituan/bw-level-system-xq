<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import { service } from "@/api/service";

dayjs.extend(isoWeek);

interface TaskRecordItem {
  id?: number | string;
  name?: string;
  desc?: string;
  createTime?: string | number;
  vitality?: string | number;
  [key: string]: unknown;
}

interface TaskRecordState {
  list: TaskRecordItem[];
  totalAmount: number;
}

type TimeFilterValue = "all" | "today" | "yesterday" | "this-week" | "last-week" | "this-month" | "last-month";

type TimeOption = {
  label: string;
  value: TimeFilterValue;
  startTime: number;
  endTime: number;
};

const DEFAULT_TIME_FILTER: TimeFilterValue = "today";
const DEFAULT_TAB_KEY = 1;
const PAGE_LIMIT = 20;

const typeList = [
  { key: 1, name: "已获得" },
  { key: 2, name: "已使用" },
  { key: 3, name: "已过期" }
];

const timeOptions: TimeOption[] = [
  {
    label: "全部",
    value: "all",
    startTime: 0,
    endTime: 0
  },
  {
    label: "今日",
    value: "today",
    startTime: dayjs().startOf("day").unix(),
    endTime: dayjs().endOf("day").unix()
  },
  {
    label: "昨日",
    value: "yesterday",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix()
  },
  {
    label: "本周",
    value: "this-week",
    startTime: dayjs().startOf("isoWeek").unix(),
    endTime: dayjs().endOf("isoWeek").unix()
  },
  {
    label: "上周",
    value: "last-week",
    startTime: dayjs().subtract(1, "week").startOf("isoWeek").unix(),
    endTime: dayjs().subtract(1, "week").endOf("isoWeek").unix()
  },
  {
    label: "本月",
    value: "this-month",
    startTime: dayjs().startOf("month").unix(),
    endTime: dayjs().endOf("month").unix()
  },
  {
    label: "上月",
    value: "last-month",
    startTime: dayjs().subtract(1, "month").startOf("month").unix(),
    endTime: dayjs().subtract(1, "month").endOf("month").unix()
  }
];

const show = ref(false);
const isLoading = ref(false);
const activeTab = ref<number>(DEFAULT_TAB_KEY);
const timeFilterValue = ref<TimeFilterValue>(DEFAULT_TIME_FILTER);
const page = ref(1);
const hasMore = ref(true);
const recordState = ref<TaskRecordState>({
  list: [],
  totalAmount: 0
});
const { width: windowWidth } = useWindowSize();

const dialogWidth = computed(() => (348 / 375) * windowWidth.value);
const hasListData = computed(() => recordState.value.list.length > 0);
const selectedTimeOption = computed(() => timeOptions.find(item => item.value === timeFilterValue.value) as TimeOption);
const shouldShowSeeMore = computed(() => timeFilterValue.value === "today" && !isLoading.value && !hasListData.value);
const emptyStateText = computed(() => (timeFilterValue.value === "all" ? "暂无记录" : `${selectedTimeOption.value.label}暂无记录`));

function openDialog() {
  activeTab.value = DEFAULT_TAB_KEY;
  timeFilterValue.value = DEFAULT_TIME_FILTER;
  resetListState();
  show.value = true;
  void loadData();
}

function handleClose() {
  show.value = false;
}

function handleSeeMore() {
  if (timeFilterValue.value === "today") {
    timeFilterValue.value = "all";
  }
}

function resetListState() {
  page.value = 1;
  hasMore.value = true;
  recordState.value = {
    list: [],
    totalAmount: 0
  };
}

async function loadData() {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  try {
    const params: {
      page: number;
      limit: number;
      type: number;
      startTime?: number;
      endTime?: number;
    } = {
      page: page.value,
      limit: PAGE_LIMIT,
      type: activeTab.value
    };

    if (timeFilterValue.value !== "all") {
      params.startTime = selectedTimeOption.value.startTime;
      params.endTime = selectedTimeOption.value.endTime;
    }

    const response = (await service.activity.data.vitalityRecordList(params)) as {
      list: TaskRecordItem[];
      totalAmount: number;
    };

    const list = response.list || [];
    recordState.value = {
      list: page.value === 1 ? list : recordState.value.list.concat(list),
      totalAmount: response.totalAmount || 0
    };

    if (list.length > 0) {
      page.value += 1;
    }

    hasMore.value = list.length >= PAGE_LIMIT;
  } finally {
    isLoading.value = false;
  }
}

function handleRecordListScroll(event: Event) {
  const target = event.target as HTMLElement | null;
  if (!target || isLoading.value || !hasMore.value) return;

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
  if (distanceToBottom <= 24) {
    void loadData();
  }
}

watch([activeTab, timeFilterValue], () => {
  if (!show.value) return;
  resetListState();
  void loadData();
});

defineExpose({
  open: openDialog
});
</script>

<template>
  <div class="dialog-box">
    <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" destroy-on-close>
      <div class="task-record-container">
        <div class="header-box">
          <span class="header-title">活跃度记录</span>
        </div>
        <div class="content-box">
          <x-tabs v-model="activeTab" shrink animated auto-height>
            <x-tab v-for="item in typeList" :key="item.key" :name="item.key" :title="item.name">
              <div class="tab-con">
                <div class="select-wrapper">
                  <div class="time-picker">
                    <x-select v-model="timeFilterValue" :options="timeOptions" value-key="value" placement="bottom" fit-option-width />
                  </div>
                  <div class="total-amount-wrapper">
                    <span class="total-amount-text">累计活跃度</span>
                    <span class="total-amount">
                      <svg-icon name="comm_icon_shy" class-name="mr-[2px]" />
                      {{ recordState.totalAmount }}
                    </span>
                  </div>
                </div>
                <div class="list-wrapper">
                  <div v-if="isLoading && !hasListData" class="state-wrapper">
                    <ui-loading />
                  </div>

                  <div v-else-if="hasListData" class="record-list" @scroll="handleRecordListScroll">
                    <div v-for="(record, index) in recordState.list" :key="record.id ?? `${activeTab}-${index}`" class="record-item">
                      <div class="item-top">
                        <span>{{ record.remark }}</span>
                        <span class="active">
                          活跃度
                          <svg-icon name="comm_icon_shy" class-name="mr-[2px]" style="color: var(--skin__accent_1)" />
                          <span class="text">{{ record.changeAmount }}</span>
                        </span>
                      </div>
                      <div class="item-bottom">
                        <span class="time" v-if="activeTab == 1">获得时间</span>
                        <span class="time" v-if="activeTab == 2">使用时间</span>
                        <span class="time" v-if="activeTab == 3">过期时间</span>
                        <span>{{ record.createTime }}</span>
                      </div>
                    </div>

                    <div v-if="hasMore" class="load-more-box">
                      <span class="load-more-text">{{ isLoading ? "加载中..." : "上滑查看更多" }}</span>
                    </div>
                  </div>

                  <ui-empty v-else :text="$t('暂无记录')">
                    <template #text>
                      <div class="empty-state__text">
                        <span>{{ emptyStateText }}</span>
                        <template v-if="shouldShowSeeMore">
                          <span>{{ $t("，可") }}</span>
                          <span class="empty-state__link" @click="handleSeeMore">{{ $t("查看更多") }}</span>
                        </template>
                      </div>
                    </template>
                  </ui-empty>
                </div>
              </div>
            </x-tab>
          </x-tabs>
        </div>
      </div>

      <template #footer>
        <div class="footer-box">
          <div class="close-icon" @click="handleClose">
            <svg-icon name="close" color="white" />
          </div>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.dialog-box {
  --van-padding-md: 0px;
}

.task-record-container {
  border: var(--lobby__px) solid var(--skin__border);
  width: 100%;
  background: var(--skin__bg_2);
  border-radius: 10px;
  backface-visibility: hidden;
  overflow: auto;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .header-box {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    color: var(--skin__lead);
    padding: 10px 15px 15px;
    box-sizing: border-box;
    line-height: 1.5;
  }

  .content-box {
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    min-height: 46px;
    color: var(--skin__lead);

    :deep(.x-tabs__wrap) {
      height: 40px;
      margin-left: 7px;
      margin-right: 7px;
    }

    .tab-con {
      padding: 10px 0;

      .select-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 10px;
        padding: 0 15px;
        gap: 10px;

        .time-picker {
          flex-shrink: 0;

          :deep(.x-select) {
            border-radius: 9999px;
            width: 80px;
            height: 25px;
            font-size: 10px;
          }

          :deep(.x-select__label),
          :deep(.x-select__placeholder) {
            color: var(--skin__neutral_2);
          }
        }

        .total-amount-wrapper {
          display: flex;
          color: var(--skin__lead);
          font-size: 12px;
          line-height: normal;
          text-align: right;
          min-width: 0;

          .total-amount-text {
            margin-right: 2.5px;
            white-space: nowrap;
          }

          .total-amount {
            display: flex;
            justify-content: center;
            margin-top: 2.5px;
            font-size: 12px;
            color: var(--skin__accent_1);
            align-items: center;
            white-space: nowrap;
          }
        }
      }

      .list-wrapper {
        height: 387px;
        padding-left: 15px;
        padding-right: 15px;
      }

      .state-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .record-list {
        height: 100%;
        overflow-y: auto;
        padding-right: 2px;
      }

      .load-more-box {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 0 4px;
      }

      .load-more-text {
        color: var(--skin__primary);
        font-size: 12px;
        line-height: 1;
      }

      .record-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-bottom: var(--lobby__px) solid var(--skin__border);
        margin-bottom: 10px;
        .item-top {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 12px;
          .active {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .text {
              color: var(--skin__accent_1);
            }
          }
        }
        .item-bottom {
          width: 100%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 10px;
          color: var(--skin__neutral_2);
          .time {
            margin-right: 5px;
          }
        }
      }
    }
  }
}

.empty-state {
  &__text {
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  &__link {
    color: var(--skin__primary);
  }
}

.footer-box {
  position: relative;
  width: 100%;
  height: 45px;
  font-size: 8px;
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .close-icon {
    color: white;
    font-size: 30px;
  }
}
</style>
