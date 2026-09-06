<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import router from '@/router';
import UiEmpty from '@/components/UI/empty.vue';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import BasicGameCard from '@/components/HomeBasic/BasicGameCard.vue';
import BasicVenueCard from '@/components/HomeBasic/BasicVenueCard.vue';
import HomeLineTabs from '@/components/Home/HomeLineTabs.vue';
import HomeExpandMore from '@/components/Home/HomeExpandMore.vue';
import HomeSectionHeader from '@/components/Home/HomeSectionHeader.vue';
import { getHomeApiData, getGameListById, getMomentsRecentGames } from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import { $t } from '@/locales';
import useHomeDataStore from '@/store/modules/home';
import useDataStore from '@/store/modules/data';
import useAuthStore from '@/store/modules/user';
import useAppStore from '@/store/modules/app';
import type { HomeGameRecord } from '@/components/Home/types';
import hotIcon from '@/assets/home/icon_dtfl_rm_1.avif';
import sideActiveBg from '@/assets/home/basic/btn_zc1_1.avif';
import sideNormalBg from '@/assets/home/basic/btn_zc1_2.avif';

defineOptions({
  name: 'BasicGameList'
});

// 最近记录单独读取真实游玩历史，通用游戏接口当前只支持收藏过滤。
type HotFilterKey = 'hot' | 'last' | 'collect';

const HOME_GAME_EXPAND_COUNT = 18;
const VENUE_EXPAND_COUNT = 5;
const SCROLL_ACTIVE_OFFSET = 8;
const gameClassifyLocaleKeys: Record<string, I18nType.I18nKey> = {
  '1': '真人',
  '2': '捕鱼',
  '3': '电子',
  '4': '彩票',
  '5': '体育',
  '6': '棋牌',
  '7': '电竞'
};

const home = useHomeDataStore();
const appData = useDataStore();
const auth = useAuthStore();
const app = useAppStore();

const activeCategoryIndex = ref(0);
const activeHotKey = ref<HotFilterKey>('hot');
const expandedHot = ref(false);
const expandedVenueMap = reactive(new Map<number, boolean>());
const loading = ref(false);
const serverListCache = reactive(new Map<string, HomeGameRecord[]>());
const pendingLists = reactive(new Set<string>());
const listLoading = computed(() => pendingLists.has(getServerCacheKey(activeHotKey.value)));
const searchVisible = ref(false);
const searchKeyword = ref('');
const searchLoading = ref(false);
const searchGames = ref<HomeGameRecord[]>([]);
let sessionVersion = 0;

const scrollContainer = ref<HTMLElement | null>(null);
const sidebar = ref<HTMLElement | null>(null);
const sidebarHeight = ref('100%');
const sectionElements: (HTMLElement | null)[] = [];
let scrollParent: HTMLElement | Window | null = null;
let scrollListenerAttached = false;
let resizeObserver: ResizeObserver | null = null;

const hotFilterTabs = computed<{ key: HotFilterKey; label: string }[]>(() => [
  { key: 'hot', label: $t('热门') },
  { key: 'last', label: $t('最近') },
  { key: 'collect', label: $t('收藏') }
]);

const activeHotFilterKey = computed<HotFilterKey>(() => activeHotKey.value);

// 左侧分类：固定“热门”（suggestList）+ 场馆分类列表（后端 pageData 的 classify 分组）。
const categoryList = computed(() => {
  const hotSection = {
    key: 'hot',
    type: undefined,
    name: $t('热门'),
    icon: hotIcon,
    children: normalizeGameList(home.suggestList)
  };

  const classifySections = normalizeSectionList(home.venueList);

  return [hotSection, ...classifySections];
});

function normalizeGameList(value: unknown): HomeGameRecord[] {
  return Array.isArray(value) ? value : [];
}

