<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { $t } from "@/locales";

import type { HomeGameRecord, HomeGameSectionRecord } from "@/components/Home/types";
import arrowIcon from "@/assets/home/u-series/img_scroll_tkjt.png";
import favoriteIcon from "@/assets/home/btn_sc_off_2.avif";
import maintenanceIcon from "@/assets/home/u-series/img_whz_style_1.png";

defineOptions({
  name: "UHomeGameCategoryDialog"
});

const props = defineProps<{
  modelValue: boolean;
  section?: HomeGameSectionRecord | null;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "select", game: HomeGameRecord): void;
  (event: "disabled"): void;
  (event: "more", section: HomeGameSectionRecord): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const pageScroller = ref<HTMLElement | null>(null);
const activePageIndex = ref(0);
const gamePageSize = 9;
const slideWidth = 285;
const slideHeight = 314.5;

const gamePages = computed<HomeGameRecord[][]>(() => {
  const gameList = Array.isArray(props.section?.children) ? props.section.children : [];
  if (!gameList.length) {
    return [];
  }

  const pages: HomeGameRecord[][] = [];
  for (let index = 0; index < gameList.length; index += gamePageSize) {
    pages.push(gameList.slice(index, index + gamePageSize));
  }

  return pages;
});

const indicatorIndexes = computed(() => gamePages.value.map((_, index) => index));

const listSwiperStyle = computed(() => ({
  "--list-slide-width": `${slideWidth}px`,
  "--list-slide-inner-content-width": `${Math.max(gamePages.value.length, 1) * slideWidth}px`,
  "--list-slide-height": `${slideHeight}px`,
  "--list-slide-column-gap": "0px",
  "--list-slide-row-gap": "3.5px",
  "--list-slide-grid-auto-flow": "column",
  "--list-slide-grid-template-rows": `${slideHeight}px`,
  "--list-slide-grid-template-columns": `${slideWidth}px`,
  "--debug-permutation-direction--": "column",
}));

const pageLayoutStyle = {
  "--list-slide-width": `${slideWidth}px`,
  "--list-slide-inner-content-width": `${slideWidth}px`,
  "--list-slide-height": `${slideHeight}px`,
  "--list-slide-column-gap": "0px",
  "--list-slide-row-gap": "3.5px",
  "--list-slide-grid-auto-flow": "row",
  "--list-slide-grid-template-rows": "102.5px 102.5px 102.5px",
  "--list-slide-grid-template-columns": "95px 95px 95px",
  "--debug-permutation-direction--": "row",
};

const indicatorStyle = computed(() => {
  const dotCount = Math.max(indicatorIndexes.value.length, 1);
  const indicatorWidth = dotCount * 6 + Math.max(dotCount - 1, 0) * 4;

  return {
    "--list-slide-width": `${indicatorWidth}px`,
    "--list-slide-inner-content-width": `${indicatorWidth}px`,
    "--list-slide-height": "6px",
    "--list-slide-column-gap": "4px",
    "--list-slide-row-gap": "0px",
    "--list-slide-grid-auto-flow": "column",
    "--list-slide-grid-template-rows": "6px",
    "--list-slide-grid-template-columns": `repeat(${dotCount}, 6px)`,
    "--debug-permutation-direction--": "column",
  };
});

const cardBenchmarkStyle = {
  "--card-benchmark": "73px",
};

const favoriteIconStyle = getBackgroundImageStyle(favoriteIcon);
const dialogTitleIconStyle = getBackgroundImageStyle(arrowIcon);

function getBackgroundImageStyle(source?: string) {
  const imageUrl = source?.trim();
  return imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
}

function getPosterImageStyle(game: HomeGameRecord) {
  return {
    "--poster-image-border-base-radius": "calc(var(--card-benchmark) * 0.137)",
    ...getBackgroundImageStyle(game.image),
  };
}

function isGameOpen(record: HomeGameRecord) {
  return record.isOpen === true || record.isOpen === 1 || record.isOpen === "1";
}

function selectGame(game: HomeGameRecord) {
  if (!isGameOpen(game)) {
    emit("disabled");
    return;
  }

  emit("select", game);
}

function viewMore() {
  if (!props.section) {
    return;
  }

  emit("more", props.section);
}

function updateActivePageIndex() {
  const scroller = pageScroller.value;
  if (!scroller) {
    activePageIndex.value = 0;
    return;
  }

  const pageIndex = Math.round(scroller.scrollLeft / slideWidth);
  activePageIndex.value = Math.min(Math.max(pageIndex, 0), Math.max(gamePages.value.length - 1, 0));
}

function scrollToPage(pageIndex: number) {
  pageScroller.value?.scrollTo({
    left: pageIndex * slideWidth,
    behavior: "smooth",
  });
}

