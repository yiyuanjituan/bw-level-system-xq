<script setup lang="ts">
import { inject, ref } from "vue";

defineOptions({
  name: "ui-input"
});

interface Props {
  required?: boolean;
  password?: boolean;
  showEye?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffix_color?: string;
}

const modelValue = defineModel({ type: String, default: "" })
const showPassword = ref<boolean>(false);
const rules = inject("formRules");
const prop: any = inject("prop");
const validateField: any = inject("validateField");
const handleInput = (e: any) => {
  modelValue.value = e.target.value
  if (prop && rules[prop] && rules[prop].length) {
    validateField(prop)
  }
}
const handleBlur = () => {
  if (prop && rules[prop] && rules[prop].length) {
    validateField(prop)
  }
}
const props = withDefaults(defineProps<Props>(), {
  required: false,
  password: false,
  showEye: false,
  placeholder: "请输入....",
  prefix: '',
  suffix: '',
  suffix_color: ''
});
</script>

<template>
  <div class="ui-input">
    <span class="ui-input__prefix" v-if="$slots.prefix || props.prefix">
      <slot name="prefix" v-if="$slots.prefix" />
      <svg-icon :name="props.prefix" v-if="props.prefix && !$slots.prefix" class-name="!w-[15px] !h-[15px]" />
    </span>
    <div class="ui-input__input-wrap">
      <span class="ui-input__star-sign" v-if="props.required">*</span>
      <div class="ui-input__input-container">
        <input maxlength="16" :autocomplete="props.showEye ? (showPassword ? 'off' : 'new-password') : 'off'" size="1" :placeholder="props.placeholder" :type="props.showEye ? (showPassword ? 'text' : 'password') : 'text'" class="ui-input__input" :value="modelValue" @input="handleInput" @blur="handleBlur" />
      </div>
    </div>
    <span class="ui-input__suffix" v-if="$slots.suffix || props.suffix">
      <slot name="suffix" v-if="$slots.suffix" />
      <svg-icon :name="props.suffix" v-if="props.suffix && !$slots.suffix" class-name="!w-[15px] !h-[15px]" :style="{ color: props.suffix_color ? props.suffix_color : 'unset' }" />
      <template v-if="!$slots.suffix && !props.suffix">
<!--        <svg-icon name="eye_show" class-name="!w-[15px] !h-[15px]" />-->
<!--        <svg-icon name="eye_hide" class-name="!w-[15px] !h-[15px]" />-->
      </template>
    </span>
    <span class="ui-input__suffix" v-if="!$slots.suffix && !props.suffix && showEye" @click="showPassword = !showPassword">
      <svg-icon name="eye_show" class-name="!w-[15px] !h-[15px] text-[#f0c059]" v-if="showPassword" />
      <svg-icon name="eye_hide" class-name="!w-[15px] !h-[15px]" v-if="!showPassword" />
    </span>
  </div>
</template>

<style scoped lang="less">
.ui-input {
  border: 1px solid #313843;
  height: 35px;
  width: 100%;
  border-radius: 5px;
  position: relative;
  display: flex;
  align-items: center;
  background-color: #1c1e23;
  color: #68707b;
  font-size: 11px;
  padding: 0 10px;
  &:focus-within {
    border-color: #f0c059;
  }
  &__prefix {
    padding-right: 5px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__input-wrap {
    flex: 1 1 0;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
  }

  &__star-sign {
    display: block;
    color: #ea4e3d;
    width: 6px;
    height: 100%;
  }

  &__input-container {
    flex: 1 1 0;
    display: flex;
    padding-left: 2px;
  }

  &__input {
    background-color: transparent;
    border: 0;
    color: white;
    width: 100%;
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    ::placeholder {
      color: #525252 !important;
    }
  }
  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
  }
}
</style>