function normalizeSectionList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(section => section && typeof section === 'object')
    .map(section => ({
      ...section,
      key: String(section?.type ?? ''),
      name: String(section?.name ?? ''),
      icon: section?.img ?? '',
      type: section?.type ?? undefined,
      children: normalizeGameList(section?.children)
    }));
}

// ---------- 服务端数据（最近/收藏） ----------

function getServerCacheKey(mode: HotFilterKey) {
  const userId = String(auth.user?.id ?? 0);
  return `${userId}|hot|${mode}`;
}

function isVenueItem(record: HomeGameRecord) {
  return record.gameMode === 'venue' || record.entryMode === 'venue';
}

const hotServerPool = computed<HomeGameRecord[]>(() => {
  const mode = activeHotFilterKey.value;
  if (mode === 'hot') {
    // 热门同时包含游戏和场馆入口，保持接口排序及参考页的混合展示。
    return normalizeGameList(categoryList.value[0]?.children ?? []);
  }

  return serverListCache.get(getServerCacheKey(mode)) ?? [];
});

async function loadHotServerTab(mode: HotFilterKey) {
  if (mode === 'hot') return;

  const cacheKey = getServerCacheKey(mode);
  if (serverListCache.has(cacheKey) || pendingLists.has(cacheKey)) return;

  if (!auth.token) return;

  const requestVersion = sessionVersion;
  pendingLists.add(cacheKey);
  try {
    let list: HomeGameRecord[];
    if (mode === 'last') {
      const [recentGames, availableGames] = await Promise.all([
        getMomentsRecentGames(Number(auth.user?.id)),
        getGameListById({ id: 0, mode: 'all' })
      ]);
      const availableGameMap = new Map(normalizeGameList(availableGames)
        .filter(game => !isVenueItem(game))
        .map(game => [String(game.entryGameId ?? game.id), game]));
      // 保留历史顺序，只展示当前账号仍可进入的游戏，并补齐场馆和维护状态。
      list = normalizeGameList(recentGames)
        .map(game => availableGameMap.get(String(game.id)))
        .filter((game): game is HomeGameRecord => Boolean(game));
    } else {
      list = normalizeGameList(await getGameListById({ id: 0, mode }));
    }
    if (requestVersion === sessionVersion) {
      serverListCache.set(cacheKey, normalizeGameList(list));
    }
  } catch (error) {
    console.error('获取热门区游戏列表失败，失败原因：', error);
    showCustomToast({ type: 'fail', message: $t('操作失败') });
  } finally {
    if (requestVersion === sessionVersion) pendingLists.delete(cacheKey);
  }
}

function handleHotFavoriteChange(game: HomeGameRecord, favorite: boolean) {
  // 同一入口可同时出现在热门、最近和搜索中，收藏完成后同步这些实例。
  const entryKey = game.entryKey || `${isVenueItem(game) ? 'venue' : 'game'}:${game.id}`;
  const pools = [home.suggestList, searchGames.value, ...serverListCache.values()];
  for (const records of pools) {
    for (const record of records) {
      const recordKey = record.entryKey || `${isVenueItem(record) ? 'venue' : 'game'}:${record.id}`;
      if (recordKey === entryKey) record.favorite = favorite;
    }
  }
  serverListCache.delete(getServerCacheKey('collect'));
  if (activeHotFilterKey.value === 'collect') void loadHotServerTab('collect');
}

const filteredSearchGames = computed(() => {
  const keyword = searchKeyword.value.trim().toLocaleLowerCase();
  return searchGames.value.filter(game => String(game.name ?? '').toLocaleLowerCase().includes(keyword));
});

async function openSearch() {
  searchVisible.value = true;
  searchKeyword.value = '';
  if (searchLoading.value) return;
  searchLoading.value = true;
  const requestVersion = sessionVersion;
  try {
    const records = await getGameListById({ id: 0, mode: 'all' });
    if (requestVersion === sessionVersion) searchGames.value = normalizeGameList(records);
  } catch {
    showCustomToast({ type: 'fail', message: $t('操作失败') });
  } finally {
    searchLoading.value = false;
  }
}

