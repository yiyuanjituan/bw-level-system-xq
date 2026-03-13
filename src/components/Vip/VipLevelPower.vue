<script setup lang="ts">

import UiButton from "@/components/Common/Button.vue";
</script>

<template>
  <div class="up-level-box">
    <div class="absolute top-0 left-0 w-full">
      <div class="level-box">
        <div class="sticky-box">
          <div class="table-th w-[65px] flex-none">等级</div>
          <div class="table-th flex-1">每日提现总额<div class="unmetTips">上限</div></div>
          <div class="table-th flex-1">每日提现次数<div class="unmetTips">上限</div></div>
          <div class="table-th flex-1">每日免手续费<div class="unmetTips">笔数</div></div>
        </div>
        <div class="vip_list">
          <div class="cell-box" v-for="i in 20">
            <div class="cell-item">
              <div class="level-image">
                <img src="/siteadmin/active/color1.avif" alt="." class="icon-img">
                <img src="/siteadmin/active/img_dj1.avif" alt="." class="icon-img">
                <div class="level-text" style="--vip-level-scale: 1;">
                  <span data-text="2">2</span>
                </div>
              </div>
            </div>
            <div class="cell-item !w-[103px]">
              <div class="row-content">
                <div class="currency-amount">不限制</div>
              </div>
            </div>
            <div class="cell-item !w-[103px]">
              <div class="row-content">
                <div class="currency-amount text-[#FFAA09]">不限制</div>
              </div>
            </div>
            <div class="cell-item !w-[103px]">
              <div class="row-content">
                <div class="currency-amount">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <VipLevelRule />
    </div>
  </div>
</template>

<style scoped lang="less">
.up-level-box {
  position: relative;
  height: 100%;
  overflow: auto;

  .sticky-box {
    position: sticky;
    top: 0;
    background: #191919;
    border: 1px solid #242424;
    min-height: 50px;
    display: flex;
    align-items: center;
    z-index: 100;

    .table-th {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 12px;
      color: white;
      line-height: 15px;
      word-break: break-word;
      .tooltip {
        min-width: 12px;
        font-size: 9px;
        margin-left: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #DFBE5B;
        color: white;
      }
      .unmetTips {
        margin-top: 2.5px;
        color: #656565;
        font-size: 9px;
        line-height: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .vip_list {
    .cell-box {
      position: relative;
      border-radius: 0;
      min-height: 50px;
      overflow: hidden;
      background: #191919;
      display: flex;
      align-items: center;
      text-align: center;
      font-size: 10px;
      line-height: 1.5;
      &:nth-child(odd) {
        background-color: #000000;
      }
      .cell-item {
        display: flex;
        justify-content: center;
        width: 65px;
        padding: 2px;
        font-size: 11px;
        .level-image {
          width: 35px;
          height: 35px;
          position: relative;
          .icon-img {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            font-size: 0;
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

        .row-content {
          width: 100%;
          .currency-amount {
            font-size: 11px;
            color: #BCBCBC;
            text-align: center;
          }
        }
        :deep(.ui-button) {
          width: 75px;
          height: 30px;
          margin-right: 0;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>