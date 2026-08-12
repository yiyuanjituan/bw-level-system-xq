<script setup lang="ts">
import { computed, ref } from "vue";

type DragTarget = "saturation" | "hue" | "alpha";

defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", color: string): void;
  (event: "change", color: string): void;
}>();

const hue = ref(0);
const saturation = ref(1);
const brightness = ref(1);
const alpha = ref(1);
const dragTarget = ref<DragTarget | null>(null);

const hueColor = computed(() => `hsl(${hue.value}, 100%, 50%)`);
const rgb = computed(() => {
  const chroma = brightness.value * saturation.value;
  const hueSection = hue.value / 60;
  const intermediate = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const offset = brightness.value - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSection < 1) [red, green, blue] = [chroma, intermediate, 0];
  else if (hueSection < 2) [red, green, blue] = [intermediate, chroma, 0];
  else if (hueSection < 3) [red, green, blue] = [0, chroma, intermediate];
  else if (hueSection < 4) [red, green, blue] = [0, intermediate, chroma];
  else if (hueSection < 5) [red, green, blue] = [intermediate, 0, chroma];
  else [red, green, blue] = [chroma, 0, intermediate];

  return {
    red: Math.round((red + offset) * 255),
    green: Math.round((green + offset) * 255),
    blue: Math.round((blue + offset) * 255)
  };
});

const hexColor = computed(() => {
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(rgb.value.red)}${toHex(rgb.value.green)}${toHex(rgb.value.blue)}`;
});

const selectedColor = computed(() => {
  if (alpha.value === 1) return hexColor.value;
  return `rgba(${rgb.value.red}, ${rgb.value.green}, ${rgb.value.blue}, ${alpha.value.toFixed(2)})`;
});

const saturationCursorStyle = computed(() => ({
  left: `${saturation.value * 257}px`,
  top: `${(1 - brightness.value) * 148}px`
}));
const hueCursorStyle = computed(() => ({ top: `${(1 - hue.value / 360) * 193}px` }));
const alphaCursorStyle = computed(() => ({ top: `${(1 - alpha.value) * 193}px` }));
const alphaGradient = computed(() => ({
  background: `linear-gradient(to top, rgba(${rgb.value.red}, ${rgb.value.green}, ${rgb.value.blue}, 0), rgb(${rgb.value.red}, ${rgb.value.green}, ${rgb.value.blue}))`
}));

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function updateColor(target: DragTarget, event: PointerEvent) {
  const element = event.currentTarget;
  if (!(element instanceof HTMLElement)) return;

  const rect = element.getBoundingClientRect();
  const horizontalRatio = clamp((event.clientX - rect.left) / rect.width);
  const verticalRatio = clamp((event.clientY - rect.top) / rect.height);

  if (target === "saturation") {
    saturation.value = horizontalRatio;
    brightness.value = 1 - verticalRatio;
  } else if (target === "hue") {
    hue.value = (1 - verticalRatio) * 360;
  } else {
    alpha.value = 1 - verticalRatio;
  }

  emit("update:modelValue", selectedColor.value);
  emit("change", selectedColor.value);
}

function startDrag(target: DragTarget, event: PointerEvent) {
  dragTarget.value = target;
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  updateColor(target, event);
}

function continueDrag(target: DragTarget, event: PointerEvent) {
  if (dragTarget.value !== target) return;
  updateColor(target, event);
}

function stopDrag() {
  dragTarget.value = null;
}
</script>

<template>
  <div class="plazza-color-picker" @click.stop>
    <div class="plazza-color-picker__row">
      <div>
        <div
          class="plazza-color-picker__saturation"
          :style="{ background: hueColor }"
          @pointerdown.prevent="startDrag('saturation', $event)"
          @pointermove.prevent="continueDrag('saturation', $event)"
          @pointerup="stopDrag"
          @pointercancel="stopDrag"
        >
          <div class="plazza-color-picker__saturation-white"></div>
          <div class="plazza-color-picker__saturation-black"></div>
          <div class="plazza-color-picker__cursor" :style="saturationCursorStyle"></div>
        </div>

        <div class="plazza-color-picker__values">
          <div class="plazza-color-picker__value">
            <span>Hex</span>
            <strong>{{ hexColor }}</strong>
          </div>
          <div class="plazza-color-picker__value">
            <span>透明度</span>
            <strong>{{ Math.round(alpha * 100) }}%</strong>
          </div>
        </div>
      </div>

      <div
        class="plazza-color-picker__slider plazza-color-picker__hue"
        @pointerdown.prevent="startDrag('hue', $event)"
        @pointermove.prevent="continueDrag('hue', $event)"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
      >
        <div class="plazza-color-picker__slider-cursor" :style="hueCursorStyle"></div>
      </div>

      <div
        class="plazza-color-picker__slider plazza-color-picker__alpha"
        @pointerdown.prevent="startDrag('alpha', $event)"
        @pointermove.prevent="continueDrag('alpha', $event)"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
      >
        <div class="plazza-color-picker__alpha-gradient" :style="alphaGradient"></div>
        <div class="plazza-color-picker__slider-cursor" :style="alphaCursorStyle"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.plazza-color-picker {
  position: absolute;
  top: 28.5px;
  left: 0;
  z-index: 10;
  width: 355px;
  max-width: 100%;
  padding: 10px;
  border-radius: 7px;
  box-sizing: border-box;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
}

.plazza-color-picker__row {
  display: flex;
}

.plazza-color-picker__saturation {
  position: relative;
  width: 275px;
  height: 166px;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
}

.plazza-color-picker__saturation-white,
.plazza-color-picker__saturation-black {
  position: absolute;
  inset: 0;
}

.plazza-color-picker__saturation-white {
  background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.plazza-color-picker__saturation-black {
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
}

.plazza-color-picker__cursor,
.plazza-color-picker__slider-cursor {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--skin__bg_2);
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  opacity: 0.6;
}

.plazza-color-picker__slider {
  position: relative;
  flex: 0 0 20px;
  width: 20px;
  height: 211px;
  margin-left: 10px;
  cursor: pointer;
  touch-action: none;
}

.plazza-color-picker__hue {
  background: linear-gradient(to top, red, #ff0, #0f0, #0ff, #00f, #f0f, red);
}

.plazza-color-picker__alpha {
  overflow: hidden;
  background: repeating-conic-gradient(#ccc, #ccc 25%, #fff 0%, #fff 50%) 50% / 6px 6px;
}

.plazza-color-picker__alpha-gradient {
  position: absolute;
  inset: 0;
}

.plazza-color-picker__slider-cursor {
  left: 50%;
  transform: translateX(-50%);
}

.plazza-color-picker__values {
  display: flex;
  margin-top: 10px;
}

.plazza-color-picker__value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 132.5px;
  height: 35px;
  padding: 0 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px;
  box-sizing: border-box;
  font-size: 11px;

  &:last-child {
    margin-left: 10px;
  }

  span {
    color: var(--skin__neutral_2);
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }
}

:global([dir="rtl"]) .plazza-color-picker {
  right: 0;
  left: auto;
}

:global([dir="rtl"]) .plazza-color-picker__saturation-white {
  background: linear-gradient(to left, #fff, rgba(255, 255, 255, 0));
}

:global([dir="rtl"]) .plazza-color-picker__slider {
  margin-right: 10px;
  margin-left: 0;
}

:global([dir="rtl"]) .plazza-color-picker__value:last-child {
  margin-right: 10px;
  margin-left: 0;
}
</style>
