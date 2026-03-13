<script setup lang="ts">
import UiBadge from "@/components/UI/badge.vue";
import { showCustomToast } from "@/hooks/useCommon";
import useAppStore from "@/store/modules/app";
import UiRadiusSelect from "@/components/UI/radius-select.vue";
import { ref } from "vue";
import dayjs from "dayjs";
import UiEmpty from "@/components/UI/empty.vue";

const app = useAppStore();

function showSuccess() {
  setTimeout(() => {
    showCustomToast({ message: "刷新成功", type: "success" });
  }, 1000);
}

const dayOptions = ref([
  {
    label: "今日",
    start_time: dayjs().startOf("day").unix(),
    end_time: dayjs().endOf("day").unix()
  },
  {
    label: "昨日",
    start_time: dayjs().startOf("day").subtract(1, "day").unix(),
    end_time: dayjs().endOf("day").subtract(1, "day").unix()
  },
  {
    label: "本周",
    start_time: dayjs().startOf("isoWeek").unix(),
    end_time: dayjs().endOf("isoWeek").unix()
  },
  {
    label: "上周",
    start_time: dayjs().startOf("isoWeek").subtract(7, "day").unix(),
    end_time: dayjs().endOf("isoWeek").subtract(7, "day").unix()
  },
  {
    label: "本月",
    start_time: dayjs().startOf("month").unix(),
    end_time: dayjs().endOf("month").unix()
  },
  {
    label: "上月",
    start_time: dayjs().startOf("month").subtract(1, "month").unix(),
    end_time: dayjs().endOf("month").subtract(1, "month").unix()
  }
]);
// 状态提醒
const statusOptions = ref([
  { label: "全部", value: 0 },
  { label: "转入", value: 1 },
  { label: "转出", value: 2 },
  { label: "领取收入", value: 3 },
  { label: "系统转出", value: 4 }
]);
const daySelectIndex = ref(0);
const statusSelectIndex = ref(0);

function showTip() {
  showCustomToast({ message: '利息宝暂未开放', type: 'fail' })
}

</script>

