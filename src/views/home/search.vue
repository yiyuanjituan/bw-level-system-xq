<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getGameListById } from '@/api/common';
import searchGameIcon from '@/assets/home/img_ss_yx.avif';
import type { HomeGameRecord } from '@/components/Home/types';
import BasicGameCard from '@/components/HomeBasic/BasicGameCard.vue';
import SubNavbar from '@/components/SubNavbar.vue';
import UiEmpty from '@/components/UI/empty.vue';
import XButton from '@/components/X/x-button.vue';
import XInput from '@/components/X/x-input.vue';
import XLoading from '@/components/X/x-loading.vue';
import XSelect from '@/components/X/x-select.vue';
import { showCustomToast } from '@/hooks/useCommon';
import { $t } from '@/locales';
import useDataStore from '@/store/modules/data';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';

defineOptions({ name: 'HomeSearch' });

type SearchScope = 'all' | 'favorite';

const HISTORY_KEY = 'home-search-history';
const HISTORY_LIMIT = 10;
const PAGE_SIZE = 12;
const route = useRoute();
const router = useRouter();
const appData = useDataStore();
const app = useAppStore();
const auth = useAuthStore();
const keyword = ref('');
const submittedKeyword = ref('');
const searchScope = ref<SearchScope>('all');
const searchHistory = ref<string[]>([]);
const gameList = ref<HomeGameRecord[]>([]);
const loading = ref(false);
const loadFailed = ref(false);
const visibleCount = ref(PAGE_SIZE);
const resultsRef = ref<HTMLElement>();
const imageDisplay = computed(() => app.gameImageDisplay === 'long' ? 'long' : 'square');

const scopeOptions = computed(() => [
  { id: 'all', label: $t('游戏') },
  { id: 'favorite', label: $t('收藏游戏') }
]);
const resultTitle = computed(() => searchScope.value === 'favorite' ? $t('收藏游戏') : $t('游戏'));
const matchedGames = computed(() => {
  const normalizedKeyword = submittedKeyword.value.toLocaleLowerCase();
  if (!normalizedKeyword) return [];

  return gameList.value.filter(game => {
    if (game.entryMode === 'venue' || game.gameMode === 'venue') return false;
    if (searchScope.value === 'favorite' && !game.favorite) return false;
    return String(game.name ?? '').toLocaleLowerCase().includes(normalizedKeyword);
  });
});
const visibleGames = computed(() => matchedGames.value.slice(0, visibleCount.value));
const hasMoreGames = computed(() => visibleCount.value < matchedGames.value.length);

function updateHistory(nextHistory: string[]) {
  searchHistory.value = nextHistory;
  try {
    if (nextHistory.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }
  } catch {
    // 浏览器禁止存储或空间不足时，当前会话仍可正常搜索和删除历史。
  }
}

function submitSearch(value = keyword.value) {
  const nextKeyword = value.trim().slice(0, 100);
  keyword.value = nextKeyword;
  submittedKeyword.value = nextKeyword;
  visibleCount.value = PAGE_SIZE;
  if (resultsRef.value) resultsRef.value.scrollTop = 0;

  if (nextKeyword) {
    updateHistory([
      nextKeyword,
      ...searchHistory.value.filter(historyKeyword => historyKeyword !== nextKeyword)
    ].slice(0, HISTORY_LIMIT));
  }

  void router.replace({
    path: route.path,
    query: { ...route.query, q: nextKeyword || undefined }
  });
}

function handleSearchKeydown(event: KeyboardEvent) {
  // 中文输入法确认候选词时，不提前提交尚未完成的搜索内容。
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    submitSearch();
  } else if (event.key === 'Escape') {
    submitSearch('');
  }
}

async function loadGames() {
  if (loading.value) return;
  loading.value = true;
  loadFailed.value = false;
  try {
    const response = await getGameListById({ id: 0, mode: 'all' });
    if (!Array.isArray(response)) throw new Error('游戏列表返回格式异常');
    gameList.value = response;
  } catch {
    loadFailed.value = true;
    showCustomToast({ type: 'fail', message: $t('加载失败，请重试') });
  } finally {
    loading.value = false;
  }
}

function selectGame(game: HomeGameRecord) {
  appData.setEnterInfo(game.entryVenueId ?? game.venueId, game.entryGameId ?? game.id);
  void auth.updateInfo();
  void router.push('/home/embedded');
}

watch(
  () => route.query.q,
  value => {
    const queryKeyword = Array.isArray(value) ? value[0] : value;
    keyword.value = String(queryKeyword ?? '').slice(0, 100);
    submittedKeyword.value = keyword.value.trim();
    visibleCount.value = PAGE_SIZE;
    if (resultsRef.value) resultsRef.value.scrollTop = 0;
  },
  { immediate: true }
);

