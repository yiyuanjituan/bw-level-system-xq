<script setup lang="ts">
import { computed } from "vue";
import favoriteOffUrl from "@/assets/home/btn_sc_off_2.avif";
import favoriteOnUrl from "@/assets/home/btn_sc_on_2.avif";
import recommendUrl from "@/assets/home/moments/img_game_tj1_zj.avif";
import PlazzaLazyImage from "./PlazzaLazyImage.vue";
import type { PlazzaRecentGame } from "../types";

const props = withDefaults(defineProps<{
  games: PlazzaRecentGame[];
  pendingFavoriteIds?: string[];
}>(), {
  pendingFavoriteIds: () => []
});

const visibleGames = computed(() => props.games.slice(0, 4));

function isFavoritePending(gameId: string | number) {
  return props.pendingFavoriteIds.includes(String(gameId));
}

const emit = defineEmits<{
  (event: "select-game", game: PlazzaRecentGame): void;
  (event: "toggle-favorite", game: PlazzaRecentGame): void;
}>();
</script>

<template>
  <section v-if="visibleGames.length" class="recent-games">
    <header class="recent-games__header">
      <h2>最近在玩</h2>
    </header>

    <div class="recent-games__list">
      <article
        v-for="game in visibleGames"
        :key="game.id"
        class="recent-games__card"
      >
        <button
          type="button"
          class="recent-games__launch"
          :aria-label="`进入${game.name}`"
          @click="emit('select-game', game)"
        >
          <plazza-lazy-image
            class="recent-games__cover"
            :src="game.coverUrl"
            :alt="game.name"
            error-text=""
          />
          <span class="recent-games__name"><strong>{{ game.name }}</strong></span>
          <img v-if="game.recommended" class="recent-games__recommend" :src="recommendUrl" alt="推荐" />
        </button>
        <button
          type="button"
          class="recent-games__favorite"
          :aria-label="game.favorite ? '取消收藏' : '收藏游戏'"
          :aria-busy="isFavoritePending(game.id)"
          :disabled="isFavoritePending(game.id)"
          @click.stop="emit('toggle-favorite', game)"
        >
          <img :src="game.favorite ? favoriteOnUrl : favoriteOffUrl" alt="" />
        </button>
      </article>
    </div>

  </section>
</template>

<style scoped lang="less">
.recent-games {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 10px 0 0;
}

.recent-games__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;

  h2 {
    margin: 0;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
}

.recent-games__list {
  display: flex;
  width: 100%;
  height: 106.5px;
  column-gap: 11.5px;
  overflow: hidden;
}

.recent-games__card {
  position: relative;
  flex: 0 0 80px;
  width: 80px;
  height: 106.4px;
  overflow: hidden;
  border-radius: 10px;
  color: white;
}

.recent-games__launch {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: inherit;
  color: inherit;
  font-family: inherit;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;

  &:active {
    transform: scale(0.9);
    opacity: 0.75;
  }
}

.recent-games__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.recent-games__name {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 26px;
  padding: 0 3px 3px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, transparent, rgb(0 0 0 / 72%));
  text-align: center;
  text-shadow: 0 1px 2px rgb(0 0 0 / 30%);

  strong {
    display: -webkit-box;
    width: 100%;
    overflow: hidden;
    font-size: 9px;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.recent-games__recommend {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 25.5px;
  height: 20.7px;
  object-fit: fill;
}

.recent-games__favorite {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  padding: 3px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;

  &:not(:disabled):active {
    transform: scale(0.82);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  img {
    display: block;
    width: 17px;
    height: 17px;
    border-radius: 50%;
  }
}

:global([dir="rtl"]) .recent-games__recommend {
  right: 0;
  left: auto;
}

:global([dir="rtl"]) .recent-games__favorite {
  right: auto;
  left: 0;
}
</style>