function selectHotFilter(mode: HotFilterKey) {
  activeHotKey.value = mode;
  scrollToSection(0);
}

defineExpose({ openSearch, selectHotFilter });

// ---------- 分区展示 ----------

function hotShownGames() {
  const total = hotServerPool.value.length;
  const visibleCount = expandedHot.value ? total : Math.min(HOME_GAME_EXPAND_COUNT, total);
  return hotServerPool.value.slice(0, visibleCount);
}

function hotRemainingCount() {
  return Math.max(0, hotServerPool.value.length - hotShownGames().length);
}

function venueShownGames(index: number) {
  const section = categoryList.value[index];
  const list = normalizeGameList(section?.children ?? []);
  const isExpanded = expandedVenueMap.get(index) === true;
  return isExpanded ? list : list.slice(0, VENUE_EXPAND_COUNT);
}

function venueTotalCount(index: number) {
  return normalizeGameList(categoryList.value[index]?.children ?? []).length;
}

function toggleVenueExpand(index: number) {
  expandedVenueMap.set(index, true);
}

function getCategoryName(category: { name: string; type?: unknown }) {
  const localeKey = gameClassifyLocaleKeys[String(category.type ?? '')];
  return localeKey ? $t(localeKey) : String(category.name ?? '').trim();
}

function formatCategoryName(category: { name: string; type?: unknown }) {
  const categoryName = getCategoryName(category);
  return categoryName.length === 2 ? `${categoryName[0]} ${categoryName[1]}` : categoryName;
}

// 分类标题使用完整语言键，避免翻译后继续拼接中文“游戏”。
function sectionTitle(category: { name: string; type?: unknown }) {
  const categoryName = getCategoryName(category);
  return categoryName ? $t('{name}游戏', { name: categoryName }) : '';
}

// “全部”入口：跳转该分类全量场馆列表。
function openCategoryAll(category: any) {
  if (category?.type === undefined || category?.type === null || category?.type === '') return;
  router.push({ path: '/home/subGame', query: { type: category.type, platformId: 0 } });
}

// ---------- 交互：点左栏滚动右区 + 滚动高亮 ----------

function setSectionElement(element: Element | ComponentPublicInstance | null, index: number) {
  sectionElements[index] = element as HTMLElement | null;
}

function findScrollParent(element: HTMLElement | null): HTMLElement | Window {
  let current = element?.parentElement ?? null;

  while (current) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if (['auto', 'scroll', 'overlay'].includes(overflowY)) return current;
    current = current.parentElement;
  }

  return window;
}

function bindScrollListener() {
  if (scrollListenerAttached) return;

  const rootElement = scrollContainer.value;
  if (!rootElement) return;
  scrollListenerAttached = true;
  scrollParent = findScrollParent(rootElement);
  scrollParent.addEventListener('scroll', handleListScroll, { passive: true });
  if (scrollParent instanceof HTMLElement) {
    const container = scrollParent;
    resizeObserver = new ResizeObserver(() => {
      sidebarHeight.value = `${Math.max(0, container.clientHeight - 10 * rootElement.clientWidth / 375)}px`;
      handleListScroll();
    });
    resizeObserver.observe(container);
  }
}

function handleListScroll() {
  const rootElement = scrollContainer.value;
  if (!rootElement) return;

  const viewportTop = scrollParent instanceof HTMLElement ? scrollParent.getBoundingClientRect().top : 0;
  const activeOffset = SCROLL_ACTIVE_OFFSET * rootElement.clientWidth / 375;
  let nextActiveIndex = 0;

  sectionElements.forEach((section, index) => {
    if (!section) return;

    const top = section.getBoundingClientRect().top - viewportTop;
    if (top <= activeOffset + 1) {
      nextActiveIndex = index;
    }
  });

  if (sectionElements.length) {
    activeCategoryIndex.value = nextActiveIndex;
    const activeButton = sidebar.value?.children[nextActiveIndex] as HTMLElement | undefined;
    if (activeButton && sidebar.value) {
      const buttonRect = activeButton.getBoundingClientRect();
      const sidebarRect = sidebar.value.getBoundingClientRect();
      if (buttonRect.top < sidebarRect.top || buttonRect.bottom > sidebarRect.bottom) {
        sidebar.value.scrollTop += buttonRect.top - sidebarRect.top;
      }
    }
  }
}

