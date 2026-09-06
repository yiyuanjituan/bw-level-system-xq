<script setup lang="ts">
import { computed, ref } from 'vue';
import router from '@/router';
import { $t } from '@/locales';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import ULanguageDialog from '@/components/Home/ULanguageDialog.vue';
import UMorePopover from '@/components/Home/UMorePopover.vue';
import AccountDisplaySelector from '@/components/Common/AccountDisplaySelector.vue';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';
import { bus } from '@/utils/mitt';
import { openLoginEntry } from '@/utils/login';
import kfIcon from '@/assets/home/basic/icon_dt_1kf.avif';
import appIcon from '@/assets/home/basic/icon_dt_1app.avif';
import languageIcon from '@/assets/home/basic/icon_dt_1yuyuan.avif';
import moreIcon from '@/assets/home/basic/icon_dt_1gd.avif';

defineOptions({
  name: 'BasicNavContainer'
});

const emit = defineEmits<{ 'select-hot': [mode: 'last' | 'collect'] }>();
const app = useAppStore();
const auth = useAuthStore();
const languageDialogVisible = ref(false);
const walletIsLoading = ref(false);

const currencyInfo = computed(() => {
  const currencyList = Array.isArray(app.appInfo?.countryList) ? app.appInfo.countryList : [];
  return currencyList.find(currency => currency.id == auth.user?.currencyId);
});

const quickLinks = computed(() => [
  { key: 'service', title: $t('客服'), icon: kfIcon },
  { key: 'app-download', title: $t('APP下载'), icon: appIcon },
  { key: 'language', title: $t('语言'), icon: languageIcon }
]);

function openQuickLink(key: string) {
  if (key === 'service') {
    bus.emit('findUs');
    return;
  }
  if (key === 'app-download') {
    bus.emit('showDownloadTip');
    return;
  }
  if (key === 'language') {
    languageDialogVisible.value = true;
  }
}

function openMoreLink(key: string) {
  if (key === 'recent' || key === 'favorite') {
    emit('select-hot', key === 'recent' ? 'last' : 'collect');
    return;
  }
  if (key === 'deposit') return bus.emit('showRecharge');
  if (key === 'withdraw') return bus.emit('switchTab', '/home/withdraw');
  if (key === 'app-download') return bus.emit('showDownloadTip');
  if (key === 'language') {
    languageDialogVisible.value = true;
    return;
  }
  if (key === 'find-us') return bus.emit('findUs');
  if (key === 'service') return bus.emit('findUs');

  const routeMap: Record<string, string> = {
    event: '/home/event',
    task: '/home/task',
    yuebao: '/home/yuebao',
    cashback: '/home/cashback',
    feedback: '/home/notice?noticeType=5',
    security: '/home/security',
    profile: '/home/setting',
    'account-detail': '/home/report?reportCurrent=3',
    'bet-record': '/home/report?reportCurrent=2',
    'personal-report': '/home/report?reportCurrent=1',
    claim: '/home/canReceive',
    'withdraw-manage': '/home/withdraw?active=10',
    'bet-task': '/home/task',
    share: '/home/promote',
    'claim-record': '/home/records'
  };

  const targetRoute = routeMap[key];
  if (targetRoute) void router.push(targetRoute);
}

function openLogin() {
  openLoginEntry(1);
}

function openRegister() {
  openLoginEntry(0);
}

async function updateWallet() {
  if (walletIsLoading.value) return;

  walletIsLoading.value = true;
  try {
    await auth.updateInfo();
  } finally {
    walletIsLoading.value = false;
  }
}

function openMine() {
  void router.push('/home/mine');
}
</script>

