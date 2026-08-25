<script setup lang="ts">
import { $t } from "@/locales";
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useClipboard from 'vue-clipboard3';
import {
  getMomentsList,
  getMomentsProfile,
  getMomentsRecentGames,
  setMomentsFavorite,
  setMomentsFollow,
  setMomentsGameFavorite,
  setMomentsLike
} from '@/api/common';
import { showCustomToast } from '@/hooks/useCommon';
import useAuthStore from '@/store/modules/user';
import SubNavbar from '@/components/SubNavbar.vue';
import PlazzaMyProfile from './plazza/pages/PlazzaMyProfile.vue';
import PlazzaPostList from './plazza/pages/PlazzaPostList.vue';
import PlazzaProfileSetupDialog from './plazza/components/PlazzaProfileSetupDialog.vue';
import PlazzaFollowRecommendations from './plazza/components/PlazzaFollowRecommendations.vue';
import type { MomentsFollowRecommendation } from '@/api/common';
import type { PlazzaPost, PlazzaProfile, PlazzaRecentGame, PlazzaTabValue } from './plazza/types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { toClipboard } = useClipboard();

const plazzaTabs = computed(() => {
  return [
    { label: $t("全部"), value: "all", emptyText: $t("暂无内容") },
    { label: $t("关注"), value: "following", emptyText: $t("暂无关注内容") },
    { label: $t("收藏"), value: "favorites", emptyText: $t("暂无收藏内容") },
    { label: $t("点赞"), value: "likes", emptyText: $t("暂无点赞内容") },
    { label: $t("我的主页"), value: "profile", emptyText: $t("作者还没发帖~") }
  ] as const;
});

const defaultActive: PlazzaTabValue = 'all';
const POST_PAGE_SIZE = 10;
const activeTab = ref<PlazzaTabValue>(defaultActive);
const isSearchVisible = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const isInitialPostLoading = ref(false);
const postListErrorText = ref('');
const isProfileSetupVisible = ref(false);
const isSharing = ref(false);
const isSubmittingRecommendations = ref(false);
const isRecommendationDismissed = ref(false);
const hasFollowing = ref(false);
const hasMorePosts = ref(true);
const nextPostCursorId = ref<number | null>(null);
const searchKeyword = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
let loadMoreRequestId = 0;
let profileRequestId = 0;
let isLoadMoreRequestPending = false;
let searchRequestTimer: number | undefined;
const pendingFollowIds = ref<number[]>([]);
const pendingPostActionKeys = ref<string[]>([]);
const pendingGameFavoriteIds = ref<string[]>([]);
const recentGames = ref<PlazzaRecentGame[]>([]);
const postList = ref<PlazzaPost[]>([]);
const followRecommendations = ref<MomentsFollowRecommendation[]>([]);
const selectedRecommendationIds = ref<number[]>([]);

const profile = ref<PlazzaProfile>({
  id: Number(auth.user.id || 0),
  avatarUrl: String(auth.user.avatarUrl || ''),
  nickname: String(auth.user.nickName || '请设置昵称'),
  isAdmin: false,
  followers: 0,
  bio: String(auth.user.description || '请设置个人介绍'),
  statistics: {
    articles: 0,
    likes: 0,
    favorites: 0
  },
  rewards: {
    today: 0,
    total: 0
  },
  isSelf: true
});

const isPostListFinished = computed(() => {
  return !hasMorePosts.value;
});

const shouldShowFollowRecommendations = computed(() => {
  return activeTab.value === 'following'
    && !postList.value.length
    && !searchKeyword.value.trim()
    && !hasFollowing.value
    && !isRecommendationDismissed.value
    && followRecommendations.value.length > 0;
});

