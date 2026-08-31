<script setup lang="ts">
import { $t } from "@/locales";
import { computed, inject, ref, Ref, watch } from 'vue';
import { desensitizeWithLodash, showCustomToast } from '@/hooks/useCommon';

import useAuthStore from '@/store/modules/user';
import { service } from '@/api/service';
import router from '@/router';
import type { XFormRules } from '@/components/X/x-form-context';

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
const userCardList = inject<Ref<any[]>>('userCardList');
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
const formRef = ref<{ validate: () => Promise<void> } | null>(null);
const formRules = ref<XFormRules>({
  card_id: [
    { required: true, message: $t("请选择提现账户"), trigger: ['change', 'blur'] },
    {
      validator: (_rule, value, callback) => {
        if (value === '' || value === null || value === undefined) {
          callback();
          return;
        }
        if (isCardUnavailable.value) {
          callback(new Error($t("该渠道维护中，无法提现")));
          return;
        }

        callback();
      },
      trigger: ['change', 'blur']
    }
  ],
  money: [
    { required: true, message: $t("提现金额不能为空"), trigger: ['input', 'blur'] },
    {
      validator: (_rule, value, callback) => {
        if (value === '' || value === null || value === undefined) {
          callback();
          return;
        }

        const amount = Number(value);
        const min = Number(selectCardInfo.value?.min ?? 0);
        const max = Number(selectCardInfo.value?.max ?? 0);
        if (!/^\d+$/.test(String(value))) {
          callback(new Error($t("提现金额只能为整数")));
          return;
        }
        if (!Number.isInteger(amount) || amount < min) {
          callback(new Error(`提现金额不能小于${min}`));
          return;
        }
        if (!Number.isInteger(amount) || amount > Number(auth.user.money)) {
          callback(new Error($t("余额不足")));
          return;
        }
        if (!Number.isInteger(amount) || amount > max) {
          callback(new Error(`提现金额不能大于${max}`));
          return;
        }

        callback();
      },
      trigger: ['input', 'blur']
    }
  ],
  password: [
    { required: true, message: $t("请输入提现密码"), trigger: ['input', 'blur'] },
    {
      validator: (_rule, value, callback) => {
        if (value === '' || value === null || value === undefined) {
          callback();
          return;
        }
        if (!/^\d{6}$/.test(String(value))) {
          callback(new Error($t("提现密码必须为6位数字")));
          return;
        }

        callback();
      },
      trigger: ['input', 'blur']
    }
  ]
});

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

function jumpToAddCard() {
  router.push('/home/withdraw?active=10');
}

watch(
  () => userCardList.value,
  () => {
    init();
  },
  { immediate: true }
);

async function handleApplyWithdraw() {
  try {
    await formRef.value?.validate();
    withdrawLoading.value = true;
    service.base.withdraw
      .applyWithdraw(formData.value)
      .finally(() => (withdrawLoading.value = false))
      .then(() => {
        formData.value = {};
        init();
        showCustomToast({ message: $t("申请成功"), type: 'success' });
        auth.updateInfo();
      });
  } catch {
    return;
  }
}
</script>

<template>
  <div class="apply-box">
    <x-form ref="formRef" :rule="formRules" :model="formData">
      <x-form-item prop="card_id" class="apply-card-select" style="padding-right: 35px; position: relative" v-if="formData.card_id">
        <x-select
          v-model="formData.card_id"
          :options="withdrawCardOptions"
          value-key="id"
          label-key="label"
          icon-key="icon"
          :placeholder="$t('请选择发卡银行')"
        />
        <div class="absolute right-0 flex items-center justify-end h-[40px]" @click="jumpToAddCard">
          <svg-icon name="icon_tx_txgl" class-name="text-[25px] main-text"></svg-icon>
        </div>
      </x-form-item>
      <x-form-item prop="money" v-if="formData.card_id">
        <x-input
          :disabled="isCardUnavailable"
          :placeholder="
            isCardUnavailable ? '该渠道维护中，无法提现' : `最低${Number(selectCardInfo?.min ?? 0)}，最高${Number(selectCardInfo?.max ?? 0)}`
          "
          v-model="formData.money"
        >
          <template #prefix>
            <div class="text-white text-[12px]">￥</div>
          </template>
          <template #suffix>
            <div class="main-text text-[11px]" @click="withdrawAll">{{ $t("全部") }}</div>
          </template>
        </x-input>
      </x-form-item>
      <x-form-item v-if="!formData.card_id">
        <x-input readonly :placeholder="$t('添加提现账户')" v-model="formData.money" @click="jumpToAddCard">
          <template #prefix>
            <svg-icon name="img_tx_tjzh" class-name="text-[25px] main-text" />
          </template>
          <template #suffix>
            <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[10px] text-[#757575]" />
          </template>
        </x-input>
      </x-form-item>
      <x-form-item v-if="!formData.card_id">
        <x-input readonly :placeholder="$t('请先添加提现账户才能提现')">
          <template #prefix>
            <div class="text-white text-[11px]">￥</div>
          </template>
        </x-input>
      </x-form-item>
      <div class="line"></div>
      <div class="form-item-title">
        <span>{{ $t("验证提现密码") }}</span>
        <svg-icon name="comm_icon_hide" class-name="text-[18px] text-[#242424]" v-if="!showEye" @click="showEye = !showEye" />
        <svg-icon name="comm_icon_show" class-name="text-[18px] main-text" v-if="showEye" @click="showEye = !showEye" />
      </div>
      <x-form-item prop="password">
        <div class="password-input">
          <x-password-input :mask="!showEye" :value="formData.password" :focused="showKeyboard" @focus="handleShowPassword" />
        </div>
      </x-form-item>
      <div class="button-list">
        <x-button type="primary" class="button" plain>{{ $t("赚取利息") }}</x-button>
        <van-badge :content="$t('年利率88%')" position="top-left" :offset="['7%', '1%']" class="absolute"></van-badge>
        <x-button type="primary" class="button" :disabled="!canWithdraw" @click="handleApplyWithdraw" :loading="withdrawLoading">
          {{ $t("确定提现") }}
        </x-button>
      </div>
    </x-form>
    <teleport to="body">
      <div class="absolute z-[99999] input-keyboard">
        <x-number-keyboard :maxlength="6" v-model="formData.password" :show="showKeyboard" @blur="hideKeyboard" />
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
        content: '';
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

</style>
