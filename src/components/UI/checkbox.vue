<script setup lang="ts">

defineOptions({
  name: "ui-checkbox",
})
const modelValue = defineModel({
  type: Boolean,
  default: false
});

</script>

<template>
  <div class="ui-checkbox" :class="{ 'ui-checkbox--checked': modelValue }">
    <input type="checkbox" class="ui-checkbox__input" :checked="modelValue" />
    <div class="ui-checkbox__icon-wrap" @click="modelValue = !modelValue">
      <i class="inline-flex justify-center items-center text-[12px] ui-checkbox__icon">
        <svg-icon name="check-icon" />
      </i>
    </div>
    <span class="ui-checkbox__label"><slot /></span>
  </div>
</template>

<style scoped lang="less">
.ui-checkbox {
  display: flex;
  align-items: flex-start;
  &__input {
    display: none;
  }
  &__icon-wrap {
    height: 16px;
    width: 16px;
    margin-right: 2px;
    border-radius: 3px;
    background-color: #1C1E23;
    border: 1px solid #313843;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    box-sizing: border-box;
  }
  &__icon {
    font-size: 12px;
    opacity: 0;
    cursor: pointer;
  }
  &__label {
    color: #68707B;
  }
  &--checked {
    .ui-checkbox__icon-wrap {
      background-color: #04BE02;
      border: none;
    }
    .ui-checkbox__icon {
      opacity: 1;
      color: white;
    }
  }
}
</style>