function normalizeActive(active: unknown): PlazzaTabValue {
  const activeValue = String(Array.isArray(active) ? active[0] : active ?? defaultActive);
  return plazzaTabs.value.some(tab => tab.value === activeValue) ? (activeValue as PlazzaTabValue) : defaultActive;
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

function hasCompletePublishProfile() {
  return Boolean(
    String(auth.user.nickName || '').trim()
    && String(auth.user.avatarUrl || '').trim()
    && String(auth.user.description || '').trim()
  );
}

function handlePublish() {
  if (!auth.token) {
    void router.push('/home/login');
    return;
  }

  if (!hasCompletePublishProfile()) {
    isProfileSetupVisible.value = true;
    return;
  }

  void router.push('/home/plazza/post');
}

function handleProfileSetupCompleted() {
  isProfileSetupVisible.value = false;
  void router.push('/home/plazza/post');
}

async function requestMyProfile() {
  const currentUserId = Number(auth.user.id || 0);
  if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
    recentGames.value = [];
    return;
  }

  const requestId = ++profileRequestId;
  try {
    const [profileResult, recentGameResult] = await Promise.all([
      getMomentsProfile(currentUserId),
      getMomentsRecentGames(currentUserId).catch(() => [])
    ]);
    if (requestId !== profileRequestId) return;

    profile.value = {
      ...profileResult,
      id: Number(profileResult?.id || currentUserId),
      avatarUrl: String(profileResult?.avatarUrl || auth.user.avatarUrl || ''),
      nickname: String(profileResult?.nickname || auth.user.nickName || '请设置昵称'),
      isAdmin: Boolean(profileResult?.isAdmin),
      followers: Number(profileResult?.followers || 0),
      bio: String(profileResult?.bio || auth.user.description || '请设置个人介绍'),
      statistics: {
        articles: Number(profileResult?.statistics?.articles || 0),
        likes: Number(profileResult?.statistics?.likes || 0),
        favorites: Number(profileResult?.statistics?.favorites || 0)
      },
      rewards: {
        today: Number(profileResult?.rewards?.today || 0),
        total: Number(profileResult?.rewards?.total || 0)
      },
      isSelf: true
    };
    recentGames.value = Array.isArray(recentGameResult) ? recentGameResult : [];
  } catch {
    if (requestId !== profileRequestId) return;
    recentGames.value = [];
  }
}

async function requestPostList(append = false) {
  const currentUserId = Number(auth.user.id || 0);
  const requestChannel = activeTab.value;
  if (activeTab.value === 'profile' && (!Number.isInteger(currentUserId) || currentUserId <= 0)) {
    postList.value = [];
    isInitialPostLoading.value = false;
    postListErrorText.value = '';
    hasMorePosts.value = false;
    nextPostCursorId.value = null;
    return;
  }

  if (!append) {
    isInitialPostLoading.value = true;
    postListErrorText.value = '';
  }

  const requestId = ++loadMoreRequestId;
  try {
    const response = await getMomentsList({
      channel: requestChannel,
      publisherId: requestChannel === 'profile' ? currentUserId : undefined,
      size: POST_PAGE_SIZE,
      cursorId: append ? nextPostCursorId.value || undefined : undefined,
      keyword: searchKeyword.value.trim() || undefined
    });
    if (requestId !== loadMoreRequestId) return;

    const nextPosts = Array.isArray(response.list)
      ? response.list.map(post => ({
          ...post,
          author: {
            ...post.author,
            isSelf: currentUserId > 0 && Number(post.author.id) === currentUserId
          }
        }))
      : [];
    if (append) {
      const existingPostIds = new Set(postList.value.map(post => post.id));
      postList.value.push(...nextPosts.filter(post => !existingPostIds.has(post.id)));
    } else {
      postList.value = nextPosts;
    }

    hasMorePosts.value = Boolean(response.more);
    nextPostCursorId.value = response.nextCursorId ? Number(response.nextCursorId) : null;
    if (!append && activeTab.value === 'following') {
      hasFollowing.value = Boolean(response.hasFollowing);
      followRecommendations.value = Array.isArray(response.recommendations)
        ? response.recommendations
        : [];
      selectedRecommendationIds.value = followRecommendations.value.map(user => user.id);
    }
  } catch (error) {
    if (requestId !== loadMoreRequestId) return;
    const errorMessage = error instanceof Error ? error.message : $t("未知异常");
    console.error('朋友圈帖子列表加载失败', {
      channel: requestChannel,
      publisherId: requestChannel === 'profile' ? currentUserId : undefined,
      errorMessage
    });
    if (!append) {
      postList.value = [];
      postListErrorText.value = '帖子加载失败，请稍后重试';
    }
    hasMorePosts.value = false;
    nextPostCursorId.value = null;
    if (!append && activeTab.value === 'following') {
      followRecommendations.value = [];
      selectedRecommendationIds.value = [];
    }
  } finally {
    if (!append && requestId === loadMoreRequestId) {
      isInitialPostLoading.value = false;
    }
  }
}

function retryPostList() {
  resetPostPagination();
  void requestPostList();
}

function toggleRecommendation(userId: number) {
  if (isSubmittingRecommendations.value) return;

  selectedRecommendationIds.value = selectedRecommendationIds.value.includes(userId)
    ? selectedRecommendationIds.value.filter(id => id !== userId)
    : [...selectedRecommendationIds.value, userId];
}

