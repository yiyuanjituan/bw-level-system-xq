<script setup lang="ts">
import { handleBack } from "@/utils/common";
import { ref } from "vue";
import { showCustomToast } from "@/hooks/useCommon";

const isLoading = ref(false);

function handleLoading() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: '刷新成功', type: 'success' })
  }, 500)
}
</script>

<template>
  <div class="event-bottom-box">
    <div class="receiveTimes">
      剩余申请次数：<span class="text-white">0</span>
      <div class="refresh-box" @click="handleLoading">
        <svg-icon name="comm_icon_retry" class-name="text-[#DFBE5B]" :class="{ loading: isLoading }" />
        <span class="event-refresh-btn-text">刷新次数</span>
      </div>
    </div>
    <div class="btn-wrap">
      <van-button type="primary" plain @click="handleBack">返 回</van-button>
      <van-button type="primary" color="#999">优惠申请</van-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.event-bottom-box {
  width: 100%;
  height: 90px;
  padding: 10px 10px 10px;
  background-color: #191919;
  box-shadow: 0 -1.5px 3.5px 0 #0000001F;
  max-width: 100%;
  margin: auto;

  .receiveTimes {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 10px;
    color: #656565;
    font-size: 11px;
    width: 100%;
    text-align: center;
    flex-wrap: wrap;
    .refresh-box {
      margin-left: 10px;
      direction: ltr !important;
      display: inline-flex;
      cursor: pointer;
      .event-refresh-btn-text {
        width: unset;
        color: #DFBE5B;
        word-break: break-word;
        line-height: 1.2;
        margin-left: 5px;
      }
      .loading {
        animation: loading-icon 0.5s ease-in-out infinite;
      }
    }
  }
  .btn-wrap {
    width: 355px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    .van-button {
      flex: 1;
      height: 35px;
    }
    :deep(.van-button--disabled) {
      color: #ffa11a !important;
    }
  }
}

@keyframes loading-icon {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>