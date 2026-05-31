<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

defineOptions({
  name: "x-text"
});

interface Props {
  value?: number | string;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  autoplay?: boolean;
  useGrouping?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  duration: 1200,
  separator: ",",
  prefix: "",
  suffix: "",
  autoplay: true,
  useGrouping: false
});

const emit = defineEmits<{
  (e: "finish", value: number): void;
}>();

const currentValue = ref(0);

let rafId = 0;
let animationStartTime = 0;
let startValue = 0;
let targetValue = 0;

const resolvedDecimals = computed(() => {
  if (typeof props.decimals === "number") return Math.max(0, props.decimals);
  const decimalPart = String(props.value).split(".")[1];
  return decimalPart ? decimalPart.length : 0;
});

const displayText = computed(() => {
  return `${props.prefix}${formatValue(currentValue.value)}${props.suffix}`;
});

function toNumber(value: number | string) {
  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function roundValue(value: number) {
  const factor = 10 ** resolvedDecimals.value;
  return Math.round(value * factor) / factor;
}

function formatValue(value: number) {
  const fixed = roundValue(value).toFixed(resolvedDecimals.value);
  const [integerPart, decimalPart] = fixed.split(".");
  const groupedInteger = props.useGrouping
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator)
    : integerPart;

  return decimalPart ? `${groupedInteger}.${decimalPart}` : groupedInteger;
}

function stop() {
  if (!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
}

function finish() {
  stop();
  currentValue.value = roundValue(targetValue);
  emit("finish", currentValue.value);
}

function step(timestamp: number) {
  if (!animationStartTime) animationStartTime = timestamp;

  const duration = Math.max(props.duration, 0);
  const progress = duration === 0 ? 1 : Math.min((timestamp - animationStartTime) / duration, 1);
  const nextValue = startValue + (targetValue - startValue) * progress;

  currentValue.value = roundValue(nextValue);

  if (progress >= 1) {
    finish();
    return;
  }

  rafId = requestAnimationFrame(step);
}

function start(from = 0) {
  stop();
  animationStartTime = 0;
  startValue = toNumber(from);
  targetValue = toNumber(props.value);

  if (startValue === targetValue || props.duration <= 0) {
    finish();
    return;
  }

  currentValue.value = roundValue(startValue);
  rafId = requestAnimationFrame(step);
}

function reset() {
  stop();
  animationStartTime = 0;
  currentValue.value = 0;
}

watch(
  () => [props.value, props.duration, props.decimals, props.autoplay],
  () => {
    if (props.autoplay) {
      start(0);
      return;
    }
    reset();
  },
  { immediate: true }
);

onBeforeUnmount(stop);

defineExpose({
  start,
  stop,
  reset,
  value: currentValue
});
</script>

<template>
  <span class="x-text">{{ displayText }}</span>
</template>

<style scoped lang="less">
.x-text {
  display: inline-flex;
  align-items: center;
  line-height: inherit;
  font-variant-numeric: tabular-nums;
}
</style>
