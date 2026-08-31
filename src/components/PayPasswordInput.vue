<script setup lang="ts">
import { $t } from "@/locales";
import { reactive, ref } from "vue";
import { verifyWithdrawalPassword } from "@/api/common";
import { showCustomDialog } from "@/hooks/useCommon";
import router from '@/router';

const emits = defineEmits(["input-true"]);
const show = ref(false);
const showKeyboard = ref(false);
const showEye = ref(false);
const showError = ref(false);
const form = reactive({
  password: ""
});

function open() {
  show.value = true;
  showKeyboard.value = true;
  form.password = "";
}

function close() {
  show.value = false;
}

const handleShowPassword = () => {
  showKeyboard.value = true;
};
const hideKeyboard = () => {
  showKeyboard.value = false;
};

const handleNext = () => {
  if (!form.password || form.password.length != 6) {
    showError.value = true;
    return;
  }
  verifyWithdrawalPassword(form).then(res => {
    emits("input-true");
    close();
  });
};

function handleForgetPassword() {
  showCustomDialog({
    title: $t("温馨提示"),
    message: $t("请联系客服找回密码！\n"),
    showClose: true,
    showCancelButton: true,
    confirmButtonText: "客服",
    width: 300,
  }).then(res => {
    if (res) {
      // // @todo 实现跳转客服界面
      // console.log(res);
      router.push("/home/notice?noticeType=4");
    }
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
            <span>{{ $t("输入密码") }}</span>
          </div>
          <div class="content-box">
            <div class="tip-box">
              <span>{{ $t("提现密码") }}</span>
              <svg-icon
                name="comm_icon_hide"
                class-name="eye-icon text-[18px] text-[#242424]"
                v-if="!showEye"
                @click="showEye = !showEye"
              />
              <svg-icon
                name="comm_icon_show"
                class-name="eye-icon text-[18px] main-text"
                v-if="showEye"
                @click="showEye = !showEye"
              />
            </div>
            <div class="form-withdraw-pass">
              <x-password-input
                :mask="!showEye"
                :value="form.password"
                :focused="showKeyboard"
                @focus="handleShowPassword"
              />
            </div>
            <div class="explain" v-if="showError">
              <div class="error-icon">
                <svg-icon name="comm_icon_tip3" />
              </div>
              <span class="text">{{ $t("6位纯数字") }}</span>
            </div>
            <div class="remark">
              <span>{{ $t("为了您的账户安全，请输入提现密码") }}</span>
              <span class="active" @click="handleForgetPassword">{{ $t("忘记密码?") }}</span>
            </div>
            <van-button native-type="submit" class="button" @click="handleNext">{{ $t("下一步") }}</van-button>
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
  <teleport to="body">
    <div class="absolute z-[99999] input-keyboard">
      <x-number-keyboard
        :maxlength="6"
        v-model="form.password"
        :show="showKeyboard"
        @blur="hideKeyboard"
        @input="showError = false"
      />
    </div>
  </teleport>
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
      .tip-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 9px;
        color: var(--skin__lead);
        font-size: 12px;
      }
      .remark {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 11px;
        color: var(--skin__lead);
        font-size: 11px;
        line-height: 1;
        .active {
          color: var(--skin__primary);
          text-align: right;
          cursor: pointer;
        }
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
      }
      .explain {
        display: flex;
        align-items: flex-start;
        line-height: 1.3;
        min-height: 15px;
        margin-top: 4px;
        font-size: 11px;
        transition: color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
        color: var(--skin__accent_2);

        .error-icon {
          background-color: var(--skin__accent_2);
          margin-right: 5px;
          color: #fff;
          width: 13px;
          height: 13px;
          font-size: 13px;
          line-height: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 9999.99rem;
        }
        .text {
          flex: 1;
          display: flex;
          align-items: flex-start;
        }
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

<style>
.pay-password-input {
  margin-top: 30px !important;
}
</style>
