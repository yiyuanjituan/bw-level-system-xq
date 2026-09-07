<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import router from '@/router';
import UiEmpty from '@/components/UI/empty.vue';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import BasicGameCard from '@/components/HomeBasic/BasicGameCard.vue';
import BasicVenueCard from '@/components/HomeBasic/BasicVenueCard.vue';
import XTabs from '@/components/X/x-tabs.vue';
import XTab from '@/components/X/x-tab.vue';
import XLoading from '@/components/X/x-loading.vue';
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
const hotDisplayCount = computed(() => app.gameImageDisplay === 'long' ? 15 : 9);
const venueDisplayCount = computed(() => app.basicVenueColumns === 3 ? 9 : 5);
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
  const pools = [home.suggestList, ...serverListCache.values()];
  for (const records of pools) {
    for (const record of records) {
      const recordKey = record.entryKey || `${isVenueItem(record) ? 'venue' : 'game'}:${record.id}`;
      if (recordKey === entryKey) record.favorite = favorite;
    }
  }
  serverListCache.delete(getServerCacheKey('collect'));
  if (activeHotFilterKey.value === 'collect') void loadHotServerTab('collect');
}

function selectHotFilter(mode: HotFilterKey) {
  activeHotKey.value = mode;
  scrollToSection(0);
}

defineExpose({ selectHotFilter });

// ---------- 分区展示 ----------

function hotShownGames() {
  const total = hotServerPool.value.length;
  const visibleCount = expandedHot.value ? total : Math.min(hotDisplayCount.value, total);
  return hotServerPool.value.slice(0, visibleCount);
}

function hotRemainingCount() {
  return Math.max(0, hotServerPool.value.length - hotShownGames().length);
}

