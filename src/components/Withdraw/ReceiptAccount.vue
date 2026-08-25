<script setup lang="ts">
import { $t } from "@/locales";
import { onMounted, provide, ref } from "vue";
import useAuthStore from "@/store/modules/user";
import UiBadge from "@/components/UI/badge.vue";
import useAppStore from "@/store/modules/app";
import { getWithdrawInfo, setDefault } from "@/api/common";
import { useRefs } from "@/hooks/useRefs";
import { desensitizeWithLodash, showCustomToast } from "@/hooks/useCommon";
import AddThirdWallet from "@/components/Withdraw/AddThirdWallet.vue";

const { refs, setRefs } = useRefs();
const showEye = ref(false);

const app = useAppStore();
const walletIsLoading = ref(false);
const listData = ref([])
const bankList = ref([])
const thirdList = ref([])

const canAliAccount = ref(true) // 是否支持绑定支付宝
const numberCurrency = ref(true) // 是否支持绑定数字货币
type addCardType = 'bank'|'alipayAccount'|'thirdWallet'|'number'
const addType = ref<addCardType>('bank')

provide('bankList', bankList)
provide('thirdList', thirdList)

const updateWallet = () => {
  walletIsLoading.value = true;
  init();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 1000);
};

function handleAddCard(type: addCardType = 'bank') {
  refs.payPassWordInput?.open()
  addType.value = type
}

function handleInputPasswordTrue() {
  if (addType.value == 'bank') {
    refs.addBank?.open()
  } else if (addType.value == 'alipayAccount') {
    refs.addAliPayAccount?.open()
  } else if (addType.value == 'thirdWallet') {
    refs.addThirdWallet?.open()
  } else if (addType.value == 'number') {
    refs.addNumberCurrency?.open()
  }
}

function init() {
  getWithdrawInfo().then(data => {
    listData.value = data?.cardList ?? [];
    canAliAccount.value = !!data?.supportAlipayAccount;
    numberCurrency.value = !!data?.numberCurrency;
    bankList.value = data?.bankList ?? [];
    thirdList.value = data?.thirdList ?? [];
  })
}

// 设置默认的信息
function handleSetDefault(record) {
  if (record.is_default) return;
  setDefault({ id: record.id }).then(() => {
    updateWallet()
    showCustomToast({ type: 'success', message: $t("设置成功！") })
  })
}

onMounted(() => updateWallet())
</script>

<template>
  <div class="receipt-account">
    <div class="manager-container">
      <div class="title">
        <div class="left">
          收款账户
          <span class="number">({{ listData.length }}/{{ app.appInfo?.maxBindNum }})</span>
          <svg-icon name="comm_icon_retry" class-name="text-[14px] refresh-icon" :class="[walletIsLoading ? 'ml-[0px] animate__spin' : 'ml-[4px]']" @click="updateWallet" />
        </div>
        <div class="right">
          <template v-if="listData.length > 0">
            <svg-icon name="comm_icon_hide" class-name="eye-icon" v-if="!showEye" @click="showEye = !showEye" />
            <svg-icon name="comm_icon_show" class-name="eye-icon main-text" v-if="showEye" @click="showEye = !showEye" />
          </template>
        </div>
      </div>
      <div class="account-list">
        <div class="cell" :class="{ 'cell-active': item.is_default }" v-for="(item, index) in listData" :key="index">
          <div class="left">
            <img :src="item.bank_icon" alt="." class="icon">
            <div class="info">
              <div class="bank-name">{{ item.bank_name }}</div>
              <div class="bank-number">{{ showEye ? item.bank_number : desensitizeWithLodash(item.bank_number) }}</div>
            </div>
          </div>
          <div class="right">
            <span class="setDefault" :style="[item.is_default ? 'color: var(--skin__neutral_2)': '']" @click="handleSetDefault(item)">{{ item.is_default ? '默认' : '设为默认' }}</span>
          </div>
          <div class="corner" v-if="item.is_default">
            <svg-icon name="comm_img_corner" />
            <svg-icon name="comm_icon_gou" class="!text-[#191919]" />
          </div>
        </div>
      </div>
    </div>
    <div class="bind-account">
      <ui-badge class="bind-account__wrap">
        <div class="cell">
          <div class="cell-container">
            <div class="left">
              <img src="/siteadmin/pay-icon/icon_bank_nromal.png" alt="." class="w-[25px] h-[25px] mr-[7px]" />
              <div class="typeName">{{ $t("银行卡转账") }}</div>
            </div>
            <div class="right" @click="handleAddCard('bank')">
              <span class="right-text">{{ $t("添加") }}</span>
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
              <div class="typeName">{{ $t("支付宝") }}</div>
            </div>
            <div class="right" @click="handleAddCard('alipayAccount')">
              <span class="right-text">{{ $t("添加") }}</span>
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
              <div class="typeName">{{ $t("三方钱包") }}</div>
            </div>
            <div class="right" @click="handleAddCard('thirdWallet')">
              <span class="right-text">{{ $t("添加") }}</span>
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
              <div class="typeName">{{ $t("数字货币") }}</div>
            </div>
            <div class="right" @click="handleAddCard('number')">
              <span class="right-text">{{ $t("添加") }}</span>
              <svg-icon name="comm_icon_fh" class-name="arrow-icon rotate-[180deg] ml-[7.5px] text-[13px]" />
            </div>
          </div>
        </div>
      </ui-badge>
    </div>

    <pay-password-input :ref="setRefs('payPassWordInput')" @input-true="handleInputPasswordTrue" />
    <add-bank :ref="setRefs('addBank')" @refresh="updateWallet" />
    <add-ali-pay-account :ref="setRefs('addAliPayAccount')" @refresh="updateWallet" />
    <add-third-wallet :ref="setRefs('addThirdWallet')" @refresh="updateWallet" />
    <add-number-currency :ref="setRefs('addNumberCurrency')" @refresh="updateWallet" />
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

    .account-list {
      max-height: calc(50vh - 50px);
      overflow: auto;
      .cell {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
        border-radius: 7px;
        padding: 4px 10px 3px;
        margin-top: 10px;
        min-height: 40px;
        .left {
          display: flex;
          align-items: center;
          .icon {
            width: 30px;
            height: 30px;
            border-radius: 5px;
            margin-right: 7px;
          }
          .bank-name {
            color: var(--skin__lead);
            max-width: 150px;
            height: 16px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 16px;
          }
          .bank-number {
            display: flex;
            align-items: center;
            color: var(--skin__neutral_2);
            height: 14.5px;
            max-width: 135px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-top: 1px;
          }
        }
        .right {
          display: flex;
          align-items: center;
          font-size: 11px;
          height: 30px;
          line-height: 1.5;
          padding-left: 10px;
          .setDefault {
            max-width: 100px;
            margin-right: 7.5px;
            color: var(--skin__primary);
            text-align: right;
            shape-outside: content-box;
            word-wrap: break-word;
            font-size: 11px;
          }
        }
      }
      .cell-active {
        border-color: var(--skin__primary);
        .corner {
          color: var(--skin__primary);
        }
      }
      .corner {
        position: absolute;
        height: 15px;
        width: 15px;
        right: -0.5px;
        bottom: -0.5px;
        .svg-icon {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          bottom: 0;
          color: var(--skin__filter_active);
          &:last-child {
            right: 2px;
            bottom: 2px;
            color: var(--skin__web_filter_gou);
            height: 5px;
            width: 7px;
            font-size: 12px;
          }
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
      border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
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
