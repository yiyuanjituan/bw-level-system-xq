<script setup lang="ts">
import { computed, ref } from "vue";
import type { SwipeInstance } from "vant";
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
  variant?: "featured" | "wide" | "grid";
  gameIndex?: number;
}>(), {
  variant: "grid",
  gameIndex: 0
});

const emit = defineEmits<{
  select: [record: HomeGameRecord];
  disabled: [];
  more: [section: HomeGameSectionRecord];
}>();

const featuredSwiper = ref<SwipeInstance | null>(null);
const activeSlideIndex = ref(0);

const gameList = computed(() => {
  const children = Array.isArray(props.section.children) ? props.section.children : [];

  if (props.variant === "featured") return children;
  if (props.variant === "wide") return children.slice(0, 2);
  return children.slice(0, 4);
});
const indicatorList = computed(() => gameList.value.map((_, index) => index));
const canSlidePrev = computed(() => activeSlideIndex.value > 0);
const canSlideNext = computed(() => activeSlideIndex.value < gameList.value.length - 1);

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

function handleFeaturedChange(index: number) {
  activeSlideIndex.value = index;
}

function scrollFeatured(direction: -1 | 1) {
  if (direction === -1) {
    featuredSwiper.value?.prev();
    return;
  }

  featuredSwiper.value?.next();
}

function scrollToFeatured(index: number) {
  featuredSwiper.value?.swipeTo(index);
}
</script>

<template>
  <article
    v-if="gameList.length"
    class="game-box"
    :data-layout="variant"
    :gameindex="gameIndex"
    @click="emit('more', section)"
  >
    <template v-if="variant === 'featured'">
      <button type="button" class="head-box" :aria-label="`${section.name}更多`">
        <span
          class="lobby-image lobby-image--use-bg title-icon"
          :style="{ backgroundImage: `url(${arrowIcon})` }"
        ></span>
      </button>

      <section class="layout-box list-slide-view-more swiper-view-more">
        <button type="button" class="game-headline">
          <i class="title-icon" aria-hidden="true"></i>
          <p class="title-text">{{ section.name }}</p>
        </button>

        <div v-if="gameList.length > 1" class="arrow-box">
          <button
            type="button"
            class="arrow-left arrow"
            :class="{ disabled: !canSlidePrev }"
            aria-label="上一个"
            @click.stop="scrollFeatured(-1)"
          >
            <svg-icon name="img_scroll_jt" class-name="!text-white !text-[8px] rotate-[180deg]" />
          </button>
          <button
            type="button"
            class="arrow-right arrow"
            :class="{ disabled: !canSlideNext }"
            aria-label="下一个"
            @click.stop="scrollFeatured(1)"
          >
            <svg-icon name="img_scroll_jt" class-name="!text-white !text-[8px] ml-[3px]" />
          </button>
        </div>

        <div class="list-container">
          <section class="list-slide-layout scroll-box-transform list-slide-typesetting is-slide-one-screen list-swiper">
            <van-swipe
              ref="featuredSwiper"
              class="swiper"
              :loop="false"
              :show-indicators="true"
              @change="handleFeaturedChange"
            >
              <van-swipe-item
                v-for="(game, index) in gameList"
                :key="game.id ?? index"
                class="slide-pagination"
              >
                <div class="list-slide-layout-inner">
                  <section class="list-ordinary">
                    <section class="list-ordinary-layout">
                      <button
                        type="button"
                        class="lobby-image lobby-image--use-bg lobby-image--skeleton poster-image poster-box-core vertical-bottom-name"
                        @click.stop="selectGame(game)"
                      >
                        <HomeSkeletonImage :src="game.image" :alt="String(game.name ?? '')" />
                        <div class="game-platform-name">
                          <span
                            class="lobby-image lobby-image--use-bg name-bg"
                            :style="{ backgroundImage: `url(${nameShade})` }"
                          ></span>
                          <section dir="ltr" class="game-name-normal line-two">
                            <h4 class="name-inner">{{ game.name }}</h4>
                          </section>
                        </div>
                        <section class="favorite-area circle-star favorite-icon" aria-hidden="true">
                          <img class="lobby-image circle-star-icon" :src="favoriteIcon" alt="" />
                        </section>
                        <section v-if="!isGameOpen(game)" class="mask-maintain position-center" aria-hidden="true">
                          <img class="lobby-image lobby-image--use-bg maintain-icon" :src="maintenanceIcon" alt="" />
                        </section>
                      </button>
                    </section>
                  </section>
                </div>
              </van-swipe-item>
            </van-swipe>
          </section>

          <section
            v-if="indicatorList.length > 1 && false"
            class="list-slide-layout scroll-box-transform slide-indicator indicator"
          >
            <div class="list-slide-layout-inner scroll-box-transform-inner">
              <button
                v-for="index in indicatorList"
                :key="index"
                type="button"
                class="list-slide-dot"
                :class="{ 'is-active': index === activeSlideIndex }"
                :aria-label="`第${index + 1}个`"
                @click.stop="scrollToFeatured(index)"
              ></button>
            </div>
          </section>
        </div>
      </section>
    </template>

    <template v-else>
      <button type="button" class="game-title">
        <span v-if="variant === 'grid'" class="title">{{ section.name }}</span>
        <template v-else>{{ section.name }}</template>
        <span
          class="lobby-image lobby-image--use-bg title-icon"
          :style="{ backgroundImage: `url(${arrowIcon})` }"
        ></span>
      </button>

      <div class="ui-placeholder ui-placeholder--container">
        <section class="list-ordinary">
          <section class="list-ordinary-layout">
            <button
              v-for="(game, index) in gameList"
              :key="game.id ?? index"
              type="button"
              class="lobby-image lobby-image--use-bg lobby-image--skeleton poster-image poster-img-box-core square-below-name"
              @click.stop="selectGame(game)"
            >
              <HomeSkeletonImage :src="game.image" :alt="String(game.name ?? '')" />
              <section v-if="!isGameOpen(game)" class="mask-maintain position-center" aria-hidden="true">
                <img class="lobby-image lobby-image--use-bg maintain-icon" :src="maintenanceIcon" alt="" />
              </section>
            </button>
          </section>
        </section>
      </div>
    </template>
  </article>
