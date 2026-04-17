<script setup lang="ts">
import { computed, inject, provide, toRef } from "vue";
import { FORM_CONTEXT_KEY, FORM_ITEM_PROP_KEY } from "./form-context";

defineOptions({
  name: "ui-form-item"
});

interface Props {
  prop?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prop: ""
});

const propRef = toRef(props, "prop");
const formContext = inject(FORM_CONTEXT_KEY, null);
const errorMessage = computed(() => {
  if (!props.prop)
    return "";
  return formContext?.errors.value?.[props.prop] ?? "";
});

provide(FORM_ITEM_PROP_KEY, propRef);

// Keep legacy injection for existing field components.
provide("prop", props.prop);
</script>

<template>
  <div class="ui-form-item">
    <slot />
    <div class="explain" v-if="errorMessage">
      <div class="explain-icon">
        <img src="@/assets/common/comm_icon_tip1.avif" alt="." />
      </div>
      <span class="explain-text">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  position: relative;

  .explain {
    display: flex;
    align-items: flex-start;
    line-height: 1.3;
    min-height: 15px;
    margin-top: 4px;
    font-size: 11px;
    transition: color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    color: #ea4e3d;

    .explain-icon {
      background: #ea4e3d;
      margin-right: 5px;
      color: #fff;
      width: 13px;
      height: 13px;
      font-size: 8px;
      line-height: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 999999rem;
    }
  }
}
</style>
