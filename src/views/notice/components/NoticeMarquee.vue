<script setup lang="ts">
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { computed, onMounted, reactive, ref, watch } from "vue";
import RangePicker from "./RangePicker.vue";
import UiRadiusSelect from "@/components/UI/radius-select.vue";
import { service } from "@/api/service";
import router from "@/router";

dayjs.extend(isoWeek);

type NoticeItem = {
  title?: string;
  createTime?: string | number;
  [key: string]: any;
};

type TimeRangeOption = {
  text: string;
  value: string;
  startTime: number;
  endTime: number;
};

const totalList = ref<NoticeItem[]>([]);
const currentPage = ref(1);
const PAGE_SIZE = 10;
const dayOptions = ref([
  { label: "全部", key: 0 },
  { label: "已读", key: 1 },
  { label: "未读", key: 2 }
]);

const formInfo = reactive({
  timeRange: "all",
  status: 0,
  keyword: ""
});

const timeRangeOptions = computed<TimeRangeOption[]>(() => [
  {
    text: "今日",
    value: "today",
    startTime: dayjs().startOf("day").unix(),
    endTime: dayjs().endOf("day").unix()
  },
  {
    text: "昨日",
    value: "yesterday",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix()
  },
  {
    text: "本周",
    value: "this-week",
    startTime: dayjs().startOf("isoWeek").unix(),
    endTime: dayjs().endOf("isoWeek").unix()
  },
  {
    text: "上周",
    value: "last-week",
    startTime: dayjs().subtract(1, "week").startOf("isoWeek").unix(),
    endTime: dayjs().subtract(1, "week").endOf("isoWeek").unix()
  },
  {
    text: "本月",
    value: "this-month",
    startTime: dayjs().startOf("month").unix(),
    endTime: dayjs().endOf("month").unix()
  },
  {
    text: "上月",
    value: "last-month",
    startTime: dayjs().subtract(1, "month").startOf("month").unix(),
    endTime: dayjs().subtract(1, "month").endOf("month").unix()
  },
  {
    text: "全部",
    value: "all",
    startTime: 0,
    endTime: 0
  }
]);
function getTimeRange(value: string) {
  const selectedOption = timeRangeOptions.value.find(
    option => option.value === value
  );
  return selectedOption ?? { startTime: 0, endTime: 0 };
}

function getTimestamp(value: unknown) {
  if (typeof value === "number") {
    return value > 1_000_000_000_000
      ? Math.floor(value / 1000)
      : Math.floor(value);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) return 0;

    if (/^\d+$/.test(trimmedValue)) {
      const numberValue = Number(trimmedValue);

      return numberValue > 1_000_000_000_000
        ? Math.floor(numberValue / 1000)
        : Math.floor(numberValue);
    }

    const parsedTime = dayjs(trimmedValue);

    return parsedTime.isValid() ? parsedTime.unix() : 0;
  }

  return 0;
}

