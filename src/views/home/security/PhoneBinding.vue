<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import XInput from "@/components/X/x-input.vue";
import XButton from "@/components/X/x-button.vue";
import { sendSms } from "@/api/common";
import { service } from "@/api/service";
import { showCustomToast } from "@/hooks/useCommon";
import { handleBack } from "@/utils/common";
import useAuthStore from "@/store/modules/user";
import mainlandFlag from "@/assets/common/ChineseMainland.png";

const auth = useAuthStore();
const phone = ref("");
const verificationCode = ref("");
const countdown = ref(0);
const isSendingCode = ref(false);
const isSubmitting = ref(false);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(phone.value));
const canSendCode = computed(() => isValidPhone.value && !isSendingCode.value && countdown.value === 0);
const sendCodeText = computed(() => countdown.value > 0 ? `${countdown.value}秒后重发` : "获取验证码");

function normalizePhone(value: string | number) {
  phone.value = String(value).replace(/\D/g, "").slice(0, 11);
}

function normalizeVerificationCode(value: string | number) {
  verificationCode.value = String(value).replace(/\D/g, "").slice(0, 6);
}

function startCountdown() {
  countdown.value = 60;

  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value > 0) return;

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
  }, 1000);
}

async function handleSendCode() {
  if (!isValidPhone.value) {
    showCustomToast({ type: "fail", message: "请输入正确的手机号" });
    return;
  }

  if (!canSendCode.value) return;

  isSendingCode.value = true;
  try {
    await sendSms({ phone: phone.value, captchaId: "", code: "" });
    startCountdown();
    showCustomToast({
      type: "success",
      message: "验证码已发送，请查看短信，若未收到验证码，请核对手机号码后重试"
    });
  } catch {
    return;
  } finally {
    isSendingCode.value = false;
  }
}

async function handleSubmit() {
  if (!isValidPhone.value) {
    showCustomToast({ type: "fail", message: "请输入正确的手机号" });
    return;
  }

  if (!/^\d{4,6}$/.test(verificationCode.value)) {
    showCustomToast({ type: "fail", message: "请输入正确的手机验证码" });
    return;
  }

  isSubmitting.value = true;
  try {
    await service.user.info.bindPhone({
      phone: phone.value,
      code: verificationCode.value
    });
    await auth.updateInfo();
    showCustomToast({ type: "success", message: "手机号绑定成功" });
    handleBack();
  } catch {
    return;
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <div class="phone-binding-page">
    <sub-navbar title="手机" />

    <main class="phone-binding-page__main">
      <div class="phone-binding-page__content">
        <div class="phone-binding-page__label">绑定手机</div>

        <x-input
          v-model="phone"
          class="phone-binding-page__field"
          type="tel"
          name="phone"
          :maxlength="11"
          placeholder="请输入手机号"
          autocomplete="tel"
          @input="normalizePhone"
        >
          <template #prefix>
            <span class="phone-binding-page__area-code">
              <img :src="mainlandFlag" alt="中国大陆" />
              <span>+86</span>
            </span>
          </template>
        </x-input>

        <x-input
          v-model="verificationCode"
          class="phone-binding-page__field"
          type="tel"
          name="phoneCode"
          :maxlength="6"
          placeholder="请输入手机验证码"
          autocomplete="one-time-code"
          @input="normalizeVerificationCode"
          @keydown.enter.prevent="handleSubmit"
        >
          <template #prefix>
            <svg-icon name="sms" class-name="phone-binding-page__code-icon" />
          </template>
          <template #suffix>
            <button
              type="button"
              class="phone-binding-page__send-code"
              :class="{ 'phone-binding-page__send-code--disabled': !canSendCode }"
              :disabled="!canSendCode"
              @click.stop="handleSendCode"
            >
              <svg-icon v-if="isSendingCode" name="loading" class-name="phone-binding-page__loading-icon" />
              <span>{{ sendCodeText }}</span>
            </button>
          </template>
        </x-input>
      </div>

      <footer class="phone-binding-page__footer">
        <x-button type="primary" block :loading="isSubmitting" @click="handleSubmit">确 定</x-button>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="less">
.phone-binding-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead, #fff);
  background: #000;
}

.phone-binding-page__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
}

.phone-binding-page__content {
  flex: 1;
}

.phone-binding-page__label {
  margin-bottom: 10px;
  color: var(--skin__lead, #fff);
  font-size: 12px;
}

.phone-binding-page__field + .phone-binding-page__field {
  margin-top: 10px;
}

.phone-binding-page__area-code {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--skin__lead, #fff);
  white-space: nowrap;
}

.phone-binding-page__area-code img {
  width: 18px;
  height: auto;
}

.phone-binding-page__code-icon {
  width: 15px;
  height: 15px;
  color: var(--skin__neutral_2, #8d929b);
  font-size: 15px;
}

.phone-binding-page__send-code {
  display: inline-flex;
  align-items: center;
  padding: 0;
  color: var(--skin__primary, #dfbe5b);
  font-size: 11px;
  white-space: nowrap;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.phone-binding-page__send-code--disabled {
  color: var(--skin__neutral_2, #8d929b);
  cursor: default;
}

.phone-binding-page__loading-icon {
  width: 12px;
  height: 12px;
  margin-right: 4px;
  animation: phone-binding-loading 1s linear infinite;
}

.phone-binding-page__footer {
  flex-shrink: 0;
  padding-top: 10px;
}

@keyframes phone-binding-loading {
  to {
    transform: rotate(360deg);
  }
}
</style>
