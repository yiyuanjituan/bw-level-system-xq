<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DPlayer from 'dplayer';

const position = ref({ x: 0, y: 400 });
const liveVideoRef = ref();

function onOpenDialog() {
  console.log('click');
}

onMounted(() => {
  const dp = new DPlayer({
    container: liveVideoRef.value,
    video: {
      url: 'https://global1.sportstrwv.com/sport/202_5106689_1.m3u8?auth_key=1781906085-0-0-b10582f4933cc45642d0ac07f880dfdd&siteCode=1091&pToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE4MjE4MDAsIm5iZiI6MTc4MTgxODIwMCwic3ViIjoie1wiYVwiOjIwMixcImJcIjo1MTA2Njg5LFwiY1wiOlwiMTA5MVwifSJ9.7pQ4TZhNxvSTUPbvhHmdRl7_td4m5dQbgIin7LF7dgM',
      autoplay: true,
      screenshot: true,
      lang: 'zh-cn',
      hotkey: true,
    }
  });
})

</script>

<template>
  <div>
    <van-floating-bubble class="football-dialog" :gap="0" v-model:offset="position">
      <img
        src="https://146.103.80.124:5001/siteadmin/upload/img/2065488521723949058.avif"
        @click="onOpenDialog"
        class="icon-img"
        alt=""
        srcset=""
      />
    </van-floating-bubble>

    <div class="live-player-box">
      <div ref="liveVideoRef"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.football-dialog {
  .icon-img {
    width: 100%;
    height: 100%;
  }
}
.live-player-box {

}
</style>

<style lang="less">
.football-dialog {
  overflow: visible !important;
  width: 25px !important;
  height: 81px !important;
}
</style>
