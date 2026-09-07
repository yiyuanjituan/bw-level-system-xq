<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getGameListById } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import type { HomeGameRecord } from "@/components/Home/types";
import BasicGameCard from "@/components/HomeBasic/BasicGameCard.vue";
import SubNavbar from "@/components/SubNavbar.vue";
import UiEmpty from "@/components/UI/empty.vue";
import XLoading from "@/components/X/x-loading.vue";

defineOptions({ name: "HomeSearch" });

type SearchScope = "all" | "favorite";

const HISTORY_KEY = "home-search-history";
const route = useRoute();
const router = useRouter();
const keyword = ref(String(route.query.q ?? ""));
const searchScope = ref<SearchScope>("all");
const games = ref<HomeGameRecord[]>([]);
const history = ref(readHistory());
const loading = ref(false);
const searched = ref(Boolean(String(route.query.q ?? "").trim()));
const scopePopoverVisible = ref(false);

const searchText = computed(() => keyword.value.trim());
const scopeOptions = computed(() => [
  { value: "all" as const, label: $t("游戏") },
  { value: "favorite" as const, label: $t("收藏游戏") }
]);
const selectedScopeLabel = computed(() => {
  return scopeOptions.value.find(option => option.value === searchScope.value)?.label ?? $t("游戏");
});
const filteredGames = computed(() => {
  const normalizedKeyword = searchText.value.toLocaleLowerCase();
  return games.value.filter(game => {
    const matchesScope = searchScope.value === "all" || Boolean(game.favorite);
    const matchesKeyword = !normalizedKeyword || String(game.name ?? "").toLocaleLowerCase().includes(normalizedKeyword);
    return matchesScope && matchesKeyword;
  });
});

function readHistory(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(item => typeof item === "string").slice(0, 10) : [];
  } catch {
    return [];
  }
}

function persistHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));
}

function saveHistory(value: string) {
  history.value = [value, ...history.value.filter(item => item !== value)].slice(0, 10);
  persistHistory();
}

function submitSearch() {
  const value = searchText.value;
  if (!value) {
    searched.value = false;
    void router.replace("/home/search");
    return;
  }

  saveHistory(value);
  searched.value = true;
  void router.replace({ path: "/home/search", query: { q: value } });
}

function clearSearch() {
  keyword.value = "";
  searched.value = false;
  void router.replace("/home/search");
}

function selectHistory(value: string) {
  keyword.value = value;
  submitSearch();
}

function removeHistory(value: string) {
  history.value = history.value.filter(item => item !== value);
  persistHistory();
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem(HISTORY_KEY);
}

function selectScope(scope: SearchScope) {
  searchScope.value = scope;
  scopePopoverVisible.value = false;
}