function venueShownGames(index: number) {
  const section = categoryList.value[index];
  const list = normalizeGameList(section?.children ?? []);
  const isExpanded = expandedVenueMap.get(index) === true;
  return isExpanded ? list : list.slice(0, venueDisplayCount.value);
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
  <div ref="scrollContainer" class="basic-catalog">
    <aside ref="sidebar" class="basic-catalog__sidebar" :style="{ maxHeight: sidebarHeight }">
      <button
        v-for="(category, index) in categoryList"
        :key="category.key"
        type="button"
        class="basic-catalog__category"
        :class="{ 'basic-catalog__category--active': index === activeCategoryIndex }"
        :aria-current="index === activeCategoryIndex ? 'true' : undefined"
        :style="{ backgroundImage: 'url(' + (index === activeCategoryIndex ? sideActiveBg : sideNormalBg) + ')' }"
        @click="scrollToSection(index)"
      >
        <home-skeleton-image v-if="category.icon" :src="category.icon" alt="" class="basic-catalog__category-icon" fit="contain" />
        <span>{{ getCategoryName(category) }}</span>
      </button>
    </aside>

    <div class="basic-catalog__sections">
      <section :ref="el => setSectionElement(el, 0)" class="basic-catalog__section basic-catalog__section--hot">
        <x-tabs v-model="activeHotKey" class="basic-catalog__tabs" :show-nav-arrows="false">
          <x-tab v-for="filter in hotFilterTabs" :key="filter.key" :name="filter.key" :title="filter.label" />
        </x-tabs>
        <div class="basic-catalog__games">
          <div v-if="listLoading || (loading && !hotServerPool.length)" class="basic-catalog__state" role="status">
            <x-loading size="24px" /><span>{{ $t('加载中') }}</span>
          </div>
          <template v-else-if="hotServerPool.length">
            <div class="basic-catalog__game-grid" :class="{ 'basic-catalog__game-grid--long': app.gameImageDisplay === 'long' }">
              <BasicGameCard
                v-for="game in hotShownGames()"
                :key="game.entryKey || String(game.gameMode) + ':' + game.id"
                :game="game"
                :image-display="app.gameImageDisplay"
                :name-overlay="true"
                @select="clickGameItem"
                @disabled="showDisabledTip"
                @favorite-change="handleHotFavoriteChange"
              />
            </div>
            <HomeExpandMore v-if="hotRemainingCount() > 0" :count="hotRemainingCount()" @expand="expandedHot = true" />
          </template>
          <UiEmpty v-else :text="$t('暂无游戏')" />
        </div>
      </section>

      <section
        v-for="(category, index) in categoryList.slice(1)"
        :key="category.key"
        :ref="el => setSectionElement(el, index + 1)"
        class="basic-catalog__section"
      >
        <HomeSectionHeader :icon="category.icon" :title="sectionTitle(category)" :show-all="true" @all="openCategoryAll(category)" />
        <template v-if="venueShownGames(index + 1).length">
          <div class="basic-catalog__venue-grid" :class="{ 'basic-catalog__venue-grid--triple': app.basicVenueColumns === 3 }">
            <BasicVenueCard
              v-for="venue in venueShownGames(index + 1)"
              :key="venue.entryKey || String(venue.id)"
              :venue="venue"
              :columns="app.basicVenueColumns"
              @select="clickVenueItem"
              @disabled="showDisabledTip"
            />
          </div>
          <HomeExpandMore
            v-if="!expandedVenueMap.get(index + 1) && venueTotalCount(index + 1) > venueDisplayCount"
            :count="venueTotalCount(index + 1) - venueDisplayCount"
            @expand="toggleVenueExpand(index + 1)"
          />
        </template>
        <UiEmpty v-else :text="$t('暂无数据')" />
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.basic-catalog {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;

  &__sidebar {
    position: sticky;
    top: 10px;
    flex: 0 0 85px;
    padding-right: 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }

  &__category {
    display: flex;
    align-items: center;
    width: 75px;
    height: 35px;
    margin: 0 0 10px;
    padding: 0 3px 0 1.5px;
    border: 0;
    border-radius: 7px;
    color: var(--skin__leftnav_def, var(--skin__left_nav_def));
    background-color: transparent;
    background-size: 100% 100%;
    box-shadow: 0 1.5px 3.5px var(--skin__web_left_bg_shadow);
    cursor: pointer;

    span {
      display: -webkit-box;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      word-break: break-word;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--active {
      color: var(--skin__leftnav_active, var(--skin__left_nav_active));
      box-shadow: 0 1px 2px var(--skin__web_left_bg_shadow_active);
    }
  }

  &__category-icon {
    flex: 0 0 24px;
    width: 24px;
    height: 18px;
  }

  &__sections {
    flex: 1;
    min-width: 0;
  }

  &__section {
    padding: 10px 0 15px;
    border-top: var(--lobby__px) solid var(--skin__border);

    &--hot {
      padding: 0;
      border: 0;
    }

    :deep(.home-section-header) {
      margin-bottom: 10px;
    }
  }

  &__tabs {
    :deep(.x-tabs__wrap) {
      min-height: 0;
      border-bottom: var(--lobby__px) solid var(--skin__border);
    }

    :deep(.x-tabs__nav) {
      padding: 0;
      background: transparent;
    }

    :deep(.x-tab) {
      height: 35px;
      min-height: 35px;
      font-size: 13px;
    }

    :deep(.x-tabs__line) {
      bottom: 0;
      border-radius: 0;
    }

    :deep(.x-tabs__content) {
      display: none;
    }
  }

  &__games {
    padding: 10px 0 15px;
  }

  &__game-grid {
    display: grid;
    grid-template-columns: repeat(3, 85px);
    width: 270px;
    margin: 0 auto;
    column-gap: 7px;
    row-gap: 7px;

    &--long {
      grid-template-columns: repeat(3, 80px);
      width: 260px;
      column-gap: 9.5px;
      row-gap: 10px;

      :deep(.basic-game-card__poster) {
        border-radius: 10px;
      }

      :deep(.basic-game-card__title-overlay) {
        height: 26px;
        padding: 0 3px 3px;
      }

      :deep(.basic-game-card__name--overlay) {
        font-size: 9px;
      }

      :deep(.basic-game-card__favorite),
      :deep(.basic-game-card__favorite-icon) {
        width: 17px;
        height: 17px;
      }
    }
  }

  &__venue-grid {
    display: grid;
    grid-template-columns: 260px;
    width: 260px;
    margin: 0 auto;
    row-gap: 10px;

    &--triple {
      grid-template-columns: repeat(3, 80px);
      column-gap: 9.5px;
    }
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 150px;
    color: var(--skin__neutral_2);
    font-size: 12px;
  }
}
</style>
