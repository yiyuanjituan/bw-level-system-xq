<script setup lang="ts">
import { watch } from "vue";
import UiCheckbox from "@/components/UI/checkbox.vue";
import Policy from "@/components/Common/policy.vue";
import GeeTest from "@/components/Common/GeeTest.vue";
import LoginPopup from "@/components/Common/Login.vue";
import RegisterPopup from "@/components/Common/Register.vue";
import useAppStore from "@/store/modules/app";
import {
  useLoginFlow,
  type LoginFlowTab,
  type LoginSuccessType
} from "@/hooks/useLoginFlow";

defineOptions({
  name: "LoginRegisterPanel"
});

const props = withDefaults(
  defineProps<{
    initialTab?: LoginFlowTab;
    syncRoute?: boolean;
  }>(),
  {
    syncRoute: false
  }
);

const emit = defineEmits<{
  (event: "success", type: LoginSuccessType): void;
  (event: "navigate"): void;
}>();

const app = useAppStore();
const {
  activeTabs,
  showLoading,
  isAgreeAccept,
  loginForm,
  registerForm,
  loginFormRef,
  registerFormRef,
  policyRef,
  geeTestRef,
  quickLoginOptions,
  setTab,
  reset,
  handleTabChange,
  openAccept,
  jumpToService,
  freeTrialGame,
  handleQuickLogin,
  handleQuery,
  handleExec
} = useLoginFlow({
  initialTab: props.initialTab,
  syncRoute: props.syncRoute,
  onSuccess: type => emit("success", type),
  onNavigate: () => emit("navigate")
});

watch(
  () => props.initialTab,
  value => {
    if (value !== undefined) setTab(value);
  }
);

defineExpose({
  reset,
  setTab,
  openAccept
});
</script>

<template>
  <main
    class="login-register-panel lobby-login-register-fragment loginRegisterFragment"
  >
    <header v-if="app.appInfo.loginTip" class="login-register-panel__header">
      <section class="login-register-panel__tip" v-html="app.appInfo.loginTip"></section>
    </header>

    <x-tabs
      swipeable
      v-model:active="activeTabs"
      :line-width="78"
      @change="handleTabChange"
    >
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

    <section class="login-register-panel__extra">
      <div class="login-register-panel__agreement">
        <div v-if="activeTabs === 1" class="remember-box">
          <ui-checkbox v-model="isAgreeAccept">
            <span>记住账号密码</span>
          </ui-checkbox>
        </div>
        <div v-else class="accept-agree">
          <ui-checkbox v-model="isAgreeAccept">
            <span>
              我已满18岁，已阅读且同意
              <span class="main-text" role="button" tabindex="0" @click.stop="openAccept">《用户协议》</span>
            </span>
          </ui-checkbox>
        </div>
      </div>

      <section class="login-register-panel__submit">
        <x-button class="!w-[100%]" :loading="showLoading" @click="handleQuery">
          {{ activeTabs === 0 ? "注册" : "登录" }}
        </x-button>
      </section>

      <div class="login-register-panel__quick-entry">
        <button type="button" class="main-text" @click.stop="jumpToService">联系客服</button>
        <button type="button" class="main-text" @click.stop="freeTrialGame">免费试玩</button>
        <button v-if="activeTabs === 1" type="button" class="main-text">忘记密码</button>
      </div>

      <section v-if="activeTabs === 1 && quickLoginOptions.length" class="quick-login">
        <div class="quick-login__title"><span>快捷登录</span></div>
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
    </section>

    <policy ref="policyRef" />
    <gee-test ref="geeTestRef" @success="handleExec" />
  </main>
</template>

<style scoped lang="less">
.login-register-panel {
  --login-panel-side-space: 15px;
  width: 100%;
  max-height: calc(100dvh - 150px);
  overflow: auto;
  color: var(--skin__lead);
  font-size: 12px;
  box-sizing: border-box;

  &__header {
    padding: 0 var(--login-panel-side-space) 8px;
  }

  &__tip {
    max-height: 90px;
    overflow: auto;
    color: var(--skin__neutral_1);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    word-break: break-word;
  }

  :deep(.x-tabs__wrap) {
    padding-bottom: 10px !important;
  }

  :deep(.x-tabs__nav) {
    &::before {
      position: absolute;
      right: var(--login-panel-side-space);
      bottom: 1px;
      left: var(--login-panel-side-space);
      height: 0.5px;
      background: var(--skin__border);
      content: "";
    }
  }

  :deep(.x-tab) {
    color: var(--skin__neutral_2);
  }

  :deep(.x-tab--active) {
    color: var(--skin__primary);
  }

  .login-title-box {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 400;
  }

  &__extra {
    padding: 0 var(--login-panel-side-space) 14px;
  }

  &__agreement {
    min-height: 22px;
    padding-top: 8px;
    font-size: 11px;
  }

  .accept-agree,
  .remember-box {
    display: flex;
    align-items: flex-start;
  }

  .accept-agree :deep(.ui-checkbox__icon-wrap),
  .remember-box :deep(.ui-checkbox__icon-wrap) {
    margin-right: 5px;
  }

  &__submit {
    margin-top: 12px;

    :deep(.x-button) {
      animation: login-panel-scale 1.5s infinite;
      transition: box-shadow 0.3s, transform 0.3s;

      &::after {
        position: absolute;
        inset: 0;
        border: inherit;
        border-radius: inherit;
        animation: login-panel-pulse 1.5s infinite;
        content: "";
        pointer-events: none;
      }
    }
  }

  &__quick-entry {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-top: 10px;

    button {
      flex: 1;
      min-width: 0;
      padding: 0;
      border: 0;
      background: transparent;
      font-size: 11px;
      line-height: 1.5;
      text-align: center;
      cursor: pointer;
    }
  }

  .quick-login {
    margin-top: 20px;

    &__title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--skin__neutral_2);
      font-size: 11px;

      &::before,
      &::after {
        flex: 1;
        height: 0.5px;
        background: var(--skin__border);
        content: "";
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

@keyframes login-panel-scale {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }
}

@keyframes login-panel-pulse {
  0% {
    box-shadow: 0 0 0 0 var(--skin__primary);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 102, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 102, 0);
  }
}

@media (max-width: 360px) {
  .login-register-panel {
    --login-panel-side-space: 12px;

    .quick-login__list {
      gap: 18px;
    }
  }
}
</style>
