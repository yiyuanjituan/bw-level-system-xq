<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import XInput from "@/components/X/x-input.vue";
import XButton from "@/components/X/x-button.vue";
import { bindEmail } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { handleBack } from "@/utils/common";
import useAuthStore from "@/store/modules/user";

const auth = useAuthStore();
const email = ref("");
const isSubmitting = ref(false);
const isInputFocused = ref(false);
const isSuggestionOpen = ref(false);
const activeSuggestionIndex = ref(0);
let blurTimer: ReturnType<typeof setTimeout> | null = null;

const emailDomains = [
  "gmail.com",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "foxmail.com",
  "outlook.com",
  "live.com",
  "sohu.com",
  "mail.com",
  "hotmail.com",
  "tom.com",
  "yahoo.com",
  "msn.com"
];

const emailSuggestions = computed(() => {
  const inputValue = email.value.trim();
  if (!inputValue || /\s/.test(inputValue)) return [];

  const atIndex = inputValue.indexOf("@");
  if (atIndex !== inputValue.lastIndexOf("@")) return [];

  const localPart = atIndex >= 0 ? inputValue.slice(0, atIndex) : inputValue;
  const domainKeyword = atIndex >= 0 ? inputValue.slice(atIndex + 1).toLowerCase() : "";
  if (!localPart) return [];

  return emailDomains
    .filter(domain => !domainKeyword || domain.startsWith(domainKeyword))
    .map(domain => ({
      value: `${localPart}@${domain}`,
      localPart,
      suffix: `@${domain}`
    }))
    .filter(suggestion => suggestion.value.toLowerCase() !== inputValue.toLowerCase());
});

const showEmailSuggestions = computed(() => (
  isInputFocused.value && isSuggestionOpen.value && emailSuggestions.value.length > 0
));

function clearBlurTimer() {
  if (!blurTimer) return;
  clearTimeout(blurTimer);
  blurTimer = null;
}

function handleFocus() {
  clearBlurTimer();
  isInputFocused.value = true;
  isSuggestionOpen.value = true;
  activeSuggestionIndex.value = 0;
}

function handleInput() {
  isSuggestionOpen.value = true;
  activeSuggestionIndex.value = 0;
}

function handleBlur() {
  clearBlurTimer();
  blurTimer = setTimeout(() => {
    isInputFocused.value = false;
    isSuggestionOpen.value = false;
    blurTimer = null;
  }, 120);
}

function selectEmail(suggestionValue: string) {
  clearBlurTimer();
  email.value = suggestionValue;
  isSuggestionOpen.value = false;
  activeSuggestionIndex.value = 0;
}

function handleEmailKeydown(event: KeyboardEvent) {
  if (!showEmailSuggestions.value) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % emailSuggestions.value.length;
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSuggestionIndex.value = (
      activeSuggestionIndex.value - 1 + emailSuggestions.value.length
    ) % emailSuggestions.value.length;
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const activeSuggestion = emailSuggestions.value[activeSuggestionIndex.value];
    if (activeSuggestion) selectEmail(activeSuggestion.value);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    isSuggestionOpen.value = false;
  }
}

async function handleSubmit() {
  const normalizedEmail = email.value.trim();

  if (!normalizedEmail) {
    showCustomToast({ type: "fail", message: "请输入邮箱地址" });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    showCustomToast({ type: "fail", message: "邮箱格式不正确" });
    return;
  }

  email.value = normalizedEmail;
  isSuggestionOpen.value = false;
  isSubmitting.value = true;

  try {
    await bindEmail({ email: normalizedEmail });
    await auth.updateInfo();
    showCustomToast({ type: "success", message: "邮箱绑定成功" });
    handleBack();
  } catch {
    return;
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(clearBlurTimer);
</script>

<template>
  <div class="email-binding-page">
    <sub-navbar title="邮箱" />

    <main class="email-binding-page__main">
      <div class="email-binding-page__content">
        <div class="email-binding-page__label">绑定邮箱</div>
        <div class="email-binding-page__input-wrap">
          <x-input
            v-model="email"
            type="email"
            name="email"
            :maxlength="100"
            placeholder="请输入邮箱地址"
            autocomplete="off"
            role="combobox"
            :aria-expanded="showEmailSuggestions"
            aria-controls="email-suggestion-list"
            @focus="handleFocus"
            @input="handleInput"
            @blur="handleBlur"
            @keydown="handleEmailKeydown"
          >
            <template #prefix>
              <svg-icon name="security_email" class-name="email-binding-page__icon" />
            </template>
          </x-input>

          <transition name="email-suggestion">
            <ul
              v-if="showEmailSuggestions"
              id="email-suggestion-list"
              class="email-binding-page__suggestions"
              role="listbox"
            >
              <li
                v-for="(suggestion, suggestionIndex) in emailSuggestions"
                :key="suggestion.value"
                class="email-binding-page__suggestion"
                :class="{ 'email-binding-page__suggestion--active': suggestionIndex === activeSuggestionIndex }"
                role="option"
                :aria-selected="suggestionIndex === activeSuggestionIndex"
                @mousedown.prevent="selectEmail(suggestion.value)"
              >
                <span>{{ suggestion.localPart }}</span>
                <span class="email-binding-page__suggestion-suffix">{{ suggestion.suffix }}</span>
              </li>
            </ul>
          </transition>
        </div>
      </div>

      <footer class="email-binding-page__footer">
        <x-button type="primary" block :loading="isSubmitting" @click="handleSubmit">确 定</x-button>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="less">
.email-binding-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead, #fff);
  background: #000;
}

.email-binding-page__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
}

.email-binding-page__content {
  flex: 1;
}

.email-binding-page__label {
  display: block;
  margin-bottom: 10px;
  color: var(--skin__lead, #fff);
  font-size: 12px;
}

.email-binding-page__icon {
  width: 15px;
  height: 15px;
  color: var(--skin__neutral_2, #8d929b);
  font-size: 15px;
}

.email-binding-page__input-wrap {
  position: relative;
}

.email-binding-page__suggestions {
  position: absolute;
  z-index: 20;
  top: 40px;
  left: 0;
  width: 100%;
  max-width: 100%;
  max-height: 187.5px;
  padding: 7.5px 0;
  margin: 0;
  overflow-y: auto;
  list-style: none;
  background: var(--skin__bg_2, #191919);
  border: var(--lobby__px, 1px) solid var(--skin__border, #242424);
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  color: var(--skin__neutral_2, #8d929b);
  scrollbar-color: var(--skin__border, #242424) transparent;
  scrollbar-width: thin;
  transform-origin: top center;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    width: 3px;
    background: var(--skin__border, #242424);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-track-piece {
    background: transparent;
  }
}

.email-binding-page__suggestion {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 0 10px;
  color: var(--skin__neutral_2, #8d929b);
  font-size: 12px;
  line-height: 40px;
  cursor: pointer;

  > span:first-child {
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

}

.email-binding-page__suggestion--active {
  font-weight: 400;
  background: transparent;
}

.email-binding-page__suggestion:hover {
  background: var(--skin__bg_1, #242424);
}

.email-binding-page__suggestion-suffix {
  flex: 1 0 auto;
  color: var(--skin__lead, #fff);
  font-size: 12px;
  font-weight: 600;
}

.email-suggestion-enter-active,
.email-suggestion-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.email-suggestion-enter-from,
.email-suggestion-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.email-binding-page__footer {
  flex-shrink: 0;
  padding-top: 10px;
}
</style>
