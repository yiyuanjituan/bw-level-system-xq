<script setup lang="ts">
import DPlayer from 'dplayer';
import Hls from 'hls.js';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'LivePlayerDialog',
});

interface TeamInfo {
  teamLogo?: string;
  teamIcon?: string;
  teamName?: string;
  teamId?: string;
}

interface LiveUrlInfo {
  id?: string | null;
  url?: string;
  url2?: string;
  isPro?: number | string | null;
  language?: string;
  weight?: number | null;
}

interface SeriesInfo {
  seriesId?: string;
  seriesName?: string | null;
  leagueName?: string | null;
  leagueIcon?: string;
  leagueLogo?: string;
  leagueId?: string;
}

interface FootballBallData {
  tokenExpiresAt?: number | null;
  homeTeam?: TeamInfo;
  awayTeam?: TeamInfo;
  liveUrls?: LiveUrlInfo[];
  winTeamId?: string;
  statusDesc?: string;
  series?: SeriesInfo;
  status?: number;
  hasLive?: number;
  endTime?: number;
  matchId?: string;
  startTime?: number;
  teamScores?: unknown;
}

interface Props {
  show?: boolean;
  ballData?: FootballBallData | null;
  matchList?: FootballBallData[];
  currentMatchIndex?: number;
  currentLiveIndex?: number;
  width?: string;
  closeOnClickOverlay?: boolean;
  zIndex?: number | string;
}

const DEFAULT_POSTER = '/siteadmin/temp/img_sszb_bg2.avif';
const LANGUAGE_MAP: Record<string, string> = {
  zh_CN: '中文',
  zh_TW: '繁中',
  en_US: 'English',
};

const props = withDefaults(defineProps<Props>(), {
  show: false,
  ballData: null,
  matchList: () => [],
  currentMatchIndex: 0,
  currentLiveIndex: 0,
  width: '345px',
  closeOnClickOverlay: true,
  zIndex: 1998,
});

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
  (e: 'update:currentMatchIndex', value: number): void;
  (e: 'update:currentLiveIndex', value: number): void;
}>();

const shellRef = ref<HTMLElement | null>(null);
const playerRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const hasError = ref(false);
const isMuted = ref(false);
const isPaused = ref(false);
const isFullscreen = ref(false);
const showCover = ref(true);
const showMenuPanel = ref(false);

let player: DPlayer | null = null;
let hls: Hls | null = null;

const dialogStyle = computed(() => ({ width: props.width }));
const matchOptions = computed(() => props.matchList ?? []);
const liveOptions = computed(() => props.ballData?.liveUrls ?? []);
const normalizedLiveIndex = computed(() => {
  if (!liveOptions.value.length)
    return 0;

  return Math.min(Math.max(props.currentLiveIndex, 0), liveOptions.value.length - 1);
});
const activeLive = computed(() => liveOptions.value[normalizedLiveIndex.value] ?? null);
const streamUrl = computed(() => activeLive.value?.url || activeLive.value?.url2 || '');
const leagueName = computed(() => props.ballData?.series?.leagueName || props.ballData?.series?.seriesName || '足球直播');
const seriesName = computed(() => props.ballData?.series?.seriesName || '');
const homeTeamName = computed(() => props.ballData?.homeTeam?.teamName || '主队');
const awayTeamName = computed(() => props.ballData?.awayTeam?.teamName || '客队');
const matchTitle = computed(() => `${homeTeamName.value} VS ${awayTeamName.value}`);
const liveText = computed(() => props.ballData?.statusDesc || '直播中');
const poster = computed(() => {
  return (
    props.ballData?.series?.leagueLogo
    || props.ballData?.series?.leagueIcon
    || props.ballData?.homeTeam?.teamLogo
    || DEFAULT_POSTER
  );
});
const leagueLogo = computed(() => props.ballData?.series?.leagueIcon || props.ballData?.series?.leagueLogo || '');
const homeTeamLogo = computed(() => props.ballData?.homeTeam?.teamLogo || props.ballData?.homeTeam?.teamIcon || '');
const awayTeamLogo = computed(() => props.ballData?.awayTeam?.teamLogo || props.ballData?.awayTeam?.teamIcon || '');
const menuTitle = computed(() => seriesName.value || leagueName.value);
const languageLabel = computed(() => {
  const rawLanguage = activeLive.value?.language || '';
  return LANGUAGE_MAP[rawLanguage] || rawLanguage || '默认';
});
const lineLabel = computed(() => `线路${normalizedLiveIndex.value + 1}`);
const startDateLabel = computed(() => formatTime(props.ballData?.startTime, { month: '2-digit', day: '2-digit' }));
const startTimeLabel = computed(() => formatTime(props.ballData?.startTime, { hour: '2-digit', minute: '2-digit', hour12: false }));
const startDateTimeLabel = computed(() => formatTime(props.ballData?.startTime, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}));

