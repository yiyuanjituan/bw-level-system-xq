<script setup lang="ts">
import { onMounted, ref } from "vue";
import { showCustomToast } from "@/hooks/useCommon";
import UiButton from "@/components/Common/Button.vue";
import UpLevelGift from "@/components/Vip/UpLevelGift.vue";
import UpLevelWeek from "@/components/Vip/UpLevelWeek.vue";
import router from "@/router";
import LevelList from "@/components/Vip/LevelList.vue";
import { service } from "@/api/service";

const isLoading = ref(false);

function handleLoading() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: "刷新成功", type: "success" });
  }, 500);
}

function jumpToRecord() {
  router.push("/home/records");
}
</script>

<template>
  <div class="vip-container">
    <div class="main-box">
      <div class="vip-swiper">
        <img src="/siteadmin/active/img_vip_card_bg.avif" alt="" srcset="" class="bg-box" />
        <span class="vip-current-level">当前等级</span>
        <div class="vip-info-wrapper">
          <div class="vip-info">
            <div class="vip-level">
              <span class="vip-level-x">VIP 1</span>
              <span class="vip-level-up"> 去升级<svg-icon name="arrow-back" class-name="ml-[1px] text-[7px] rotate-[180deg]" /> </span>
            </div>
            <div class="item-progress">
              <div class="line">
                <div class="fill-box" style="width: 45%">
                  <span class="percent">45%</span>
                </div>
              </div>
              <div class="next">VIP 2</div>
            </div>
            <div class="item-text">
              <div class="text">还需投注<b>5,403.94</b></div>
            </div>
          </div>
          <div class="level-box">
            <div class="level-box-img">
              <img src="/siteadmin/active/color1.avif" alt="" srcset="" class="icon-img" />
              <img src="/siteadmin/active/img_dj1.avif" alt="" srcset="" class="icon-img" />
              <div class="level-text">
                <span data-text="1">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-[100%] mt-[10px] flex flex-col bg2">
        <div class="title-box">
          <svg-icon name="common-event-icon_vip_ms2" class-name="text-[21px] icon-box" />
          <span class="title-text">VIP奖励列表</span>
          <svg-icon name="common-event-icon_vip_ms2" class-name="text-[21px] icon-box scale-x-[-1]" />
        </div>
        <div class="tab-list flex-1 overflow-auto">
          <x-tabs line-width="50px" line-height="3px">
            <x-tab title="VIP奖励">
              <div class="absolute top-0 bottom-0 overflow-auto w-full">
                <level-list />
              </div>
            </x-tab>
            <x-tab title="规则说明">
              <div class="absolute top-0 bottom-0 overflow-auto left-0 w-full">
                <vip-level-rule />
              </div>
            </x-tab>
          </x-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.bg2 {
  background: var(--skin__bg_2);
  .tab-list {
    display: flex;
    flex-direction: column;
    :deep(.x-tabs) {
      flex: 1;
    }
    :deep(.x-tabs__content) {
      height: 100%;
    }
    :deep(.x-tab__panel),
    :deep(.x-tab__panel-inner) {
      height: 100%;
      position: relative;
    }
  }
}
.vip-container {
  background: var(--skin__bg_1);
  display: flex;
  flex-direction: column;
  :deep(.x-tabs__wrap) {
    padding-bottom: 7.5px;
    box-sizing: border-box;
    position: sticky;
    top: 0;
    background: var(--skin__bg_2);
    z-index: 99999;
  }
  :deep(.x-tabs__nav) {
    height: calc(39px - 7.5px);
  }
  .vip-swiper {
    width: 355px;
    margin-top: 10px;
    border-radius: 8px;
    position: relative;
    margin-left: 10px;
    height: 110px;
    .bg-box {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    .vip-current-level {
      position: absolute;
      top: 1px;
      left: 1px;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 16.5px;
      padding: 0 5px;
      color: #4f679d;
      font-size: 10px;
      background-color: #c8c9c9;
      border-radius: 10px 0 8px;
    }
    .vip-info-wrapper {
      position: relative;
      height: 100%;
      .vip-info {
        padding: 20px 10px 10px 13.5px;
        font-size: 10px;
        .vip-level {
          display: flex;
          align-items: center;
          height: 35px;
          margin-left: -3.5px;
          .vip-level-x {
            font-size: 35px;
            text-align: left;
            font-weight: 700;
            font-family: Arial;
            font-style: italic;
            color: #4f679d;
          }
          .vip-level-up {
            display: flex;
            align-items: center;
            margin-left: 8px;
            padding: 3px 4px;
            font-size: 9px;
            color: #4f679d;
            background-color: #fff;
            border-radius: 10px;
            cursor: pointer;
          }
        }
        .item-progress {
          display: flex;
          align-items: center;
          height: 15px;
          .line {
            width: 150px;
            height: 8px;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.08);
            overflow: hidden;
            .fill-box {
              position: relative;
              min-width: 19px;
              height: 100%;
              border-radius: 4px;
              background-color: #4f679d;
              box-shadow: 0 2px 3px rgba(255, 255, 255, 0.1) inset;
              transition: width 0.3s ease;
              .percent {
                position: absolute;
                right: 3px;
                top: 55%;
                transform: translateY(-50%);
                font-size: 8px;
                color: #fff;
                line-height: 1;
                font-weight: 600;
              }
            }
          }
          .next {
            flex-shrink: 0;
            margin-left: 6px;
            font-family: Arial;
            font-size: 14px;
            font-style: italic;
            font-weight: 700;
            color: #4f679d;
          }
        }
        .item-text {
          width: calc(100% - 70px);
          min-height: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 11px;
          line-height: 14px;
          color: #4f679d;
          .text {
            margin-top: 2px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
      .level-box {
        position: absolute;
        top: 15px;
        right: 17px;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        .level-box-img {
          width: 80px;
          height: 80px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          .icon-img {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          .level-text {
            color: transparent;
            font-size: 12px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            zoom: 1;
            width: 50%;
            text-align: center;
            font-weight: 700;
            text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.4);
            direction: ltr;
            span {
              position: relative;
              display: inline-block;
              width: 1ch;
              font-size: 24px;
              &::before {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 0;
                width: 100%;
                height: 100%;
                text-shadow: none;
                background-image: linear-gradient(to bottom, #f7ea94, #e5b952 51%, #ce9510);
                background-size: cover;
                background-clip: text;
                -webkit-background-clip: text;
                background-origin: content-box;
                clip-path: inset(0.5px);
                background-repeat: no-repeat;
                content: attr(data-text);
              }
            }
          }
        }
      }
    }
  }
  .main-box {
    height: 100%;
    padding-bottom: 10px;
    overflow: auto;
    .title-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--skin__lead);
        line-height: 1.4;
      }
      .icon-box {
        color: var(--skin__neutral_2);
      }
    }
  }
}
</style>
