<script setup lang="ts">
import { computed, ref, watch } from "vue";

defineOptions({
  name: "HomeSkeletonImage"
});

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string;
    fit?: "cover" | "contain";
    loading?: "eager" | "lazy";
    decoding?: "async" | "sync" | "auto";
    fallbackSrc?: string;
  }>(),
  {
    src: "",
    alt: "",
    fit: "cover",
    loading: "lazy",
    decoding: "async",
    fallbackSrc: ""
  }
);

const currentSrc = ref("");
const status = ref<"loading" | "success" | "error">("error");
const imageStyle = computed(() => ({
  objectFit: props.fit
}));

function resetImage() {
  currentSrc.value = props.src || props.fallbackSrc || "";
  status.value = currentSrc.value ? "loading" : "error";
}

function handleError() {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    currentSrc.value = props.fallbackSrc;
    status.value = "loading";
    return;
  }

  currentSrc.value = "";
  status.value = "error";
}

watch(() => [props.src, props.fallbackSrc], resetImage, { immediate: true });
</script>

<template>
  <span
    class="home-skeleton-image lobby-image lobby-image--skeleton"
    :data-status="status"
    data-thumb="0"
    :role="status === 'error' && alt ? 'img' : undefined"
    :aria-label="status === 'error' && alt ? alt : undefined"
  >
    <img
      v-if="currentSrc"
      :src="currentSrc"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :style="imageStyle"
      @load="status = 'success'"
      @error="handleError"
    />
  </span>
</template>

<style scoped lang="less">
.home-skeleton-image {
  position: relative;
  display: block;
  overflow: hidden;
  line-height: 0;
  background-color: var(--skin__bg_1);

  > img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    display: block;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &[data-status="success"] > img {
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
  border-radius: inherit;
  opacity: 0.5;
  animation: common_bganimation 0.9s linear infinite;
}

:global([dir="rtl"]) .lobby-image--skeleton[data-status="loading"][data-thumb="0"] {
  background-image: linear-gradient(
    -90deg,
    var(--skin__border),
    var(--skin__border),
    var(--skin__border),
    var(--skin__bg_2),
    var(--skin__border),
    var(--skin__border),
    var(--skin__border)
  ) !important;
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
