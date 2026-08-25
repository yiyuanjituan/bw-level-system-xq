<script setup lang="ts">
import { $t } from "@/locales";
import UiInput from "@/components/UI/input.vue";
import UiForm from "@/components/UI/form.vue";
import UiFormItem from "@/components/UI/form-item.vue";
import { getCopyText, predictPhoneNumber } from "@/utils/common";
import { computed, ref, useTemplateRef } from "vue";
import PasswordPower from "@/components/Common/PasswordPower.vue";
import ChangeMode from "@/components/Common/ChangeMode.vue";
import { sendSms } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAppStore from "@/store/modules/app";
import { registerProps } from "@/enums/props";
import UiSelect from "@/components/UI/select.vue";
import type { FormExpose, FormRules } from "@/components/UI/form-context";

defineOptions({
  name: "register-popup"
});

const app = useAppStore()
let smsTimer = null;
const smsTime = ref<number>(0)
const smsLoading = ref<boolean>(false)
const modelValue = defineModel<registerProps>({
  type: Object,
  default: () => ({
    account: '',
    type: 'password',
    password: '',
    invite_code: '',
    two_password: '',
    sms_code: '',
    currency: '',
  })
});
const checkInputIsPhone = computed(() => {
  return predictPhoneNumber(modelValue.value.account, modelValue.value.type == 'sms')?.isValid;
});
// 校验规则
const formRef = useTemplateRef<FormExpose>('form')

const formRules = ref<FormRules>({
  account: [
    { required: true, message: $t("请输入手机号码/账号"), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const validators = [
          { pattern: /^[a-zA-Z0-9]{4,16}$/, message: $t("账号格式错误，请输入4-16位英文/数字") },
          { pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/, message: $t("区号 +86 支持11位手机号，请重新输入") }
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
      trigger: 'blur'
    }
  ],
  sms_code:
    (checkInputIsPhone.value && modelValue.value.type == "sms")
      ? [
        { required: true, message: $t("请输入验证码"), trigger: "blur" },
        { min: 4, max: 6, message: $t("请输入正确验证码"), trigger: "blur" }
      ]
      : [],
  password: [
    { required: true, message: $t("密码不能为空"), trigger: 'input' },
    { min: 6, max: 16, message: $t("6-16位，至少包含英文/数字/符号中的两种"), trigger: 'input' },
    { pattern: /^(?![a-zA-Z]+$)(?![0-9]+$)(?![^a-zA-Z0-9]+$)[a-zA-Z0-9\W_]{6,16}$/, message: $t("6-16位，至少包含英文/数字/符号中的两种"), trigger: "change" },
  ],
  two_password: [
    { required: true, message: $t("确认密码不能为空"), trigger: 'input' },
    {
      validator: (rule, value, callback) => {
        if (value == modelValue.value.password) {
          return callback();
        }
        return callback('两次密码输入不一致，请重新输入');
      },
      trigger: 'blur'
    }
  ],
  invite_code: [
    { required: false, message: $t("请输入邀请码"), trigger: 'blur' },
  ],
})

async function copyToForm() {
  modelValue.value.invite_code = await getCopyText();
}

function getSmsCode() {
  const pattern = /^1[3-9]\d{9}$/
  if (!pattern.test(modelValue.value.account)) {
    return false;
  }
  smsLoading.value = true;
  sendSms({ phone: modelValue.value.account, captchaId: '', code: '' }).then((_res) => {
    showCustomToast({ message: $t("验证码已发送，请查看短信，若未收到验证码，请仔细核对手机号码是否正确后再试。"), type: "success" });
    smsTime.value = 60
    smsTimer = setInterval(() => {
      smsTime.value = smsTime.value - 1
      if (smsTime.value <= 0) {
        clearInterval(smsTimer);
      }
    }, 1000)
  }).finally(() => smsLoading.value = false);
}

defineExpose({
  form: formRef,
})
</script>

<template>
  <div class="register-container">
    <section class="login-register-tab-sub-title">
      {{ $t("支持手机号码/账号注册") }}
    </section>
    <x-form :rule="formRules" :model="modelValue" ref="form">
      <x-form-item prop="account">
        <x-input prefix="user" required :placeholder="$t('请输入手机号码/账号')" :class="{ '!pl-[0px]': checkInputIsPhone }" v-model="modelValue.account">
          <template #prefix v-if="checkInputIsPhone">
            <div class="country-icon">
              <img src="@/assets/common/ChineseMainland.png" alt="." class="w-[18px] h-auto" />
              <span class="ml-[10px]">+86</span>
            </div>
          </template>
        </x-input>
      </x-form-item>
      <change-mode v-if="modelValue.type == 'password' && app.appInfo?.openSms" @change="modelValue.type = 'sms'" />
      <x-form-item prop="sms_code" v-if="checkInputIsPhone && modelValue.type == 'sms'">
        <x-input prefix="sms" required :placeholder="$t('请输入手机验证码')" v-model="modelValue.sms_code">
          <template #suffix>
            <span class="inline-flex items-center" @click.stop="getSmsCode" :class="[(smsTime>0&&checkInputIsPhone)?'':'text-[#F0C059]']">
              <svg-icon name="loading" class-name="mr-[4px] loading-icon" v-if="smsLoading" />
              {{ smsTime > 0 ? `${smsTime}秒后重发` : '获取验证码' }}
            </span>
          </template>
        </x-input>
      </x-form-item>
      <x-form-item prop="password">
        <x-input prefix="lock" required :placeholder="$t('请输入密码')" v-model="modelValue.password" show-eye />
      </x-form-item>
      <password-power :text="modelValue.password" />
      <x-form-item prop="two_password">
        <x-input prefix="lock" v-model="modelValue.two_password" required :placeholder="$t('请再次输入密码')" show-eye />
      </x-form-item>
      <x-form-item prop="currency" v-if="false">
        <x-select required :placeholder="$t('请输入密码')" v-model="modelValue.currency" show-eye :options="app.appInfo.countryList.map(v => ({ ...v, label: `${v.englishName}(${v.name})` }))" />
      </x-form-item>
      <x-form-item prop="invite_code">
        <x-input prefix="invite_code" v-model="modelValue.invite_code" :placeholder="$t('请输入您的邀请码')">
          <template #suffix>
            <span class="text-[#F0C059] text-[11px] cursor-pointer" @click="copyToForm">{{ $t("粘贴") }}</span>
          </template>
        </x-input>
      </x-form-item>
    </x-form>
  </div>
</template>

<style scoped lang="less">
.register-container {
  width: 375px;
  color: white;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 12px;
  max-height: calc(var(--max-height) - 420px);
  overflow: auto;

  .login-register-tab-sub-title {
    padding-bottom: 4px;
    color: white;
    font-size: 11px;
    line-height: 1.28;
    text-align: left;
  }

  :deep(.country-icon) {
    width: 76.5px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      width: 0.5px;
      top: 5px;
      bottom: 5px;
      background-color: #313843;
      right: 0;
    }
  }
}
.loading-icon {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
