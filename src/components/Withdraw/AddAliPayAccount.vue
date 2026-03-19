<script setup lang="ts">
import { computed, inject, Ref, ref, useTemplateRef } from "vue";
import UiForm from "@/components/UI/form.vue";
import UiFormItem from "@/components/UI/form-item.vue";
import UiInput from "@/components/UI/input.vue";
import { useClipboard } from "@vueuse/core";
import UiCommonSelect from "@/components/UI/common-select.vue";
import UiButton from "@/components/Common/Button.vue";
import { bindCard } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";

const { isSupported } = useClipboard();
const emits = defineEmits(["refresh"]);
const formRef = useTemplateRef("form");
const show = ref(false);
const isLoading = ref(false);

const bankList = inject<Ref<any[]>>("bankList");
const aliPayInfo = computed(() => {
  const data = bankList.value.filter(v => v.type == 1);
  return data.length ? data[0] : {};
});

const auth = useAuthStore();
const modelValue = ref<any>();
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
const copyToBankNumber = async () => {
  if (!isSupported.value) return false;
  try {
    modelValue.value.bank_number = await navigator.clipboard.readText();
  } catch (err) {
    console.error("粘贴失败:", err);
  }
};
function open() {
  show.value = true;
  modelValue.value = { bindType: "alipayAccount" };
  isLoading.value = false;
  if (auth.user.realName) {
    modelValue.value.realname = auth.user.realName;
  }
}

function close() {
  show.value = false;
}

function handleSubmit() {
  formRef.value.validate().then(() => {
    isLoading.value = !isLoading.value;
    // 处理绑卡的事情
    bindCard(modelValue.value)
      .finally(() => (isLoading.value = false))
      .then(res => {
        close();
        showCustomToast({ type: "success", message: "绑定成功！" });
        emits("refresh");
      });
  });
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
            <span>添加支付宝</span>
          </div>
          <div class="content-box">
            <ui-form :rule="formRules" :model="modelValue" ref="form">
              <ui-form-item prop="realname">
                <ui-input
                  placeholder="请填写真实姓名"
                  prefix="input_icon_zsxm1"
                  v-model="modelValue.realname"
                  type="text"
                />
              </ui-form-item>
              <ui-form-item prop="bank_number">
                <ui-input
                  placeholder="手机号或邮箱"
                  v-model="modelValue.bank_number"
                  type="text"
                >
                  <template #prefix>
                    <img :src="aliPayInfo.bank_icon" alt="" srcset="" class="w-[15px] h-[15px]">
                  </template>
                  <template #suffix>
                    <span class="main-text" @click="copyToBankNumber"
                      >粘贴</span
                    >
                  </template>
                </ui-input>
              </ui-form-item>
              <div class="mark">请认真核对，否则将无法到账。</div>
              <ui-button
                class="button"
                :loading="isLoading"
                type="primary"
                @click="handleSubmit"
                >确 定</ui-button
              >
            </ui-form>
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