<script setup lang="ts">
import { computed } from "vue";
import XOverlay from "./x-overlay.vue";

defineOptions({
  name: "x-popup"
});

type PopupPosition = "center" | "top" | "right" | "bottom" | "left";

interface Props {
  show?: boolean;
  position?: PopupPosition;
  zIndex?: number | string;
  closeOnClickOverlay?: boolean;
  showClose?: boolean;
  safeArea?: boolean;
  hiddenOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  position: "center",
  zIndex: 1,
  closeOnClickOverlay: true,
  showClose: false,
  safeArea: false,
  hiddenOverlay: false
});

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "close"): void;
  (e: "click-overlay"): void;
}>();

const popupClasses = computed(() => ["x-popup", `x-popup--${props.position}`]);
const popupStyle = computed(() => ({ zIndex: String(props.zIndex) }));

const transitionName = computed(() => {
  if (props.position === "center") return "x-popup-fade";
  if (props.position === "top") return "x-popup-slide-top";
  if (props.position === "bottom") return "x-popup-slide-bottom";
  if (props.position === "left") return "x-popup-slide-left";
  return "x-popup-slide-right";
});

function close() {
  emit("update:show", false);
  emit("close");
}

function onOverlayClick() {
  emit("click-overlay");
  if (props.closeOnClickOverlay) close();
}
</script>

<template>
  <x-overlay
    :show="show"
    :z-index="zIndex"
    :hidden="hiddenOverlay"
    :safe-area="safeArea"
    @click="onOverlayClick"
    frosted
  />
  <transition :name="transitionName">
    <div
      v-if="show"
      :class="popupClasses"
      :style="popupStyle"
      role="dialog"
      aria-modal="true"
      @click.stop
    >
      <div v-if="showClose" class="x-popup__close-icon" @click="close">
        <svg-icon name="close" />
      </div>
      <slot />
    </div>
  </transition>
</template>

<style scoped lang="less">
.x-popup {
  position: fixed;
  max-height: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  transform-origin: center center;

  &__close-icon {
    position: absolute;
    cursor: pointer;
    top: 8px;
    right: 8px;
    font-size: 10px;

    :deep(svg) {
      fill: var(--skin__neutral_2);
    }
  }

  &--center {
    top: 50%;
    left: 0;
    right: 0;
    width: fit-content;
    max-width: calc(100vw - 16px);
    margin: 0 auto;
    transform: translate3d(0, -50%, 0);
  }

  &--top {
    top: 0;
    left: 0;
    width: 100%;
  }

  &--right {
    top: 50%;
    right: 0;
    transform: translate3d(0, -50%, 0);
  }

  &--bottom {
    bottom: 0;
    left: 0;
    width: 100%;
  }

  &--left {
    top: 50%;
    left: 0;
    transform: translate3d(0, -50%, 0);
  }
}

[dir="rtl"] .x-popup--center {
  right: unset;
}

[dir="rtl"] .x-popup__close-icon {
  right: auto;
  left: 8px;
}

.x-popup-fade-enter-active,
.x-popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.x-popup-fade-enter-from,
.x-popup-fade-leave-to {
  opacity: 0;
}

.x-popup-slide-top-enter-active,
.x-popup-slide-left-enter-active,
.x-popup-slide-right-enter-active,
.x-popup-slide-bottom-enter-active {
  transition: transform 0.3s ease-out;
}

.x-popup-slide-top-leave-active,
.x-popup-slide-left-leave-active,
.x-popup-slide-right-leave-active,
.x-popup-slide-bottom-leave-active {
  transition: transform 0.3s ease-in;
}

.x-popup-slide-top-enter-from,
.x-popup-slide-top-leave-to {
  transform: translate3d(0, -100%, 0);
}

.x-popup-slide-bottom-enter-from,
.x-popup-slide-bottom-leave-to {
  transform: translate3d(0, 100%, 0);
}

.x-popup-slide-left-enter-from,
.x-popup-slide-left-leave-to {
  transform: translate3d(-100%, -50%, 0);
}

.x-popup-slide-right-enter-from,
.x-popup-slide-right-leave-to {
  transform: translate3d(100%, -50%, 0);
}
</style>
