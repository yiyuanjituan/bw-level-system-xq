<script setup lang="ts">
import DPlayer from 'dplayer';
import Hls from 'hls.js';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

defineOptions({
  name: 'LivePlayerDialog',
});

interface Props {
  show?: boolean;
  title?: string;
  matchTitle?: string;
  url?: string;
  poster?: string;
  width?: string;
  elapsedTime?: string;
  language?: string;
  quality?: string;
  liveText?: string;
  closeOnClickOverlay?: boolean;
  zIndex?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '足球热点',
  matchTitle: '加色大 VS 卡塔尔',
  url: 'https://global1.sportstrwv.com/sport/202_5106689_1.m3u8?auth_key=1781910122-0-0-df2fc9b56e506f0a086644de9a670d38&siteCode=1091&pToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE4MjU2MzgsIm5iZiI6MTc4MTgyMjAzOCwic3ViIjoie1wiYVwiOjIwMixcImJcIjo1MTA2Njg5LFwiY1wiOlwiMTA5MVwifSJ9.l9IExVH8hK-a1lXai8sv_qPu9eGIx6b-4YfpUCxIK00',
  poster: 'https://146.103.80.124:5001/siteadmin/upload/img/2065488501127143426.avif',
  width: '345px',
  elapsedTime: '06:00',
  language: '中文 2',
  quality: '高清',
  liveText: '直播中',
  closeOnClickOverlay: true,
  zIndex: 1998,
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
}>();

const shellRef = ref<HTMLElement | null>(null);
const playerRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const hasError = ref(false);
const isMuted = ref(false);
const isPaused = ref(false);
const isFullscreen = ref(false);
const showCover = ref(true);

let player: DPlayer | null = null;
let hls: Hls | null = null;

const dialogStyle = computed(() => ({ width: props.width }));

function closeDialog() {
  emit('update:show', false);
  emit('close');
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

function destroyPlayer() {
  hls?.destroy();
  hls = null;
  player?.destroy();
  player = null;
  isLoading.value = true;
  hasError.value = false;
  isMuted.value = false;
  isPaused.value = false;
  showCover.value = true;
}

function createHlsPlayer(video: HTMLVideoElement, url: string) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    return;
  }

  if (!Hls.isSupported())
    return;

  hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
  });
  hls.loadSource(url);
  hls.attachMedia(video);
}

function bindPlayerEvents(instance: DPlayer) {
  instance.on('loadstart', () => {
    isLoading.value = true;
    hasError.value = false;
    showCover.value = true;
  });
  instance.on('loadedmetadata', () => {
    isLoading.value = false;
  });
  instance.on('playing', () => {
    isLoading.value = false;
    hasError.value = false;
    isPaused.value = false;
    showCover.value = false;
  });
  instance.on('pause', () => {
    isPaused.value = true;
  });
  instance.on('error', () => {
    isLoading.value = false;
    hasError.value = true;
  });
}

async function initPlayer() {
  if (!props.show || !playerRef.value)
    return;

  destroyPlayer();
  isLoading.value = true;
  hasError.value = false;

  player = new DPlayer({
    container: playerRef.value,
    autoplay: true,
    airplay: true,
    screenshot: false,
    hotkey: true,
    live: true,
    mutex: false,
    theme: '#b7daff',
    volume: 0.7,
    video: {
      url: props.url,
      pic: props.poster || undefined,
      type: Hls.isSupported() ? 'customHls' : 'auto',
      customType: {
        customHls(video: HTMLVideoElement) {
          createHlsPlayer(video, props.url);
        },
      },
    },
  });

  bindPlayerEvents(player);
}

function toggleMute() {
  if (!player)
    return;

  isMuted.value = !isMuted.value;
  player.video.muted = isMuted.value;
}

function togglePlay() {
  if (!player)
    return;

  if (player.video.paused) {
    player.play();
    return;
  }

  player.pause();
}

async function toggleFullscreen() {
  if (!shellRef.value)
    return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await shellRef.value.requestFullscreen();
}

async function reloadPlayer() {
  await nextTick();
  await initPlayer();
}