watch(searchScope, () => {
  visibleCount.value = PAGE_SIZE;
  if (resultsRef.value) resultsRef.value.scrollTop = 0;
});

onMounted(() => {
  try {
    const storedHistory: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    if (Array.isArray(storedHistory)) {
      searchHistory.value = [...new Set(
        storedHistory
          .filter((historyKeyword): historyKeyword is string => typeof historyKeyword === 'string')
          .map(historyKeyword => historyKeyword.trim().slice(0, 100))
          .filter(Boolean)
      )].slice(0, HISTORY_LIMIT);
    }
  } catch {
    // 历史内容损坏时从空记录开始，不影响游戏列表加载。
    searchHistory.value = [];
  }
  void loadGames();
});
</script>

<template>
  <div class="search-page">
    <SubNavbar :title="$t('搜索')" />

    <main class="search-page__main">
      <form class="search-toolbar" role="search" @submit.prevent="submitSearch()">
        <div class="search-toolbar__scope">
          <x-select v-model="searchScope" :options="scopeOptions" :fit-option-width="true" />
        </div>
        <x-input
          v-model="keyword"
          class="search-toolbar__input"
          name="q"
          :maxlength="100"
          :placeholder="$t('请输入搜索内容')"
          :validate-event="false"
          @keydown="handleSearchKeydown"
        >
          <template #suffix>
            <button
              v-if="keyword"
              type="button"
              class="search-toolbar__clear"
              :aria-label="$t('清空搜索内容')"
              @click="submitSearch('')"
            >
              <svg-icon name="close-circle" />
            </button>
            <x-button class="search-toolbar__submit" type="primary" plain native-type="submit" :aria-label="$t('搜索')">
              <template #icon><svg-icon name="comm_icon_ss" /></template>
            </x-button>
          </template>
        </x-input>
      </form>

      <section v-if="searchHistory.length" class="search-history" aria-labelledby="search-history-title">
        <div class="search-history__header">
          <h2 id="search-history-title" class="search-history__title">
            <svg-icon name="comm_icon_clock" />
            <span>{{ $t('最近搜索') }}</span>
          </h2>
          <x-button
            v-if="searchHistory.length"
            class="search-history__delete"
            type="danger"
            plain
            @click="updateHistory([])"
          >
            <template #icon><svg-icon name="comm_icon_del" /></template>
            {{ $t('删除全部') }}
          </x-button>
        </div>
        <ul v-if="searchHistory.length" class="search-history__list">
          <li v-for="historyKeyword in searchHistory" :key="historyKeyword" class="search-history__tag">
            <button class="search-history__keyword" type="button" :title="historyKeyword" @click="submitSearch(historyKeyword)">
              {{ historyKeyword }}
            </button>
            <button
              class="search-history__remove"
              type="button"
              :aria-label="$t('删除') + ' ' + historyKeyword"
              @click="updateHistory(searchHistory.filter(savedKeyword => savedKeyword !== historyKeyword))"
            >
              <svg-icon name="close-circle" />
            </button>
          </li>
        </ul>
      </section>

      <section ref="resultsRef" class="search-results" aria-live="polite" :aria-busy="Boolean(submittedKeyword) && loading">
        <h2 v-if="visibleGames.length && !loading && !loadFailed" class="search-results__title">
          <img :src="searchGameIcon" alt="" />
          <span>{{ resultTitle }}</span>
        </h2>
        <div v-if="submittedKeyword && loading" class="search-results__state" role="status">
          <x-loading size="24px" />
          <span>{{ $t('加载中') }}</span>
        </div>
        <div v-else-if="submittedKeyword && loadFailed" class="search-results__state">
          <x-button class="search-results__retry" type="primary" plain @click="loadGames">
            {{ $t('加载失败，点击重试') }}
          </x-button>
        </div>
        <template v-else-if="visibleGames.length">
          <div class="search-results__grid" :class="{ 'search-results__grid--long': imageDisplay === 'long' }">
            <BasicGameCard
              v-for="game in visibleGames"
              :key="game.entryKey || 'game:' + (game.entryGameId ?? game.id)"
              :game="game"
              :image-display="imageDisplay"
              :name-overlay="true"
              @select="selectGame"
              @disabled="showCustomToast({ type: 'fail', message: $t('tips.maintenance') })"
            />
          </div>
          <div class="search-results__footer">
            <span>{{ $t('共{count}个结果', { count: matchedGames.length }) }}</span>
            <x-button
              v-if="hasMoreGames"
              class="search-results__more"
              type="primary"
              plain
              @click="visibleCount += PAGE_SIZE"
            >
              {{ $t('加载更多') }}
              <svg-icon name="comm_icon_jzgd" />
            </x-button>
          </div>
        </template>
        <UiEmpty v-else :text="$t('暂无数据')" />
      </section>
    </main>
  </div>
