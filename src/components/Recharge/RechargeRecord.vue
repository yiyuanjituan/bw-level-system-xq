<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { useWindowSize } from "@vant/use";
import type { DateRangeValue } from "@/components/Common/DateRangePicker.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import { service } from "@/api/service";
import { bus } from "@/utils/mitt";

interface RechargeRecordContent {
  name: string;
  icon: string;
}

interface RechargeRecordItem {
  id: number | string;
  createTime: string;
  order_sn: string;
  money: number | string;
  pay_status: number;
  content: RechargeRecordContent;
}

interface RechargeRecordPageData {
  page: number;
  limit: number;
  total: number;
  list: RechargeRecordItem[];
}

interface RechargeRecordQuery {
  page: number;
  limit: number;
  startTime: number;
  endTime: number;
  pay_status?: number;
}

type RechargeStatusOption = {
  label: string;
  value: number | string;
};

type RechargeRecordsService = {
  records(data: RechargeRecordQuery): Promise<RechargeRecordPageData>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const LOAD_MORE_OFFSET = 48;

const rechargeRecordsService = service.base.recharge as RechargeRecordsService;

const statusOptions: RechargeStatusOption[] = [
  { label: "全部状态", value: "" },
  { label: "已取消", value: -1 },
  { label: "待支付", value: 1 },
  { label: "待确认", value: 2 },
  { label: "已存入", value: 3 },
  { label: "未通过", value: 4 }
];

const show = ref(false);
const params = ref<Record<string, any>>({});
const isLoading = ref(false);
const isLoadingMore = ref(false);
const pageData = ref<RechargeRecordPageData>(createDefaultPageData());
const timeRange = ref<DateRangeValue>(createTodayRange());
const statusFilterValue = ref<number | string>(statusOptions[0]?.value ?? "");
const { width: windowWidth } = useWindowSize();

let latestRequestId = 0;

function createTodayRange(): DateRangeValue {
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

function createDefaultPageData(): RechargeRecordPageData {
  return {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
    list: []
  };
}

function createQueryParams(page: number): RechargeRecordQuery {
  return {
    page,
    limit: DEFAULT_LIMIT,
    startTime: timeRange.value.startTime,
    endTime: timeRange.value.endTime,
    ...(statusFilterValue.value === "" ? {} : { pay_status: Number(statusFilterValue.value) })
  };
}

function formatAmount(value: number | string) {
  return Number(value).toFixed(2);
}

const dialogWidth = computed(() => {
  return ((Number(params.value?.width) ? Number(params.value?.width) : 355) / 375) * windowWidth.value;
});

const hasListData = computed(() => pageData.value.list.length > 0);
const hasMoreData = computed(() => pageData.value.total > pageData.value.list.length);
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无充值记录";
  }

  return `${timeRange.value.label}暂无充值记录`;
});

async function fetchPage(page: number, append: boolean) {
  const requestId = ++latestRequestId;

  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const response = await rechargeRecordsService.records(createQueryParams(page));

    if (requestId === latestRequestId) {
      pageData.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        list: append ? pageData.value.list.concat(response.list) : response.list
      };
    }
  } finally {
    if (requestId === latestRequestId) {
      if (append) {
        isLoadingMore.value = false;
      } else {
        isLoading.value = false;
      }
    }
  }
}

async function init() {
  pageData.value = createDefaultPageData();
  await fetchPage(DEFAULT_PAGE, false);
}

function openDialog(nextParams: Record<string, any> = {}) {
  params.value = nextParams;
  show.value = true;
  void init();
}

function handleClose() {
  show.value = false;
}

function handleOpenDetail(item: RechargeRecordItem) {
  bus.emit("showRechargeDetail", { id: item.id });
}

function handleListScroll(event: Event) {
  if (isLoading.value || isLoadingMore.value || !hasMoreData.value) {
    return;
  }

  const target = event.target as HTMLElement;
  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

  if (distanceToBottom <= LOAD_MORE_OFFSET) {
    void fetchPage(pageData.value.page + 1, true);
  }
}

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, statusFilterValue], () => {
  if (show.value) {
    void init();
  }
});

