<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from "vue";
import { TemplateOne } from "@/components/Mine/templates";
import useAppStore from "@/store/modules/app";

type MineTemplateName = "TemplateOne" | "TemplateTwo";

const app = useAppStore();
const templateMap: Record<MineTemplateName, Component> = {
  TemplateOne,
  TemplateTwo: defineAsyncComponent(() => import("@/components/Mine/templates/TemplateTwo/TemplateTwo.vue"))
};

const currentTemplateName = computed<MineTemplateName>(() => {
  return app.mineTemplate === "TemplateTwo" ? "TemplateTwo" : "TemplateOne";
});
const currentTemplate = computed(() => templateMap[currentTemplateName.value]);
</script>

<template>
  <component :is="currentTemplate" />
</template>
