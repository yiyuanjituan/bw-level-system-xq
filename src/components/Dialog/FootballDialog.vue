<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import LivePlayerDialog from './LivePlayerDialog.vue';
import { service } from '@/api/service';

defineOptions({
  name: 'FootballDialog'
});

const btnPosition = ref({ x: 0, y: 400 });
const livePosition = ref(getDefaultLivePosition());
const showDialog = ref(true);


interface Props {
  title?: string;
  matchTitle?: string;
  elapsedTime?: string;
  language?: string;
  quality?: string;
  liveText?: string;
  url?: string;
  poster?: string;
  triggerImage?: string;
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '足球热点',
  matchTitle: '加色大 VS 卡塔尔',
  elapsedTime: '06:00',
  language: '中文 2',
  quality: '高清',
  liveText: '直播中',
  url: 'https://global1.sportstrwv.com/sport/202_5106689_1.m3u8?auth_key=1781906590-0-0-6697c52ce0b71d970a8d509b4dabd4f9&siteCode=2033&pToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE4MjE5ODEsIm5iZiI6MTc4MTgxODM4MSwic3ViIjoie1wiYVwiOjIwMixcImJcIjo1MTA2Njg5LFwiY1wiOlwiMjAzM1wifSJ9.KXqhaoS98ZTbnUXdJpVWtsVQn7Ebacfk_9qKOL8tO9M',
  poster: '',
  triggerImage: 'https://146.103.80.124:5001/siteadmin/upload/img/2065488521723949058.avif',
  defaultOpen: false
});



function open() {
  showDialog.value = true;
}

function close() {
  showDialog.value = false;
}

function getDefaultLivePosition() {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  const liveElement = document.querySelector<HTMLElement>('.football-dialog__live');
  const liveRect = liveElement?.getBoundingClientRect();
  const liveWidth = liveRect?.width ?? window.innerWidth * (345 / 375);
  const liveHeight = liveRect?.height ?? window.innerWidth * (197 / 375);

  return {
    x: Math.max((window.innerWidth - liveWidth) / 2, 0),
    y: Math.max((window.innerHeight - liveHeight) / 2, 0)
  };
}

function centerLivePosition() {
  livePosition.value = getDefaultLivePosition();
}

function init() {
  service.open.v1.home.footballData().then(res => {
    if (res.success && res.data?.hasLive) {
      console.log(res.data);
    }
  })
}

watch(showDialog, visible => {
  if (visible) {
    nextTick(() => centerLivePosition());
  }
});

onMounted(() => {
  init();
  if (showDialog.value) {
    nextTick(() => centerLivePosition());
  }
});

defineExpose({
  open,
  close
});
</script>

<template>
  <div class="football-dialog">
    <van-floating-bubble v-model:offset="btnPosition" class="football-dialog__bubble" :gap="0" v-if="!showDialog">
      <button class="football-dialog__trigger" type="button" @click="open">
        <img :src="triggerImage" class="football-dialog__trigger-image" alt="直播入口" />
      </button>
    </van-floating-bubble>

    <van-floating-bubble v-model:offset="livePosition" class="football-dialog__live" :gap="0" v-if="showDialog" axis="xy">
      <live-player-dialog
        v-model:show="showDialog"
        :title="title"
        :match-title="matchTitle"
        :elapsed-time="elapsedTime"
        :language="language"
        :quality="quality"
        :live-text="liveText"
        :url="url"
        :poster="poster"
        @close="close"
      />
    </van-floating-bubble>
  </div>
</template>

<style scoped lang="less">
.football-dialog {
  &__trigger {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  &__trigger-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>

<style lang="less">
.football-dialog__bubble {
  overflow: visible !important;
  width: 25px !important;
  height: 81px !important;
  z-index: 1998 !important;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.22));
}
.football-dialog__live {
  width: 345px !important;
  height: 197px !important;
  overflow: visible !important;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.22));
}
.van-floating-bubble:active {
  opacity: unset !important;
}
</style>
