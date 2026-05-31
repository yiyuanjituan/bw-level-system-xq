<script setup lang="ts">
import { ref } from "vue";
import { padStart } from "lodash-es";
import { showCustomToast } from "@/hooks/useCommon";

const showPopover = ref(false);
const isLoading = ref(false);
const timeCountDown = ref(60 * 1000);

function handleLoading() {
  if (isLoading.value) return;
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: "刷新成功", type: "success" });
  }, 500);
}
</script>

<template>
  <div class="task-container">
    <div class="active-level-box">
      <div class="active-level">
        <div class="caption">
          <span class="captionItem">
            <svg-icon name="comm_icon_shy" class-name="text-[14px]"></svg-icon>
            <span class="ml-[1px]">0</span>
          </span>
          <span class="detail">详情</span>
        </div>
        <div class="active-list-wrap relative">
          <div class="active-list">
            <div class="active-list-item" v-for="i in 4" :key="i">
              <div class="item">
                <x-popover placement="top" v-model:show="showPopover">
                  <template #reference>
                    <div class="image">
                      <img src="@/assets/common/img_rwbx_0.avif" alt="" srcset="" />
                      <span class="progressIndex">1</span>
                    </div>
                  </template>
                  <div class="activityBoxTip">
                    <span class="tip-text">
                      打开后获得<span>58.00</span>-<span>188.00</span>奖金需要<span>1</span>倍流水可提现
                    </span>
                  </div>
                </x-popover>
                <div class="value">
                  <svg-icon name="comm_icon_shy" />
                  <span class="line">-</span>
                  <span>100</span>
                </div>
              </div>
              <div class="process-line">
                <svg-icon name="task-img_dqhydjt" class-name="text-[42px] line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="task-tabs-title">
      <div class="left-main">
        <div class="item-tab"><div class="task-tab-name active-name">新手任务</div></div>
        <div class="item-tab"><div class="task-tab-name">每日任务</div></div>
        <div class="item-tab"><div class="task-tab-name">每周任务</div></div>
      </div>
      <div class="task-extra-button">
        <div class="refresh-box" @click="handleLoading">
          <svg-icon name="comm_icon_retry" class-name="" :class="{ loading: isLoading }" />
          <span class="event-refresh-btn-text">刷新</span>
        </div>
      </div>
    </div>
    <div class="active-receive-box">
      <div class="active-receive-left">
        <img src="/siteadmin/skin/lobby_asset/web/task/img_rw_mrrw.avif" alt="" srcset="" class="icon-box" />
        <van-count-down :time="timeCountDown">
          <template #default="timeData">
            <span class="block">{{ padStart(String(timeData.hours), 2, "0") }}</span>
            <span class="colon">:</span>
            <span class="block">{{ padStart(String(timeData.minutes), 2, "0") }}</span>
            <span class="colon">:</span>
            <span class="block">{{ padStart(String(timeData.seconds), 2, "0") }}</span>
          </template>
        </van-count-down>
        <span>后重置</span>
      </div>
      <div class="active-receive-right">
        <svg-icon name="task-comm_icon_order" class-name="text-[18px] main-text" />
      </div>
    </div>
    <div class="task-content-box">
      <div class="card-layout">
        <div class="card-layout-inner">
          <div class="flex card-top">
            <div class="instruction-info">
              <div class="instruction-base-info">
                <div class="description-primary">淡淡的</div>
                <div class="more-limit">
                  <span class="text">
                    <span class="text-inner">就会顺顺的</span>
                  </span>
                  <span class="btn-more">详情</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="card-bottom-box">
              <div class="card-left-box">
                <div class="card-left-inner">
                  <div class="bottom-slot">
                    <div class="icon-wrap">
                      <span class="category-icon-text">
                        <img src="/siteadmin/active/rmb.svg" alt="" srcset="" />
                        <span class="category-text">8.88</span>
                      </span>
                    </div>
                    <div class="icon-wrap">
                      <span class="category-icon-text tili">
                        <svg-icon name="comm_icon_shy" class-name="text-[18px]"></svg-icon>
                        <span class="category-text">8.88</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-right-box">
                <div class="card-right-box-inner">
                  <x-button class="!w-[75px] !h-[30px] text-[11px]">邀&nbsp;请</x-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.task-container {
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  .active-level-box {
    padding: 10px 10px 0;
    z-index: 3;
    .active-level {
      background-color: var(--skin__bg_2);
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
      .caption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        padding-bottom: 5px;
        margin: 0 10px 2.5px;
        color: var(--skin__lead);
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        .captionItem {
          white-space: nowrap;
          display: flex;
          align-items: center;
          color: var(--skin__accent_1);
        }
        .detail {
          margin-left: 2.5px;
          font-size: 12px;
          color: var(--skin__primary);
          font-weight: 400;
          cursor: pointer;
        }
      }
      .active-list-wrap {
        .active-list {
          scrollbar-color: var(--skin__border) transparent;
          scrollbar-width: thin;
          position: relative;
          z-index: 100;
          display: flex;
          margin-bottom: 0;
          margin-left: 15px;
          padding-top: 4px;
          .active-list-item {
            display: contents;
            .item {
              flex-shrink: 0;
              width: 50px;
              .image {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 50px;
                background-color: var(--skin__bg_2);
                border: var(--lobby__px) solid var(--skin__border);
                border-radius: 50%;
                img {
                  width: 50px;
                  height: 44px;
                }
                .progressIndex {
                  position: absolute;
                  bottom: 9px;
                  font-size: 10px;
                  color: #fff;
                }
              }
              .value {
                color: var(--skin__neutral_2);
                display: flex;
                align-items: center;
                justify-content: center;
                width: 38px;
                height: 11px;
                font-size: 10px;
                line-height: 10px;
                text-align: center;
                background-color: var(--skin__bg_2);
                border: var(--lobby__px) solid var(--skin__border);
                border-radius: 5.5px;
                margin: 7.5px auto;
                .line {
                  margin: 0 1.5px;
                }
              }
            }
            .process-line {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              width: 41.5px;
              height: 7px;
              margin-top: 23px;
              .line {
                color: var(--skin__neutral_3);
              }
            }
            &:last-child {
              .process-line {
                display: none;
              }
            }
          }
        }
      }
    }
    .activityBoxTip {
      padding: 3.75px 8px;
      color: var(--skin__neutral_2);
      font-size: 10px;
      text-align: center;
      background-color: var(--skin__bg_2);
      border: var(--lobby__px) solid var(--skin__border);
      border-radius: 2.5px;
      box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
      background: var(--skin__bg_2);
      max-width: 200px;
      .tip-text {
        color: var(--skin__neutral_1);
        font-size: 10px;
        line-height: 15px;
        span {
          color: var(--skin__accent_3);
        }
      }
    }
  }
  .task-tabs-title {
    width: 100%;
    min-height: 46px;
    overflow: visible;
    height: 26px;
    padding: 0 10px 10px;
    display: flex;
    flex-direction: row;
    .left-main {
      overflow-x: scroll;
      overflow-y: hidden;
      flex: 1;
      padding-bottom: 0;
      padding-top: 10px;
      height: 36px;
      display: flex;
      margin-right: 20px;

      .item-tab {
        display: flex;
        align-items: center;
        border-radius: 15px;
        overflow: hidden;
        height: 26px;
        padding: 0;
        margin-right: 10px;
        border: var(--lobby__px) solid var(--skin__border);
        background-color: var(--skin__bg_2);
        color: var(--skin__neutral_1);
        flex: none;
        width: 65px;

        .task-tab-name {
          font-size: 12px;
          color: var(--skin__text_primary);
          font-weight: 600;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 7.5px;
          z-index: 6;
          flex: none;
          white-space: nowrap;
        }
        .active-name {
          background: linear-gradient(rgb(255, 253, 91) 0%, rgb(223, 190, 91) 100%) !important;
        }
      }
    }
    .task-extra-button {
      min-height: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      font-size: 12px;
      color: var(--skin__primary);
      .refresh-box {
        font-size: 14px;
        display: flex;
        cursor: pointer;
        align-items: center;

        .event-refresh-btn-text {
          font-size: 12px;
          margin-left: 4px;
          min-width: 35px;
          line-height: 1.2;
          margin-top: 2px;
        }
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
  .active-receive-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 10px 10px;
    .active-receive-left {
      display: flex;
      align-items: center;
      font-size: 10px;
      .icon-box {
        width: 45px;
        height: 36px;
        padding: 0 3px;
        margin-right: 3px;
      }
      :deep(.van-count-down) {
        font-size: 10px;
        color: var(--skin__lead);
        flex-wrap: wrap;
        background: transparent !important;
        .block {
          display: inline-block;
          margin: 0 4px;
          padding: 0 2px;
          height: 17px;
          min-width: 17px;
          font-size: 12px;
          text-align: center;
          line-height: 17px;
          border-radius: 2.5px;
          font-weight: 700;
          color: var(--skin__label_text_accent3);
          background-color: var(--skin__accent_3) !important;
        }
      }
    }
    .active-receive-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  .task-content-box {
    flex: 1;
    height: 0;
    overflow: auto;
    .card-layout {
      display: flex;
      margin-top: 10px;
      overflow: hidden;
      background-color: var(--skin__bg_2);
      border-radius: 7px;
      box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
      min-height: 67px;
      margin-left: 10px;
      margin-right: 10px;
      &:first-child {
        margin-top: 0;
      }
      .card-layout-inner {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: 100%;
        word-break: normal;
        .instruction-info {
          width: 100%;
          display: flex;
          min-height: 23px;
          flex-direction: row;
          padding: 0 10px;
          background-color: color-mix(in srgb, var(--skin__accent_3) 8%, transparent);
          .instruction-base-info {
            display: flex;
            flex-grow: 1;
            width: 100%;
            min-height: 23px;
            line-height: 23px;
            align-items: center;
            .description-primary {
              color: var(--skin__lead);
              font-size: 12px;
              flex-shrink: 0;
              margin-right: 5px;
              max-width: 300px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .more-limit {
              display: flex;
              align-items: center;
              font-size: 12px;
              .text {
                color: var(--skin__neutral_2);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              .btn-more {
                display: block;
                flex-shrink: 0;
                color: var(--skin__primary);
                cursor: pointer;
                margin-left: 2.5px;
              }
            }
          }
        }
        .card-bottom {
          display: flex;
          height: auto;
          width: 100%;
          flex: 1;
          .card-bottom-box {
            display: flex;
            width: 100%;
            align-items: center;
            padding: 5px 10px;
            .card-left-box {
              display: flex;
              width: 100%;
              flex: 1;
              max-width: calc(100% - 75px);
              .card-left-inner {
                display: flex;
                flex-direction: row;
                height: 100%;
                width: 100%;
                justify-content: space-between;
                align-items: center;
                .bottom-slot {
                  display: flex;
                  flex-direction: row;
                  align-items: flex-start;
                  justify-content: flex-start;
                  .icon-wrap {
                    width: 60px;
                    margin-right: 2.5px;
                    text-align: center;
                    padding-top: 2px;
                    .category-icon-text {
                      display: inline-flex;
                      align-items: center;
                      vertical-align: middle;
                      flex-direction: column;
                      img {
                        width: 18px;
                        height: 18px;
                      }
                    }
                    .tili {
                      color: var(--skin__accent_1);
                      .category-text {
                        color: var(--skin__accent_1);
                      }
                    }
                    .category-text {
                      font-size: 11px;
                      max-width: 75px;
                      word-break: break-all;
                      white-space: normal;
                      text-align: center;
                      display: -webkit-box;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      vertical-align: middle;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      margin-top: 4px;
                      color: var(--skin__accent_3);
                    }
                  }
                }
              }
            }
            .card-right-box {
              width: 75px;
              height: 30px;
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
