<script setup lang="ts">
import { ref } from "vue";
import { showCustomToast } from "@/hooks/useCommon";
import UiButton from "@/components/Common/Button.vue";
import UpLevelGift from "@/components/Vip/UpLevelGift.vue";
import UpLevelWeek from "@/components/Vip/UpLevelWeek.vue";
import router from "@/router";

const isLoading = ref(false);

function handleLoading() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: '刷新成功', type: 'success' })
  }, 500)
}

function jumpToRecord() {
  router.push('/home/records')
}

</script>

<template>
  <div class="vip-container">
    <div class="progress-box">
      <div class="inner-box">
        <span class="tips">当前等级</span>
        <div class="level-image">
          <img src="/siteadmin/active/color1.avif" alt="." class="icon-img">
          <img src="/siteadmin/active/img_dj1.avif" alt="." class="icon-img">
          <div class="level-text" style="--vip-level-scale: 1;">
            <span data-text="2">2</span>
          </div>
        </div>
        <div class="progress-content">
          <div class="content-need">
            <div class="prefix">距离<i class="vip">VIP 2</i></div>
            <div class="amount">
              <span>还需投注</span>
              <strong class="strong-amount">5,409.14</strong>
              <div class="loading-icon" @click="handleLoading">
                <svg-icon name="comm_icon_retry" class-name="text-[#DFBE5B]" :class="{ loading: isLoading }" />
              </div>
            </div>
          </div>
          <div class="receive-all">
            <ui-button class="receive-btn mb-[10px] !bg-[#999]">一键领取</ui-button>
            <ui-button class="receive-btn !bg-[#DFBE5B]" @click="jumpToRecord">领取记录</ui-button>
          </div>
        </div>
      </div>
    </div>
    <div class="sub-title"><p>VIP等级对照表</p></div>
    <van-tabs shrink animated swipeable>
      <van-tab title="晋级奖金">
        <UpLevelGift />
      </van-tab>
      <van-tab title="周俸禄">
        <UpLevelWeek />
      </van-tab>
      <van-tab title="VIP特权">
        <VipLevelPower />
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped lang="less">
.vip-container {
  background: #000;
  display: flex;
  flex-direction: column;

  .progress-box {
    height: 90px;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    .inner-box {
      background-color: #191919;
      box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.06);
      border-radius: 6px;
      min-height: 80px;
      padding: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;

      .tips {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 16.5px;
        line-height: 16.5px;
        padding: 0 5px;
        color: #fff;
        font-size: 9px;
        background-color: #F84673;
        border-radius: 8px 0;
      }
      .level-image {
        width: 50px;
        height: 50px;
        margin: 10px 10px 0 0;
        position: relative;

        .icon-img {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .level-text {
          font-size: 12px;
          color: transparent;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          zoom: var(--vip-level-scale, 1);
          width: 50%;
          text-align: center;
          font-weight: 700;
          text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.4);
          direction: ltr;

          span {
            position: relative;
            display: inline-block;
            width: 1ch;
            &::before {
              content: attr(data-text);
              background-origin: content-box;
              clip-path: inset(0.5px);
              background-repeat: no-repeat;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 0;
              width: 100%;
              height: 100%;
              text-shadow: none;
              background-image: linear-gradient(to bottom, #f7ea94, #e5b952 51%, #ce9510);
              background-size: cover;
              -webkit-background-clip: text;
            }
          }
        }
      }
    }
  }

  .progress-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    .content-need {
      margin-bottom: 0;
      padding-top: 10px;
      font-size: 12px;
      color: #656565;
      text-align: left;
      .prefix {
        margin-bottom: 5px;
        .vip {
          margin: 0 2.5px;
          color: #F84673;
          font-weight: 700;
        }
      }
      .amount {
        font-size: 12px;
        color: #656565;
        display: flex;
        align-items: center;

        .strong-amount {
          margin-left: 5px;
          color: white;
        }
        .loading-icon {
          margin-left: 5px;
          .loading {
            animation: loading-icon 0.5s ease-in-out infinite;
          }
          @keyframes loading-icon {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        }
      }
    }
    .receive-all {
      .receive-btn {
        width: 60px;
        height: 25px;
        margin-right: 0;
        border-radius: 4px;
        border-color: transparent;

        :deep(.ui-button__text) {
          white-space: nowrap;
          font-size: 10px;
          color: white;
        }
      }
    }
  }

  .sub-title {
    margin: 25px 10px 0;
    color: #FFFFFF;
    font-size: 15px;
    text-align: center;
    line-height: 1.6;
  }
  :deep(.van-tabs) {
    --van-padding-xs: 0px;
    --van-tabs-nav-background: transparent;
    --van-tab-text-color: white;
    --van-tab-active-text-color: var(--van-tabs-bottom-bar-color);
    --van-font-bold: normal;
    --van-tabs-line-height: 45px;
    --van-tabs-bottom-bar-height: 2px;
    //--van-tabs-bottom-bar-width: 48px;

    height: 100%;

    .van-tab {
      --van-padding-xs: 15px;
      font-size: 12px;
      padding-top: 10px;
    }

    .van-tabs__content {
      height: calc(100% - 45px);
      .van-tab__panel {
        height: 100%;
      }
    }
  }
}
</style>