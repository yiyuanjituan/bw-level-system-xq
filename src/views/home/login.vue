<script setup lang="ts">
import { handleBack } from '@/utils/common';
import RegisterPopup from '@/components/Common/Register.vue';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import UiCheckbox from '@/components/UI/checkbox.vue';
import policy from '@/components/Common/policy.vue';
import UiButton from '@/components/Common/Button.vue';
import { loginProps, registerProps } from '@/enums/props';
import { showCustomDialog, showCustomToast } from '@/hooks/useCommon';
import { userLogin, userPhoneLogin, userRegister } from '@/api/common';
import useAuthStore from '@/store/modules/user';
import LoginPopup from '@/components/Common/Login.vue';
import { useRoute } from 'vue-router';
import useAppStore from '@/store/modules/app';
import type { FormExpose } from '@/components/UI/form-context';
import router from '@/router';
import { bus } from '@/utils/mitt';

const url = 'https://146.103.80.124:5001/siteadmin/upload/img/1915368201952493569.avif';
const richText = ref(``);
const height = ref('0px');

const route = useRoute();
const activeTabs = ref(getTabByPath(route.path));
const showLoading = ref(false);
const registerForm = ref<registerProps>({ type: 'password' } as registerProps);
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
      auth.updateInfo();
      showLoading.value = false;
      handleBack();
      setTimeout(() => {
        const params = {
          title: '注册成功',
          message: '👉恭喜您注册成功! 赶紧玩一局吧~',
          confirmButtonText: '立即存款',
          titleColor: '#04be02'
        };
        showCustomDialog(params).then(res => {
          bus.emit('showRecharge')
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

onMounted(() => {
  height.value = `${window.innerHeight}px`;
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
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1" @click.stop="jumpToService">联系客服</div>
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1" v-if="activeTabs == 1">忘记密码</div>
        </div>
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
            content: " ";
          }
          &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            border: inherit;
            content: "";
            border-radius: inherit;
            animation: var(--submit-button__animation--shadow);
            transition: inherit;
          }
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