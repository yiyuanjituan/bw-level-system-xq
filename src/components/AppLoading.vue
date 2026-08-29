<template>
  <section v-if="inApp" class="app-splash" role="status" aria-live="polite">
    <img class="app-splash__background" :src="appSplashImage" alt="" />
    <div class="app-splash__loading">
      <div class="app-splash__progress">
        <span class="app-splash__percentage" :style="percentageStyle">{{ progress }}%</span>
        <div
          class="app-splash__track"
          role="progressbar"
          aria-label="应用加载进度"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="progress"
        >
          <i :style="progressStyle"></i>
        </div>
      </div>
      <p class="app-splash__status">{{ app.appLoadingStatus }}</p>
    </div>
    <p class="app-splash__device">{{ deviceVersionLabel }}</p>
  </section>

  <div v-else class="app-loading" role="status" aria-label="页面加载中">
    <div v-if="loadingType === 'dots'" class="app-loading__dots">
      <ul>
        <li class="a"></li>
        <li class="b"></li>
        <li class="c"></li>
        <li class="d"></li>
        <li class="e"></li>
        <li class="f"></li>
        <li class="g"></li>
        <li class="h"></li>
        <li class="i"></li>
      </ul>
    </div>
    <div v-else-if="loadingType === 'ring'" class="app-loading__ring"></div>
    <div v-else class="app-loading__pulse">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import appSplashImage from "@/assets/app/app-splash-v1.jpg";
import useAppStore from "@/store/modules/app";
import { getRuntimeLoadingType } from "@/utils/runtimeConfig";
import {
  getAppDeviceVersionFallbackLabel,
  getAppDeviceVersionLabel,
  isYimenApp,
} from "@/utils/yimenApp";

const app = useAppStore();
// 网页端调试启动页时设为 true，恢复 App 专用时改回 false
const inApp = isYimenApp();
const loadingType = getRuntimeLoadingType();
const deviceVersionLabel = ref(getAppDeviceVersionFallbackLabel());
const progress = computed(() => Math.min(100, Math.max(0, Math.round(app.appLoadingProgress))));
const progressStyle = computed(() => ({ width: `${progress.value}%` }));
const percentageStyle = computed(() => ({
  left: `clamp(var(--app-splash-bubble-min), ${progress.value}%, var(--app-splash-bubble-max))`,
}));

const setLoadingProgress = (nextProgress: number, status?: string) => {
  if (!Number.isFinite(nextProgress)) return;

  app.appLoadingProgress = Math.min(100, Math.max(0, nextProgress));
  if (status) {
    app.appLoadingStatus = status;
  }
};

onMounted(async () => {
  if (!inApp) return;

  window.setLoadingProgress = setLoadingProgress;
  deviceVersionLabel.value = await getAppDeviceVersionLabel();
});

onBeforeUnmount(() => {
  if (window.setLoadingProgress === setLoadingProgress) {
    delete window.setLoadingProgress;
  }
});
</script>

<style scoped lang="less">
.app-splash {
  --app-splash-bubble-width: 36.25px;
  --app-splash-arrow-offset: 2px;
  --app-splash-bubble-min: 20.125px;
  --app-splash-bubble-max: calc(100% - 16.125px);
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: hidden;
  background: #38a889;
  color: #fff;

  &::before,
  &::after {
    position: absolute;
    inset: 0;
    z-index: 1;
    content: "";
    pointer-events: none;
  }

  &::before {
    background: rgba(43, 184, 149, 0.52);
  }

  &::after {
    background: linear-gradient(180deg, rgba(35, 169, 139, 0.06) 45%, rgba(33, 159, 132, 0.2) 100%);
  }
}

.app-splash__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.app-splash__loading {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom) + 60px);
  left: 76.5625px;
  z-index: 2;
  width: 221.25px;
}

.app-splash__progress {
  position: relative;
  padding-top: 20px;
}

.app-splash__percentage {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--app-splash-bubble-width);
  height: 15.3125px;
  padding: 0;
  border-radius: 4.25px;
  background: #55bd35;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  font-family: Roboto, Arial, sans-serif;
  font-size: 10.75px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  line-height: 15.3125px;
  text-align: center;
  transform: translateX(calc(-50% - var(--app-splash-arrow-offset)));
  transition: left 0.64s ease;

  &::after {
    position: absolute;
    top: calc(100% - 0.5px);
    left: calc(50% + var(--app-splash-arrow-offset));
    width: 6.25px;
    height: 4.375px;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    content: "";
    transform: translateX(-50%);
  }
}

