<script setup lang="ts">
import { computed, inject, provide, toRef } from "vue";
import { X_FORM_CONTEXT_KEY, X_FORM_ITEM_PROP_KEY } from "./x-form-context";

defineOptions({
  name: "x-form-item"
});

interface Props {
  prop?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prop: ""
});

const propRef = toRef(props, "prop");
const formContext = inject(X_FORM_CONTEXT_KEY, null);
const errorMessage = computed(() => {
  if (!props.prop) return "";
  return formContext?.errors.value?.[props.prop] ?? "";
});

provide(X_FORM_ITEM_PROP_KEY, propRef);
</script>

<template>
  <div class="x-form-item">
    <slot />
    <div class="x-form-item__explain" v-if="errorMessage">
      <div class="x-form-item__explain-icon">
        <img src="@/assets/common/comm_icon_tip1.avif" alt="." />
      </div>
      <span class="x-form-item__explain-text">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.x-form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  position: relative;

  &__explain {
    display: flex;
    align-items: flex-start;
    line-height: 1.3;
    min-height: 15px;
    margin-top: 4px;
    font-size: 11px;
    color: var(--skin__accent_2);
  }

  &__explain-icon {
    background: var(--skin__accent_2);
    margin-right: 5px;
    color: #fff;
    width: 13px;
    height: 13px;
    font-size: 8px;
    line-height: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 49950px;
    flex-shrink: 0;
  }
}

[dir="rtl"] .x-form-item__explain-icon {
  margin-right: 0;
  margin-left: 5px;
}
</style>
