<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "x-loading"
});

interface Props {
  size?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "1em"
});

const loadingStyle = computed(() => ({
  fontSize: typeof props.size === "number" ? `${props.size}px` : props.size
}));
</script>

<template>
  <span class="x-loading" :style="loadingStyle">
    <span class="x-loading__icon">
      <slot>
        <svg-icon name="loading" />
      </slot>
    </span>
  </span>
</template>

<style scoped lang="less">
.x-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;

  &__icon {
    font-size: inherit;
    line-height: 1;
    display: inline-flex;
    animation: x-loading-rotate 1s linear infinite;
  }
}

@keyframes x-loading-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
