<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import useClipboard from "vue-clipboard3";
import adminBadgeUrl from "@/assets/home/moments/cert_3.png";
import favoriteOffUrl from "@/assets/home/btn_sc_off_2.avif";
import favoriteOnUrl from "@/assets/home/btn_sc_on_2.avif";
import recommendUrl from "@/assets/home/img_game_tj1_1.avif";
import {
  getMomentsList,
  getMomentsProfile,
  getMomentsRecentGames,
  setMomentsFavorite,
  setMomentsFollow,
  setMomentsGameFavorite,
  setMomentsLike
} from "@/api/common";
import SubNavbar from "@/components/SubNavbar.vue";
import { showCustomToast } from "@/hooks/useCommon";
import PlazzaLazyImage from "./components/PlazzaLazyImage.vue";
import PlazzaPostList from "./pages/PlazzaPostList.vue";
import type { PlazzaPost, PlazzaProfile, PlazzaRecentGame } from "./types";

const POST_PAGE_SIZE = 10;
const defaultAvatarUrl = "/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif";

const route = useRoute();
const router = useRouter();
const { toClipboard } = useClipboard();
const profile = ref<PlazzaProfile | null>(null);
const recentGames = ref<PlazzaRecentGame[]>([]);
const posts = ref<PlazzaPost[]>([]);
const isInitialLoading = ref(false);
const isProfileLoadFailed = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const isFollowing = ref(false);
const isSharing = ref(false);
const pendingGameFavoriteIds = ref<string[]>([]);
const isSearchVisible = ref(false);
const searchKeyword = ref("");
const hasMorePosts = ref(true);
const nextCursorId = ref<number | null>(null);
let publisherRequestId = 0;
let postRequestId = 0;
let isLoadMoreRequestPending = false;
const pendingPostActions = new Set<string>();
let searchTimer: number | undefined;

const publisherId = computed(() => Number(route.params.id));
const pageTitle = computed(() => profile.value?.nickname || "发布者主页");
const visibleRecentGames = computed(() => recentGames.value.slice(0, 4));

async function requestPosts(append = false) {
  const currentPublisherId = publisherId.value;
  const currentRequestId = ++postRequestId;

  try {
    const response = await getMomentsList({
      channel: "profile",
      publisherId: currentPublisherId,
      size: POST_PAGE_SIZE,
      cursorId: append ? nextCursorId.value || undefined : undefined,
      keyword: searchKeyword.value.trim() || undefined
    });

    const isStaleRequest = currentRequestId !== postRequestId || currentPublisherId !== publisherId.value;
    if (isStaleRequest) return;

    const nextPosts = Array.isArray(response.list) ? response.list : [];
    if (append) {
      const existingPostIds = new Set(posts.value.map(post => post.id));
      posts.value.push(...nextPosts.filter(post => !existingPostIds.has(post.id)));
    } else {
      posts.value = nextPosts;
    }

    hasMorePosts.value = Boolean(response.more);
    nextCursorId.value = response.nextCursorId ? Number(response.nextCursorId) : null;
  } catch {
    const isStaleRequest = currentRequestId !== postRequestId || currentPublisherId !== publisherId.value;
    if (isStaleRequest) return;

    if (!append) posts.value = [];
    hasMorePosts.value = false;
    nextCursorId.value = null;
  }
}

