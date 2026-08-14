<script setup lang="ts">
import useDataStore from "@/store/modules/data";
import { onMounted, ref } from "vue";
import router from "@/router";
import { getGameUrl } from "@/api/common";
import { isFullscreen, toggleFullScreen } from "@/utils/site";

const appData = useDataStore();
const showLoading = ref<boolean>(true);
const url = ref<any>("");
const offset = ref({ x: 1.5, y: 1.5 });
const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const isMobileDevice = isMobileUserAgent || hasCoarsePointer;
const floatingBubbleStyle = {
  "--van-floating-bubble-size": "48px",
  fontSize: "10px"
};

const replaceToHome = () => {
  if (isFullscreen()) {
    toggleFullScreen();
  }
  router.replace(window.history.state.back);
};

onMounted(() => {
  if (!appData.enterGameInfo.gameId && !appData.enterGameInfo.venueId) {
    return router.replace("/index");
  }
  // 选择
  getGameUrl(appData.enterGameInfo)
    .then(res => {
      url.value = res.url;
      showLoading.value = false;

      // 手机端使用页面自身的全视口布局，避免原生全屏触发系统自动横屏
      if (!isMobileDevice && !isFullscreen()) {
        toggleFullScreen();
      }
    })
    .catch(e => {
      if (e.status === 401) return false;
      setTimeout(() => {
        return router.back();
      }, 1000);
    });
});
</script>

<template>
  <div class="embedded-container">
    <div class="show-loading-box" v-if="showLoading">
      <img src="/siteadmin/skin/lobby_asset/apng_loading_game.png" class="w-[90px] h-[90px]" alt="" />
    </div>
    <div v-if="!showLoading && url" class="embed-box">
      <div class="iframe-box">
        <iframe
          class="iframe-box"
          allow="clipboard-write; clipboard-read; web-share; autoplay; encrypted-media"
          :src="url"
        ></iframe>
      </div>
      <van-floating-bubble
        axis="xy"
        :gap="0"
        class="embedded-floating-bubble"
        :style="floatingBubbleStyle"
        @click="replaceToHome"
        v-model:offset="offset"
      >
        <template #default>
          <div class="dragger-box">
            <svg-icon name="game_2_style_1_zk" class-name="dragger-box__icon" />
            <div class="dragger-box__text">首页</div>
          </div>
        </template>
      </van-floating-bubble>
    </div>
  </div>
</template>

<style scoped lang="less">
.embedded-container {
  width: 100%;
  height: 100%;
  background: black;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .show-loading-box {
  }
  .embed-box {
    overflow-x: hidden;
    overflow-y: scroll;
    width: 100%;
    flex: 1;
    max-height: 100%;
    position: relative;
    z-index: 1;
    .iframe-box {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1997;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #000;
    }
  }
}
</style>

<style lang="less">
// van-floating-bubble 会挂载到 body，使用页面唯一类保证 Teleport 后仍能命中样式
.embedded-floating-bubble {
  --van-floating-bubble-background: transparent;
  --van-floating-bubble-z-index: 1999;

  .dragger-box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-width: 0.1em;
    box-shadow: 0 0.15em 0.3em rgba(0, 0, 0, 0.16);
  }

  .dragger-box__icon {
    font-size: 2em;
  }

  .dragger-box__text {
    margin-top: 0.1em;
    font-size: 1em;
    line-height: 1.4;
  }
}
</style>
