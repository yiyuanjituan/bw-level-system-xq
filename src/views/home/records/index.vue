<script setup lang="ts">
import UiRadiusSelect from "@/components/UI/radius-select.vue";
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek'
import UiLoading from "@/components/UI/loading.vue";
import { getActivityRecords } from "@/api/common";
import router from "@/router";
dayjs.extend(isoWeek)

const dayOptions = ref([
  { label: '今日', start_time: dayjs().startOf('day').unix(), end_time: dayjs().endOf('day').unix() },
  { label: '昨日', start_time: dayjs().startOf('day').subtract(1, 'day').unix(), end_time: dayjs().endOf('day').subtract(1, 'day').unix() },
  { label: '本周', start_time: dayjs().startOf('isoWeek').unix(), end_time: dayjs().endOf('isoWeek').unix() },
  { label: '上周', start_time: dayjs().startOf('isoWeek').subtract(7, 'day').unix(), end_time: dayjs().endOf('isoWeek').subtract(7, 'day').unix() },
  { label: '本月', start_time: dayjs().startOf('month').unix(), end_time: dayjs().endOf('month').unix() },
  { label: '上月', start_time: dayjs().startOf('month').subtract(1, 'month').unix(), end_time: dayjs().endOf('month').subtract(1, 'month').unix() },
])
// 状态提醒
const statusOptions = ref([
  { label: '全部', value: 0 },
  { label: '已派发', value: 1 },
  { label: '已领取', value: 2 },
])
const daySelectIndex = ref(0)
const statusSelectIndex = ref(0)
const isLoading = ref(true)
const page = ref(1)
const recordData = ref<any>({})

function changeTimeIndex(index: number) {
  refresh()
}
function getAllData() {
  daySelectIndex.value = dayOptions.value.length - 2
  changeTimeIndex(daySelectIndex.value)
}

function jumpTo(url: string) {
  router.replace(url)
}

function refresh() {
  page.value = 1
  getList()
}

function getList() {
  isLoading.value = true
  const info = dayOptions.value[daySelectIndex.value]
  const params = {
    startTime: info.start_time,
    endTime: info.end_time,
    status: statusOptions.value[statusSelectIndex.value]?.value,
    page: page.value,
  }
  getActivityRecords(params).then(res => {
    isLoading.value = false
    page.value = page.value + 1;
    recordData.value.money = res.money
    recordData.value.actNum = res.actNum
    if (recordData.value.list && page.value > 2) {
      recordData.value.list = recordData.value.list.concat(res.list)
    } else {
      recordData.value.list = res.list
    }
  }).finally(() => {
    isLoading.value = false
  })
}

onMounted(() => refresh())
</script>