async function loadPublisher() {
  if (!Number.isInteger(publisherId.value) || publisherId.value <= 0) {
    showCustomToast({ type: "warning", message: "发布者ID异常" });
    await router.replace("/home/plazza");
    return;
  }

  const currentPublisherId = publisherId.value;
  const currentRequestId = ++publisherRequestId;

  // 切换发布者时废弃上一位发布者的帖子请求，避免旧数据覆盖当前页面。
  postRequestId += 1;
  profile.value = null;
  recentGames.value = [];
  posts.value = [];
  isInitialLoading.value = true;
  isProfileLoadFailed.value = false;
  isLoadMoreRequestPending = false;
  isLoadingMore.value = false;
  isFollowing.value = false;
  isSharing.value = false;
  pendingGameFavoriteIds.value = [];
  pendingPostActions.clear();
  isSearchVisible.value = false;
  searchKeyword.value = "";
  hasMorePosts.value = true;
  nextCursorId.value = null;

  try {
    const [profileResult, recentGameResult] = await Promise.all([
      getMomentsProfile(currentPublisherId),
      getMomentsRecentGames(currentPublisherId).catch(() => [])
    ]);

    const isStaleRequest = currentRequestId !== publisherRequestId || currentPublisherId !== publisherId.value;
    if (isStaleRequest) return;
    if (!profileResult || typeof profileResult !== "object") {
      throw new Error("发布者信息为空");
    }

    profile.value = {
      ...profileResult,
      avatarUrl: String(profileResult.avatarUrl || ""),
      nickname: String(profileResult.nickname || "发布者"),
      isAdmin: Boolean(profileResult.isAdmin),
      followers: Number(profileResult.followers || 0),
      bio: String(profileResult.bio || ""),
      statistics: {
        articles: Number(profileResult.statistics?.articles || 0),
        likes: Number(profileResult.statistics?.likes || 0),
        favorites: Number(profileResult.statistics?.favorites || 0)
      },
      rewards: {
        today: Number(profileResult.rewards?.today || 0),
        total: Number(profileResult.rewards?.total || 0)
      },
      following: Boolean(profileResult.following),
      isSelf: Boolean(profileResult.isSelf)
    };
    recentGames.value = Array.isArray(recentGameResult) ? recentGameResult : [];
    await requestPosts();
  } catch {
    const isStaleRequest = currentRequestId !== publisherRequestId || currentPublisherId !== publisherId.value;
    if (isStaleRequest) return;

    posts.value = [];
    hasMorePosts.value = false;
    isProfileLoadFailed.value = true;
  } finally {
    if (currentRequestId === publisherRequestId) isInitialLoading.value = false;
  }
}

async function handleRefresh() {
  try {
    if (!profile.value) {
      await loadPublisher();
      return;
    }

    resetPostPagination();
    await requestPosts();
  } finally {
    isRefreshing.value = false;
  }
}

function resetPostPagination() {
  // 废弃刷新或搜索前发起的分页请求，避免旧数据追加到新列表。
  postRequestId += 1;
  isLoadMoreRequestPending = false;
  hasMorePosts.value = true;
  nextCursorId.value = null;
  isLoadingMore.value = false;
}

async function loadNextPage() {
  if (isLoadMoreRequestPending || !hasMorePosts.value) {
    isLoadingMore.value = false;
    return;
  }

  if (!nextCursorId.value) {
    hasMorePosts.value = false;
    isLoadingMore.value = false;
    return;
  }

  isLoadMoreRequestPending = true;
  isLoadingMore.value = true;
  try {
    await requestPosts(true);
  } finally {
    isLoadMoreRequestPending = false;
    isLoadingMore.value = false;
  }
}

async function toggleFollow() {
  if (!profile.value || profile.value.isSelf || isFollowing.value) return;

  const currentProfile = profile.value;
  const currentPublisherId = publisherId.value;
  const previousFollowing = currentProfile.following;
  const previousFollowers = currentProfile.followers;
  const nextFollowing = !previousFollowing;
  isFollowing.value = true;
  currentProfile.following = nextFollowing;
  currentProfile.followers = Math.max(0, previousFollowers + (nextFollowing ? 1 : -1));
  posts.value.forEach(post => {
    post.author.following = nextFollowing;
    post.author.followers = currentProfile.followers;
  });

  try {
    await setMomentsFollow(currentPublisherId, nextFollowing);
    if (currentPublisherId !== publisherId.value) return;
    showCustomToast({ type: "success", message: nextFollowing ? "关注成功" : "已取消关注" });
  } catch {
    if (currentPublisherId !== publisherId.value || profile.value !== currentProfile) return;
    currentProfile.following = previousFollowing;
    currentProfile.followers = previousFollowers;
    posts.value.forEach(post => {
      post.author.following = previousFollowing;
      post.author.followers = previousFollowers;
    });
  } finally {
    if (currentPublisherId === publisherId.value) isFollowing.value = false;
  }
}