function formatTime(
  timestamp?: number,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!timestamp)
    return '--';

  return new Intl.DateTimeFormat('zh-CN', options).format(new Date(timestamp * 1000));
}

function getLiveOptionLabel(item: LiveUrlInfo, index: number) {
  const language = LANGUAGE_MAP[item.language || ''] || item.language || '默认';
  return `${language} ${index + 1}`;
}

function getMatchOptionLabel(item: FootballBallData) {
  const home = item.homeTeam?.teamName || '主队';
  const away = item.awayTeam?.teamName || '客队';
  return `${home} VS ${away}`;
}

function closeDialog() {
  emit('update:show', false);
  emit('close');
}

function toggleMenuPanel() {
  showMenuPanel.value = !showMenuPanel.value;
}

function switchMatch(index: number) {
  if (index === props.currentMatchIndex)
    return;

  emit('update:currentMatchIndex', index);
  emit('update:currentLiveIndex', 0);
}

function switchLine(index: number) {
  if (index === normalizedLiveIndex.value)
    return;

  emit('update:currentLiveIndex', index);
}

function cycleLine() {
  if (liveOptions.value.length <= 1)
    return;

  const nextIndex = (normalizedLiveIndex.value + 1) % liveOptions.value.length;
  emit('update:currentLiveIndex', nextIndex);
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
  console.log('initPlayer', streamUrl.value);
  if (!props.show || !playerRef.value || !streamUrl.value)
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
      url: streamUrl.value,
      pic: poster.value || undefined,
      type: Hls.isSupported() ? 'customHls' : 'auto',
      customType: {
        customHls(video: HTMLVideoElement) {
          createHlsPlayer(video, streamUrl.value);
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
      showMenuPanel.value = false;
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
  () => streamUrl.value,
  async () => {
    if (!props.show || !streamUrl.value)
      return;

    await nextTick();
    await initPlayer();
  },
);

watch(
  () => liveOptions.value.length,
  (length) => {
    if (length && props.currentLiveIndex >= length) {
      emit('update:currentLiveIndex', 0);
    }
  },
);

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

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
              <div class="live-player-dialog__top-left">
                <button
                  class="live-player-dialog__icon-button live-player-dialog__menu-button"
                  type="button"
                  aria-label="menu"
                  :class="{ 'is-active': showMenuPanel }"
                  @click="toggleMenuPanel"
                >
                  <svg-icon name="live-icon_sszb_cd1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--menu" />
                </button>
              </div>

              <div class="live-player-dialog__top-center">{{ leagueName }}</div>

              <div class="live-player-dialog__top-right">
                <button class="live-player-dialog__icon-button" type="button" aria-label="fullscreen" @click="toggleFullscreen">
                  <svg-icon name="live-icon_sszb_max1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--fullscreen" />
                </button>
                <button class="live-player-dialog__icon-button" type="button" aria-label="close" @click="closeDialog">
                  <svg-icon name="live-icon_sszb_x1" class-name="live-player-dialog__icon-svg live-player-dialog__icon-svg--close" />
                </button>
              </div>

              <transition name="live-player-dialog__menu-fade">
                <div v-if="showMenuPanel" class="live-player-dialog__menu-panel">
                  <div class="live-player-dialog__menu-header">
                    <div class="live-player-dialog__menu-league">
                      <img v-if="leagueLogo" :src="leagueLogo" class="live-player-dialog__menu-league-logo" alt="" />
                      <span>{{ leagueName }}</span>
                    </div>
                    <span class="live-player-dialog__menu-badge">{{ liveText }}</span>
                  </div>

                  <div class="live-player-dialog__menu-match">
                    <div class="live-player-dialog__team-card">
                      <img v-if="homeTeamLogo" :src="homeTeamLogo" class="live-player-dialog__team-logo" alt="" />
                      <span class="live-player-dialog__team-name">{{ homeTeamName }}</span>
                    </div>

                    <div class="live-player-dialog__menu-vs">
                      <span class="live-player-dialog__menu-vs-text">VS</span>
                      <span class="live-player-dialog__menu-vs-date">{{ startDateLabel }}</span>
                      <span class="live-player-dialog__menu-vs-time">{{ startTimeLabel }}</span>
                    </div>

                    <div class="live-player-dialog__team-card">
                      <img v-if="awayTeamLogo" :src="awayTeamLogo" class="live-player-dialog__team-logo" alt="" />
                      <span class="live-player-dialog__team-name">{{ awayTeamName }}</span>
                    </div>
                  </div>

                  <div class="live-player-dialog__menu-content">
                    <div class="live-player-dialog__menu-title">{{ menuTitle }}</div>

                    <div class="live-player-dialog__menu-grid">
                      <div class="live-player-dialog__menu-item">
                        <span>比赛ID</span>
                        <strong>{{ ballData?.matchId || '--' }}</strong>
                      </div>
                      <div class="live-player-dialog__menu-item">
                        <span>状态</span>
                        <strong>{{ liveText }}</strong>
                      </div>
                      <div class="live-player-dialog__menu-item live-player-dialog__menu-item--wide">
                        <span>开赛时间</span>
                        <strong>{{ startDateTimeLabel }}</strong>
                      </div>
                      <div class="live-player-dialog__menu-item">
                        <span>语言</span>
                        <strong>{{ languageLabel }}</strong>
                      </div>
                    </div>

                    <div v-if="matchOptions.length > 1" class="live-player-dialog__section">
                      <div class="live-player-dialog__section-title">比赛切换</div>
                      <div class="live-player-dialog__chip-list">
                        <button
                          v-for="(item, index) in matchOptions"
                          :key="item.matchId || index"
                          class="live-player-dialog__line-chip"
                          :class="{ 'is-active': index === currentMatchIndex }"
                          type="button"
                          @click="switchMatch(index)"
                        >
                          {{ getMatchOptionLabel(item) }}
                        </button>
                      </div>
                    </div>

                    <div v-if="liveOptions.length" class="live-player-dialog__section">
                      <div class="live-player-dialog__section-title">线路切换</div>
                      <div class="live-player-dialog__chip-list">
                        <button
                          v-for="(item, index) in liveOptions"
                          :key="item.url || item.url2 || index"
                          class="live-player-dialog__line-chip"
                          :class="{ 'is-active': index === normalizedLiveIndex }"
                          type="button"
                          @click="switchLine(index)"
                        >
                          {{ getLiveOptionLabel(item, index) }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="live-player-dialog__middle-area">
              <div class="live-player-dialog__detail-pill">
                <span class="live-player-dialog__detail-title">{{ matchTitle }}</span>
                <span class="live-player-dialog__detail-time">{{ startTimeLabel }}</span>
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
                <button class="live-player-dialog__selector" type="button" :disabled="liveOptions.length <= 1" @click="cycleLine">
                  <span>{{ lineLabel }}</span>
                  <span class="live-player-dialog__selector-caret" />
                </button>
                <button class="live-player-dialog__selector live-player-dialog__selector--static" type="button">
                  <span>{{ languageLabel }}</span>
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

  &__cover::after {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5, 16, 42, 0.8) 0%, rgba(8, 15, 28, 0.42) 48%, rgba(5, 9, 18, 0.8) 100%);
    content: '';
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

  &__top-left {
    position: absolute;
    top: 9px;
    left: 10px;
  }

  &__menu-button {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.26);
    transition: background 0.2s ease;
  }

  &__menu-button.is-active {
    background: rgba(255, 255, 255, 0.18);
  }

  &__top-center {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 52%;
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

  &__menu-panel {
    position: absolute;
    top: 34px;
    left: 10px;
    width: 230px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    background: rgba(7, 16, 34, 0.86);
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  }

  &__menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__menu-league {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.96);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__menu-league-logo {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__menu-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 7px;
    border-radius: 999px;
    background: rgba(36, 183, 90, 0.18);
    color: #b8ffd1;
    font-size: 10px;
    flex-shrink: 0;
  }

  &__menu-match {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
  }

  &__team-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  &__team-logo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.12);
  }

  &__team-name {
    max-width: 72px;
    overflow: hidden;
    color: #fff;
    font-size: 11px;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
  }

  &__menu-vs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    color: rgba(255, 255, 255, 0.72);
  }

  &__menu-vs-text {
    color: #f9d778;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  &__menu-vs-date,
  &__menu-vs-time {
    font-size: 10px;
    line-height: 1.2;
  }

  &__menu-content {
    margin-top: 12px;
  }

  &__menu-title {
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
    text-align: center;
  }

  &__menu-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  &__menu-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 7px 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
  }

  &__menu-item--wide {
    grid-column: span 2;
  }

  &__menu-item span {
    color: rgba(255, 255, 255, 0.58);
    font-size: 10px;
    line-height: 1;
  }

  &__menu-item strong {
    overflow: hidden;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__section {
    margin-top: 10px;
  }

  &__section-title {
    margin-bottom: 6px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 10px;
    line-height: 1;
  }

  &__chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__line-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    max-width: 100%;
    height: 26px;
    padding: 0 10px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.84);
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
  }

  &__line-chip.is-active {
    border-color: rgba(250, 220, 122, 0.55);
    background: rgba(250, 220, 122, 0.12);
    color: #f9d778;
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

  &__selector:disabled {
    opacity: 0.65;
    cursor: default;
  }

  &__selector--static {
    cursor: default;
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

  :deep(.live-player-dialog__icon-svg--menu) {
    width: 15px;
    height: 15px;
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

  &__menu-fade-enter-active,
  &__menu-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  &__menu-fade-enter-from,
  &__menu-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
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
