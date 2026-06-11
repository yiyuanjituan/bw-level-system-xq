<script setup lang="ts">
import { onMounted, ref } from "vue";
import { padStart } from "lodash-es";
import { showCustomDialog, showCustomToast } from "@/hooks/useCommon";
import { service } from "@/api/service";
import router from "@/router";
import { bus } from "@/utils/mitt";
import dayjs from "dayjs";
import useAuthStore from "@/store/modules/user";
import TaskRecord from "./components/TaskRecord.vue";
import TaskLimitTip from "@/views/home/components/TaskLimitTip.vue";

const isLoading = ref(false);
const totalConfig = ref<any>({});
const timeCountDown = ref(60 * 1000);
const activeTabName = ref<"101" | "102" | "103">();
const taskList = ref<any>([]);
const auth = useAuthStore();
const taskRecordRef = ref();
const taskLimitTipRef = ref();

function handleLoading() {
  if (isLoading.value) return;
  isLoading.value = true;
  init()
    .finally(() => (isLoading.value = false))
    .then(() => {
      isLoading.value = false;
      showCustomToast({ message: "刷新成功", type: "success" });
    });
}

function tapDetailDialog() {
  taskRecordRef.value?.open();
}

async function init() {
  return new Promise((resolve, reject) => {
    service.activity.data
      .taskConfigData()
      .then(res => {
        totalConfig.value = res;
        if (res.taskConfig?.["101"] && !activeTabName.value) {
          activeTabName.value = "101";
        } else if (res.taskConfig?.["102"] && !activeTabName.value) {
          activeTabName.value = "102";
        } else if (res.taskConfig?.["103"] && !activeTabName.value) {
          activeTabName.value = "103";
        }
        getTaskData();

        // 设置倒计时
        if (activeTabName.value == "101") {
          timeCountDown.value = 0;
        } else if (activeTabName.value == "102") {
          timeCountDown.value = dayjs().endOf("day").valueOf() - dayjs().valueOf();
        } else if (activeTabName.value == "103") {
          timeCountDown.value = dayjs().endOf("isoWeek").valueOf() - dayjs().valueOf();
        }
        // 设置倒计时

        resolve(void 0);
      })
      .catch(reject);
  });
}

function getTaskData() {
  service.activity.data.taskListData({ typeId: Number(activeTabName.value) }).then(res => {
    taskList.value = res;
  });
}

function getIsShow(type: any, allowType: any[]) {
  return allowType.includes(type);
}

function handleTapGo(type: any) {
  if (!auth.token) {
    return router.push("/home/login");
  }
  if (type == 0) {
    router.push("/home/register");
  } else if (type == 1) {
    showCustomToast({ type: "success", message: "下载APP的操作" });
  } else if (type == 2) {
    bus.emit("showRecharge");
  } else if (type == 3) {
    router.push("/home/security");
  } else if (type == 4) {
    router.push("/home/yuebao");
  } else if (type == 5) {
    router.push("/home/withdraw");
  } else if (type == 6) {
    router.push("/home/withdraw");
  } else if (type == 7) {
    showCustomToast({ type: "success", message: "修改社交信息" });
  } else if (type == 8) {
    bus.emit("switchTab", "/index");
  } else if (type == 9) {
    bus.emit("showRecharge");
  } else if (type == 10) {
    bus.emit("switchTab", "/index");
  }
}

function handleGetReward(record: any) {
  record.isLoading = true;
  service.activity.data
    .getTaskReward({ taskId: record.id })
    .finally(() => (record.isLoading = false))
    .then(() => {
      showCustomToast({ message: "领取成功", type: "success" });
      init();
      auth.updateInfo();
    });
}

function seeMore(record: any) {
  let titleText = "";
  if (record.taskDetailType == 8 || record.taskDetailType == 10) {
    titleText = "仅限游戏";
  }
  if (record.taskDetailType == 9) {
    titleText = "仅限充值";
  }
  taskLimitTipRef.value.open({
    title: titleText,
    content: record.desc
  });
}

function handleChangeTaskData(type: any) {
  service.activity.data.taskListData({ typeId: Number(type) }).then(res => {
    taskList.value = res;
    activeTabName.value = type;
    if (type == "101") {
      timeCountDown.value = 0;
    } else if (type == "102") {
      timeCountDown.value = dayjs().endOf("day").valueOf() - dayjs().valueOf();
    } else if (type == "103") {
      timeCountDown.value = dayjs().endOf("isoWeek").valueOf() - dayjs().valueOf();
    }
  });
}