</template>

<style scoped lang="less">
.game-box {
  box-sizing: border-box;
}

.head-box,
.game-headline,
.arrow,
.list-slide-dot,
.poster-image {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.game-box {
  min-width: 0;
  overflow: hidden;
  border-radius: 10px;
  background-color: rgba(var(--skin__bg_2__toRgbString), 0.75);
  border: 1px solid var(--skin__bg_2);
  cursor: pointer;
}

.game-box[data-layout="featured"] {
  position: relative;
  width: 100%;
  height: 230px;
}

.game-box[data-layout="wide"] {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 110px;
}

.game-box[data-layout="grid"] {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 103.5px;
}

.head-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 28px;
  z-index: 2;
}

.head-box .title-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  margin-top: -6px;
  width: 12px;
  height: 12px;
  background-size: 100% 100%;
}

.layout-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.list-slide-view-more {
  padding: 0;
}

.game-headline {
  padding: 0;
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__neutral_1);
}

.game-headline .title-icon {
  display: none;
  width: 0;
}

.game-headline .title-text {
  margin: 0;
  color: var(--skin__neutral_1);
  font-size: 11px;
  line-height: 1;
}

.list-container {
  width: 100%;
  height: calc(100% - 28px);
  padding-bottom: 11.5px;
  position: relative;
}

.scroll-box-transform {
  width: 145.5px;
  height: 190px;
}

.list-swiper {
  width: 145.5px;
  height: 190px;
  margin: 0 auto;
  overflow: hidden;

  --van-swipe-indicator-margin: 10px;
  --van-swipe-indicator-active-background: white;
  //--van-swipe-indicator-size: 4px;
}

.list-swiper > .swiper {
  width: 100%;
  height: 100%;
}

.list-swiper :deep(.van-swipe__track) {
  height: 100%;
}

.list-swiper :deep(.van-swipe-item) {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.list-swiper .slide-pagination {
  height: 190px;
}

.list-swiper .slide-pagination > .list-slide-layout-inner {
  width: 145.5px;
  height: 190px;
}

.arrow-box {
  position: absolute;
  width: 100%;
}

.arrow {
  position: absolute;
  top: 115px;
  width: 16.5px;
  height: 16.5px;
  border-radius: 100%;
  background: rgba(0, 0, 0, 0.2) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  color: #fff;
}

.arrow img {
  width: 9px;
  height: 9px;
  object-fit: contain;
}

.arrow-left {
  left: 5px;
}

.arrow-left img {
  transform: rotate(180deg);
}

.arrow-right {
  right: 5px;
}

.disabled {
  display: none !important;
}

.slide-indicator {
  box-sizing: content-box;
  width: fit-content;
  max-width: 76px;
  padding: 1px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  margin: auto;
  z-index: 1;
  overflow: hidden;
}

.slide-indicator > .list-slide-layout-inner {
  display: flex;
  gap: 4px;
  width: fit-content;
}

.list-slide-dot {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.34);
  opacity: 0.98;
  transition: all 0.3s;
}

.list-slide-dot.is-active {
  background-color: #fff;
}

.list-ordinary {
  width: fit-content;
}

.list-ordinary > .list-ordinary-layout {
  display: flex;
  flex-wrap: wrap;
}