watch(
  () => props.show,
  async (show) => {
    if (!show) {
      destroyPlayer();
      if (document.fullscreenElement)
        await document.exitFullscreen();
      return;
    }

    await nextTick();
    await initPlayer();
  },
);

watch(
  () => props.url,
  async () => {
    if (!props.show)
      return;

    await nextTick();
    await initPlayer();
  },
);

document.addEventListener('fullscreenchange', handleFullscreenChange);

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  destroyPlayer();
});
</script>

<template>
  <x-popup
    :show="show"
    position="center"
    :z-index="zIndex"
    :close-on-click-overlay="closeOnClickOverlay"
    @update:show="value => emit('update:show', value)"
    @close="closeDialog"
  >
    <section class="live-player-dialog" :style="dialogStyle">
      <div class="live-player-dialog__frame">
        <div ref="shellRef" class="live-player-dialog__container" :class="{ 'is-fullscreen': isFullscreen }">
          <div
            v-if="poster"
            class="live-player-dialog__cover"
            :class="{ 'is-hidden': !showCover }"
            :style="{ backgroundImage: `url(${poster})` }"
          />

          <div ref="playerRef" class="live-player-dialog__player" />

          <div class="live-player-dialog__controls">
            <div class="live-player-dialog__top-bar">
              <div class="live-player-dialog__top-center">{{ title }}</div>
              <div class="live-player-dialog__top-right">
                <button class="live-player-dialog__icon-button" type="button" aria-label="fullscreen" @click="toggleFullscreen">
                  <svg-icon name="live-icon_sszb_max1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--fullscreen" />
                </button>
                <button class="live-player-dialog__icon-button" type="button" aria-label="close" @click="closeDialog">
                  <svg-icon name="live-icon_sszb_x1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--close" />
                </button>
              </div>
            </div>

            <div class="live-player-dialog__middle-area">
              <div class="live-player-dialog__detail-pill">
                <span class="live-player-dialog__detail-title">{{ matchTitle }}</span>
                <span class="live-player-dialog__detail-time">{{ elapsedTime }}</span>
                <span class="live-player-dialog__live-badge">LIVE</span>
                <span class="live-player-dialog__detail-status">{{ liveText }}</span>
              </div>
            </div>

            <div class="live-player-dialog__bottom-bar">
              <div class="live-player-dialog__bottom-left">
                <button class="live-player-dialog__icon-button" type="button" :aria-label="isPaused ? 'play' : 'pause'" @click="togglePlay">
                  <svg-icon
                    :name="isPaused ? 'live-icon_sszb_play1' : 'live-icon_sszb_pause1'"
                    class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--play"
                  />
                </button>
                <button class="live-player-dialog__icon-button" type="button" aria-label="reload" @click="reloadPlayer">
                  <svg-icon name="live-icon_sszb_sy1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--retry" />
                </button>
              </div>

              <div class="live-player-dialog__bottom-right">
                <button class="live-player-dialog__selector" type="button">
                  <span>{{ language }}</span>
                  <span class="live-player-dialog__selector-caret" />
                </button>
                <button class="live-player-dialog__selector" type="button">
                  <span>{{ quality }}</span>
                  <span class="live-player-dialog__selector-caret" />
                </button>
                <button class="live-player-dialog__icon-button" type="button" :aria-label="isMuted ? 'unmute' : 'mute'" @click="toggleMute">
                  <svg-icon
                    name="live-icon_sszb_jy1"
                    class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--volume"
                    :class="{ 'is-muted': isMuted }"
                  />
                </button>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="live-player-dialog__state live-player-dialog__state--loading">
            <div class="live-player-dialog__spinner" />
          </div>

          <div v-if="hasError" class="live-player-dialog__state live-player-dialog__state--error">
            <div class="live-player-dialog__error-text">直播加载失败</div>
            <x-button type="primary" size="small" @click="reloadPlayer">重试</x-button>
          </div>
        </div>
      </div>
    </section>
  </x-popup>
</template>

