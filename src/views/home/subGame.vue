<script lang="ts" setup>
import SubNavbar from "@/components/SubNavbar.vue";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import XInput from "@/components/X/x-input.vue";
import XLoading from "@/components/X/x-loading.vue";
import XTab from "@/components/X/x-tab.vue";
import XTabs from "@/components/X/x-tabs.vue";
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import useAppStore from "@/store/modules/app";
import router from "@/router";
import { getGameListById, getTrialGameList, type TrialGameListResponse } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import UiEmpty from "@/components/UI/empty.vue";
import useDataStore from "@/store/modules/data";
import useAuthStore from "@/store/modules/user";

const showNext = ref<boolean>(false);
const route = useRoute();
const app = useAppStore();
const appData = useDataStore();
const gameTypeVenueList = ref<any[]>([]);
const gameTypeVenueId = ref<string | number>(0);
const TRIAL_GAME_TYPE = "20";
const PAGE_SIZE = 30;
const currentPage = ref(1);
const trialGameList = ref<TrialGameListResponse["gameList"]>([]);
const trialGameCache = new Map<string, TrialGameListResponse>();
const enum // 使用枚举定义
RightKeyEnum {
  ALL = "all",
  HOT = "hot",
  LAST = "last",
  COLLECT = "collect"
}
interface RightItem {
  key: string;
  name: string;
}
const rightList = ref<RightItem[]>([
  { key: RightKeyEnum.ALL, name: "全部" },
  { key: RightKeyEnum.HOT, name: "热门" },
  { key: RightKeyEnum.LAST, name: "最近" },
  { key: RightKeyEnum.COLLECT, name: "收藏" }
]);
const trialClassifyList: RightItem[] = [
  { key: "0", name: "全部" },
  { key: "6", name: "棋牌" },
  { key: "2", name: "捕鱼" },
  { key: "3", name: "电子" },
  { key: "1", name: "真人" },
  { key: "4", name: "彩票" },
  { key: "5", name: "体育" },
  { key: "7", name: "电竞" }
];
const rightKey: Ref<string> = ref(RightKeyEnum.ALL);
const auth = useAuthStore();
const isLoading = ref<boolean>(false);
const isLongImageDisplay = computed(() => app.gameImageDisplay === "long");
const isTrialPage = computed(() => route.query?.type == TRIAL_GAME_TYPE);
const isLotteryOrSportsPage = computed(() => ["4", "5"].includes(String(route.query?.type)));
const showVenueSidebar = computed(() => !isLotteryOrSportsPage.value);
const gameList = computed(() => {
  if (isTrialPage.value) return trialGameList.value;
  const id = Number(gameTypeVenueId.value);
  const info = app.gameList.find(v => v.id == id);
  return info?.children ?? [];
});
const totalPages = computed(() => Math.ceil(gameList.value.length / PAGE_SIZE));
const paginatedGameList = computed(() => {
  const startIndex = (currentPage.value - 1) * PAGE_SIZE;
  return gameList.value.slice(startIndex, startIndex + PAGE_SIZE);
});

function handleScroll(event: Event) {
  const target = event.target as HTMLElement;
  const { scrollHeight, scrollTop, clientHeight } = target;
  showNext.value = scrollHeight - scrollTop - clientHeight > 2;
}

function showTip() {
  // @ts-ignore
  showCustomToast({ type: "fail", message: $t("tips.maintenance") });
}

