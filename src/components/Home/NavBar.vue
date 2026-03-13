<script setup lang="ts" name="HomeNavBar">
import { computed, ref } from "vue";
import useAuthStore from "@/store/modules/user";
import router from "@/router";
import UiButton from "@/components/Common/Button.vue";
import HomeDrawer from "@/components/Home/Drawer.vue";
import useAppStore from "@/store/modules/app";

defineOptions({
  name: "HomeNavBar"
});
const walletIsLoading = ref(false);
const isShowMore = ref(false);
const auth = useAuthStore();
const isShowNav = ref(false);
const app = useAppStore();
const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(v => v.id == auth.user.currencyId);
});

function handleToLogin() {
  router.push("/home/login");
}
const handleToRegister = () => router.push("/home/register");
const drawerRef = ref(null);

const changeShowNav = () => {
  isShowNav.value = !isShowNav.value;
  if (isShowNav.value) drawerRef.value.open();
  if (!isShowNav.value) drawerRef.value.close();
};

const updateWallet = () => {
  walletIsLoading.value = true;
  auth.updateInfo();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 2000);
};
</script>

<template>
  <header class="home-header">
    <div class="download-app" :class="{ '!h-[0px]': !app.isShowDownload }">
      <span
        class="text-[10px] text-[#B9B55CFF] px-[10px] flex w-30px items-center justify-center"
        @click="app.updateDownloadBtn(false)"
      >
        <i>
          <svg width="1em" height="1em" fill="currentColor" class="">
            <use xlink:href="#comm_icon_x" />
          </svg>
        </i>
      </span>
      <div class="flex flex-1 h-[25px] items-center">
        <img class="max-h-[25px]" :src="app.appInfo.logo" alt="." />
      </div>
      <div class="text-[9px] text-white mr-[5px] rounded-[5px] bg-[#B9B55C] flex h-[20px] w-[60px] items-center justify-center">
        立即下载
      </div>
    </div>

    <div class="header-container">
      <div class="left">
        <div class="icon-wrap">
          <i class="inline-flex items-center justify-center" @click="changeShowNav">
            <svg
              width="1em"
              height="1em"
              fill="#adb6c3"
              class="left-icon"
              :class="{ 'left-icon-transX': isShowNav }"
            >
              <use xlink:href="#btn_zcl_arrow" />
            </svg>
          </i>
        </div>
        <div class="logo">
          <img :src="app.appInfo.logo" alt="." />
        </div>
      </div>
      <div class="right" v-if="!auth.token">
        <div class="un-login">
          <div class="login-btn" role="button" @click="handleToLogin">
            <span>登 录</span>
          </div>
          <div class="register-btn" role="button" @click="handleToRegister">
            <span>注 册</span>
          </div>
        </div>
      </div>
      <div class="right" v-if="auth.token">
        <div class="wallet">
          <div class="wallet__currency">
            <img :src="currencyInfo?.icon" alt="" class="country" />
          </div>
          <div class="currency-content-wrap">
            <div class="count" v-if="!walletIsLoading">{{ auth.user.money }}</div>
            <span class="loading-text" v-if="walletIsLoading">加载中</span>
          </div>
          <div
            class="refresh-icon"
            :class="[walletIsLoading ? 'ml-[0px] animate__spin' : 'ml-[4px]']"
            @click="updateWallet"
          >
            <svg width="1em" height="1em" fill="#F0C059" class="">
              <use xlink:href="#comm_icon_sx"></use>
              <!---->
            </svg>
          </div>
        </div>
        <div class="menu-button !mr-[5px]">
          <ui-button
            class="!w-[80px] !h-[27px] !p-[0px] !rounded-[5px] !mr-[0px]"
          >
            <div class="flex w-full h-full items-center relative">
              <div class="w-[58.5px] text-[11px]">存 款</div>
              <div class="popover" @click="isShowMore = !isShowMore">
                <i
                  class="inline-flex justify-center items-center"
                  :class="{
                    'rotate-[-180deg]': isShowMore,
                    'rotate-0': !isShowMore
                  }"
                >
                  <svg width="1em" height="1em" fill="currentColor" class="">
                    <use xlink:href="#comm_icon_sort"></use>
                    <!---->
                  </svg>
                </i>
              </div>
            </div>
          </ui-button>
          <div class="popover-content" v-if="isShowMore">
            <div class="content-box">
              <div>提现</div>
              <div>利息宝</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <home-drawer
      ref="drawerRef"
      @close="isShowNav = false"
      :show-down-load="app.isShowDownload"
    />
  </header>
