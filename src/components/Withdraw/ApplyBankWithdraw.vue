<script setup lang="ts">
import { computed, inject, ref, Ref, watch } from "vue";
import { desensitizeWithLodash, showCustomToast } from "@/hooks/useCommon";

import useAuthStore from "@/store/modules/user";
import { service } from "@/api/service";

const auth = useAuthStore();
const canWithdraw = computed(() => {
  const { password, card_id, money } = formData.value;
  return password && password.length == 6 && card_id && money && money > 0;
});
const showEye = ref(false);
const showKeyboard = ref(false);
const handleShowPassword = () => (showKeyboard.value = true);
const hideKeyboard = () => (showKeyboard.value = false);
const formData = ref<any>({});
const userCardList = inject<Ref<any[]>>("userCardList");
const withdrawCardList = computed(() => userCardList.value.filter(v => v.type == 0 || v.type == 3));
const withdrawCardOptions = computed(() =>
  withdrawCardList.value.map(option => ({
    ...option,
    label: `${option.bank_name} (${desensitizeWithLodash(option.bank_number)})`,
    icon: option.bank_icon
  }))
);
const selectCardInfo = computed(() => withdrawCardList.value.find(v => v.id == formData.value.card_id) ?? {});
const isCardUnavailable = computed(() => selectCardInfo.value?.disabled || !selectCardInfo.value?.id);
const withdrawLoading = ref(false);

function init() {
  const list = withdrawCardList.value;
  if (list.length) {
    const defaultIndex = list.findIndex(v => v.is_default);
    formData.value.card_id = list[defaultIndex === -1 ? 0 : defaultIndex]?.id;
  }
}

function withdrawAll() {
  formData.value.money = Number(auth.user.money) ?? 0;
}

watch(
  () => userCardList.value,
  () => {
    init();
  },
  { immediate: true }
);

function handleApplyWithdraw() {
  withdrawLoading.value = true;
  service.base.withdraw
    .applyWithdraw(formData.value)
    .finally(() => (withdrawLoading.value = false))
    .then(() => {
      formData.value = {};
      init();
      showCustomToast({ message: "申请成功", type: "success" });
      auth.updateInfo();
    });
}
</script>

