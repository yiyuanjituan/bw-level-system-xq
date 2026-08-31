<script setup lang="ts">
import NoticeService from "./components/NoticeService.vue";
import NoticeInfo from "./components/NoticeInfo.vue";
import NoticeNotify from "./components/NoticeNotify.vue";
import NoticeMarquee from "./components/NoticeMarquee.vue";
import RewardFeedback from "./components/RewardFeedback.vue";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const noticeTypes = ["4", "2", "1", "3", "5"] as const;
const defaultNoticeType = noticeTypes[0];
const activePath = ref<string>(defaultNoticeType);

function normalizeNoticeType(noticeType: unknown) {
  const type = Array.isArray(noticeType) ? noticeType[0] : noticeType;
  const value = String(type ?? defaultNoticeType);

  return noticeTypes.includes(value as (typeof noticeTypes)[number]) ? value : defaultNoticeType;
}

function getCurrentNoticeType() {
  return normalizeNoticeType(route.query.noticeType);
}

watch(
  () => route.query.noticeType,
  (noticeType) => {
    activePath.value = normalizeNoticeType(noticeType);
  },
  { immediate: true }
);

watch(activePath, (value) => {
  if (getCurrentNoticeType() === value) {
    return;
  }

  router.replace({
    query: {
      ...route.query,
      noticeType: value
    }
  });
});
</script>

<template>
  <div class="notice-page-container">
    <sub-navbar :title="$t('消息中心')" back-class-name="!text-[12px]"></sub-navbar>
    <div class="tabs-container">
      <van-tabs shrink v-model:active="activePath">
        <van-tab :title="$t('客服')" name="4"><NoticeService /></van-tab>
        <van-tab :title="$t('公告')" name="2"><NoticeInfo /></van-tab>
        <van-tab :title="$t('通知')" name="1"><NoticeNotify /></van-tab>
        <van-tab :title="$t('跑马灯')" name="3"><NoticeMarquee /></van-tab>
        <van-tab :title="$t('有奖反馈')" name="5"><RewardFeedback /></van-tab>
      </van-tabs>
    </div>
    <router-view></router-view>
  </div>
</template>

<style scoped lang="less">
.notice-page-container {
  background: var(--skin__bg_1);
  color: var(--skin__lead);
  .tabs-container {
    height: calc(100vh - 45px);

    --van-tabs-line-height: 100%;
    --van-tab-text-color: var(--skin__lead);
    --van-padding-xs: 0px;
    --van-padding-sm: 15px;
    --van-tabs-bottom-bar-color: var(--skin__primary);
    --van-tab-active-text-color: var(--skin__primary);
    --van-tabs-bottom-bar-height: 2px;
    --van-tab-font-size: 12px;
    --van-tabs-bottom-bar-width: 24px;
    --van-tabs-nav-background: transparent;

    :deep(.van-tabs) {
      background: var(--skin__bg_2);
      height: 100%;

      .van-tab__panel {
        height: 100%;
      }

      .van-tabs__wrap {
        height:35px;
      }

      .van-tabs__wrap {
        padding: 0 6px;
      }

      .van-tab {
        font-size: 12px;
        margin-right: 20px;
        //color: var(--skin__lead);
        padding: 0 6px;
        font-weight: normal;
        min-width: 45px;
      }
      .van-tabs__content {
        height: calc(100% - 35px);
      }
    }

  }
}
</style>
