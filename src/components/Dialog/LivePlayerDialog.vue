<script lang="ts" setup>
import DPlayer from 'dplayer';
import { onMounted, ref } from 'vue';

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

const livePlayerRef = ref();
let player: DPlayer | null = null;

function initPlayer() {
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
      url: 'https://global1.sportstrwv.com/sport/202_5339838_1.m3u8?auth_key=1781944563-0-0-ff9feb6ede0d0493e6946f574179ec8a&siteCode=1091&pToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE4NTk5MjksIm5iZiI6MTc4MTg1NjMyOSwic3ViIjoie1wiYVwiOjIwMixcImJcIjo1MzM5ODM4LFwiY1wiOlwiMTA5MVwifSJ9.fWiqNRBTT2Ricp-UbmAZVONtSkdB0kGlISOOsvHPtxI',
      pic: 'https://146.103.80.124:5001/siteadmin/upload/img/2065488501127143426.avif' || undefined
    }
  });
}

onMounted(() => {
  initPlayer();
});
</script>

<template>
  <div class="live-player-dialog">
    <div class="live-player">
      <div ref="livePlayerRef" class="live-player__container"></div>
    </div>
    <div class="controls-overlay">
      <div class="live-player-cover"></div>
      <div class="loading-box">
        <img
          class="loading-icon"
          src="https://146.103.80.124:5001/siteadmin/skin/lobby_asset/common/web/selfoperated-games/apng_loadingsjb.webp?manualVersion=1"
          alt="."
        />
      </div>
      <div class="live-player-overlay"></div>
      <div class="panel">
        <div class="main">
          <div class="main-title">
            <div class="decorate left"></div>
            <span class="league-name">其他赛事直播</span>
            <div class="decorate right"></div>
          </div>
          <div class="item-box" v-for="(item, index) in props.matchList" :key="index">
            <div class="team-name">
              <span class="inner-team-name">{{ item.homeTeam.teamName }}</span>
              <div class="team-logo">
                <img class="home-team-logo" :src="item.homeTeam.teamIcon" alt="." />
                <span class="icon-vs">VS</span>
                <img class="home-team-logo" :src="item.awayTeam.teamIcon" alt="." />
              </div>
              <span class="_inner-team-name_1gf2n_163">{{ item.awayTeam.teamName }}</span>
            </div>
          </div>
        </div>
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
          width: 290px;
          height: 31px;
          margin: 0 auto 5px;
          padding: 0 7.5px;
          font-size: 8px !important;
          background-color: rgba(0, 0, 0, 0.5);
          border: solid thin rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          cursor: pointer;
          list-style: none;
          .team-name {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-width: 0;
            .inner-team-name {
              vertical-align: middle;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              width: 60px;
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
        }
      }
    }
  }
}
</style>
