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

const transitionName = computed(() => {
  if (props.position === "center") return "x-popup-zoom";
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
  >
    <transition :name="transitionName">
      <div v-if="show" :class="popupClasses" @click.stop>
        <div v-if="showClose" class="x-popup__close-icon" @click="close">
          <svg-icon name="close" />
        </div>
        <slot />
      </div>
    </transition>
  </x-overlay>
</template>

<style scoped lang="less">
.x-popup {
  position: absolute;
  max-height: 100%;
  box-sizing: border-box;
  transform-origin: center center;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;

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
    position: relative;
    left: 0;
    right: 0;
    width: fit-content;
    max-width: calc(100vw - 16px);
    margin: 0 auto;
  }

  &--top {
    top: 0;
    left: 0;
    width: 100%;
  }

  &--right {
    right: 0;
    top: 0;
    bottom: 0;
  }

  &--bottom {
    bottom: 0;
    left: 0;
    width: 100%;
  }

  &--left {
    left: 0;
    top: 0;
    bottom: 0;
  }
}

[dir="rtl"] .x-popup--center {
  right: unset;
}

[dir="rtl"] .x-popup__close-icon {
  right: auto;
  left: 8px;
}

.x-popup-zoom-enter-active,
.x-popup-zoom-leave-active {
  transition: all 0.2s ease;
}

.x-popup-zoom-enter-from,
.x-popup-zoom-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.x-popup-slide-top-enter-active,
.x-popup-slide-top-leave-active,
.x-popup-slide-bottom-enter-active,
.x-popup-slide-bottom-leave-active,
.x-popup-slide-left-enter-active,
.x-popup-slide-left-leave-active,
.x-popup-slide-right-enter-active,
.x-popup-slide-right-leave-active {
  transition: all 0.22s ease;
}

.x-popup-slide-top-enter-from,
.x-popup-slide-top-leave-to {
  transform: translateY(-100%);
}

.x-popup-slide-bottom-enter-from,
.x-popup-slide-bottom-leave-to {
  transform: translateY(100%);
}

.x-popup-slide-left-enter-from,
.x-popup-slide-left-leave-to {
  transform: translateX(-100%);
}

.x-popup-slide-right-enter-from,
.x-popup-slide-right-leave-to {
  transform: translateX(100%);
}
</style>