async function togglePostAction(postId: number, action: "like" | "favorite") {
  const currentPost = posts.value.find(post => post.id === postId);
  const actionKey = `${action}:${postId}`;
  if (!currentPost || pendingPostActions.has(actionKey)) return;

  pendingPostActions.add(actionKey);

  try {
    if (action === "like") {
      const previousLiked = currentPost.liked;
      const previousLikes = currentPost.likes;
      const nextLiked = !previousLiked;
      currentPost.liked = nextLiked;
      currentPost.likes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));

      try {
        await setMomentsLike(postId, nextLiked);
      } catch {
        currentPost.liked = previousLiked;
        currentPost.likes = previousLikes;
      }
      return;
    }

    const previousFavorited = currentPost.favorited;
    const previousFavorites = currentPost.favorites;
    const nextFavorited = !previousFavorited;
    currentPost.favorited = nextFavorited;
    currentPost.favorites = Math.max(0, previousFavorites + (nextFavorited ? 1 : -1));

    try {
      await setMomentsFavorite(postId, nextFavorited);
      showCustomToast({ type: "success", message: nextFavorited ? "收藏成功" : "已取消收藏" });
    } catch {
      currentPost.favorited = previousFavorited;
      currentPost.favorites = previousFavorites;
    }
  } finally {
    pendingPostActions.delete(actionKey);
  }
}

function isGameFavoritePending(gameId: string | number) {
  return pendingGameFavoriteIds.value.includes(String(gameId));
}

async function toggleGameFavorite(game: PlazzaRecentGame) {
  const gameId = String(game.id);
  if (isGameFavoritePending(gameId)) return;

  const currentPublisherId = publisherId.value;
  const previousFavorite = game.favorite;
  const nextFavorite = !previousFavorite;
  pendingGameFavoriteIds.value.push(gameId);
  game.favorite = nextFavorite;

  try {
    await setMomentsGameFavorite(game.id, nextFavorite);
    if (currentPublisherId !== publisherId.value) return;
    showCustomToast({ type: "success", message: nextFavorite ? "收藏成功" : "已取消收藏" });
  } catch {
    if (currentPublisherId !== publisherId.value) return;
    game.favorite = previousFavorite;
  } finally {
    pendingGameFavoriteIds.value = pendingGameFavoriteIds.value.filter(id => id !== gameId);
  }
}

async function sharePublisher(post?: PlazzaPost) {
  if (!profile.value || isSharing.value) return;

  const shareUrl = window.location.href;
  const shareTitle = post ? `${profile.value.nickname}的动态` : `${profile.value.nickname}的主页`;
  const shareText = post?.content?.trim()
    ? post.content.trim().slice(0, 100)
    : `查看${profile.value.nickname}的主页`;
  isSharing.value = true;

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      showCustomToast({ type: "success", message: "分享成功" });
      return;
    }

    await toClipboard(shareUrl);
    showCustomToast({ type: "success", message: "链接已复制，可以分享给好友" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;

    try {
      await toClipboard(shareUrl);
      showCustomToast({ type: "success", message: "链接已复制，可以分享给好友" });
    } catch {
      showCustomToast({ type: "fail", message: "分享失败，请稍后重试" });
    }
  } finally {
    isSharing.value = false;
  }
}

function toggleSearch() {
  isSearchVisible.value = !isSearchVisible.value;
  if (!isSearchVisible.value) searchKeyword.value = "";
}

function showUnavailable(message: string) {
  showCustomToast({ type: "warning", message });
}

watch(
  publisherId,
  () => {
    void loadPublisher();
  },
  { immediate: true }
);

watch(searchKeyword, () => {
  resetPostPagination();
  window.clearTimeout(searchTimer);
  if (!profile.value) return;

  searchTimer = window.setTimeout(() => {
    void requestPosts();
  }, 300);
});

onBeforeUnmount(() => {
  publisherRequestId += 1;
  postRequestId += 1;
  window.clearTimeout(searchTimer);
});
</script>