function scrollToSection(index: number) {
  if (String(categoryList.value[index]?.type) === '20') {
    void router.push({ path: '/home/subGame', query: { type: 20, platformId: 0 } });
    return;
  }
  const section = sectionElements[index];
  if (!section) return;

  activeCategoryIndex.value = index;
  const scroller = scrollParent || findScrollParent(scrollContainer.value);

  if (scroller === window) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const container = scroller as HTMLElement;
  const targetTop =
    container.scrollTop
    + section.getBoundingClientRect().top
    - container.getBoundingClientRect().top
    - SCROLL_ACTIVE_OFFSET * (scrollContainer.value?.clientWidth ?? 375) / 375;
  container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
}

// ---------- 通用点击 ----------

function showDisabledTip() {
  showCustomToast({ type: 'fail', message: $t('tips.maintenance') });
}

function openSubGame(record: HomeGameRecord) {
  const platformId = ['4', '5'].includes(String(record.type)) ? 0 : (record.entryVenueId ?? record.id);
  router.push({ path: '/home/subGame', query: { type: record.type, platformId } });
}

function clickGameItem(record: HomeGameRecord) {
  searchVisible.value = false;
  if (isVenueItem(record)) {
    openSubGame(record);
    return;
  }

  appData.setEnterInfo(record.entryVenueId ?? record.venueId, record.entryGameId ?? record.id);
  void auth.updateInfo();
  router.push({ path: '/home/embedded' });
}

function clickVenueItem(record: HomeGameRecord) {
  openSubGame(record);
}

// ---------- 生命周期 ----------

async function getHomeData() {
  if (loading.value) return;
  loading.value = true;
  const requestVersion = sessionVersion;

  try {
    const [response, favoriteGames] = await Promise.all([
      getHomeApiData(),
      auth.token ? getGameListById({ id: 0, mode: 'collect' }).catch(() => null) : Promise.resolve([])
    ]);
    if (requestVersion !== sessionVersion) return;
    const favoriteKeys = new Set(normalizeGameList(favoriteGames)
      .map(game => game.entryKey || `${isVenueItem(game) ? 'venue' : 'game'}:${game.id}`));
    home.setSuggestData(normalizeGameList(response?.suggestData).map(game => ({
      ...game,
      favorite: favoriteGames === null
        ? game.favorite
        : favoriteKeys.has(game.entryKey || `${isVenueItem(game) ? 'venue' : 'game'}:${game.id}`)
    })));
    home.setVenueList(response?.venueList ?? []);
  } catch (error) {
    console.error('获取首页游戏数据失败，失败原因：', error);
  } finally {
    loading.value = false;
    if (requestVersion !== sessionVersion) void getHomeData();
  }
}

watch(activeHotFilterKey, mode => {
  expandedHot.value = false;
  if (mode !== 'hot') {
    void loadHotServerTab(mode);
  }
});

watch(
  () => categoryList.value.length,
  async length => {
    if (!length) return;
    await nextTick();
    bindScrollListener();
    handleListScroll();
  }
);

onMounted(async () => {
  void getHomeData();
  await nextTick();
  bindScrollListener();
  handleListScroll();
});

watch(() => auth.token, () => {
  sessionVersion += 1;
  serverListCache.clear();
  pendingLists.clear();
  searchGames.value = [];
  void getHomeData();
  void loadHotServerTab(activeHotKey.value);
});

