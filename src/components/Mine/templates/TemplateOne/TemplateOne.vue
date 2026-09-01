<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { $t } from '@/locales';
import { handleBack } from '@/utils/common';
import { showCustomToast } from '@/hooks/useCommon';
import { bus } from '@/utils/mitt';
import { service } from '@/api/service';
import { isThemePreviewMode } from '@/utils/themePreview';
import UiBadge from '@/components/UI/badge.vue';
import ULanguageDialog from '@/components/Home/ULanguageDialog.vue';
import router from '@/router';
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';
import MineBanner from './MineBanner.vue';
import MineCard from './MineCard.vue';
import MineGrid from './MineGrid.vue';
import MineLogin from './MineLogin.vue';
import MineWalletCard from './MineWalletCard.vue';
import topBackground from '@/assets/mine/template-one/top_bg.avif';
import depositIcon from '@/assets/mine/template-one/deposit.avif';
import withdrawIcon from '@/assets/mine/template-one/withdraw.avif';

defineOptions({ name: 'TemplateOne' });

const auth = useAuthStore();
const app = useAppStore();
const previewMode = isThemePreviewMode();
const loginState = computed(() => !previewMode && Boolean(auth.token));
const messageCount = ref(0);
const interestRateText = ref('');
const walletIsLoading = ref(false);
const languageDialogVisible = ref(false);

const visibleSections = computed(() => {
  const supportedSections = new Set(['profile', 'quick', 'banner', 'menu']);
  return app.minePageSections.filter(section => section.visible !== false && supportedSections.has(section.key));
});
const quickActions = computed(() => app.mineQuickActions.filter(item => item.visible !== false));
const topQuickActions = computed(() => quickActions.value.filter(item => item.key === 'deposit' || item.key === 'withdraw'));
const quickSectionVisible = computed(() => visibleSections.value.some(section => section.key === 'quick'));
const showYuebao = computed(() => quickSectionVisible.value && quickActions.value.some(item => item.key === 'yuebao'));
const visibleGridKeys = computed(() => {
  return app.mineMenuItems.filter(item => item.visible !== false).map(item => item.key);
});
const currencyInfo = computed(() => {
  return app.appInfo?.countryList?.find(currency => currency.id == auth.user?.currencyId);
});
const heroStyle = computed(() => {
  if (app.mineHeroStyle === 'custom' && app.mineHeroImage) {
    return { backgroundImage: `url("${app.mineHeroImage}")` };
  }
  if (app.mineHeroStyle === 'common') {
    return { backgroundImage: "url('/siteadmin/skin/lobby_asset/common/common/profile/style_1_topbg_yd.avif')" };
  }
  if (app.mineHeroStyle === 'common82') {
    return { backgroundImage: "url('/siteadmin/skin/lobby_asset/82-0-common/common/profile/img_topbg.avif')" };
  }
  return { backgroundImage: `url("${topBackground}")` };
});

function jumpToService() {
  void router.push({ path: '/home/notice', query: { noticeType: 4 } });
}

function jumpToMessage() {
  void router.push({ path: '/home/notice', query: { noticeType: 1 } });
}

function handleWithdraw() {
  if (!auth.token || !auth.user?.id) {
    void router.push('/home/login');
    return;
  }
  if (!auth.user.hasPayPassword) {
    void router.push('/home/security?active=5');
    showCustomToast({
      type: 'warning',
      message: $t('为了资金安全，需先设置提现密码哦！')
    });
    return;
  }
  void router.push('/home/withdraw');
}

function handleQuickAction(actionKey: string) {
  if (actionKey === 'withdraw') {
    handleWithdraw();
    return;
  }
  if (actionKey === 'deposit') {
    bus.emit('showRecharge');
  }
}

async function updateWallet() {
  if (!loginState.value || walletIsLoading.value) return;

  walletIsLoading.value = true;
  try {
    await auth.updateInfo();
  } catch (error) {
    console.error('刷新个人中心余额失败，失败原因：', error);
  } finally {
    walletIsLoading.value = false;
  }
}

async function loadMessageCount() {
  if (!loginState.value) return;

  try {
    const response = await service.v1.notice.notifyList({ limit: 9999 });
    const total = Number(response?.total);
    const messageList = Array.isArray(response?.list) ? response.list : [];
    messageCount.value = Number.isFinite(total) ? total : messageList.length;
  } catch (error) {
    messageCount.value = 0;
    console.error('获取个人中心消息数量失败，失败原因：', error);
  }
}

async function loadInterestRate() {
  if (!loginState.value || !showYuebao.value) return;

  try {
    const response = await service.v1.activity.interestInfo();
    const yearRateText = response?.display?.year_rate_text;
    const yearScale = Number(response?.config?.year_scale);
    interestRateText.value = yearRateText || (Number.isFinite(yearScale) ? `${yearScale}%` : '');
  } catch (error) {
    interestRateText.value = '';
    console.error('获取个人中心利息宝年利率失败，失败原因：', error);
  }
}

onMounted(() => {
  void loadMessageCount();
  void loadInterestRate();
});
</script>

