<script setup lang="ts">
import PlazzaPostCard from "../components/PlazzaPostCard.vue";
import type { PlazzaPost } from "../types";
import UiEmpty from '@/components/UI/empty.vue';
import UiLoading from '@/components/UI/loading.vue';

withDefaults(defineProps<{
  posts: PlazzaPost[];
  emptyText: string;
  showFollowAction?: boolean;
  pendingFollowIds?: number[];
  pendingPostActionKeys?: string[];
  isSharing?: boolean;
  loading?: boolean;
  errorText?: string;
}>(), {
  showFollowAction: true,
  pendingFollowIds: () => [],
  pendingPostActionKeys: () => [],
  isSharing: false,
  loading: false,
  errorText: ''
});

defineEmits<{
  (event: "toggle-follow", authorId: number): void;
  (event: "toggle-like", postId: number): void;
  (event: "toggle-favorite", postId: number): void;
  (event: "share", post: PlazzaPost): void;
  (event: "retry"): void;
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
  <div v-else-if="loading" class="post-list-state" :aria-label="$t('帖子加载中')">
    <ui-loading />
  </div>
  <div v-else-if="errorText" class="post-list-state post-list-state--error">
    <p>{{ errorText }}</p>
    <button type="button" @click="$emit('retry')">{{ $t("重新加载") }}</button>
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

.post-list-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 190px;
}

.post-list-state--error {
  flex-direction: column;
  gap: 10px;
  color: var(--skin__neutral_2);
  font-size: 12px;

  p {
    margin: 0;
  }

  button {
    min-width: 76px;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 5px;
    color: var(--skin__text_primary);
    font-family: inherit;
    font-size: 11px;
    background: var(--skin__primary);
    cursor: pointer;
  }
}
</style>
