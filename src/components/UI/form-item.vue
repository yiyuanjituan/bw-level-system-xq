<script setup lang="ts">
import { inject, provide, ref } from "vue";

defineOptions({
  name: "ui-form-item"
});

interface Props {
  prop?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prop: ""
});
provide('prop', props.prop);
const rules = inject("formRules");
const form = inject("form");
const errors = inject("errors");
</script>

<template>
  <div class="ui-form-item">
    <slot />
    <div class="explain" v-if="errors[props.prop]">
      <div class="explain-icon">
        <img src="@/assets/common/comm_icon_tip1.avif" alt="." />
      </div>
      <span class="explain-text">{{ errors[props.prop] }}</span>
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
