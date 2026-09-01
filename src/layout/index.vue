<template>
  <div class="main-layout">
    <div class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition :name="tabbarTransitionName">
          <component :is="Component" :key="route.matched[1]?.path || route.path" class="page-content" />
        </transition>
      </router-view>
    </div>

    <UTabBar v-if="app.themeTemplate === 1" key="u-series-tabbar" />
    <TabBar v-else key="galaxy-tabbar" />
  </div>
</template>

<script setup lang="ts">
import { tabbarTransitionName } from "@/hooks/useTransition";
import useAppStore from "@/store/modules/app";

const app = useAppStore();
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);
  color: var(--skin__lead);
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
