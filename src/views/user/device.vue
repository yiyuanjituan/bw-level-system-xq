<script setup lang="ts">
import useAppStore from '@/store/modules/app';
import useAuthStore from '@/store/modules/user';

const app = useAppStore();
const auth = useAuthStore();
</script>

<template>
  <div class="device-container">
    <sub-navbar title="登录设备" />
    <div class="main">
      <div class="user-and-siteInfo">
        <div class="container">
          <div class="logo-box">
            <img :src="app.appInfo.logo" alt="" srcset="" class="logo-img" />
          </div>
          <div class="separate"></div>
          <div class="userInfo">
            <p>
              <span class="title">ID:</span><span class="content">{{ auth.user?.unionid }}</span
              ><span class="copy-box"><copy :text="auth.user?.unionid" /></span>
            </p>
            <p class="account">
              <span class="title">账号:</span><span class="content">{{ auth.user?.account }}</span>
            </p>
          </div>
          <img src="@/assets/common/comm_logo_bg2.avif" alt="" srcset="" class="bg" />
        </div>
        <div class="splitLine"></div>
        <div class="sec-container">
          <div class="titleWrap">自动退出登录<span>(闲置时长)</span></div>
          <div class="selectWrap">
            <span>1年</span>
            <span class="arrow-icon">
              <svg-icon name="arrow-back" />
            </span>
          </div>
        </div>
      </div>
      <div class="device-list">
        <div class="currentDevice" v-if="false"></div>
        <div class="historyDevice" v-for="i in 8" :key="i">
          <div class="deviceTitle">
            <div class="leftWrap">
              <svg-icon name="icon_dlsb_sj" class-name="picBg" />
              <div class="text-[13px]">当前设备</div>
              <div class="currentBg">
                <svg-icon name="comm_icon_gou" class-name="!text-[9px]" />
              </div>
            </div>
          </div>
          <div class="device-content-wrapper">
            <div class="info-list">
              <div class="info-item">
                <p class="infoLabel">客户端</p>
                <p class="infoValue">H5(7.3.112)</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">浏览器类型</p>
                <p class="infoValue">Mobile Safari v18.5</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">操作系统</p>
                <p class="infoValue">Windows</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">系统版本</p>
                <p class="infoValue">Windows 10</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">设备品牌</p>
                <p class="infoValue">未知</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">设备型号</p>
                <p class="infoValue">Chrome v146.0.0.0</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">IP地区</p>
                <p class="infoValue">103.129.54.82 Hong Kong/North District-Sheung Shui</p>
              </div>
              <div class="info-item">
                <p class="infoLabel">登录时间</p>
                <p class="infoValue">2026/03/16 10:11:50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="saveImgBtn">
        <x-button type="primary" class="!w-[100%]">保存图片</x-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.device-container {
  display: flex;
  flex-direction: column;
  color: var(--skin__lead);
  .main {
    flex: 1;
    overflow: auto;
    height: 0;
    .sticky-box {
      position: sticky;
      top: 0;
    }
    .user-and-siteInfo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      .container {
        min-width: 240px;
        height: 56.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row nowrap;
        background-color: var(--skin__bg_2);
        width: 100%;
        position: relative;
        padding: 10px 0;
        .logo-box {
          height: 100%;
          display: flex !important;
          align-items: center;
          justify-content: center;
          .logo-img {
            max-width: 115px;
            object-fit: contain;
            cursor: pointer;
            max-height: 100%;
            vertical-align: middle;
          }
        }
        .separate {
          height: 22px;
          width: 1px;
          background-color: var(--skin__border);
          margin: 0 15px;
          flex-shrink: 0;
        }
        .userInfo {
          font-size: 12px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          p {
            &:first-child {
              padding-bottom: 5px;
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
            }
          }
          .title {
            padding-right: 5px;
            color: var(--skin__neutral_2);
          }
          .content {
            color: var(--skin_lead);
          }
          .copy-box {
            padding-left: 5px;
            font-size: 15px;
            width: 15px;
            height: 15px;
            margin-top: -1.5px;
            color: var(--skin_primary);
          }
        }
        .bg {
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          max-width: 100% !important;
        }
      }
      .sec-container {
        height: 45px;
        width: 100%;
        background-color: var(--skin__bg_2);
        display: flex;
        align-items: center;
        padding: 12px 10px;
        font-size: 13px;
        justify-content: space-between;

        .titleWrap {
          color: var(--skin__lead);
          span {
            color: var(--skin__neutral_2);
          }
        }
        .selectWrap {
          color: var(--skin__primary);
          display: flex;
          align-items: center;
          line-height: 1;
          .arrow-icon {
            margin-left: 1px;
            color: var(--skin__neutral_2);
            font-size: 12px;
            transform: rotate(180deg);
            margin-bottom: -1px;
          }
        }
      }
      .splitLine {
        border-bottom: 0.5px solid var(--skin__border);
        width: 100%;
        height: 0.5px;
      }
    }
    .device-list {
      padding: 10px 10px 65px;
      height: calc(100% - 145px);
      overflow-y: auto;
      .currentDevice,
      .historyDevice {
        width: 100%;
        margin-bottom: 10px;
        background-color: var(--skin__bg_2);
        box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
        border-radius: 7px;
        .deviceTitle {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          min-height: 45px;
          padding: 0 10px 0 8px;
          color: var(--skin__lead);
          font-size: 12px;
          line-height: 1.8;
          text-align: left;
          .leftWrap {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            height: 100%;
            line-height: 1;
            .picBg {
              color: var(--skin__primary);
              font-size: 18px;
              padding-bottom: 2px;
              padding-right: 2.5px;
            }
            .currentBg {
              background-color: var(--skin__accent_1);
              color: #fff;
              width: 14px;
              height: 14px;
              border-radius: 14px;
              margin-left: 2.5px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
        .device-content-wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          padding: 10px;
          border-top: var(--lobby__px) solid var(--skin__border);
          .info-list {
            width: 100%;
            .info-item {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              width: 100%;
              margin-bottom: 12.5px;
              font-size: 13px;
              .infoLabel {
                width: 150px;
                margin-right: 20px;
                color: var(--skin__neutral_2);
                text-align: left;
                box-sizing: content-box;
                display: -webkit-box;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                word-break: break-all;
              }
              .infoValue {
                word-break: break-all;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                width: 165px;
                text-align: right;
                color: var(--skin__lead);
                display: flex;
                justify-content: flex-end;
              }
            }
          }
        }
      }
    }
    .saveImgBtn {
      position: absolute;
      bottom: 0;
      left: auto;
      width: 100%;
      padding: 10px 10px 20px;
      background-color: var(--skin__bg_2);
      box-shadow: 0 -1.5px 5px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
  }
}
</style>