<style scoped lang="less">
.live-player-dialog {
  color: #fff;
  font-size: 12px;

  &__frame {
    background: #000;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  &__container {
    position: relative;
    width: 100%;
    height: 197px;
    background: #000;
    overflow: hidden;
  }

  &__cover {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  &__cover.is-hidden {
    opacity: 0;
  }

  &__player {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;

    :deep(video) {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      background: #000;
    }

    :deep(.dplayer),
    :deep(.dplayer-video-wrap) {
      width: 100% !important;
      height: 100% !important;
    }

    :deep(.dplayer-controller),
    :deep(.dplayer-controller-mask),
    :deep(.dplayer-notice-list),
    :deep(.dplayer-bezel),
    :deep(.dplayer-play-icon),
    :deep(.dplayer-mobile-play),
    :deep(.dplayer-mask),
    :deep(.dplayer-menu),
    :deep(.dplayer-loading-icon),
    :deep(.dplayer-bar-wrap),
    :deep(.dplayer-info-panel) {
      display: none !important;
    }
  }

  &__controls {
    position: absolute;
    inset: 0;
    z-index: 21;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  &__top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
  }

  &__top-center {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 60%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #fff;
    font-size: 12px;
    line-height: 1;
    text-align: center;
  }

  &__top-right {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__middle-area {
    position: absolute;
    top: 40px;
    right: 0;
    bottom: 50px;
    left: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 15px;
    pointer-events: none;
  }

  &__detail-pill {
    display: inline-flex;
    align-items: center;
    max-width: calc(100% - 40px);
    height: 27px;
    padding: 0 12px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.58);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
    gap: 10px;
    pointer-events: auto;
  }

  &__detail-title {
    min-width: 0;
    max-width: 110px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
  }

  &__detail-time {
    color: rgba(255, 255, 255, 0.9);
    font-size: 10px;
    line-height: 1;
    flex-shrink: 0;
  }

  &__live-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 14px;
    padding: 0 6px;
    border: 1px solid rgba(144, 255, 181, 0.55);
    border-radius: 999px;
    background: rgba(69, 166, 96, 0.22);
    color: #eaffef;
    font-size: 9px;
    font-weight: 600;
    line-height: 1;
    flex-shrink: 0;
  }

  &__detail-status {
    color: rgba(255, 255, 255, 0.96);
    font-size: 10px;
    line-height: 1;
    flex-shrink: 0;
  }

  &__bottom-bar {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 50px;
    z-index: 21;
    pointer-events: none;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
  }

  &__bottom-left,
  &__bottom-right {
    position: absolute;
    bottom: 10px;
    display: flex;
    align-items: center;
    min-height: 25px;
    pointer-events: auto;
  }

  &__bottom-left {
    left: 10px;
    gap: 15px;
  }

  &__bottom-right {
    right: 10px;
    gap: 8px;
  }

  &__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: none;
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__selector {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 25px;
    padding: 0 10px 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.32);
    color: #fff;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
  }

  &__selector-caret {
    width: 0;
    height: 0;
    border-top: 4px solid #fff;
    border-right: 3px solid transparent;
    border-left: 3px solid transparent;
    opacity: 0.9;
  }

  :deep(.live-player-dialog__icon-svg) {
    color: currentColor;
  }

  :deep(.live-player-dialog__icon-svg--fullscreen),
  :deep(.live-player-dialog__icon-svg--close),
  :deep(.live-player-dialog__icon-svg--retry) {
    width: 14px;
    height: 14px;
  }

  :deep(.live-player-dialog__icon-svg--play) {
    width: 14.5px;
    height: 14.5px;
  }

  :deep(.live-player-dialog__icon-svg--volume) {
    width: 16px;
    height: 16px;
  }

  :deep(.live-player-dialog__icon-svg.is-muted) {
    opacity: 0.58;
  }

  &__state {
    position: absolute;
    inset: 0;
    z-index: 25;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  &__state--loading {
    pointer-events: none;
  }

  &__state--error {
    background: rgba(0, 0, 0, 0.45);
  }

  &__spinner {
    width: 17px;
    height: 17px;
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    border-top-color: #b7daff;
    border-radius: 50%;
    animation: live-player-spin 0.8s linear infinite;
  }

  &__error-text {
    color: #fff;
    font-size: 12px;
  }

  &__container.is-fullscreen {
    background: #000;

    :deep(video) {
      object-fit: contain !important;
    }
  }

  :deep(.x-button) {
    min-width: 36px;
  }
}

@keyframes live-player-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
