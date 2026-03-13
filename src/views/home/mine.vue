<script setup lang="ts">
import { handleBack } from "@/utils/common";
import UiBadge from "@/components/UI/badge.vue";
import useAuthStore from "@/store/modules/user";
import useAppStore from "@/store/modules/app";
import { showCustomToast } from "@/hooks/useCommon";
import router from "@/router";

const auth = useAuthStore();
const app = useAppStore();

function handleWithdraw() {
  if (!auth.user.hasPayPassword) {
    router.push("/home/security");
    return showCustomToast({
      type: "warning",
      message: "为了资金安全，需先设置提现密码哦！"
    });
  } else {
    router.push("/home/withdraw");
  }
}
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
      <div class="top-body">
        <div class="bgGradient"></div>
        <div class="row-user-card">
          <div class="user-card">
            <div class="float-message">
              <div />
              <header v-if="auth.token">
                <div class="btn-container">
                  <div class="w-[24px] h-[24px] text-[24px]">
                    <svg-icon name="top_kf" class="absolute text-[#68707B]" />
                    <svg-icon name="top_kf2" class="absolute text-[#F0C059]" />
                  </div>
                </div>
                <ui-badge :content="999" :size="[2, -2]">
                  <div class="btn-container">
                    <div class="w-[24px] h-[24px] text-[24px]">
                      <svg-icon name="top_xx" class="absolute text-[#68707B]" />
                      <svg-icon
                        name="top_xx2"
                        class="absolute text-[#F0C059]"
                      />
                    </div>
                  </div>
                </ui-badge>
              </header>
              <header v-if="!auth.token" class="h-[24px]" />
            </div>
            <mine-card v-if="auth.token" />
            <mine-login v-if="!auth.token" />
          </div>
          <div class="nav-card">
            <div class="nav-item" @click="handleWithdraw">
              <div class="icon">
                <svg-icon name="style_2_icon_mid_tx" class="svg-icon" />
                <svg-icon
                  name="style_2_icon_mid_tx2"
                  class="svg-icon text-[#04BE02]"
                />
              </div>
              <div class="label">提现</div>
            </div>
            <div class="nav-item">
              <div class="icon">
                <picture>
                  <source
                    srcset="@/assets/mine/gif_profile_style2.avif"
                    type="image/avif"
                    class="svg-icon"
                  />
                  <source
                    srcset="@/assets/mine/gif_profile_style2.avif"
                    type="image/png"
                    class="svg-icon"
                  />
                  <img
                    src="@/assets/mine/gif_profile_style2.avif"
                    alt="Description"
                    class="svg-icon"
                  />
                </picture>
              </div>
              <div class="label">存款</div>
            </div>
            <div class="nav-item">
              <ui-badge content="80%">
                <div class="icon">
                  <svg-icon name="style_2_icon_mid_lxb" class="svg-icon" />
                  <svg-icon
                    name="style_2_icon_mid_lxb2"
                    class="svg-icon text-[#EA4E3D]"
                  />
                </div>
              </ui-badge>
              <div class="label">利息宝</div>
            </div>
          </div>
        </div>
      </div>
      <mine-banner />
      <mine-grid />
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-container {
  color: white;
  overflow: auto;
  .back-icon {
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
        .nav-card {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-around;
          margin-top: 25px;
          padding: 0 10px;
          .nav-item {
            position: relative;
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            font-size: 14px;
            width: 72px;
            color: white;
            cursor: pointer;
            .icon {
              width: 32px;
              min-height: 32px;
              position: relative;
              display: flex;
              align-items: center;
              .svg-icon {
                position: absolute;
                bottom: 0;
                font-size: 32px;
              }
            }
            .label {
              text-align: center;
              padding-top: 2.5px;
              color: #adb6c3;
              word-break: break-word;
              height: 35px;
              line-height: 17.5px;
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              vertical-align: middle;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
          }
        }
      }
    }
  }
}
</style>
