<template>
  <div class="app-loading" role="status" aria-label="页面加载中">
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
import { getRuntimeLoadingType } from "@/utils/runtimeConfig";

const loadingType = getRuntimeLoadingType();
</script>

<style scoped lang="less">
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
</style>
