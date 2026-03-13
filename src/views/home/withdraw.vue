<script setup lang="ts">
import SubNavbar from "@/components/SubNavbar.vue";
import { handleBack } from "@/utils/common";
import ReceiptAccount from "@/components/Withdraw/ReceiptAccount.vue";
</script>

<template>
  <div class="security-container">
    <div class="sub-header">
      <div class="arrow-left" @click="handleBack">
        <svg-icon name="arrow-back"></svg-icon>
      </div>
      <div class="title" />
      <div class="actions">
        <svg-icon name="icon_sys_menu_service"></svg-icon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-box">
      <van-tabs shrink swipeable>
        <van-tab title="申请提现"><apply-withdraw /></van-tab>
        <van-tab title="收款账户"><receipt-account /></van-tab>
        <van-tab title="提现记录">内容 2</van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.security-container {
  --skin__primary: #dfbe5b;
  --van-tab-active-text-color: var(--skin__primary);
  --van-tab-text-color: white;

  height: 100%;
  background: #000;

  .sub-header {
    --skin__lead: white;
    --skin__neutral_1: #BCBCBC;

    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 45px;
    background-color: #191919;
    border-bottom: 1px solid #242424;
    width: 100%;
    .arrow-left {
      position: absolute;
      min-width: 40px;
      flex-shrink: 0;
      z-index: 9999;

      display: flex;
      align-items: center;
      height: 100%;
      color: var(--skin__neutral_1);
      font-size: 12px;
      padding-left: 10px;
    }
    .actions {
      display: flex;
      align-items: center;
      height: 45px;
      padding: 0 10px;
      color: #DFBE5B;
      font-size: 25px;
      position: absolute;
      right: 0;
      z-index: 20;
    }
  }

  .content-box {
    --van-tabs-line-height: 45px;
    --van-tabs-nav-background: transparent;
    --van-padding-xs: 15px;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    :deep(.van-tabs) {
      height: 100%;
    }

    :deep(.van-tabs__content) {
      height: calc(100% - 45px);
      .van-tab__panel {
        height: 100%;
      }
    }

    :deep(.van-tabs__nav) {
      --van-tab-font-size: 12px;
      padding-left: 30px;
    }
  }
}
</style>
