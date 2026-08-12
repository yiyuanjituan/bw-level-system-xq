<script setup lang="ts">
import PlazzaLazyImage from "./PlazzaLazyImage.vue";
import type { PlazzaRecentGame } from "../types";

defineProps<{
  games: PlazzaRecentGame[];
}>();

const emit = defineEmits<{
  (event: "select-game", game: PlazzaRecentGame): void;
  (event: "toggle-favorite", game: PlazzaRecentGame): void;
}>();
</script>

<template>
  <section class="recent-games">
    <header class="recent-games__header">
      <h2>最近在玩</h2>
    </header>

    <div v-if="games.length" class="recent-games__list">
      <div
        v-for="game in games"
        :key="game.id"
        class="recent-games__card"
        role="button"
        tabindex="0"
        @click="emit('select-game', game)"
        @keydown.enter="emit('select-game', game)"
      >
        <plazza-lazy-image
          class="recent-games__cover"
          :src="game.coverUrl"
          :alt="game.name"
          error-text=""
        />
        <span class="recent-games__shade"></span>
        <strong>{{ game.name }}</strong>
        <span v-if="game.recommended" class="recent-games__recommend">推荐</span>
        <button
          type="button"
          class="recent-games__favorite"
          :class="{ 'recent-games__favorite--active': game.favorite }"
          :aria-label="game.favorite ? '取消收藏' : '收藏游戏'"
          @click.stop="emit('toggle-favorite', game)"
        >
          ★
        </button>
      </div>
    </div>

    <p v-else class="recent-games__empty">暂无最近游戏</p>
  </section>
</template>

<style scoped lang="less">
.recent-games {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 10px;
  border-radius: 7px;
  background: var(--skin__bg_2);
}

.recent-games__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  h2 {
    margin: 0;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
}

.recent-games__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.recent-games__card {
  position: relative;
  aspect-ratio: 1 / 1.2;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 7px;
  color: white;
  background: var(--skin__bg_1);
  cursor: pointer;

  .recent-games__cover {
    width: 100%;
    height: 100%;
  }

  strong {
    position: absolute;
    right: 5px;
    bottom: 5px;
    left: 5px;
    overflow: hidden;
    font-size: 10px;
    font-weight: 400;
    line-height: 14px;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.recent-games__shade {
  position: absolute;
  inset: 42% 0 0;
  background: linear-gradient(transparent, rgb(0 0 0 / 78%));
}

.recent-games__recommend {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 4px;
  border-radius: 3px;
  color: var(--skin__text_primary);
  font-size: 9px;
  line-height: 12px;
  background: var(--skin__primary);
}

.recent-games__favorite {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: rgb(255 255 255 / 70%);
  font-size: 10px;
  background: rgb(0 0 0 / 48%);

  &--active {
    color: var(--skin__primary);
  }
}

.recent-games__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  margin: 0;
  color: var(--skin__neutral_2);
  font-size: 11px;
}
</style>
