<template>
  <div class="main-layout">
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition :name="tabbarTransitionName">
          <component :is="Component" :key="route.path" class="page-content" />
        </transition>
      </router-view>
    </div>
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
  background: var(--skin__bg_1);
  overflow: hidden;
}

.content-area {
  flex: 1;
  min-height: 0;
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
</style>