onActivated(() => {
  serverListCache.clear();
  void getHomeData();
  void loadHotServerTab(activeHotKey.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (scrollParent) {
    scrollParent.removeEventListener('scroll', handleListScroll);
  }
});
</script>

<template>
  <div ref="scrollContainer" class="basic-game-list">
    <!-- 左侧 sticky 竖向分类 -->
    <aside ref="sidebar" class="basic-game-list__sidebar" :style="{ maxHeight: sidebarHeight }">
      <div
        v-for="(category, index) in categoryList"
        :key="`${category.key}-${index}`"
        class="basic-game-list__category"
        :class="{ 'basic-game-list__category--active': index === activeCategoryIndex }"
        role="button"
        tabindex="0"
        :aria-current="index === activeCategoryIndex ? 'true' : undefined"
        @click="scrollToSection(index)"
        @keydown.enter="scrollToSection(index)"
        @keydown.space.prevent="scrollToSection(index)"
      >
        <div
          class="basic-game-list__category-bg"
          :style="{
            backgroundImage: index === activeCategoryIndex
              ? `url(${sideActiveBg})`
              : `url(${sideNormalBg})`
          }"
        >
          <home-skeleton-image
            v-if="category.icon"
            :src="category.icon"
            alt="."
            class="basic-game-list__category-icon"
            fit="contain"
            loading="lazy"
          />
          <span class="basic-game-list__category-name">{{ formatCategoryName(category) }}</span>
        </div>
      </div>
    </aside>

    <!-- 右侧：纵向堆叠分区，点击左侧滚动到对应区块 -->
    <div class="basic-game-list__content">
      <!-- 热门区：含 热门/最近/收藏 筛选 Tab -->
      <section
        v-if="categoryList[0]"
        :ref="el => setSectionElement(el, 0)"
        class="basic-game-section basic-game-section--boxed"
      >
        <home-line-tabs
          v-model:active-key="activeHotKey"
          :tabs="hotFilterTabs"
          class="basic-hot-tabs"
        />

        <div class="basic-game-list__panel">
          <div v-if="listLoading || (loading && !hotServerPool.length)" class="basic-game-list__empty" role="status">
            <van-loading color="var(--skin__primary)">{{ $t('加载中') }}</van-loading>
          </div>
          <template v-else-if="hotServerPool.length">
            <div class="basic-game-list__grid basic-game-list__grid--games">
              <basic-game-card
                v-for="(game, index) in hotShownGames()"
                :key="`hot-${activeHotFilterKey}-${index}-${String(game.id ?? '')}`"
                :game="game"
                :image-display="app.gameImageDisplay"
                @select="clickGameItem"
                @disabled="showDisabledTip"
                @favorite-change="handleHotFavoriteChange"
              />
            </div>

            <home-expand-more
              v-if="!expandedHot && hotRemainingCount() > 0"
              :count="hotRemainingCount()"
              @expand="expandedHot = true"
            />
          </template>

          <div v-else class="basic-game-list__empty">
            <ui-empty :text="$t('暂无游戏')" />
          </div>
        </div>
      </section>

      <!-- 场馆分类区：标题行(含“全部”) + 默认 5 个场馆，点击展开显示全部 -->
      <section
        v-for="(category, index) in categoryList.slice(1)"
        :key="`venue-${category.key}-${index}`"
        :ref="el => setSectionElement(el, index + 1)"
        class="basic-game-section basic-game-section--boxed"
      >
        <home-section-header
          class="basic-game-section__headline"
          :icon="category.icon"
          :title="sectionTitle(category)"
          :show-all="category.type !== undefined && category.type !== null && category.type !== ''"
          @all="openCategoryAll(category)"
        />

        <template v-if="venueShownGames(index + 1).length">
          <div class="basic-game-list__venue-list">
            <basic-venue-card
              v-for="(venue, venueIndex) in venueShownGames(index + 1)"
              :key="`venue-${category.key}-${index}-${venueIndex}-${String(venue.id ?? '')}`"
              :venue="venue"
              :image-display="app.gameImageDisplay"
              @select="clickVenueItem"
              @disabled="showDisabledTip"
            />
          </div>

          <home-expand-more
            v-if="!expandedVenueMap.get(index + 1) && venueTotalCount(index + 1) > VENUE_EXPAND_COUNT"
            :count="venueTotalCount(index + 1) - VENUE_EXPAND_COUNT"
            @expand="toggleVenueExpand(index + 1)"
          />
        </template>

        <div v-else class="basic-game-list__empty">
          <ui-empty :text="$t('暂无数据')" />
        </div>
      </section>
    </div>
  </div>
  <van-popup v-model:show="searchVisible" position="right" class="basic-game-search" teleport="body" close-on-popstate>
    <van-search v-model="searchKeyword" :placeholder="$t('搜索游戏')" show-action autofocus @cancel="searchVisible = false" />
    <div class="basic-game-search__results">
      <div v-if="searchLoading" class="basic-game-list__empty" role="status">
        <van-loading color="var(--skin__primary)">{{ $t('加载中') }}</van-loading>
      </div>
      <div v-else-if="filteredSearchGames.length" class="basic-game-search__grid">
        <basic-game-card
          v-for="game in filteredSearchGames"
          :key="game.entryKey || `${game.gameMode}-${game.id}`"
          :game="game"
          :image-display="app.gameImageDisplay"
          @select="clickGameItem"
          @disabled="showDisabledTip"
          @favorite-change="handleHotFavoriteChange"
        />
      </div>
      <ui-empty v-else :text="$t('暂无游戏')" />
    </div>
  </van-popup>