.app-splash__track {
  height: 8.125px;
  overflow: hidden;
  border-radius: 4.0625px;
  background: rgba(218, 240, 231, 0.36);
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.12);

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #55bd35;
    box-shadow: 0 0 3px rgba(43, 196, 41, 0.36);
    transition: width 0.64s ease;
  }
}

.app-splash__status {
  min-height: 17px;
  margin: 18px 0 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
  font-family: Roboto, Arial, "Microsoft YaHei", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-splash__device {
  position: absolute;
  right: 7.8125px;
  bottom: max(20px, env(safe-area-inset-bottom));
  z-index: 2;
  max-width: calc(100% - 15.625px);
  margin: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.56);
  font-family: Roboto, Arial, sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 15px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-loading {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.app-loading__dots {
  ul {
    position: relative;
    width: 60px;
    height: 60px;
    transform: rotate(45deg) translate(25px, 25px);
  }

  li {
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    list-style-type: none;
    background: #fff;
  }

  .a {
    animation: app-loading-a 1s ease-in-out infinite;
  }

  .b {
    animation: app-loading-b 1s ease-in-out infinite;
  }

  .c {
    animation: app-loading-c 1s ease-in-out infinite;
  }

  .d {
    animation: app-loading-d 1s ease-in-out infinite;
  }

  .e {
    animation: app-loading-e 1s ease-in-out infinite;
  }

  .f {
    animation: app-loading-f 1s ease-in-out infinite;
  }

  .g {
    animation: app-loading-g 1s ease-in-out infinite;
  }

  .h {
    animation: app-loading-h 1s ease-in-out infinite;
  }

  .i {
    animation: app-loading-i 1s ease-in-out infinite;
  }
}

.app-loading__ring {
  width: 44px;
  height: 44px;
  border: 4px solid #333;
  border-top-color: #fff;
  border-radius: 50%;
  animation: app-loading-ring 0.8s linear infinite;
}

.app-loading__pulse {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;

  span {
    width: 7px;
    height: 20px;
    border-radius: 4px;
    background: #fff;
    animation: app-loading-pulse 0.9s ease-in-out infinite;
  }

  span:nth-child(2) {
    animation-delay: 0.12s;
  }

  span:nth-child(3) {
    animation-delay: 0.24s;
  }
}

@keyframes app-loading-ring {
  to { transform: rotate(360deg); }
}

@keyframes app-loading-pulse {
  0%, 100% { transform: scaleY(0.45); opacity: 0.45; }
  50% { transform: scaleY(1); opacity: 1; }
}

@keyframes app-loading-a {
  0% { top: 0; left: 0; }
  50% { top: -20px; left: -20px; }
  100% { top: -20px; left: -20px; }
}

@keyframes app-loading-b {
  0% { top: 0; left: 0; }
  50% { top: -20px; left: 0; }
  100% { top: -20px; left: 0; }
}

@keyframes app-loading-c {
  0% { top: 0; left: 0; }
  50% { top: -20px; left: 20px; }
  100% { top: -20px; left: 20px; }
}

@keyframes app-loading-d {
  0% { top: 0; left: 0; }
  50% { top: 0; left: -20px; }
  100% { top: 0; left: -20px; }
}

@keyframes app-loading-e {
  0% { top: 0; left: 0; }
  50% { top: 0; left: 0; }
  100% { top: 0; left: 0; }
}

@keyframes app-loading-f {
  0% { top: 0; left: 0; }
  50% { top: 0; left: 20px; }
  100% { top: 0; left: 20px; }
}

@keyframes app-loading-g {
  0% { top: 0; left: 0; }
  50% { top: 20px; left: -20px; }
  100% { top: 20px; left: -20px; }
}

@keyframes app-loading-h {
  0% { top: 0; left: 0; }
  50% { top: 20px; left: 0; }
  100% { top: 20px; left: 0; }
}

@keyframes app-loading-i {
  0% { top: 0; left: 0; }
  50% { top: 20px; left: 20px; }
  100% { top: 20px; left: 20px; }
}

@media (orientation: landscape) {
  .app-splash__background {
    object-position: center 28%;
  }

  .app-splash__loading {
    top: auto;
    right: 72px;
    bottom: max(58px, calc(env(safe-area-inset-bottom) + 42px));
    left: 72px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-splash__percentage,
  .app-splash__track i {
    transition: none;
  }
}
</style>
