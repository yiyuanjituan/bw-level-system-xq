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

  appData.setEnterInfo(record.venueId, record.id);
  void auth.updateInfo();
  void router.push({ path: "/home/embedded" });
}

function openSection(section: HomeGameSectionRecord) {
  activeSection.value = section;
  categoryDialogVisible.value = true;
}

function openFullSection(section: HomeGameSectionRecord) {
  const type = section.type ?? categorySections.value[0]?.type;
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
  <section class="u-game-list">
    <div class="u-game-list__grid">
      <UGameBox
        class="u-game-list__featured"
        :section="hotSection"
        variant="featured"
        @select="openGame"
        @disabled="showDisabledTip"
        @more="openSection"
      />

      <UGameBox
        v-for="(section, index) in categorySections"
        :key="section.id ?? section.type ?? index"
        class="u-game-list__category"
        :class="{ 'u-game-list__category--compact': index < 2 }"
        :section="section"
        :variant="index < 2 ? 'compact' : 'regular'"
        @select="openGame"
        @disabled="showDisabledTip"
        @more="openSection"
      />

      <article class="u-game-list__more">
        <header>{{ $t("更多") }}</header>
        <div>
          <button type="button" @click="openHistory(100)">
            <img :src="recentIcon" alt="" />
            <span>{{ $t("最近") }}</span>
          </button>
          <button type="button" @click="openHistory(101)">
            <img :src="favoriteIcon" alt="" />
            <span>{{ $t("收藏") }}</span>
          </button>
        </div>
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
.u-game-list {
  padding: 10px;
}

.u-game-list__grid {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.u-game-list__featured {
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
}

.u-game-list__category {
  grid-column: span 2;

  &--compact {
    grid-column: 3 / span 2;
  }
}

.u-game-list__more {
  grid-column: span 2;
  height: 150px;
  padding: 0 10px 10px;
  overflow: hidden;
  border: 1px solid var(--skin__bg_2);
  border-radius: 10px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.75);

  header {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--skin__neutral_1);
    font-size: 11px;
  }

  > div {
    height: calc(100% - 28px);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  button {
    min-width: 0;
    padding: 6px 3px 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 0;
    border-radius: 7px;
    color: var(--skin__neutral_1);
    background: var(--skin__ddt_bg);
    font-size: 10px;
    cursor: pointer;

    img {
      width: min(55px, 80%);
      height: min(55px, 70%);
      margin-bottom: 5px;
      object-fit: contain;
    }
  }
}

@media (min-width: 560px) {
  .u-game-list__grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .u-game-list__featured {
    grid-column: span 2;
  }

  .u-game-list__category,
  .u-game-list__category--compact,
  .u-game-list__more {
    grid-column: span 2;
  }
}
</style>