<template>
  <nav class="basic-nav-container" :aria-label="$t('更多')">
    <!-- 左：未登录显示 登录/注册，已登录显示账号入口 -->
    <div class="basic-nav-container__left">
      <template v-if="!auth.token">
        <div class="basic-nav-container__un-login">
          <div
            class="basic-nav-container__btn basic-nav-container__btn--login"
            role="button"
            tabindex="0"
            @click="openLogin"
            @keydown.enter="openLogin"
          >
            <span id="loginClick" data-sensors-click="true">{{ $t('登 录') }}</span>
          </div>
          <div class="basic-nav-container__register-badge">
            <div
              class="basic-nav-container__btn basic-nav-container__btn--register"
              role="button"
              tabindex="0"
              @click="openRegister"
              @keydown.enter="openRegister"
            >
              <span id="registerClickModal" data-sensors-click="true">{{ $t('注 册') }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="basic-nav-container__logged-in" role="button" tabindex="0" @click="openMine" @keydown.enter="openMine">
          <AccountDisplaySelector
            class="basic-nav-container__account-top"
            :user="auth.user"
            :currency-prefix="currencyInfo?.numberPrefix"
          />
          <button
            type="button"
            class="basic-nav-container__balance"
            :aria-label="$t('刷新余额')"
            @click.stop="updateWallet"
            @keydown.stop
          >
            <span class="basic-nav-container__currency-frame">
              <home-skeleton-image
                v-if="currencyInfo?.icon"
                :src="currencyInfo.icon"
                class="basic-nav-container__currency"
                alt=""
                fit="cover"
              />
            </span>
            <span class="basic-nav-container__balance-value" dir="ltr">
              {{ walletIsLoading ? $t('加载中') : (auth.user?.money ?? '0.00') }}
            </span>
            <svg-icon
              name="comm_icon_sx"
              class-name="basic-nav-container__refresh"
              :class="{ 'basic-nav-container__refresh--loading': walletIsLoading }"
            />
          </button>
        </div>
      </template>
    </div>

    <!-- 右：客服 / APP下载 / 语言 / 更多 -->
    <div class="basic-nav-container__right">
      <div
        v-for="link in quickLinks"
        :key="link.key"
        class="basic-nav-container__item"
        role="button"
        tabindex="0"
        @click="openQuickLink(link.key)"
        @keydown.enter="openQuickLink(link.key)"
      >
        <home-skeleton-image :src="link.icon" alt="." class="basic-nav-container__item-icon" fit="contain" loading="eager" />
        <span class="basic-nav-container__item-title">{{ link.title }}</span>
      </div>

      <UMorePopover class="basic-nav-container__more" @select="openMoreLink">
        <div id="moreClick" class="basic-nav-container__item" role="button" tabindex="0" data-sensors-click="true">
          <home-skeleton-image :src="moreIcon" alt="." class="basic-nav-container__item-icon" fit="contain" loading="eager" />
          <span class="basic-nav-container__item-title">{{ $t('更多') }}</span>
        </div>
      </UMorePopover>
    </div>
  </nav>
  <ULanguageDialog v-model="languageDialogVisible" />
</template>

<style scoped lang="less">
.basic-nav-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  margin-top: 10px;

  &__left {
    display: flex;
    align-items: center;
    width: 145px;
    padding: 0 2.5px;
    min-width: 0;
    flex: none;
  }

  &__un-login {
    display: flex;
    align-items: center;
  }

  &__register-badge {
    position: relative;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 25px;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: 5px;
    border: thin solid var(--skin__primary);
    font-size: 10px;
    white-space: nowrap;
    text-align: center;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;

    span {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--login {
      margin-left: 2.5px;
      margin-right: 10px;
      color: var(--skin__primary);
      background-color: transparent;
    }

    &--register {
      color: var(--skin__text_primary);
      background-color: var(--skin__primary);
      border-color: var(--skin__primary);

      &::after {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        content: '';
        animation: basic-register-pulse 1.5s ease infinite;
        pointer-events: none;
      }
    }
  }

  &__logged-in {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    height: 40px;
    min-width: 0;
    overflow: visible;
    color: var(--skin__lead);
    cursor: pointer;
  }

  &__account-top {
    width: 100%;
    height: 17px;
    min-width: 0;
  }

  &__balance {
    display: flex;
    align-items: center;
    width: 100%;
    height: 21px;
    min-width: 0;
    padding: 0;
    border: 0;
    color: var(--skin__lead);
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  &__currency-frame {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    flex: none;
    border-radius: 50%;
    background: url("@/assets/common/img_hb_frame.avif") center / cover no-repeat;
  }

  &__currency {
    width: 15px;
    height: 15px;
    border-radius: 50%;
  }

  &__balance-value {
    min-width: 0;
    max-width: 88px;
    margin-left: 4px;
    overflow: hidden;
    border-bottom: 1px solid var(--skin__accent_3);
    color: var(--skin__accent_3);
    font-size: 12px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__refresh {
    width: 15px;
    height: 15px;
    margin-left: 4px;
    flex: none;
    color: var(--skin__primary);

    &--loading {
      animation: basic-nav-spin 0.3s linear infinite;
    }
  }

  &__right {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
  }

  &__item,
  &__more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 45px;
    max-width: 50px;
    margin-right: 2.5px;
    color: var(--skin__neutral_1);
    cursor: pointer;
    user-select: none;
  }

  &__item {
    &:last-child {
      margin-right: 0;
    }
  }

  &__more {
    margin-right: 0;
  }

  &__item-icon {
    width: 28.5px;
    height: 25px;
    background-color: transparent;
  }

  &__item-title {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-width: 50px;
    margin-top: 3.1px;
    font-size: 11px;
    line-height: 1;
    text-align: center;
    white-space: normal;
  }
}

:global([dir='rtl']) .basic-nav-container {
  &__btn--login {
    margin-right: 0;
    margin-left: 10px;
  }

  &__item,
  &__more {
    margin-right: 0;
    margin-left: 2.5px;
  }
}

:global([dir='rtl']) .basic-nav-container__balance-value,
:global([dir='rtl']) .basic-nav-container__refresh {
  margin-right: 4px;
  margin-left: 0;
}

// 右侧导航行对齐 u投(UQuickNav) 布局：不换行、flex 均分、min45/max50
.basic-nav-container__right {
  flex-wrap: nowrap;
}

.basic-nav-container__right > * {
  flex: 1 1 0;
  min-width: 45px;
  max-width: 50px;
  margin-right: 2.5px;
}

.basic-nav-container__right > *:last-child {
  margin-right: 0;
}

.basic-nav-container__right > .basic-nav-container__more .basic-nav-container__item {
  width: 100%;
  min-width: 45px;
  max-width: 50px;
  margin-right: 0;
}

:global([dir='rtl']) .basic-nav-container__right > * {
  margin-right: 0;
  margin-left: 2.5px;
}

:global([dir='rtl']) .basic-nav-container__right > *:last-child {
  margin-left: 0;
}
@keyframes basic-register-pulse {
  from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--skin__primary) 40%, transparent); }
  to { box-shadow: 0 0 0 8px transparent; }
}

@keyframes basic-nav-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .basic-nav-container__btn--register::after { animation: none; }
}
</style>
