<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { bus } from "@/utils/mitt";
import type { IToastOptions, ToastType } from "@/typings/mitt";

defineOptions({
  name: "ui-toast"
});

type ToastPayload = string | IToastOptions;
type ToastStatus = "text" | "info" | "warn" | "error" | "success";

const show = ref(false);
const message = ref("");
const params = ref<IToastOptions>({});
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const statusMap: Record<ToastType, ToastStatus> = {
  text: "text",
  html: "text",
  loading: "info",
  warning: "warn",
  fail: "error",
  success: "success"
};

const iconMap: Partial<Record<ToastType, string>> = {
  loading: "loading",
  warning: "exclamation-circle",
  fail: "close-circle",
  success: "check-circle"
};

const toastType = computed<ToastType>(() => params.value.type || "text");
const toastStatus = computed(() => statusMap[toastType.value]);
const iconName = computed(() => iconMap[toastType.value]);

function clearTimers() {
  if (openTimer) clearTimeout(openTimer);
  if (closeTimer) clearTimeout(closeTimer);
  openTimer = undefined;
  closeTimer = undefined;
}

function showToast(options: ToastPayload) {
  clearTimers();
  show.value = false;

  const normalizedOptions: IToastOptions = typeof options === "string"
    ? { type: "text", message: options }
    : options;

  message.value = String(normalizedOptions.message ?? "");
  params.value = normalizedOptions;

  // 短暂隐藏后重新显示，确保连续提示也能重新触发入场动画。
  openTimer = setTimeout(() => {
    show.value = true;
    const duration = normalizedOptions.duration || 2000;
    closeTimer = setTimeout(() => {
      show.value = false;
    }, duration);
  }, 20);
}

onMounted(() => {
  bus.on("showToast", showToast);
});

onBeforeUnmount(() => {
  clearTimers();
  bus.off("showToast", showToast);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-toast-zoom">
      <div
        v-if="show"
        class="ui-popup ui-popup--center safe-area-top safe-area-bottom ui-toast__toast ui-toast__toast--container"
        :class="`ui-toast__toast--${toastStatus}`"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="ui-toast__toast--instance">
          <div
            v-if="iconName"
            class="ui-toast__toast--icon"
            :class="[
              `ui-toast__toast--${toastStatus}`,
              { 'ui-toast__toast--loading': toastType === 'loading' }
            ]"
            aria-hidden="true"
          >
            <svg-icon :name="iconName" />
          </div>
          <div class="ui-toast__toast-message">{{ message }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.ui-toast__toast.ui-toast__toast--container {
  position: fixed;
  z-index: 5000;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: max-content;
  min-width: 96px;
  max-width: min(345px, calc(100vw - 30px));
  overflow-y: visible;
  color: #333;
  font-size: 14px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  pointer-events: none;
  transform: translate(-50%, -50%);

  .ui-toast__toast--instance {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    max-width: 100%;
    padding: 12px 20px;
    background-color: #fff;
    border-radius: 7px;
    transition: all 0.3s;
  }

  .ui-toast__toast--icon {
    display: flex;
    flex: 0 0 19px;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    margin-right: 12px;
    overflow: hidden;
    font-size: 21px;
    background: #fff;
    border-radius: 50%;

    &.ui-toast__toast--info {
      color: var(--skin__primary);
    }

    &.ui-toast__toast--warn {
      color: #ffaa09;
    }

    &.ui-toast__toast--error {
      color: #ea4e3d;
    }

    &.ui-toast__toast--success {
      color: #04be02;
    }

    &.ui-toast__toast--loading {
      animation: ui-toast-rotating 1s linear infinite;
    }
  }

  .ui-toast__toast-message {
    min-width: 0;
    max-width: 274px;
    text-align: left;

    &:lang(ta) {
      max-width: 174px;
    }
  }
}

:global(html[data-skin-bg="0"]) .ui-toast__toast.ui-toast__toast--container {
  color: #fff;

  .ui-toast__toast--instance {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

[dir="rtl"] .ui-toast__toast.ui-toast__toast--container {
  .ui-toast__toast--icon {
    margin-right: 0;
    margin-left: 12px;
  }

  .ui-toast__toast-message {
    text-align: right;
  }
}

.ui-toast-zoom-enter-active,
.ui-toast-zoom-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.ui-toast-zoom-enter-from,
.ui-toast-zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale3d(0.3, 0.3, 0.3) !important;
}

@keyframes ui-toast-rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
