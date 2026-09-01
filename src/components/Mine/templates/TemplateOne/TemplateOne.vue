<script setup lang="ts">
import { $t } from "@/locales";
import { handleBack } from "@/utils/common";
import UiBadge from "@/components/UI/badge.vue";
import MineBanner from "./MineBanner.vue";
import MineCard from "./MineCard.vue";
import MineGrid from "./MineGrid.vue";
import MineLogin from "./MineLogin.vue";
import useAuthStore from "@/store/modules/user";
import useAppStore from "@/store/modules/app";
import { showCustomToast } from "@/hooks/useCommon";
import router from "@/router";
import { bus } from '@/utils/mitt';
import { service } from "@/api/service";
import { computed, onMounted, ref } from "vue";
import { isThemePreviewMode } from "@/utils/themePreview";
import depositIcon from "@/assets/mine/gif_profile_style2.avif";

defineOptions({
  name: "TemplateOne"
});

const auth = useAuthStore();
const app = useAppStore();
const previewMode = isThemePreviewMode();
const loginState = computed(() => !previewMode && Boolean(auth.token));
const messageCount = ref(0);
const interestRateText = ref("");

const MENU_TO_GRID_KEY: Record<string, string> = {
  balanceRecovery: "forget",
  accountDetails: "zhmx",
  betRecords: "tzjl",
  withdrawManage: "txgl",
  personalReport: "grbb",
  vip: "vip",
  security: "aqzx",
  findUs: "zdwm",
  promote: "fxzq",
  claim: "claim",
  plazza: "pyq",
  faq: "cjwt",
  feedback: "yjfk",
  devices: "dlsb",
  logout: "aqtc",
};

const visibleSections = computed(() => {
  const supportedSections = new Set(["profile", "quick", "banner", "menu"]);
  return app.minePageSections.filter(section => section.visible !== false && supportedSections.has(section.key));
});

// 自定义顶部背景使用上传/填写的图片地址，其余情况使用内置背景图。
const topBgStyle = computed(() => {
  if (app.mineHeroStyle === "custom" && app.mineHeroImage) {
    return { backgroundImage: `url("${app.mineHeroImage}")` };
  }
  return {};
});

const quickActions = computed(() => {
  return app.mineQuickActions.filter(item => item.visible !== false);
});

const visibleGridKeys = computed(() => {
  return app.mineMenuItems
    .filter(item => item.visible !== false && MENU_TO_GRID_KEY[item.key])
    .map(item => MENU_TO_GRID_KEY[item.key]);
});

function jumpToService() {
  router.push({
    path: "/home/notice",
    query: { noticeType: 4 }
  });
}

function jumpToMessage() {
  router.push({
    path: "/home/notice",
    query: { noticeType: 1 }
  });
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
    console.error("获取消息数量失败，失败原因：", error);
  }
}

async function loadInterestRate() {
  if (!loginState.value) return;

  try {
    const response = await service.v1.activity.interestInfo();
    const yearRateText = response?.display?.year_rate_text;
    const yearScale = Number(response?.config?.year_scale);

    interestRateText.value = yearRateText || (Number.isFinite(yearScale) ? `${yearScale}%` : "");
  } catch (error) {
    interestRateText.value = "";
    console.error("获取利息宝年利率失败，失败原因：", error);
  }
}

function handleWithdraw() {
  if (!auth.token || !auth.user?.id) {
    router.push("/home/login");
    return false;
  }
  if (!auth.user.hasPayPassword) {
    router.push("/home/security?active=5");
    return showCustomToast({
      type: "warning",
      message: $t("为了资金安全，需先设置提现密码哦！")
    });
  } else {
    router.push("/home/withdraw");
  }
}

function handleRecharge() {
  bus.emit('showRecharge')
}

function handleLxb() {
  router.push("/home/yuebao");
}

function handleQuickAction(key: string) {
  if (key === "withdraw") return handleWithdraw();
  if (key === "deposit") return handleRecharge();
  if (key === "yuebao") return handleLxb();
}

onMounted(() => {
  void loadMessageCount();
  void loadInterestRate();
});
</script>

