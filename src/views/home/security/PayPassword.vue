<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import XButton from "@/components/X/x-button.vue";
import XInput from "@/components/X/x-input.vue";
import { setPayPassword, updatePayPassword } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { handleBack } from "@/utils/common";
import useAuthStore from "@/store/modules/user";
import { useRoute } from "vue-router";
import router from "@/router";

type PasswordField = "password" | "passwordConfirmation";
type UpdateStep = "edit" | "verify";

const auth = useAuthStore();
const route = useRoute();
const form = reactive({
  password: "",
  passwordConfirmation: "",
  loginPassword: ""
});
const activePasswordField = ref<PasswordField | null>(null);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const isSubmitting = ref(false);
const updateStep = ref<UpdateStep>("edit");

const isUpdating = computed(() => Boolean(auth.user.hasPayPassword));
const isVerifyingUpdate = computed(
  () => isUpdating.value && updateStep.value === "verify"
);
const showPasswordKeyboard = computed(() => activePasswordField.value === "password");
const showPasswordConfirmationKeyboard = computed(
  () => activePasswordField.value === "passwordConfirmation"
);

function showKeyboard(field: PasswordField) {
  activePasswordField.value = field;
}

function hideKeyboard() {
  activePasswordField.value = null;
}

function handleOtherVerification() {
  showCustomToast({ type: "warning", message: "其他验证方式暂未开放" });
}

