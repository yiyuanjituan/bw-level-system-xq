<script setup lang="ts">
import TemplateTwoMenuItem from "./TemplateTwoMenuItem.vue";
import type { MineTemplateActionItem, MineTemplateMenuGroup } from "./types";

defineOptions({
  name: "TemplateTwoMenu"
});

defineProps<{
  groups: MineTemplateMenuGroup[];
}>();

const emit = defineEmits<{
  select: [item: MineTemplateActionItem];
}>();
</script>

<template>
  <div class="mine-template-two-menu">
    <section
      v-for="group in groups"
      :key="group.key"
      class="mine-template-two-menu__group"
    >
      <TemplateTwoMenuItem
        v-for="item in group.items"
        :key="item.key"
        :item="item"
        @select="emit('select', $event)"
      />
    </section>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-menu {
  --menu-list-wrap-padding-bottom: 10px;
  padding-bottom: calc(var(--menu-list-wrap-padding-bottom) + var(--big-icon-offset-top, 0px) + var(--skin__safe-area-inset-bottom, 0px));
  background: var(--skin__bg_1);
  font-size: 12px;
}

.mine-template-two-menu__group {
  background: var(--skin__bg_2);

  & + & {
    margin-top: 25px;
  }

  :deep(.mine-template-two-menu-item + .mine-template-two-menu-item) {
    border-top: var(--lobby__px) solid var(--skin__border);
  }
}
</style>
