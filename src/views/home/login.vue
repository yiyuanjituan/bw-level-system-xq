<script setup lang="ts">
import { handleBack } from "@/utils/common";
import RegisterPopup from "@/components/Common/Register.vue";
import { onMounted, ref, useTemplateRef } from "vue";
import UiCheckbox from "@/components/UI/checkbox.vue";
import policy from "@/components/Common/policy.vue";
import UiButton from "@/components/Common/Button.vue";
import { loginProps, registerProps } from "@/enums/props";
import { showCustomDialog, showCustomToast } from "@/hooks/useCommon";
import { userLogin, userPhoneLogin, userRegister } from "@/api/common";
import useAuthStore from "@/store/modules/user";
import router from "@/router";
import LoginPopup from "@/components/Common/Login.vue";
import { useRoute } from "vue-router";
import useAppStore from "@/store/modules/app";

const url = "https://146.103.80.124:5001/siteadmin/upload/img/1915368201952493569.avif";
const richText = ref(``);
const height = ref('0px')

const activeTabs = ref(0)
const showLoading = ref(false);
const registerForm = ref<registerProps>({ type: 'password' } as registerProps);
const registerFormRef = useTemplateRef('registerFormRef')
const route = useRoute();
const app = useAppStore();

// 登录的form
const loginForm = ref<loginProps>({ type: 'password', accountType: 'account' } as loginProps)
const loginFormRef = useTemplateRef('loginFormRef')

const policyRef = ref();
const isAgreeAccept = ref(true); // 是否同意政策
const openAccept = () => policyRef.value.open();
const geeTestRef = ref();
const auth = useAuthStore()

function handleQuery() {
  if (showLoading.value) return false;
  if (activeTabs.value == 0) {
    registerFormRef.value.form.validate().then(() => {
      geeTestRef.value.showCaptcha();
    })
  }
  if (activeTabs.value == 1) {
    geeTestRef.value.showCaptcha();
  }
}

function handleRegister() {
  userRegister(registerForm.value).then((result) => {
    auth.setToken(result?.token)
    auth.updateInfo()
    showLoading.value = false;
    handleBack()
    setTimeout(() => {
      const params = {
        title: '注册成功',
        message: '👉恭喜您注册成功! 赶紧玩一局吧~',
        confirmButtonText: '立即存款',
        titleColor: '#04be02',
      }
      showCustomDialog(params).then(res => {
        // @TODO 点击充值按钮
        console.log(res);
      })
    }, 100)
  }).finally(() => showLoading.value = false);
}

function handleLogin() {
  (loginForm.value.type == 'sms' ? userPhoneLogin : userLogin)(loginForm.value).then((result) => {
    auth.setToken(result?.token)
    auth.updateInfo()
    showLoading.value = false;
    handleBack()
  }).finally(() => showLoading.value = false);
}

function handleExec() {
  showLoading.value = true;
  if (activeTabs.value == 0) {
    // 注册
    handleRegister()
  }
  if (activeTabs.value == 1) {
    handleLogin()
  }
}

onMounted(() => {
  height.value = `${window.innerHeight}px`
  if (route.path.includes('login')) {
    activeTabs.value = 1;
  }
})
</script>

<template>
  <div class="common-container">
    <img src="@/assets/common/comm_logo_bg.avif" alt="." class="bg-img" />
    <div class="header">
      <div class="back-icon" @click="handleBack">
        <i class="icon inline-flex justify-center items-center">
          <svg width="1em" height="1em" fill="currentColor" class="">
            <use xlink:href="#ui-arrow-418a3a"></use>
          </svg>
        </i>
      </div>
      <div class="logo-box">
        <img :src="url" alt="logo" class="logo" />
      </div>
    </div>
    <div class="main">
      <header class="header-wrap">
        <article>
          <section>
            <div v-html="app.appInfo.loginTip"></div>
          </section>
        </article>
      </header>
      <van-tabs swipeable v-model:active="activeTabs" @change="showLoading = false">
        <van-tab title="注 册">
          <register-popup v-model="registerForm" ref="registerFormRef" />
        </van-tab>
        <van-tab title="登 录">
          <login-popup v-model="loginForm" ref="loginFormRef" />
        </van-tab>
      </van-tabs>
      <div class="fragment__extra">
        <div class="pt-[10px] text-[11px]">
          <div class="remember-box" v-if="activeTabs == 1">
            <ui-checkbox v-model="isAgreeAccept">
              <div @click="isAgreeAccept = !isAgreeAccept">
                记住账号密码
              </div>
            </ui-checkbox>
          </div>
          <div class="accept-agree" v-if="activeTabs == 0">
            <ui-checkbox v-model="isAgreeAccept">
              <div @click="isAgreeAccept = !isAgreeAccept">
                我已满18岁,已阅读且同意<span
                  class="text-[#F0C059]"
                  @click.stop="openAccept"
                  >《用户协议》</span
                >
              </div>
            </ui-checkbox>
          </div>
        </div>
        <ui-button class="mt-[10px]" @click="handleQuery" :loading="showLoading">
          {{ activeTabs == 0 ? '注册' : '登录' }}
        </ui-button>

        <div class="mt-[10px] flex items-center justify-center">
          <div class="text-[#F0C059] text-[11px] flex items-center justify-center flex-1">联系客服</div>
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

  background: #202329;
  position: relative;
  //overflow-y: auto;
  //overflow-x: hidden;
  min-height: v-bind(height);
  //max-height: 100%;

  .bg-img {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    object-position: top center;
    background-color: #141417;
    width: 100%;
    height: 100px;
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

  .main {
    --van-tabs-line-height: 100%;
    --van-tab-text-color: white;
    --van-padding-xs: 0px;
    --van-padding-sm: 15px;
    --van-tabs-bottom-bar-color: #f0c059;
    --van-tab-active-text-color: #f0c059;
    --van-tabs-bottom-bar-height: 0.5px;
    --van-tab-font-size: 13px;
    --van-tabs-bottom-bar-width: 60px;
    --van-tabs-nav-background: transparent;
    --van-tab-line-height: 40px;
    --van-padding-base: 15px;

    position: relative;
    width: 345px;
    padding: 0 0 15px;
    background-color: #1c1e23;
    margin: 0 auto;
    box-shadow: rgba(114, 159, 255, 0.12) 0 1.5px 3.5px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    font-size: 9px;
    max-height: calc(100vh - 70px);
    backface-visibility: hidden;
    box-sizing: border-box;

    .header-wrap {
      margin-top: 15px;
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
          padding-left: 15px;
          padding-right: 15px;
          width: 100%;
          font-size: 12px;
          text-align: center;
        }
      }
    }

    :deep(.van-tabs__wrap) {
      padding-left: 15px;
      padding-right: 15px;
    }

    :deep(.van-tab) {
      border-bottom: solid 1px #313843;
    }

    :deep(.van-tabs__line) {
      bottom: 8px;
    }

    :deep(.van-tabs__nav--line) {
      padding-bottom: 7.5px;
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
    }
  }
}
</style>
