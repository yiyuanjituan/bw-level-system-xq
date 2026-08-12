<script setup lang="ts">
import PlazzaPostCard from "../components/PlazzaPostCard.vue";
import type { PlazzaPost } from "../types";

defineProps<{
  posts: PlazzaPost[];
  emptyText: string;
}>();

defineEmits<{
  (event: "toggle-follow", authorName: string): void;
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
