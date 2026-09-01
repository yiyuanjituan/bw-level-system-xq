<script setup lang="ts">
import { computed } from "vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import type { GameImageDisplay } from "@/api/common";
import type { HomeGameRecord } from "@/components/Home/types";

defineOptions({
  name: "HomeGameCard"
});

const props = withDefaults(defineProps<{
  game: HomeGameRecord;
  imageDisplay?: GameImageDisplay;
}>(), {
  imageDisplay: "square"
});

const emit = defineEmits<{
  (e: "select", game: HomeGameRecord): void;
  (e: "disabled"): void;
}>();

const isDisabled = computed(() => Number(props.game.isOpen) === 0);
const isLongImageDisplay = computed(() => props.imageDisplay === "long");
const displayClass = computed(() => (
  isLongImageDisplay.value ? "home-game-card--long-image" : "home-game-card--square-image"
));

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
    :class="[displayClass, { 'home-game-card--disabled': isDisabled }]"
    :aria-label="game.name || '游戏'"
    :aria-disabled="isDisabled"
    @click="handleClick"
  >
    <span class="home-game-card__visual">
      <home-skeleton-image
        v-if="game.image"
        :src="game.image"
        alt=""
        class="home-game-card__image"
        fit="cover"
      />

      <span v-if="isDisabled" class="home-game-card__mask" aria-hidden="true">
        <span class="home-game-card__maintenance"></span>
      </span>
    </span>

    <span v-if="game.name" class="home-game-card__name">
      {{ game.name }}
    </span>
  </button>
</template>

<style scoped lang="less">
.home-game-card {
  width: 100%;
  padding: 0;
  border: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  color: var(--skin__cards_text, var(--skin__lead));
  background: transparent;
  border-radius: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

}

.home-game-card__visual {
  position: relative;
  display: block;
  flex: none;
  overflow: hidden;
  background-color: var(--skin__ddt_bg);
}

.home-game-card__visual::after {
  display: none;
}

.home-game-card--square-image .home-game-card__visual {
  width: var(--home-square-card-size, 77px);
  height: var(--home-square-card-size, 77px);
  border-radius: 5px;
}

.home-game-card--long-image {
  aspect-ratio: 105 / 139.65;
  overflow: hidden;
  color: #fff;
  background-color: var(--skin__ddt_bg);
  border-radius: 9px 13px 13px;
}

.home-game-card--long-image .home-game-card__visual {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.home-game-card--long-image .home-game-card__visual::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: block;
  height: 46px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
  content: "";
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
  height: 30px;
  margin-top: 4px;
  overflow: hidden;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.36;
  text-align: center;
  word-wrap: break-word;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.home-game-card--long-image .home-game-card__name {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  height: auto;
  min-height: 28px;
  margin-top: 0;
  padding: 3px 5px 5px;
  overflow: hidden;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
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

.home-game-card--long-image .home-game-card__mask {
  align-items: flex-start;
}

.home-game-card__maintenance {
  width: 100%;
  aspect-ratio: 1;
  display: block;
  background: url("@/assets/home/img_whz_style_13.avif") center / 100% 100% no-repeat;
}
</style>
