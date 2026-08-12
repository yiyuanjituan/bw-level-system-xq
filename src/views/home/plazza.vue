<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showCustomToast } from '@/hooks/useCommon';
import useAuthStore from '@/store/modules/user';
import SubNavbar from '@/components/SubNavbar.vue';
import PlazzaMyProfile from './plazza/pages/PlazzaMyProfile.vue';
import PlazzaPostList from './plazza/pages/PlazzaPostList.vue';
import type { PlazzaPost, PlazzaProfile, PlazzaRecentGame, PlazzaTabValue } from './plazza/types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const plazzaTabs = [
  { label: '全部', value: 'all', emptyText: '暂无内容' },
  { label: '关注', value: 'following', emptyText: '暂无关注内容' },
  { label: '收藏', value: 'favorites', emptyText: '暂无收藏内容' },
  { label: '点赞', value: 'likes', emptyText: '暂无点赞内容' },
  { label: '我的主页', value: 'profile', emptyText: '作者还没发布' }
] as const;

const defaultActive: PlazzaTabValue = 'all';
const POST_PAGE_SIZE = 2;
const activeTab = ref<PlazzaTabValue>(defaultActive);
const isSearchVisible = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const currentPostPage = ref(1);
const searchKeyword = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
let loadMoreRequestId = 0;
let isLoadMoreRequestPending = false;
// 当前项目尚未提供广场最近游戏接口，先由容器保留真实数据入口。
const recentGames: PlazzaRecentGame[] = [];
// 当前项目尚未提供广场帖子接口，按用户提供的页面内容建立数据入口，后续可直接替换接口结果。
const postList = ref<PlazzaPost[]>([
  {
    id: 1,
    author: {
      name: 'Cq9杀手',
      avatarUrl: 'https://146.103.80.124:5001/siteadmin/default/2D/img_txn7.avif',
      followers: 0,
      following: false
    },
    content: '兄弟们3块1拉中彩票了',
    imageUrls: ['https://146.103.80.124:5001/publicityplaza/upload/413459514_20260811180747.863.avif'],
    createdAt: '2026/08/11 18:07:49',
    liked: false,
    likes: 1,
    favorited: false,
    favorites: 0
  },
  {
    id: 2,
    author: {
      name: 'Cq9杀手',
      avatarUrl: 'https://146.103.80.124:5001/siteadmin/default/2D/img_txn7.avif',
      followers: 0,
      following: false
    },
    content: '6900倍',
    imageUrls: ['https://146.103.80.124:5001/publicityplaza/upload/413459514_20260811181151.645.avif'],
    createdAt: '2026/08/11 18:11:54',
    liked: true,
    likes: 1,
    favorited: true,
    favorites: 1
  },
  {
    id: 3,
    author: {
      name: '7',
      avatarUrl: 'https://146.103.80.124:5001/siteadmin/default/2D/img_txn11.avif',
      followers: 1,
      following: false
    },
    content: '牛逼星系',
    imageUrls: ['https://146.103.80.124:5001/publicityplaza/upload/441962317_20260810235756.737.avif'],
    createdAt: '2026/08/10 23:57:58',
    liked: false,
    likes: 1,
    favorited: false,
    favorites: 0
  }
]);

const profile = computed<PlazzaProfile>(() => ({
  avatarUrl: String(auth.user.avatarUrl || ''),
  nickname: String(auth.user.nickName || '请设置昵称'),
  followers: 0,
  bio: '请设置个人介绍',
  statistics: {
    articles: 0,
    likes: 0,
    favorites: 0
  },
  rewards: {
    today: 0,
    total: 0
  }
}));

const currentEmptyText = computed(() => {
  if (searchKeyword.value.trim()) return '未搜索到相关内容';

  return plazzaTabs.find(tab => tab.value === activeTab.value)?.emptyText || '暂无内容';
});

const visiblePosts = computed(() => {
  let matchedPosts = postList.value;

  if (activeTab.value === 'following') {
    matchedPosts = matchedPosts.filter(post => post.author.following);
  } else if (activeTab.value === 'favorites') {
    matchedPosts = matchedPosts.filter(post => post.favorited);
  } else if (activeTab.value === 'likes') {
    matchedPosts = matchedPosts.filter(post => post.liked);
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return matchedPosts;

  return matchedPosts.filter(post => {
    return post.content.toLowerCase().includes(keyword) || post.author.name.toLowerCase().includes(keyword);
  });
});

const paginatedPosts = computed(() => {
  return visiblePosts.value.slice(0, currentPostPage.value * POST_PAGE_SIZE);
});

const isPostListFinished = computed(() => {
  return paginatedPosts.value.length >= visiblePosts.value.length;
});

function normalizeActive(active: unknown): PlazzaTabValue {
  const activeValue = String(Array.isArray(active) ? active[0] : active ?? defaultActive);
  return plazzaTabs.some(tab => tab.value === activeValue) ? (activeValue as PlazzaTabValue) : defaultActive;
}

function syncRouteActive(active: PlazzaTabValue) {
  if (route.query.active === active) return;

  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      active
    }
  });
}

