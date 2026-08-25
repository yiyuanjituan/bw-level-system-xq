<script setup lang="ts">
import { $t } from "@/locales";
import { handleBack } from '@/utils/common';
import RegisterPopup from '@/components/Common/Register.vue';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import UiCheckbox from '@/components/UI/checkbox.vue';
import policy from '@/components/Common/policy.vue';
import { loginProps, registerProps } from '@/enums/props';
import { showCustomDialog, showCustomToast } from '@/hooks/useCommon';
import { userLogin, userPhoneLogin, userRegister, userTelegramLoginComplete, userTelegramLoginStart } from '@/api/common';
import useAuthStore from '@/store/modules/user';
import LoginPopup from '@/components/Common/Login.vue';
import { useRoute } from 'vue-router';
import useAppStore from '@/store/modules/app';
import type { FormExpose } from '@/components/UI/form-context';
import router from '@/router';
import { bus } from '@/utils/mitt';
import telegramLoginIcon from '@/assets/common/quick-login/telegram.avif';
import { clearStoredInviteCode, getStoredInviteCode } from '@/utils/inviteCode';

const height = ref('0px');

const route = useRoute();
const activeTabs = ref(getTabByPath(route.path));
const showLoading = ref(false);
const registerForm = ref<registerProps>({
  type: 'password',
  invite_code: getStoredInviteCode()
} as registerProps);
const registerFormRef = useTemplateRef<{ form: FormExpose }>('registerFormRef');
const app = useAppStore();

// 登录的form
const loginForm = ref<loginProps>({ type: 'password', accountType: 'account' } as loginProps);
const loginFormRef = useTemplateRef<{ form: { validate: () => Promise<void> } }>('loginFormRef');

const policyRef = ref();
const isAgreeAccept = ref(true); // 是否同意政策
const openAccept = () => policyRef.value.open();
const geeTestRef = ref();
const auth = useAuthStore();
const telegramLoginLoading = ref(false);
const quickLoginOptions = computed(() => [
  // { name: 'NoWallet', icon: noWalletLoginIcon },
  // { name: 'Google', icon: googleLoginIcon },
  ...(app.appInfo?.telegramLogin?.enabled ? [{ name: 'Telegram', icon: telegramLoginIcon }] : [])
]);

function getTabByPath(path: string) {
  return path.includes('/home/login') ? 1 : 0;
}

function getPathByTab(tab: number) {
  return tab === 1 ? '/home/login' : '/home/register';
}

function replaceCurrentPath(path: string) {
  const nextUrl = `${window.location.pathname}${window.location.search}#${path}`;
  window.history.replaceState(window.history.state, '', nextUrl);
}

function handleTabChange(tab: number | string) {
  showLoading.value = false;
  const nextTab = Number(tab);
  const nextPath = getPathByTab(nextTab);

  if (window.location.hash !== `#${nextPath}`) {
    replaceCurrentPath(nextPath);
  }
}

function jumpToService() {
  router.push('/home/notice');
}

function freeTrialGame() {
  router.push({ path: '/home/subGame', query: { type: '20', platformId: 0 } });
}

function handleQuickLogin(name: string) {
  if (name === 'Telegram') {
    openTelegramLogin();
    return;
  }

  showCustomToast({
    type: 'warning',
    message: `${name}快捷登录暂未开放`
  });
}