async function loadGames() {
  loading.value = true;
  try {
    const response = await getGameListById({ id: 0, mode: "all" });
    games.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("搜索页加载游戏失败，失败原因：", error);
    showCustomToast({ type: "fail", message: $t("操作失败") });
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.query.q,
  value => {
    const nextKeyword = String(value ?? "");
    keyword.value = nextKeyword;
    searched.value = Boolean(nextKeyword.trim());
  }
);

watch(searchText, value => {
  if (!value && searched.value) {
    searched.value = false;
    void router.replace("/home/search");
  }
});

onMounted(() => void loadGames());
</script>

<template>
  <div class="search-page">
    <SubNavbar :title="$t('搜索')" />

    <main class="search-page__main">
      <form class="search-page__handle" @submit.prevent="submitSearch">
        <van-popover v-model:show="scopePopoverVisible" placement="bottom-start" :show-arrow="false" :offset="[0, 4]" teleport="body">
          <template #reference>
            <button type="button" class="search-page__scope" :aria-expanded="scopePopoverVisible">
              <span>{{ selectedScopeLabel }}</span>
              <svg-icon name="arrow-down" class-name="search-page__scope-arrow" :class="{ 'is-open': scopePopoverVisible }" />
            </button>
          </template>
          <div class="search-page__scope-menu">
            <button
              v-for="option in scopeOptions"
              :key="option.value"
              type="button"
              class="search-page__scope-option"
              :class="{ 'is-active': option.value === searchScope }"
              @click="selectScope(option.value)"
            >
              <span>{{ option.label }}</span>
              <svg-icon v-if="option.value === searchScope" name="check-icon" class-name="search-page__scope-check" />
            </button>
          </div>
        </van-popover>

        <div class="search-page__bar">
          <input v-model="keyword" type="search" maxlength="100" :placeholder="$t('请输入搜索内容')" @keydown.esc="clearSearch" />
          <button v-if="keyword" type="button" class="search-page__icon-button" :aria-label="$t('清空搜索内容')" @click="clearSearch">
            <svg-icon name="close-circle" />
          </button>
          <button type="submit" class="search-page__icon-button search-page__icon-button--submit" :aria-label="$t('搜索')">
            <svg-icon name="comm_icon_ss" />
          </button>
        </div>
      </form>

      <section v-if="!searched" class="search-page__history" aria-labelledby="search-history-title">
        <div class="search-page__history-head">
          <div id="search-history-title" class="search-page__section-label"><span class="search-page__section-mark" />{{ $t("最近搜索") }}</div>
          <button v-if="history.length" type="button" class="search-page__clear-history" @click="clearHistory">{{ $t("删除全部") }}</button>
        </div>
        <div v-if="history.length" class="search-page__history-list">
          <span v-for="item in history" :key="item" class="search-page__history-item">
            <button type="button" @click="selectHistory(item)">{{ item }}</button>
            <button type="button" class="search-page__history-remove" :aria-label="$t('删除')" @click="removeHistory(item)">
              <svg-icon name="close" />
            </button>
          </span>
        </div>
        <p v-else class="search-page__history-empty">{{ $t("暂无数据") }}</p>
      </section>

      <section v-else class="search-page__results" aria-live="polite">
        <div class="search-page__results-head">
          <div class="search-page__section-label"><span class="search-page__section-mark" />{{ selectedScopeLabel }}</div>
          <span class="search-page__count">{{ filteredGames.length }}</span>
        </div>

        <div v-if="loading" class="search-page__state" role="status">
          <XLoading size="24px" />
          <span>{{ $t("加载中") }}</span>
        </div>
        <div v-else-if="filteredGames.length" class="search-page__grid">
          <BasicGameCard
            v-for="game in filteredGames"
            :key="game.entryKey || `${game.gameMode}-${game.id}`"
            :game="game"
            :highlight-keyword="searchText"
          />
        </div>
        <UiEmpty v-else :text="$t('暂无游戏')" />
      </section>
    </main>
  </div>
</template>

<style scoped lang="less">
.search-page {
  --search-side-padding: 10px;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.search-page__main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.search-page__main::-webkit-scrollbar {
  display: none;
}

.search-page__handle {
  display: flex;
  padding: 10px var(--search-side-padding);
}

.search-page__scope,
.search-page__bar {
  height: 35px;
  box-sizing: border-box;
  border: 1px solid var(--skin__border);
  background: var(--skin__bg_2);
}

.search-page__scope {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 76px;
  max-width: 104px;
  padding: 0 10px;
  border-right: 0;
  border-radius: 18px 0 0 18px;
  color: var(--skin__neutral_1);
  font-size: 12px;
}

.search-page__scope-arrow {
  width: 9px;
  height: 9px;
  color: var(--skin__neutral_2);
  transition: transform 0.2s ease;
}

.search-page__scope-arrow.is-open {
  transform: rotate(180deg);
}

.search-page__scope-menu {
  min-width: 134px;
  padding: 5px;
  border: 1px solid var(--skin__border);
  border-radius: 8px;
  background: var(--skin__bg_2);
  box-shadow: 0 6px 20px rgb(0 0 0 / 18%);
}

.search-page__scope-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 34px;
  padding: 0 8px;
  border: 0;
  border-radius: 5px;
  color: var(--skin__neutral_2);
  background: transparent;
  font-size: 12px;
  text-align: left;
}

.search-page__scope-option.is-active {
  color: var(--skin__primary);
  background: rgba(var(--skin__primary__toRgbString), 0.1);
}

.search-page__scope-check {
  width: 12px;
  height: 12px;
}

.search-page__bar {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  border-left: 0;
  border-radius: 0 18px 18px 0;
}

.search-page__bar::before {
  position: absolute;
  top: 6px;
  left: 0;
  width: 1px;
  height: 22px;
  background: var(--skin__border);
  content: "";
}

.search-page__bar input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0 10px;
  border: 0;
  outline: 0;
  color: var(--skin__lead);
  background: transparent;
  font: inherit;
  font-size: 12px;
}

.search-page__bar input::placeholder {
  color: var(--skin__neutral_2);
}

.search-page__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
}

.search-page__icon-button :deep(svg) {
  width: 15px;
  height: 15px;
}

.search-page__icon-button--submit {
  margin-right: 3px;
  color: var(--skin__primary);
}

.search-page__history,
.search-page__results {
  margin: 0 var(--search-side-padding) 10px;
}

.search-page__history-head,
.search-page__results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
}

.search-page__section-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--skin__lead);
  font-size: 14px;
  font-weight: 600;
}

.search-page__section-mark {
  width: 3px;
  height: 15px;
  border-radius: 2px;
  background: var(--skin__primary);
}

.search-page__clear-history {
  padding: 0;
  border: 0;
  color: var(--skin__accent_2);
  background: transparent;
  font-size: 11px;
}

.search-page__history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 11px;
}

.search-page__history-item {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 27px;
  padding: 0 4px 0 10px;
  border: 1px solid var(--skin__border);
  border-radius: 14px;
  background: var(--skin__bg_2);
}

.search-page__history-item > button:first-child {
  max-width: 150px;
  overflow: hidden;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-page__history-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  margin-left: 3px;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_3);
  background: transparent;
}

.search-page__history-remove :deep(svg) {
  width: 12px;
  height: 12px;
}

.search-page__history-empty {
  margin: 28px 0;
  color: var(--skin__neutral_2);
  font-size: 12px;
  text-align: center;
}

.search-page__results-head {
  padding-bottom: 9px;
  border-bottom: 1px solid var(--skin__border);
}

.search-page__count {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  color: var(--skin__primary);
  background: rgba(var(--skin__primary__toRgbString), 0.12);
  font-size: 11px;
  line-height: 20px;
  text-align: center;
}

.search-page__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px 7px;
  padding: 13px 3px 5px;
}

.search-page__grid :deep(.basic-game-card__poster) {
  width: 100%;
}

.search-page__grid :deep(.basic-game-card__name) {
  font-size: 11px;
}

.search-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  gap: 9px;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.search-page__state :deep(.x-loading) {
  color: var(--skin__primary);
}

.search-page__results > :deep(.empty-box) {
  min-height: 280px;
}

@media (min-width: 520px) {
  .search-page {
    --search-side-padding: 16px;
  }

  .search-page__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 18px 12px;
  }
}
</style>
