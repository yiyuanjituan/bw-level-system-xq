<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { service } from '@/api/service';
import UiLoading from '@/components/UI/loading.vue';
import { formatMoney } from '@/utils/common';
import useAuthStore from '@/store/modules/user';
import type { XFormRules } from '@/components/X/x-form-context';
import router from '@/router';
const walletInfo = ref<any>({});
const isLoadSuccess = ref(false);
const showPassword = ref(false);
const showKeyboard = ref(false);
const formModel = ref<any>({
  bindWithdrawNum: ''
});
const formRules = ref<XFormRules>({
  bindWithdrawNum: [
    { required: true, message: '提现金额不能为空', trigger: ['input', 'blur'] },
    {
      validator: (_rule, value, callback) => {
        if (value === '' || value === null || value === undefined) {
          callback();
          return;
        }

        const amount = Number(value);
        if (!/^\d+$/.test(String(value))) {
          callback(new Error('提现金额只能为整数'));
          return;
        }
        if (!Number.isInteger(amount) || amount <= 0) {
          callback(new Error('提现金额必须大于0'));
          return;
        }

        callback();
      },
      trigger: ['input', 'blur']
    }
  ]
});
const withdrawPassword = ref<any>();
const auth = useAuthStore();
function jumpToLiXiBao() {
  router.push('/home/yuebao');
}

function init() {
  service.base.recharge.siteWalletInfo({ keyword: 'wallet-no' }).then(res => {
    isLoadSuccess.value = true;
    walletInfo.value = res;
  });
}

function selectAll() {
  formModel.value.bindWithdrawNum = parseInt(auth.user.money);
}
function handleShowPassword() {
  showKeyboard.value = true;
}
function hideKeyboard() {
  showKeyboard.value = false;
}
function onKeyboardInput() {
  nextTick(() => {
    if (withdrawPassword.value && withdrawPassword.value.length >= 6) {
      hideKeyboard();
    }
  });
}

function handleSubmit() {

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
    <x-form class="form-box" :rule="formRules" :model="formModel">
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
        <x-form-item prop="bindWithdrawNum">
          <span class="item__label" style="width: auto">
            <span class="item__label-text">提现金额</span>
          </span>
          <x-input placeholder="最低100，最高50000" v-model="formModel.bindWithdrawNum" type="number">
            <template #prefix>
              <div class="prefix-box">￥</div>
            </template>
            <template #suffix>
              <div class="suffix-box" @click.stop="selectAll">全部</div>
            </template>
          </x-input>
        </x-form-item>
      </div>
      <div class="bindAccountSplitLine"></div>
      <x-form-item>
        <span class="item__label" style="width: auto">
          <span class="item__label-text">验证提现密码</span>
        </span>
        <div class="password-input">
          <van-password-input :mask="!showPassword" :value="withdrawPassword" :focused="showKeyboard" @focus="handleShowPassword" />
        </div>
      </x-form-item>
      <div class="btn-group">
        <x-badge class="flex-1" content="年利率88%" position="top-left" :translate-x="false" bg-color="var(--skin__accent_1)">
          <x-button plain class="!w-[100%]" type="primary" @click="jumpToLiXiBao">赚取利息</x-button>
        </x-badge>
        <x-button @click="handleSubmit">确定提现</x-button>
      </div>
    </x-form>
    <teleport to="body">
      <div class="absolute z-[99999] input-keyboard">
        <van-number-keyboard :maxlength="6" v-model="withdrawPassword" :show="showKeyboard" @blur="hideKeyboard" @input="onKeyboardInput" />
      </div>
    </teleport>
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
  .password-input {
    box-sizing: border-box;
    --van-password-input-margin: 0.5px;
    --van-password-input-background: transparent;
    --van-border-color: var(--skin__neutral_3);
    --van-password-input-radius: 7px;
    --van-password-input-dot-color: #fff;
    --van-password-input-text-color: white;
    --van-password-input-dot-size: 13px;
    --van-password-input-cursor-width: 1.5px;
    --van-password-input-cursor-color: white;
    border: solid 0.5px var(--van-border-color);
    border-radius: var(--van-password-input-radius);

    :deep(.van-password-input) {
      border-radius: var(--van-password-input-radius);
      overflow: hidden;
    }
    :deep(.van-hairline--surround) {
      &::after {
        border-width: 0;
      }
    }
    :deep(.van-password-input__item--focus) {
      border: solid 1px var(--skin__primary);
    }
    :deep(.van-password-input__item) {
      &:first-child {
        border-radius: var(--van-password-input-radius) 0 0 var(--van-password-input-radius);
      }
      &:last-child {
        border-radius: 0 var(--van-password-input-radius) var(--van-password-input-radius) 0;
      }
      background: var(--skin__bg_2);
    }
  }
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

.item__label {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-size: 13px;
  .item__label-text {
    word-wrap: break-word;
    color: var(--skin__lead);
  }
}
.amountInputWrapper {
  .prefix-box {
    width: 28px;
    padding-right: 10px;
    color: var(--skin__lead);
    font-size: 12px !important;
    display: inline-block;
    text-align: center;
    line-height: 1;
  }
  .suffix-box {
    color: var(--skin__primary);
    font-size: 12px;
    padding-left: 10px;
  }
  :deep(.x-input__field) {
    font-size: 15px;
    &::placeholder {
      font-size: 12px !important;
    }
  }
}
.bindAccountSplitLine {
  height: 0.5px;
  background: var(--skin__border);
  margin: 10px 0;
}
.btn-group {
  display: flex;
  position: relative;
  gap: 10px;
  padding-top: 10px;
  :deep(button) {
    flex: 1;
    height: 40px;
  }
}

.input-keyboard {
  :deep(.van-number-keyboard) {
    --van-number-keyboard-background: #000;
    --van-number-keyboard-key-background: #191919;
    --van-number-keyboard-key-height: 46px;
    --van-number-keyboard-key-font-size: 21px;
  }
  :deep(.van-key__wrapper) {
    color: #bcbcbc;
  }
  :deep(.van-key--active) {
    background: #191919 !important;
  }
}
</style>