watch(
  () => [visible.value, gamePages.value.length],
  () => {
    activePageIndex.value = 0;
    nextTick(() => {
      pageScroller.value?.scrollTo({ left: 0 });
    });
  },
);
</script>

<template>
  <van-dialog
    v-model:show="visible"
    class="overlay-box"
    overlay-class="overlay-box"
    width="auto"
    teleport="body"
    close-on-popstate
    :close-on-click-overlay="true"
    :show-confirm-button="false"
    :show-cancel-button="false"
  >
    <div class="game-box">
      <div class="lobby-image lobby-image--use-bg title-icon" :style="dialogTitleIconStyle"></div>
      <section class="layout-box list-slide-view-more swiper-view-more">
        <section class="game-headline">
          <i class="title-icon">
            <svg>
              <use xlink:href="#"></use>
            </svg>
          </i>
          <p class="title-text">{{ section?.name }}</p>
        </section>

        <div class="list-container">
          <section
            class="list-slide-layout scroll-box-transform list-slide-typesetting is-slide-one-screen list-swiper swiper"
            :style="listSwiperStyle"
          >
            <div
              ref="pageScroller"
              class="list-slide-layout-inner scroll-box-transform-inner"
              @scroll.passive="updateActivePageIndex"
            >
              <section
                v-for="(gamePage, pageIndex) in gamePages"
                :key="pageIndex"
                class="list-slide-layout slide-pagination"
                :style="pageLayoutStyle"
              >
                <div class="list-slide-layout-inner">
                  <div
                    v-for="(game, gameIndex) in gamePage"
                    :key="game.id ?? gameIndex"
                    class="name-img-layout square-below-name"
                    :style="cardBenchmarkStyle"
                    @click="selectGame(game)"
                  >
                    <div
                      class="lobby-image lobby-image--use-bg lobby-image--skeleton poster-image poster-img-box-core"
                      :style="getPosterImageStyle(game)"
                    >
                      <section class="favorite-area circle-star favorite-icon">
                        <div
                          class="lobby-image lobby-image--use-bg circle-star-icon"
                          :style="favoriteIconStyle"
                        ></div>
                      </section>

                      <section v-if="!isGameOpen(game)" class="mask-maintain position-center">
                        <img class="lobby-image lobby-image--use-bg maintain-icon" :src="maintenanceIcon" alt="" />
                      </section>
                    </div>

                    <div class="game-name-normal line-one">
                      <h4 class="name-inner">{{ game.name }}</h4>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section
            class="list-slide-layout scroll-box-transform slide-indicator indicator"
            :style="indicatorStyle"
          >
            <div class="list-slide-layout-inner scroll-box-transform-inner">
              <div
                v-for="pageIndex in indicatorIndexes"
                :key="pageIndex"
                class="list-slide-dot"
                :class="{ 'is-active': activePageIndex === pageIndex }"
                @click="scrollToPage(pageIndex)"
              ></div>
            </div>
          </section>
        </div>

        <div class="view-more-button" @click="viewMore">
          <p class="view-text">{{ $t("查看更多") }}</p>
        </div>
      </section>
    </div>
  </van-dialog>
</template>