function isEnabledFlag(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function isGameOpen(record: any) {
  return isEnabledFlag(record?.isOpen);
}

function isRecommendGame(record: any) {
  return isEnabledFlag(record?.recommended)
    || isEnabledFlag(record?.isRecommend)
    || isEnabledFlag(record?.is_recommend)
    || isEnabledFlag(record?.recommend);
}

function updateActiveKey(key: any) {
  rightKey.value = key;
  currentPage.value = 1;
  if (isTrialPage.value) {
    loadGameListData();
    return;
  }
  handleChangeTab({ id: 0 });
}

const typeData = computed(() => {
  const type = route.query?.type;
  if (!type) return { name: "" };
  if (type == "1") return { name: "真人", image: "game-icon_dtfl_zr_0" };
  if (type == "2") return { name: "捕鱼", image: "game-icon_dtfl_by_0" };
  if (type == "3") return { name: "电子", image: "game-icon_dtfl_dz_0" };
  if (type == "4") return { name: "彩票", image: "game-icon_dtfl_cp_0" };
  if (type == "5") return { name: "体育", image: "game-icon_dtfl_ty_0" };
  if (type == "6") return { name: "棋牌", image: "game-icon_dtfl_qp_0" };
  if (type == "7") return { name: "电竞", image: "game-icon_dtfl_dianjing_0" };
  if (type == TRIAL_GAME_TYPE) return { name: "试玩", image: "game-icon_dtfl_sw_0" };
  if (type == "100") return { name: "最近" };
  if (type == "101") return { name: "收藏" };
  return {};
});

function init() {
  const type = route.query?.type;
  showNext.value = false;
  if (isLotteryOrSportsPage.value && Number(route.query?.platformId) !== 0) {
    router.replace({ path: route.path, query: { ...route.query, platformId: 0 } });
    return;
  }
  // 设置激活的按钮
  gameTypeVenueId.value = Number(route.query?.platformId);
  currentPage.value = 1;
  if (isTrialPage.value) {
    rightList.value = trialClassifyList;
    if (!trialClassifyList.some(item => item.key === rightKey.value)) {
      rightKey.value = "0";
    }
    loadGameListData();
    return;
  }
  gameTypeVenueList.value = app.venueList.filter(v => v.type == type);
  if (isLotteryOrSportsPage.value) {
    rightList.value = [
      { key: RightKeyEnum.ALL, name: "全部" },
      { key: RightKeyEnum.LAST, name: "最近" },
      { key: RightKeyEnum.COLLECT, name: "收藏" }
    ];
    if (!rightList.value.some(filterOption => filterOption.key === rightKey.value)) {
      rightKey.value = RightKeyEnum.ALL;
    }
    loadGameListData();
    return;
  }
  // 设置rightList
  if (gameTypeVenueId.value === 0) {
    rightList.value = [
      { key: RightKeyEnum.HOT, name: "热门" },
      { key: RightKeyEnum.LAST, name: "最近" },
      { key: RightKeyEnum.COLLECT, name: "收藏" }
    ];
    if (rightKey.value == "all") rightKey.value = RightKeyEnum.HOT;
  } else {
    rightList.value = [
      { key: RightKeyEnum.ALL, name: "全部" },
      { key: RightKeyEnum.HOT, name: "热门" },
      { key: RightKeyEnum.LAST, name: "最近" },
      { key: RightKeyEnum.COLLECT, name: "收藏" }
    ];
    if (rightKey.value != "all") rightKey.value = RightKeyEnum.ALL;
  }
  loadGameListData();
}

function updateActiveVenue(venueId: string | number) {
  const nextVenueId = Number(venueId);
  const activeVenue = nextVenueId === 0
    ? { id: 0 }
    : gameTypeVenueList.value.find(item => Number(item.id) === nextVenueId);

  if (!activeVenue) return;
  handleChangeTab(activeVenue);
}

function loadGameListData() {
  if (isTrialPage.value) {
    const venueId = Number(gameTypeVenueId.value);
    const gameClassify = Number(rightKey.value);
    const cacheKey = `${venueId}:${gameClassify}`;
    const cachedTrialData = trialGameCache.get(cacheKey);

    if (cachedTrialData) {
      gameTypeVenueList.value = cachedTrialData.venueList;
      trialGameList.value = cachedTrialData.gameList;
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    getTrialGameList({ venueId, gameClassify })
      .then(response => {
        const trialData = {
          venueList: response.venueList ?? [],
          gameList: response.gameList ?? []
        };
        trialGameCache.set(cacheKey, trialData);

        // 快速切换筛选条件时，只允许当前条件的请求更新页面。
        const currentCacheKey = `${Number(gameTypeVenueId.value)}:${Number(rightKey.value)}`;
        if (!isTrialPage.value || currentCacheKey !== cacheKey) return;
        gameTypeVenueList.value = trialData.venueList;
        trialGameList.value = trialData.gameList;
      })
      .finally(() => {
        const currentCacheKey = `${Number(gameTypeVenueId.value)}:${Number(rightKey.value)}`;
        if (isTrialPage.value && currentCacheKey === cacheKey) {
          isLoading.value = false;
        }
      });
    return;
  }
  isLoading.value = true;
  const params = {
    id: gameTypeVenueId.value,
    type: route.query?.type,
    mode: rightKey.value
  };
  getGameListById(params)
    .finally(() => (isLoading.value = false))
    .then(res => {
      app.setGameList(Number(gameTypeVenueId.value), res);
    });
}

async function handleChangeTab(record: any) {
  const venueId = Number(record.id);
  currentPage.value = 1;
  if (isTrialPage.value && venueId === 0) {
    rightKey.value = "0";
  }
  if (Number(route.query?.platformId) === venueId) {
    loadGameListData();
    return;
  }
  await router.replace({ path: route.path, query: { ...route.query, platformId: record.id } });
  // 强制重新渲染
  await nextTick();
}

watch(() => route.fullPath, () => init());

function enterGame(record: any) {
  appData.setEnterInfo(record.venueId, record.id, isTrialPage.value ? 1 : undefined);
  if (!isTrialPage.value) {
    auth.updateInfo();
  }
  router.push({ path: "/home/embedded" });
}

function handleGameClick(record: any) {
  if (!isGameOpen(record)) {
    showTip();
    return;
  }

  enterGame(record);
}

function checkHistory() {
  if (window.history.state.back == window.history.state.current) {
    window.history.back();
    setTimeout(() => checkHistory(), 100);
  }
}

onMounted(() => {
  init();
  checkHistory();
});
</script>

<template>
  <div class="secondary-page detail" :class="{ 'detail--long-image': isLongImageDisplay }">
    <sub-navbar :title="typeData.name" />
    <div class="content">
      <div class="page-body">
        <div class="search-layout">
          <div class="search-bar">
            <x-input :placeholder="$t('搜索游戏')" size="small" class="game-search">
              <template #suffix>
                <svg-icon name="comm_icon_ss" class-name="game-search__icon"></svg-icon>
              </template>
            </x-input>
          </div>
        </div>
        <div class="content-layout">
          <div class="inner-box" :class="{ 'inner-box--without-sidebar': !showVenueSidebar }">
            <div class="slider-box" v-if="showVenueSidebar">
              <x-tabs
                v-model:active="gameTypeVenueId"
                class="venue-tabs"
                position="left"
                shrink
                :show-nav-arrows="false"
                :line-width="0"
                :line-height="0"
                @change="updateActiveVenue"
                @scroll.capture="handleScroll"
              >
                <x-tab v-if="typeData.image" :name="0">
                  <template #title>
                    <div class="venue-tab" :class="{ 'venue-tab--active': gameTypeVenueId == 0 }">
                      <svg-icon :name="typeData.image" class-name="venue-tab__category-icon" />
                      <p>{{ typeData.name }}</p>
                    </div>
                  </template>
                </x-tab>
                <x-tab v-for="item in gameTypeVenueList" :key="item.id" :name="Number(item.id)">
                  <template #title>
                    <div class="venue-tab" :class="{ 'venue-tab--active': gameTypeVenueId == item.id }">
                      <img :src="item.short_image" alt="" />
                      <p>{{ item.apiCode }}</p>
                    </div>
                  </template>
                </x-tab>
              </x-tabs>
              <div class="next-box" v-if="showNext">
                <div class="down-indicator">
                  <svg-icon name="img_scroll_jt"></svg-icon>
                  <svg-icon name="img_scroll_jt"></svg-icon>
                </div>
              </div>
            </div>
            <div class="right-box">
              <x-tabs
                v-model:active="rightKey"
                class="scene-tabs"
                shrink
                :show-nav-arrows="false"
                :line-width="0"
                :line-height="0"
                @change="updateActiveKey"
              >
                <x-tab v-for="row in rightList" :key="row.key" :name="row.key">
                  <template #title>
                    <div class="nav-btn" :class="{ active: rightKey == row.key }">
                      {{ row.name }}
                    </div>
                  </template>
                </x-tab>
              </x-tabs>
              <div class="grid-game-col">
                <div class="loading-state" v-if="isLoading && gameList.length == 0">
                  <x-loading size="22px" />
                </div>
                <ui-empty v-if="!isLoading && gameList.length == 0" />
                <div class="scroll-box" v-if="gameList.length > 0">
                  <div class="grid-box">
                    <template v-for="item in paginatedGameList" :key="item.id">
                      <div
                        class="card-item"
                        @click="handleGameClick(item)"
                      >
                        <div class="card-image">
                          <home-skeleton-image :src="item.image" :alt="String(item.name ?? '')" class="poster-image" />
                          <div class="thumb-icon" v-if="isRecommendGame(item)"></div>
                          <div class="collect-icon">
                            <img src="@/assets/home/btn_sc_off_2.avif" alt="" class="collect-img" v-if="true" />
                            <img src="@/assets/home/btn_sc_on_2.avif" alt="" class="collect-img" v-if="false" />
                          </div>
                          <div class="disabled-box" @click.stop="showTip" v-if="!isGameOpen(item)">
                            <div class="disabled-icon"></div>
                          </div>
                          <section class="card-title card-title--overlay" v-if="isLongImageDisplay && !isLotteryOrSportsPage">
                            <h4 class="name-inner">{{ item.name }}</h4>
                          </section>
                        </div>
                        <section class="card-title" v-if="!isLongImageDisplay && !isLotteryOrSportsPage">
                          <h4 class="name-inner">{{ item.name }}</h4>
                        </section>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="footer" v-if="!isLoading && totalPages > 1">
                <van-pagination
                  v-model="currentPage"
                  :total-items="gameList.length"
                  :items-per-page="PAGE_SIZE"
                >
                  <template #prev-text>
                    <svg-icon name="arrow-back" class-name="pagination-icon pagination-icon--prev" />
                  </template>
                  <template #next-text>
                    <svg-icon name="arrow-back" class-name="pagination-icon pagination-icon--next" />
                  </template>
                  <template #page="{ number }">{{ number }}</template>
                </van-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.detail {
  --game-card-benchmark: 77px;
  --game-card-width: 85px;
  --game-grid-columns: 3;
  --game-grid-width: 270px;

  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.detail--long-image {
  --game-card-benchmark: 80px;
  --game-card-width: 80px;
  --game-grid-columns: 3;
  --game-grid-width: 260px;
}

:deep(.sub-header) {
  height: calc(var(--status-bar-height) + 45px);
  min-height: calc(var(--status-bar-height) + 45px);
  background-color: var(--skin__bg_2);
  border-bottom: var(--lobby__px) solid var(--skin__border);
}

:deep(.sub-header .arrow-left) {
  min-width: 40px;
  padding-right: 20px;
  padding-left: 10px;
  color: var(--skin__neutral_1);
  font-size: 12px;
}

:deep(.sub-header .title) {
  color: var(--skin__lead);
  font-size: 15px;
}

:deep(.sub-header .title-inner) {
  max-width: 215px;
}

.content {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
}

.page-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-layout {
  flex-shrink: 0;
  margin: 10px 10px 0;
}

.search-bar {
  width: 100%;
}

.game-search {
  height: 25px;
}

:deep(.game-search.x-input-wrapper) {
  height: 25px;
  padding: 0 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;
  background-color: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 13px;
}

:deep(.game-search .x-input__suffix) {
  margin-left: 5px;
}

.game-search__icon {
  color: var(--skin__primary);
  font-size: 14px;
}

.content-layout {
  flex-grow: 1;
  height: 100%;
  padding: 10px 10px 0;
  overflow: hidden;
}

.inner-box {
  display: flex;
  height: 100%;
}

.inner-box--without-sidebar {
  --game-card-benchmark: 77px;
  --game-card-width: 77px;
  --game-grid-columns: 4;
  --game-grid-width: 330.5px;
}

.detail--long-image .inner-box--without-sidebar {
  --game-card-benchmark: 80px;
  --game-card-width: 80px;
  --game-grid-columns: 4;
  --game-grid-width: 350px;
}

.slider-box {
  position: relative;
  flex-shrink: 0;
  flex-grow: 0;
  margin-right: 10px;
  padding-bottom: 5px;
}

.venue-tabs {
  width: fit-content;
  height: 100%;
}

.venue-tabs :deep(.x-tabs__wrap) {
  height: calc(100% + 3.5px);
  min-height: auto;
  margin: -1px -5px -2.5px;
  padding: 1px 5px 2.5px;
  overflow: visible;
}

.venue-tabs :deep(.x-tabs__nav) {
  box-sizing: border-box;
  width: auto;
  height: 100%;
  margin: -5px;
  padding: 5px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.venue-tabs :deep(.x-tabs__nav::-webkit-scrollbar) {
  display: none;
}

.venue-tabs :deep(.x-tab) {
  flex: none;
  width: 100%;
  min-height: auto;
  padding: 0;
  line-height: 1;
  white-space: normal;
}

.venue-tabs :deep(.x-tab + .x-tab) {
  margin-top: 10px;
}

.venue-tabs :deep(.x-tab--active) {
  color: inherit;
  font-weight: 400;
}

.venue-tabs :deep(.x-tabs__content),
.venue-tabs :deep(.x-tabs__line) {
  display: none;
}

.venue-tab {
  display: flex;
  align-items: center;
  width: 75px;
  height: 35px;
  padding: 0 6px 0 3px;
  color: var(--skin__left_nav_def);
  word-break: break-word;
  background-image: url("@/assets/common/btn_zc1_2.avif");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 5px;
  box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
}

.venue-tab--active {
  color: var(--skin__left_nav_active);
  background-image: url("@/assets/common/btn_zc1_1.avif");
  pointer-events: none;
}

.venue-tab img,
.venue-tab__category-icon {
  z-index: 2;
  flex-shrink: 0;
  width: 24px;
  height: auto;
  max-width: 100%;
  max-height: 24px;
}

.venue-tab__category-icon {
  height: 24px;
}

.venue-tab p {
  position: relative;
  z-index: 6;
  display: -webkit-box;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  color: currentColor;
  font-size: 11px;
  line-height: 13px;
  text-align: center;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.next-box {
  position: absolute;
  bottom: -2.5px;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 32.5px;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(var(--skin__bg_1__toRgbString, 0, 0, 0), 0.6) 35%,
    rgba(var(--skin__bg_1__toRgbString, 0, 0, 0), 0.8) 45%,
    rgba(var(--skin__bg_1__toRgbString, 0, 0, 0), 0.9) 50%,
    var(--skin__bg_1) 60%,
    var(--skin__bg_1)
  );
}

.down-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.down-indicator svg {
  width: 11px;
  height: 11px;
  margin: -3px 0;
  color: var(--skin__primary);
  transform: rotate(90deg);
}

.down-indicator svg:first-of-type {
  opacity: 0.6;
}

.right-box {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 0;
  overflow: hidden;
}

.scene-tabs {
  flex-shrink: 0;
}

.scene-tabs :deep(.x-tabs__wrap) {
  min-height: auto;
  padding: 0;
  overflow: hidden;
}

.scene-tabs :deep(.x-tabs__nav) {
  gap: 10px;
  width: 100%;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.scene-tabs :deep(.x-tab) {
  flex: none;
  min-height: auto;
  padding: 0;
  line-height: 1;
}

.scene-tabs :deep(.x-tab--active) {
  color: inherit;
  font-weight: 400;
}

.scene-tabs :deep(.x-tabs__content),
.scene-tabs :deep(.x-tabs__line) {
  display: none;
}

.nav-btn {
  position: relative;
  display: flex;
  flex: none;
  flex-shrink: 0;
  flex-grow: 0;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 27.5px;
  padding: 0 2.5px;
  color: var(--skin__neutral_1);
  font-size: 11px;
  line-height: 1.2;
  word-break: break-word;
  background-color: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 7px;
}

.nav-btn.active {
  height: 28px;
  color: var(--skin__text_primary);
  background-color: var(--skin__primary);
  border-color: var(--skin__primary);
}

.grid-game-col {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  box-sizing: content-box;
  width: 100%;
  height: 150px;
  max-height: 100%;
  min-height: 150px;
  margin-top: 10px;
  margin-right: -6.5px;
  margin-left: -6.5px;
  padding-right: 6.5px;
  padding-left: 6.5px;
}

.loading-state {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-bottom: 100px;
  color: var(--skin__primary);
}

.scroll-box {
  position: absolute;
  top: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin-right: -6.5px;
  margin-left: -6.5px;
  padding-right: 6.5px;
  padding-left: 6.5px;
  overflow: auto;
  scrollbar-color: var(--skin__border) transparent;
  scrollbar-width: thin;
}

.grid-box {
  display: grid;
  grid-template-columns: repeat(var(--game-grid-columns), var(--game-card-width));
  width: var(--game-grid-width);
  column-gap: 7.5px;
  row-gap: 7px;
  padding-bottom: 15px;
}

.detail--long-image .grid-box {
  column-gap: 10px;
  row-gap: 10px;
}

.inner-box--without-sidebar .grid-box {
  margin: 0 auto;
}

.card-item {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--game-card-width);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.card-item:active {
  transform: scale(0.98);
}

.card-image {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: var(--game-card-benchmark);
  height: var(--game-card-benchmark);
  overflow: hidden;
  color: var(--skin__ddt_icon, var(--skin__lead));
  background-color: var(--skin__ddt_bg);
  background-size: 100% 100%;
  border: 0 solid var(--skin__web_plat_line, transparent);
  border-radius: 5px;
}

.detail--long-image .card-image {
  height: calc(var(--game-card-benchmark) * 1.33);
  border-radius: 10px;
}

.detail--long-image .card-image::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  height: 46px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.52));
  content: "";
}

.poster-image {
  width: 100%;
  height: 100%;
  background-color: var(--skin__ddt_bg);
  border-radius: inherit;
}

.detail--long-image .poster-image {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.card-title {
  flex-shrink: 0;
  width: var(--game-card-width);
  height: 30px;
  margin-top: 4px;
  overflow: hidden;
  color: var(--skin__cards_text, var(--skin__lead));
  font-size: 11px;
  line-height: 1.36;
  text-align: center;
  word-wrap: break-word;
}

.card-title--overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  margin-top: 0;
  padding: 0 3px 3px;
  color: #fff;
  font-size: 9px;
  line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.detail--long-image .card-title--overlay .name-inner {
  font-weight: 700;
}

.name-inner {
  display: -webkit-box;
  width: 100%;
  margin: 0;
  overflow: hidden;
  font-size: inherit;
  font-weight: 500;
  line-height: inherit;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.thumb-icon {
  position: absolute;
  top: -0.5px;
  left: -0.5px;
  z-index: 8;
  width: 25px;
  height: 21px;
  background-image: url("@/assets/home/img_game_tj1_1.avif");
  background-size: 100% 100%;
}

.detail--long-image .thumb-icon {
  width: 25.5px;
  height: 20.5px;
  background-image: url("@/assets/home/img_game_tj1_zj.avif");
}

.collect-icon {
  position: absolute;
  top: 3px;
  right: 3px;
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

.collect-img {
  width: 17px;
  height: 17px;
  font-size: 17px;
  background-size: 100% 100%;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.disabled-box {
  position: absolute;
  inset: 0;
  z-index: 10;
  text-align: center;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: opacity 0.6s;
}

.disabled-icon {
  position: absolute;
  top: 0;
  left: 50%;
  width: var(--game-card-benchmark);
  height: var(--game-card-benchmark);
  background: url("@/assets/home/img_whz_style_13.avif") center / 100% 100% no-repeat;
  transform: translateX(-50%);
}

.detail--long-image .disabled-box {
  border-radius: inherit;
}

.detail--long-image .disabled-icon {
  top: 50%;
  width: 56%;
  height: 56%;
  background: url("@/assets/home/u-series/img_whz_style_1.png") center / contain no-repeat;
  transform: translate(-50%, -50%);
}

.footer {
  z-index: 10;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 15px;
}

.footer :deep(.van-pagination) {
  display: flex;
  align-items: center;
  width: fit-content;
  height: 25px;
  margin: 0 auto;
  font-size: 10px;
}

.footer :deep(.van-pagination__item) {
  box-sizing: border-box;
  min-width: 25px;
  height: 25px;
  margin: 0 3.75px;
  color: var(--skin__lead);
  font-weight: 400;
  background: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
}

.footer :deep(.van-pagination__item::after) {
  display: none;
}

.footer :deep(.van-pagination__item--active) {
  color: var(--skin__text_primary);
  background-color: var(--skin__primary);
  border-color: var(--skin__primary);
}

.footer :deep(.van-pagination__item--disabled) {
  color: var(--skin__neutral_2);
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-icon {
  color: var(--skin__primary);
  font-size: 9px;
}

.pagination-icon--prev {
  margin-left: 3px;
}

.pagination-icon--next {
  margin-left: 3px;
  transform: rotate(180deg);
}

:global([dir="rtl"]) .slider-box {
  margin-right: 0;
  margin-left: 10px;
}

:global([dir="rtl"]) .venue-tab {
  padding: 0 3px 0 6px;
}

:global([dir="rtl"]) .collect-icon {
  right: auto;
  left: 3px;
}

:global([dir="rtl"]) .thumb-icon {
  right: -0.5px;
  left: auto;
}

:global([dir="rtl"]) .pagination-icon--next {
  transform: rotate(-180deg);
}

@media (max-width: 340px) {
  .inner-box:not(.inner-box--without-sidebar) {
    --game-card-width: 85px;
    --game-grid-columns: 2;
    --game-grid-width: 177.5px;
  }

  .inner-box--without-sidebar {
    --game-card-width: 85px;
    --game-grid-columns: 3;
    --game-grid-width: 270px;
  }

  .detail--long-image .inner-box:not(.inner-box--without-sidebar) {
    --game-card-width: 80px;
    --game-grid-columns: 2;
    --game-grid-width: 170px;
  }

  .detail--long-image .inner-box--without-sidebar {
    --game-card-width: 80px;
    --game-grid-columns: 3;
    --game-grid-width: 260px;
  }
}
</style>
