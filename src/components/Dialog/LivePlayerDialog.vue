<script lang="ts" setup>
import DPlayer from 'dplayer';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import useAppStore from '@/store/modules/app';

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

defineOptions({
  name: 'LivePlayerDialog'
});

interface Props {
  matchList?: FootballBallData[];
}

const props = withDefaults(defineProps<Props>(), {
  matchList: () => []
});
const emit = defineEmits(['close']);
const app = useAppStore();

const dialogRef = ref<HTMLElement | null>(null);
const livePlayerRef = ref<HTMLElement | null>(null);
let player: DPlayer | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
const activeIndex = ref(0);
const isShowDetail = ref(false);
const isPlaying = ref(false);
const isRefreshing = ref(false);
const isLoading = ref(false);
const isVideoReady = ref(false);

const activeMatchInfo = computed<FootballBallData | undefined>(() => {
  return props.matchList[activeIndex.value];
});

const activeLiveUrl = computed(() => {
  const liveUrlInfo = activeMatchInfo.value?.liveUrls?.find(item => item.url || item.url2);
  return liveUrlInfo?.url || liveUrlInfo?.url2 || '';
});

function onTapClose() {
  if (isShowDetail.value) {
    isShowDetail.value = false;
  } else {
    emit('close');
  }
}

function initPlayer() {
  if (!livePlayerRef.value || !activeLiveUrl.value) {
    isLoading.value = false;
    return;
  }

  startVideoLoading();
  player = new DPlayer({
    container: livePlayerRef.value,
    autoplay: true,
    airplay: true,
    screenshot: false,
    hotkey: true,
    live: true,
    mutex: false,
    theme: '#b7daff',
    volume: 0.7,
    video: {
      url: activeLiveUrl.value
    }
  });

  isPlaying.value = !player.video.paused && !player.video.ended;
  player.on('play', () => {
    isPlaying.value = true;
  });
  player.on('pause', () => {
    isPlaying.value = false;
  });
  player.on('ended', () => {
    isPlaying.value = false;
  });
  player.on('loadstart', () => {
    isLoading.value = true;
  });
  player.on('waiting', () => {
    isLoading.value = true;
  });
  player.on('stalled', () => {
    isLoading.value = true;
  });
  player.on('canplay', finishVideoLoading);
  player.on('playing', finishVideoLoading);
  player.on('error', handleVideoLoadError);
}

function togglePlayStatus() {
  if (!player) return;

  if (isPlaying.value) {
    player.pause();
    return;
  }

  player.play();
}

function startVideoLoading(refreshing = false) {
  isVideoReady.value = false;
  isLoading.value = true;
  isRefreshing.value = refreshing;
}

function finishVideoLoading() {
  isVideoReady.value = true;
  isLoading.value = false;
  stopRefresh();
}

function handleVideoLoadError() {
  isVideoReady.value = false;
  isLoading.value = false;
  stopRefresh();
}

function stopRefresh() {
  isRefreshing.value = false;
  if (!refreshTimer) return;

  clearTimeout(refreshTimer);
  refreshTimer = null;
}

function loadActiveMatch(refreshing = false) {
  if (!player || !activeLiveUrl.value) {
    handleVideoLoadError();
    return;
  }

  startVideoLoading(refreshing);
  player.switchVideo({
    url: activeLiveUrl.value
  });
  player.play();

  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  refreshTimer = setTimeout(() => {
    handleVideoLoadError();
  }, 10000);
}

function refreshPlayer() {
  if (isRefreshing.value) return;

  loadActiveMatch(true);
}

function switchActiveMatch(index: number) {
  if (index < 0 || index >= props.matchList.length) return;

  activeIndex.value = index;
  isShowDetail.value = false;
  loadActiveMatch();
}

function toggleScreen() {
  const target = dialogRef.value ?? livePlayerRef.value;
  if (!target) return;

  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };

  const fullscreenTarget = target as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };

  const currentFullscreenElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

  try {
    if (currentFullscreenElement) {
      const exitFullscreen =
        doc.exitFullscreen?.bind(doc) ||
        doc.webkitExitFullscreen?.bind(doc) ||
        doc.mozCancelFullScreen?.bind(doc) ||
        doc.msExitFullscreen?.bind(doc);

      exitFullscreen?.();
      return;
    }

    const requestFullscreen =
      fullscreenTarget.requestFullscreen?.bind(fullscreenTarget) ||
      fullscreenTarget.webkitRequestFullscreen?.bind(fullscreenTarget) ||
      fullscreenTarget.mozRequestFullScreen?.bind(fullscreenTarget) ||
      fullscreenTarget.msRequestFullscreen?.bind(fullscreenTarget);

    requestFullscreen?.();
  } catch (error) {
    console.error('[LivePlayerDialog] toggleScreen failed:', error);
  }
}

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  stopRefresh();
  player?.destroy();
  player = null;
});
</script>