</template>

<style scoped lang="less">
.basic-game-list {
  display: flex;
  align-items: flex-start;
  padding: 0 10px;
  box-sizing: border-box;

  &__sidebar {
    position: sticky;
    top: 10px;
    flex: none;
    width: 75px;
    margin-right: 10px;
    box-sizing: border-box;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }

  &__category {
    width: 75px;
    height: 35px;
    margin-bottom: 10px;
    cursor: pointer;
    user-select: none;
  }

  &__category-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 75px;
    height: 35px;
    padding: 0 3px 0 1.5px;
    box-sizing: border-box;
    border-radius: 7px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
    overflow: hidden;
  }

  &__category-icon {
    flex: none;
    width: 24px;
    height: 18px;
    background-color: transparent;
  }

  &__category-name {
    flex: 1;
    min-width: 0;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    color: var(--skin__left_nav_def);
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    word-break: break-word;
  }

  &__category--active &__category-name {
    color: var(--skin__left_nav_active);
  }

  &__category--active &__category-bg {
    box-shadow: 0 1.5px 3.5px var(--skin__web_left_bg_shadow_active, var(--skin__web_left_bg_shadow));
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__panel {
    padding-top: 10px;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 7px 7px;

    &--games {
      > .basic-game-card {
        width: calc((100% - 14px) / 3);
      }
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }
}

.basic-game-list__venue-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

// 分区列表盒：与参考稿 ._game-list-box 一致，分区之间保留上分隔线
.basic-game-section {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 15px;
}

.basic-game-section:first-child {
  padding-top: 0;
}

.basic-game-section + .basic-game-section {
  border-top: thin solid var(--skin__border);
}

.basic-game-section__headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 26px;
  margin-bottom: 10px;
}

.basic-game-search {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-top: env(safe-area-inset-top);
  background: var(--skin__home_bg);
  --van-search-background: var(--skin__bs_topnav_bg);
  --van-search-content-background: var(--skin__bg_2);
  --van-field-input-text-color: var(--skin__lead);
  --van-search-action-text-color: var(--skin__primary);

  &__results {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 15px 10px calc(15px + env(safe-area-inset-bottom));
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px 5px;
  }
}
</style>
