<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import useAppStore from "@/store/modules/app";

defineOptions({
  name: "HomeBackTop"
});

const props = withDefaults(
  defineProps<{
    target?: string;
    isPut?: boolean;
  }>(),
  {
    target: "#scroll-box",
    isPut: false
  }
);

const app = useAppStore();
const isUTemplate = computed(() => app.themeTemplate === 1);
const showBackTop = ref(false);
let scrollTarget: HTMLElement | null = null;
let scrollFrame: number | null = null;

function updateBackTopVisibility() {
  showBackTop.value = Boolean(scrollTarget && scrollTarget.scrollTop >= 200);
}

function handleScroll() {
  if (scrollFrame !== null) return;

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = null;
    updateBackTopVisibility();
  });
}

function removeScrollListener() {
  scrollTarget?.removeEventListener("scroll", handleScroll);
  scrollTarget = null;

  if (scrollFrame !== null) {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = null;
  }
}

function bindScrollListener() {
  removeScrollListener();

  const targetElement = document.querySelector(props.target);
  if (!(targetElement instanceof HTMLElement)) {
    showBackTop.value = false;
    return;
  }

  scrollTarget = targetElement;
  scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
  updateBackTopVisibility();
}

function scrollToTop() {
  scrollTarget?.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

onMounted(bindScrollListener);
watch(() => props.target, bindScrollListener);
onBeforeUnmount(removeScrollListener);
</script>

<template>
  <button
    v-show="showBackTop"
    type="button"
    class="home-back-top"
    :class="{
      'home-back-top--put': isPut,
      'home-back-top--u': isUTemplate
    }"
    :aria-label="isUTemplate ? $t('顶部') : $t('返回顶部')"
    @click="scrollToTop"
  >
    <span class="home-back-top__icon-wrap">
      <svg-icon :name="isUTemplate ? 'comm_icon_fhdb' : 'comm_icon_top'" class-name="home-back-top__icon" />
    </span>
    <span class="home-back-top__title">{{ isUTemplate ? $t("顶部") : $t("返回顶部") }}</span>
  </button>
</template>

<style scoped lang="less">
.home-back-top {
  position: fixed;
  z-index: 100;
  bottom: calc(77px + var(--skin__safe-area-inset-bottom));
  left: 50%;
  width: auto;
  height: 20px;
  padding: 0 7.5px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  color: var(--skin__lead);
  background-color: var(--skin__bg_2);
  cursor: pointer;
  transform: translateX(-50%);
  appearance: none;

  &:active {
    opacity: 0.6;
  }
}

:global([dir="rtl"]) .home-back-top {
  right: 50%;
  left: auto;
  transform: translateX(50%);
}

.home-back-top__icon-wrap {
  margin-bottom: 0;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 9px;
}

:deep(.home-back-top__icon) {
  width: 1em;
  height: 1em;
  display: block;
}

.home-back-top__title {
  margin-left: 5px;
  color: currentColor;
  font-size: 9px;
  white-space: nowrap;
}

:global([dir="rtl"]) .home-back-top__title {
  margin-right: 5px;
  margin-left: 0;
}

.home-back-top--u {
  right: 3.5px;
  bottom: calc(77px + var(--skin__safe-area-inset-bottom));
  left: auto;
  width: 53px;
  height: auto;
  min-height: 48.5px;
  padding: 6.5px 5px;
  margin-top: 5px;
  flex-direction: column;
  border-color: var(--skin__border);
  border-radius: 5px;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
  transform: none;
}

.home-back-top--u .home-back-top__icon-wrap {
  width: 19px;
  height: 19px;
  margin-bottom: 3.5px;
  justify-content: center;
  color: var(--skin__text_primary);
  font-size: 12px;
  background-color: var(--skin__primary);
  border-radius: 50%;
}

.home-back-top--u :deep(.home-back-top__icon) {
  width: 8px;
  height: 13px;
}

.home-back-top--u .home-back-top__title {
  width: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  color: var(--skin__neutral_2);
  font-size: 9px;
  text-align: center;
}

:global([dir="rtl"]) .home-back-top--u {
  right: auto;
  left: 3.5px;
  box-shadow: -1px 0 3px rgba(0, 0, 0, 0.1);
  transform: none;
}

:global([dir="rtl"]) .home-back-top--u .home-back-top__title {
  margin: 0;
}
</style>
