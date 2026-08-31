<script setup lang="ts">
import { numberKeyboardProps } from "vant";
import { computed, useAttrs } from "vue";

defineOptions({
  name: "x-number-keyboard",
  inheritAttrs: false
});

const props = defineProps(numberKeyboardProps);
const attrs = useAttrs();
const keyboardAttrs = computed(() => ({
  ...props,
  zIndex: props.zIndex ?? 2004,
  ...attrs
}));

const emit = defineEmits<{
  (event: "show"): void;
  (event: "hide"): void;
  (event: "blur"): void;
  (event: "input", value: string | number): void;
  (event: "close"): void;
  (event: "delete"): void;
  (event: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <van-number-keyboard
    v-bind="keyboardAttrs"
    class="x-number-keyboard"
    dir="ltr"
    @show="emit('show')"
    @hide="emit('hide')"
    @blur="emit('blur')"
    @input="emit('input', $event)"
    @close="emit('close')"
    @delete="emit('delete')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="$slots['title-left']" #title-left>
      <slot name="title-left" />
    </template>
    <template v-if="$slots.delete" #delete>
      <slot name="delete" />
    </template>
    <template v-if="$slots['extra-key']" #extra-key>
      <slot name="extra-key" />
    </template>
  </van-number-keyboard>
</template>

<style scoped lang="less">
.x-number-keyboard {
  --van-number-keyboard-background: var(--skin__bg_1);
  --van-number-keyboard-key-background: var(--skin__bg_2, #191919);
  --van-number-keyboard-key-active-color: var(--skin__bg_2, #191919);
  --van-number-keyboard-key-height: 46px;
  --van-number-keyboard-key-font-size: 21px;
  color: var(--skin__lead, #bcbcbc);

  padding-bottom: 18px;

  :deep(.van-key__wrapper) {
    color: inherit;
  }
}
</style>