async function openTelegramLogin() {
  const telegramConfig = app.appInfo?.telegramLogin;
  if (!telegramConfig?.enabled) {
    showCustomToast({ type: 'warning', message: $t("当前站点未开启Telegram快捷登录") });
    return;
  }

  let loginDomain: URL;
  try {
    loginDomain = new URL(String(telegramConfig.domain || ''));
  } catch {
    showCustomToast({ type: 'fail', message: $t("Telegram登录Domain配置无效") });
    return;
  }
  if (!['http:', 'https:'].includes(loginDomain.protocol)) {
    showCustomToast({ type: 'fail', message: $t("Telegram登录Domain只支持HTTP或HTTPS") });
    return;
  }

  if (telegramLoginLoading.value) return;

  telegramLoginLoading.value = true;
  try {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.delete('telegramTicket');
    returnUrl.searchParams.delete('telegramError');
    returnUrl.searchParams.delete('telegramAutoStart');
    returnUrl.searchParams.delete('telegramAuthorizationUrl');
    const result = await userTelegramLoginStart({
      returnUrl: returnUrl.toString()
    });
    const authorizationUrl = new URL(result?.authorizationUrl || '');
    if (authorizationUrl.origin !== 'https://oauth.telegram.org') {
      throw new Error($t("Telegram授权地址无效"));
    }

    if (loginDomain.origin.toLowerCase() !== window.location.origin.toLowerCase()) {
      // 原始回跳地址由API保存在state中，跨域时只传递Telegram授权地址。
      const gatewayUrl = new URL(`${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`, loginDomain.origin);
      gatewayUrl.searchParams.set('telegramAutoStart', '1');
      gatewayUrl.searchParams.set('telegramAuthorizationUrl', authorizationUrl.toString());
      window.location.assign(gatewayUrl.toString());
      return;
    }

    window.location.assign(authorizationUrl.toString());
  } finally {
    telegramLoginLoading.value = false;
  }
}

async function handleTelegramGateway() {
  const currentUrl = new URL(window.location.href);
  const shouldAutoStart = currentUrl.searchParams.get('telegramAutoStart') === '1';
  const authorizationUrlText = currentUrl.searchParams.get('telegramAuthorizationUrl');
  if (!shouldAutoStart || !authorizationUrlText) return;

  let telegramOrigin = '';
  try {
    telegramOrigin = new URL(String(app.appInfo?.telegramLogin?.domain || '')).origin.toLowerCase();
  } catch {
    showCustomToast({ type: 'fail', message: $t("Telegram登录Domain配置无效") });
    return;
  }
  if (telegramOrigin !== currentUrl.origin.toLowerCase()) {
    showCustomToast({ type: 'fail', message: $t("当前页面不是Telegram统一登录Domain") });
    return;
  }

  let authorizationUrl: URL;
  try {
    authorizationUrl = new URL(authorizationUrlText);
  } catch {
    showCustomToast({ type: 'fail', message: $t("Telegram授权地址无效") });
    return;
  }
  if (authorizationUrl.origin !== 'https://oauth.telegram.org') {
    showCustomToast({ type: 'fail', message: $t("Telegram授权地址无效") });
    return;
  }

  window.location.replace(authorizationUrl.toString());
}

async function handleTelegramCallback() {
  const currentUrl = new URL(window.location.href);
  const loginTicket = currentUrl.searchParams.get('telegramTicket');
  const loginError = currentUrl.searchParams.get('telegramError');
  if (!loginTicket && !loginError) return;

  currentUrl.searchParams.delete('telegramTicket');
  currentUrl.searchParams.delete('telegramError');
  window.history.replaceState(window.history.state, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);

  if (loginError) {
    showCustomToast({
      type: 'fail',
      message: loginError === 'authorization_denied' ? '已取消Telegram授权' : 'Telegram授权失败，请重试'
    });
    return;
  }

  telegramLoginLoading.value = true;
  try {
    const result = await userTelegramLoginComplete({
      loginTicket: String(loginTicket),
      deviceInfo: { loginType: 'H5' }
    });
    auth.setToken(result?.token);
    await auth.updateInfo();
    handleBack();
  } finally {
    telegramLoginLoading.value = false;
  }
}

function handleQuery() {
  if (showLoading.value) return false;
  if (activeTabs.value == 0) {
    registerFormRef.value.form.validate().then(() => {
      geeTestRef.value.showCaptcha();
    });
  }
  if (activeTabs.value == 1) {
    geeTestRef.value.showCaptcha();
  }
}

function handleRegister() {
  userRegister(registerForm.value)
    .then(result => {
      auth.setToken(result?.token);
      clearStoredInviteCode();
      auth.updateInfo();
      showLoading.value = false;
      handleBack();
      setTimeout(() => {
        const params = {
          title: $t("注册成功"),
          message: $t("👉恭喜您注册成功! 赶紧玩一局吧~"),
          confirmButtonText: '立即存款',
          titleColor: '#04be02'
        };
        showCustomDialog(params).then(res => {
          bus.emit('showRecharge');
        });
      }, 100);
    })
    .finally(() => (showLoading.value = false));
}

