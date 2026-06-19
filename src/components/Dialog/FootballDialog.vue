<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import LivePlayerDialog from './LivePlayerDialog.vue';
import { service } from '@/api/service';

defineOptions({
  name: 'FootballDialog',
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

const DEFAULT_TRIGGER_IMAGE = 'https://146.103.80.124:5001/siteadmin/upload/img/2065488521723949058.avif';

const btnPosition = ref({ x: 0, y: 400 });
const livePosition = ref(getDefaultLivePosition());
const showDialog = ref(false);
const ballDataList = ref<FootballBallData[]>([]);

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
    y: Math.max((window.innerHeight - liveHeight) / 2, 0),
  };
}

function centerLivePosition() {
  livePosition.value = getDefaultLivePosition();
}

async function init() {
  try {
    const res = await service.open.v1.home.footballData();
    const list = Array.isArray(res?.data) ? res.data : [];

    if (!res?.success || !list.length) {
      ballDataList.value = [];
      showDialog.value = false;
      return;
    }

    ballDataList.value = list;
    showDialog.value = true;
  } catch {
    ballDataList.value = [];
    showDialog.value = false;
  }
}

watch(showDialog, (visible) => {
  if (visible) {
    nextTick(() => centerLivePosition());
  }
});

onMounted(async () => {
  await init();
  if (showDialog.value) {
    nextTick(() => centerLivePosition());
  }
});

defineExpose({
  open,
  close,
});
</script>

<template>
  <div class="football-dialog">
    <van-floating-bubble v-if="!showDialog" v-model:offset="btnPosition" class="football-dialog__bubble" :gap="0">
      <button class="football-dialog__trigger" type="button" @click="open">
        <img :src="DEFAULT_TRIGGER_IMAGE" class="football-dialog__trigger-image" alt="直播入口" />
      </button>
    </van-floating-bubble>

    <van-floating-bubble v-if="showDialog" v-model:offset="livePosition" class="football-dialog__live" :gap="0" axis="xy">
      <live-player-dialog :match-list="ballDataList" @close="close" />
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

.football-dialog__live:active {
  opacity: unset !important;
}
</style>
