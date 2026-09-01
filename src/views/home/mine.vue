<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, type Component } from "vue";
import { TemplateOne } from "@/components/Mine/templates";
import { TemplateTwo } from "@/components/Mine/templates";
import useAppStore from "@/store/modules/app";
import { isThemePreviewMode } from "@/utils/themePreview";

type MineTemplateName = "TemplateOne" | "TemplateTwo";

const app = useAppStore();
const templateMap: Record<MineTemplateName, Component> = {
  TemplateOne,
  TemplateTwo
};

const currentTemplateName = computed<MineTemplateName>(() => {
  return app.mineTemplate === "TemplateTwo" ? "TemplateTwo" : "TemplateOne";
});
const currentTemplate = computed(() => templateMap[currentTemplateName.value]);

onMounted(() => {
  if (!isThemePreviewMode()) void app.refreshThemeConfig();
});
</script>

<template>
  <div>
    <component :is="currentTemplate" class="mine-page__content" />
  </div>
</template>

<style scoped>
.mine-page__content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--skin__bg_1);
}
</style>