function skipRecommendations() {
  if (isSubmittingRecommendations.value) return;
  activeTab.value = 'all';
}

async function followSelectedRecommendations() {
  if (isSubmittingRecommendations.value || !selectedRecommendationIds.value.length) return;

  isSubmittingRecommendations.value = true;
  const selectedIds = [...selectedRecommendationIds.value];
  try {
    const results = await Promise.allSettled(
      selectedIds.map(userId => setMomentsFollow(userId, true))
    );
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    if (!successCount) {
      showCustomToast({ type: 'fail', message: $t("关注失败，请稍后重试") });
      return;
    }

    showCustomToast({ type: 'success', message: `已关注${successCount}位用户` });
    isRecommendationDismissed.value = true;
    resetPostPagination();
    await requestPostList();
  } finally {
    isSubmittingRecommendations.value = false;
  }
}

async function handleRefresh() {
  try {
    if (activeTab.value === 'profile') {
      resetPostPagination();
      await Promise.all([requestMyProfile(), requestPostList()]);
      return;
    }

    resetPostPagination();
    await requestPostList();
  } finally {
    isRefreshing.value = false;
  }
}

function resetPostPagination() {
  // 使切换频道或搜索前发起的加载失效，避免旧请求把新列表翻到下一页。
  loadMoreRequestId += 1;
  isLoadMoreRequestPending = false;
  hasMorePosts.value = true;
  nextPostCursorId.value = null;
  isLoadingMore.value = false;
  isInitialPostLoading.value = false;
  postListErrorText.value = '';
}

async function loadNextPostPage() {
  if (isLoadMoreRequestPending || isPostListFinished.value || !nextPostCursorId.value) return;

  isLoadMoreRequestPending = true;
  isLoadingMore.value = true;

  try {
    await requestPostList(true);
  } finally {
    isLoadMoreRequestPending = false;
    isLoadingMore.value = false;
  }
}

async function toggleFollow(authorId: number) {
  const authorPost = postList.value.find(post => post.author.id === authorId);
  if (!authorPost || authorPost.author.isSelf || pendingFollowIds.value.includes(authorId)) return;

  const requestId = loadMoreRequestId;
  const requestTab = activeTab.value;
  const authorPosts = postList.value.filter(post => post.author.id === authorId);
  const previousStates = authorPosts.map(post => ({
    post,
    following: post.author.following,
    followers: post.author.followers
  }));
  const nextFollowing = !authorPost.author.following;
  pendingFollowIds.value.push(authorId);

  // 同一作者的多条帖子同步状态和粉丝数，避免列表中出现互相冲突的数据。
  authorPosts.forEach(post => {
    post.author.following = nextFollowing;
    post.author.followers = Math.max(0, post.author.followers + (nextFollowing ? 1 : -1));
  });

  try {
    await setMomentsFollow(authorId, nextFollowing);
    showCustomToast({ type: 'success', message: nextFollowing ? '关注成功' : '已取消关注' });

    if (!nextFollowing && requestTab === 'following' && activeTab.value === requestTab && loadMoreRequestId === requestId) {
      postList.value = postList.value.filter(post => post.author.id !== authorId);
    }
  } catch {
    previousStates.forEach(state => {
      state.post.author.following = state.following;
      state.post.author.followers = state.followers;
    });
  } finally {
    pendingFollowIds.value = pendingFollowIds.value.filter(id => id !== authorId);
  }
}

