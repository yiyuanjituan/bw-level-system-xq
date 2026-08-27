<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import router from "@/router";
import { getHomeApiData } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import UGameBox from "@/components/Home/UGameBox.vue";
import UGameCategoryDialog from "@/components/Home/UGameCategoryDialog.vue";
import useHomeDataStore from "@/store/modules/home";
import useDataStore from "@/store/modules/data";
import useAuthStore from "@/store/modules/user";
import type { HomeGameRecord, HomeGameSectionRecord } from "@/components/Home/types";
import recentIcon from "@/assets/home/u-series/img_gd_dtfl_zj.png";
import favoriteIcon from "@/assets/home/u-series/img_gd_dtfl_sc.png";
import arrowIcon from "@/assets/home/u-series/img_scroll_tkjt.png";

defineOptions({
  name: "UHomeGameList"
});

const home = useHomeDataStore();
const appData = useDataStore();
const auth = useAuthStore();
const categoryDialogVisible = ref(false);
const activeSection = ref<HomeGameSectionRecord | null>(null);

const hotSection = computed<HomeGameSectionRecord>(() => ({
  name: $t("热门"),
  children: normalizeGameList(home.suggestList)
}));
const categorySections = computed<HomeGameSectionRecord[]>(() => normalizeSectionList(home.venueList));
const visibleCategorySections = computed<HomeGameSectionRecord[]>(() => (
  categorySections.value.filter(section => hasGameData(section))
));

function normalizeGameList(value: unknown): HomeGameRecord[] {
  return Array.isArray(value) ? value : [];
}

function normalizeSectionList(value: unknown): HomeGameSectionRecord[] {
  if (!Array.isArray(value)) return [];

  return value.map(section => ({
    ...section,
    name: String(section?.name ?? ""),
    children: normalizeGameList(section?.children)
  }));
}

function hasGameData(section: HomeGameSectionRecord) {
  return normalizeGameList(section.children).length > 0;
}

async function loadHomeGames() {
  try {
    const response = await getHomeApiData();
    home.setSuggestData(response?.suggestData ?? []);
    home.setVenueList(response?.venueList ?? []);
  } catch (error) {
    console.error("获取U站首页游戏数据失败，失败原因：", error);
  }
}

function showDisabledTip() {
  showCustomToast({ type: "fail", message: $t("tips.maintenance") });
}

function openGame(record: HomeGameRecord) {
  categoryDialogVisible.value = false;

  if (record.gameMode === "venue") {
    const platformId = ["4", "5"].includes(String(record.type)) ? 0 : record.id;
    void router.push({
      path: "/home/subGame",
      query: {
        type: record.type,
        platformId: platformId ?? 0
      }
    });
    return;
  }

  // @ts-ignore
  appData.setEnterInfo(record.venueId, record.id);
  void auth.updateInfo();
  void router.push({ path: "/home/embedded" });
}

function openSection(section: HomeGameSectionRecord) {
  activeSection.value = section;
  categoryDialogVisible.value = true;
}

function openFullSection(section: HomeGameSectionRecord) {
  const type = section.type ?? visibleCategorySections.value[0]?.type;
  if (type == null) return;

  categoryDialogVisible.value = false;
  void router.push({
    path: "/home/subGame",
    query: {
      type,
      platformId: 0
    }
  });
}

function openHistory(type: 100 | 101) {
  void router.push({
    path: "/home/subGame",
    query: { type, platformId: 0 }
  });
}

onMounted(() => {
  void loadHomeGames();
});
</script>

<template>
  <section class="game-list-wrapper">
    <div class="game-list-wrapper-inner">
      <UGameBox
        v-if="hasGameData(hotSection)"
        :section="hotSection"
        :game-index="0"
        variant="featured"
        @select="openGame"
        @disabled="showDisabledTip"
        @more="openSection"
      />

      <UGameBox
        v-for="(section, index) in visibleCategorySections"
        :key="section.id ?? section.type ?? index"
        :section="section"
        :game-index="index + 1"
        :variant="index < 2 ? 'wide' : 'grid'"
        @select="openGame"
        @disabled="showDisabledTip"
        @more="openSection"
      />

      <article class="game-box game-box-default" data-layout="more">
        <div class="game-title">
          {{ $t("更多") }}
          <span
            class="lobby-image lobby-image--use-bg title-icon"
            :style="{ backgroundImage: `url(${arrowIcon})` }"
          ></span>
        </div>

        <section class="list-ordinary">
          <section class="list-ordinary-layout">
            <button type="button" :aria-label="$t('最近')" @click="openHistory(100)">
              <img
                :src="recentIcon"
                class="lobby-image lobby-image--use-bg lobby-image--skeleton poster-image more-card"
                alt=""
              />
            </button>
            <button type="button" :aria-label="$t('收藏')" @click="openHistory(101)">
              <img
                :src="favoriteIcon"
                class="lobby-image lobby-image--use-bg lobby-image--skeleton poster-image more-card"
                alt=""
              />
            </button>
          </section>
        </section>
      </article>
    </div>

    <UGameCategoryDialog
      v-model="categoryDialogVisible"
      :section="activeSection"
      @select="openGame"
      @disabled="showDisabledTip"
      @more="openFullSection"
    />
  </section>
</template>

<style scoped lang="less">
.game-list-wrapper {
  width: 100%;
}

.game-list-wrapper > .game-list-wrapper-inner {
  padding: 10px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box {
  min-width: 0;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="featured"] {
  grid-area: 1 / 1 / 3 / 3;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="wide"] {
  grid-column: span 2;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="wide"]:nth-of-type(2) {
  grid-area: 1 / 3 / 2 / 5;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="wide"]:nth-of-type(3) {
  grid-area: 2 / 3 / 3 / 5;
}

.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="grid"],
.game-list-wrapper > .game-list-wrapper-inner > .game-box[data-layout="more"] {
  grid-column: span 1;
}

.game-box[data-layout="more"] {
  height: 103.5px;
  border-radius: 10px;
  background-color: rgba(var(--skin__bg_2__toRgbString), 0.75);
  border: 1px solid var(--skin__bg_2);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.game-box[data-layout="more"] .game-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  height: 22.5px;
  width: 100%;
  position: relative;
  color: var(--skin__neutral_1);
}

.game-box[data-layout="more"] .title-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  margin-top: -4.5px;
  width: 9px;
  height: 9px;
  background-size: 100% 100%;
}

.game-box[data-layout="more"] .list-ordinary {
  width: fit-content;
}

.game-box[data-layout="more"] .list-ordinary-layout {
  width: 69px;
  height: 31px;
  display: grid;
  grid-template-columns: repeat(2, 31px);
  column-gap: 7px;
}

.game-box[data-layout="more"] .list-ordinary-layout > button {
  width: 31px;
  height: 31px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.game-box[data-layout="more"] .poster-image {
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center center;
  overflow: hidden;
}

.game-box[data-layout="more"] .more-card {
  width: 31px;
  height: 31px;
  border-radius: 5.3px;
}

:global([dir="rtl"]) .game-box[data-layout="more"] .title-icon {
  right: auto;
  left: 5px;
  transform: rotate(180deg);
}
</style>
