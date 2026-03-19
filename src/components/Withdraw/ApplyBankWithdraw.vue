<script setup lang="ts">
import { computed, inject, onMounted, ref, Ref, watch } from "vue";
import { desensitizeWithLodash } from "@/hooks/useCommon";

import UiForm from "@/components/UI/form.vue";
import UiFormItem from "@/components/UI/form-item.vue";
import UiCommonSelect from "@/components/UI/common-select.vue";
import UiInput from "@/components/UI/input.vue";
import UiButton from "@/components/Common/Button.vue";
import useAuthStore from "@/store/modules/user";

const auth = useAuthStore()
const showEye = ref(false);
const showKeyboard = ref(false)
const handleShowPassword = () => showKeyboard.value = true;
const hideKeyboard = () => showKeyboard.value = false;
const formData = ref<any>({})
const userCardList = inject<Ref<any[]>>("userCardList")
const selectCardInfo = computed(() => {
  const data = userCardList.value.find(v => v.id == formData.value.card_id)
  return data ?? {}
})

const formRules = ref({
  realname: [
    { required: true, message: "真实姓名不能为空", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        const validators = [
          {
            pattern: /^[a-zA-Z\u4e00-\u9fa5]+(?:[·\-][a-zA-Z\u4e00-\u9fa5]+)*$/,
            message: "姓名格式错误"
          }
        ];
        // 只要有一个验证通过就返回成功
        for (const validator of validators) {
          if (validator.pattern.test(value)) {
            callback();
            return;
          }
        }
        // 如果都不通过，返回第一个错误信息
        callback(new Error(validators[0].message));
      },
      trigger: "blur"
    }
  ],
  bank_number: [
    { required: true, message: "支付宝账号不能为空", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        const validators = [
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "支付宝账号不合法,必须为手机或邮箱"
          },
          {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "支付宝账号不合法,必须为手机或邮箱"
          }
        ];
        // 只要有一个验证通过就返回成功
        for (const validator of validators) {
          if (validator.pattern.test(value)) {
            callback();
            return;
          }
        }
        // 如果都不通过，返回第一个错误信息
        callback(new Error(validators[0].message));
      },
      trigger: "blur"
    }
  ]
});

function init() {
  const list = userCardList.value.filter(v => v.type == 0 || v.type == 3);
  if (list && list.length) {
    const defaultIndex = list.findIndex(v => v.is_default)
    formData.value.card_id = list[defaultIndex === -1 ? 0 : defaultIndex]?.id;
  }
}

function withdrawAll() {
  formData.value.money = Number(auth.user.money) ?? 0
}

watch(() => userCardList.value, () => {
  init()
})

onMounted(() => init())
</script>

<template>
  <div class="apply-box">
    <ui-form>
      <ui-form-item style="padding-right: 35px; position: relative;" v-if="formData.card_id">
        <ui-common-select selectedSlot="body" optionSlot="option-cell" :options="userCardList.filter(v => v.type == 0 || v.type == 3)" value-field="id" label-field="bank_name" icon-field="bank_icon" v-model="formData.card_id" placeholder="请选择发卡银行">
          <template #body="{ option }">
            <div class="flex items-center">
              <img :src="option.bank_icon" alt="." class="w-[24px] h-[24px] mr-[10px] rounded-[5px]" />
              <span class="name">{{ option.bank_name }}</span>
              <span class="ltr">({{ desensitizeWithLodash(option.bank_number) }})</span>
            </div>
          </template>
          <template #option-cell="{ option, isActive }">
            <div class="flex items-center">
              <img :src="option.bank_icon" alt="." class="w-[24px] h-[24px] mr-[10px] rounded-[5px]" />
              <span class="name" :class="{ 'main-text': isActive }">{{ option.bank_name }}</span>
              <span class="ltr" :class="{ 'main-text': isActive }">({{ desensitizeWithLodash(option.bank_number) }})</span>
            </div>
          </template>
        </ui-common-select>
        <div class="absolute right-0 flex items-center justify-end h-[40px]">
          <svg-icon name="icon_tx_txgl" class-name="text-[25px] main-text"></svg-icon>
        </div>
      </ui-form-item>
      <ui-form-item v-if="formData.card_id">
        <ui-input
          :disabled="(selectCardInfo?.disabled || !selectCardInfo.id)"
          :placeholder="(selectCardInfo?.disabled || !selectCardInfo.id) ? '该渠道维护中，无法提现' : `最低${Number(selectCardInfo?.min ?? 0)}，最高${Number(selectCardInfo?.max ?? 0)}`"
          v-model="formData.money"
        >
          <template #prefix>
            <div class="text-white text-[12px]">￥</div>
          </template>
          <template #suffix>
            <div class="main-text text-[11px]" @click="withdrawAll">全部</div>
          </template>
        </ui-input>
      </ui-form-item>
      <ui-form-item v-if="!formData.card_id">
        <ui-input readonly placeholder="添加提现账户" v-model="formData.money">
          <template #prefix>
            <svg-icon name="img_tx_tjzh" class-name="text-[25px] text-[#F4F0EC]" />
          </template>
          <template #suffix>
            <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[10px] text-[#757575]" />
          </template>
        </ui-input>
      </ui-form-item>
      <ui-form-item v-if="!formData.card_id">
        <ui-input readonly placeholder="请先添加提现账户才能提现">
          <template #prefix>
            <div class="text-white text-[11px]">￥</div>
          </template>
        </ui-input>
      </ui-form-item>
      <div class="line"></div>
      <div class="form-item-title">
        <span>验证提现密码</span>
        <svg-icon name="comm_icon_hide" class-name="text-[18px] text-[#242424]" v-if="!showEye" @click="showEye = !showEye" />
        <svg-icon name="comm_icon_show" class-name="text-[18px] main-text" v-if="showEye" @click="showEye = !showEye" />
      </div>
      <ui-form-item class="form-withdraw-pass">
        <van-password-input :mask="!showEye" :value="formData.password" :focused="showKeyboard" @focus="handleShowPassword" />
      </ui-form-item>
      <div class="button-list">
        <ui-button type="primary" class="button" plain>赚取利息</ui-button>
        <van-badge content="年利率88%" position="top-left" :offset="['7%','2%']" class="absolute"></van-badge>
        <ui-button type="info" class="button" disabled>确定提现</ui-button>
      </div>
    </ui-form>
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
  .name {
    max-width: 175px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11px;
    color: white;
  }
  .ltr {
    line-height: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11px;
    color: white;
  }
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
  :deep(.ui-input__field) {
    font-weight: 700;
    font-size: 15px;
    &::placeholder {
      font-weight: normal;
      font-size: 12px;
    }
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
    color: #BCBCBC;
  }
  :deep(.van-key--active) {
    background: #191919 !important;
  }
}
</style>
