<script setup lang="ts">
import UiForm from "@/components/UI/form.vue";
import UiFormItem from "@/components/UI/form-item.vue";
import UiInput from "@/components/UI/input.vue";
import { computed, ref, useTemplateRef } from "vue";
import { loginProps, registerProps } from "@/enums/props";
import useAppStore from "@/store/modules/app";
import { predictPhoneNumber } from "@/utils/common";
import { sendSms } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";

defineOptions({
  name: "login-popup"
});
const formRef = useTemplateRef('form')
const app = useAppStore()
let smsTimer = null;
const smsTime = ref<number>(0)
const smsLoading = ref<boolean>(false)
const modelValue = defineModel<loginProps>({
  type: Object,
  default: () => ({
    type: 'password',
  })
});


const formRules = ref({
  account: [
    { required: true, message: "请输入手机号码/账号", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        const validators = [
          { pattern: /^[a-zA-Z0-9]{4,16}$/, message: "账号格式错误，请输入4-16位英文/数字" },
          { pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/, message: "区号 +86 支持11位手机号，请重新输入" }
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
  sms_code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { min: 4, max: 6, message: "请输入正确验证码", trigger: "blur" }
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "input" },
    { min: 6, max: 16, message: "6-16位，至少包含英文/数字/符号中的两种", trigger: "input" },
    {
      pattern: /^(?![a-zA-Z]+$)(?![0-9]+$)(?![^a-zA-Z0-9]+$)[a-zA-Z0-9\W_]{6,16}$/,
      message: "6-16位，至少包含英文/数字/符号中的两种",
      trigger: "change"
    }
  ]
});
const isPhone = computed(() => {
  return predictPhoneNumber(modelValue.value.account, true)?.isValid;
});

function getSmsCode() {
  const pattern = /^1[3-9]\d{9}$/
  if (!pattern.test(modelValue.value.account)) {
    return false;
  }
  smsLoading.value = true;
  sendSms({ phone: modelValue.value.account, captchaId: '', code: '' }).then((_res) => {
    showCustomToast({ message: "验证码已发送，请查看短信，若未收到验证码，请仔细核对手机号码是否正确后再试。", type: "success" });
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
  <div class="login-container">
    <section class="login-register-tab-sub-title" v-if="app.appInfo.openSms">
      {{ $t("支持手机号码/账号登录") }}
    </section>
    <ui-form :rule="formRules" :model="modelValue" ref="form">
      <ui-form-item prop="account">
        <ui-input prefix="user" required :placeholder="app.appInfo.openSms ? '请输入手机号码/账号' : '请输入账号'" :class="{ '!pl-[0px]': isPhone && modelValue.accountType == 'phone' && app.appInfo.openSms }" v-model="modelValue.account" >
          <template #prefix v-if="isPhone && modelValue.accountType == 'phone' && app.appInfo.openSms">
            <div class="country-icon">
              <img src="@/assets/common/ChineseMainland.png" alt="." class="w-[18px] h-auto" />
              <span class="ml-[10px]">+86</span>
            </div>
          </template>
        </ui-input>
      </ui-form-item>
      <template v-if="isPhone && app.appInfo.openSms">
        <login-type-select v-model="modelValue.accountType" v-if="modelValue.account?.length" />
        <login-mode v-model="modelValue.type" v-if="modelValue.accountType == 'phone'" />
      </template>
      <ui-form-item prop="sms_code" v-if="modelValue.accountType == 'phone' && modelValue.type == 'sms'">
        <ui-input prefix="sms" required placeholder="请输入手机验证码" v-model="modelValue.sms_code">
          <template #suffix>
            <span
              class="inline-flex items-center"
              @click="getSmsCode"
              :class="[
                smsTime > 0 && (isPhone && modelValue.accountType == 'phone') ? '' : 'text-[#F0C059]'
              ]"
            >
              <svg-icon
                name="loading"
                class-name="mr-[4px] loading-icon"
                v-if="smsLoading"
              />
              {{ smsTime > 0 ? `${smsTime}秒后重发` : "获取验证码" }}
            </span>
          </template>
        </ui-input>
      </ui-form-item>
      <ui-form-item prop="password" v-if="!(modelValue.accountType == 'phone' && modelValue.type == 'sms')">
        <ui-input
          prefix="lock"
          required
          placeholder="请输入密码"
          v-model="modelValue.password"
          show-eye
        />
      </ui-form-item>
    </ui-form>
  </div>
</template>

<style scoped lang="less">
.login-container {
  width: 330px;
  color: white;
  padding-left: 15px;
  font-size: 12px;
  max-height: calc(var(--max-height) - 420px);
  overflow: auto;

  .login-register-tab-sub-title {
    font-size: 11px;
    padding-bottom: 4px;
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
</style>