async function toggleSearch() {
  isSearchVisible.value = !isSearchVisible.value;

  if (!isSearchVisible.value) {
    searchKeyword.value = '';
    return;
  }

  await nextTick();
  searchInputRef.value?.focus();
}

function handleUnavailable(message: string) {
  showCustomToast({ type: 'warning', message });
}

function handleRefresh() {
  // 广场接口接入后在这里重新请求当前频道，当前先保留下拉刷新的完整交互反馈。
  window.setTimeout(() => {
    resetPostPagination();
    isRefreshing.value = false;
  }, 350);
}

function resetPostPagination() {
  // 使切换频道或搜索前发起的加载失效，避免旧请求把新列表翻到下一页。
  loadMoreRequestId += 1;
  isLoadMoreRequestPending = false;
  currentPostPage.value = 1;
  isLoadingMore.value = false;
}

async function loadNextPostPage() {
  if (isLoadMoreRequestPending || isPostListFinished.value) return;

  const requestId = ++loadMoreRequestId;
  isLoadMoreRequestPending = true;
  isLoadingMore.value = true;

  // 当前暂无广场分页接口，保留加载反馈；接入接口后在这里请求并追加下一页数据。
  await new Promise<void>(resolve => window.setTimeout(resolve, 350));
  if (requestId !== loadMoreRequestId) return;

  currentPostPage.value += 1;
  isLoadMoreRequestPending = false;
  isLoadingMore.value = false;
}

function toggleFollow(authorName: string) {
  const authorPost = postList.value.find(post => post.author.name === authorName);
  if (!authorPost) return;

  const nextFollowing = !authorPost.author.following;
  // 同一作者的多条帖子同步关注状态，避免列表中出现互相冲突的按钮。
  postList.value.forEach(post => {
    if (post.author.name === authorName) post.author.following = nextFollowing;
  });
}

function togglePostAction(postId: number, action: 'like' | 'favorite') {
  const post = postList.value.find(postItem => postItem.id === postId);
  if (!post) return;

  if (action === 'like') {
    post.liked = !post.liked;
    post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1));
    return;
  }

  post.favorited = !post.favorited;
  post.favorites = Math.max(0, post.favorites + (post.favorited ? 1 : -1));
}

watch(
  () => route.query.active,
  active => {
    const normalizedActive = normalizeActive(active);
    activeTab.value = normalizedActive;

    if (active !== normalizedActive) syncRouteActive(normalizedActive);
  },
  { immediate: true }
);

watch(activeTab, active => {
  searchKeyword.value = '';
  isSearchVisible.value = false;
  resetPostPagination();
  syncRouteActive(active);
});

watch(searchKeyword, resetPostPagination);
</script>

<template>
  <main class="plazza-page">
    <sub-navbar title="发现" />

    <div class="plazza-tabs-wrap">
      <van-tabs v-model:active="activeTab" class="plazza-tabs" shrink animated>
        <van-tab v-for="tab in plazzaTabs" :key="tab.value" :name="tab.value" :title="tab.label">
          <section class="plazza-panel">
            <div v-if="isSearchVisible" class="plazza-search">
              <label class="plazza-search__field">
                <svg-icon name="comm_icon_ss" class-name="plazza-search__icon" />
                <input
                  ref="searchInputRef"
                  v-model.trim="searchKeyword"
                  type="search"
                  :placeholder="activeTab === 'profile' ? '搜索我的文章' : '搜索广场内容'"
                  maxlength="30"
                />
                <button v-if="searchKeyword" type="button" class="plazza-search__clear" aria-label="清空搜索内容" @click="searchKeyword = ''">
                  ×
                </button>
              </label>
              <button type="button" class="plazza-search__cancel" @click="toggleSearch">取消</button>
            </div>

            <div class="plazza-list-container">
              <div class="plazza-scroll">
                <van-pull-refresh
                  v-model="isRefreshing"
                  class="plazza-pull-refresh"
                  :head-height="32"
                  pulling-text="下拉即可刷新"
                  loosing-text="释放即可刷新"
                  success-text="刷新成功"
                  @refresh="handleRefresh"
                >
                  <template #loading>
                    <div class="plazza-pull-refresh__loading">
                      <span class="plazza-pull-refresh__spinning" aria-hidden="true">
                        <i class="plazza-pull-refresh__loader"></i>
                      </span>
                      <span class="plazza-pull-refresh__loading-text">加载中...</span>
                    </div>
                  </template>

                  <plazza-my-profile
                    v-if="tab.value === 'profile'"
                    :profile="profile"
                    :recent-games="recentGames"
                    :empty-text="currentEmptyText"
                    @edit-profile="router.push('/home/setting')"
                    @publish="handleUnavailable('发布功能暂未开放')"
                    @search="toggleSearch"
                    @share="handleUnavailable('分享功能暂未开放')"
                    @select-game="handleUnavailable('游戏功能暂未开放')"
                    @toggle-favorite="handleUnavailable('收藏功能暂未开放')"
                  />
                  <van-list
                    v-else
                    v-model:loading="isLoadingMore"
                    :finished="isPostListFinished"
                    :finished-text="paginatedPosts.length ? '没有更多了' : ''"
                    :immediate-check="false"
                    :offset="30"
                    @load="loadNextPostPage"
                  >
                    <template #loading>
                      <div class="plazza-load-more__loading">
                        <span class="plazza-pull-refresh__spinning" aria-hidden="true">
                          <i class="plazza-pull-refresh__loader"></i>
                        </span>
                        <span>加载下一页...</span>
                      </div>
                    </template>

                    <plazza-post-list
                      :posts="paginatedPosts"
                      :empty-text="currentEmptyText"
                      @toggle-follow="toggleFollow"
                      @toggle-like="togglePostAction($event, 'like')"
                      @toggle-favorite="togglePostAction($event, 'favorite')"
                      @share="handleUnavailable('分享功能暂未开放')"
                    />
                  </van-list>
                </van-pull-refresh>
              </div>
            </div>
          </section>
        </van-tab>
      </van-tabs>

      <button type="button" class="plazza-tabs__search" aria-label="搜索" :aria-expanded="isSearchVisible" @click="toggleSearch">
        <svg-icon name="comm_icon_ss" />
      </button>
    </div>
  </main>
