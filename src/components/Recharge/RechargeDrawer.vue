<script setup lang="ts">
import { ref } from "vue";
import UiBadge from "@/components/UI/badge.vue";
import RechargeBody from "@/components/Recharge/RechargeBody.vue";
import { getChannelList } from "@/api/common";
import router from '@/router';
import { bus } from '@/utils/mitt';

const show = ref(false);
const listData = ref<any>([]);

function open() {
  show.value = true;
  initData();
}

function close() {
  show.value = false;
}

function initData() {
  listData.value = [];
  getChannelList().then(res => {
    listData.value = res;
  });
}

function handleCallToService() {
  close()
  router.push('/home/notice')
}

function handleRecord() {
  close()
  bus.emit('showRechargeRecord')
}

defineExpose({
  open: open,
  close
});
</script>

<template>
  <van-popup destroy-on-close v-model:show="show" position="bottom" :overlay-style="{ 'backdrop-filter': 'blur(5px)' }" @close="close()">
    <div class="popup-container">
      <div class="popup-header">
        <div class="back-icon" @click="show = false">
          <svg-icon name="arrow-back" class-name="ml-[-7.5px]"></svg-icon>
        </div>
        <p class="title">存款</p>
        <div class="actions">
          <div class="kf-ico" @click="handleCallToService"><svg-icon name="comm_icon_cz_kf" /></div>
          <ui-badge :content="0" :size="[5, 5]">
            <div class="jl-ico"><svg-icon name="comm_icon_cz_jl" @click="handleRecord" /></div>
          </ui-badge>
        </div>
      </div>
      <div class="body-container">
        <div class="recharge-header">
          <span class="title">支付方式</span>
          <my-wallet />
        </div>
        <van-tabs shrink>
          <van-tab>
            <template #title>
              <recharge-badge>
                <svg-icon name="icon_cz_zxcz1" style="color: var(--skin__primary)" class-name="text-[19px]" />
                <span class="pl-[5px]">在线存款</span>
              </recharge-badge>
            </template>
            <recharge-body :listData="listData.filter(v => v.type == 1)" @close="show = false" />
          </van-tab>
          <van-tab>
            <template #title>
              <recharge-badge>
                <svg-icon name="icon_cz_xnhb" style="color: var(--skin__primary)" class-name="text-[19px]" />
                <span class="pl-[5px]">数字货币</span>
              </recharge-badge>
            </template>
            <recharge-body :listData="listData.filter(v => v.type == 2)" @close="show = false" />
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="less">
.popup-container {
  --half-screen-header-height: 50px;
  height: calc(100dvh - 45px);
  border-radius: 10px 10px 0 0;
  background-color: var(--skin__bg_2);
  color: var(--skin__lead);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .popup-header {
    height: var(--half-screen-header-height);
    position: relative;
    .back-icon {
      position: absolute;
      width: 40px;
      height: var(--half-screen-header-height);
      line-height: var(--half-screen-header-height);
      text-align: center;
      left: 0;
      top: 0;
      color: var(--skin__neutral_1);
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .title {
      font-size: 16px;
      height: var(--half-screen-header-height);
      line-height: var(--half-screen-header-height);
      margin: auto;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .actions {
      font-size: 18px;
      color: var(--skin__primary);
      padding: 5px;

      position: absolute;
      display: flex;
      align-items: center;
      height: 100%;
      right: 0;
      top: 0;

      .kf-ico {
        padding: 10px;
      }
      .jl-ico {
        padding: 10px;
      }
    }
  }
  .body-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .recharge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      .title {
        font-size: 12px;
        font-weight: 700;
        color: var(--skin__lead);
      }
    }

    :deep(.van-tabs) {
      --van-tab-active-text-color: var(--skin__primary);
      --van-font-bold: normal;
      --van-tabs-nav-background: transparent;
      --van-padding-xs: 0px;
      --van-tabs-bottom-bar-width: 80px;
      --van-tabs-bottom-bar-height: 2px;
      --van-tab-text-color: white;

      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .van-tabs__wrap {
        flex-shrink: 0;
        border-bottom: var(--lobby__px) solid var(--skin__border);
        margin: 0 10px;
      }
    }
    :deep(.van-tab) {
      margin-right: 12.5px;
      padding-top: 9px;
    }
    :deep(.recharge-badge__wrapper) {
      display: inline-flex;
      align-items: center;
    }
    :deep(.van-tab__text) {
      display: flex;
      align-items: center;
      height: 100%;
    }
  }
}
</style>
