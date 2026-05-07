<script setup lang="ts">
import { reactive, ref } from "vue";
import RangePicker from "./RangePicker.vue";
import UiRadiusSelect from "@/components/UI/radius-select.vue";

const dayOptions = ref([
  { label: "全部", key: 0 },
  { label: "已读", key: 1 },
  { label: "未读", key: 2 }
]);

const formInfo = reactive({
  timeRange: "all",
  status: 0,
  keyword: ""
});

const richText = `<div class=""><p>重要通知！</p></div>`

</script>

<template>
  <div class="service-box">
    <div class="filter-container">
      <RangePicker v-model="formInfo.timeRange" />

      <ui-radius-select
        v-model="formInfo.status"
        pop-class="w-[80px] h-[25px]"
        :options="dayOptions"
      >
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

      <div class="bind-search-box">
        <div class="flex-1 min-w-0">
          <input
            v-model="formInfo.keyword"
            class="search-input"
            placeholder="搜索"
          />
        </div>
        <div class="pl-[10px] flex items-center">
          <svg-icon name="comm_icon_ss" class-name="main-text text-[14px]" />
        </div>
      </div>
    </div>
    <div class="list-box">
      <div class="item-box" v-for="i in 10">
        <div class="announcement">
          <div class="content-box">
            <div class="icon">
              <img src="/siteadmin/skin/lobby_asset/icon_dt_1xx_wd.avif" alt="" srcset="">
            </div>
            <div class="title">
              <div class="notice-content" v-html="richText"></div>
              <p class="createTime">2025/06/04 00:00:00</p>
            </div>
            <div class="list-right">
              <span>已读</span>
              <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[12px] text-right-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.service-box {
  height: 100%;
  position: relative;
  overflow: auto;
  background: #000;
  display: flex;
  flex-direction: column;
  width: 100%;

  .filter-container {
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 10px;

    .select-box {
      height: 25px;
      width: 80px;
      max-width: 100%;
      overflow: hidden;
      border: solid 1px #242424;
      border-radius: 9999rem;
      color: #656565;
      font-size: 10px;
      transition: all 0.3s;

      &-active {
        border-color: #dfbe5b;
      }

      .select-single {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 10px;
        box-sizing: border-box;
        border-radius: 5px;
        background-color: #191919;
      }

      .right-box {
        margin-right: 3px;
        font-size: 10px;
        transform: rotate(-90deg);
        transition: transform 0.3s linear;
      }
    }

    .bind-search-box {
      flex: 0 0 125px;
      min-width: 125px;
      height: 25px;
      width: 125px;
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border: var(--lobby__px) solid var(--skin__border);
      border-radius: 12.5px;
      background-color: var(--skin__bg_2);
      color: var(--skin__neutral_2);
      font-size: 12px;

      &:focus-within {
        flex: 1 1 0;
        min-width: 0;
        width: auto;
      }

      .search-input {
        width: 100%;
        height: 100%;
        border: 0;
        background-color: transparent;
        color: var(--skin__lead);
        font-size: 10px;
        line-height: 25px;
        caret-color: var(--skin__primary);
        white-space: nowrap;
        text-overflow: ellipsis;
        &::placeholder {
          color: var(--skin__neutral_2);
        }
      }
    }
  }

  .list-box {
    flex: 1;
    height: 0;
    overflow: auto;
    padding-left: 10px;
    padding-right: 10px;
    .item-box {
      position: relative;
      align-items: center;
      min-height: 50px;
      margin-bottom: 10px;
      .announcement {
        display: flex;
        flex-shrink: 0;
        justify-content: space-between;
        width: 100%;
        background-color: var(--skin__bg_2);
        padding: 10px 10px 10px 13px;
        border-radius: 7px;
        box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, .06);
        .content-box {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          .icon {
            position: relative;
            margin-left: -2px;
            img {
              width: 22px;
              height: 19.25px;
              margin-right: 8px;
            }
          }
          .title {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: space-between;
            .notice-content {
              display: inline-block;
              width: 210px;
              margin: 0;
              height: 20px;
              line-height: 20px;
              color: var(--skin__lead);
              font-size: 12px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .createTime {
              margin-top: 4px;
              color: var(--skin__neutral_2);
              font-size: 9px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              line-height: 1;
            }
          }
          .list-right {
            color: var(--skin__neutral_2);
            min-width: 32.5px;
            width: 73px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            span {
              font-size: 12px !important;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .text-right-icon {
              color: var(--skin__neutral_2);
              margin-right: 10px;
              margin-left: 6px;
            }
          }
        }
      }
    }
  }
}
</style>