</template>

<style scoped lang="less">
.search-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background-color: var(--skin__bg_1);

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.search-toolbar {
  display: flex;
  flex-shrink: 0;
  padding: 10px;

  :deep(.x-input-wrapper.x-input--focused:not(.x-input--invalid)) {
    border-color: var(--skin__border);
  }

  &__scope {
    flex-shrink: 0;
    min-width: 65px;
    max-width: 92.5px;

    :deep(.x-select) {
      height: 30px;
      padding: 0 10px;
      border-inline-end: 0;
      border-radius: 0;
      border-start-start-radius: 29px;
      border-end-start-radius: 29px;

      &:not(.x-select--invalid) {
        border-color: var(--skin__border);
      }
    }

    :deep(.x-select__label) {
      max-width: 50px;
      font-size: 12px;
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 30px;
    padding: 0 10px;
    border-color: var(--skin__border);
    border-inline-start: 0;
    border-radius: 0;
    border-start-end-radius: 29px;
    border-end-end-radius: 29px;
    font-size: 12px;

    &::before {
      position: absolute;
      top: 4px;
      inset-inline-start: 0;
      width: 1px;
      height: 22px;
      background-color: var(--skin__border);
      pointer-events: none;
      content: '';
    }

    :deep(.x-input__field:focus) {
      font-weight: 700;
    }

    :deep(.x-input__suffix) {
      gap: 7px;
    }
  }

  &__clear,
  &__submit {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 26px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;

    :deep(svg) {
      width: 15px;
      height: 15px;
    }
  }

  &__clear {
    color: var(--skin__neutral_2);
  }
}

.search-history {
  flex-shrink: 0;
  margin: 0 10px 10px;

  &__header,
  &__title {
    display: flex;
    align-items: center;
  }

  &__header {
    justify-content: space-between;
    min-height: 15px;
  }

  &__title {
    gap: 5px;
    margin: 0;
    color: var(--skin__neutral_2);
    font-size: 11px;
    font-weight: 400;
    line-height: 15px;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }

  &__delete {
    width: auto;
    height: 20px;
    padding: 0;
    border: 0;
    font-size: 11px;

    :deep(.x-button__icon) {
      margin-inline-end: 5px;
    }

    :deep(svg) {
      width: 12px;
      height: 12px;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 15px;
    max-height: 80px;
    margin: 0 -5px;
    padding: 10px 5px 5px;
    overflow-y: auto;
    list-style: none;
  }

  &__tag {
    position: relative;
    max-width: 100%;
    border: var(--lobby__px) solid var(--skin__border);
    border-radius: 13px;
    background-color: var(--skin__bg_2);
  }

  &__keyword {
    display: block;
    max-width: 151px;
    height: 24px;
    padding: 0 9px;
    overflow: hidden;
    border: 0;
    border-radius: inherit;
    color: var(--skin__neutral_2);
    background: transparent;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  &__remove {
    position: absolute;
    top: -5px;
    inset-inline-end: -5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--skin__neutral_3);
    background-color: var(--skin__bg_1);
    cursor: pointer;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}

.search-results {
  flex: 1;
  min-height: 0;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  overscroll-behavior: contain;

  &__title {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    padding: 5px 10px 10px;
    font-size: 15px;
    font-weight: 400;
    line-height: 21px;

    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 7px 7.5px;
    padding: 0 6px;

    &--long {
      grid-template-columns: repeat(3, 105px);
      width: 345px;
      margin: 0 auto;
      padding: 0;
      column-gap: 14.5px;
      row-gap: 15px;
    }

    :deep(.basic-game-card__poster) {
      width: 100%;
      border-radius: 12px;
    }

    &--long :deep(.basic-game-card__poster) {
      border-radius: 13.125px;
    }

    &--long :deep(.basic-game-card__favorite) {
      top: 3.99px;
      right: 3.99px;
      width: 17px;
      height: 17px;
    }

    &--long :deep(.basic-game-card__favorite-icon) {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    }
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 200px;
    color: var(--skin__neutral_2);
    font-size: 12px;
  }

  &__retry {
    width: auto;
    padding: 0 15px;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin: 10px 10px 15px;
    color: var(--skin__neutral_2);
    font-size: 13px;
    line-height: 20px;
  }

  &__more {
    width: auto;
    height: 25px;
    padding: 0;
    border: 0;
    font-size: 13px;

    :deep(.x-button__text) {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    :deep(svg) {
      width: 10px;
      height: 10px;
    }
  }

  :deep(.empty-box) {
    height: 100%;
    min-height: 200px;
  }
}
</style>
