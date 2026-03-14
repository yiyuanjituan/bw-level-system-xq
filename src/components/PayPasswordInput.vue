<script setup lang="ts">
import { reactive, ref } from "vue";

const show = ref(false);
const showKeyboard = ref(false)
const showEye = ref(false);
const form = reactive({
  password: "",
})

function open() {
  show.value = true;
}

function close() {
  show.value = false;
}

const handleShowPassword = () => {
  showKeyboard.value = true
}
const hideKeyboard = () => {
  showKeyboard.value = false
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
            <span>输入密码</span>
          </div>
          <div class="content-box">
            <div class="tip-box">
              <span>提现密码</span>
              <svg-icon name="comm_icon_hide" class-name="eye-icon text-[18px] text-[#242424]" v-if="!showEye" @click="showEye = !showEye" />
              <svg-icon name="comm_icon_show" class-name="eye-icon text-[18px] main-text" v-if="showEye" @click="showEye = !showEye" />
            </div>
            <div class="form-withdraw-pass">
              <van-password-input :mask="!showEye" :value="form.password" :focused="showKeyboard" @focus="handleShowPassword" />
            </div>
            <div class="remark">
              <span>为了您的账户安全，请输入提现密码</span>
              <span class="active">忘记密码?</span>
            </div>
            <van-button native-type="submit" class="button">下一步</van-button>
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
      <van-number-keyboard :maxlength="6" v-model="form.password" :show="showKeyboard" @blur="hideKeyboard" />
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
      .remark {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 11px;
        color: var(--skin__lead);
        font-size: 11px;
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