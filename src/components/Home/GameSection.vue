<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { $t } from "@/locales";
import HomeGameCard from "@/components/Home/GameCard.vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import useAppStore from "@/store/modules/app";
import type { GameImageDisplay } from "@/api/common";
import type { HomeGameRecord, HomeGameSectionRecord } from "@/components/Home/types";

defineOptions({
  name: "HomeGameSection"
});

const props = defineProps<{
  section: HomeGameSectionRecord;
}>();

const emit = defineEmits<{
  (e: "select", game: HomeGameRecord): void;
  (e: "disabled"): void;
}>();

const app = useAppStore();
const currentPage = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);
const swipeThreshold = 40;
const slidePageGap = 15;
let suppressClick = false;
let suppressClickTimer: number | null = null;
let pointerState: {
  startX: number;
  startY: number;
  startOffset: number;
  pointerId: number;
  moved: boolean;
} | null = null;

const games = computed(() => {
  return Array.isArray(props.section.children) ? props.section.children : [];
});
const imageDisplay = computed<GameImageDisplay>(() => app.gameImageDisplay === "long" ? "long" : "square");
const isLongImageDisplay = computed(() => imageDisplay.value === "long");
const defaultPageShowNum = computed(() => isLongImageDisplay.value ? 6 : 8);
const pageShowNum = computed(() => {
  const value = Number(props.section.pageShowNum);
  return Number.isFinite(value) && value > 0 ? value : defaultPageShowNum.value;
});
const pageCount = computed(() => Math.ceil(games.value.length / pageShowNum.value));
const pages = computed(() => {
  return Array.from({ length: pageCount.value }, (_, pageIndex) => {
    const start = pageIndex * pageShowNum.value;
    return games.value.slice(start, start + pageShowNum.value);
  });
});
const sectionTitle = computed(() => {
  const name = String(props.section.name ?? "");
  const gameText = $t("游戏");

  return name.endsWith(gameText) ? name : `${name}${gameText}`;
});
const trackStyle = computed(() => ({
  transform: `translate3d(calc(${currentPage.value * -100}% - ${currentPage.value * slidePageGap}px + ${dragOffset.value}px), 0, 0)`,
  transition: isDragging.value ? "none" : "transform 300ms ease"
}));

function canSlidePrev() {
  return currentPage.value > 0;
}

function canSlideNext() {
  return currentPage.value < pageCount.value - 1;
}

function setCurrentPage(pageIndex: number) {
  const lastPage = Math.max(pageCount.value - 1, 0);
  currentPage.value = Math.max(0, Math.min(pageIndex, lastPage));
  dragOffset.value = 0;
}

function slidePrev() {
  if (!canSlidePrev()) {
    dragOffset.value = 0;
    return;
  }

  setCurrentPage(currentPage.value - 1);
}

function slideNext() {
  if (!canSlideNext()) {
    dragOffset.value = 0;
    return;
  }

  setCurrentPage(currentPage.value + 1);
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture?.(event.pointerId);
  pointerState = {
    startX: event.clientX,
    startY: event.clientY,
    startOffset: dragOffset.value,
    pointerId: event.pointerId,
    moved: false
  };
  isDragging.value = true;
}

function handlePointerMove(event: PointerEvent) {
  if (!pointerState || pointerState.pointerId !== event.pointerId) return;

  const distanceX = event.clientX - pointerState.startX;
  const distanceY = event.clientY - pointerState.startY;

  if (!pointerState.moved && Math.abs(distanceY) > 8 && Math.abs(distanceY) > Math.abs(distanceX)) {
    handlePointerCancel();
    return;
  }

  if (Math.abs(distanceX) > 5) pointerState.moved = true;
  if (!pointerState.moved) return;

  const lastPage = pageCount.value - 1;
  const isPastStart = currentPage.value === 0 && distanceX > 0;
  const isPastEnd = currentPage.value === lastPage && distanceX < 0;
  const resistance = isPastStart || isPastEnd ? 0.3 : 1;

  dragOffset.value = pointerState.startOffset + distanceX * resistance;
}

function markSuppressClick() {
  suppressClick = true;

  if (suppressClickTimer) {
    window.clearTimeout(suppressClickTimer);
  }

  suppressClickTimer = window.setTimeout(() => {
    suppressClick = false;
    suppressClickTimer = null;
  }, 300);
}

function handlePointerUp(event: PointerEvent) {
  const lastPointerState = pointerState;
  pointerState = null;
  isDragging.value = false;

  if (!lastPointerState || lastPointerState.pointerId !== event.pointerId) return;

  const distanceX = event.clientX - lastPointerState.startX;
  if (!lastPointerState.moved) {
    dragOffset.value = 0;
    return;
  }

  markSuppressClick();

  if (distanceX <= -swipeThreshold) {
    slideNext();
    return;
  }

  if (distanceX >= swipeThreshold) {
    slidePrev();
    return;
  }

  dragOffset.value = 0;
}

