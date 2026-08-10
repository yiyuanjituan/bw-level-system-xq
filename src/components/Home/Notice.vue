<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { service } from "@/api/service";
import UiBadge from "@/components/UI/badge.vue";

defineOptions({
  name: "HomeNotice"
});

type MarqueeItem = {
  id?: string | number;
  content?: string;
};

const marqueeList = ref<MarqueeItem[]>([]);
const messageCount = ref(0);
const router = useRouter();

function init() {
  service.v1.notice
    .marqueeList({ limit: 9999 })
    .then(res => {
      marqueeList.value = Array.isArray(res?.list) ? res.list : [];
    })
    .catch(error => {
      marqueeList.value = [];
      console.error("获取首页跑马灯公告失败，失败原因：", error);
    });

  service.v1.notice
    .notifyList({ limit: 9999 })
    .then(res => {
      const total = Number(res?.total);
      const notifyList = Array.isArray(res?.list) ? res.list : [];

      messageCount.value = Number.isFinite(total) ? total : notifyList.length;
    })
    .catch(error => {
      messageCount.value = 0;
      console.error("获取首页消息数量失败，失败原因：", error);
    });
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
  <div v-if="marqueeList.length" class="global-marquee px-[12px]">
    <img
      src="@/assets/home/icon_dt_pmd.avif"
      alt="."
      class="left-icon mr-[5px]"
    />

    <van-swipe
      class="marquee-swiper"
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
            class="marquee-content"
            v-html="formatMarqueeContent(notice.content)"
          ></div>
        </van-notice-bar>
      </van-swipe-item>
    </van-swipe>

    <div class="right-icon ml-[5px]" @click="openNoticeCenter">
      <ui-badge :content="messageCount">
        <img
          src="@/assets/home/icon_dt_1xx_wd.avif"
          alt="."
          class="w-[29px] h-[25.38px]"
        />
      </ui-badge>
    </div>
  </div>
</template>

<style scoped lang="less">
.global-marquee {
  --van-notice-bar-height: 25px;
  --van-notice-bar-background: transparent;
  --van-notice-bar-text-color: #adb6c3;
  --van-notice-bar-font-size: 12px;
  --van-notice-bar-padding: 0px;
  display: flex;
  align-items: center;
  margin-top: 10px;

  .left-icon {
    flex: none;
    width: 18px;
    height: 16.5px;
  }

  .marquee-swiper {
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

    :deep(.marquee-content) {
      display: inline;
      white-space: nowrap;
    }
  }

  .right-icon {
    flex: none;
    width: 30px;
    height: 28.3px;
    cursor: pointer;
  }
}
</style>