</template>

<style scoped lang="less">
.plazza-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.plazza-tabs-wrap {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.plazza-tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  --van-tabs-line-height: 36px;
  --van-tabs-nav-background: var(--skin__bg_2);
  --van-tab-text-color: var(--skin__lead);
  --van-tab-active-text-color: var(--skin__primary);
  --van-tabs-bottom-bar-color: var(--skin__primary);
  --van-tabs-bottom-bar-width: 24px;
  --van-tabs-bottom-bar-height: 2px;
  --van-tab-font-size: 12px;
  --van-font-bold: 400;

  :deep(.van-tabs__wrap) {
    flex-shrink: 0;
    height: 36px;
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
  }

  :deep(.van-tabs__nav) {
    padding-right: 44px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 10px;
  }

  :deep(.van-tab__text) {
    line-height: 1;
  }

  :deep(.van-tabs__content) {
    flex: 1;
    min-height: 0;
  }

  :deep(.van-tabs__track),
  :deep(.van-tab__panel) {
    height: 100%;
  }
}

.plazza-tabs__search {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 36px;
  padding: 0;
  border: 0;
  color: var(--skin__primary);
  font-size: 18px;
  background: var(--skin__bg_2);
  cursor: pointer;
}

.plazza-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.plazza-search {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  margin: 10px 10px 0;
}

.plazza-list-container {
  flex: 1 1 auto;
  width: 100%;
  height: calc(calc(var(--lobby__screen-height) - var(--subpage-tabbar-base-height, 0px)) - 1.83rem);
  min-height: 0;
  box-sizing: border-box;
  padding-top: 0.2rem;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.plazza-scroll {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 10px 10px;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

.plazza-pull-refresh {
  min-height: 100%;
  overflow: hidden;
}

:deep(.plazza-pull-refresh .van-pull-refresh__track) {
  position: relative;
  height: 100%;
  min-height: 100%;
  transition-property: transform;
}

:deep(.plazza-pull-refresh .van-pull-refresh__head) {
  height: 32px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 32px;
  text-align: center;
}

:deep(.plazza-pull-refresh__loading) {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
  padding: 10px 0;
  overflow: hidden;
  color: var(--skin__neutral_2);
}

.plazza-pull-refresh__spinning {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 12px;
  min-height: 12px;
}

.plazza-pull-refresh__loader {
  display: block;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: plazza-pull-refresh-rotate 0.7s linear infinite;
}

.plazza-pull-refresh__loading-text {
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
}

.plazza-load-more__loading {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
}

:deep(.van-list__finished-text) {
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 40px;
}

@keyframes plazza-pull-refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}

.plazza-search__field {
  display: flex;
  flex: 1;
  align-items: center;
  height: 25px;
  min-width: 0;
  box-sizing: border-box;
  padding: 0 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 12.5px;
  color: var(--skin__neutral_2);
  background: var(--skin__bg_2);

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 7px;
    border: 0;
    outline: 0;
    color: var(--skin__lead);
    font: inherit;
    font-size: 13px;
    background: transparent;

    &::placeholder {
      color: var(--skin__neutral_2);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
}

.plazza-search__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--skin__primary);
}

.plazza-search__clear,
.plazza-search__cancel {
  flex-shrink: 0;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_1);
  font-family: inherit;
  background: transparent;
  cursor: pointer;
}

.plazza-search__clear {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: var(--skin__bg_2);
  font-size: 15px;
  line-height: 17px;
  background: var(--skin__neutral_2);
}

.plazza-search__cancel {
  font-size: 12px;
}

:deep(.empty-box) {
  flex: 1;
  height: auto;
  min-height: 190px;
}
</style>