function jumpToRecord() {
  router.push("/home/records");
}

function handleGetBox(record: any) {
  showCustomDialog({
    width: 300,
    title: "活跃度兑换",
    message: `将使用${record?.vitality}活跃度兑换宝箱`,
    confirmButtonText: "立即兑换",
    showCancelButton: true,
    cancelButtonText: "取消"
  }).then(isValid => {
    if (isValid) {
      service.activity.data.getBoxReward({ taskId: record.id }).then(res => {
        auth.updateInfo();
        init();
        showCustomDialog({
          width: 300,
          title: "兑换成功",
          message: `您已获得${res.val}彩金`,
          confirmButtonText: "去游戏",
          showCancelButton: true,
          cancelButtonText: "稍后游戏"
        }).then(isGame => isGame && router.replace("/"));
      });
    }
  });
}

onMounted(() => init());
</script>

<template>
  <div class="task-container">
    <div class="active-level-box">
      <div class="active-level">
        <div class="caption">
          <span class="captionItem">
            <svg-icon name="comm_icon_shy" class-name="text-[14px]"></svg-icon>
            <span class="ml-[1px]">{{ totalConfig?.vitalityBalance ?? 0 }}</span>
          </span>
          <span class="detail" @click="tapDetailDialog">详情</span>
        </div>
        <div class="active-list-wrap relative">
          <div class="active-list">
            <div class="active-list-item" v-for="(item, index) in totalConfig?.rewardConfig ?? []" :key="item.id">
              <div class="item">
                <x-popover
                  placement="top"
                  v-model:show="item.showPopover"
                  :trigger="totalConfig?.vitalityBalance < item.vitality ? 'click' : 'manual'"
                >
                  <template #reference>
                    <div class="image">
                      <template v-if="totalConfig?.vitalityBalance < item.vitality">
                        <img src="@/assets/common/img_rwbx_0.avif" alt="" />
                      </template>
                      <template v-if="totalConfig?.vitalityBalance >= item.vitality">
                        <img v-if="index == 0" src="@/assets/common/img_rwbx_1c.avif" alt="" class="!w-[50px]" @click.stop="handleGetBox(item)" />
                        <img src="@/assets/common/img_rwbx_2c.avif" alt="" v-if="index == 1" class="!w-[50px]" @click.stop="handleGetBox(item)" />
                        <img src="@/assets/common/img_rwbx_3c.avif" alt="" v-if="index == 2" class="!w-[50px]" @click.stop="handleGetBox(item)" />
                        <img src="@/assets/common/img_rwbx_4c.avif" alt="" v-if="index == 3" class="!w-[50px]" @click.stop="handleGetBox(item)" />
                      </template>
                      <span class="progressIndex">{{ index + 1 }}</span>
                    </div>
                  </template>
                  <div class="activityBoxTip">
                    <span class="tip-text">
                      打开后获得
                      <span>{{ item.minNum }}</span>
                      -
                      <span>{{ item.showMaxNum }}</span>
                      奖金需要<span>{{ Number(item.scale) }}</span>
                      倍流水可提现
                    </span>
                  </div>
                </x-popover>
                <div class="value">
                  <svg-icon name="comm_icon_shy" />
                  <span class="line">-</span>
                  <span>{{ item.vitality }}</span>
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
        <div class="item-tab" v-if="totalConfig?.taskConfig?.['101']" @click="handleChangeTaskData(101)">
          <div class="task-tab-name" :class="{ 'active-name': activeTabName == '101' }">新手任务</div>
        </div>
        <div class="item-tab" v-if="totalConfig?.taskConfig?.['102']" @click="handleChangeTaskData(102)">
          <div class="task-tab-name" :class="{ 'active-name': activeTabName == '102' }">每日任务</div>
        </div>
        <div class="item-tab" v-if="totalConfig?.taskConfig?.['103']" @click="handleChangeTaskData(103)">
          <div class="task-tab-name" :class="{ 'active-name': activeTabName == '103' }">每周任务</div>
        </div>
      </div>
      <div class="task-extra-button">
        <div class="refresh-box" @click="handleLoading">
          <svg-icon name="comm_icon_retry" :class-name="{ loading: isLoading }" />
          <span class="event-refresh-btn-text">刷新</span>
        </div>
      </div>
    </div>
    <div class="active-receive-box">
      <div class="active-receive-left">
        <img v-if="activeTabName == '101'" src="/siteadmin/skin/lobby_asset/web/task/img_rw_xr.avif" class="icon-box" />
        <img v-if="activeTabName == '102'" src="/siteadmin/skin/lobby_asset/web/task/img_rw_mrrw.avif" class="icon-box" />
        <img v-if="activeTabName == '103'" src="/siteadmin/skin/lobby_asset/web/task/img_rw_mzrw.avif" class="icon-box" />
        <template v-if="activeTabName != '101'">
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
        </template>
      </div>
      <div class="active-receive-right" @click="jumpToRecord">
        <svg-icon name="task-comm_icon_order" class-name="text-[18px] main-text" />
      </div>
    </div>
    <div class="task-content-box">
      <div class="card-layout" v-for="(item, index) in taskList" :key="index">
        <div class="card-layout-inner">
          <div class="flex card-top">
            <div class="instruction-info">
              <div class="instruction-base-info">
                <div class="description-primary">{{ item.name }}</div>
                <div class="more-limit" v-if="item.desc">
                  <span class="text">
                    <span class="text-inner">仅限：{{ item.desc }}</span>
                  </span>
                  <span
                    class="btn-more"
                    v-if="(item.limit_ids && item.limit_ids.length > 3) || (item.desc && item.desc.length > 16)"
                    @click="seeMore(item)"
                  >
                    更多
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="card-bottom-box">
              <div class="card-left-box">
                <div class="card-left-inner">
                  <div class="bottom-slot">
                    <div class="icon-wrap" v-if="item.money > 0">
                      <span class="category-icon-text">
                        <img src="/siteadmin/active/rmb.svg" alt="" srcset="" />
                        <span class="category-text">{{ item.money }}</span>
                      </span>
                    </div>
                    <div class="icon-wrap" v-if="item.vitality > 0">
                      <span class="category-icon-text tili">
                        <svg-icon name="comm_icon_shy" class-name="text-[18px]"></svg-icon>
                        <span class="category-text">{{ item.vitality }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="progress-wrapper" v-if="getIsShow(item.taskDetailType, [8, 9, 10])">
                    <van-progress
                      class="green-bar"
                      :pivot-text="`${item.currentProgress}/${item.maxProgress}`"
                      :percentage="(item.currentProgress / item.maxProgress) * 100"
                    />
                  </div>
                </div>
              </div>
              <div class="card-right-box">
                <div class="card-right-box-inner">
                  <x-button
                    class="!w-[75px] !h-[30px] text-[11px]"
                    v-if="getIsShow(item.taskDetailType, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) && !item.isOver && !item.isOverGet"
                    @click="handleTapGo(item.taskDetailType)"
                  >
                    前&nbsp;往
                  </x-button>
                  <x-button
                    :loading="item.isLoading"
                    type="success"
                    class="!w-[75px] !h-[30px] text-[11px]"
                    v-if="item.isOver && !item.isOverGet"
                    @click="handleGetReward(item)"
                  >
                    领&nbsp;取
                  </x-button>
                  <x-button disabled type="warning" class="!w-[75px] !h-[30px] text-[11px]" v-if="item.isOver && item.isOverGet"> 已领取 </x-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <task-record ref="taskRecordRef" />
    <task-limit-tip ref="taskLimitTipRef" />
  </div>
</template>

<style scoped lang="less">
.task-container {
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--skin__bg_1);

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
              height: 76px;
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
                margin: 4px auto;
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
              flex: 1;
              overflow: hidden;
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
                      line-height: 1;
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

                .progress-wrapper {
                  min-width: 80px;
                  margin-left: 7.5px;
                  :deep(.van-progress) {
                    position: relative;
                    height: 11px;
                    background: var(--skin__neutral_3);
                    border-radius: 10px;
                    overflow: hidden;
                  }
                  .green-bar {
                    :deep(.ui-progress__portion) {
                      background-color: var(--skin__accent_1);
                    }
                  }
                  :deep(.van-progress__pivot) {
                    position: absolute !important;
                    top: 0 !important;
                    box-sizing: border-box;
                    color: #fff;
                    height: 11px;
                    line-height: 11px;
                    font-size: 10px;
                    text-align: center;
                    word-break: keep-all;
                    white-space: nowrap;
                    left: 50% !important;
                    transform: translate(-50%, 0px) !important;
                    background: transparent !important;
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

<style lang="less">
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
</style>
