<script setup lang="ts">
import { onMounted, ref } from "vue";
import { service } from "@/api/service";
import { formatMoney } from "@/utils/common";
const vipListData = ref<any[]>([]);

interface Props {
  info?: any;
}

const props = withDefaults(defineProps<Props>(), {
  info: () => ({})
});
const emits = defineEmits(["refresh"]);
const isLoading = ref(false);

function onRefresh() {
  emits("refresh");
  isLoading.value = true;
  setTimeout(() => (isLoading.value = false), 1200);
}

onMounted(() => {
  service.v1.user.vipList().then(res => {
    vipListData.value = res.list;
  });
});
</script>

<template>
  <div class="level-list">
    <div class="receive-reward">
      <div class="item">
        <span class="text">待领取</span>
        <span class="amount">{{ formatMoney(props.info.awaitGetNum) }}</span>
        <div class="refresh">
          <div class="loadingIcon" @click="onRefresh">
            <svg-icon
              name="comm_icon_retry"
              class-name="main-text text-[10px]"
              :class="{ 'loading-icon-spin': isLoading }"
            />
          </div>
        </div>
      </div>
      <div class="item">
        <span class="text">累计奖金</span>
        <span class="amount">{{ formatMoney(props.info.userGetNum) }}</span>
      </div>
    </div>
    <div class="main-box">
      <div class="level-header">
        <span class="level">等级</span>
        <span class="power">奖励/特权</span>
      </div>
      <div
        class="list-item"
        :class="{ expanded: item.isExpanded }"
        @click="item.isExpanded = !item.isExpanded"
        v-for="(item, index) in vipListData"
        :key="index"
      >
        <span class="item-current" v-if="index == 0">当前</span>
        <div class="vip-info">
          <div class="level-image">
            <img
              :src="`/siteadmin/active/color${(parseInt(String(Number(item.level) / 10)) + 1).toString()}.avif`"
              alt=""
              srcset=""
              class="icon-img"
            />
            <img
              :src="`/siteadmin/active/img_dj${Number(item.level) % 10}.avif`"
              alt=""
              srcset=""
              class="icon-img"
              v-if="Number(item.level) % 10 != 0"
            />
            <div class="level-text level-style-1">
              <span :data-text="item.level">{{ item.level }}</span>
            </div>
          </div>
          <span class="vip-name">VIP {{ item.level }}</span>
        </div>
        <div class="item-content">
          <div class="summary">
            <div class="bonus-info">
              {{ item.isExpanded ? "最低可获得奖金" : "总奖金" }}
              <span class="bonus-amount">
                {{ formatMoney(Number(item.upAmount) + Number(item.weekAmount) + Number(item.monthAmount) + Number(item.dayAmount)) }}
              </span>
            </div>
            <div class="toggle">展开<svg-icon name="arrow-down" class-name="arrow-icon" /></div>
          </div>
          <div class="reward-list" v-if="item.isExpanded">
            <div class="reward-item" v-if="Number(item.dayAmount) > 0">
              <img alt="" src="@/assets/common/icon_vip_rfl_1.avif" class="reward-icon" />
              <div class="item">
                <div class="label">
                  <span>日工资</span><b class="reward">+{{ formatMoney(item.dayAmount) }}</b>
                </div>
                <div class="progress">
                  每日投注<span class="text">{{ formatMoney(item.dayFlow, false) }}</span>
                </div>
              </div>
              <x-button size="small" class="btn">已领取</x-button>
            </div>
            <div class="reward-item" v-if="Number(item.weekAmount) > 0">
              <img alt="" src="@/assets/common/icon_vip_zfl_1.avif" class="reward-icon" />
              <div class="item">
                <div class="label">
                  <span>周工资</span><b class="reward">+{{ formatMoney(item.weekAmount) }}</b>
                </div>
                <div class="progress">
                  每周投注<span class="text">{{ formatMoney(item.weekFlow, false) }}</span>
                </div>
              </div>
              <x-button size="small" class="btn">已领取</x-button>
            </div>
            <div class="reward-item" v-if="Number(item.monthAmount) > 0">
              <img alt="" src="@/assets/common/icon_vip_yfl_1.avif" class="reward-icon" />
              <div class="item">
                <div class="label">
                  <span>月工资</span><b class="reward">+{{ formatMoney(item.monthAmount) }}</b>
                </div>
                <div class="progress">
                  每月投注<span class="text">{{ formatMoney(item.monthFlow, false) }}</span>
                </div>
              </div>
              <x-button size="small" class="btn">已领取</x-button>
            </div>
            <div class="reward-item" v-if="Number(item.upAmount) > 0">
              <img alt="" src="@/assets/common/icon_vip_jjjj_1.avif" class="reward-icon" />
              <div class="item">
                <div class="label">
                  <span>晋级奖金</span><b class="reward">+{{ formatMoney(item.upAmount) }}</b>
                </div>
                <div class="progress">
                  晋级再投注<span class="text">{{ formatMoney(item.upFlow, false) }}</span>
                </div>
              </div>
              <x-button size="small" class="btn">已领取</x-button>
            </div>
            <div class="reward-item items-start">
              <img alt="" src="@/assets/common/icon_vip_tq_1.avif" class="reward-icon" />
              <div class="item">
                <div class="label"><span>VIP特权</span></div>
                <div class="progress texts">
                  <div class="">
                    日提现总额<b>{{ Number(item.dayWithdrawTotal) == -1 ? "不限制" : formatMoney(item.dayWithdrawTotal) }}</b>
                  </div>
                  <div class="">
                    日提现次数<b>{{ Number(item.dayWithdrawNum) == -1 ? "不限制" : formatMoney(item.dayWithdrawNum, false) }}</b>
                  </div>
                  <div class="">
                    日免手续费笔数<b>{{ Number(item.dayNoFeeNum) == -1 ? "不限制" : `${formatMoney(item.dayNoFeeNum, false)}笔` }}</b>
                  </div>
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
.level-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  .receive-reward {
    flex-shrink: 0;
    padding: 10px 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    line-height: 16px;
    overflow: hidden;
    position: sticky;
    top: 0;

    .item {
      display: flex;
      align-items: center;
      .text {
        color: var(--skin__lead);
        line-height: 1;
      }
      .amount {
        color: var(--skin__accent_3);
        font-weight: 600;
        margin-inline: 4px;
        line-height: 1;
      }
      &:last-of-type .amount {
        border-bottom: var(--lobby__px) solid currentColor;
      }
    }
    .loading-icon-spin {
      animation: loading-icon-spin 0.8s linear infinite;
    }
  }
  .main-box {
    position: relative;
    flex: 1;
    margin: 10px;
    border-radius: 7px;
    border: var(--lobby__px) solid var(--skin__border);
    overflow: auto;
    .level-header {
      position: sticky;
      top: 0;
      display: flex;
      align-items: center;
      text-align: center;
      height: 35px;
      font-size: 12px;
      color: var(--skin__lead);
      border-bottom: var(--lobby__px) solid var(--skin__border);
      background-color: var(--skin__bg_2);
      z-index: 10;
      .level {
        width: 49px;
        line-height: 35px;
        flex-shrink: 0;
        border-right: var(--lobby__px) solid var(--skin__border);
      }
      .power {
        flex: 1;
      }
    }
    .list-item {
      display: flex;
      position: relative;
      border-bottom: var(--lobby__px) solid var(--skin__border);
      &:last-child {
        border-bottom: none !important;
      }
      .item-current {
        position: absolute;
        top: 0;
        left: 0;
        padding: 1.5px 4px;
        font-size: 10px;
        line-height: 13px;
        color: #fff;
        background-color: var(--skin__accent_2);
        border-radius: 0 0 5px;
        z-index: 1;
      }
      .vip-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 49px;
        flex-shrink: 0;
        padding: 5px 0;
        border-right: var(--lobby__px) solid var(--skin__border);
        .level-image {
          width: 28px;
          height: 28px;
          position: relative;
          .icon-img {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          .level-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            width: 50%;
            text-align: center;
            font-weight: 700;
            text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.4);
            direction: ltr;
            zoom: 0.72;
            > span {
              position: relative;
              display: inline-block;
              width: 1ch;
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
          .level-style-1 {
            color: transparent;
            font-size: 12px;
          }
        }
        .vip-name {
          height: 16px;
          line-height: 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--skin__lead);
        }
      }
      .item-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        .summary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: 5px 10px;
          min-height: 39px;
          cursor: pointer;
          .bonus-info {
            flex: 1;
            font-size: 13px;
            color: var(--skin__lead);
            .bonus-amount {
              margin-left: 5px;
              font-weight: 600;
              color: var(--skin__accent_3);
            }
          }
          .toggle {
            flex: none;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-size: 12px;
            height: 30px;
            color: var(--skin__primary);
            .arrow-icon {
              font-size: 12px;
              margin-left: 5px;
              color: var(--skin__neutral_2);
              transform: rotate(-90deg);
              transition: all 0.3s;
            }
          }
        }

        .reward-list {
          min-height: 80px;
          --vip-reward-list-font-size: 10px;
          --vip-reward-list-label-size: 12px;
          --vip-reward-list-padding: 7px 5px;
          --vip-reward-list-item-padding: 0 5px;
          .reward-item {
            position: relative;
            display: flex;
            align-items: center;
            padding: var(--vip-reward-list-padding);
            min-height: 44px;
            font-size: var(--vip-reward-list-font-size);
            overflow: hidden;
            .reward-icon {
              --license-icon-size: 28px;
              --license-icon-font-size: 24px;
              --license-icon-color: var(--skin__primary);
              --license-icon-bg-color: rgba(var(--skin__primary__toRgbString), 0.1);
              flex-shrink: 0;
              width: var(--license-icon-size);
              height: var(--license-icon-size);
              border-radius: 10px;
            }
            .item {
              position: relative;
              flex: 1;
              padding: var(--vip-reward-list-item-padding);
              word-break: break-word;
              z-index: 1;
              .label {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                font-size: var(--vip-reward-list-label-size);
                color: var(--skin__lead);
                line-height: normal;
              }
              .reward {
                padding: 1px 4px;
                margin-inline: 3px;
                color: var(--skin__accent_3);
                border-radius: 4px;
                background: rgba(var(--skin__accent_3__toRgbString), 0.25);
              }
              .progress {
                margin-top: 3px;
                line-height: 14px;
                color: var(--skin__neutral_2);
                .text {
                  color: var(--skin__lead);
                  margin-left: 1px;
                }
              }
              .texts {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                justify-content: flex-start;
                * {
                  width: calc((100% - 5px) / 2);
                  margin-left: 5px;
                  margin-top: 4px;
                }
                > *:nth-child(1) {
                  margin-top: 0;
                }
                > *:nth-child(2) {
                  margin-top: 0;
                }
                > *:nth-child(odd) {
                  margin-left: 0;
                }
                b {
                  color: var(--skin__lead);
                  margin-left: 2px;
                  font-weight: 400;
                }
              }
            }
            .btn {
              position: relative;
              flex-shrink: 0;
              border-radius: 5px;
              width: 75px;
              height: 30px;
              font-size: 11px;
              z-index: 1;
            }
          }
        }
      }
    }
    .expanded {
      background-color: rgba(var(--skin__primary__toRgbString), 0.06);
      .arrow-icon {
        transform: rotate(90deg) !important;
      }
    }
  }
}

@keyframes loading-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
