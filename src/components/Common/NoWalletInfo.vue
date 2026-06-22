<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { service } from '@/api/service';
import UiLoading from '@/components/UI/loading.vue';
import { formatMoney } from '@/utils/common';
const walletInfo = ref<any>({});
const isLoadSuccess = ref(false);

function init() {
  service.base.recharge.siteWalletInfo({ keyword: 'wallet-no' }).then(res => {
    isLoadSuccess.value = true;
    walletInfo.value = res;
  });
}

onMounted(() => init());
</script>

<template>
  <div v-if="!isLoadSuccess" class="w-[100%] flex items-center justify-center pt-[40%]">
    <ui-loading />
  </div>
  <template v-else>
    <div class="no-wallet-bind" v-if="walletInfo && !walletInfo?.bind">
      <div class="bindTips"><span>已有账号，可登录绑定</span><span>首次使用？只需设置支付密码</span></div>
      <div class="content">
        <div class="bind">
          <x-button type="primary" plain>立即绑定</x-button>
        </div>
        <div class="setting">
          <x-button type="primary">立即设置</x-button>
        </div>
      </div>
      <div class="intro">用NO钱包：赚积分，抽大奖，最高<span>88,888.88CNY</span></div>
      <section class="guaranteedClaimsTips">
        <p class="">
          <span class="verify-icon">
            <svg-icon name="comm_icon_gou" class-name="icon-g mt-[4px]" />
            <custom-svg-image src="@/assets/common/comm_icon_dblp_1.svg" class="icon-s" />
            <custom-svg-image src="@/assets/common/comm_icon_dblp_2.svg" class-name="icon-s" />
          </span>
          <span> 本站由第三方担保机构“NO钱包”提供<span class="colorAccent1">全方位保障</span> </span>
          <span>，</span>
          <span>支持查验网址和理赔服务<span>，</span></span>
          <span>资金可安心存在账户<span>，</span>详见</span>
          <span class="openUrl">担保规则</span>。
        </p>
      </section>
    </div>
    <x-form class="form-box">
      <div v-if="!!Number(walletInfo.bind)" class="wallet-info">
        <div class="balance">
          <img src="/siteadmin/skin/lobby_asset/icon_cz_no.avif" alt="" srcset="" class="icon" />
          <span class="label">钱包余额</span>
          <span class="noBalance">{{ formatMoney(walletInfo.rmbBalance) }}</span>
          <x-button size="mini">挂单出售</x-button>
        </div>
        <div class="account">
          (
          <span class="label">已绑定NO钱包账号</span><span class="noId">{{ walletInfo.qAccount }}</span>
          <span class="ml-[1px] w-[15px]"><copy :text="walletInfo.qAccount" class-name="!text-[12px]" /></span>
          )
        </div>
      </div>
      <div class="amountInputWrapper">

      </div>
      <x-form-item>
        <x-input />
      </x-form-item>
    </x-form>
  </template>
</template>

<style scoped lang="less">
.no-wallet-bind {
  margin: 15px 10px;
  text-align: center;
  .bindTips {
    display: flex;
    justify-content: space-between;
    span {
      flex: 1;
      color: var(--skin__neutral_2);
      font-size: 11px;
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
    .bind {
      width: calc(50% - 5px);
      color: var(--skin__neutral_2);
      font-size: 9px;
    }
    .setting {
      width: calc(50% - 5px);
      color: var(--skin__neutral_2);
      font-size: 9px;
    }
    .bind,
    .setting {
      :deep(button) {
        width: 100%;
        height: 35px;
        margin-top: 5px;
        padding: 6.5px 0;
        font-size: 12px;
      }
    }
  }
  .intro {
    margin-top: 15px;
    color: var(--skin__lead);
    font-size: 12px;
    span {
      display: inline-block;
      color: #ffaa09;
    }
  }
  .guaranteedClaimsTips {
    display: flex;
    padding: 10px 0;
    font-size: 12px;
    text-align: left;
    p {
      color: var(--skin__lead);
      line-height: 18px;
      word-break: break-word;
      span {
        margin: 0;
        padding: 0;
      }
      .colorAccent1 {
        color: var(--skin__accent_1);
      }
      .openUrl {
        color: var(--skin__primary);
      }
    }
    .verify-icon {
      position: relative;
      display: block;
      float: left;
      width: 15px;
      height: 15px;
      margin-top: 1px;
      margin-right: 2.5px;
      text-align: left;
      .icon-g {
        position: relative;
        left: 50%;
        z-index: 2;
        width: 4px;
        height: 3px;
        color: #fff;
        transform: translate(-50%);
      }
      .icon-s {
        position: absolute;
        right: 0;
        bottom: 0;
        color: var(--skin__accent_1);
        font-size: 15px;
      }
    }
  }
}

.form-box {
  padding: 10px;
}

.wallet-info {
  margin-top: 10px;
  position: relative;
  top: -10px;
  .balance {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--skin__lead);
    margin-top: 0;
    .icon {
      width: 20px;
      margin-right: 5px;
    }
    .label {
      color: var(--skin__neutral_2);
    }
    .noBalance {
      font-size: 12px;
      font-weight: 700;
      margin: 0 5px;
      color: var(--skin__primary);
    }
  }
  .account {
    color: var(--skin__neutral_2);
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 0;
    > span {
      font-size: 12px;
      line-height: 12px;
    }
    .noId {
      font-size: 12px;
      color: var(--skin__neutral_1);
    }
  }
}

.amountInputWrapper {

}
</style>
