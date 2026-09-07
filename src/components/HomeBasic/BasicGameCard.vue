<script setup lang="ts">
import { computed, ref } from 'vue';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import { setMomentsGameFavorite } from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import { $t } from '@/locales';
import useAuthStore from '@/store/modules/user';
import type { HomeGameRecord } from '@/components/Home/types';
import { getHomeGameImage, shouldShowHomeGameName } from '@/components/Home/types';
import favoriteOffIcon from '@/assets/home/btn_sc_off_2.avif';
import favoriteOnIcon from '@/assets/home/btn_sc_on_2.avif';
import maintenanceIcon from '@/assets/home/u-series/img_whz_style_1.png';
import { openLoginEntry } from '@/utils/login';

defineOptions({
  name: 'BasicGameCard'
});

const props = withDefaults(
  defineProps<{
    game: HomeGameRecord;
    imageDisplay?: 'square' | 'long';
    highlightKeyword?: string;
  }>(),
  {
    imageDisplay: 'square',
    highlightKeyword: ''
  }
);

const emit = defineEmits<{
  (event: 'select', game: HomeGameRecord): void;
  (event: 'disabled', game: HomeGameRecord): void;
  (event: 'favorite-change', game: HomeGameRecord, favorite: boolean): void;
}>();

const auth = useAuthStore();
const pendingFavoriteEntryKeys = ref<string[]>([]);

const gameImage = computed(() => getHomeGameImage(props.game, props.imageDisplay));
const showName = computed(() => Boolean(props.game.name) && shouldShowHomeGameName(props.game));
const isDisabled = computed(() => Number(props.game.isOpen) === 0);

// 与场馆/子游戏收藏一致的入口归一：venue/game 决定 entryId，entryKey 用于防重复提交。
const favoriteEntry = computed(() => {
  const record = props.game;
  const isVenue = record.entryMode === 'venue' || record.gameMode === 'venue';
  const entryMode = isVenue ? ('venue' as const) : ('game' as const);
  const rawEntryId = isVenue ? (record.entryVenueId ?? record.id) : (record.entryGameId ?? record.id);
  const entryId = Number(rawEntryId);

  if (!Number.isInteger(entryId) || entryId <= 0) return null;

  return {
    entryMode,
    entryId,
    entryKey: record.entryKey || `${entryMode}:${entryId}`
  } as const;
});

const favorite = computed(() => Boolean(props.game.favorite));
const gameNameParts = computed(() => {
  const name = String(props.game.name ?? '');
  const keyword = props.highlightKeyword.trim();
  if (!name || !keyword) return [{ text: name, matched: false }];

  const parts: Array<{ text: string; matched: boolean }> = [];
  const normalizedName = name.toLocaleLowerCase();
  const normalizedKeyword = keyword.toLocaleLowerCase();
  let cursor = 0;
  let matchIndex = normalizedName.indexOf(normalizedKeyword, cursor);

  while (matchIndex >= 0) {
    if (matchIndex > cursor) parts.push({ text: name.slice(cursor, matchIndex), matched: false });
    parts.push({ text: name.slice(matchIndex, matchIndex + keyword.length), matched: true });
    cursor = matchIndex + keyword.length;
    matchIndex = normalizedName.indexOf(normalizedKeyword, cursor);
  }

  if (cursor < name.length) parts.push({ text: name.slice(cursor), matched: false });
  return parts;
});
const favoritePending = computed(() => (
  favoriteEntry.value ? pendingFavoriteEntryKeys.value.includes(favoriteEntry.value.entryKey) : false
));

function handleSelect() {
  if (isDisabled.value) {
    emit('disabled', props.game);
    return;
  }
  emit('select', props.game);
}

async function toggleFavorite() {
  const entry = favoriteEntry.value;
  if (!entry || favoritePending.value || isDisabled.value) return;

  if (!auth.token) {
    openLoginEntry(1);
    return;
  }

  const previousFavorite = favorite.value;
  const nextFavorite = !previousFavorite;
  pendingFavoriteEntryKeys.value.push(entry.entryKey);
  props.game.favorite = nextFavorite;

  try {
    await setMomentsGameFavorite(entry.entryId, nextFavorite, entry.entryMode);
    emit('favorite-change', props.game, nextFavorite);
  } catch {
    props.game.favorite = previousFavorite;
    showCustomToast({ type: 'fail', message: $t('操作失败') });
  } finally {
    pendingFavoriteEntryKeys.value = pendingFavoriteEntryKeys.value.filter(
      entryKey => entryKey !== entry.entryKey
    );
  }
}
</script>

<template>
  <section class="basic-game-card" :class="{ 'basic-game-card--long': imageDisplay === 'long' }" :aria-disabled="isDisabled">
    <div class="basic-game-card__poster" role="button" tabindex="0" :aria-label="String(game.name || $t('游戏'))" @click="handleSelect" @keydown.enter="handleSelect" @keydown.space.prevent="handleSelect">
      <home-skeleton-image
        v-if="gameImage"
        :src="gameImage"
        :alt="String(game.name ?? '')"
        class="basic-game-card__image"
        fit="cover"
        loading="lazy"
      />
      <div v-if="isDisabled" class="basic-game-card__mask">
        <img :src="maintenanceIcon" :alt="$t('tips.maintenance')" />
      </div>
      <div
        v-if="favoriteEntry"
        class="basic-game-card__favorite"
        role="button"
        :tabindex="isDisabled ? -1 : 0"
        :aria-pressed="favorite"
        :aria-disabled="favoritePending || isDisabled"
        :aria-label="$t('收藏')"
        @click.stop="toggleFavorite"
        @keydown.enter.stop.prevent="toggleFavorite"
        @keydown.space.stop.prevent="toggleFavorite"
      >
        <home-skeleton-image
          :src="favorite ? favoriteOnIcon : favoriteOffIcon"
          alt="."
          class="basic-game-card__favorite-icon"
          fit="contain"
          loading="eager"
        />
      </div>
    </div>

    <p v-if="showName" class="basic-game-card__name" dir="ltr">
      <template v-for="(part, index) in gameNameParts" :key="`${part.text}-${index}`">
        <mark v-if="part.matched">{{ part.text }}</mark>
        <template v-else>{{ part.text }}</template>
      </template>
    </p>
  </section>
</template>

<style scoped lang="less">
.basic-game-card {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;

  &__poster {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    width: 65px;
    max-width: 100%;
    overflow: hidden;
    border-radius: 9px;
    background-color: var(--skin__ddt_bg);
    aspect-ratio: 1 / 1;
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: not-allowed;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__favorite {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  &__favorite-icon {
    width: 20px;
    height: 20px;
    background-color: transparent;
  }

  &__name {
    width: 100%;
    margin: 4px 0 0;
    color: var(--skin__cards_text, var(--skin__neutral_1));
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    height: 32px;

    mark {
      color: var(--skin__primary);
      background: transparent;
    }
  }
}

.basic-game-card--long .basic-game-card__poster {
  width: 100%;
  aspect-ratio: 105 / 139.65;
}

:global([dir='rtl']) .basic-game-card {
  &__favorite {
    right: auto;
    left: 2px;
  }
}
</style>
