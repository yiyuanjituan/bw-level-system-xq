<script setup lang="ts">
import { computed } from "vue";
import { $t } from "@/locales";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import XButton from "@/components/X/x-button.vue";
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
  "update:modelValue": [value: boolean];
  select: [record: HomeGameRecord];
  disabled: [];
  more: [section: HomeGameSectionRecord];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});
const gamePages = computed(() => {
  const gameList = Array.isArray(props.section?.children) ? props.section.children : [];
  const pages: HomeGameRecord[][] = [];

  for (let index = 0; index < gameList.length; index += 9) {
    pages.push(gameList.slice(index, index + 9));
  }
  return pages.length ? pages : [[]];
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

function viewMore() {
  if (!props.section) return;
  emit("more", props.section);
}
</script>

<template>
  <van-dialog
    v-model:show="visible"
    class="u-category-dialog"
    overlay-class="u-category-dialog-overlay"
    width="min(312.5px, calc(100vw - 40px))"
    teleport="body"
    close-on-popstate
    :close-on-click-overlay="true"
    :show-confirm-button="false"
    :show-cancel-button="false"
  >
    <div class="u-category-dialog__body">
      <img :src="arrowIcon" class="u-category-dialog__arrow" alt="" />
      <h2 class="u-category-dialog__title">{{ section?.name }}</h2>

      <van-swipe class="u-category-dialog__swipe" indicator-color="var(--skin__text_primary)">
        <van-swipe-item v-for="(page, pageIndex) in gamePages" :key="pageIndex">
          <div class="u-category-dialog__grid">
            <button
              v-for="(game, gameIndex) in page"
              :key="game.id ?? gameIndex"
              type="button"
              class="u-category-dialog__game"
              @click="selectGame(game)"
            >
              <span class="u-category-dialog__image-wrap">
                <HomeSkeletonImage
                  :src="game.image"
                  :alt="String(game.name ?? '')"
                  class="u-category-dialog__image"
                />
                <img
                  v-if="game.gameMode !== 'venue'"
                  :src="favoriteIcon"
                  class="u-category-dialog__favorite"
                  alt=""
                />
                <span v-if="!isGameOpen(game)" class="u-category-dialog__maintenance">
                  <img :src="maintenanceIcon" alt="" />
                </span>
              </span>
              <span class="u-category-dialog__name">{{ game.name }}</span>
            </button>
          </div>
        </van-swipe-item>
      </van-swipe>

      <XButton plain size="mini" class="u-category-dialog__more" @click="viewMore">
        {{ $t("查看更多") }}
      </XButton>
    </div>
  </van-dialog>
</template>

<style scoped lang="less">
:global(.u-category-dialog-overlay) {
  background: rgba(162, 177, 195, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.u-category-dialog {
  height: min(376px, calc(100vh - 60px));
  overflow: hidden;
  border: 0;
  border-radius: 20px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.7);

  :deep(.van-dialog__content) {
    height: 100%;
  }
}

.u-category-dialog__body {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 14px 10px 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.u-category-dialog__arrow {
  position: absolute;
  top: 14px;
  right: 13px;
  width: 12px;
  height: 12px;
}

.u-category-dialog__title {
  height: 25px;
  margin: 0 0 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__neutral_1);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
}

.u-category-dialog__swipe {
  width: 100%;
  flex: 1;
  min-height: 0;
  --van-swipe-indicator-size: 6px;
  --van-swipe-indicator-margin: 4px;

  :deep(.van-swipe__track),
  :deep(.van-swipe-item) {
    height: 100%;
  }

  :deep(.van-swipe__indicators) {
    bottom: 3px;
  }

  :deep(.van-swipe__indicator) {
    background: var(--skin__neutral_3);
    opacity: 1;
  }
}

.u-category-dialog__grid {
  height: calc(100% - 17px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  column-gap: 0;
  row-gap: 3.5px;
}

.u-category-dialog__game {
  min-width: 0;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  cursor: pointer;
}

.u-category-dialog__image-wrap {
  position: relative;
  width: min(73px, calc(100% - 14px));
  aspect-ratio: 1;
  flex: none;
}

.u-category-dialog__image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.u-category-dialog__favorite {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  width: 20px;
  height: 20px;
}

.u-category-dialog__maintenance {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.58);

  img {
    width: 56%;
    height: auto;
  }
}

.u-category-dialog__name {
  width: 95px;
  max-width: 100%;
  margin-top: 3px;
  overflow: hidden;
  font-size: 10px;
  line-height: 13px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.u-category-dialog__more {
  height: 22px;
  margin: 3px auto 0;
  padding: 0 5px;
  flex: none;
  border: 0;
  border-bottom: 1px solid var(--skin__primary);
  color: var(--skin__primary);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

:deep(.u-category-dialog__more .x-button__text) {
  line-height: 20px;
}

:global([dir="rtl"]) .u-category-dialog__arrow {
  right: auto;
  left: 13px;
  transform: rotate(180deg);
}

:global([dir="rtl"]) .u-category-dialog__favorite {
  right: auto;
  left: 2px;
}
</style>
