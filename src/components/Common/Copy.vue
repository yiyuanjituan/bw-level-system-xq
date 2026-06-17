<script setup lang="ts">
import { showCustomToast } from "@/hooks/useCommon";
import { computed, onBeforeUnmount, ref } from "vue";
import useClipboard from "vue-clipboard3";

interface Props {
  text?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  className: ""
});

const { toClipboard } = useClipboard();
const isShowCopy = ref(true);
let resetTimer: ReturnType<typeof setTimeout> | null = null;

const copyIconClassName = computed(() => {
  return ["text-[15px]", "main-text", props.className].filter(Boolean).join(" ");
});

const successIconClassName = computed(() => {
  return ["text-[15px]", "right-text", props.className].filter(Boolean).join(" ");
});

function startResetTimer() {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }

  resetTimer = setTimeout(() => {
    isShowCopy.value = true;
    resetTimer = null;
  }, 2000);
}

function handleCopyText(text: string) {
  toClipboard(text).then(() => {
    isShowCopy.value = false;
    showCustomToast({ type: "success", message: "复制成功" });
    startResetTimer();
  });
}

onBeforeUnmount(() => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
});
</script>

<template>
  <div class="copy-icon" @click.stop="handleCopyText(props.text)">
    <svg-icon v-if="isShowCopy" name="comm_icon_copy" :class-name="copyIconClassName" />
    <svg-icon v-else name="comm_icon_gou" class="" :class-name="successIconClassName" />
  </div>
</template>

<style scoped lang="less">
.copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.right-text {
  color: var(--skin__accent_1);
}
</style>