.poster-image {
  --poster-image-border-width: 0;
  --poster-image-border-color: var(--skin__web_plat_line);
  --poster-image-border-radius: var(--poster-image-border-base-radius);
  color: var(--skin__ddt_icon);
  border-style: solid;
  border-width: var(--poster-image-border-width);
  border-color: var(--poster-image-border-color);
  border-radius: var(--poster-image-border-radius);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;
  overflow: hidden;
}

.poster-image > .lobby-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.poster-box-core {
  --card-benchmark: 145.5px;
  --poster-image-border-base-radius: calc(var(--card-benchmark) * 0.06872852);
  --poster-box-core-width: var(--card-benchmark);
  --poster-box-core-height: calc(var(--card-benchmark) * 1.306);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: var(--poster-box-core-width);
  height: var(--poster-box-core-height);
}

.vertical-bottom-name .favorite-icon {
  position: absolute;
  top: calc(var(--card-benchmark) * 0.0275);
  right: calc(var(--card-benchmark) * 0.0275);
}

.favorite-area {
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: fit-content;
  margin: -3px;
  padding: 3px;
  line-height: 0;
  cursor: pointer;
}

.circle-star-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

.game-platform-name {
  z-index: 1;
  position: absolute;
  font-size: 12px;
  bottom: 0;
  width: 100%;
  height: 50px;
  text-align: center;
  left: 0;
}

.game-platform-name .name-bg {
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  background-size: 100% 100%;
}

.game-name-normal {
  width: 100%;
  text-align: center;
  overflow: hidden;
}

.game-name-normal .name-inner {
  bottom: 19.5px;
  position: absolute;
  width: 100%;
  margin: 0;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
}

.game-name-normal.line-two .name-inner {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.game-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  font-size: 11px;
  height: 24px;
  width: 100%;
  color: var(--skin__neutral_1);
  background: transparent;
  position: relative;
  cursor: pointer;
}

.game-title .title-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  margin-top: -4.5px;
  width: 9px;
  height: 9px;
  background-size: 100% 100%;
}

.game-box[data-layout="wide"] .game-title .title-icon {
  right: 8px;
  margin-top: -6px;
  width: 12px;
  height: 12px;
}

.game-box[data-layout="grid"] .game-title .title {
  max-width: 58px;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
}

.game-box[data-layout="wide"] .ui-placeholder,
.game-box[data-layout="grid"] .ui-placeholder {
  display: flex;
  justify-content: center;
  width: 100%;
}

.game-box[data-layout="wide"] .list-ordinary-layout {
  width: 150px;
  height: 70px;
  column-gap: 10px;
}

.game-box[data-layout="wide"] .poster-img-box-core {
  --card-benchmark: 69.5px;
  --poster-image-border-base-radius: calc(var(--card-benchmark) * 0.1714);
}

.game-box[data-layout="grid"] .list-ordinary-layout {
  width: 69px;
  height: 68px;
  display: grid;
  grid-template-columns: repeat(2, 31px);
  grid-template-rows: repeat(2, 31px);
  column-gap: 7px;
  row-gap: 6px;
}

.game-box[data-layout="grid"] .poster-img-box-core {
  --card-benchmark: 31px;
  --poster-image-border-base-radius: calc(var(--card-benchmark) * 0.1714);
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
}

.mask-maintain {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: inherit;
  cursor: not-allowed;
  opacity: 1;
  transition: opacity 0.6s;
}

.position-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.maintain-icon {
  width: var(--maintain-icon-size, 56%);
  height: var(--maintain-icon-size, 56%);
  object-fit: contain;
}

.poster-box-core .maintain-icon {
  --maintain-icon-size: calc(var(--card-benchmark) * 1);
}

:global([dir="rtl"]) .head-box {
  left: auto;
  right: 0;
}

:global([dir="rtl"]) .head-box .title-icon,
:global([dir="rtl"]) .game-title .title-icon {
  right: auto;
  left: 5px;
  transform: rotate(180deg);
}

:global([dir="rtl"]) .game-box[data-layout="wide"] .game-title .title-icon {
  right: auto;
  left: 8px;
}

:global([dir="rtl"]) .arrow-left {
  left: auto;
  right: 5px;
}

:global([dir="rtl"]) .arrow-right {
  right: auto;
  left: 5px;
}

:global([dir="rtl"]) .arrow-left img {
  transform: rotate(0);
}

:global([dir="rtl"]) .arrow-right img {
  transform: rotate(180deg);
}

:global([dir="rtl"]) .vertical-bottom-name .favorite-icon {
  right: auto;
  left: calc(var(--card-benchmark) * 0.0275);
}

:global([dir="rtl"]) .game-platform-name {
  left: auto;
  right: 0;
}
</style>