<template>
  <main class="publisher-page">
    <sub-navbar :title="pageTitle" />

    <section class="publisher-page__content">
      <div v-if="isSearchVisible" class="publisher-search">
        <svg-icon name="comm_icon_ss" />
        <input
          v-model.trim="searchKeyword"
          type="search"
          maxlength="30"
          placeholder="搜索发布者文章"
          autofocus
        />
        <button type="button" @click="toggleSearch">取消</button>
      </div>

      <van-pull-refresh
        v-model="isRefreshing"
        class="publisher-pull-refresh"
        :head-height="32"
        pulling-text="下拉即可刷新"
        loosing-text="释放即可刷新"
        success-text="刷新成功"
        @refresh="handleRefresh"
      >
        <template #loading>
          <div class="publisher-pull-refresh__loading">
            <span class="publisher-pull-refresh__spinning" aria-hidden="true">
              <i class="publisher-pull-refresh__loader"></i>
            </span>
            <span class="publisher-pull-refresh__loading-text">加载中...</span>
          </div>
        </template>

        <div v-if="isInitialLoading" class="publisher-state">加载中...</div>
        <ui-empty v-else-if="isProfileLoadFailed" text="发布者信息加载失败" />

        <template v-else-if="profile">
          <article class="publisher-profile">
            <header class="publisher-profile__header">
              <div class="publisher-profile__avatar-wrap">
                <plazza-lazy-image
                  class="publisher-profile__avatar"
                  :src="profile.avatarUrl"
                  :fallback-src="defaultAvatarUrl"
                  :alt="`${profile.nickname}的头像`"
                  error-text=""
                />
                <span
                  v-if="!profile.isSelf && !profile.following"
                  class="publisher-profile__follow-mark"
                  aria-hidden="true"
                >
                  <svg-icon name="icon_message_fx_gz" />
                </span>
              </div>

              <div class="publisher-profile__identity">
                <div class="publisher-profile__name">
                  <img
                    v-if="profile.isAdmin"
                    class="publisher-profile__admin-badge"
                    :src="adminBadgeUrl"
                    alt="朋友圈管理员"
                  />
                  <strong>{{ profile.nickname }}</strong>
                </div>
                <p>
                  <b>{{ profile.followers }}</b>
                  <span>位粉丝</span>
                </p>
              </div>

              <button
                v-if="!profile.isSelf"
                type="button"
                class="publisher-profile__follow"
                :class="{ 'publisher-profile__follow--active': profile.following }"
                :disabled="isFollowing"
                :aria-busy="isFollowing"
                @click="toggleFollow"
              >
                {{ isFollowing ? "处理中..." : profile.following ? "已关注" : "+关注" }}
              </button>
            </header>

            <p v-if="profile.bio" class="publisher-profile__bio">{{ profile.bio }}</p>

            <div class="publisher-profile__overview">
              <dl class="publisher-profile__statistics">
                <div>
                  <dt>{{ profile.statistics.articles }}</dt>
                  <dd>文章</dd>
                </div>
                <div>
                  <dt>{{ profile.statistics.likes }}</dt>
                  <dd>点赞</dd>
                </div>
                <div>
                  <dt>{{ profile.statistics.favorites }}</dt>
                  <dd>收藏</dd>
                </div>
              </dl>

              <div class="publisher-profile__actions">
                <button type="button" aria-label="搜索文章" @click="toggleSearch">
                  <svg-icon name="comm_icon_ss" />
                </button>
                <button
                  type="button"
                  class="publisher-profile__share"
                  :disabled="isSharing"
                  :aria-busy="isSharing"
                  @click="sharePublisher()"
                >
                  <svg-icon name="promote-share" />
                  <span>{{ isSharing ? "分享中..." : "分享" }}</span>
                </button>
              </div>
            </div>
          </article>

          <section v-if="visibleRecentGames.length" class="publisher-recent-games">
            <header class="publisher-recent-games__header">
              <h2>最近在玩</h2>
            </header>

            <div class="publisher-recent-games__list">
              <article
                v-for="game in visibleRecentGames"
                :key="game.id"
                class="publisher-recent-games__card"
              >
                <button
                  type="button"
                  class="publisher-recent-games__launch"
                  :aria-label="`进入${game.name}`"
                  @click="showUnavailable('游戏功能暂未开放')"
                >
                  <plazza-lazy-image
                    class="publisher-recent-games__cover"
                    :src="game.coverUrl"
                    :alt="game.name"
                    error-text=""
                  />
                  <span class="publisher-recent-games__name">
                    <strong>{{ game.name }}</strong>
                  </span>
                  <img
                    v-if="game.recommended"
                    class="publisher-recent-games__recommend"
                    :src="recommendUrl"
                    alt="推荐"
                  />
                </button>

                <button
                  type="button"
                  class="publisher-recent-games__favorite"
                  :aria-label="game.favorite ? '取消收藏' : '收藏游戏'"
                  :aria-busy="isGameFavoritePending(game.id)"
                  :disabled="isGameFavoritePending(game.id)"
                  @click.stop="toggleGameFavorite(game)"
                >
                  <img :src="game.favorite ? favoriteOnUrl : favoriteOffUrl" alt="" />
                </button>
              </article>
            </div>
          </section>

          <van-list
            v-model:loading="isLoadingMore"
            class="publisher-posts"
            :finished="!hasMorePosts"
            :finished-text="posts.length ? '没有更多了' : ''"
            :immediate-check="false"
            :offset="30"
            @load="loadNextPage"
          >
            <template #loading>
              <div class="publisher-load-more__loading">
                <span class="publisher-pull-refresh__spinning" aria-hidden="true">
                  <i class="publisher-pull-refresh__loader"></i>
                </span>
                <span>加载下一页...</span>
              </div>
            </template>

            <plazza-post-list
              :posts="posts"
              :show-follow-action="false"
              empty-text="作者还没发布"
              @toggle-like="togglePostAction($event, 'like')"
              @toggle-favorite="togglePostAction($event, 'favorite')"
              @share="sharePublisher"
            />
          </van-list>
        </template>
      </van-pull-refresh>
    </section>
  </main>
