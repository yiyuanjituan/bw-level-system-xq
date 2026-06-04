<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import UiEmpty from "@/components/UI/empty.vue";
import { service } from "@/api/service";

const show = ref(false);
const { width: windowWidth } = useWindowSize();
const page = ref(1);
const typeList = ref([
  { key: 1, name: "已获得" },
  { key: 2, name: "已使用" },
  { key: 3, name: "已过期" }
]);

const defaultOptions: any[] = [
  {
    text: "今日",
    value: "today",
    startTime: dayjs().startOf("day").unix(),
    endTime: dayjs().endOf("day").unix()
  },
  {
    text: "昨日",
    value: "yesterday",
    startTime: dayjs().subtract(1, "day").startOf("day").unix(),
    endTime: dayjs().subtract(1, "day").endOf("day").unix()
  },
  {
    text: "本周",
    value: "this-week",
    startTime: dayjs().startOf("isoWeek").unix(),
    endTime: dayjs().endOf("isoWeek").unix()
  },
  {
    text: "上周",
    value: "last-week",
    startTime: dayjs().subtract(1, "week").startOf("isoWeek").unix(),
    endTime: dayjs().subtract(1, "week").endOf("isoWeek").unix()
  },
  {
    text: "本月",
    value: "this-month",
    startTime: dayjs().startOf("month").unix(),
    endTime: dayjs().endOf("month").unix()
  },
  {
    text: "上月",
    value: "last-month",
    startTime: dayjs().subtract(1, "month").startOf("month").unix(),
    endTime: dayjs().subtract(1, "month").endOf("month").unix()
  },
  {
    text: "全部",
    value: "all",
    startTime: 0,
    endTime: 0
  }
];

function openDialog() {
  show.value = true;
  loadData()
}

function handleClose() {
  show.value = false;
}

function loadData() {
  service.activity.data.vitalityRecordList({ startTime: 1, endTime: 1 }).then(res => {

  })
}

defineExpose({
  open: openDialog
});

const dialogWidth = computed(() => (348 / 375) * windowWidth.value);
</script>

<template>
  <div class="dialog-box">
    <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" destroy-on-close>
      <div class="task-record-container">
        <div class="header-box">
          <span class="header-title">活跃度记录</span>
        </div>
        <div class="content-box">
          <x-tabs shrink animated auto-height>
            <x-tab :title="item.name" v-for="item in typeList" :key="item.key">
              <div class="tab-con">
                <div class="select-wrapper">
                  <div class="time-picker">
                    <x-select :options="defaultOptions.map(v => ({ label: v.text, value: v.value }))" />
                  </div>
                  <div class="total-amount-wrapper">
                    <span class="total-amount-text">累计活跃度</span>
                    <span class="total-amount"> <svg-icon name="comm_icon_shy" class-name="mr-[2px]" />0</span>
                  </div>
                </div>
                <div class="list-wrapper">
                  <ui-empty>

                  </ui-empty>
                </div>
              </div>
            </x-tab>
          </x-tabs>
        </div>
      </div>

      <template #footer>
        <div class="footer-box">
          <div class="close-icon" @click="handleClose">
            <svg-icon name="close" color="white" />
          </div>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.dialog-box {
  --van-padding-md: 0px;
}
.task-record-container {
  border: var(--lobby__px) solid var(--skin__border);
  width: 100%;
  background: var(--skin__bg_2);
  border-radius: 10px;
  backface-visibility: hidden;
  overflow: auto;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .header-box {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    color: var(--skin__lead);
    padding: 10px 15px 15px;
    box-sizing: border-box;
    line-height: 1.5;
    .header-title {
    }
  }
  .content-box {
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    min-height: 46px;
    color: var(--skin__lead);
    :deep(.x-tabs__wrap) {
      height: 40px;
      margin-left: 7px;
      margin-right: 7px;
    }

    .tab-con {
      padding: 10px 0;
      .select-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 10px;
        padding: 0 15px;
        .time-picker {
          :deep(.x-select) {
            border-radius: 9999rem;
            width: 80px;
            height: 25px;
            font-size: 10px;
            .x-select__label {
              color: var(--skin__neutral_2);
            }
          }
        }
        .total-amount-wrapper {
          display: flex;
          color: var(--skin__lead);
          font-size: 12px;
          line-height: normal;
          text-align: right;
          .total-amount-text {
            margin-right: 2.5px;
          }
          .total-amount {
            display: flex;
            justify-content: center;
            margin-top: 2.5px;
            font-size: 12px;
            color: var(--skin__accent_1);
            align-items: center;
          }
        }
      }

      .list-wrapper {
        height: 387px;
        padding-left: 15px;
        padding-right: 15px;
      }
    }
  }
}
.footer-box {
  position: relative;
  width: 100%;
  height: 45px;
  font-size: 8px;
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .close-icon {
    color: white;
    font-size: 30px;
  }
}
</style>
