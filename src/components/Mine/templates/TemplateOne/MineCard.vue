<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import * as _ from 'lodash-es';
import Copy from '@/components/Common/Copy.vue';
import MineShowInfo from '@/components/Mine/MineShowInfo.vue';
import router from '@/router';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';

defineOptions({ name: 'MineCard' });

const auth = useAuthStore();
const app = useAppStore();
const isShowInfo = ref(false);
const avatarLoadFailed = ref(false);
const defaultAvatarUrl = '/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif';

const currencyInfo = computed(() => {
  return app.appInfo?.countryList?.find(currency => currency.id == auth.user?.currencyId);
});
const avatarUrl = computed(() => {
  return auth.user?.avatarUrl && !avatarLoadFailed.value ? auth.user.avatarUrl : defaultAvatarUrl;
});
const displayName = computed(() => {
  if (auth.user?.showAccount === 0) return String(auth.user?.unionid || '');
  if (auth.user?.showAccount === 2 && auth.user?.phone) {
    const prefix = currencyInfo.value?.numberPrefix ? `+${currencyInfo.value.numberPrefix} ` : '';
    return `${prefix}***${_.join(_.takeRight(auth.user.phone, 3), '')}`;
  }
  return String(auth.user?.account || auth.user?.unionid || '');
});
const displayNameCanCopy = computed(() => auth.user?.showAccount !== 2 && Boolean(displayName.value));

watch(
  () => auth.user?.avatarUrl,
  () => {
    // 用户更换头像后重新尝试加载接口返回的新地址。
    avatarLoadFailed.value = false;
  }
);

function toggleAccountInfo() {
  isShowInfo.value = !isShowInfo.value;
}

function jumpToProfile() {
  void router.push('/home/setting');
}
</script>

<template>
  <div class="mine-user-card">
    <div class="mine-user-card__avatar">
      <van-image round width="100%" height="100%" :src="avatarUrl" @error="avatarLoadFailed = true" />
      <button class="mine-user-card__edit" type="button" :aria-label="$t('个人资料')" @click="jumpToProfile">
        <svg-icon name="icon_grzl" />
      </button>
    </div>

    <div class="mine-user-card__info">
      <div class="mine-user-card__name-row">
        <button class="mine-user-card__account-toggle" type="button" :aria-expanded="isShowInfo" @click="toggleAccountInfo">
          <svg-icon name="arrow-down" :class="{ 'mine-user-card__sort--open': isShowInfo }" />
        </button>
        <MineShowInfo v-if="isShowInfo" @close="isShowInfo = false" />
        <span class="mine-user-card__name" dir="auto">{{ displayName }}</span>
        <Copy v-if="displayNameCanCopy" :text="displayName" class="mine-user-card__copy" class-name="mine-user-card__copy-icon" />
      </div>

      <div class="mine-user-card__id-row" dir="ltr">
        <span class="mine-user-card__id-label">ID:</span>
        <span class="mine-user-card__id">{{ auth.user?.unionid }}</span>
        <Copy
          :text="String(auth.user?.unionid || '')"
          class="mine-user-card__copy"
          class-name="mine-user-card__copy-icon mine-user-card__copy-icon--id"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-user-card {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.mine-user-card__avatar {
  width: 49px;
  height: 49px;
  margin-right: 8px;
  flex: none;
  position: relative;
  border-radius: 50%;
}

.mine-user-card__edit {
  width: 20px;
  height: 20px;
  padding: 0;
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  font-size: 18px;
  cursor: pointer;
}

.mine-user-card__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mine-user-card__name-row,
.mine-user-card__id-row {
  display: flex;
  align-items: center;
  position: relative;
}

.mine-user-card__name-row {
  height: 16px;
  margin-bottom: 5px;
  font-size: 12px;
}

.mine-user-card__account-toggle {
  width: 12px;
  height: 14px;
  margin: 0 2px 0 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
  font-size: 8px;
  cursor: pointer;
}

.mine-user-card__account-toggle .svg-icon {
  transition: transform 0.2s ease;
}

.mine-user-card__sort--open {
  transform: rotate(180deg);
}

.mine-user-card__name {
  max-width: min(250px, calc(100vw - 125px));
  overflow: hidden;
  color: var(--skin__lead);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-user-card__copy {
  width: 18px;
  height: 18px;
  margin-left: 2px;
  flex: none;
}

.mine-user-card__copy :deep(.mine-user-card__copy-icon) {
  color: var(--skin__primary);
  font-size: 15px;
}

.mine-user-card__id-row {
  height: 18px;
  color: var(--skin__lead);
  font-size: 16px;
  line-height: 18px;
}

.mine-user-card__id-label {
  margin-right: 3px;
  color: var(--skin__neutral_1);
}

.mine-user-card__id {
  max-width: min(240px, calc(100vw - 140px));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-user-card__copy :deep(.mine-user-card__copy-icon--id) {
  font-size: 15px;
}

:global([dir='rtl']) .mine-user-card__avatar {
  margin-right: 0;
  margin-left: 8px;
}

:global([dir='rtl']) .mine-user-card__account-toggle {
  margin-right: 0;
  margin-left: 2px;
}

:global([dir='rtl']) .mine-user-card__copy {
  margin-right: 2px;
  margin-left: 0;
}
</style>