function toPlainText(value: unknown) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function formatInlineContent(value: unknown) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|li|h[1-6])[^>]*>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const filteredList = computed(() => {
  const keyword = formInfo.keyword.trim().toLowerCase();
  const { startTime, endTime } = getTimeRange(formInfo.timeRange);

  return totalList.value.filter(item => {
    if (startTime && endTime) {
      const currentTime = getTimestamp(item.createTime);

      if (!currentTime || currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }

    if (keyword) {
      const titleText = toPlainText(item.title).toLowerCase();
      if (!titleText.includes(keyword)) {
        return false;
      }
    }
    return true;
  });
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredList.value.slice(start, start + PAGE_SIZE);
});

watch(
  () => [formInfo.timeRange, formInfo.status, formInfo.keyword],
  () => {
    currentPage.value = 1;
  }
);

watch(filteredList, list => {
  const maxPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});

function init() {
  service.v1.notice.marqueeList({ limit: 9999 }).then(res => {
    totalList.value = Array.isArray(res?.list) ? res.list : [];
  });
}

function onTapItem(record: any) {
  console.log(record);
  router.push(`/home/notice/detail?id=${record.id}&noticeType=${3}`);
}

onMounted(() => init());
</script>

<template>
  <div class="service-box">
    <div class="filter-container">
      <RangePicker v-model="formInfo.timeRange" :options="timeRangeOptions" />
      <div class="bind-search-box">
        <div class="flex-1 min-w-0">
          <input
            v-model="formInfo.keyword"
            class="search-input"
            :placeholder="$t('搜索')"
          />
        </div>
        <div class="pl-[10px] flex items-center">
          <svg-icon name="comm_icon_ss" class-name="main-text text-[14px]" />
        </div>
      </div>
    </div>
    <div class="list-box" v-if="filteredList.length">
      <div
        class="item-box"
        v-for="(item, index) in paginatedList"
        :key="index"
        @click="onTapItem(item)"
      >
        <div class="announcement">
          <div class="content-box">
            <div class="icon">
              <img src="@/assets/common/icon_dt_1gg.avif" alt="" srcset="" />
            </div>
            <div class="title">
              <div class="notice-content" v-html="formatInlineContent(item.content)"></div>
              <p class="createTime">{{ item.createTime }}</p>
            </div>
            <div class="list-right">
              <svg-icon
                name="comm_icon_fh"
                class-name="rotate-[180deg] text-[12px] text-right-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <empty :text="$t('暂无消息')" v-if="!filteredList.length" />
    <div class="pagination-box" v-if="filteredList.length > PAGE_SIZE">
      <van-pagination
        v-model="currentPage"
        :total-items="filteredList.length"
        :items-per-page="PAGE_SIZE"
      >
        <template #prev-text>
          <svg-icon name="arrow-back" class-name="text-[9px] ml-[3px] main-text" />
        </template>
        <template #next-text>
          <svg-icon name="arrow-back" class-name="text-[9px] ml-[3px] main-text rotate-[180deg]" />
        </template>
        <template #page="{ number, text, active }">{{ number }}</template>
      </van-pagination>
    </div>
  </div>
</template>

<style scoped lang="less">
.service-box {
  height: 100%;
  position: relative;
  overflow: auto;
  background: #000;
  display: flex;
  flex-direction: column;
  width: 100%;

  .filter-container {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 10px;

    .select-box {
      height: 25px;
      width: 80px;
      max-width: 100%;
      overflow: hidden;
      border: solid 1px #242424;
      border-radius: 9999rem;
      color: #656565;
      font-size: 10px;
      transition: all 0.3s;

      &-active {
        border-color: #dfbe5b;
      }

      .select-single {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 10px;
        box-sizing: border-box;
        border-radius: 5px;
        background-color: #191919;
      }

      .right-box {
        margin-right: 3px;
        font-size: 10px;
        transform: rotate(-90deg);
        transition: transform 0.3s linear;
      }
    }

    .bind-search-box {
      flex: 0 0 125px;
      min-width: 125px;
      height: 25px;
      width: 125px;
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border: var(--lobby__px) solid var(--skin__border);
      border-radius: 12.5px;
      background-color: var(--skin__bg_2);
      color: var(--skin__neutral_2);
      font-size: 12px;

      &:focus-within {
        flex: 1 1 0;
        min-width: 0;
        width: auto;
      }

      .search-input {
        width: 100%;
        height: 100%;
        border: 0;
        background-color: transparent;
        color: var(--skin__lead);
        font-size: 10px;
        line-height: 25px;
        caret-color: var(--skin__primary);
        white-space: nowrap;
        text-overflow: ellipsis;
        &::placeholder {
          color: var(--skin__neutral_2);
        }
      }
    }
  }

  .list-box {
    flex: 1;
    height: 0;
    overflow: auto;
    padding-left: 10px;
    padding-right: 10px;
    .item-box {
      position: relative;
      align-items: center;
      min-height: 50px;
      margin-bottom: 10px;
      .announcement {
        display: flex;
        flex-shrink: 0;
        justify-content: space-between;
        width: 100%;
        background-color: var(--skin__bg_2);
        padding: 10px 10px 10px 13px;
        border-radius: 7px;
        box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.06);
        .content-box {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          .icon {
            position: relative;
            margin-left: -2px;
            margin-right: 10px;
            img {
              width: 22px;
              height: 19.25px;
              margin-right: 8px;
            }
          }
          .icon-unread {
            &::after {
              content: "";
              position: absolute;
              top: 3px;
              right: 7.5px;
              width: 6px;
              height: 6px;
              background-color: var(--skin__accent_2);
              border-radius: 100%;
            }
          }
          .title {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: space-between;
            .notice-content {
              display: inline-block;
              width: 250px;
              margin: 0;
              height: 20px;
              line-height: 20px;
              color: var(--skin__lead) !important;
              font-size: 12px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              :deep(span) {
                font-size: 12px !important;
              }
            }
            .createTime {
              margin-top: 4px;
              color: var(--skin__neutral_2);
              font-size: 9px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              line-height: 1;
            }
          }
          .list-right {
            color: var(--skin__neutral_2);
            min-width: 32.5px;
            width: 73px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            span {
              font-size: 12px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .text-right-icon {
              color: var(--skin__neutral_2);
              margin-right: 10px;
              margin-left: 6px;
            }
          }
        }
      }
      .show-text {
        color: var(--skin__lead) !important;
      }
    }
  }

  .pagination-box {
    :deep(.van-pagination) {
      height: 45px;
      padding: 10px 0;
      margin: 0 auto;
      width: fit-content;
      font-size: 10px;
      display: flex;
      align-items: center;
      .van-pagination__item {
        box-sizing: border-box;
        color: var(--skin__lead);
        background: var(--skin__bg_2);
        margin: 0 3.75px;
        font-weight: 400;
        min-width: 25px;
        height: 25px;
        border: var(--lobby__px) solid var(--skin__border);
        cursor: pointer;
        user-select: none;
        border-radius: 5px;
        &::after {
          display: none;
        }
      }
      .van-pagination__item--active {
        color: var(--skin__text_primary) !important;
        background-color: var(--skin__primary) !important;
        border: none;
      }
      .van-pagination__item--disabled {
        display: none;
      }
    }
  }
}
</style>