<template>
  <div class="base-layout">
    <div class="info-box">
      <div class="info-item">
        <div class="principalWrapper">
          <span class="label">已存入</span>
          <ui-badge content="年利率88%" :size="[-6, -10]">0.00</ui-badge>
        </div>
        <div class="mobileButtonLine">
          <van-button type="warning" @click="showTip">转 入</van-button>
          <van-button class="info-btn">转 出</van-button>
        </div>
      </div>
      <div class="info-item mt-[5px]">
        <div class="curIncomeWrapper">
          <div class="curIncomeItem">
            <div>
              结算周期 <span class="text-white">1小时</span> (封顶
              <span class="text-white">不限制</span>)
            </div>
          </div>
          <div class="curIncomeItem !mb-[0px]">
            <div class="mg">
              待领取<span class="strong">0.000000</span>（已领取0.00）
              <svg-icon
                name="refresh"
                class-name="text-[#DFBE5B]"
                @click="showSuccess"
              />
            </div>
          </div>
        </div>
        <div class="receive-btn my-auto">
          <van-button class="info-btn">领 取</van-button>
        </div>
      </div>
    </div>
    <div class="container-tab-page">
      <van-tabs shrink class="tabs-component">
        <van-tab title="利息规则" class="ml-0 h-[100%]">
          <div class="radius-box">
            <div class="inner-box">
              <div class="absolute top-0">
                <div
                  class="rule"
                  v-html="app.appInfo.yuebao || '后台暂未配置文案'"
                ></div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="记录明细" class="ml-0 h-[100%]">
          <div class="radius-box">
            <div class="header-row-box">
              <div class="flex gap-[10px]">
                <ui-radius-select
                  pop-class="w-[80px]"
                  :options="dayOptions"
                  v-model="daySelectIndex"
                >
                  <template #default="{ isShow, options, value }">
                    <div
                      class="select-box"
                      :class="{ 'select-box-active': isShow }"
                    >
                      <div class="select-single">
                        <div class="flex-1">{{ options[value]?.label }}</div>
                        <div
                          class="right-box"
                          :class="{ '!rotate-[90deg]': isShow }"
                        >
                          <svg-icon
                            name="arrow-back"
                            class-name="text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  </template>
                </ui-radius-select>
                <ui-radius-select
                  pop-class="w-[80px]"
                  :options="statusOptions"
                  v-model="statusSelectIndex"
                >
                  <template #default="{ isShow, options, value }">
                    <div
                      class="select-box"
                      :class="{ 'select-box-active': isShow }"
                    >
                      <div class="select-single">
                        <div class="flex-1">{{ options[value]?.label }}</div>
                        <div
                          class="right-box"
                          :class="{ '!rotate-[90deg]': isShow }"
                        >
                          <svg-icon
                            name="arrow-back"
                            class-name="text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  </template>
                </ui-radius-select>
              </div>
              <div class="flex items-center text-[11px] lh-[13px]">
                <span class="text-[#656565]">累计收益</span>
                <span class="text-[#FFAA09]">0.00</span>
              </div>
            </div>

            <div class="listWrapper">
              <div class="listItem head">
                <div>时间</div>
                <div>类型</div>
                <div>金额</div>
              </div>
              <div class="scroll-box">
                <ui-empty />
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.base-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: auto;

  .info-box {
    background-color: #191919;
    border-radius: 0;
    padding: 20px 10px 0;
    width: 100%;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .principalWrapper {
        max-width: 60%;
        font-size: 15px;

        .label {
          color: #656565;
          font-size: 11px;
          line-height: 1.45;
          margin-right: 5px;
        }
      }

      .mobileButtonLine {
        display: flex;
        gap: 10px;
        --van-button-warning-background: #ffaa09;

        :deep(.van-button) {
          width: 60px;
          height: 25px;
          font-size: 10px;
        }

        :deep(.info-btn) {
          background-color: #999;
          border-color: #999;
          color: white;
        }
      }

      .curIncomeWrapper {
        .curIncomeItem {
          display: flex;
          width: 100%;
          margin-bottom: 10.5px;
          color: #656565;
          font-size: 11px;
          line-height: 1.45;
        }

        .mg {
          margin-right: 5px;
          word-break: break-all;
          font-size: 11px;
          display: flex;
          align-items: center;

          .strong {
            color: #ffaa09;
            font-size: 15px;
            font-weight: 600;
          }
        }
      }

      .receive-btn {
        :deep(.van-button) {
          width: 60px;
          height: 25px;
          font-size: 10px;
        }

        :deep(.info-btn) {
          background-color: #999;
          border-color: #999;
          color: white;
        }
      }
    }
  }

  .container-tab-page {
    width: 100%;
    height: 100%;
    --van-tabs-line-height: 35px;
    --van-tabs-nav-background: #191919;
    --van-tab-font-size: 11px;
    --van-tab-active-text-color: #dfbe5b;
    --van-tab-text-color: white;
    --van-padding-xs: 0;
    --van-tabs-bottom-bar-height: 2px;
    --van-tabs-bottom-bar-width: 44px;

    :deep(.van-tabs) {
      .van-tabs__nav {
        padding-left: 10px;
        gap: 15px;
      }
    }

    .tabs-component {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.van-tabs__content) {
        height: 100%;
      }

      .radius-box {
        height: calc(100% - 0px);
        padding: 10px;
        background-color: #000000;

        .inner-box {
          height: 100%;
          flex-shrink: 0;
          box-sizing: border-box;
          width: 100%;
          position: relative;

          overflow: auto;
          min-height: 100px;
          border-radius: 5px;
          background-color: #191919;
          font-size: 13px;
          line-height: 21px;
          color: #656565;
          box-shadow: 0 1.5px 3.5px #0000001f;

          .rule {
            padding: 10px;

            *:not(:last-child) {
              margin-bottom: 21px;
            }
          }
        }
      }
    }

    .header-row-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .select-box {
        height: 25px;
        width: 80px;
        font-size: 10px;
        max-width: 100%;
        border: solid 1px #242424;
        color: #656565;
        border-radius: 9999rem;
        overflow: hidden;
        transition: all 0.3s;

        &-active {
          border-color: #dfbe5b;
        }

        .select-single {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          background-color: #191919;
          padding: 0 10px;
          box-sizing: border-box;
          border-radius: 5px;
        }

        .right-box {
          transition: transform 0.3s linear;
          transform: rotate(-90deg);
          margin-right: 3px;
          font-size: 10px;
        }
      }
    }

    .listWrapper {
      .scroll-box {
        height: calc(var(--lobby__screen-height) - 340px);
        width: calc(100% + 10px);
        padding-right: 10px;
      }

      .listItem {
        display: flex;
        height: 35px;
        border-radius: 4px;
        font-size: 10px;
        color: #656565;

        div {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .head {
        height: 40px;
        font-size: 12px;
        color: #fff;
        border: 1px solid #242424;
        background-color: #191919;
      }
    }
  }
}
</style>