async function handleSubmit() {
  if (!isVerifyingUpdate.value) {
    if (!/^\d{6}$/.test(form.password)) {
      showCustomToast({ type: "fail", message: "请输入6位数字提现密码" });
      return;
    }

    if (!/^\d{6}$/.test(form.passwordConfirmation)) {
      showCustomToast({ type: "fail", message: "请输入6位数字确认密码" });
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      showCustomToast({ type: "fail", message: "两次提现密码输入不一致" });
      return;
    }

    if (isUpdating.value) {
      updateStep.value = "verify";
      hideKeyboard();
      return;
    }
  }

  if (isVerifyingUpdate.value && !form.loginPassword) {
    showCustomToast({ type: "fail", message: "请输入登录密码" });
    return;
  }

  if (isSubmitting.value) return;

  const submitMode = isUpdating.value ? "update" : "create";
  isSubmitting.value = true;
  hideKeyboard();

  try {
    if (submitMode === "update") {
      await updatePayPassword({
        loginPassword: form.loginPassword,
        password: form.password
      });
    } else {
      await setPayPassword({ password: form.password });
    }

    await auth.updateInfo();
    form.password = "";
    form.passwordConfirmation = "";
    form.loginPassword = "";
    showCustomToast({
      type: "success",
      message: submitMode === "update" ? "提现密码更新成功" : "提现密码设置成功"
    });
    if (
      submitMode === "create" &&
      String(route.query.redirect || "") === "/home/withdraw"
    ) {
      await router.replace("/home/withdraw");
    } else {
      handleBack();
    }
  } catch {
    return;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="pay-password-page">
    <sub-navbar title="提现密码" />

    <main class="pay-password-page__main">
      <section class="pay-password-page__content">
        <h3 v-if="!isUpdating" class="pay-password-page__tip">
          为了资金安全，需先设置提现密码哦！
        </h3>

        <template v-if="!isVerifyingUpdate">
          <div class="pay-password-page__field">
            <div class="pay-password-page__field-header">
              <span>{{ isUpdating ? "修改提现密码" : "设置提现密码" }}</span>
              <button
                type="button"
                class="pay-password-page__eye"
                :aria-label="showPassword ? '隐藏提现密码' : '显示提现密码'"
                @click="showPassword = !showPassword"
              >
                <svg-icon
                  :name="showPassword ? 'comm_icon_show' : 'comm_icon_hide'"
                  class-name="pay-password-page__eye-icon"
                  :class="{ 'pay-password-page__eye-icon--active': showPassword }"
                />
              </button>
            </div>

            <div class="pay-password-page__password-input">
              <van-password-input
                :mask="!showPassword"
                :value="form.password"
                :focused="showPasswordKeyboard"
                @focus="showKeyboard('password')"
              />
            </div>
          </div>

          <div class="pay-password-page__field">
            <div class="pay-password-page__field-header">
              <span>确认提现密码</span>
              <button
                type="button"
                class="pay-password-page__eye"
                :aria-label="showPasswordConfirmation ? '隐藏确认密码' : '显示确认密码'"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
              >
                <svg-icon
                  :name="showPasswordConfirmation ? 'comm_icon_show' : 'comm_icon_hide'"
                  class-name="pay-password-page__eye-icon"
                  :class="{ 'pay-password-page__eye-icon--active': showPasswordConfirmation }"
                />
              </button>
            </div>

            <div class="pay-password-page__password-input">
              <van-password-input
                :mask="!showPasswordConfirmation"
                :value="form.passwordConfirmation"
                :focused="showPasswordConfirmationKeyboard"
                @focus="showKeyboard('passwordConfirmation')"
              />
            </div>
          </div>
        </template>

        <div v-else class="pay-password-page__login-verification">
          <div class="pay-password-page__field-header">验证登录密码</div>
          <x-input
            v-model="form.loginPassword"
            prefix="lock"
            show-eye
            :maxlength="16"
            name="loginPass"
            autocomplete="current-password"
            placeholder="请输入登录密码"
            @keydown.enter.prevent="handleSubmit"
          />
          <button
            type="button"
            class="pay-password-page__other-verification"
            @click="handleOtherVerification"
            v-if="false"
          >
            其他验证方式
          </button>
        </div>

        <div v-if="!isVerifyingUpdate" class="pay-password-page__notice">
          <span class="pay-password-page__notice-icon">!</span>
          <span>
            注意：提现密码保护您的资金安全，非常重要，只能自己知道，以免造成资金损失
          </span>
        </div>

        <van-number-keyboard
          v-model="form.password"
          :maxlength="6"
          :show="showPasswordKeyboard"
          @blur="hideKeyboard"
        />
        <van-number-keyboard
          v-model="form.passwordConfirmation"
          :maxlength="6"
          :show="showPasswordConfirmationKeyboard"
          @blur="hideKeyboard"
        />
      </section>

      <footer class="pay-password-page__footer">
        <x-button type="primary" block :loading="isSubmitting" @click="handleSubmit">
          {{ isUpdating && !isVerifyingUpdate ? "下一步" : "确 定" }}
        </x-button>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="less">
.pay-password-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead, #fff);
  background: #000;
}

.pay-password-page__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.pay-password-page__content {
  flex: 1;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
}

.pay-password-page__tip {
  padding-bottom: 10px;
  margin: 0;
  color: var(--skin__accent_1, #04be02);
  font-size: 12px;
  font-weight: 400;
  text-align: center;
}

.pay-password-page__field {
  margin-bottom: 10px;
}

.pay-password-page__field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--skin__lead, #fff);
  font-size: 12px;
}

.pay-password-page__eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--skin__border, #242424);
  font-size: 18px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.pay-password-page__eye-icon {
  width: 18px;
  height: 18px;
}

.pay-password-page__eye-icon--active {
  color: var(--skin__primary, #dfbe5b);
}

.pay-password-page__password-input {
  --van-password-input-margin: 0.5px;
  --van-password-input-background: var(--skin__bg_2, #191919);
  --van-border-color: var(--skin__border, #242424);
  --van-password-input-radius: 100px;
  --van-password-input-dot-color: var(--skin__lead, #fff);
  --van-password-input-text-color: var(--skin__lead, #fff);
  --van-password-input-dot-size: 13px;
  --van-password-input-cursor-width: 1.5px;
  --van-password-input-cursor-color: var(--skin__lead, #fff);
}

.pay-password-page__password-input :deep(.van-password-input) {
  overflow: hidden;
  border-radius: 7px;
}

.pay-password-page__notice {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 10px;
  color: var(--skin__accent_2, #f84673);
  font-size: 12px;
  line-height: 15px;
}

.pay-password-page__notice-icon {
  display: inline-flex;
  flex: 0 0 13px;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  color: var(--skin__lead, #fff);
  font-size: 8px;
  line-height: 13px;
  background: var(--skin__accent_2, #f84673);
  border-radius: 50%;
}

.pay-password-page__login-verification {
  margin-bottom: 10px;
}

.pay-password-page__other-verification {
  display: block;
  padding: 0;
  margin: 10px auto 0;
  color: var(--skin__primary, #dfbe5b);
  font-size: 12px;
  background: transparent;
  border: 0;
}

.pay-password-page__footer {
  flex-shrink: 0;
  padding: 10px 10px 20px;
  background: var(--skin__bg_2, #191919);
  box-shadow: 0 -1.5px 5px rgba(0, 0, 0, 0.1);
}

:deep(.van-number-keyboard) {
  --van-number-keyboard-background: #000;
  --van-number-keyboard-key-background: var(--skin__bg_2, #191919);
  --van-number-keyboard-key-height: 46px;
  --van-number-keyboard-key-font-size: 21px;
}
</style>
