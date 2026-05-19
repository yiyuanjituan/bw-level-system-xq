<script setup lang="ts">
import dayjs from "dayjs";
import { nextTick, onMounted, ref } from "vue";
import UiLoading from "@/components/UI/loading.vue";
import { service } from "@/api/service";
import { showCustomToast } from "@/hooks/useCommon";

type RewardItem = {
  id?: number | string;
  feedbackId?: number | string;
  title?: string;
  questionType?: string;
  content?: string;
  description?: string;
  remark?: string;
  createTime?: string | number;
  create_time?: string | number;
  createdAt?: string | number;
  status?: number | string;
  state?: number | string;
  statusText?: string;
  [key: string]: any;
};

const PAGE_SIZE = 10;
const LOAD_MORE_OFFSET = 40;
const TEXT = {
  defaultTitle: "反馈内容",
  empty: "暂无反馈",
  feedbackId: "反馈ID:",
  noMore: "没有更多了",
  loadFailed: "加载失败",
  retryLoadFailed: "加载失败，点击重试",
  retryNextPageFailed: "下一页加载失败，点击重试",
  status: {
    pending: "待处理",
    accepted: "采纳",
    rejected: "不采纳"
  }
} as const;

const containerRef = ref<HTMLElement | null>(null);
const rewardList = ref<RewardItem[]>([]);
const page = ref(0);
const finished = ref(false);
const isInitialLoading = ref(false);
const isLoadingMore = ref(false);
const requestError = ref("");

function getListData(response: any): RewardItem[] {
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  if (Array.isArray(response?.data?.rows)) return response.data.rows;
  return [];
}

function getTotal(response: any) {
  return Number(
    response?.pagination?.total
    ?? response?.total
    ?? response?.count
    ?? response?.data?.total
    ?? 0
  );
}

function getServerPageSize(response: any) {
  return Number(
    response?.pagination?.size
    ?? response?.size
    ?? response?.limit
    ?? response?.data?.size
    ?? PAGE_SIZE
  );
}

function getDisplayId(item: RewardItem) {
  return String(item.feedbackId ?? item.id ?? "--");
}

function getDisplayTitle(item: RewardItem) {
  return String(item.title ?? item.questionType ?? TEXT.defaultTitle);
}

function getDisplayContent(item: RewardItem) {
  return String(item.content ?? item.description ?? item.remark ?? "--");
}

function formatDateTime(value: unknown) {
  if (value == null || value === "") {
    return "--";
  }

  const numericValue = Number(value);
  const dateValue = Number.isFinite(numericValue) && `${value}`.trim() !== ""
    ? (numericValue > 1_000_000_000_000 ? numericValue : numericValue * 1000)
    : value;

  const formatted = dayjs(dateValue as string | number | Date);

  return formatted.isValid()
    ? formatted.format("YYYY/MM/DD HH:mm:ss")
    : String(value);
}

function getStatusText(item: RewardItem) {
  if (item.statusText) {
    return String(item.statusText);
  }

  const status = String(item.status ?? item.state ?? "");

  if (status === "0") return TEXT.status.pending;
  if (status === "1") return TEXT.status.accepted;
  if (status === "2") return TEXT.status.rejected;

  return TEXT.status.pending;
}

function isPositiveStatus(item: RewardItem) {
  return getStatusText(item) === TEXT.status.accepted;
}

function updateFinishedState(response: any, currentPageListLength: number) {
  const total = getTotal(response);
  const pageSize = getServerPageSize(response) || PAGE_SIZE;

  if (currentPageListLength === 0) {
    finished.value = true;
    return;
  }

  if (total > 0) {
    finished.value = rewardList.value.length >= total;
    return;
  }

  finished.value = currentPageListLength < pageSize;
}

async function ensureScrollable() {
  const container = containerRef.value;

  if (
    !container
    || finished.value
    || isInitialLoading.value
    || isLoadingMore.value
    || rewardList.value.length === 0
  ) {
    return;
  }

  if (container.scrollHeight <= container.clientHeight + 2) {
    await loadNextPage();
  }
}

