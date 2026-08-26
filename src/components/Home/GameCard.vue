<script setup lang="ts">
import { computed } from "vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import type { HomeGameRecord } from "@/components/Home/types";

defineOptions({
  name: "HomeGameCard"
});

const props = defineProps<{
  game: HomeGameRecord;
}>();

const emit = defineEmits<{
  (e: "select", game: HomeGameRecord): void;
  (e: "disabled"): void;
}>();

const isGame = computed(() => props.game.gameMode === "game");
const isDisabled = computed(() => Number(props.game.isOpen) === 0);

function handleClick() {
  if (isDisabled.value) {
    emit("disabled");
    return;
  }

  emit("select", props.game);
}
</script>

<template>
  <button
    type="button"
    class="home-game-card"
    :class="{ 'home-game-card--disabled': isDisabled }"
    :aria-label="game.name || '游戏'"
    :aria-disabled="isDisabled"
    @click="handleClick"
  >
    <home-skeleton-image
      v-if="game.image"
      :src="game.image"
      alt=""
      class="home-game-card__image"
      fit="cover"
    />

    <span v-if="isGame && game.name" class="home-game-card__name">
      {{ game.name }}
    </span>

    <span v-if="isDisabled" class="home-game-card__mask" aria-hidden="true">
      <span class="home-game-card__maintenance"></span>
    </span>
  </button>
</template>

<style scoped lang="less">
.home-game-card {
  width: 100%;
  aspect-ratio: 105 / 139.65;
  padding: 0;
  border: 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  background-color: var(--skin__ddt_bg);
  border-radius: 9px 13px 13px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &::after {
    width: 100%;
    height: 46px;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
    pointer-events: none;
    content: "";
  }

  &:active:not(.home-game-card--disabled) {
    transform: scale(0.98);
  }
}

.home-game-card__image {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.home-game-card__name {
  width: 100%;
  min-height: 28px;
  padding: 3px 5px 5px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.home-game-card__mask {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.home-game-card__maintenance {
  width: 100%;
  aspect-ratio: 1;
  display: block;
  background: url("@/assets/home/img_whz_style_13.avif") center / 100% 100% no-repeat;
}
</style>
