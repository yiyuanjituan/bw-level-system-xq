<script setup lang="ts">
import { computed, onMounted } from "vue";
import UiTabs from "@/components/UI/tabs.vue";
import HomeGameSection from "@/components/Home/GameSection.vue";
import { getHomeApiData } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import router from "@/router";
import useHomeDataStore from "@/store/modules/home";
import useDataStore from "@/store/modules/data";
import useAuthStore from "@/store/modules/user";
import type { HomeGameRecord, HomeGameSectionRecord } from "@/components/Home/types";
import hotIcon from "@/assets/home/icon_dtfl_rm_1.avif";
import recentIcon from "@/assets/home/icon_dtfl_zj_1.avif";
import favoriteIcon from "@/assets/home/icon_dtfl_sc_1.avif";

defineOptions({
  name: "HomeGameList"
});

const home = useHomeDataStore();
const appData = useDataStore();
const auth = useAuthStore();

const fixedSectionList = computed<HomeGameSectionRecord[]>(() => [
  {
    img: hotIcon,
    name: $t("热门"),
    pageShowNum: 9,
    children: normalizeGameList(home.suggestList)
  },
  {
    img: recentIcon,
    name: $t("最近"),
    children: []
  },
  {
    img: favoriteIcon,
    name: $t("收藏"),
    children: []
  }
]);

const sectionList = computed<HomeGameSectionRecord[]>(() => {
  const categorySections = normalizeSectionList(home.venueList);

  return [
    fixedSectionList.value[0],
    ...categorySections,
    fixedSectionList.value[1],
    fixedSectionList.value[2]
  ];
});

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

async function getHomeData() {
  try {
    const response = await getHomeApiData();
    home.setSuggestData(response?.suggestData ?? []);
    home.setVenueList(response?.venueList ?? []);
  } catch (error) {
    console.error("获取首页游戏数据失败，失败原因：", error);
  }
}

function showDisabledTip() {
  showCustomToast({ type: "fail", message: $t("tips.maintenance") });
}

function clickGameItem(record: HomeGameRecord) {
  if (record.gameMode === "venue") {
    const platformId = ["4", "5"].includes(String(record.type)) ? 0 : record.id;
    router.push({ path: "/home/subGame", query: { type: record.type, platformId } });
    return;
  }

  appData.setEnterInfo(record.venueId, record.id);
  void auth.updateInfo();
  router.push({ path: "/home/embedded" });
}

onMounted(() => {
  void getHomeData();
});
</script>

<template>
  <div class="home-game-list">
    <ui-tabs :list="sectionList" panel-scroll>
      <template #panel="{ row }">
        <home-game-section
          :section="row"
          @select="clickGameItem"
          @disabled="showDisabledTip"
        />
      </template>
    </ui-tabs>
  </div>
</template>

<style scoped lang="less">
.home-game-list {
  width: 100%;
}
</style>
