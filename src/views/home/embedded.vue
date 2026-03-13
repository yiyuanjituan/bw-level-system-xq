<script setup lang="ts">
import useDataStore from "@/store/modules/data";
import { onMounted, ref } from "vue";
import router from "@/router";
import { getGameUrl } from "@/api/common";
import { isFullscreen, toggleFullScreen } from "@/utils/site";
import { handleBack } from "@/utils/common";

const appData = useDataStore();
const showLoading = ref<boolean>(true);
const url = ref<any>('')
const offset = ref({ x: 1.5, y: 1.5 })

const replaceToHome = () => {
  if (isFullscreen()) {
    toggleFullScreen()
  }
  router.replace(window.history.state.back)
}

onMounted(() => {
  if (!appData.enterGameInfo.gameId && !appData.enterGameInfo.venueId) {
    return router.replace('/index')
  }
  // 选择
  getGameUrl(appData.enterGameInfo).then((res) => {
    url.value = res.url
    showLoading.value = false
    toggleFullScreen()
  }).catch((e) => {
    if (e.status === 401) return false;
    setTimeout(() => {
      return router.back()
    }, 1000)
  })
})
</script>

<template>
  <div class="embedded-container">
    <div class="show-loading-box" v-if="showLoading">
      <img src="/siteadmin/skin/lobby_asset/apng_loading_game.png" class="w-[90px] h-[90px]" alt="" />
    </div>
    <div v-if="!showLoading && url" class="embed-box">
      <div class="iframe-box">
        <iframe class="iframe-box" allow="clipboard-write; clipboard-read; web-share; autoplay; encrypted-media" :src="url"></iframe>
      </div>
      <van-floating-bubble axis="xy" :gap="0" @click="replaceToHome" v-model:offset="offset">
        <template #default>
          <div class="dragger-box">
            <svg-icon name="game_2_style_1_zk" class-name="text-[20px]" />
            <div class="text-[10px] text">首页</div>
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