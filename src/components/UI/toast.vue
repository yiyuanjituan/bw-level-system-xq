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
const isDarkBackground = ref(true);
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let themeObserver: MutationObserver | undefined;

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

function parseColorChannels(color: string) {
  const normalizedColor = color.trim();

  if (normalizedColor.startsWith("#")) {
    let hexColor = normalizedColor.slice(1);
    if (hexColor.length === 3 || hexColor.length === 4) {
      hexColor = hexColor.slice(0, 3).split("").map(channel => channel + channel).join("");
    } else if (hexColor.length === 8) {
      hexColor = hexColor.slice(0, 6);
    }

    if (!/^[\da-f]{6}$/i.test(hexColor)) return null;
    return [0, 2, 4].map(offset => Number.parseInt(hexColor.slice(offset, offset + 2), 16));
  }

  const rgbMatch = normalizedColor.match(
    /^rgba?\(\s*([\d.]+)%?[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?/i
  );
  if (!rgbMatch) return null;

  const usesPercentage = normalizedColor.slice(0, normalizedColor.indexOf(")")).includes("%");
  return rgbMatch.slice(1, 4).map(channel => {
    const numericChannel = Number.parseFloat(channel);
    return usesPercentage ? numericChannel * 2.55 : numericChannel;
  });
}

function updateToastAppearance() {
  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--skin__bg_1");
  const channels = parseColorChannels(backgroundColor);
  if (!channels) return;

  const [red, green, blue] = channels.map(channel => {
    const normalizedChannel = Math.min(255, Math.max(0, channel)) / 255;
    return normalizedChannel <= 0.04045
      ? normalizedChannel / 12.92
      : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
  });
  const relativeLuminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;

  // 比较黑白文字与页面背景的对比度，白色对比度更高时视为暗色背景。
  const whiteContrast = 1.05 / (relativeLuminance + 0.05);
  const blackContrast = (relativeLuminance + 0.05) / 0.05;
  isDarkBackground.value = whiteContrast >= blackContrast;
}

function clearTimers() {
  if (openTimer) clearTimeout(openTimer);
  if (closeTimer) clearTimeout(closeTimer);
  openTimer = undefined;
  closeTimer = undefined;
}

function showToast(options: ToastPayload) {
  clearTimers();
  show.value = false;
  updateToastAppearance();

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
  updateToastAppearance();
  themeObserver = new MutationObserver(updateToastAppearance);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "class", "data-theme"]
  });
  bus.on("showToast", showToast);
});

onBeforeUnmount(() => {
  clearTimers();
  themeObserver?.disconnect();
  themeObserver = undefined;
  bus.off("showToast", showToast);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-toast-zoom">
      <div
        v-if="show"
        class="ui-popup ui-popup--center safe-area-top safe-area-bottom ui-toast__toast ui-toast__toast--container"
        :class="[
          `ui-toast__toast--${toastStatus}`,
          isDarkBackground ? 'ui-toast__toast--light' : 'ui-toast__toast--dark'
        ]"
        tabindex="0"
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
  color: var(--ui-toast-text-color);
  font-size: 14px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  pointer-events: none;
  transform: translate(-50%, -50%);
  --ui-toast-background: #fff;
  --ui-toast-text-color: #333;

  &.ui-toast__toast--dark {
    --ui-toast-background: rgba(0, 0, 0, 0.8);
    --ui-toast-text-color: #fff;
  }

  .ui-toast__toast--instance {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    max-width: 100%;
    padding: 12px 20px;
    color: var(--ui-toast-text-color);
    background-color: var(--ui-toast-background);
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
