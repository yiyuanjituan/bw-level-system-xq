<script setup lang="ts">
import PlazzaPostCard from "../components/PlazzaPostCard.vue";
import type { PlazzaPost } from "../types";

withDefaults(defineProps<{
  posts: PlazzaPost[];
  emptyText: string;
  showFollowAction?: boolean;
  pendingFollowIds?: number[];
  pendingPostActionKeys?: string[];
  isSharing?: boolean;
}>(), {
  showFollowAction: true,
  pendingFollowIds: () => [],
  pendingPostActionKeys: () => [],
  isSharing: false
});

defineEmits<{
  (event: "toggle-follow", authorId: number): void;
  (event: "toggle-like", postId: number): void;
  (event: "toggle-favorite", postId: number): void;
  (event: "share", post: PlazzaPost): void;
}>();
</script>

<template>
  <div v-if="posts.length" class="post-list">
    <plazza-post-card
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :show-follow-action="showFollowAction"
      :follow-pending="pendingFollowIds.includes(post.author.id)"
      :like-pending="pendingPostActionKeys.includes(`like:${post.id}`)"
      :favorite-pending="pendingPostActionKeys.includes(`favorite:${post.id}`)"
      :share-pending="isSharing"
      @toggle-follow="$emit('toggle-follow', $event)"
      @toggle-like="$emit('toggle-like', $event)"
      @toggle-favorite="$emit('toggle-favorite', $event)"
      @share="$emit('share', $event)"
    />
  </div>
  <ui-empty v-else :text="emptyText" />
</template>

<style scoped lang="less">
.post-list {
  width: 100%;
  overflow: hidden;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px var(--skin__bg-shadow__custom);
}
</style>
