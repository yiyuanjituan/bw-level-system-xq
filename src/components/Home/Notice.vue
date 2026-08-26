<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { service } from "@/api/service";
import UiBadge from "@/components/UI/badge.vue";
import { APP_PREFIX_KEY } from "@/utils/site";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import noticeSpeakerIcon from "@/assets/home/icon_dt_pmd.avif";
import noticeMessageIcon from "@/assets/home/icon_dt_1xx_wd.avif";

defineOptions({
  name: "HomeNotice"
});

type MarqueeItem = {
  id?: string | number;
  content?: string;
};

type NoticeCache = {
  marqueeList: MarqueeItem[];
  messageCount: number;
  expiresAt: number;
};

const NOTICE_CACHE_KEY = `${APP_PREFIX_KEY}_home_notice`;
const NOTICE_CACHE_DURATION = 5 * 60 * 1000;

const marqueeList = ref<MarqueeItem[]>([]);
const messageCount = ref(0);
const router = useRouter();

async function init() {
  let cachedNotice: NoticeCache | null = null;

  try {
    const cacheContent = localStorage.getItem(NOTICE_CACHE_KEY);
    const parsedCache = cacheContent
      ? (JSON.parse(cacheContent) as NoticeCache)
      : null;

    if (
      parsedCache &&
      Array.isArray(parsedCache.marqueeList) &&
      Number.isFinite(parsedCache.messageCount) &&
      Number.isFinite(parsedCache.expiresAt)
    ) {
      cachedNotice = parsedCache;
      marqueeList.value = parsedCache.marqueeList;
      messageCount.value = parsedCache.messageCount;

      if (parsedCache.expiresAt > Date.now()) return;
    }
  } catch (error) {
    localStorage.removeItem(NOTICE_CACHE_KEY);
    console.error("读取首页公告缓存失败，失败原因：", error);
  }

  const [marqueeResult, notifyResult] = await Promise.allSettled([
    service.v1.notice.marqueeList({ limit: 9999 }),
    service.v1.notice.notifyList({ limit: 9999 })
  ]);

  if (marqueeResult.status === "fulfilled") {
    marqueeList.value = Array.isArray(marqueeResult.value?.list)
      ? marqueeResult.value.list
      : [];
  } else {
    console.error(
      "获取首页跑马灯公告失败，失败原因：",
      marqueeResult.reason
    );
  }

  if (notifyResult.status === "fulfilled") {
    const total = Number(notifyResult.value?.total);
    const notifyList = Array.isArray(notifyResult.value?.list)
      ? notifyResult.value.list
      : [];

    messageCount.value = Number.isFinite(total) ? total : notifyList.length;
  } else {
    console.error("获取首页消息数量失败，失败原因：", notifyResult.reason);
  }

  // 两个接口都成功时才更新缓存，避免部分失败覆盖上一次完整数据。
  if (
    marqueeResult.status === "fulfilled" &&
    notifyResult.status === "fulfilled"
  ) {
    try {
      localStorage.setItem(
        NOTICE_CACHE_KEY,
        JSON.stringify({
          marqueeList: marqueeList.value,
          messageCount: messageCount.value,
          expiresAt: Date.now() + NOTICE_CACHE_DURATION
        } satisfies NoticeCache)
      );
    } catch (error) {
      console.error("保存首页公告缓存失败，失败原因：", error);
    }
  } else if (!cachedNotice) {
    marqueeList.value =
      marqueeResult.status === "fulfilled" ? marqueeList.value : [];
    messageCount.value =
      notifyResult.status === "fulfilled" ? messageCount.value : 0;
  }
}

function openNoticeDetail(notice: MarqueeItem) {
  if (notice.id == null) return;

  router.push({
    path: "/home/notice/detail",
    query: {
      id: notice.id,
      noticeType: 3
    }
  });
}

function openNoticeCenter() {
  router.push({
    path: "/home/notice",
    query: {
      noticeType: 1
    }
  });
}

function formatMarqueeContent(content?: string) {
  const blockTagNames = "p|div|li|ul|ol|section|article|blockquote|h[1-6]";
  const blockTagStartPattern = new RegExp(
    `<(?:${blockTagNames})(?:\\s[^>]*)?>`,
    "gi"
  );
  const blockTagEndPattern = new RegExp(`</(?:${blockTagNames})>`, "gi");

  // 跑马灯必须保持单行，块级标签之间用空格分隔，同时保留颜色等行内富文本样式。
  return String(content ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(blockTagEndPattern, " ")
    .replace(blockTagStartPattern, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

onMounted(init);
</script>

<template>
  <div v-if="marqueeList.length" class="home-notice">
    <home-skeleton-image
      :src="noticeSpeakerIcon"
      alt="."
      class="home-notice__speaker"
      fit="contain"
      loading="eager"
    />

    <van-swipe
      class="home-notice__swipe"
      vertical
      :autoplay="3000"
      :show-indicators="false"
      :touchable="false"
    >
      <van-swipe-item
        v-for="(notice, index) in marqueeList"
        :key="notice.id ?? index"
        @click="openNoticeDetail(notice)"
      >
        <van-notice-bar :scrollable="true" :delay="1" :speed="60">
          <div
            class="home-notice__content"
            v-html="formatMarqueeContent(notice.content)"
          ></div>
        </van-notice-bar>
      </van-swipe-item>
    </van-swipe>

    <div
      class="home-notice__message"
      role="button"
      tabindex="0"
      :aria-label="$t('消息中心')"
      @click="openNoticeCenter"
      @keydown.enter="openNoticeCenter"
      @keydown.space.prevent="openNoticeCenter"
    >
      <ui-badge :content="messageCount">
        <home-skeleton-image
          :src="noticeMessageIcon"
          alt="."
          class="home-notice__message-icon"
          fit="contain"
          loading="eager"
        />
      </ui-badge>
    </div>
  </div>
</template>

<style scoped lang="less">
.home-notice {
  --van-notice-bar-height: 25px;
  --van-notice-bar-background: transparent;
  --van-notice-bar-text-color: #adb6c3;
  --van-notice-bar-font-size: 12px;
  --van-notice-bar-padding: 0px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  margin-top: 10px;

  &__speaker {
    flex: none;
    width: 18px;
    height: 16.5px;
    margin-right: 5px;
    background-color: transparent;
  }

  &__swipe {
    flex: 1;
    min-width: 0;
    height: 25px;

    :deep(.van-swipe-item) {
      height: 25px;
      cursor: pointer;
    }

    :deep(.van-notice-bar) {
      width: 100%;
    }

    :deep(.home-notice__content) {
      display: inline;
      white-space: nowrap;
    }
  }

  &__message {
    flex: none;
    width: 30px;
    height: 28.3px;
    margin-left: 5px;
    cursor: pointer;
  }

  &__message-icon {
    width: 29px;
    height: 25.38px;
    background-color: transparent;
  }
}

:global([dir="rtl"]) .home-notice {
  &__speaker {
    margin-right: 0;
    margin-left: 5px;
  }

  &__message {
    margin-right: 5px;
    margin-left: 0;
  }
}
</style>
