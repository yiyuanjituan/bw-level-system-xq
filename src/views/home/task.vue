<script setup lang="ts">
import { ref } from "vue";

const showPopover = ref(false);
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
        <div class="refresh-box">
          <svg-icon name="comm_icon_retry" class-name="" />
          <span class="event-refresh-btn-text">刷新</span>
        </div>
      </div>
    </div>
    这是任务
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

        .event-refresh-btn-text {
          font-size: 12px;
          margin-left: 2.5px;
          min-width: 35px;
          line-height: 1.2;
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
}
</style>
