<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import adminBadgeUrl from "@/assets/home/moments/cert_3.png";
import PlazzaLazyImage from "./PlazzaLazyImage.vue";
import type { PlazzaPost } from "../types";

const props = withDefaults(defineProps<{
  post: PlazzaPost;
  showFollowAction?: boolean;
  followPending?: boolean;
  likePending?: boolean;
  favoritePending?: boolean;
  sharePending?: boolean;
}>(), {
  showFollowAction: true,
  followPending: false,
  likePending: false,
  favoritePending: false,
  sharePending: false
});

const emit = defineEmits<{
  (event: "toggle-follow", authorId: number): void;
  (event: "toggle-like", postId: number): void;
  (event: "toggle-favorite", postId: number): void;
  (event: "share", post: PlazzaPost): void;
}>();

const defaultAvatarUrl = "/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif";
const router = useRouter();
const canShowFollowAction = computed(() => props.showFollowAction && !props.post.author.isSelf);
const canShowFollowMark = computed(() => canShowFollowAction.value && !props.post.author.following);

function openPublisher() {
  if (!props.post.author.id) return;
  void router.push(`/home/plazza/publisher/${props.post.author.id}`);
}
</script>

<template>
  <article class="post-card">
    <header class="post-card__author">
      <button type="button" class="post-card__avatar-wrap" @click="openPublisher">
        <plazza-lazy-image
          class="post-card__avatar"
          :src="post.author.avatarUrl"
          :fallback-src="defaultAvatarUrl"
          :alt="`${post.author.name}的头像`"
          error-text=""
        />
        <span v-if="canShowFollowMark" class="post-card__follow-mark" aria-hidden="true">
          <svg-icon name="icon_message_fx_gz" class-name="post-card__follow-icon" />
        </span>
      </button>

      <div class="post-card__author-info">
        <button type="button" class="post-card__author-name" @click="openPublisher">
          <img
            v-if="post.author.isAdmin"
            class="post-card__admin-badge"
            :src="adminBadgeUrl"
            :alt="$t('朋友圈管理员')"
          />
          <span>{{ post.author.name }}</span>
        </button>
        <p>
          <b>{{ post.author.followers }}</b>
          <span>位粉丝</span>
        </p>
      </div>

      <button
        v-if="canShowFollowAction"
        type="button"
        class="post-card__follow-button"
        :class="{ 'post-card__follow-button--active': post.author.following }"
        :disabled="followPending"
        :aria-busy="followPending"
        @click="emit('toggle-follow', post.author.id)"
      >
        {{ followPending ? "处理中..." : post.author.following ? "已关注" : "+关注" }}
      </button>
    </header>

    <div class="post-card__content">
      <p class="post-card__text">{{ post.content }}</p>

      <div
        v-if="post.imageUrls.length"
        class="post-card__images"
        :class="{
          'post-card__images--single': post.imageUrls.length === 1,
          'post-card__images--double-or-four': post.imageUrls.length === 2 || post.imageUrls.length === 4,
          'post-card__images--multiple': post.imageUrls.length === 3 || post.imageUrls.length > 4
        }"
      >
        <template v-for="(imageUrl, imageIndex) in post.imageUrls" :key="imageUrl">
          <plazza-lazy-image
            class="post-card__image"
            :src="imageUrl"
            :alt="`帖子图片${imageIndex + 1}`"
          />
        </template>
      </div>

      <time class="post-card__time">{{ post.createdAt }}</time>
    </div>

    <footer class="post-card__actions">
      <button
        type="button"
        :class="{ 'post-card__action--liked': post.liked }"
        :aria-label="post.liked ? '取消点赞' : '点赞'"
        :aria-busy="likePending"
        :disabled="likePending"
        @click="emit('toggle-like', post.id)"
      >
        <svg-icon name="moments-like" class-name="post-card__action-icon" />
        <span>{{ post.likes }}</span>
      </button>

      <button
        type="button"
        :class="{ 'post-card__action--favorited': post.favorited }"
        :aria-label="post.favorited ? '取消收藏' : '收藏'"
        :aria-busy="favoritePending"
        :disabled="favoritePending"
        @click="emit('toggle-favorite', post.id)"
      >
        <svg-icon name="moments-favorite" class-name="post-card__action-icon" />
        <span>{{ post.favorites }}</span>
      </button>

      <button
        type="button"
        class="post-card__action--share"
        :disabled="sharePending"
        :aria-busy="sharePending"
        @click="emit('share', post)"
      >
        <svg-icon name="promote-share" class-name="post-card__share-icon" />
        <span>{{ $t("分享") }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped lang="less">
.post-card {
  width: 100%;
  min-height: 50px;
  box-sizing: border-box;
  padding: 10px;
  color: var(--skin__neutral_1);
  background: var(--skin__bg_2);

  &:not(:last-child) {
    border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
  }
}

.post-card__author {
  display: flex;
  align-items: center;
  width: 100%;
}

.post-card__avatar-wrap {
  position: relative;
  display: block;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin-right: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.post-card__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50% !important;
  background: var(--skin__primary);
}

.post-card__follow-mark {
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
  border: 0;
  border-radius: 50%;
  color: var(--skin__text_primary);
  font-size: 10px;
  line-height: 1;
  background: var(--skin__primary);
}

.post-card__follow-icon {
  width: 10px;
  height: 10px;
}

.post-card__author-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  > strong,
  .post-card__author-name {
    width: 137.5px;
    overflow: hidden;
    color: var(--skin__lead);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-card__author-name {
    display: flex;
    align-items: center;
    padding: 0;
    border: 0;
    font-family: inherit;
    text-align: left;
    background: transparent;
    cursor: pointer;

    > span {
      min-width: 0;
      overflow: hidden;
      color: var(--skin__lead);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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

  p span {
    margin-left: 3px;
    color: var(--skin__neutral_3);
  }
}

.post-card__admin-badge {
  flex-shrink: 0;
  width: 18px;
  height: 16.5px;
  margin-right: 5px;
  object-fit: contain;
}

:global([dir="rtl"]) .post-card__admin-badge {
  margin-right: 0;
  margin-left: 5px;
}

.post-card__follow-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 25px;
  box-sizing: border-box;
  margin-left: auto;
  padding: 0 5px;
  border: var(--lobby__px, 0.5px) solid var(--skin__primary);
  border-radius: 5px;
  color: var(--skin__text_primary);
  font-family: inherit;
  font-size: 11px;
  background: var(--skin__primary);
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;

  &--active {
    border: var(--lobby__px, 0.5px) solid var(--skin__primary);
    color: var(--skin__primary);
    background: transparent;
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
}

.post-card__content {
  margin-top: 10px;
}

.post-card__text {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 1.67;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.post-card__images {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 10px;

  .post-card__image {
    width: 100%;
    background: var(--skin__bg_1);
  }

  &--single {
    display: block;

    .post-card__image {
      display: block;
      width: 100%;
      height: 199.5px;
    }
  }

  &--double-or-four {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;

    .post-card__image {
      height: 102px;
    }
  }

  &--multiple {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;

    .post-card__image {
      height: 67px;
    }
  }
}

.post-card__time {
  display: block;
  margin-top: 5px;
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 15px;
}

.post-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 10px;

  button {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 28px;
    padding: 0;
    border: 0;
    color: var(--skin__neutral_3);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.33;
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

  button > span {
    color: var(--skin__neutral_1);
  }

  svg {
    width: 14px;
    height: 14px;
    overflow: visible;
    fill: transparent;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.6;
  }

  .post-card__action--liked {
    color: var(--skin__accent_2);

    svg {
      fill: currentColor;
    }
  }

  .post-card__action--favorited {
    color: var(--skin__accent_3);

    svg {
      fill: currentColor;
      stroke: currentColor;
    }
  }

  .post-card__action--share {
    color: var(--skin__primary);

    span {
      color: var(--skin__primary);
    }

    svg {
      fill: currentColor;
      stroke: none;
    }
  }
}
</style>
