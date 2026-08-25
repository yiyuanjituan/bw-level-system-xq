<script setup lang="ts">
import adminBadgeUrl from "@/assets/home/moments/cert_3.png";
import type { MomentsFollowRecommendation } from "@/api/common";
import PlazzaLazyImage from "./PlazzaLazyImage.vue";

withDefaults(defineProps<{
  users: MomentsFollowRecommendation[];
  selectedIds?: number[];
  submitting?: boolean;
}>(), {
  selectedIds: () => [],
  submitting: false
});

defineEmits<{
  (event: "toggle", userId: number): void;
  (event: "skip"): void;
  (event: "submit"): void;
}>();

const defaultAvatarUrl = "/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif";

function formatFollowers(count: number) {
  const followerCount = Math.max(0, Number(count) || 0);
  if (followerCount >= 10000) {
    return `${Number((followerCount / 10000).toFixed(2))}万`;
  }
  return String(followerCount);
}
</script>

<template>
  <section class="follow-recommendations">
    <p class="follow-recommendations__tip">你还没有关注任何人，推荐关注以下用户</p>

    <div class="follow-recommendations__list">
      <button
        v-for="user in users"
        :key="user.id"
        type="button"
        class="follow-recommendations__user"
        :aria-pressed="selectedIds.includes(user.id)"
        :disabled="submitting"
        @click="$emit('toggle', user.id)"
      >
        <plazza-lazy-image
          class="follow-recommendations__avatar"
          :src="user.avatarUrl"
          :fallback-src="defaultAvatarUrl"
          :alt="`${user.name}的头像`"
          error-text=""
        />

        <div class="follow-recommendations__info">
          <p class="follow-recommendations__name">
            <img v-if="user.isAdmin" :src="adminBadgeUrl" :alt="$t('朋友圈管理员')" />
            <span>{{ user.name }}</span>
          </p>
          <p class="follow-recommendations__fans">
            <strong>{{ formatFollowers(user.followers) }}</strong>
            <span>位粉丝</span>
          </p>
        </div>

        <span
          class="follow-recommendations__checkbox"
          :class="{ 'follow-recommendations__checkbox--checked': selectedIds.includes(user.id) }"
          aria-hidden="true"
        >
          <svg-icon v-if="selectedIds.includes(user.id)" name="comm_icon_gou" />
        </span>
      </button>
    </div>

    <footer class="follow-recommendations__actions">
      <button type="button" :disabled="submitting" @click="$emit('skip')">跳过</button>
      <button
        type="button"
        class="follow-recommendations__submit"
        :disabled="submitting || !selectedIds.length"
        :aria-busy="submitting"
        @click="$emit('submit')"
      >
        {{ submitting ? "关注中..." : `关注 (${selectedIds.length})` }}
      </button>
    </footer>
  </section>
</template>

<style scoped lang="less">
.follow-recommendations {
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  color: var(--skin__lead);
}

.follow-recommendations__tip {
  margin: 0 0 10px;
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 1.38;
  text-align: center;
}

.follow-recommendations__list {
  display: grid;
  grid-template-columns: repeat(2, 172.5px);
  justify-content: space-between;
  gap: 10px;
}

.follow-recommendations__user {
  display: flex;
  align-items: center;
  width: 172.5px;
  height: 64px;
  box-sizing: border-box;
  padding: 10px;
  border: 0;
  border-radius: 7px;
  color: inherit;
  font-family: inherit;
  text-align: left;
  background: var(--skin__bg_2);
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
}

.follow-recommendations__avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin-right: 5px;
  border-radius: 50% !important;
  background: var(--skin__primary);
}

.follow-recommendations__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  margin-right: 5px;
}

.follow-recommendations__name,
.follow-recommendations__fans {
  display: flex;
  align-items: center;
  margin: 0;
}

.follow-recommendations__name {
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 13.5px;

  img {
    flex-shrink: 0;
    width: 14px;
    height: 13px;
    margin-right: 3px;
    object-fit: contain;
  }

  span {
    display: -webkit-box;
    max-height: 27px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.follow-recommendations__fans {
  margin-top: 0;
  color: var(--skin__neutral_2);
  font-size: 10px;
  line-height: 1.6;

  strong {
    color: var(--skin__lead);
    font-weight: 600;
  }

  span {
    margin-left: 3px;
    color: var(--skin__neutral_2);
  }
}

.follow-recommendations__checkbox {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 3px;
  color: var(--skin__text_primary);

  &--checked {
    border: 0;
    background: var(--skin__primary);
  }

  .svg-icon {
    width: 10px;
    height: 7.5px;
  }
}

.follow-recommendations__actions {
  display: grid;
  grid-template-columns: repeat(2, 172.5px);
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;

  button {
    width: 172.5px;
    height: 35px;
    padding: 0;
    border: var(--lobby__px, 0.5px) solid var(--skin__primary);
    border-radius: 7px;
    color: var(--skin__primary);
    font-family: inherit;
    font-size: 12px;
    background: transparent;
    cursor: pointer;
    transition: opacity 120ms ease, transform 120ms ease;

    &:not(:disabled):active {
      opacity: 0.7;
      transform: scale(0.97);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  .follow-recommendations__submit {
    color: var(--skin__text_primary);
    background: var(--skin__primary);

    &:disabled {
      border-color: var(--skin__neutral_2);
      color: var(--skin__text_primary);
      background: var(--skin__neutral_2);
      opacity: 1;
    }
  }
}

:global([dir="rtl"]) .follow-recommendations__avatar {
  margin-right: 0;
  margin-left: 5px;
}

:global([dir="rtl"]) .follow-recommendations__info {
  margin-right: 0;
  margin-left: 5px;
}
</style>