<template>
  <div ref="dialogRef" class="live-player-dialog">
    <div class="live-player">
      <div ref="livePlayerRef" class="live-player__container"></div>
    </div>
    <div class="controls-overlay">
      <div v-if="!isVideoReady" class="live-player-cover"></div>
      <div v-if="isLoading" class="loading-box">
        <img
          class="loading-icon"
          src="https://146.103.80.124:5001/siteadmin/skin/lobby_asset/common/web/selfoperated-games/apng_loadingsjb.webp?manualVersion=1"
          alt="."
        />
      </div>
      <div class="live-player-overlay" v-if="isShowDetail"></div>
      <div class="panel" v-if="isShowDetail">
        <div class="main">
          <div class="main-title">
            <div class="decorate left"></div>
            <span class="league-name">其他赛事直播</span>
            <div class="decorate right"></div>
          </div>
          <div
            v-for="(item, index) in props.matchList"
            :key="item.matchId || index"
            class="item-box"
            :class="{ active: activeIndex === index }"
          >
            <img src="/siteadmin/live/apng_live_2.webp" alt="" srcset="" class="w-[30px] h-[14px]" />
            <div class="team-name">
              <div class="inner-team-name">{{ item.homeTeam?.teamName }}</div>
              <div class="team-logo">
                <img class="home-team-logo" :src="item.homeTeam?.teamIcon" alt="." />
                <span class="icon-vs">VS</span>
                <img class="home-team-logo" :src="item.awayTeam?.teamIcon" alt="." />
              </div>
              <div class="inner-team-name">{{ item.awayTeam?.teamName }}</div>
            </div>
            <div class="match-time">
              <span class="time">
                <span>{{ dayjs((item.startTime || 0) * 1000).format('HH:mm') }}</span>
                <span>{{ dayjs((item.startTime || 0) * 1000).format('MM/DD') }}</span>
              </span>
              <div class="status-icon" @click.stop="switchActiveMatch(index)">
                <svg-icon name="live-common_icon_sszx_play" v-if="activeIndex !== index" />
                <svg-icon name="live-common_icon_sszx_pause" v-if="activeIndex === index" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="close-icon" @click="onTapClose">
        <svg-icon name="live-icon_sszb_x1" />
      </div>
      <div class="live-player-top-bar" v-if="!isShowDetail || !isPlaying">
        <div class="live-player-top-bar__left" @click="isShowDetail = true">
          <svg-icon name="live-icon_sszb_cd1" />
        </div>
        <span class="live-player-top-bar__center">{{ app.appInfo.title }}</span>
        <div class="live-player-top-bar__right" @click="toggleScreen">
          <svg-icon name="live-icon_sszb_max1" />
        </div>
      </div>
      <div v-if="activeMatchInfo && !isShowDetail && !isPlaying" class="live-player-middle-area">
        <div class="match-info">
          <span class="match-info__teams">
            {{ activeMatchInfo.awayTeam?.teamName }} VS {{ activeMatchInfo.homeTeam?.teamName }}
          </span>
          <span class="match-info__time">{{ dayjs((activeMatchInfo.startTime || 0) * 1000).format('HH:mm') }}</span>
          <span class="match-info__live">
            <img class="live-badge" src="/siteadmin/live/apng_live_2.webp" alt="." />
            <span class="live-status">直播中</span>
          </span>
        </div>
      </div>
      <div class="live-player-bottom-bar" v-if="!isShowDetail">
        <div class="live-player-bottom-bar__left">
          <span class="play-toggle-icon" @click.stop="togglePlayStatus">
            <svg-icon v-if="!isPlaying" name="live-icon_sszb_play1" />
            <svg-icon v-else name="live-icon_sszb_pause1" />
          </span>
          <span class="refresh-icon" :class="{ 'is-refreshing': isRefreshing }" @click.stop="refreshPlayer">
            <svg-icon name="comm_icon_retry" class-name="text-[12px]" />
          </span>
        </div>
        <div class="live-player-bottom-bar__right"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.live-player-dialog {
  position: relative;
  width: 100%;
  height: 100%;
  .live-player {
    width: 100% !important;
    height: 100% !important;
  }
  .dplayer,
  .dplayer-video-wrap {
    width: 100% !important;
    height: 100% !important;
  }
  .dplayer {
    position: relative;
    overflow: hidden;
    user-select: none;
    line-height: 1;
  }
  .live-player__container .dplayer-controller,
  .live-player__container .dplayer-loading-icon,
  .live-player__container .dplayer-controller-mask,
  .live-player__container .dplayer-menu,
  .live-player__container .dplayer-notice {
    display: none !important;
  }
  .live-player__container .dplayer-controller,
  .live-player__container .dplayer-controller-mask,
  .live-player__container .dplayer-notice-list,
  .live-player__container .dplayer-bezel,
  .live-player__container .dplayer-play-icon,
  .live-player__container .dplayer-mobile-play,
  .live-player__container .dplayer-mask,
  .live-player__container .dplayer-menu,
  .live-player__container .dplayer-loading-icon,
  .live-player__container .live-player__loading,
  .live-player__container .live-player__fallback,
  .live-player__container .live-player__fallback-image,
  .live-player__container .live-player__fallback-text,
  .live-player__container .live-player__fallback-retry {
    display: none !important;
  }

  .controls-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 21;
    //pointer-events: none;
    .live-player-cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1;
      background-image: url('https://146.103.80.124:5001/siteadmin/upload/img/2065488501127143426.avif');
    }
    .loading-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      z-index: 5;
      .loading-icon {
        width: 30px;
        min-height: 30px;
        height: auto;
      }
    }
    .live-player-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 21;
    }
    .panel {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 21;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .main {
        height: 175px;
        overflow: scroll;
        .main-title {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          .decorate {
            position: relative;
            width: 4px;
            height: 4px;
            &::before {
              position: absolute;
              top: 0;
              left: 0;
              width: 4px;
              height: 4px;
              background-color: #fff;
              transform: rotate(45deg);
              content: '';
            }
            &::after {
              position: absolute;
              top: 50%;
              left: 0;
              width: 40px;
              height: 1px;
              background-image: linear-gradient(to right, rgba(255, 255, 255, 0) 1%, #fff 99%);
              content: '';
            }
            &.left {
              &::after {
                transform: translate(-100%) translateY(-50%);
              }
            }
            &.right {
              &::after {
                transform: translate(3.5px) translateY(-50%) rotate(180deg);
              }
            }
          }
          .league-name {
            margin: 0 6px;
            color: #fff;
            font-size: 11px;
            white-space: nowrap;
          }
        }
        .item-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 292px;
          height: 31px;
          margin: 0 auto 5px;
          padding: 0 7px;
          font-size: 8px !important;
          background-color: rgba(0, 0, 0, 0.5);
          border: solid thin rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          cursor: pointer;
          list-style: none;
          &.active {
            border-color: rgba(255, 255, 255, 0.8);
          }
          .team-name {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-width: 0;
            .inner-team-name {
              flex: none;
              vertical-align: middle;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              width: 61px;
              font-size: 10px;
              color: #fff;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              text-align: left;
              margin: 0 1px;
              &:first-child {
                text-align: right;
              }
            }
            .team-logo {
              display: flex;
              align-items: center;
              margin: 0 5px;
              .home-team-logo {
                border-radius: 50%;
                width: 15px;
                height: 15px;
              }
              .icon-vs {
                margin: 0 3px;
                font-size: 10px;
                color: #fff;
              }
            }
          }
          .match-time {
            display: flex;
            align-items: center;
            padding: 1px;
            .time {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              font-size: 10px;
              color: #fff;
            }
            .status-icon {
              font-size: 14px;
              color: #fff;
              margin-left: 7px;
            }
          }
        }
      }
    }
    .close-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 14px;
      cursor: pointer;
      color: #fff;
      z-index: 23;
    }
    .live-player-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 0;
      z-index: 21;
      pointer-events: auto;
      .live-player-top-bar__left {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 14px;
      }
      .live-player-top-bar__center {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translate(-50%);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 60%;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
      }
      .live-player-top-bar__right {
        position: absolute;
        top: 10px;
        right: 38px;
        display: flex;
        align-items: center;
        font-size: 14px;
      }
    }
    .live-player-middle-area {
      position: absolute;
      top: 40px;
      bottom: 50px;
      left: 0;
      right: 0;
      z-index: 21;
      cursor: pointer;
      padding-bottom: 15px;
      .match-info {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%);
        width: max-content;
        max-width: calc(100% - 20px);
        display: flex;
        align-items: center;
        padding: 5px 7px;
        box-sizing: border-box;
        color: #fff;
        font-size: 10px;
        white-space: nowrap;
        border-radius: 5px;
        border: 0.5px solid rgba(255, 255, 255, 0.5);
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2.5px);
        .match-info__teams {
          flex-shrink: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 15px;
          max-width: 155px;
        }
        .match-info__time {
          flex-shrink: 0;
          margin-right: 15px;
        }
        .match-info__live {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          .live-badge {
            height: 14px;
          }
          .live-status {
            font-size: 10px;
            margin-left: 2px;
          }
        }
      }
    }
    .live-player-bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      z-index: 21;
      pointer-events: none;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
      font-size: 14px;
      .live-player-bottom-bar__left {
        position: absolute;
        bottom: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        min-height: 25px;
        pointer-events: auto;
        .play-toggle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
        }
        .refresh-icon {
          font-size: 12px !important;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          margin-left: 15px;
          &.is-refreshing {
            animation: live-player-refresh-spin 1s linear infinite;
          }
        }
      }
      .live-player-bottom-bar__right {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        align-items: center;
      }
    }
  }
}
.live-player-dialog:fullscreen {
  .live-player-cover {
    height: 100% !important;
  }
}

@keyframes live-player-refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
