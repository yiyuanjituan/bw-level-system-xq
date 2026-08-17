<template>
  <div class="main-layout">
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition :name="tabbarTransitionName">
          <component :is="Component" :key="route.matched[1]?.path || route.path" class="page-content" />
        </transition>
      </router-view>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { tabbarTransitionName } from "@/hooks/useTransition";
</script>

<style scoped>
.main-layout {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: var(--skin__safe-area-inset-top, 0px);
  background: rgb(28, 30, 35);
  color: white;
  overflow: hidden;
}

.content-area {
  overflow: hidden;
  position: relative;
  flex: 1;
  min-height: 0;
}

.page-content {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
