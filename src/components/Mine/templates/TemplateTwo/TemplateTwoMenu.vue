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
  <div class="mine-template-two-menu menulist-wrap">
    <template v-for="(group, groupIndex) in groups" :key="group.key">
      <ul class="mine-template-two-menu__list menulist">
        <TemplateTwoMenuItem
          v-for="item in group.items"
          :key="item.key"
          :item="item"
          @select="emit('select', $event)"
        />
      </ul>
      <div
        v-if="groupIndex < groups.length - 1"
        class="mine-template-two-menu__space space"
      />
    </template>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-menu {
  --menu-list-wrap-padding-bottom: 10px;
  padding-bottom: calc(var(--menu-list-wrap-padding-bottom) + var(--big-icon-offset-top, 0px) + var(--skin__safe-area-inset-bottom, 0px));
  background: var(--skin__bg_2);
  font-size: 12px;
}

.mine-template-two-menu__list {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--skin__bg_2);
}

.mine-template-two-menu__space {
  height: 10px;
  margin: 7.5px 0;
  background: var(--skin__bg_1);
}
</style>
