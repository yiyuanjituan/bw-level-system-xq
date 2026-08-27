<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import XOverlay from "./x-overlay.vue";

defineOptions({
  name: "x-popover"
});

type PopoverPlacement = "top" | "bottom" | "left" | "right";
type PopoverTrigger = "click" | "manual";

interface Props {
  show?: boolean;
  placement?: PopoverPlacement;
  offset?: [number, number];
  trigger?: PopoverTrigger;
  closeOnClickOutside?: boolean;
  overlay?: boolean;
  overlayBackground?: string;
  closeOnClickOverlay?: boolean;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  placement: "bottom",
  offset: () => [0, 8],
  trigger: "click",
  closeOnClickOutside: true,
  overlay: false,
  overlayBackground: "",
  closeOnClickOverlay: true,
  zIndex: 3000
});

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "opened"): void;
}>();

const referenceRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const panelStyle = ref<Record<string, string>>({ visibility: "hidden" });

const transitionName = computed(() => `x-popover--${props.placement}`);
const overlayZIndex = computed(() => Math.max(0, props.zIndex - 1));

function setShow(value: boolean) {
  emit("update:show", value);
}

function toggleByTrigger() {
  if (props.trigger !== "click") return;
  setShow(!props.show);
}

function onOverlayClick() {
  if (props.closeOnClickOverlay) setShow(false);
}

function handleAfterEnter() {
  emit("opened");
}

function updateLocation() {
  if (!props.show || !referenceRef.value || !panelRef.value) return;

  const [offsetX, offsetY] = props.offset;
  const triggerRect = referenceRef.value.getBoundingClientRect();
  const panelWidth = panelRef.value.offsetWidth;
  const panelHeight = panelRef.value.offsetHeight;

  let top = triggerRect.bottom + offsetY;
  let left = triggerRect.left + offsetX;

  if (props.placement === "top") {
    top = triggerRect.top - panelHeight - offsetY;
    left = triggerRect.left + offsetX;
  }
  if (props.placement === "left") {
    top = triggerRect.top + offsetY;
    left = triggerRect.left - panelWidth - offsetX;
  }
  if (props.placement === "right") {
    top = triggerRect.top + offsetY;
    left = triggerRect.right + offsetX;
  }

  const maxLeft = Math.max(8, window.innerWidth - panelWidth - 8);
  const maxTop = Math.max(8, window.innerHeight - panelHeight - 8);
  const safeLeft = Math.min(Math.max(8, left), maxLeft);
  const safeTop = Math.min(Math.max(8, top), maxTop);

  panelStyle.value = {
    top: `${safeTop}px`,
    left: `${safeLeft}px`,
    zIndex: String(props.zIndex),
    visibility: "visible"
  };
}

async function syncLocation() {
  await nextTick();
  updateLocation();
}

function onDocumentPointerDown(event: Event) {
  if (!props.show || !props.closeOnClickOutside) return;
  const target = event.target as Node;
  if (referenceRef.value?.contains(target)) return;
  if (panelRef.value?.contains(target)) return;
  setShow(false);
}

function onWindowChanged() {
  if (!props.show) return;
  updateLocation();
}

watch(
  () => props.show,
  async (value) => {
    if (!value) return;
    panelStyle.value = { zIndex: String(props.zIndex), visibility: "hidden" };
    await syncLocation();
  }
);

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  window.addEventListener("resize", onWindowChanged);
  window.addEventListener("scroll", onWindowChanged, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  window.removeEventListener("resize", onWindowChanged);
  window.removeEventListener("scroll", onWindowChanged, true);
});
</script>

<template>
  <span ref="referenceRef" class="x-popover__reference" @click="toggleByTrigger">
    <slot name="reference" />
  </span>

  <Teleport to="body">
    <XOverlay
      v-if="overlay"
      :show="show"
      :z-index="overlayZIndex"
      :background="overlayBackground"
      @click="onOverlayClick"
    />
    <Transition :name="transitionName" @after-enter="handleAfterEnter">
      <div v-if="show" ref="panelRef" class="x-popover" :style="panelStyle">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.x-popover__reference {
  display: inline-flex;
  width: 100%;
}

.x-popover {
  position: fixed;
  transform-origin: top center;
}

.x-popover--bottom-enter-active,
.x-popover--bottom-leave-active,
.x-popover--top-enter-active,
.x-popover--top-leave-active,
.x-popover--left-enter-active,
.x-popover--left-leave-active,
.x-popover--right-enter-active,
.x-popover--right-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.x-popover--bottom-enter-from,
.x-popover--bottom-leave-to,
.x-popover--top-enter-from,
.x-popover--top-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.x-popover--left-enter-from,
.x-popover--left-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.x-popover--right-enter-from,
.x-popover--right-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
