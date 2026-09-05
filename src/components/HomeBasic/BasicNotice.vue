<script setup lang="ts">
import { nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue';
import type { SwipeInstance } from 'vant';
import { useRouter } from 'vue-router';
import { service } from '@/api/service';
import UiBadge from '@/components/UI/badge.vue';
import { APP_PREFIX_KEY } from '@/utils/site';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import speakerIcon from '@/assets/home/icon_dt_pmd.avif';
import messageIcon from '@/assets/home/basic/icon_dt_1xx.avif';

defineOptions({
  name: 'BasicNotice'
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

const NOTICE_CACHE_KEY = `${APP_PREFIX_KEY}_basic_home_notice`;
const NOTICE_CACHE_DURATION = 5 * 60 * 1000;
const TICK_INTERVAL = 3000;
const SCROLL_SPEED = 40;

const marqueeList = ref<MarqueeItem[]>([]);
const messageCount = ref(0);
const activeIndex = ref(0);
const swipe = ref<SwipeInstance>();
const ticker = ref<HTMLElement>();
let tickTimer: number | null = null;
let tickerVersion = 0;
const router = useRouter();

async function startTicker() {
  stopTicker();
  if (marqueeList.value.length < 2) return;
  const currentVersion = tickerVersion;
  await nextTick();
  if (currentVersion !== tickerVersion) return;
  const content = ticker.value?.querySelector<HTMLElement>('.basic-notice__content');
  const contentWidth = content?.scrollWidth ?? 0;
  const viewportWidth = ticker.value?.clientWidth ?? 0;
  // 长公告完整滚动一遍后才切换，避免固定三秒切走导致后半段始终不可见。
  const duration = contentWidth > viewportWidth
    ? 1000 + (contentWidth + viewportWidth) / SCROLL_SPEED * 1000
    : TICK_INTERVAL;
  tickTimer = window.setTimeout(() => swipe.value?.next(), duration);
}

function stopTicker() {
  tickerVersion += 1;
  if (tickTimer) {
    window.clearTimeout(tickTimer);
    tickTimer = null;
  }
}

async function init() {
  let cachedNotice: NoticeCache | null = null;

  try {
    const cacheContent = localStorage.getItem(NOTICE_CACHE_KEY);
    const parsedCache = cacheContent ? (JSON.parse(cacheContent) as NoticeCache) : null;

    if (
      parsedCache &&
      Array.isArray(parsedCache.marqueeList) &&
      Number.isFinite(parsedCache.messageCount) &&
      Number.isFinite(parsedCache.expiresAt)
    ) {
      cachedNotice = parsedCache;
      marqueeList.value = parsedCache.marqueeList;
      messageCount.value = parsedCache.messageCount;

      if (parsedCache.expiresAt > Date.now()) {
        return;
      }
    }
  } catch (error) {
    localStorage.removeItem(NOTICE_CACHE_KEY);
    console.error('读取基础模板首页公告缓存失败，失败原因：', error);
  }

  const [marqueeResult, notifyResult] = await Promise.allSettled([
    service.v1.notice.marqueeList({ limit: 9999 }),
    service.v1.notice.notifyList({ limit: 9999 })
  ]);

  if (marqueeResult.status === 'fulfilled') {
    marqueeList.value = Array.isArray(marqueeResult.value?.list) ? marqueeResult.value.list : [];
  } else {
    console.error('获取首页跑马灯公告失败，失败原因：', marqueeResult.reason);
  }

  if (notifyResult.status === 'fulfilled') {
    const total = Number(notifyResult.value?.total);
    const notifyList = Array.isArray(notifyResult.value?.list) ? notifyResult.value.list : [];

    messageCount.value = Number.isFinite(total) ? total : notifyList.length;
  } else {
    console.error('获取首页消息数量失败，失败原因：', notifyResult.reason);
  }

  if (marqueeResult.status === 'fulfilled' && notifyResult.status === 'fulfilled') {
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
      console.error('保存基础模板首页公告缓存失败，失败原因：', error);
    }
  } else if (!cachedNotice) {
    marqueeList.value = marqueeResult.status === 'fulfilled' ? marqueeList.value : [];
    messageCount.value = notifyResult.status === 'fulfilled' ? messageCount.value : 0;
  }

}

function openNoticeDetail(notice: MarqueeItem) {
  if (notice.id == null) return;

  router.push({
    path: '/home/notice/detail',
    query: {
      id: notice.id,
      noticeType: 3
    }
  });
}

function openNoticeCenter() {
  router.push({
    path: '/home/notice',
    query: {
      noticeType: 1
    }
  });
}

// 跑马灯保持单行：块级标签之间用空格分隔，保留颜色等行内富文本样式。
function formatMarqueeContent(content?: string) {
  const blockTagNames = 'p|div|li|ul|ol|section|article|blockquote|h[1-6]';
  const blockTagStartPattern = new RegExp(`<(?:${blockTagNames})(?:\\s[^>]*)?>`, 'gi');
  const blockTagEndPattern = new RegExp(`</(?:${blockTagNames})>`, 'gi');

  return String(content ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(blockTagEndPattern, ' ')
    .replace(blockTagStartPattern, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

watch([marqueeList, activeIndex], startTicker);
onActivated(startTicker);
onDeactivated(stopTicker);

onMounted(() => {
  void init();
});

onBeforeUnmount(() => {
  stopTicker();
});
</script>

<template>
  <div v-if="marqueeList.length" class="basic-notice">
    <home-skeleton-image
      :src="speakerIcon"
      alt="."
      class="basic-notice__speaker"
      fit="contain"
      loading="eager"
    />

    <div ref="ticker" class="basic-notice__ticker" aria-live="off">
      <van-swipe ref="swipe" vertical :show-indicators="false" :touchable="false" @change="activeIndex = $event">
        <van-swipe-item
          v-for="(notice, index) in marqueeList"
          :key="notice.id ?? index"
          class="basic-notice__row"
          @click="openNoticeDetail(notice)"
        >
          <van-notice-bar v-if="index === activeIndex" :scrollable="true" :delay="1" :speed="SCROLL_SPEED">
            <div class="basic-notice__content" v-html="formatMarqueeContent(notice.content)"></div>
          </van-notice-bar>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div
      class="basic-notice__message"
      role="button"
      tabindex="0"
      :aria-label="$t('消息中心')"
      @click="openNoticeCenter"
      @keydown.enter="openNoticeCenter"
      @keydown.space.prevent="openNoticeCenter"
    >
      <ui-badge :content="messageCount">
        <home-skeleton-image
          :src="messageIcon"
          alt="."
          class="basic-notice__message-icon"
          fit="contain"
          loading="eager"
        />
      </ui-badge>
    </div>
  </div>
</template>

<style scoped lang="less">
.basic-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 25px;
  padding: 0 12px;
  box-sizing: border-box;

  &__speaker {
    flex: none;
    width: 18px;
    height: 17px;
    margin-right: 5px;
    background-color: transparent;
  }

  &__ticker {
    flex: 1;
    min-width: 0;
    height: 17.5px;
    overflow: hidden;
    cursor: pointer;
  }

  &__ticker :deep(.van-swipe) {
    height: 100%;
  }

  &__ticker :deep(.van-notice-bar) {
    --van-notice-bar-height: 17.5px;
    --van-notice-bar-padding: 0;
    --van-notice-bar-background: transparent;
    width: 100%;
  }

  &__row {
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__content {
    display: inline-block;
    white-space: nowrap;
    color: var(--skin__neutral_1);
    font-size: 12px;
    line-height: 17.5px;
    padding-inline-end: 5px;

    :deep(*) {
      font-size: 12px !important;
    }
  }

  &__message {
    flex: none;
    width: 30px;
    height: 28px;
    margin-left: 5px;
    cursor: pointer;

    .ui-badge {
      --badge-bg-color: var(--skin__accent_2);
    }
  }

  &__message-icon {
    width: 29px;
    height: 27px;
    background-color: transparent;
  }
}

:global([dir='rtl']) .basic-notice {
  &__speaker {
    margin-right: 0;
    margin-left: 5px;
  }

  &__message {
    margin-left: 0;
    margin-right: 5px;
  }
}
</style>
