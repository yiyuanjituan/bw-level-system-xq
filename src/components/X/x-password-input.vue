<script setup lang="ts">
import { passwordInputProps } from "vant";
import { computed, useAttrs } from "vue";

defineOptions({
  name: "x-password-input",
  inheritAttrs: false
});

const props = defineProps(passwordInputProps);
const attrs = useAttrs();
const passwordInputAttrs = computed(() => ({
  ...props,
  ...attrs
}));

const emit = defineEmits<{
  (event: "focus", touchEvent: TouchEvent): void;
}>();
</script>

<template>
  <van-password-input
    v-bind="passwordInputAttrs"
    class="x-password-input"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped lang="less">
.x-password-input {
  width: 100%;
  --van-password-input-height: 50px;
  --van-password-input-margin: 0;
  --van-password-input-font-size: 15px;
  --van-password-input-radius: 7px;
  --van-password-input-background: var(--skin__bg_2, #191919);
  --van-password-input-dot-size: 13px;
  --van-password-input-dot-color: var(--skin__lead, #fff);
  --van-password-input-text-color: var(--skin__lead, #fff);
  --van-password-input-cursor-width: 1.5px;
  --van-password-input-cursor-height: 22px;
  --van-password-input-cursor-color: var(--skin__primary, #dfbe5b);

  :deep(.van-password-input__security.van-hairline--surround) {
    position: relative;
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3, #242424);
    border-radius: var(--van-password-input-radius);
    box-sizing: border-box;
  }

  :deep(.van-password-input__security.van-hairline--surround::after),
  :deep(.van-password-input__security.van-hairline--surround .van-hairline--left::after) {
    border-width: 0;
  }

  :deep(.van-password-input__security li) {
    background: var(--van-password-input-background);
    box-sizing: border-box;
  }

  :deep(.van-password-input__security.van-hairline--surround li:not(:last-child)) {
    border-right: var(--lobby__px, 0.5px) solid var(--skin__neutral_3, #242424);
  }

  :deep(.van-password-input__item--focus) {
    z-index: 1;
    border: var(--lobby__px, 0.5px) solid var(--skin__primary, #dfbe5b);
  }

  :deep(.van-password-input__item:first-child) {
    border-radius: var(--van-password-input-radius) 0 0 var(--van-password-input-radius);
  }

  :deep(.van-password-input__item:last-child) {
    border-radius: 0 var(--van-password-input-radius) var(--van-password-input-radius) 0;
  }
}

[dir="rtl"] .x-password-input {
  :deep(.van-password-input__security.van-hairline--surround li:not(:last-child)) {
    border-right: 0;
    border-left: var(--lobby__px, 0.5px) solid var(--skin__neutral_3, #242424);
  }

  :deep(.van-password-input__item:first-child) {
    border-radius: 0 var(--van-password-input-radius) var(--van-password-input-radius) 0;
  }

  :deep(.van-password-input__item:last-child) {
    border-radius: var(--van-password-input-radius) 0 0 var(--van-password-input-radius);
  }
}
</style>