<template>
  <div class="apply-box">
    <x-form :model="formData">
      <x-form-item class="apply-card-select" style="padding-right: 35px; position: relative" v-if="formData.card_id">
        <x-select
          v-model="formData.card_id"
          :options="withdrawCardOptions"
          value-key="id"
          label-key="label"
          icon-key="icon"
          placeholder="请选择发卡银行"
        />
        <div class="absolute right-0 flex items-center justify-end h-[40px]">
          <svg-icon name="icon_tx_txgl" class-name="text-[25px] main-text"></svg-icon>
        </div>
      </x-form-item>
      <x-form-item v-if="formData.card_id">
        <x-input
          :disabled="isCardUnavailable"
          :placeholder="
            isCardUnavailable
              ? '该渠道维护中，无法提现'
              : `最低${Number(selectCardInfo?.min ?? 0)}，最高${Number(selectCardInfo?.max ?? 0)}`
          "
          v-model="formData.money"
        >
          <template #prefix>
            <div class="text-white text-[12px]">￥</div>
          </template>
          <template #suffix>
            <div class="main-text text-[11px]" @click="withdrawAll">全部</div>
          </template>
        </x-input>
      </x-form-item>
      <x-form-item v-if="!formData.card_id">
        <x-input readonly placeholder="添加提现账户" v-model="formData.money">
          <template #prefix>
            <svg-icon name="img_tx_tjzh" class-name="text-[25px] text-[#F4F0EC]" />
          </template>
          <template #suffix>
            <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[10px] text-[#757575]" />
          </template>
        </x-input>
      </x-form-item>
      <x-form-item v-if="!formData.card_id">
        <x-input readonly placeholder="请先添加提现账户才能提现">
          <template #prefix>
            <div class="text-white text-[11px]">￥</div>
          </template>
        </x-input>
      </x-form-item>
      <div class="line"></div>
      <div class="form-item-title">
        <span>验证提现密码</span>
        <svg-icon
          name="comm_icon_hide"
          class-name="text-[18px] text-[#242424]"
          v-if="!showEye"
          @click="showEye = !showEye"
        />
        <svg-icon name="comm_icon_show" class-name="text-[18px] main-text" v-if="showEye" @click="showEye = !showEye" />
      </div>
      <x-form-item class="form-withdraw-pass">
        <van-password-input
          :mask="!showEye"
          :value="formData.password"
          :focused="showKeyboard"
          @focus="handleShowPassword"
        />
      </x-form-item>
      <div class="button-list">
        <x-button type="primary" class="button" plain>赚取利息</x-button>
        <van-badge content="年利率88%" position="top-left" :offset="['7%', '1%']" class="absolute"></van-badge>
        <x-button
          type="primary"
          class="button"
          :disabled="!canWithdraw"
          @click="handleApplyWithdraw"
          :loading="withdrawLoading"
        >
          确定提现
        </x-button>
      </div>
    </x-form>
    <teleport to="body">
      <div class="absolute z-[99999] input-keyboard">
        <van-number-keyboard :maxlength="6" v-model="formData.password" :show="showKeyboard" @blur="hideKeyboard" />
      </div>
    </teleport>
  </div>
</template>

<style scoped lang="less">
.apply-box {
  padding: 10px;
  .line {
    height: 0.5px;
    background: var(--skin__border);
    margin: 10px 0;
  }
  .form-item-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    span {
      color: var(--skin__lead);
      font-size: 12px;
    }
  }

  .button-list {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 10px;
    position: relative;
    .button {
      flex: 1;
    }
    :deep(.van-badge) {
      display: inline-block;
      box-sizing: border-box;
      min-width: 16px;
      padding: 0 4px;
      color: #fff;
      height: 13px;
      text-align: center;
      background: var(--skin__accent_2);
      border-radius: 6.5px 6.5px 6.5px 0;
      font-size: 9px;
      font-weight: 400;
      font-stretch: normal;
      font-style: normal;
      line-height: 13px;
      letter-spacing: normal;
      overflow: visible;
      vertical-align: middle;
      --van-badge-border-width: 0px;
      &::before {
        content: "";
        display: inline-block;
        position: absolute;
        bottom: -3px;
        z-index: 20;
        left: 0;
        width: 0;
        height: 0;
        border-left: 4px solid var(--skin__accent_2);
        border-top: 3.3px solid transparent;
        border-bottom: 3.3px solid transparent;
        font-size: 0;
      }
    }
  }
  :deep(.x-input__field) {
    font-weight: 700;
    font-size: 15px;
    &::placeholder {
      font-weight: normal;
      font-size: 12px;
    }
  }
}

.apply-card-select {
  :deep(.x-select) {
    padding-right: 12 px;
  }

  :deep(.x-select__icon-wrap) {
    padding-right: 10px;
  }

  :deep(.x-select__icon),
  :deep(.x-select-options__icon) {
    width: 24px;
    height: 24px;
    border-radius: 5px;
  }

  :deep(.x-select__label),
  :deep(.x-select-options__content) {
    color: white;
  }

  :deep(.x-select__label) {
    max-width: 100%;
  }
}

.form-withdraw-pass {
  --van-password-input-margin: 0.5px;
  --van-password-input-background: transparent;
  --van-border-color: #242424;
  --van-password-input-radius: 7px;
  --van-password-input-dot-color: #fff;
  --van-password-input-text-color: white;
  --van-password-input-dot-size: 13px;
  --van-password-input-cursor-width: 1.5px;
  --van-password-input-cursor-color: white;
  border: solid 0.5px #242424;
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