function handlePointerCancel() {
  pointerState = null;
  isDragging.value = false;
  dragOffset.value = 0;
}

function handleGameSelect(game: HomeGameRecord) {
  if (suppressClick) return;

  emit("select", game);
}

function handleDisabledClick() {
  if (suppressClick) return;

  emit("disabled");
}

function getGameKey(game: HomeGameRecord, index: number) {
  return game.id ?? game.gameCode ?? `${game.venueId ?? "game"}-${index}`;
}

watch(pageCount, count => {
  if (currentPage.value >= count) {
    setCurrentPage(count - 1);
  }
});

onBeforeUnmount(() => {
  if (suppressClickTimer) {
    window.clearTimeout(suppressClickTimer);
  }
});
</script>

<template>
  <section
    v-if="games.length"
    class="home-game-section"
    :class="{ 'home-game-section--long-image': isLongImageDisplay }"
  >
    <div class="home-game-section__headline">
      <div class="home-game-section__title">
        <home-skeleton-image
          v-if="section.img"
          :src="section.img"
          alt=""
          class="home-game-section__title-icon"
          fit="contain"
        />
        <span class="home-game-section__title-text">{{ sectionTitle }}</span>
      </div>

      <div class="home-game-section__pagination">
        <button
          type="button"
          class="home-game-section__arrow home-game-section__arrow--prev"
          :disabled="!canSlidePrev()"
          :aria-label="$t('上一页')"
          @click="slidePrev"
        >
          <svg-icon name="comm_icon_fy_jt" class-name="home-game-section__arrow-icon" />
        </button>
        <span class="home-game-section__all">{{ $t("全部") }}</span>
        <button
          type="button"
          class="home-game-section__arrow"
          :disabled="!canSlideNext()"
          :aria-label="$t('下一页')"
          @click="slideNext"
        >
          <svg-icon name="comm_icon_fy_jt" class-name="home-game-section__arrow-icon" />
        </button>
      </div>
    </div>

    <div
      class="home-game-section__viewport"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
    >
      <div class="home-game-section__track" :style="trackStyle">
        <div
          v-for="(pageItems, pageIndex) in pages"
          :key="pageIndex"
          class="home-game-section__page"
        >
          <home-game-card
            v-for="(game, gameIndex) in pageItems"
            :key="`${pageIndex}-${getGameKey(game, gameIndex)}`"
            :game="game"
            :image-display="imageDisplay"
            @select="handleGameSelect"
            @disabled="handleDisabledClick"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.home-game-section {
  --home-square-card-size: min(77px, calc((100vw - 48px) / 4));

  padding: 15px 15px 0;
}

.home-game-section__headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-game-section__title {
  min-width: 0;
  display: flex;
  align-items: center;
  color: var(--skin__lead);
}

.home-game-section__title-icon {
  width: 26px;
  height: 26px;
  margin-right: 3px;
  flex: none;
  background-color: transparent;
}

:global([dir="rtl"]) .home-game-section__title-icon {
  margin-right: 0;
  margin-left: 3px;
}

.home-game-section__title-text {
  overflow: hidden;
  font-size: 15px;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.home-game-section__pagination {
  height: 23px;
  display: flex;
  align-items: center;
  flex: none;
  overflow: hidden;
  color: var(--skin__lead);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 999px;
}

.home-game-section__arrow {
  width: 30px;
  height: 100%;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__lead);
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;

  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(0.92);
  }

  &:disabled {
    color: #68707b;
    cursor: not-allowed;
  }
}

.home-game-section__arrow--prev {
  transform: rotate(180deg);

  &:active:not(:disabled) {
    transform: rotate(180deg) scale(0.92);
  }
}

:deep(.home-game-section__arrow-icon) {
  width: 10px;
  height: 10px;
}

.home-game-section__all {
  width: 50px;
  height: 100%;
  border-right: var(--lobby__px) solid var(--skin__border);
  border-left: var(--lobby__px) solid var(--skin__border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 10px;
  line-height: 1;
}

.home-game-section__viewport {
  margin-top: 10px;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.home-game-section__track {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  will-change: transform;
}

.home-game-section__page {
  width: 100%;
  flex: 0 0 100%;
  display: grid;
  grid-template-columns: repeat(4, var(--home-square-card-size));
  justify-content: space-between;
  gap: 14px 0;
}

.home-game-section--long-image .home-game-section__page {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  justify-content: stretch;
  gap: 15px;
}
</style>
