<script setup lang="ts">
import PlazzaProfileCard from "../components/PlazzaProfileCard.vue";
import PlazzaRecentGames from "../components/PlazzaRecentGames.vue";
import type { PlazzaPost, PlazzaProfile, PlazzaRecentGame } from "../types";

defineProps<{
  profile: PlazzaProfile;
  recentGames: PlazzaRecentGame[];
  posts: PlazzaPost[];
  emptyText: string;
  pendingGameFavoriteIds?: string[];
  pendingPostActionKeys?: string[];
  isSharing?: boolean;
  postLoading?: boolean;
  postErrorText?: string;
}>();

defineEmits<{
  (event: "edit-profile"): void;
  (event: "publish"): void;
  (event: "search"): void;
  (event: "share"): void;
  (event: "select-game", game: PlazzaRecentGame): void;
  (event: "toggle-game-favorite", game: PlazzaRecentGame): void;
  (event: "toggle-like", postId: number): void;
  (event: "toggle-post-favorite", postId: number): void;
  (event: "share-post", post: PlazzaPost): void;
  (event: "retry-posts"): void;
}>();
</script>

<template>
  <div class="my-profile">
    <plazza-profile-card
      :profile="profile"
      :posts="posts"
      :empty-text="emptyText"
      :pending-post-action-keys="pendingPostActionKeys"
      :is-sharing="isSharing"
      :post-loading="postLoading"
      :post-error-text="postErrorText"
      @edit-profile="$emit('edit-profile')"
      @publish="$emit('publish')"
      @search="$emit('search')"
      @share="$emit('share')"
      @toggle-like="$emit('toggle-like', $event)"
      @toggle-favorite="$emit('toggle-post-favorite', $event)"
      @share-post="$emit('share-post', $event)"
      @retry-posts="$emit('retry-posts')"
    >
      <template #before-posts>
        <plazza-recent-games
          :games="recentGames"
          :pending-favorite-ids="pendingGameFavoriteIds"
          @select-game="$emit('select-game', $event)"
          @toggle-favorite="$emit('toggle-game-favorite', $event)"
        />
      </template>
    </plazza-profile-card>
  </div>
</template>

<style scoped lang="less">
.my-profile {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