<template>
  <div class="mine-container">
    <div class="back-icon" @click="handleBack">
      <i class="icon inline-flex justify-center items-center">
        <svg width="1em" height="1em" fill="currentColor" class="">
          <use xlink:href="#ui-arrow-418a3a"></use>
        </svg>
      </i>
    </div>
    <div class="mine-body">
      <template v-for="section in visibleSections" :key="`${app.minePageLayoutVersion}-${section.key}`">
        <div v-if="section.key === 'profile'" class="top-body" :style="topBgStyle">
          <div class="bgGradient"></div>
          <div class="row-user-card">
            <div class="user-card">
              <div class="float-message">
                <div />
                <header v-if="loginState">
                  <div class="btn-container" @click="jumpToService">
                    <div class="w-[24px] h-[24px] text-[24px]">
                      <svg-icon name="top_kf" class="absolute text-[#68707B]" />
                      <svg-icon name="top_kf2" class="absolute text-[#F0C059]" />
                    </div>
                  </div>
                  <ui-badge :content="messageCount" :size="[2, -2]">
                    <div class="btn-container" @click="jumpToMessage">
                      <div class="w-[24px] h-[24px] text-[24px]">
                        <svg-icon name="top_xx" class="absolute text-[#68707B]" />
                        <svg-icon name="top_xx2" class="absolute text-[#F0C059]" />
                      </div>
                    </div>
                  </ui-badge>
                </header>
                <header v-else class="h-[24px]" />
              </div>
              <MineCard v-if="loginState" />
              <MineLogin v-else />
            </div>
          </div>
        </div>

        <div v-else-if="section.key === 'quick' && quickActions.length" class="quick-section">
          <div class="nav-card">
            <div v-for="action in quickActions" :key="action.key" class="nav-item" @click="handleQuickAction(action.key)">
              <div class="icon">
                <template v-if="action.key === 'withdraw'">
                  <svg-icon name="style_2_icon_mid_tx" class="svg-icon" />
                  <svg-icon name="style_2_icon_mid_tx2" class="svg-icon text-[#04BE02]" />
                </template>
                <img v-else-if="action.key === 'deposit'" :src="depositIcon" class="deposit-icon" alt="" />
                <template v-else>
                  <svg-icon name="style_2_icon_mid_lxb" class="svg-icon" />
                  <svg-icon name="style_2_icon_mid_lxb2" class="svg-icon text-[#EA4E3D]" />
                </template>
              </div>
              <div class="label">{{ action.key === 'withdraw' ? $t('提现') : action.key === 'deposit' ? $t('存款') : $t('利息宝') }}</div>
            </div>
          </div>
        </div>

        <MineBanner v-else-if="section.key === 'banner'" />
        <MineGrid v-else-if="section.key === 'menu'" :ordered-keys="visibleGridKeys" />
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-container {
  color: white;
  overflow: auto;
  background: #202329;
  .back-icon {
    margin-top: var(--status-bar-height);
    width: 30px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #adb6c3;
    position: absolute;
    z-index: 9;
  }
  .mine-body {
    position: relative;
    background: #202329;
    .top-body {
      position: relative;
      .bgGradient {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom, #f0c059, transparent);
        opacity: 0.15;
        color: #adb6c3;
      }
      .row-user-card {
        padding-top: var(--status-bar-height);
        background-image: url("@/assets/mine/style_2_topbg_yd.avif");
        background-size: 100%;
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        .user-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 6px 12px 0;
          .float-message {
            background-position: 0 0;
            background-size: 100% 100%;
            padding-top: 2px;
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;
            header {
              --header-icon-color: var(--skin__primary);
              --header-icon-size: 24px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              margin-bottom: 4.5px;
              padding-top: 2px;
              .btn-container {
                margin-left: 15px;
                display: flex;
                align-items: center;
                justify-items: center;
                flex-direction: column;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
    .quick-section {
      padding: 15px 10px 8px;
      background: #202329;
    }
    .nav-card {
      display: flex;
      justify-content: space-around;
      padding: 10px;
      border-radius: 7px;
      background: #1c1e23;
      .nav-item {
        position: relative;
        display: flex;
        min-width: 72px;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        color: white;
        font-size: 14px;
        cursor: pointer;
        .icon {
          width: 32px;
          min-height: 32px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .deposit-icon { width: 32px; height: 32px; display: block; object-fit: contain; }
          .svg-icon { position: absolute; bottom: 0; font-size: 32px; }
        }
        .label {
          height: 35px;
          padding-top: 2.5px;
          display: -webkit-box;
          overflow: hidden;
          color: #adb6c3;
          line-height: 17.5px;
          text-align: center;
          text-overflow: ellipsis;
          word-break: break-word;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }
    }
  }
}
</style>