</template>

<style scoped lang="less">
.publisher-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.publisher-page__content {
  flex: 1;
  min-height: 0;
  padding: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  scrollbar-color: var(--skin__border) transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: var(--skin__border);
  }
}

.publisher-pull-refresh {
  min-height: 100%;
  overflow: hidden;
}

:deep(.publisher-pull-refresh .van-pull-refresh__track) {
  position: relative;
  height: 100%;
  min-height: 100%;
  transition-property: transform;
}

:deep(.publisher-pull-refresh .van-pull-refresh__head) {
  height: 32px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 32px;
  text-align: center;
}

:deep(.publisher-pull-refresh__loading) {
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

.publisher-pull-refresh__spinning {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 12px;
  min-height: 12px;
}

.publisher-pull-refresh__loader {
  display: block;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: publisher-pull-refresh-rotate 0.7s linear infinite;
}

.publisher-pull-refresh__loading-text {
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
}

.publisher-load-more__loading {
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

@keyframes publisher-pull-refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}

.publisher-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 7px;
  color: var(--skin__neutral_2);
  background: var(--skin__bg_2);

  > .svg-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    color: var(--skin__lead);
    font-family: inherit;
    font-size: 12px;
    background: transparent;
    outline: none;
  }

  button {
    flex-shrink: 0;
    padding: 0;
    border: 0;
    color: var(--skin__primary);
    font-family: inherit;
    font-size: 12px;
    background: transparent;
    cursor: pointer;
  }
}

.publisher-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.publisher-profile {
  position: sticky;
  top: 0;
  z-index: 9;
  width: 100%;
  padding: 10px;
  border-radius: 7px;
  box-sizing: border-box;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px var(--skin__bg-shadow__custom);
  transform: translateY(-1px);
}

.publisher-profile__header {
  display: flex;
  align-items: center;
  width: 100%;
}

.publisher-profile__avatar-wrap {
  position: relative;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  margin-right: 5px;
}

.publisher-profile__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50% !important;
  background: var(--skin__primary);
}

.publisher-profile__follow-mark {
  position: absolute;
  bottom: -4px;
  left: calc(50% - 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  padding: 3px;
  border-radius: 50%;
  color: var(--skin__text_primary);
  background: var(--skin__primary);

  .svg-icon {
    width: 10px;
    height: 10px;
  }
}

.publisher-profile__identity {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  strong {
    max-width: 137.5px;
    overflow: hidden;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    display: flex;
    align-items: center;
    margin: 2px 0 0;
    font-size: 10px;
    line-height: 14px;
  }

  b {
    color: var(--skin__lead);
    font-weight: 700;
  }

  span {
    margin-left: 3px;
    color: var(--skin__neutral_2);
  }
}

.publisher-profile__name {
  display: flex;
  align-items: center;
  min-width: 0;
}

.publisher-profile__admin-badge {
  flex-shrink: 0;
  width: 18px;
  height: 16.5px;
  margin-right: 5px;
  object-fit: contain;
}

.publisher-profile__follow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 25px;
  margin-left: auto;
  padding: 0 5px;
  border: var(--lobby__px, 0.5px) solid var(--skin__primary);
  border-radius: 5px;
  color: var(--skin__text_primary);
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  background: var(--skin__primary);
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;

  &--active {
    color: var(--skin__primary);
    background: transparent;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }
}

