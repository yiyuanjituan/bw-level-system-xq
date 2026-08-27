<script setup lang="ts">
import { computed } from "vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import type { HomeGameRecord, HomeGameSectionRecord } from "@/components/Home/types";
import arrowIcon from "@/assets/home/u-series/img_scroll_tkjt.png";
import nameShade from "@/assets/home/u-series/img_rm_shade.png";
import favoriteIcon from "@/assets/home/btn_sc_off_2.avif";
import maintenanceIcon from "@/assets/home/u-series/img_whz_style_1.png";

defineOptions({
  name: "UHomeGameBox"
});

const props = withDefaults(defineProps<{
  section: HomeGameSectionRecord;
  variant?: "featured" | "compact" | "regular";
}>(), {
  variant: "regular"
});

const emit = defineEmits<{
  select: [record: HomeGameRecord];
  disabled: [];
  more: [section: HomeGameSectionRecord];
}>();

const gameList = computed(() => {
  const children = Array.isArray(props.section.children) ? props.section.children : [];
  if (props.variant === "featured") return children.slice(0, 8);
  return children.slice(0, 2);
});

function isGameOpen(record: HomeGameRecord) {
  return record.isOpen === true || record.isOpen === 1 || record.isOpen === "1";
}

function selectGame(record: HomeGameRecord) {
  if (!isGameOpen(record)) {
    emit("disabled");
    return;
  }
  emit("select", record);
}
</script>

<template>
  <article class="u-game-box" :class="`u-game-box--${variant}`">
    <button type="button" class="u-game-box__header" @click="emit('more', section)">
      <h2>{{ section.name }}</h2>
      <img :src="arrowIcon" alt="" />
    </button>

    <div class="u-game-box__games">
      <button
        v-for="(game, index) in gameList"
        :key="game.id ?? index"
        type="button"
        class="u-game-card"
        @click="selectGame(game)"
      >
        <HomeSkeletonImage
          :src="game.image"
          :alt="String(game.name ?? '')"
          class="u-game-card__image"
        />
        <div class="u-game-card__name">
          <img :src="nameShade" alt="" />
          <span>{{ game.name }}</span>
        </div>
        <img v-if="variant === 'featured'" :src="favoriteIcon" class="u-game-card__favorite" alt="" />
        <div v-if="!isGameOpen(game)" class="u-game-card__maintenance">
          <img :src="maintenanceIcon" alt="" />
        </div>
      </button>
    </div>
  </article>
</template>

<style scoped lang="less">
.u-game-box {
  min-width: 0;
  height: 150px;
  padding: 0 10px 10px;
  overflow: hidden;
  border: 1px solid var(--skin__bg_2);
  border-radius: 10px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.75);

  &--featured {
    height: 217px;
  }

  &--compact {
    height: 103.5px;
    padding: 0 7px 7px;
  }
}

.u-game-box__header {
  position: relative;
  width: 100%;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  cursor: pointer;

  h2 {
    margin: 0;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0;
  }

  > img {
    position: absolute;
    right: 0;
    width: 12px;
    height: 12px;
  }
}

.u-game-box--featured .u-game-box__header {
  height: 24px;
}

.u-game-box__games {
  height: calc(100% - 28px);
  display: flex;
  gap: 7px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.u-game-box--featured .u-game-box__games {
  height: calc(100% - 24px);
}

.u-game-card {
  position: relative;
  min-width: 0;
  flex: 1 1 0;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 7px;
  color: white;
  background: var(--skin__ddt_bg);
  cursor: pointer;
}

.u-game-box--featured .u-game-card {
  flex: 0 0 calc(100% - 10px);
  scroll-snap-align: center;
}

.u-game-card__image {
  width: 100%;
  height: 100%;
}

.u-game-card__name {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 4px 4px;
  font-size: 10px;

  > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  span {
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.u-game-box--compact .u-game-card__name {
  height: 24px;
  padding-bottom: 2px;
  font-size: 9px;
}

.u-game-card__favorite {
  position: absolute;
  top: 7px;
  right: 7px;
  z-index: 2;
  width: 17px;
  height: 17px;
}

.u-game-card__maintenance {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.58);

  img {
    width: min(54%, 72px);
    height: auto;
  }
}

:global([dir="rtl"]) .u-game-box__header > img {
  right: auto;
  left: 0;
  transform: rotate(180deg);
}

:global([dir="rtl"]) .u-game-card__favorite {
  right: auto;
  left: 7px;
}
</style>
