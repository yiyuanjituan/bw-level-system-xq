<script setup lang="ts">
import { onMounted, ref } from "vue";
import useAuthStore from "@/store/modules/user";
import UiBadge from "@/components/UI/badge.vue";
import useAppStore from "@/store/modules/app";
import { getWithdrawInfo } from "@/api/common";
import { useRefs } from "@/hooks/useRefs";

const { refs, setRefs } = useRefs();
const showEye = ref(false);

const app = useAppStore();
const walletIsLoading = ref(false);
const listData = ref([])
const canAliAccount = ref(true) // 是否支持绑定支付宝
const numberCurrency = ref(true) // 是否支持绑定数字货币

const updateWallet = () => {
  walletIsLoading.value = true;
  init();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 1000);
};

function handleAddCard(type: 'bank' = 'bank') {
  refs.payPassWordInput?.open()
}

function init() {
  getWithdrawInfo().then(data => {
    listData.value = data?.cardList ?? [];
    canAliAccount.value = !!data?.supportAlipayAccount;
    numberCurrency.value = !!data?.numberCurrency;
  })
}

onMounted(() => init())
</script>

<template>
  <div class="receipt-account">
    <div class="manager-container">
      <div class="title" :class="{ 'mb-[5px]': listData.length > 0 }">
        <div class="left">
          收款账户
          <span class="number">({{ listData.length }}/{{ app.appInfo?.maxBindNum }})</span>
          <svg-icon name="comm_icon_retry" class-name="text-[14px] refresh-icon" :class="[walletIsLoading ? 'ml-[0px] animate__spin' : 'ml-[4px]']" @click="updateWallet" />
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
              <img src="/siteadmin/pay-icon/icon_bank_nromal.png" alt="." class="w-[25px] h-[25px] mr-[7px]" />
              <div class="typeName">银行卡转账</div>
            </div>
            <div class="right" @click="handleAddCard('bank')">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
      <ui-badge class="bind-account__wrap" v-if="canAliAccount">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_normal_zfb.png" alt="." class="w-[25px] h-[25px] mr-[7px]" />
              <div class="typeName">支付宝</div>
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
              <img src="/siteadmin/pay-icon/icon_wallet_normal.png" alt="." class="w-[25px] h-[25px] mr-[7px]" />
              <div class="typeName">三方钱包</div>
            </div>
            <div class="right">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
      <ui-badge class="bind-account__wrap" v-if="numberCurrency">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_szhb_xnb.png" alt="." class="w-[25px] h-[25px] mr-[7px]" />
              <div class="typeName">数字货币</div>
            </div>
            <div class="right">
              <span class="right-text">添加</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
    </div>

    <pay-password-input :ref="setRefs('payPassWordInput')" />
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
        .animate__spin {
          animation: spin 0.7s linear infinite; /* 2秒一次，匀速，无限循环 */
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