<style scoped>
:global(.van-overlay.overlay-box) {
  background: rgba(162, 177, 195, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:global(.overlay-box.van-dialog) {
  box-sizing: border-box;
  width: min(312.5px, calc(100vw - 40px)) !important;
  height: min(376px, calc(100vh - 60px));
  min-height: 300px;
  max-width: calc(100vw - 40px);
  overflow: visible;
  padding: 0 9.5px;
  background-color: rgba(var(--skin__bg_2__toRgbString, 29, 35, 49), 0.7);
  border: none !important;
  border-radius: 20px;
  box-shadow: none;
}

:global(.overlay-box .van-dialog__content) {
  height: 100%;
  overflow: visible;
  color: var(--skin__lead, #ffffff);
}

:global(.overlay-box .van-dialog__footer) {
  display: none;
}

.game-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.game-box > .title-icon {
  position: absolute;
  top: 14px;
  right: 13px;
  z-index: 3;
  width: 12px;
  height: 12px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

:global([dir="rtl"]) .game-box > .title-icon {
  right: auto;
  left: 13px;
  transform: rotate(180deg);
}

.swiper-view-more {
  width: 100%;
  height: 100%;
}

.layout-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-headline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 7px 0;
  margin-bottom: 3px;
  color: var(--main-color, #f6d88b);
}

.game-headline .title-icon {
  display: none;
  width: 0;
}

.title-text {
  margin: 0;
  color: var(--skin__neutral_1, #ffffff);
  font-size: 15px;
  line-height: 1;
}

.list-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.list-slide-layout {
  display: grid;
  grid-auto-flow: var(--list-slide-grid-auto-flow);
  grid-template-rows: var(--list-slide-grid-template-rows);
  grid-template-columns: var(--list-slide-grid-template-columns);
  gap: var(--list-slide-row-gap) var(--list-slide-column-gap);
  width: var(--list-slide-width);
  height: var(--list-slide-height);
}

.list-slide-layout-inner {
  width: var(--list-slide-inner-content-width);
  height: var(--list-slide-height);
}

.list-swiper {
  display: block;
  height: 314.5px;
  overflow: hidden;
}

.list-swiper > .list-slide-layout-inner {
  display: flex;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
}

.list-swiper > .list-slide-layout-inner::-webkit-scrollbar {
  display: none;
}

.list-swiper .slide-pagination {
  flex: 0 0 var(--list-slide-width);
  scroll-snap-align: start;
}

.list-swiper .list-slide-layout-inner {
  display: grid;
  grid-auto-flow: var(--list-slide-grid-auto-flow);
  grid-template-rows: var(--list-slide-grid-template-rows);
  grid-template-columns: var(--list-slide-grid-template-columns);
  gap: var(--list-slide-row-gap) var(--list-slide-column-gap);
  align-items: center;
  justify-items: center;
}

.name-img-layout {
  --name-img-layout-width: calc(var(--card-benchmark) * 1.3);

  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--name-img-layout-width);
  cursor: pointer;
}

.poster-img-box-core {
  --poster-img-box-core-width: var(--card-benchmark);
  --poster-img-box-core-height: var(--card-benchmark);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: var(--poster-img-box-core-width);
  height: var(--poster-img-box-core-height);
  overflow: hidden;
  color: var(--skin__ddt_icon, #ffffff);
  background-color: rgba(255, 255, 255, 0.06);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.poster-image {
  --poster-image-border-width: 0;
  --poster-image-border-color: var(--skin__web_plat_line, transparent);
  --poster-image-border-radius: var(--poster-image-border-base-radius);

  overflow: hidden;
  color: var(--skin__ddt_icon, #ffffff);
  border-color: var(--poster-image-border-color);
  border-style: solid;
  border-width: var(--poster-image-border-width);
  border-radius: var(--poster-image-border-radius);
}

.favorite-area {
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: fit-content;
  padding: 3px;
  margin: -3px;
  line-height: 0;
  cursor: pointer;
}

.square-below-name .favorite-icon {
  position: absolute;
  top: calc(var(--card-benchmark) * 0.03);
  right: calc(var(--card-benchmark) * 0.03);
}

:global([dir="rtl"]) .square-below-name .favorite-icon {
  right: auto;
  left: calc(var(--card-benchmark) * 0.03);
}

.circle-star-icon {
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.game-name-normal {
  --game-name-normal-font-size: calc(var(--card-benchmark) * 0.1644);
  --game-name-normal-width: calc(var(--card-benchmark) * 1.3);
  --game-name-normal-height: calc(var(--card-benchmark) * 0.226);

  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--game-name-normal-width);
  height: var(--game-name-normal-height);
  margin-top: 4.5px;
  overflow: hidden;
  color: var(--skin__neutral_1, #ffffff);
  font-size: var(--game-name-normal-font-size);
  line-height: 1.1818;
  text-align: center;
  word-wrap: break-word;
}

.name-inner {
  width: 100%;
  margin: 0;
  font: inherit;
  font-weight: 400;
}

.line-one .name-inner {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mask-maintain {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: inherit;
}

.maintain-icon {
  width: 56%;
  height: 56%;
  object-fit: contain;
}

.slide-indicator {
  position: absolute;
  right: 0;
  bottom: 5px;
  left: 0;
  z-index: 1;
  padding-right: 1.5px;
  margin: auto;
}

.slide-indicator .list-slide-layout-inner {
  display: grid;
  grid-auto-flow: var(--list-slide-grid-auto-flow);
  grid-template-rows: var(--list-slide-grid-template-rows);
  grid-template-columns: var(--list-slide-grid-template-columns);
  gap: var(--list-slide-row-gap) var(--list-slide-column-gap);
}

.list-slide-dot {
  width: 6px;
  height: 6px;
  cursor: pointer;
  background-color: var(--skin__neutral_3, rgba(255, 255, 255, 0.35));
  border-radius: 100px;
  opacity: 0.98;
  transition: all 0.3s;
}

.list-slide-dot.is-active {
  background-color: var(--skin__text_primary, #ffffff);
}

.view-more-button {
  display: none;
  height: fit-content;
  margin-top: auto;
  line-height: 1;
  color: var(--main-color, #f6d88b);
  cursor: pointer;
  border-bottom: 1px solid var(--main-color, #f6d88b);
}

.view-text {
  margin: 0;
  font-size: 12px;
  line-height: 1;
}
</style>
