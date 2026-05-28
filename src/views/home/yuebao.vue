<script setup lang="ts">
import UiBadge from "@/components/UI/badge.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import { showCustomToast } from "@/hooks/useCommon";
import { nextTick, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { formatMoney, getYuEBaoRichText } from "@/utils/common";
import { service } from "@/api/service";

dayjs.extend(isoWeek);

const LOAD_MORE_OFFSET = 48;

function refreshInfo() {
  service.v1.activity.interestInfo().then(res => {
    interestInfo.value = res;
    showCustomToast({ message: "刷新成功", type: "success" });
  });
}

const dayOptions = ref([
  {
    label: "今日",
    value: 0,
    start_time: dayjs().startOf("day").unix(),
    end_time: dayjs().endOf("day").unix()
  },
  {
    label: "昨日",
    value: 1,
    start_time: dayjs().startOf("day").subtract(1, "day").unix(),
    end_time: dayjs().endOf("day").subtract(1, "day").unix()
  },
  {
    label: "本周",
    value: 2,
    start_time: dayjs().startOf("isoWeek").unix(),
    end_time: dayjs().endOf("isoWeek").unix()
  },
  {
    label: "上周",
    value: 3,
    start_time: dayjs().startOf("isoWeek").subtract(7, "day").unix(),
    end_time: dayjs().endOf("isoWeek").subtract(7, "day").unix()
  },
  {
    label: "本月",
    value: 4,
    start_time: dayjs().startOf("month").unix(),
    end_time: dayjs().endOf("month").unix()
  },
  {
    label: "上月",
    value: 5,
    start_time: dayjs().startOf("month").subtract(1, "month").unix(),
    end_time: dayjs().endOf("month").subtract(1, "month").unix()
  }
]);
const interestInfo = ref<any>({});
// 状态提醒
const statusOptions = ref([
  { label: "全部", value: 0 },
  { label: "转入", value: 1 },
  { label: "转出", value: 2 },
  { label: "领取收入", value: 3 },
  { label: "系统转出", value: 4 }
]);
const daySelectIndex = ref(0);
const statusSelectIndex = ref(0);
const interestRecordList = ref<any[]>([]);
const page = ref(1);
const interestRecordTotal = ref(0);
const interestRecordsLoading = ref(false);
const interestRecordsLoadingMore = ref(false);
const interestRecordsFinished = ref(false);
const interestRecordListRef = ref<HTMLElement | null>(null);
let latestInterestRecordsRequestId = 0;

function getCurrentDayInfo() {
  return dayOptions.value.find(item => item.value === daySelectIndex.value) ?? dayOptions.value[0];
}

function createInterestRecordsParams(currentPage: number) {
  const dayInfo = getCurrentDayInfo();

  return {
    page: currentPage,
    limit: 30,
    startTime: dayInfo.start_time,
    endTime: dayInfo.end_time,
    type: statusSelectIndex.value
  };
}

function updateInterestRecordsFinishedState(list: any[], total: number, append: boolean) {
  const currentPageLength = list.length;
  const loadedLength = append ? interestRecordList.value.length + currentPageLength : currentPageLength;

  if (currentPageLength === 0) {
    interestRecordsFinished.value = true;
    return;
  }

  if (total > 0) {
    interestRecordsFinished.value = loadedLength >= total;
    return;
  }

  interestRecordsFinished.value = currentPageLength < 30;
}

async function ensureInterestRecordsScrollable() {
  const container = interestRecordListRef.value;

  if (
    !container ||
    interestRecordsLoading.value ||
    interestRecordsLoadingMore.value ||
    interestRecordsFinished.value ||
    interestRecordList.value.length === 0
  ) {
    return;
  }

  if (container.scrollHeight <= container.clientHeight + 2) {
    await loadMoreInterestRecords();
  }
}

async function getInterestRecords(currentPage = 1, append = false) {
  const requestId = ++latestInterestRecordsRequestId;

  if (append) {
    interestRecordsLoadingMore.value = true;
  } else {
    interestRecordsLoading.value = true;
  }

  try {
    const response = await service.v1.activity.interestRecords(createInterestRecordsParams(currentPage));

    if (requestId !== latestInterestRecordsRequestId) {
      return;
    }

    updateInterestRecordsFinishedState(response.list, response.total, append);

    page.value = response.page;
    interestRecordTotal.value = response.total;
    interestRecordList.value = append ? interestRecordList.value.concat(response.list) : response.list;

    await nextTick();
    await ensureInterestRecordsScrollable();
  } finally {
    if (requestId === latestInterestRecordsRequestId) {
      if (append) {
        interestRecordsLoadingMore.value = false;
      } else {
        interestRecordsLoading.value = false;
      }
    }
  }
}

async function refreshInterestRecords() {
  interestRecordList.value = [];
  page.value = 1;
  interestRecordTotal.value = 0;
  interestRecordsFinished.value = false;

  await getInterestRecords(1);
}

async function loadMoreInterestRecords() {
  if (interestRecordsLoading.value || interestRecordsLoadingMore.value || interestRecordsFinished.value) {
    return;
  }

  await getInterestRecords(page.value + 1, true);
}

function handleInterestRecordScroll(event: Event) {
  if (interestRecordsLoading.value || interestRecordsLoadingMore.value || interestRecordsFinished.value) {
    return;
  }

  const target = event.target as HTMLElement | null;
  if (!target) {
    return;
  }

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
  if (distanceToBottom <= LOAD_MORE_OFFSET) {
    void loadMoreInterestRecords();
  }
}

function handleGetMoney() {
  service.v1.activity.interestClaim().then(() => {
    showCustomToast({ message: "领取成功", type: "success" });
    service.v1.activity.interestInfo().then(res => (interestInfo.value = res));
    refreshInterestRecords();
  });
}

function showTip() {
  showCustomToast({ message: "利息宝暂未开放", type: "fail" });
}

watch([daySelectIndex, statusSelectIndex], () => {
  void refreshInterestRecords();
});

onMounted(() => {
  service.v1.activity.interestInfo().then(res => {
    interestInfo.value = res;
  });
  void refreshInterestRecords();
});
</script>

<template>
  <div class="base-layout">
    <div class="info-box">
      <div class="info-item">
        <div class="principalWrapper">
          <span class="label">已存入</span>
          <ui-badge :content="`年利率${interestInfo?.config?.year_scale}%`" :size="[-6, -10]">
            {{ formatMoney(interestInfo?.deposit?.money) }}
          </ui-badge>
        </div>
        <div class="mobileButtonLine">
          <x-button type="warning" @click="showTip" size="small">转 入</x-button>
          <x-button class="info-btn" size="small">转 出</x-button>
        </div>
      </div>
      <div class="info-item mt-[5px]">
        <div class="curIncomeWrapper">
          <div class="curIncomeItem">
            <div>
              结算周期 <span class="text-white">{{ interestInfo?.display?.cycle_text }}</span>
            </div>
          </div>
          <div class="curIncomeItem !mb-[0px]">
            <div class="mg">
              待领取<span class="strong">{{ formatMoney(Math.max(interestInfo.deposit?.await_get, 0)) }}</span>
              （已领取
              {{ formatMoney(Number(interestInfo.deposit?.total_get) - Number(interestInfo.deposit?.await_get)) }}）
              <svg-icon name="refresh" class-name="text-[#DFBE5B]" @click="refreshInfo" />
            </div>
          </div>
        </div>
        <div class="receive-btn">
          <x-button
            type="primary"
            :disabled="!(Number(interestInfo.deposit?.await_get) > 0.01)"
            size="small"
            @click="handleGetMoney"
          >
            领 取
          </x-button>
        </div>
      </div>
    </div>
    <div class="container-tab-page">
      <van-tabs shrink class="tabs-component">
        <van-tab title="利息规则" class="ml-0 h-[100%]">
          <div class="radius-box">
            <div class="inner-box">
              <div class="absolute top-0">
                <div class="rule" v-html="getYuEBaoRichText(interestInfo) || '后台暂未配置文案'"></div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="记录明细" class="ml-0 h-[100%]">
          <div class="radius-box">
            <div class="header-row-box">
              <div class="flex gap-[10px]">
                <div class="filter-select">
                  <x-select v-model="daySelectIndex" :options="dayOptions" value-key="value" placement="bottom" />
                </div>
                <div class="filter-select">
                  <x-select v-model="statusSelectIndex" :options="statusOptions" value-key="value" placement="bottom" />
                </div>
              </div>
              <div class="flex items-center text-[11px] lh-[13px]">
                <span class="text-[#656565]">累计收益</span>
                <span class="text-[#FFAA09]">{{ interestInfo.deposit?.total_get }}</span>
              </div>
            </div>

            <div class="listWrapper">
              <div class="listItem head">
                <div>时间</div>
                <div>类型</div>
                <div>金额</div>
              </div>
              <div v-if="interestRecordsLoading && !interestRecordList.length" class="listLoading">
                <ui-loading />
              </div>
              <div
                v-else-if="interestRecordList.length"
                ref="interestRecordListRef"
                class="scroll-box"
                @scroll.passive="handleInterestRecordScroll"
              >
                <div class="listItem" v-for="item in interestRecordList" :key="item.id">
                  <div>{{ dayjs(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}</div>
                  <div>{{ statusOptions.find(v => item.type == v.value)?.label }}</div>
                  <div class="amount">{{ formatMoney(item.money) }}</div>
                </div>
                <div v-if="interestRecordsLoadingMore" class="listStatus">
                  <ui-loading />
                </div>
                <div v-else-if="interestRecordsFinished" class="listStatus">没有更多了</div>
              </div>
              <ui-empty v-else text="暂无记录" />
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.base-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: hidden;

  .info-box {
    background-color: #191919;
    border-radius: 0;
    padding: 20px 10px 0;
    width: 100%;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .principalWrapper {
        max-width: 60%;
        font-size: 15px;

        .label {
          color: #656565;
          font-size: 11px;
          line-height: 1.45;
          margin-right: 5px;
        }
      }

      .mobileButtonLine {
        display: flex;
        gap: 10px;
        --van-button-warning-background: #ffaa09;

        :deep(.van-button) {
          width: 60px;
          height: 25px;
          font-size: 10px;
        }

        :deep(.info-btn) {
          background-color: #999;
          border-color: #999;
          color: white;
        }
      }

      .curIncomeWrapper {
        .curIncomeItem {
          display: flex;
          width: 100%;
          margin-bottom: 10.5px;
          color: #656565;
          font-size: 11px;
          line-height: 1.45;
        }

        .mg {
          margin-right: 5px;
          word-break: break-all;
          font-size: 11px;
          display: flex;
          align-items: center;

          .strong {
            color: #ffaa09;
            font-size: 15px;
            font-weight: 600;
          }
        }
      }

      .receive-btn {
        color: white;
        :deep(.van-button) {
          width: 60px;
          height: 25px;
          font-size: 10px;
        }

        :deep(.info-btn) {
          background-color: #999;
          border-color: #999;
          color: white;
        }
      }
    }
  }

  .container-tab-page {
    flex: 1;
    min-height: 0;
    width: 100%;
    height: 100%;
    --van-tabs-line-height: 35px;
    --van-tabs-nav-background: #191919;
    --van-tab-font-size: 11px;
    --van-tab-active-text-color: #dfbe5b;
    --van-tab-text-color: white;
    --van-padding-xs: 0;
    --van-tabs-bottom-bar-height: 2px;
    --van-tabs-bottom-bar-width: 44px;

    :deep(.van-tabs) {
      .van-tabs__nav {
        padding-left: 10px;
        gap: 15px;
      }
    }

    .tabs-component {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;

      :deep(.van-tabs__content) {
        flex: 1;
        height: 100%;
        min-height: 0;
      }

      :deep(.van-tab__panel) {
        height: 100%;
      }

      .radius-box {
        height: calc(100% - 0px);
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 10px;
        background-color: #000000;

        .inner-box {
          height: 100%;
          flex-shrink: 0;
          box-sizing: border-box;
          width: 100%;
          position: relative;

          overflow: auto;
          min-height: 100px;
          border-radius: 5px;
          background-color: #191919;
          font-size: 13px;
          line-height: 21px;
          color: #656565;
          box-shadow: 0 1.5px 3.5px #0000001f;

          .rule {
            padding: 10px;

            *:not(:last-child) {
              margin-bottom: 21px;
            }
          }
        }
      }
    }

    .header-row-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .filter-select {
        width: 80px;
      }

      .filter-select :deep(.x-select) {
        height: 25px;
        padding: 0 10px;
        border: 1px solid #242424;
        border-radius: 9999rem;
        background: #191919;
        color: #656565;
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
    }

    .listWrapper {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;

      .listLoading {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .scroll-box {
        flex: 1;
        min-height: 0;
        width: calc(100% + 10px);
        padding-right: 10px;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }

      .listStatus {
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #656565;
        font-size: 11px;
      }

      .listItem {
        display: flex;
        height: 35px;
        border-radius: 4px;
        font-size: 10px;
        color: #656565;
        &:nth-child(2n) {
          background: var(--skin__bg_2);
        }

        div {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          word-break: break-all;
          text-align: center;
        }
      }

      .amount {
        color: #ffaa09;
      }

      .head {
        height: 40px;
        flex-shrink: 0;
        font-size: 12px;
        color: #fff;
        border: 1px solid #242424;
        background-color: #191919;
      }
    }
  }
}
</style>
