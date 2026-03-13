<!-- layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <!-- 使用 RouterView 替代动态组件 -->
    <div class="content-area">
      <router-view v-slot="{ Component }" v-if="tabbarTransitionName != 'none'">
        <transition :name="tabbarTransitionName">
          <component :is="Component" class="page-content" />
        </transition>
      </router-view>
      <router-view v-else />
    </div>

    <!-- 底部导航栏保持不变 -->
    <TabBar />
  </div>
</template>

<script setup>
import { tabbarTransitionName } from "@/hooks/useTransition";
</script>

<style scoped>
/* 样式保持不变 */
</style>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgb(28, 30, 35);
  color: white;
}

.content-area {
  overflow: hidden;
  position: relative;
  flex: 1;
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
</style>
