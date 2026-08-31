<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { storeToRefs } from 'pinia';
import useAuthStore from '@/store/modules/user';
import useWithdrawStore from '@/store/modules/withdraw';
import ApplyBankWithdraw from '@/components/Withdraw/ApplyBankWithdraw.vue';
import ApplyNumberWithdraw from '@/components/Withdraw/ApplyNumberWithdraw.vue';
import ApplyWalletWithdraw from '@/components/Withdraw/ApplyWalletWithdraw.vue';

const walletIsLoading = ref(false);
const auth = useAuthStore();
const withdrawStore = useWithdrawStore();
const { withdrawInfo, userCardList } = storeToRefs(withdrawStore);
const typeList = computed(() => {
  return withdrawStore.withdrawInfo.isHaveNo ? [
    { id: 0, name: '钱包' },
    { id: 1, name: '正常提现' },
    { id: 2, name: '转为数字货币' },
    { id: 3, name: '三方钱包' }
  ] : [
    { id: 1, name: '正常提现' },
    { id: 2, name: '转为数字货币' },
    { id: 3, name: '三方钱包' }
  ];
})
const selectTypeId = ref(0);
provide('userCardList', userCardList);

function handleChangeType(item) {
  selectTypeId.value = item.id;
}

const updateWallet = () => {
  walletIsLoading.value = true;
  Promise.allSettled([auth.updateInfo(), withdrawStore.updateWithdrawInfo()]).finally(() => {
    walletIsLoading.value = false;
    selectTypeId.value = withdrawStore.withdrawInfo.isHaveNo ? 0 : 1
  });
};

onMounted(() => updateWallet());
</script>

<template>
  <div class="apply-box">
    <div class="content-box">
      <div class="withdraw-info-main">
        <div class="withdraw-info">
          <div class="left">
            余额&nbsp;<span class="currency">{{ auth.user.money }}</span
            >&nbsp;
            <div class="refresh-icon" :class="[walletIsLoading ? 'ml-[4px] animate__spin' : 'ml-[4px]']" @click="updateWallet">
              <svg width="1em" height="1em" fill="#F0C059" class="">
                <use xlink:href="#comm_icon_sx"></use>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="choose-type">
        <div
          class="choose-item"
          :class="{ 'choose-item-active': selectTypeId == item.id }"
          v-for="(item, index) in typeList"
          :key="index"
          @click="handleChangeType(item)"
        >
          <img src="/siteadmin/skin/lobby_asset/icon_cz_no.avif" v-if="item.id == 0" class="no-icon" />
          {{ item.name }}
        </div>
      </div>
      <no-wallet-info v-if="selectTypeId == 0" :walletData="withdrawInfo" />
      <apply-bank-withdraw v-if="selectTypeId == 1" />
      <apply-number-withdraw v-if="selectTypeId == 2" />
      <apply-wallet-withdraw v-if="selectTypeId == 3" />
    </div>
  </div>
</template>

<style scoped lang="less">
.apply-box {
  height: 100%;
  overflow: auto;
  position: relative;
  .content-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    .withdraw-info-main {
      background-color: var(--skin__bg_2);
      border-bottom: thin solid var(--skin__border);
      padding: 10px;
      .withdraw-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: auto;
        .left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-size: 12px;
          color: #656565;

          .currency {
            color: #ffaa09;
            font-weight: 700;
            white-space: nowrap;
          }
        }
      }
    }

    .choose-type {
      width: 100%;
      height: 66px;
      background: var(--skin__bg_2);
      border-bottom: thin solid var(--skin__border);
      cursor: pointer;
      padding: 15px 10px;
      display: flex;

      .choose-item {
        position: relative;
        //flex: 1;
        width: calc(25% - 1px);
        height: 35px;
        border-radius: 7px;
        margin-right: 5px;
        color: var(--skin__lead);
        border: thin solid var(--skin__border);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        font-size: 11px;
        .no-icon {
          width: 20px;
          height: 10px;
          font-size: 12px;
          margin-right: 2px;
        }

        &:last-child {
          margin: 0;
        }
      }
      .choose-item-active {
        border-color: var(--skin__primary);
        color: var(--skin__primary);
      }
    }
  }

  .animate__spin {
    animation: spin 0.5s linear infinite; /* 2秒一次，匀速，无限循环 */
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
