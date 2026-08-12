<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(defineProps<{
  src?: string;
  alt: string;
  fallbackSrc?: string;
  errorText?: string;
}>(), {
  src: "",
  fallbackSrc: "",
  errorText: "图片加载失败"
});

const currentSrc = ref(props.src || props.fallbackSrc);
const status = ref<"loading" | "loaded" | "error">(currentSrc.value ? "loading" : "error");

function resetImage() {
  currentSrc.value = props.src || props.fallbackSrc;
  status.value = currentSrc.value ? "loading" : "error";
}

function handleError() {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc;
    status.value = "loading";
    return;
  }

  status.value = "error";
}

watch(() => [props.src, props.fallbackSrc], resetImage);
</script>

<template>
  <span
    class="plazza-lazy-image lobby-image--skeleton"
    :data-status="status"
    data-thumb="0"
    :role="status === 'error' ? 'img' : undefined"
    :aria-label="status === 'error' ? alt : undefined"
  >
    <img
      v-if="currentSrc && status !== 'error'"
      :src="currentSrc"
      :alt="alt"
      loading="lazy"
      decoding="async"
      @load="status = 'loaded'"
      @error="handleError"
    />
    <span v-else-if="errorText" class="plazza-lazy-image__error">{{ errorText }}</span>
  </span>
</template>

<style scoped lang="less">
.plazza-lazy-image {
  position: relative;
  display: block;
  overflow: hidden;
  background-color: var(--skin__bg_1);

  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &[data-status="loaded"] > img {
    opacity: 1;
  }
}

.lobby-image--skeleton[data-status="loading"][data-thumb="0"] {
  background-image: linear-gradient(
    90deg,
    var(--skin__border),
    var(--skin__border),
    var(--skin__border),
    var(--skin__bg_2),
    var(--skin__border),
    var(--skin__border),
    var(--skin__border)
  ) !important;
  background-size: 200% 100% !important;
  border-radius: 2px;
  opacity: 0.5;
  animation: common_bganimation 0.9s linear infinite;
}

.plazza-lazy-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__neutral_2);
  font-size: 11px;
}

@keyframes common_bganimation {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}
</style>
