<template>
  <div class="main-layout">
    <!-- 主要内容区域 -->
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition :name="tabbarTransitionName">
          <component :is="Component" :key="route.path" class="page-content" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { tabbarTransitionName } from "@/hooks/useTransition";
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.page-content {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bottom-nav {
  display: flex;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  transition: all 0.3s;
}

.nav-item.active {
  color: #1890ff;
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

/* 页面级左右平移动画 */
.page-slide-forward-enter-active,
.page-slide-forward-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-forward-enter-from {
  transform: translateX(100%);
}

.page-slide-forward-enter-to {
  transform: translateX(0);
}

.page-slide-forward-leave-from {
  transform: translateX(0);
}

.page-slide-forward-leave-to {
  transform: translateX(-100%);
}

.page-slide-backward-enter-active,
.page-slide-backward-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-backward-enter-from {
  transform: translateX(-100%);
}

.page-slide-backward-enter-to {
  transform: translateX(0);
}

.page-slide-backward-leave-from {
  transform: translateX(0);
}

.page-slide-backward-leave-to {
  transform: translateX(100%);
}

/* 无动画 */
.none-enter-active,
.none-leave-active {
  transition: none;
}
</style>
