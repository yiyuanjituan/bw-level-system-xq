<script setup lang="ts">
defineOptions({
  name: "x-overlay"
});

interface Props {
  show?: boolean;
  zIndex?: number | string;
  hidden?: boolean;
  frosted?: boolean;
  safeArea?: boolean;
}

withDefaults(defineProps<Props>(), {
  show: false,
  zIndex: 1,
  hidden: false,
  frosted: false,
  safeArea: false
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

function onClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<template>
  <transition name="x-overlay__animate-fade">
    <div
      v-if="show"
      class="x-overlay"
      :class="{ isShowFrostedGlassEffect: frosted }"
      :data-hidden="hidden ? '1' : '0'"
      :data-safe-area="safeArea ? '1' : '0'"
      :style="{ '--x-overlay-z-index': String(zIndex) }"
      @click="onClick"
    >
      <slot />
    </div>
  </transition>
</template>

<style scoped lang="less">
.x-overlay {
  --x-overlay-z-index: 1;
  --x-overlay-background: rgba(0, 0, 0, 0.5);

  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--x-overlay-z-index);
  width: 100%;
  height: 100%;
  background-color: var(--x-overlay-background);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  touch-action: none;

  > * {
    touch-action: auto;
  }

  &[data-hidden="1"] {
    --x-overlay-background: rgba(0, 0, 0, 0);
    pointer-events: none;
    background: transparent;
  }

  &[data-hidden="1"] > * {
    pointer-events: auto;
  }

  &[data-safe-area="1"] {
    height: calc(100% - var(--skin__safe-area-inset-bottom, 0px));
  }
}

[dir="rtl"] .x-overlay {
  left: auto;
  right: 0;
}

.x-overlay.isShowFrostedGlassEffect {
  backdrop-filter: blur(5px);
}

@keyframes x-overlay-fade-in {
  0% {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: var(--x-overlay-background);
  }
}

.x-overlay__animate-fade-enter-active {
  animation: var(--animate-duration, 0.2s) x-overlay-fade-in both;
}

.x-overlay__animate-fade-leave-active {
  animation: var(--animate-duration, 0.2s) x-overlay-fade-in both reverse;
}
</style>

