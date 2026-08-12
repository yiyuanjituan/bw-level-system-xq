<script setup lang="ts">
import { reactive, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import XInput from "@/components/X/x-input.vue";
import XButton from "@/components/X/x-button.vue";
import PasswordPower from "@/components/Common/PasswordPower.vue";
import { updateLoginPassword } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { handleBack } from "@/utils/common";

const passwordPattern = /^(?![a-zA-Z]+$)(?![0-9]+$)(?![^a-zA-Z0-9]+$)[a-zA-Z0-9\W_]{6,16}$/;
const form = reactive({
  password: "",
  confirmPassword: ""
});
const isSubmitting = ref(false);

async function handleSubmit() {
  if (!form.password) {
    showCustomToast({ type: "fail", message: "请输入新登录密码" });
    return;
  }

  if (/\s/.test(form.password) || !passwordPattern.test(form.password)) {
    showCustomToast({
      type: "fail",
      message: "密码需为6-16位，至少包含英文、数字、符号中的两种"
    });
    return;
  }

  if (!form.confirmPassword) {
    showCustomToast({ type: "fail", message: "请再次输入新登录密码" });
    return;
  }

  if (form.password !== form.confirmPassword) {
    showCustomToast({ type: "fail", message: "两次密码输入不一致，请重新输入" });
    return;
  }

  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await updateLoginPassword({ password: form.password });
    form.password = "";
    form.confirmPassword = "";
    showCustomToast({ type: "success", message: "登录密码修改成功" });
    handleBack();
  } catch {
    return;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="login-password-page">
    <sub-navbar title="登录密码" />

    <main class="login-password-page__main">
      <div class="login-password-page__content">
        <div class="login-password-page__label">修改登录密码</div>
        <x-input
          v-model="form.password"
          prefix="lock"
          show-eye
          :maxlength="16"
          name="loginPass"
          autocomplete="new-password"
          placeholder="请输入新登录密码"
          @keydown.enter.prevent="handleSubmit"
        />

        <password-power class="login-password-page__strength" :text="form.password" />

        <div class="login-password-page__label">二次确认新密码</div>
        <x-input
          v-model="form.confirmPassword"
          prefix="lock"
          show-eye
          :maxlength="16"
          name="confirmLoginPass"
          autocomplete="new-password"
          placeholder="请再次输入新登录密码"
          @keydown.enter.prevent="handleSubmit"
        />
      </div>

      <footer class="login-password-page__footer">
        <x-button type="primary" block :loading="isSubmitting" @click="handleSubmit">
          确 定
        </x-button>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="less">
.login-password-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead, #fff);
  background: #000;
}

.login-password-page__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
}

.login-password-page__content {
  flex: 1;
}

.login-password-page__label {
  margin-bottom: 10px;
  color: var(--skin__lead, #fff);
  font-size: 12px;
}

.login-password-page__strength {
  margin-top: 10px;
}

.login-password-page__footer {
  flex-shrink: 0;
  padding-top: 10px;
}
</style>
