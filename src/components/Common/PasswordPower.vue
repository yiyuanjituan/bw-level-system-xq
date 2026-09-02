<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "PasswordPower"
});

interface Props {
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: ""
});

const strengthLevel = computed(() => {
  if (!props.text) return 0;

  const hasNumber = /\d/.test(props.text);
  const hasLower = /[a-z]/.test(props.text);
  const hasUpper = /[A-Z]/.test(props.text);
  const hasSpecial = /[^a-zA-Z0-9]/.test(props.text);
  return [hasNumber, hasLower, hasUpper, hasSpecial].filter(Boolean).length;
});

const segmentStates = computed(() => {
  const level = strengthLevel.value;
  const state = level === 0 ? "default" : level === 1 ? "weak" : level === 2 ? "medium" : level === 3 ? "strong" : "powerful";
  return Array.from({ length: 4 }, (_, index) => (index < level ? state : "default"));
});
</script>

<template>
  <section class="password-power pass-strength-check">
    <section class="pass-cryptographic-strength">
      <span class="tip-text">{{ $t("密码强度") }}</span>
      <span
        v-for="(state, index) in segmentStates"
        :key="index"
        class="colorLump color-lump"
        :class="`crypto-graphic-strength-${state}`"
        aria-hidden="true"
      ></span>
    </section>
  </section>
</template>

<style scoped lang="less">
.password-power,
.pass-strength-check {
  height: 15px;
  margin-bottom: 10px;
  margin-right: 5px;
  transition: all 0.3s;
}

.pass-cryptographic-strength {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: var(--skin__lead);

  .tip-text {
    flex: 0 0 auto;
    margin-right: 5px;
  }

  .colorLump,
  .color-lump {
    flex: 0 0 40px;
    width: 40px;
    height: 6px;
    margin-right: 5px;
    background: var(--skin__border);
    border-radius: 6px;
    transition: all 0.3s;

    &:last-child {
      margin-right: 0;
    }
  }

  .crypto-graphic-strength-weak {
    background: #ea4e3d;
  }

  .crypto-graphic-strength-medium {
    background: #ffaa09;
  }

  .crypto-graphic-strength-strong {
    background: #f0c059;
  }

  .crypto-graphic-strength-powerful {
    background: #04be02;
  }
}
</style>