.publisher-profile__bio {
  margin: 10px 0 0;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 17px;
  word-break: break-word;
}

.publisher-profile__overview {
  display: flex;
  align-items: flex-end;
  margin-top: 10px;
}

.publisher-profile__statistics {
  display: flex;
  margin: 0;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 5px;

    &:not(:first-child) {
      margin-left: 30px;
    }
  }

  dt {
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
  }

  dd {
    margin: 2px 0 0;
    color: var(--skin__neutral_2);
    font-size: 10px;
    line-height: 14px;
  }
}

.publisher-profile__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
  color: var(--skin__primary);

  button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    color: inherit;
    font-family: inherit;
    font-size: 12px;
    background: transparent;
    cursor: pointer;
    transition: transform 120ms ease, opacity 120ms ease;

    &:not(:disabled):active {
      transform: scale(0.9);
      opacity: 0.65;
    }

    &:disabled {
      cursor: wait;
      opacity: 0.55;
    }
  }

  .svg-icon {
    width: 14px;
    height: 14px;
  }
}

.publisher-recent-games {
  width: 100%;
  margin-bottom: 10px;
  border-radius: 7px;
}

.publisher-recent-games__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px 0 0;

  h2 {
    margin: 0;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
}

.publisher-recent-games__list {
  display: flex;
  width: 100%;
  height: 106.5px;
  column-gap: 11.5px;
  overflow: hidden;
}

.publisher-recent-games__card {
  position: relative;
  flex: 0 0 80px;
  width: 80px;
  height: 106.4px;
  overflow: hidden;
  border-radius: 10px;
  color: white;
}

.publisher-recent-games__launch {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: inherit;
  color: inherit;
  font-family: inherit;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;

  &:not(:disabled):active {
    transform: scale(0.85);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }
}

.publisher-recent-games__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.publisher-recent-games__name {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 26px;
  padding: 0 3px 3px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, transparent, rgb(0 0 0 / 72%));
  text-align: center;
  text-shadow: 0 1px 2px rgb(0 0 0 / 30%);

  strong {
    display: -webkit-box;
    width: 100%;
    overflow: hidden;
    font-size: 9px;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.publisher-recent-games__recommend {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 25.5px;
  height: 20.7px;
  object-fit: fill;
}

.publisher-recent-games__favorite {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  padding: 3px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;

  &:not(:disabled):active {
    transform: scale(0.82);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  img {
    display: block;
    width: 17px;
    height: 17px;
    border-radius: 50%;
  }
}

.publisher-posts {
  margin-top: 10px;
}

:global([dir="rtl"]) .publisher-profile__avatar-wrap {
  margin-right: 0;
  margin-left: 5px;
}

:global([dir="rtl"]) .publisher-profile__follow-mark {
  right: calc(50% - 8px);
  left: auto;
}

:global([dir="rtl"]) .publisher-profile__identity span {
  margin-right: 3px;
  margin-left: 0;
}

:global([dir="rtl"]) .publisher-profile__admin-badge {
  margin-right: 0;
  margin-left: 5px;
}

:global([dir="rtl"]) .publisher-profile__follow,
:global([dir="rtl"]) .publisher-profile__actions {
  margin-right: auto;
  margin-left: 0;
}

:global([dir="rtl"]) .publisher-profile__statistics > div:not(:first-child) {
  margin-right: 30px;
  margin-left: 0;
}

:global([dir="rtl"]) .publisher-recent-games__recommend {
  right: 0;
  left: auto;
}

:global([dir="rtl"]) .publisher-recent-games__favorite {
  right: auto;
  left: 0;
}
</style>