defineExpose({
  open: openDialog
});
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" class-name="recharge-record-popup">
    <template #default>
      <div class="dialog-container">
        <div class="header-box"><span>充值记录</span></div>
        <div class="content-box">
          <div class="content-header">
            <div class="time-picker">
              <date-range-picker v-model="timeRange" :panel-width="335" />
            </div>
            <div class="status-picker">
              <x-select v-model="statusFilterValue" :options="statusOptions" value-key="value" />
            </div>
          </div>
          <div v-if="isLoading && !hasListData" class="content-state">
            <ui-loading />
          </div>
          <div v-else-if="hasListData" class="list-wrapper" @scroll.passive="handleListScroll">
            <div v-for="item in pageData.list" :key="item.id" class="item-box" @click="handleOpenDetail(item)">
              <div class="content">
                <div class="row">
                  <div class="left">
                    <img class="icon" :src="item.content.icon" alt="" />
                    <span dir="ltr" class="payment-name">{{ item.content.name }}</span>
                  </div>
                  <div class="right">{{ formatAmount(item.money) }}</div>
                </div>
                <div class="row">
                  <div class="left">
                    <span class="createtime">{{ item.createTime }}</span>
                    <span class="order-no">{{ item.order_sn }}</span>
                    <copy :text="item.order_sn" class-name="!text-[12px]" />
                  </div>
                </div>
              </div>
              <div class="arrow">
                <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[8px]" style="color: var(--skin__neutral_2) !important;" />
              </div>
            </div>

            <div v-if="isLoadingMore" class="list-footer">{{ $t("加载中...") }}</div>
          </div>
          <ui-empty v-else :text="emptyStateText" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" @click="handleClose">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
div[role="dialog"] {
  .dialog-container {
    border: var(--lobby__px) solid var(--skin__border);
    width: 100%;
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    .header-box {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 15px;
      font-weight: 400;
      font-stretch: normal;
      font-style: normal;
      letter-spacing: normal;
      color: var(--skin__lead);
      padding: 10px 15px 15px;
      box-sizing: border-box;
      line-height: 1.5;
    }
    .content-box {
      padding: 0 0 10px;
      flex: 1;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .content-header {
        padding: 0 10px 10px;
        line-height: 25px;
        display: flex;
        align-items: center;
        .time-picker {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          :deep(.van-popover__wrapper) {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .status-picker {
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          :deep(.x-select) {
            width: 85px;
            height: 25px;
            border-radius: 999rem;
          }
        }
      }
      .content-state {
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .list-wrapper {
        max-height: 70vh;
        flex: 1;
        padding: 0 10px 10px;
        list-style: none;
        min-height: 50vh;
        .item-box {
          padding: 5px 10px;
          border-radius: 5px;
          display: flex;
          width: 100%;
          &:nth-child(odd) {
            background-color: var(--skin__bg_1);
          }
          .content {
            width: 100%;
            flex: 1;
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2.5px 0;
              .left {
                flex: 1;
                display: flex;
                align-items: center;
                .icon {
                  height: 24px;
                  width: 24px;
                  margin-right: 10px;
                }
                .payment-name {
                  font-size: 12px;
                  line-height: 1.3;
                  word-break: break-all;
                  display: -webkit-box;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  vertical-align: middle;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
                > span {
                  line-height: 1;
                }
                .createtime {
                  color: var(--skin__neutral_2);
                  font-size: 9px;
                }
                .order-no {
                  margin: 0 5px;
                  color: var(--skin__neutral_2);
                  font-size: 9px;
                }
              }
              .right {
                font-size: 13px;
                font-weight: 700;
                max-width: 30px;
                text-align: right;
                display: flex;
                align-items: center;
                justify-content: end;
              }
            }
          }
          .arrow {
            display: flex;
            align-items: center;
            padding-left: 10px;
            color: var(--skin__neutral_2);
          }
        }
      }
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

  .content-state {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list-wrapper {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .list-footer {
    padding-top: 10px;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: var(--skin__neutral_2);
  }
}
</style>

<style lang="less">
.recharge-record-popup {
  --van-padding-md: 0;
}
</style>