function handleLogin() {
  (loginForm.value.type == 'sms' ? userPhoneLogin : userLogin)(loginForm.value)
    .then(result => {
      auth.setToken(result?.token);
      auth.updateInfo();
      showLoading.value = false;
      handleBack();
    })
    .finally(() => (showLoading.value = false));
}

function handleExec() {
  showLoading.value = true;
  if (activeTabs.value == 0) {
    // 注册
    handleRegister();
  }
  if (activeTabs.value == 1) {
    handleLogin();
  }
}

onMounted(async () => {
  height.value = `${window.innerHeight}px`;
  await handleTelegramCallback();
  await handleTelegramGateway();
});

watch(
  () => route.path,
  path => {
    const nextTab = getTabByPath(path);
    if (activeTabs.value !== nextTab) {
      activeTabs.value = nextTab;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="common-container">
    <img src="@/assets/common/img_login_bg_style1_yd.avif" alt="." class="bg-img" />
    <div class="header">
      <div class="back-icon" @click="handleBack">
        <svg-icon name="arrow-back" />
      </div>
    </div>
    <div class="main lobby-login-register-fragment loginRegister loginRegisterFragment bodyWrap">
      <header class="header-wrap">
        <article>
          <section>
            <div v-html="app.appInfo.loginTip"></div>
          </section>
        </article>
      </header>
      <x-tabs swipeable v-model:active="activeTabs" @change="handleTabChange" :line-width="78">
        <x-tab :name="0">
          <template #title>
            <div class="login-title-box">
              <svg-icon name="login_icon_zj" />
              <span class="ml-[4px]">注&nbsp;册</span>
            </div>
          </template>
          <register-popup v-model="registerForm" ref="registerFormRef" />
        </x-tab>
        <x-tab :name="1">
          <template #title>
            <div class="login-title-box">
              <svg-icon name="login_icon_dl" />
              <span class="ml-[4px]">登&nbsp;录</span>
            </div>
          </template>
          <login-popup v-model="loginForm" ref="loginFormRef" />
        </x-tab>
      </x-tabs>
      <div class="fragment__extra">
        <div class="pt-[10px] text-[11px]">
          <div class="remember-box" v-if="activeTabs == 1">
            <ui-checkbox v-model="isAgreeAccept">
              <div @click="isAgreeAccept = !isAgreeAccept">记住账号密码</div>
            </ui-checkbox>
          </div>
          <div class="accept-agree" v-if="activeTabs == 0">
            <ui-checkbox v-model="isAgreeAccept">
              <div @click="isAgreeAccept = !isAgreeAccept">
                我已满18岁,已阅读且同意<span class="text-[#F0C059]" @click.stop="openAccept">《用户协议》</span>
              </div>
            </ui-checkbox>
          </div>
        </div>
        <section class="mt-[12px] section-box">
          <x-button class="!w-[100%]" @click="handleQuery" :loading="showLoading">
            {{ activeTabs == 0 ? '注册' : '登录' }}
          </x-button>
        </section>
        <div class="mt-[10px] flex items-center justify-center">
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1" @click.stop="jumpToService">{{ $t("联系客服") }}</div>
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1" @click.stop="freeTrialGame">{{ $t("免费试玩") }}</div>
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1" v-if="activeTabs == 1">{{ $t("忘记密码") }}</div>
        </div>
        <section v-if="activeTabs == 1 && quickLoginOptions.length" class="quick-login">
          <div class="quick-login__title"><span>{{ $t("快捷登录") }}</span></div>
          <div class="quick-login__list">
            <button
              v-for="option in quickLoginOptions"
              :key="option.name"
              type="button"
              class="quick-login__button"
              :aria-label="`${option.name}快捷登录`"
              @click="handleQuickLogin(option.name)"
            >
              <img :src="option.icon" :alt="option.name" class="quick-login__icon" />
            </button>
          </div>
        </section>
      </div>
    </div>
    <policy ref="policyRef" />
    <gee-test ref="geeTestRef" @success="handleExec" />
  </div>
</template>

<style scoped lang="less">
.common-container {
  --max-height: v-bind(height);
  --other-space: 90px;
  --container-space: 0;
  font-size: 12px;

  background: var(--skin__bg_2);
  position: relative;
  min-height: v-bind(height);

  .bg-img {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 260px;
  }

  .header {
    height: 50px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    position: relative;

    .back-icon {
      color: #adb6c3;
      height: 100%;
      display: flex;
      align-items: center;
      width: 45px;
      font-size: 12px;
      margin-top: var(--status-bar-height);

    }

    .logo-box {
      position: relative;
      height: 38px;
      width: calc(100% - 45px);
      pointer-events: none;
      padding-right: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .logo {
        object-fit: contain;
        cursor: pointer;
        max-width: 100%;
        max-height: 100%;
        vertical-align: middle;
      }
    }
  }

  .loginRegister {
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    font-size: 8px;
    max-height: calc(var(--max-height, 100vh) - var(--other-space));
    backface-visibility: hidden;
    padding: 0 0 var(--container-space) 0;
    box-sizing: border-box;
  }

  .main {
    margin-top: var(--status-bar-height);

    :deep(.x-tab) {
      color: var(--skin__neutral_2);
    }
    :deep(.x-tabs__wrap) {
      //height: 40px !important;
      padding-bottom: 10px !important;
    }
    :deep(.x-tab--active) {
      color: var(--skin__primary);
    }
    :deep(.x-tabs__nav) {
      &::before {
        position: absolute;
        right: 20px;
        bottom: 1px;
        left: 20px;
        height: 0.55px;
        background: var(--skin__border);
        content: '';
      }
    }
    .header-wrap {
      max-height: 300px;

      article {
        max-height: 175px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;
        margin-bottom: 10px;

        section {
          padding-left: 20px;
          padding-right: 20px;
          width: 100%;
          font-size: 12px !important;
          text-align: center;
          word-break: break-word;
          color: var(--skin__neutral_1);
        }
      }
    }
    .login-title-box {
      font-size: 13px;
      font-weight: 400;
      display: flex;
      align-items: center;
    }

    .fragment__extra {
      padding-left: 15px;
      padding-right: 15px;
      width: 100%;

      .accept-agree {
        display: flex;
        align-items: flex-start;

        :deep(.ui-checkbox__icon-wrap) {
          margin-right: 5px;
        }
      }

      .remember-box {
        display: flex;
        align-items: flex-start;

        :deep(.ui-checkbox__icon-wrap) {
          margin-right: 5px;
        }
        :deep(.ui-checkbox__label) {
          color: white;
        }
      }

      .section-box {
        --submit-button__animation--shadow: pulse-green 1.5s infinite;
        --submit-button__animation--scale: scale-btn 1.5s infinite;
        --submit-button__animation--scale__to: 1.08;
        button {
          animation: var(--submit-button__animation--scale);
          transition: box-shadow 0.3s, transform 0.3s;
          &::before {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: #000;
            border-color: #000;
            border-radius: inherit;
            transform: translate(-50%, -50%);
            opacity: 0;
            content: ' ';
          }
          &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            border: inherit;
            content: '';
            border-radius: inherit;
            animation: var(--submit-button__animation--shadow);
            transition: inherit;
          }
        }
      }

      .quick-login {
        margin-top: 22px;

        &__title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--skin__neutral_2);
          font-size: 11px;

          &::before,
          &::after {
            height: 0.5px;
            background: var(--skin__border);
            content: '';
            flex: 1;
          }

          span {
            flex-shrink: 0;
          }
        }

        &__list {
          display: flex;
          justify-content: center;
          gap: 28px;
          margin-top: 14px;
        }

        &__button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;

          &:active {
            opacity: 0.75;
            transform: scale(0.94);
          }
        }

        &__icon {
          display: block;
          width: 44px;
          height: 44px;
          object-fit: contain;
        }
      }
    }
  }
}
</style>

<style>
@keyframes scale-btn {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  to {
    transform: scale(1);
  }
}
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 var(--skin__primary);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 102, 0);
  }

  to {
    box-shadow: 0 0 0 0 rgba(0, 255, 102, 0);
  }
}
</style>