</template>

<style scoped lang="less">
.home-header {
  width: 100%;
  .download-app {
    height: 30px;
    width: 100%;
    background: #282525;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    transition: all 0.3s;
  }
  .header-container {
    height: 45px;
    padding-left: 5px;
    background: #141417;
    border-bottom: 0.5px solid #313843;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      z-index: 2;
      .icon-wrap {
        padding: 0 4px 0 0.5px;
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 18px;
        color: #adb6c3;
        .left-icon {
          transition: all 0.3s;
          transform: rotate(0deg);
        }
        .left-icon-transX {
          transform: rotate(180deg);
        }
      }
      .logo {
        height: 35px;
        max-width: 132px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        img {
          object-fit: contain;
          cursor: pointer;
          max-width: 100%;
          max-height: 100%;
          vertical-align: middle;
        }
      }
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      z-index: 2;
      .un-login {
        display: flex;
        align-items: center;
        --btn-login-background: #f0c059;
        --btn-login-color: #874404;
        --btn-register-background: transparent;
        --btn-register-color: #f0c059;
        --btn-width: 68px;
        --btn-height: 26px;
        --btn-font-size: 11px;
        --btn-border-color: #f0c059;

        .login-btn {
          margin-right: 7.5px;

          width: var(--btn-width);
          height: var(--btn-height);
          padding: 0 5px;
          font-size: var(--btn-font-size);
          white-space: pre-wrap;
          background-color: #f0c059;
          border: thin solid var(--btn-border-color);
          color: #874404;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: contain;
          background-repeat: no-repeat;
          text-align: center;
          word-wrap: break-word;
        }
        .register-btn {
          margin-right: 5px;

          width: var(--btn-width);
          height: var(--btn-height);
          padding: 0 5px;
          font-size: var(--btn-font-size);
          white-space: pre-wrap;
          background-color: var(--btn-register-background);
          border: thin solid var(--btn-border-color);
          color: var(--btn-register-color);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: contain;
          background-repeat: no-repeat;
          text-align: center;
          word-wrap: break-word;
        }
      }
      .wallet {
        height: 20px;
        border: solid 1px #313843;
        border-radius: 9999rem;
        display: flex;
        align-items: center;
        .wallet__currency {
          background-image: url("@/assets/common/img_hb_frame.avif");
          background-size: 100% 100%;
          width: 17px;
          height: 17px;
          display: flex;
          justify-content: center;
          align-items: center;

          .country {
            width: 15px;
            height: 15px;
          }
        }
        .refresh-icon {
          width: 15px;
          height: 15px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          svg {
            width: 15px;
            height: 15px;
          }
        }
        .currency-content-wrap {
          color: #adb6c3;
          display: flex;
          font-size: 12px;
          align-items: center;
          line-height: 100%;
          .count {
            margin-left: 4px;
            border-bottom: solid 1px #ffaa09;
            color: #ffaa09;
            direction: ltr;
            font-size: 12px;
            max-width: 80.5px;
            line-height: 14px;
          }
          .loading-text {
            direction: ltr;
            margin-left: 6.5px;
            margin-right: 6.5px;
            font-size: 9px;
            color: #68707b;
            line-height: 100%;
            margin-top: 1px;
          }
        }

        .animate__spin {
          animation: spin 0.2s linear infinite; /* 2秒一次，匀速，无限循环 */
        }

        @keyframes spin {
          0% {
            transform: rotate(0);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      }
      .menu-button {
        margin-left: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        height: 27px;
        font-family: inherit !important;
        .popover {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 20px !important;
          height: 27px;
          font-size: 8px;
          padding-left: 1px;
          overflow: visible;
          i {
            transition: all 0.3s;
          }

          &::before {
            content: "";
            position: absolute;
            left: 0;
            width: 0.5px;
            height: 12px;
            background-color: #874404;
            transform: scaleX(0.5);
          }
        }

        .popover-content {
          position: absolute;
          background: #1c1e23;
          box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
          //box-shadow: 0 1.5px 3.5px white;
          width: 87px;
          height: 97px;
          right: 0;
          top: 33px;
          color: white;
          border-radius: 7px;
          box-sizing: border-box;
          z-index: 9999999;
          .content-box {
            background: #1c1e23;
            border: solid 1px #313843;
            border-radius: 7.5px;
            padding-top: 7.5px;
            padding-bottom: 7.5px;
            width: 100%;
            height: 100%;
            div {
              width: 100%;
              height: 40px;
              display: flex;
              align-items: center;
              font-size: 12px;
              padding: 0 9.5px;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>
