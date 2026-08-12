<script setup lang="ts">
import PlazzaLazyImage from "./PlazzaLazyImage.vue";
import type { PlazzaProfile } from "../types";

defineProps<{
  profile: PlazzaProfile;
}>();

defineEmits<{
  (event: "edit-profile"): void;
  (event: "publish"): void;
  (event: "search"): void;
  (event: "share"): void;
}>();

const defaultAvatarUrl = "/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif";

function formatAmount(amount: number) {
  return Number(amount || 0).toFixed(2);
}
</script>

<template>
  <article class="profile-card">
    <header class="profile-card__header">
      <plazza-lazy-image
        class="profile-card__avatar"
        :src="profile.avatarUrl"
        :fallback-src="defaultAvatarUrl"
        alt="用户头像"
        error-text=""
      />

      <div class="profile-card__identity">
        <button type="button" class="profile-card__name" @click="$emit('edit-profile')">
          <span>{{ profile.nickname }}</span>
          <svg-icon name="login_icon_bj" class-name="profile-card__edit-icon" />
        </button>
        <p class="profile-card__followers">
          <strong>{{ profile.followers }}</strong>
          <span>位粉丝</span>
        </p>
      </div>

      <button type="button" class="profile-card__publish" @click="$emit('publish')">
        +发布
      </button>
    </header>

    <p class="profile-card__bio">
      {{ profile.bio }}
    </p>

    <div class="profile-card__overview">
      <dl class="profile-card__statistics">
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

      <div class="profile-card__actions">
        <button type="button" aria-label="搜索我的文章" @click="$emit('search')">
          <svg-icon name="comm_icon_ss" />
        </button>
        <button type="button" class="profile-card__share" @click="$emit('share')">
          <svg-icon name="promote-share" />
          <span>分享</span>
        </button>
      </div>
    </div>

    <div class="profile-card__rewards">
      <p>
        <svg-icon name="promote-gift" class-name="profile-card__gift" />
        <span>今日打赏收入</span>
        <strong>{{ formatAmount(profile.rewards.today) }}</strong>
      </p>
      <p>
        <span>总打赏收入</span>
        <strong>{{ formatAmount(profile.rewards.total) }}</strong>
      </p>
    </div>
  </article>
</template>

<style scoped lang="less">
.profile-card {
  position: sticky;
  z-index: 1;
  top: 0;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 7px;
  color: var(--skin__lead);
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px var(--skin__bg-shadow__custom);
}

.profile-card__header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.profile-card__avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  margin-right: 5px;
  border-radius: 50% !important;
  background: var(--skin__primary);
}

.profile-card__identity {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.profile-card__name {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 170px;
  padding: 0;
  border: 0;
  color: var(--skin__lead);
  font-family: inherit;
  font-size: 12px;
  line-height: 16px;
  background: transparent;
  cursor: pointer;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.profile-card__edit-icon {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
  margin-left: 4px;
  color: var(--skin__primary);
}

.profile-card__followers {
  display: flex;
  align-items: center;
  margin: 2px 0 0;
  font-size: 10px;

  strong {
    color: var(--skin__lead);
    font-weight: 700;
  }

  span {
    margin-left: 3px;
    color: var(--skin__neutral_2);
  }
}

.profile-card__publish {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 25px;
  margin-left: auto;
  padding: 0 5px;
  border: 0;
  border-radius: 5px;
  color: var(--skin__text_primary);
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  background: var(--skin__primary);
  cursor: pointer;
}

.profile-card__bio {
  display: block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 17px;
  text-align: left;
  word-break: break-word;
}

.profile-card__overview {
  display: flex;
  align-items: flex-end;
  margin-top: 10px;
}

.profile-card__statistics {
  display: flex;
  margin: 0;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 38px;

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

.profile-card__actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  color: var(--skin__primary);

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    background: transparent;
    cursor: pointer;
  }

  .profile-card__share {
    gap: 5px;
    margin-left: 20px;

    span {
      max-width: 58px;
      overflow: hidden;
      font-size: 12px;
      line-height: 16px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.profile-card__rewards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
  padding-top: 10px;
  border-top: var(--lobby__px, 0.5px) solid var(--skin__border);

  p {
    display: flex;
    align-items: center;
    min-width: 0;
    margin: 0;
  }

  span {
    overflow: hidden;
    color: var(--skin__neutral_2);
    font-size: 11px;
    line-height: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    margin-left: 5px;
    color: var(--skin__accent_3);
    font-size: 11px;
    font-weight: 400;
    line-height: 15px;
  }
}

.profile-card__gift {
  flex-shrink: 0;
  width: 17px;
  height: 18px;
  margin-right: 4px;
  color: var(--skin__accent_3);
}
</style>
