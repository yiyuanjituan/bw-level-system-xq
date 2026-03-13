<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import { setPayPassword } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { handleBack } from "@/utils/common";
import useAuthStore from "@/store/modules/user";

const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const form = reactive({
  password: "",
  password_confirmation: "",
})

const value = ref('')
const showKeyboard = ref(false)
const showKeyboardByConfirm = ref(false)
const hideKeyboard = () => {
  showKeyboard.value = false
  showKeyboardByConfirm.value = false
}
const handleShowPassword = () => {
  showKeyboard.value = true
  showKeyboardByConfirm.value = false
}
const handleShowConfirm = () => {
  showKeyboard.value = false
  showKeyboardByConfirm.value = true
}

function handleSubmit() {
  if (!form.password || form.password.length != 6) {
    return showCustomToast(({ type: 'fail', message: '请输入六位数字' }))
  }
  if (!form.password_confirmation || form.password_confirmation.length != 6) {
    return showCustomToast(({ type: 'fail', message: '请输入确认密码' }))
  }
  if (form.password != form.password_confirmation) {
    return showCustomToast(({ type: 'fail', message: '两次密码不一致' }))
  }
  setPayPassword({ password: form.password }).then(() => {
    showCustomToast(({ type: 'success', message: '提现密码设置成功' }))
    useAuthStore().updateInfo()
    handleBack()
  })
}

onMounted(() => {})
</script>

<template>
  <div class="security-container">
    <sub-navbar title="提现密码" />
    <div class="inner-box">
      <div class="body">
        <div class="content">
          <h3 class="topTitle">为了资金安全，需先设置提现密码哦！</h3>
          <div class="mb-[10px]">
            <div class="title-container">
              <span class="label">设置提现密码</span>
              <span class="icon">
            <svg-icon name="comm_icon_show" class-name="text-[#DFBE5B]" v-if="showPassword" @click="showPassword = !showPassword" />
            <svg-icon name="comm_icon_hide" class-name="text-[#242424]" v-if="!showPassword" @click="showPassword = !showPassword" />
          </span>
            </div>
            <div class="form-withdraw-pass">
              <van-password-input :mask="!showPassword" :value="form.password" :focused="showKeyboard" @focus="handleShowPassword" />
            </div>
          </div>

          <div class="mb-[10px]">
            <div class="title-container">
              <span class="label">确认提现密码</span>
              <span class="icon">
            <svg-icon name="comm_icon_show" class-name="text-[#DFBE5B]" v-if="showPasswordConfirm" @click="showPasswordConfirm = !showPasswordConfirm" />
            <svg-icon name="comm_icon_hide" class-name="text-[#242424]" v-if="!showPasswordConfirm" @click="showPasswordConfirm = !showPasswordConfirm" />
          </span>
            </div>
            <div class="form-withdraw-pass">
              <van-password-input :mask="!showPasswordConfirm" :value="form.password_confirmation" :focused="showKeyboardByConfirm" @focus="handleShowConfirm" />
            </div>
          </div>

          <div class="bottom-title">
            <div class="prefix">
              <img src="/siteadmin/skin/lobby_asset/comm_icon_tip1.avif" alt="" class="" />
            </div>
            <div class="desc">注意：提现密码保护您的资金安全，非常重要，只能自己知道，以免造成资金损失</div>
          </div>

          <!-- 数字键盘 -->
          <van-number-keyboard v-model="form.password" :show="showKeyboard" @blur="hideKeyboard" />
          <van-number-keyboard v-model="form.password_confirmation" :show="showKeyboardByConfirm" @blur="hideKeyboard" />
        </div>
      </div>
      <div class="footer">
        <div class="ui-button" @click="handleSubmit">确 定</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.security-container {
  width: 100%;
  height: 100%;
  background: black;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .inner-box {
    flex: 1;
    overflow: auto;
    height: 0;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .body {
    flex: 1;
    overflow: auto;
    height: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;

    .content {
      flex: 1;
      overflow-y: auto;
      .topTitle {
        font-size: 12px;
        color: #1FE11F;
        font-weight: 400;
        text-align: center;
        padding-bottom: 10px;
      }
      .title-container {
        font-size: 12px;
        color: #fff;
        display: flex;
        margin-bottom: 10px;
        justify-content: flex-start;
        align-items: center;
        .icon {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          font-size: 18px;
          color: #fff;
        }
      }

      .form-withdraw-pass {
        --van-password-input-margin: 0.5px;
        --van-password-input-background: #191919;
        --van-border-color: #242424;
        --van-password-input-radius: 100px;
        --van-password-input-dot-color: #fff;
        --van-password-input-text-color: white;
        --van-password-input-dot-size: 13px;
        --van-password-input-cursor-width: 1.5px;
        --van-password-input-cursor-color: white;

        :deep(.van-password-input) {
          border-radius: 7px;
          overflow: hidden;
        }
      }

      .bottom-title {
        font-size: 11px;
        margin-bottom: 10px;
        color: #F84673;
        line-height: 1.75;
        display: flex;

        .prefix {
          width: 13px;
          height: 13px;
          font-size: 8px;
          line-height: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #F84673;
          border-radius: 9999.99rem;
        }
        .desc {
          flex: 1;
          margin-left: 5px;
          line-height: 15px;
          font-size: 12px;
        }
      }
    }
  }

  .footer {
    margin: -10px;
    padding: 10px 10px 20px;
    background-color: #191919;
    box-shadow: 0 -1.5px 5px rgba(0, 0, 0, .1);
    display: flex;
    align-items: center;
    justify-content: center;
    .ui-button {
      width: 355px;
      height: 35px;
      color: white;
      background: #DFBE5B;
      border: solid 1px #DFBE5B;
      border-radius: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}


:deep(.van-number-keyboard) {
  --van-number-keyboard-background: #000;
  --van-number-keyboard-key-background: #191919;
  --van-number-keyboard-key-height: 46px;
  --van-number-keyboard-key-font-size: 21px;
}

</style>