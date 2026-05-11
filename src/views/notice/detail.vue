<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { service } from "@/api/service";
import dayjs from "dayjs";

const route = useRoute()
const title = ref('')
const detailInfo = ref<any>({})

function init() {
  console.log(route.query);
  if (route.query.noticeType == '1') {
    title.value = '通知详情'
    service.v1.notice.notifyInfo({ id: route.query.id }).then(res => {
      detailInfo.value = res.info
    })
  } else if (route.query.noticeType == '2') {
    title.value = '公告详情'
    service.v1.notice.announcementInfo({ id: route.query.id }).then(res => {
      detailInfo.value = res.info
    })
  } else if (route.query.noticeType == '3') {
    title.value = '跑马灯详情'
    service.v1.notice.marqueeInfo({ id: route.query.id }).then(res => {
      detailInfo.value = res.info
    })
  }
}

function getDetail() {
  service.v1.notice.announcementInfo({ id: route.query.id }).then(res => {
    console.log(res.info);
  })
}

onMounted(() => init())
</script>

<template>
  <div class="detail-container">
    <sub-navbar :title="title" />
    <div class="inner">
      <div class="scrollContent">
        <div class="title" v-if="detailInfo.title" v-html="detailInfo.title"></div>
        <div class="createTime" v-if="route.query.noticeType != '3'">{{ dayjs(detailInfo.createTime).format('YYYY/MM/DD HH:mm:ss') }}</div>
        <div class="main">
          <div class="scale">
            <div class="innerHTMLContainer" v-html="detailInfo.content">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.detail-container {
  min-height: 100dvh;
  background-color: var(--skin__bg_1);
  .inner {
    width: 100%;
    height: 321px;
    word-break: break-word;
    background-color: var(--skin__bg_1);
    border-radius: 5px;
    user-select: text;
    .scrollContent {
      padding: 15px 10px;
      .title {
        margin-top: 0;
        font-size: 12px;
        color: var(--skin__lead);
        text-align: center;
        font-weight: 700;
        * {
          font-size: 13px !important;
        }
      }
      .createTime {
        color: var(--skin__neutral_2);
        text-align: center;
        font-size: 12px;
        margin: 5px auto 15px;
      }
      .main {
        overflow: hidden;
        .scale {
          transform-origin: 0 0;
          height: 321px;
          word-break: break-word;
          border-radius: 5px;
          user-select: text;
          color: var(--skin__neutral_1);
          * {
            font-size: 12px;
          }
        }
        p {
          line-height: 1.24;
        }
      }
    }
  }
}
</style>