async function togglePostAction(postId: number, action: 'like' | 'favorite') {
  const currentPost = postList.value.find(post => post.id === postId);
  const currentProfile = profile.value;
  const actionKey = `${action}:${postId}`;
  if (!currentPost || pendingPostActionKeys.value.includes(actionKey)) return;

  const requestId = loadMoreRequestId;
  const requestTab = activeTab.value;
  pendingPostActionKeys.value.push(actionKey);

  try {
    if (action === 'like') {
      const previousLiked = currentPost.liked;
      const previousLikes = currentPost.likes;
      const previousReceivedLikes = currentProfile.statistics.likes;
      const nextLiked = !previousLiked;
      currentPost.liked = nextLiked;
      currentPost.likes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));
      if (currentPost.author.isSelf) {
        currentProfile.statistics.likes = Math.max(0, previousReceivedLikes + (nextLiked ? 1 : -1));
      }

      try {
        await setMomentsLike(postId, nextLiked);
        showCustomToast({ type: 'success', message: nextLiked ? '点赞成功' : '已取消点赞' });
        if (!nextLiked && requestTab === 'likes' && activeTab.value === requestTab && loadMoreRequestId === requestId) {
          postList.value = postList.value.filter(post => post.id !== postId);
        }
      } catch {
        currentPost.liked = previousLiked;
        currentPost.likes = previousLikes;
        if (currentPost.author.isSelf) currentProfile.statistics.likes = previousReceivedLikes;
      }
      return;
    }

    const previousFavorited = currentPost.favorited;
    const previousFavorites = currentPost.favorites;
    const previousReceivedFavorites = currentProfile.statistics.favorites;
    const nextFavorited = !previousFavorited;
    currentPost.favorited = nextFavorited;
    currentPost.favorites = Math.max(0, previousFavorites + (nextFavorited ? 1 : -1));
    if (currentPost.author.isSelf) {
      currentProfile.statistics.favorites = Math.max(0, previousReceivedFavorites + (nextFavorited ? 1 : -1));
    }

    try {
      await setMomentsFavorite(postId, nextFavorited);
      showCustomToast({ type: 'success', message: nextFavorited ? '收藏成功' : '已取消收藏' });
      if (!nextFavorited && requestTab === 'favorites' && activeTab.value === requestTab && loadMoreRequestId === requestId) {
        postList.value = postList.value.filter(post => post.id !== postId);
      }
    } catch {
      currentPost.favorited = previousFavorited;
      currentPost.favorites = previousFavorites;
      if (currentPost.author.isSelf) currentProfile.statistics.favorites = previousReceivedFavorites;
    }
  } finally {
    pendingPostActionKeys.value = pendingPostActionKeys.value.filter(key => key !== actionKey);
  }
}

function isGameFavoritePending(gameId: string | number) {
  return pendingGameFavoriteIds.value.includes(String(gameId));
}

async function toggleGameFavorite(game: PlazzaRecentGame) {
  const gameId = String(game.id);
  if (isGameFavoritePending(gameId)) return;

  const previousFavorite = game.favorite;
  const nextFavorite = !previousFavorite;
  pendingGameFavoriteIds.value.push(gameId);
  game.favorite = nextFavorite;

  try {
    await setMomentsGameFavorite(game.id, nextFavorite);
    showCustomToast({ type: 'success', message: nextFavorite ? '收藏成功' : '已取消收藏' });
  } catch {
    game.favorite = previousFavorite;
  } finally {
    pendingGameFavoriteIds.value = pendingGameFavoriteIds.value.filter(id => id !== gameId);
  }
}

async function shareContent(post?: PlazzaPost) {
  if (isSharing.value) return;

  const publisherId = Number(post?.author.id || profile.value.id || auth.user.id || 0);
  if (!Number.isInteger(publisherId) || publisherId <= 0) {
    showCustomToast({ type: 'warning', message: $t("请先登录后再分享") });
    return;
  }

  const routeLocation = router.resolve(`/home/plazza/publisher/${publisherId}`);
  const shareUrl = new URL(routeLocation.href, window.location.href).toString();
  const publisherName = post?.author.name || profile.value.nickname;
  const shareTitle = post ? `${publisherName}的动态` : `${publisherName}的主页`;
  const shareText = post?.content?.trim()
    ? post.content.trim().slice(0, 100)
    : `查看${publisherName}的主页`;
  isSharing.value = true;

  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      showCustomToast({ type: 'success', message: $t("分享成功") });
      return;
    }

    await toClipboard(shareUrl);
    showCustomToast({ type: 'success', message: $t("链接已复制，可以分享给好友") });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;

    try {
      await toClipboard(shareUrl);
      showCustomToast({ type: 'success', message: $t("链接已复制，可以分享给好友") });
    } catch {
      showCustomToast({ type: 'fail', message: $t("分享失败，请稍后重试") });
    }
  } finally {
    isSharing.value = false;
  }
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
  postList.value = [];
  followRecommendations.value = [];
  selectedRecommendationIds.value = [];
  hasFollowing.value = false;
  isRecommendationDismissed.value = false;
  resetPostPagination();
  syncRouteActive(active);
  if (active === 'profile') {
    void Promise.all([requestMyProfile(), requestPostList()]);
  } else {
    void requestPostList();
  }
}, { immediate: true });

watch(searchKeyword, () => {
  resetPostPagination();
  window.clearTimeout(searchRequestTimer);
  searchRequestTimer = window.setTimeout(() => {
    void requestPostList();
  }, 300);
});

onBeforeUnmount(() => {
  loadMoreRequestId += 1;
  profileRequestId += 1;
  window.clearTimeout(searchRequestTimer);
});
</script>

