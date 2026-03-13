<script setup lang="ts">
import { onMounted, ref } from "vue";
import { bus } from "@/utils/mitt";
import { ToastOptions } from "vant";
import { IToastOptions } from "@/typings/mitt";

defineOptions({
  name: "ui-toast",
})

const show = ref(false)
const isInit = ref(false)
const title = ref<any>("Toast Message");
const params = ref<IToastOptions>({})
let timer = null;

function showToast(options: IToastOptions) {
  show.value = true;
  title.value = typeof options == 'string' ? options : options.message
  params.value = options
  clearTimeout(timer)
  timer = setTimeout(() => {
    show.value = false;
  }, options?.duration || 2000)
}

onMounted(() => {
  bus.on("showToast", showToast)
  setTimeout(() => isInit.value = true, 400) // 初始化
})

</script>

<template>
  <div class="ui-toast" :class="[isInit?'opacity-100':'opacity-0']">
<!--    <van-overlay :show="show" :lock-scroll="false"></van-overlay>-->
    <div class="ui-toast-box" :class="{ 'ui-toast-box-active': show }">
      <div class="inner">
        <div class="icons" v-if="params.type && params.type != 'text'">
          <svg-icon name="exclamation-circle" color="#FFAA09" v-if="params.type == 'warning'" />
          <svg-icon name="close-circle" color="#EA4E3D" v-if="params.type == 'fail'" />
          <svg-icon name="check-circle" color="#04BE02" v-if="params.type == 'success'" />
        </div>
        <div class="toast-text">{{ title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-toast {
  --van-overlay-background: rgba(0, 0, 0, 0.0);
  z-index: 9999999;
  .ui-toast-box {
    display: flex;
    position: absolute;
    z-index: 9999999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale3d(0,0,0);
    transition: all 0.3s;
    white-space: pre-wrap;
    word-break: break-word;
    box-sizing: border-box;
    font-size: 14px;
    color: #333;
    line-height: 20px;
    max-width: 345px;
    min-width: 96px;
    background: transparent;
    overflow-y: initial;
    align-items: center;
    justify-content: center;
    animation: var(--animate-duration, 0.5s) zoomOut both;

    .inner {
      background: white;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 7px;
      transition: all 0.3s;
      width: auto;
      flex: none;

      .icons {
        width: 19px;
        height: 19px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 21px;
        margin-right: 12px;
      }

      .toast-text {
        max-width: 265px;
        text-align: center;
        flex: none;
      }
    }
  }

  @keyframes zoomIn {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale3d(0.3, 0.3, 0.3);
      transform-origin: 50% 50%;
    }
    100% {
      opacity: 1;
      transform-origin: 50% 50%;
      transform: translate(-50%, -50%) scale3d(1, 1, 1);
    }
  }
  .ui-toast-box-active {
    animation: var(--animate-duration, 0.3s) zoomIn both;
  }

  @keyframes zoomOut {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale3d(1, 1, 1);
    }
    50% {
      transform: translate(-50%, -50%) scale3d(0.3, 0.3, 0.3);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
