<script setup lang="ts">
import { ref, watch } from "vue";
import type { loginProps } from "@/enums/props";

defineOptions({
  name: "login-mode"
});

type LoginMode = loginProps["type"];

interface Props {
  modelValue: LoginMode;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "password"
});
const emit = defineEmits<{
  (event: "update:modelValue", value: LoginMode): void;
}>();
const checked = ref<LoginMode>(props.modelValue);

function handleChange(mode: LoginMode) {
  if (checked.value === mode) {
    return;
  }

  checked.value = mode;
  emit("update:modelValue", mode);
}

function handleKeydown(event: KeyboardEvent, mode: LoginMode) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleChange(mode);
  }
}

watch(
  () => props.modelValue,
  value => {
    checked.value = value;
  }
);
</script>

<template>
  <section class="switch-box account-switch-sub-type" data-theme-indent="false">
    <ul class="list" role="radiogroup">
      <li
        class="item"
        :class="{ checked: checked === 'password', 'account-sub-type-checked': checked === 'password' }"
        role="radio"
        :aria-checked="checked === 'password'"
        tabindex="0"
        @click="handleChange('password')"
        @keydown="handleKeydown($event, 'password')"
      >
        <span class="switch-inner">
          <span class="icon account-sub-type-icon">
            <svg-icon name="password_register" class-name="mode-icon" />
          </span>
          <span>{{ $t("密码登录") }}</span>
        </span>
      </li>
      <li
        class="item"
        :class="{ checked: checked === 'sms', 'account-sub-type-checked': checked === 'sms' }"
        role="radio"
        :aria-checked="checked === 'sms'"
        tabindex="0"
        @click="handleChange('sms')"
        @keydown="handleKeydown($event, 'sms')"
      >
        <span class="switch-inner">
          <span class="icon account-sub-type-icon">
            <svg-icon name="sms_register" class-name="mode-icon" />
          </span>
          <span>{{ $t("验证码登录") }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="less">
.switch-box {
  color: var(--skin__lead);
  font-size: 11px;

  .list {
    display: flex;
    align-items: flex-start;
    min-height: 13px;
    margin: 0 0 10px;
    padding: 0;
    list-style: none;
  }

  .item {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    margin-right: 10px;
    cursor: pointer;
    user-select: none;

    &:last-child {
      margin-right: 0;
    }

    &:focus-visible {
      outline: 1px solid var(--skin__primary);
      outline-offset: 2px;
    }

    &.checked {
      color: var(--skin__primary);

      .icon {
        color: var(--skin__text_primary);
        background-color: var(--skin__primary);
        border: 0 none;
      }
    }
  }

  .switch-inner {
    display: flex;
    align-items: center;
    min-width: 0;
    line-height: 15px;
  }

  .icon {
    display: flex;
    flex: 0 0 15px;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    margin-right: 4px;
    box-sizing: border-box;
    color: var(--skin__neutral_2);
    line-height: 1;
    background-color: var(--skin__bg_2);
    border: var(--lobby__px) solid var(--skin__border);
    border-radius: 9999px;
  }

  .mode-icon {
    width: 15px;
    height: 15px;
  }
}
</style>
