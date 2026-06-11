<script setup lang="ts">
import { inject, ref, useTemplateRef } from "vue";
import UiForm from "@/components/UI/form.vue";
import UiFormItem from "@/components/UI/form-item.vue";
import UiInput from "@/components/UI/input.vue";
import { useClipboard } from "@vueuse/core";
import UiCommonSelect from "@/components/UI/common-select.vue";
import UiButton from "@/components/Common/Button.vue";
import { bindCard } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import type { FormExpose, FormRules } from "@/components/UI/form-context";


const { isSupported } = useClipboard()
const emits = defineEmits(["refresh"]);
const formRef = useTemplateRef<FormExpose>('form')
const show = ref(false);
const isLoading = ref(false);

const bankList: any = inject("bankList");

const auth = useAuthStore()
const modelValue = ref<any>();
const formRules = ref<FormRules>({
  realname: [
    { required: true, message: "真实姓名不能为空", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        const validators = [
          { pattern: /^[a-zA-Z\u4e00-\u9fa5]+(?:[·\-][a-zA-Z\u4e00-\u9fa5]+)*$/, message: "姓名格式错误" },
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
    { required: true, message: "需输入银行卡号", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        const validators = [
          { pattern: /^(62|4|5)\d{14,17}$/, message: "错误的银行卡号" },
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
});
const copyToBankNumber = async () => {
  if (!isSupported.value) return false;
  try {
    modelValue.value.bank_number = await navigator.clipboard.readText()
  } catch (err) {
    console.error('粘贴失败:', err)
  }
};
const copyToBankAddress = async () => {
  if (!isSupported.value) return false;
  try {
    modelValue.value.address = await navigator.clipboard.readText()
  } catch (err) {
    console.error('粘贴失败:', err)
  }
};

function open() {
  show.value = true;
  modelValue.value = { bindType: 'bank' }
  isLoading.value = false;
  if (auth.user.realName) {
    modelValue.value.realname = auth.user.realName
  }
}

function close() {
  show.value = false;
}

function handleSubmit() {
  formRef.value.validate().then(() => {
    isLoading.value = !isLoading.value;
    // 处理绑卡的事情
    bindCard(modelValue.value).finally(() => isLoading.value = false).then(res => {
      close()
      showCustomToast({ type: 'success', message: '绑定成功！' })
      emits('refresh')
    })
  })
}

defineExpose({
  open
});
</script>

<template>
  <div>
    <van-dialog
      v-model:show="show"
      :showConfirmButton="false"
      teleport="body"
      :overlayStyle="{ 'backdrop-filter': `blur(5px)` }"
      class-name="pay-password-input"
    >
      <div class="dialog-container">
        <div class="dialog-body">
          <div class="header-box">
            <span>添加银行卡</span>
          </div>
          <div class="content-box">
            <x-form :rule="formRules" :model="modelValue" ref="form">
              <x-form-item prop="realname">
                <x-input placeholder="请填写真实姓名" prefix="input_icon_zsxm1" v-model="modelValue.realname" type="text" />
              </x-form-item>
              <x-form-item prop="bank_number">
                <x-input placeholder="请输入银行卡号" prefix="input_icon_card" v-model="modelValue.bank_number" type="number">
                  <template #suffix>
                    <span class="main-text" @click="copyToBankNumber">粘贴</span>
                  </template>
                </x-input>
              </x-form-item>
              <x-form-item prop="bank_id">
                <x-select prefix="input_icon_bank" :options="bankList.filter(v => v.type == 0)" value-field="id" label-field="bank_name" icon-field="bank_icon" v-model="modelValue.bank_id" placeholder="请选择发卡银行"></x-select>
              </x-form-item>
              <x-form-item prop="address">
                <x-input placeholder="请填写发卡地址" prefix="input_icon_dz" v-model="modelValue.address">
                  <template #suffix>
                    <span class="main-text" @click="copyToBankAddress">粘贴</span>
                  </template>
                </x-input>
              </x-form-item>
              <div class="mark">请认真核对姓名和卡号，否则将无法到账。</div>
              <x-button class="button" :loading="isLoading" type="primary" @click="handleSubmit">确 定</x-button>
            </x-form>
          </div>
        </div>
      </div>
      <div class="dialog-close-box">
        <div class="inner">
          <svg-icon name="close" class-name="text-[30px]" @click="close" />
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.pay-password-input {
  backdrop-filter: blur(5px);
}
.dialog-container {
  border-radius: 10px;
  .dialog-body {
    border: var(--lobby__px) solid var(--skin__border);
    width: 100%;
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .header-box {
      color: var(--skin__lead);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 15px;
      font-weight: 400;
      font-stretch: normal;
      font-style: normal;
      letter-spacing: normal;
      padding: 10px 15px 15px;
      box-sizing: border-box;
    }
    .content-box {
      padding: 5px 15px 15px;
      flex: 1;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .mark {
        font-size: 11px;
        color: var(--skin__lead);
        margin-top: 10px;
        word-wrap: break-word;
      }
      .button {
        margin-top: 20px;
        width: 100%;
        border-radius: 7px;
        height: 35px;
        padding: 0 7.5px;
        font-size: 12px !important;
        background: var(--skin__primary);
        color: white;
        border: var(--lobby__px) solid var(--skin__primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.dialog-close-box {
  position: relative;
  width: 100%;

  .inner {
    width: 100%;
    padding-top: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 9999;
  }
}
</style>
