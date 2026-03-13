<script setup lang="ts">
import UiBadge from "@/components/UI/badge.vue";
import { onMounted, ref } from "vue";
import { getEventData } from "@/api/common";
import router from "@/router";
import { showCustomToast } from "@/hooks/useCommon";
import useAppStore from "@/store/modules/app";
import { APP_PREFIX_KEY } from "@/utils/site";

const totalTypes = ref<any[]>([]);
const totalList = ref<any[]>([]);
const isLoading = ref(false);
const appData = useAppStore();

function handleJump(record: any) {
  console.log(record);
  if (record.jumpMode == 1) {
    router.push(`/home/event/detail?eventId=${record.id}`);
  }
}
function handleLoading() {
  isLoading.value = true;
  init();
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: '刷新成功', type: 'success' })
  }, 500)
}

function init() {
  if (appData.activityList?.type) totalTypes.value = appData.activityList?.type
  if (appData.activityList?.list) totalList.value = appData.activityList?.list
  getEventData({}).then(data => {
    localStorage.setItem(`${APP_PREFIX_KEY}_site_activity`, JSON.stringify(data))
    appData.updateActivity(data);
    totalTypes.value = data.type;
    totalList.value = data.list;
  });
}

onMounted(() => {
  init()
});
</script>

<template>
  <div class="event-container">
    <div class="ui-tab-left">
      <div class="scroll-col">
        <div class="ui-tab-item">
          <ui-badge
            class="w-[75px] h-[35px] mt-[10px]"
            :content="0"
            :size="[2, 0]"
          >
            <div class="item-box flex items-center justify-center">
              <svg-icon
                name="event_zh"
                color="#adb6c3"
                class="!w-[24px] !h-[24px]"
              />
              <div class="w-[46.5px] text-[12.5px] text-center">综 合</div>
            </div>
          </ui-badge>
        </div>
        <div class="ui-tab-item" v-for="item in totalTypes">
          <ui-badge
            class="w-[75px] h-[35px] mt-[10px]"
            :content="0"
            :size="[2, 0]"
          >
            <div class="item-box flex items-center justify-center">
              <img
                :src="item.logo"
                v-if="item.logo"
                alt=""
                srcset=""
                class="w-auto h-[24px]"
              />
              <div class="w-[46.5px] text-[12.5px] text-center">
                {{ item.name }}
              </div>
            </div>
          </ui-badge>
        </div>
      </div>
      <div class="event-extra-button">
        <div type="button" class="btn-small ui-button mt-[10px] bg-transparent">
          <div class="lh-[100%] text-[#F0C059] pt-[2px]">
            <span class="text">领取记录</span>
          </div>
        </div>
        <div type="button" class="btn-small ui-button mt-[10px] bg-transparent" @click="handleLoading">
          <div class="lh-[100%] text-[#F0C059] pt-[2px] flex">
            <svg-icon name="refresh" color="#F0C059" class="!w-[11px] !h-[11px]" :class="{ loading: isLoading }" />
            <span class="ml-[2px] text-[9px]">刷新奖励</span>
          </div>
        </div>
      </div>
    </div>
    <div class="ui-tab-right">
      <div class="panel">
        <div class="panel-item-box" v-for="item in totalList">
          <img :src="item.image" alt="" srcset="" class="w-[100%] h-[100%]" @click="handleJump(item)">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.event-container {
  color: white;
  display: flex;
  flex-direction: row;

  .ui-tab-left {
    width: 95px;
    height: 100%;
    min-height: 30px;
    display: flex;
    flex-direction: column;

    .scroll-col {
      flex: 1;
      max-height: calc(100dvh - 197px);
      height: fit-content;
      padding: 0;
      overflow: auto;

      .ui-tab-item {
        width: 100%;
        height: 45px;
        line-height: 10px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        .item-box {
          width: 100%;
          height: 100%;
          background-image: url("@/assets/common/btn_zc1_2.avif");
          border-radius: 7px;
          padding: 0 3px 0 2px;
          background-size: 100% 100%;
          color: #adb6c3;
          box-shadow: 0 1px 2px 0 #0000001f;
          word-break: break-all;
        }
      }
    }

    .event-extra-button {
      width: 75px;
      height: 90px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: column;
      margin: 0 auto;
      .ui-button {
        position: relative;
        box-sizing: border-box;
        height: 35px;
        padding: 0;
        font-size: 12px;
        line-height: 1.2;
        text-align: center;
        border-radius: 7px;
        cursor: pointer;
        transition: opacity 0.2s;
        -webkit-appearance: none;
        appearance: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-small {
        height: 25px;
        width: 60px;
        padding: 0 2.5px;
        font-size: 10px;
        border: 1px solid #f0c059;
        .loading {
          animation: loading-icon 0.5s ease-in-out infinite;
        }
        @keyframes loading-icon {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      }
    }
  }

  .ui-tab-right {
    flex: 1;
    position: relative;
    font-size: 13px;
    overflow: auto;
    .panel {
      padding-top: 10px;
      width: 100%;
      .panel-item-box {
        margin-bottom: 10px;
        height: 122px;
        background-color: transparent;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
        width: 270px;
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
