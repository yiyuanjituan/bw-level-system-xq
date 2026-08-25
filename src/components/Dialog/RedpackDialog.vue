<script setup lang="ts">
import { ref } from 'vue';
import { useRedpackBg } from '@/hooks/useRedpackBg';

const show = ref(false);
const bgRef = ref<HTMLElement | null>(null);

const { started, start, stop } = useRedpackBg(bgRef, {
  immediate: false,
  interval: 200,
  defaultCount: 3,
  eventType: 'click',
  redpack: {
    speedMin: 3,
    speedMax: 6,
    width: 70,
    height: 94,
    sizeMin: 0.8,
    sizeMax: 1.2
  },
  onClick(payload) {
    console.log('点击红包：', payload);
  }
});

function openRedpack() {
  stop();
  start();
  show.value = true;
}

async function handleOpened() {
  await start();
}

function handleClosed() {
  stop();
}
</script>

<template>
  <div class="fixed-bg">
    <van-popup v-model:show="show" style="width: 100%; height: 100%" @opened="handleOpened" @closed="handleClosed">
      <div ref="bgRef" class="repack-inner-box"></div>
      <div class="wrap-box">
        <div class="pocket">
          <div class="bg-box"></div>
          <div class="container">
            <div class="title" dir="ltr"><span>{{ $t("APP狂抢红包") }}</span></div>
            <a class="redpocket-collet-btn animate__animated animate__heartBeat animate__infinite" style="cursor: pointer; --animate-duration: 0.7s"
              ><div class="redpocket-collet-normal">{{ $t("开") }}</div></a
            >
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.repack-inner-box {
  position: fixed;
  left: 0 !important;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
}
.wrap-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  .pocket {
    position: relative;
    .bg-box {
      width: 190px;
      height: 254px;
      background-image: url(https://146.103.80.124:5001/siteadmin/skin/lobby_asset/common/common/event/hongbao_img_hbd_s.avif?manualVersion=1&version=6a460e079e);
      background-size: cover;
    }
    .container {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      .title {
        display: block;
        top: 20px;
        width: 170.5px;
        height: 19px;
        margin: 0 10px;
        position: absolute;
        left: 0;
        align-items: center;
        > span {
          color: #fcdc99;
          font-size: 14px;
          padding: 0;
          line-height: 1.5;
          background-color: transparent;
          display: -webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          align-items: center;
          justify-content: center;
          min-width: 100px;
          max-width: 200px;
          min-height: 30px;
          text-align: center;
          border-radius: 5px;
        }
      }
      .redpocket-collet-btn {
        position: relative;
        top: 150px;
        display: block;
        width: 65px;
        height: 65px;
        margin: 0 auto;
        color: #a56720;
        font-weight: 700;
        font-size: 27.5px;
        line-height: 1.2;
        text-align: center;
        text-decoration: none;
        background-color: #ffe8a3;
        background-image: linear-gradient(to bottom, #ffe8a3, #f7c886, #f2924e);
        border-radius: 50%;
        box-shadow: 0 1px 2px #3f1a1a;
      }
      .animate__animated.animate__infinite {
        animation-iteration-count: infinite;
      }
      .animate__heartBeat,
      .animate__heartBeat__hover:hover,
      .animate__heartBeat__hover:focus,
      .animate__heartBeat__hover:active {
        animation-name: heartBeat;
        animation-duration: calc(var(--animate-duration) * 1.8);
        animation-timing-function: ease-in-out;
        animation-fill-mode: both;
      }
      .redpocket-collet-normal {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 65px;
        height: 65px;
        padding: 0 2.5px;
        word-wrap: break-word;
      }
    }
  }
}
.fixed-bg {
  --van-popup-background: rgba(0, 0, 0, 0);
  --van-padding-md: 0;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  to {
    transform: scale(1);
  }
}
</style>
