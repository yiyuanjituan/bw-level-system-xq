<script setup lang="ts">
import { ref } from "vue";
import useAuthStore from "@/store/modules/user";
import UiBadge from "@/components/UI/badge.vue";

const showEye = ref(false);

const walletIsLoading = ref(false);
const auth = useAuthStore();
const typeList = [
  { id: 1, name: "正常x 提现" },
  { id: 2, name: "转为数字货币" },
  { id: 3, name: "三方钱包" }
];
const selectTypeId = ref(1);

function handleChangeType(item) {
  selectTypeId.value = item.id;
}

const updateWallet = () => {
  walletIsLoading.value = true;
  auth.updateInfo();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 1000);
};
</script>

<template>
  <div class="receipt-account">
    <div class="manager-container">
      <div class="title">
        <div class="left">
          收款账户
          <span class="number">(5/64)</span>
          <svg-icon
            name="comm_icon_retry"
            class-name="text-[14px] refresh-icon"
          />
        </div>
        <div class="right">
          <template>
            <svg-icon name="comm_icon_hide" class-name="eye-icon" v-if="!showEye" @click="showEye = !showEye" />
            <svg-icon name="comm_icon_show" class-name="eye-icon main-text" v-if="showEye" @click="showEye = !showEye" />
          </template>
        </div>
      </div>
    </div>
    <div class="bind-account">
      <ui-badge class="bind-account__wrap">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_bank_nromal.png" alt="." class="w-[25px] h-[25px] mr-[7px]">
              <div class="typeName">银行卡转账</div>
            </div>
            <div class="right">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
      <ui-badge class="bind-account__wrap">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_bank_nromal.png" alt="." class="w-[25px] h-[25px] mr-[7px]">
              <div class="typeName">银行卡转账</div>
            </div>
            <div class="right">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
      <ui-badge class="bind-account__wrap">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_bank_nromal.png" alt="." class="w-[25px] h-[25px] mr-[7px]">
              <div class="typeName">银行卡转账</div>
            </div>
            <div class="right">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
    </div>
  </div>
</template>

<style scoped lang="less">
.receipt-account {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .manager-container {
    font-size: 12px;
    margin: 10px;
    padding: 10px;
    border-radius: 7px;
    box-shadow: 0 2.5px 9px var(--skin__bg-shadow__custom);
    background-color: var(--skin__bg_2);

    .title {
      display: flex;
      justify-content: space-between;
      padding-bottom: 5px;
      .left {
        display: flex;
        align-items: center;
        font-size: 11px;
        color: var(--skin__lead);
        .number {
          color: var(--skin__neutral_2);
          margin-left: 3px;
        }
        .refresh-icon {
          margin-left: 7.5px;
          font-size: 14px;
          color: var(--skin__primary);
        }
      }
      .right {
        .eye-icon {
          font-size: 18px;
        }
      }
    }
  }
  .bind-account {
    font-size: 12px;
    padding: 10px;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 2.5px 9px var(--skin__bg-shadow__custom);
    background-color: var(--skin__bg_2);
    flex: 1;

    .bind-account__wrap {
      width: 100%;
    }
    .bind-account__wrap:not(:last-child) {
      margin-bottom: 10px;
    }
    .cell {
      color: var(--skin__lead);
      border: thin solid var(--skin__border);
      border-radius: 7px;
      padding: 4px 10px;

      .cell-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .left {
          display: flex;
          align-items: center;
          .typeName {
            text-align: left;
            max-width: 150px;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
        .right {
          display: flex;
          align-items: center;
          color: var(--skin__primary);
          .arrow-icon {
            color: var(--skin__neutral_2);
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