<template>
  <main class="plazza-page">
    <sub-navbar :title="$t('发现')" />

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
                <button v-if="searchKeyword" type="button" class="plazza-search__clear" :aria-label="$t('清空搜索内容')" @click="searchKeyword = ''">
                  ×
                </button>
              </label>
              <button type="button" class="plazza-search__cancel" @click="toggleSearch">{{ $t("取消") }}</button>
            </div>

            <div class="plazza-list-container">
              <div class="plazza-scroll">
                <van-pull-refresh
                  v-model="isRefreshing"
                  class="plazza-pull-refresh"
                  :head-height="32"
                  :pulling-text="$t('下拉即可刷新')"
                  :loosing-text="$t('释放即可刷新')"
                  :success-text="$t('刷新成功')"
                  @refresh="handleRefresh"
                >
                  <template #loading>
                    <div class="plazza-pull-refresh__loading">
                      <span class="plazza-pull-refresh__spinning" aria-hidden="true">
                        <i class="plazza-pull-refresh__loader"></i>
                      </span>
                      <span class="plazza-pull-refresh__loading-text">{{ $t("加载中...") }}</span>
                    </div>
                  </template>

                  <van-list
                    v-model:loading="isLoadingMore"
                    :finished="isPostListFinished"
                    :finished-text="postList.length ? '没有更多了' : ''"
                    :immediate-check="false"
                    :offset="30"
                    @load="loadNextPostPage"
                  >
                    <template #loading>
                      <div class="plazza-load-more__loading">
                        <span class="plazza-pull-refresh__spinning" aria-hidden="true">
                          <i class="plazza-pull-refresh__loader"></i>
                        </span>
                        <span>{{ $t("加载下一页...") }}</span>
                      </div>
                    </template>

                    <plazza-my-profile
                      v-if="tab.value === 'profile'"
                      :profile="profile"
                      :recent-games="recentGames"
                      :posts="postList"
                      :empty-text="searchKeyword.trim() ? '未搜索到相关内容' : tab.emptyText"
                      :pending-game-favorite-ids="pendingGameFavoriteIds"
                      :pending-post-action-keys="pendingPostActionKeys"
                      :is-sharing="isSharing"
                      :post-loading="isInitialPostLoading"
                      :post-error-text="postListErrorText"
                      @edit-profile="router.push('/home/setting')"
                      @publish="handlePublish"
                      @search="toggleSearch"
                      @share="shareContent()"
                      @select-game="handleUnavailable('游戏功能暂未开放')"
                      @toggle-game-favorite="toggleGameFavorite"
                      @toggle-like="togglePostAction($event, 'like')"
                      @toggle-post-favorite="togglePostAction($event, 'favorite')"
                      @share-post="shareContent"
                      @retry-posts="retryPostList"
                    />

                    <template v-else>
                      <plazza-follow-recommendations
                        v-if="shouldShowFollowRecommendations"
                        :users="followRecommendations"
                        :selected-ids="selectedRecommendationIds"
                        :submitting="isSubmittingRecommendations"
                        @toggle="toggleRecommendation"
                        @skip="skipRecommendations"
                        @submit="followSelectedRecommendations"
                      />

                      <plazza-post-list
                        v-else
                        :posts="postList"
                        :empty-text="searchKeyword.trim() ? '未搜索到相关内容' : tab.emptyText"
                        :pending-follow-ids="pendingFollowIds"
                        :pending-post-action-keys="pendingPostActionKeys"
                        :is-sharing="isSharing"
                        :loading="isInitialPostLoading"
                        :error-text="postListErrorText"
                        :show-follow-action="activeTab !== 'profile'"
                        @toggle-follow="toggleFollow"
                        @toggle-like="togglePostAction($event, 'like')"
                        @toggle-favorite="togglePostAction($event, 'favorite')"
                        @share="shareContent"
                        @retry="retryPostList"
                      />
                    </template>
                  </van-list>
                </van-pull-refresh>
              </div>
            </div>
          </section>
        </van-tab>
      </van-tabs>

      <button type="button" class="plazza-tabs__search" :aria-label="$t('搜索')" :aria-expanded="isSearchVisible" @click="toggleSearch">
        <svg-icon name="comm_icon_ss" />
      </button>
    </div>

    <plazza-profile-setup-dialog
      v-model:show="isProfileSetupVisible"
      @completed="handleProfileSetupCompleted"
    />
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
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

:deep(.plazza-pull-refresh .van-pull-refresh__track) {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
  height: auto;
  transition-property: transform;
}

:deep(.plazza-pull-refresh .van-list) {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
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
  flex: 1 0 auto;
  height: auto;
  min-height: 190px;
}
</style>