<template>
  <div class="mine-template-one-layout">
    <section data-route-for-scroll="mine" class="mine-template-one lobby-scroll lobby-scroll--y lobby-scroll--system-scrollbar">
      <button type="button" class="mine-template-one__back" :aria-label="$t('返回上一级')" @click="handleBack">
        <svg-icon name="arrow-back" />
      </button>

      <main class="mine-template-one__content" :style="heroStyle">
        <template v-for="section in visibleSections" :key="`${app.minePageLayoutVersion}-${section.key}`">
          <section v-if="section.key === 'profile'" class="mine-profile-section" :class="{ 'mine-profile-section--guest': !loginState }">
            <header v-if="loginState" class="mine-profile-section__actions">
              <button type="button" class="mine-profile-section__action" :aria-label="$t('客服')" @click="jumpToService">
                <svg-icon name="template-one-style_7_icon_top_kf" />
              </button>
              <UiBadge :content="messageCount" :size="[2, -2]">
                <button type="button" class="mine-profile-section__action" :aria-label="$t('消息')" @click="jumpToMessage">
                  <svg-icon name="template-one-style_7_icon_top_xx" />
                </button>
              </UiBadge>
            </header>
            <MineCard v-if="loginState" />
            <MineLogin v-else />
          </section>

          <section v-else-if="section.key === 'quick' && loginState" class="mine-money-section">
            <div class="mine-money-section__balance">
              <template v-if="loginState">
                <van-image
                  v-if="currencyInfo?.icon"
                  class="mine-money-section__currency"
                  round
                  width="17px"
                  height="17px"
                  :src="currencyInfo.icon"
                />
                <span v-if="walletIsLoading" class="mine-money-section__loading">{{ $t('加载中') }}</span>
                <span v-else class="mine-money-section__amount" dir="ltr">{{ auth.user?.money }}</span>
                <button
                  type="button"
                  class="mine-money-section__refresh"
                  :class="{ 'mine-money-section__refresh--loading': walletIsLoading }"
                  :aria-label="$t('刷新余额')"
                  @click="updateWallet"
                >
                  <svg-icon name="comm_icon_sx" />
                </button>
              </template>
            </div>

            <nav v-if="topQuickActions.length" class="mine-money-section__actions">
              <button
                v-for="action in topQuickActions"
                :key="action.key"
                type="button"
                class="mine-money-section__action"
                @click="handleQuickAction(action.key)"
              >
                <img :src="action.key === 'deposit' ? depositIcon : withdrawIcon" class="mine-money-section__action-icon" alt="" />
                <span>{{ action.key === 'deposit' ? $t('存款') : $t('提现') }}</span>
              </button>
            </nav>
            <MineWalletCard v-if="loginState" />
          </section>

          <MineBanner v-else-if="section.key === 'banner'" />
          <MineGrid
            v-else-if="section.key === 'menu'"
            :ordered-keys="visibleGridKeys"
            :show-yuebao="showYuebao"
            :interest-rate-text="interestRateText"
            @language="languageDialogVisible = true"
          />
        </template>
      </main>

      <ULanguageDialog v-model="languageDialogVisible" />
    </section>
  </div>
</template>

<style scoped lang="less">
.mine-template-one-layout,
.mine-template-one {
  width: 100%;
  height: 100%;
}

.mine-template-one-layout {
  position: relative;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.mine-template-one {
  min-height: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
  scrollbar-width: thin;
  scrollbar-color: var(--skin__border) transparent;
  padding-bottom: 10px;
}

.mine-template-one::-webkit-scrollbar {
  width: 3px;
}

.mine-template-one::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--skin__border);
}

.mine-template-one__back {
  width: 30px;
  height: 32px;
  padding: 0;
  position: absolute;
  top: var(--status-bar-height);
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.mine-template-one__content {
  width: 100%;
  min-height: 100%;
  padding-top: var(--status-bar-height);
  padding-bottom: calc(20px + var(--big-icon-offset-top));
  box-sizing: border-box;
  background-color: var(--skin__bg_1);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 100% auto;
}

.mine-profile-section {
  padding: 8px 10px 6px;
}

.mine-profile-section--guest {
  padding: 0;
}

.mine-profile-section__actions {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.mine-profile-section__action {
  width: 24px;
  height: 24px;
  margin-left: 15px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__lead);
  background: transparent;
  font-size: 24px;
  cursor: pointer;
}

.mine-money-section {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0 12.5px;
}

.mine-money-section__balance {
  min-width: 0;
  min-height: 49px;
  padding-top: 8px;
  flex: 1;
  display: flex;
  align-items: center;
}

.mine-money-section__currency {
  width: 17px;
  height: 17px;
  flex: none;
}

.mine-money-section__amount {
  max-width: 110px;
  margin: 0 5px;
  overflow: hidden;
  color: var(--skin__lead);
  border-bottom: 1px solid var(--skin__lead);
  font-size: 16px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-money-section__loading {
  margin: 0 5px;
  color: var(--skin__lead);
  font-size: 12px;
}

.mine-money-section__refresh {
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__primary);
  background: transparent;
  font-size: 17px;
  cursor: pointer;
}

.mine-money-section__refresh--loading {
  animation: mine-template-one-spin 0.5s linear infinite;
}

.mine-money-section__actions {
  width: 173px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.mine-money-section__action {
  min-width: 53px;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 12px;
  line-height: 16.5px;
  cursor: pointer;
}

.mine-money-section__action + .mine-money-section__action {
  margin-left: 7px;
}

.mine-money-section__action-icon {
  width: 33px;
  height: 33px;
  margin-bottom: 1px;
  display: block;
  object-fit: contain;
}

.mine-money-section :deep(.mine-wallet-card) {
  width: 100%;
  margin-right: 0;
  margin-left: 0;
}

@keyframes mine-template-one-spin {
  to {
    transform: rotate(360deg);
  }
}

:global([dir='rtl']) .mine-template-one__back {
  right: 0;
  left: auto;
}

:global([dir='rtl']) .mine-profile-section__action {
  margin-right: 15px;
  margin-left: 0;
}

:global([dir='rtl']) .mine-money-section__action + .mine-money-section__action {
  margin-right: 7px;
  margin-left: 0;
}
</style>