<template>
  <div class="records-container">
    <header class="row-header">
      <div class="flex items-center gap-[10px]">
        <ui-radius-select pop-class="w-[80px]" :options="dayOptions" @change="changeTimeIndex" v-model="daySelectIndex">
          <template #default="{ isShow, options, value }">
            <div class="select-box" :class="{ 'select-box-active': isShow }">
              <div class="select-single">
                <div class="flex-1">{{ options[value]?.label }}</div>
                <div class="right-box" :class="{ '!rotate-[90deg]': isShow }">
                  <svg-icon name="arrow-back" class-name="text-[10px]" />
                </div>
              </div>
            </div>
          </template>
        </ui-radius-select>
        <ui-radius-select pop-class="w-[80px]" :options="statusOptions" @change="changeTimeIndex" v-model="statusSelectIndex">
          <template #default="{ isShow, options, value }">
            <div class="select-box" :class="{ 'select-box-active': isShow }">
              <div class="select-single">
                <div class="flex-1">{{ options[value]?.label }}</div>
                <div class="right-box" :class="{ '!rotate-[90deg]': isShow }">
                  <svg-icon name="arrow-back" class-name="text-[10px]" />
                </div>
              </div>
            </div>
          </template>
        </ui-radius-select>
      </div>
      <div class="received">
        <div class="item-box">
          <span class="award">奖金</span>
          <span class="text">{{ (Number(recordData.money) || 0).toFixed(2) }}</span>
        </div>
        <div class="item-box" v-if="Number(recordData.actNum) > 0">
          <span class="award">活跃度</span>
          <span class="text !text-[#1FE11F]">{{ Number(recordData.actNum) }}</span>
        </div>
      </div>
    </header>
    <div class="records">
      <ui-loading v-if="isLoading && page == 1" />
      <div class="empty-box" v-if="!isLoading && page > 1 && recordData.list.length == 0">
        <img src="/siteadmin/skin/lobby_asset/img_none_sj.avif" alt="" class="ui-empty-box">
        <span class="empty-text">
          <span>{{ dayOptions[daySelectIndex].label }}暂无记录</span>
          <template v-if="daySelectIndex == 0">
            <span>，可</span>
            <span class="showAll" @click="getAllData">查看更多</span>
          </template>
        </span>
      </div>
      <div class="record-list" v-if="!isLoading && recordData.list.length > 0">
        <div class="list-item" v-for="(item, index) in recordData.list" :key="index">
          <div class="item-info">
            <div class="name-text">{{ item.name }}</div>
            <div class="rewards">
              <div class="currency">
                <svg-icon name="record-wallet" class-name="text-[12px]" />
                <span class="currency-text">{{ item.price }}</span>
              </div>
            </div>
          </div>
          <div class="item-sub">
            <div class="source">
              <span>{{ dayjs(item.createTime).format('YYYY/MM/DD HH:mm') }}</span>
              <span class="template">
                <span class="activeTypeName">来源:</span>
                <span class="source-text" v-if="item.from == 1">系统派发</span>
                <span class="source-text" v-if="item.from == 2" @click="jumpTo('/home/event')">活动奖励</span>
                <span class="source-text" v-if="item.from == 3" @click="jumpTo('/home/task')">任务奖励</span>
                <span class="source-text" v-if="item.from == 4">VIP奖励</span>
                <span class="source-text" v-if="item.from == 5">返水奖励</span>
                <span class="source-text" v-if="item.from == 6">利息宝</span>
              </span>
            </div>
            <div class="receiveStatus">{{ item.status == 1 ? '已派发' : '已领取' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.records-container {
  background: black;
  display: flex;
  flex-direction: column;

  .row-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    height: 45px;

    .received {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: end;
      .item-box {
        display: flex;
        align-items: center;
        margin-left: 2.5px;
        font-size: 12px;
        gap: 4px;
        line-height: 16px;
        color: #656565;
        .text {
          color: #FFAA09;
        }
      }
    }
  }

  .select-box {
    height: 25px;
    width: 80px;
    font-size: 10px;
    max-width: 100%;
    border: solid 1px #242424;
    color: #656565;
    border-radius: 9999rem;
    overflow: hidden;
    transition: all .3s;
    &-active {
      border-color: #DFBE5B;
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

  .records {
    width: 100%;
    flex: 1;
    max-height: 100%;
    height: 0;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-bottom: 50px;
      .ui-empty-box {
        width: 105px;
        height: 105px;
        margin-bottom: 10px;
        margin-top: 30px;
      }
      .empty-text {
        text-align: center;
        max-width: 260px;
        color: #656565;
        font-size: 13px;
        margin-bottom: 30px;
      }
      .showAll {
        color: #DFBE5B;
        display: inline-block;
      }
    }
    .record-list {
      padding: 0 10px 10px;
      min-height: calc(var(--lobby__screen-height) - 155px);

      .list-item {
        width: 355px;
        background-color: #191919;
        box-shadow: 0 1.5px 3.5px 0 #0000001F;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: space-between;
        min-height: 55px;
        padding: 10px;
        border-radius: 7px;
        color: #656565;
        font-size: 10px;
        &:first-child {
          margin-top: 0;
        }
        .item-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #656565;
          font-size: 11px;
          .name-text {
            line-height: 20px;
            max-height: 40px;
            color: white;
            font-size: 12px;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 5px;
          }
          .rewards {
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            .currency {
              display: flex;
              align-items: center;
              color: #FFAA09;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.67;
              letter-spacing: normal;
              text-align: right;
            }
            .currency-text {
              margin: 0 0 0 3px;
              color: #FFAA09;
              font-size: 12px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
        .item-sub {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          .source {
            display: flex;
            font-size: 10px;
            line-height: 1.6;
            color: #656565;
            .template {
              margin-left: 7px;
              display: inline-flex;
              align-items: center;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              .activeTypeName {
                margin-right: 2.5px;
                color: white;
              }
              .source-text {
                cursor: pointer;
                color: #DFBE5B;
              }
            }
          }
          .receiveStatus {
            color: #1FE11F;
            font-size: 10px;
            line-height: 1.6;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>