async function requestPage(targetPage: number) {
  if (isInitialLoading.value || isLoadingMore.value) {
    return;
  }

  const isFirstPage = targetPage === 1;
  requestError.value = "";

  if (isFirstPage) {
    isInitialLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const response = await service.request({
      url: "/app/v1/notice/feedbackList",
      method: "post",
      data: {
        page: targetPage,
        limit: PAGE_SIZE,
        size: PAGE_SIZE
      }
    });

    const currentPageList = getListData(response);

    rewardList.value = isFirstPage
      ? currentPageList
      : rewardList.value.concat(currentPageList);

    page.value = targetPage;
    updateFinishedState(response, currentPageList.length);

    await nextTick();
    await ensureScrollable();
  } catch (_error) {
    requestError.value = isFirstPage ? TEXT.retryLoadFailed : TEXT.retryNextPageFailed;
    showCustomToast({
      type: "fail",
      message: TEXT.loadFailed
    });
  } finally {
    isInitialLoading.value = false;
    isLoadingMore.value = false;
  }
}

async function refresh() {
  rewardList.value = [];
  page.value = 0;
  finished.value = false;
  await requestPage(1);
}

async function loadNextPage() {
  if (finished.value || isInitialLoading.value || isLoadingMore.value) {
    return;
  }

  await requestPage(page.value + 1);
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement | null;

  if (!target || finished.value || isInitialLoading.value || isLoadingMore.value) {
    return;
  }

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

  if (distanceToBottom <= LOAD_MORE_OFFSET) {
    void loadNextPage();
  }
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <div ref="containerRef" class="reward-list-container" @scroll.passive="handleScroll">
    <div class="flex-1">
      <div v-if="isInitialLoading && rewardList.length === 0" class="loading-box">
        <ui-loading />
      </div>

      <div v-else-if="rewardList.length === 0 && !requestError" class="empty-box">
        <empty :text="TEXT.empty" />
      </div>

      <div v-else-if="rewardList.length === 0 && requestError" class="status-box error-text" @click="refresh">
        {{ requestError }}
      </div>

      <div v-else>
        <div class="list-container">
          <div
            v-for="(item, index) in rewardList"
            :key="item.id ?? item.feedbackId ?? `${item.createTime}-${index}`"
            class="list-item"
          >
            <div class="row-1 flex justify-between">
              <div class="feedback-id">
                <span class="feedback-id-literal">{{ TEXT.feedbackId }}</span>
                {{ getDisplayId(item) }}
                <copy :text="getDisplayId(item)" class-name="!text-[12px] ml-[5px]" />
              </div>
              <div class="text-right">
                <div class="text-2" :class="{ 'is-positive': isPositiveStatus(item) }">
                  {{ getStatusText(item) }}
                </div>
                <svg-icon name="comm_icon_fh" class-name="rotate-[180deg]" />
              </div>
            </div>

            <div class="feedback-content">
              <p>
                <span>{{ getDisplayTitle(item) }}</span>
                <span class="date-time">{{ formatDateTime(item.createTime ?? item.create_time ?? item.createdAt) }}</span>
              </p>
              <div class="content-text">{{ getDisplayContent(item) }}</div>
            </div>
          </div>
        </div>

        <div v-if="isLoadingMore" class="status-box">
          <ui-loading />
        </div>
        <div v-else-if="requestError" class="status-box error-text" @click="loadNextPage">
          {{ requestError }}
        </div>
        <div v-else-if="finished" class="status-box">
          {{ TEXT.noMore }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.reward-list-container {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .loading-box,
  .empty-box {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
  }

  .list-container {
    .list-item {
      position: relative;
      padding: 12.5px 10px 10px;
      font-size: 9px;
      background-color: var(--skin__bg_2);
      border-radius: 7px;
      box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, .06);
      user-select: text;
      margin-bottom: 10px;

      .feedback-id {
        display: flex;
        align-items: center;
        height: 17px;
        color: var(--skin__lead);
        font-size: 12px;
      }

      .feedback-id-literal {
        padding-right: 2px;
        color: var(--skin__neutral_2);
        line-height: 1;
      }

      .text-right {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: initial;
        font-size: 12px;
        text-align: right;

        .text-2 {
          margin-right: 5px;
          color: var(--skin__neutral_2);
          cursor: default;
        }

        .is-positive {
          color: var(--skin__accent_3);
        }
      }

      .feedback-content {
        padding: 3.5px 0 2.5px;
        color: var(--skin__neutral_2);
        font-size: 12px;
        line-height: 1.61;

        p {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          .date-time {
            flex-shrink: 0;
            color: var(--skin__neutral_2);
            line-height: 1.33;
            font-size: 12px;
          }
        }

        .content-text {
          margin-top: 4px;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }

  .status-box {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding-bottom: 10px;
    color: var(--skin__neutral_2);
    font-size: 12px;
  }

  .error-text {
    color: var(--skin__accent_2);
    cursor: pointer;
  }
}
</style>
