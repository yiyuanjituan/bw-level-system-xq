<script setup lang="ts">
import { inject, ref } from "vue";

defineOptions({
  name: "ui-select"
});

interface Props {
  required?: boolean;
  password?: boolean;
  showEye?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffix_color?: string;
  options: any[];
}

const modelValue = defineModel({ type: String, default: "" });
const showPassword = ref<boolean>(false);
const rules = inject("formRules");
const prop: any = inject("prop");
const validateField: any = inject("validateField");
const isFocus = ref(false);

const handleInput = (e: any) => {
  modelValue.value = e.target.value;
  if (prop && rules[prop] && rules[prop].length) {
    validateField(prop);
  }
};
const handleBlur = () => {
  if (prop && rules[prop] && rules[prop].length) {
    validateField(prop);
  }
};

const handleSelect =(e: any) => {
  modelValue.value = e.id
  isFocus.value = false;

  if (prop && rules[prop] && rules[prop].length) {
    validateField(prop);
  }
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  password: false,
  showEye: false,
  placeholder: "请输入....",
  prefix: "",
  suffix: "",
  suffix_color: "",
  options: () => []
});
</script>

<template>
  <van-popover
    v-model:show="isFocus"
    :show-arrow="false"
    :offset="[0, 0]"
    style="width: 315px"
    placement="top"
  >
    <template #reference>
      <div
        class="ui-input ui-input-select"
        :class="{ 'select-focus': isFocus }"
      >
        <span class="ui-input__prefix" v-if="$slots.prefix || props.prefix">
          <slot name="prefix" v-if="$slots.prefix" />
          <svg-icon
            :name="props.prefix"
            v-if="props.prefix && !$slots.prefix"
            class-name="!w-[15px] !h-[15px]"
          />
        </span>
        <div class="ui-input__input-wrap">
          <span class="ui-input__star-sign" v-if="props.required && false"
            >*</span
          >
          <div class="ui-input__input-container">
            <span class="text-white" v-if="!modelValue">请选择币种</span>
            <template v-if="modelValue">
              <span class="flex items-center justify-center pr-[5px]">
                <img :src="props.options.find(v => v.id == modelValue)?.icon" alt="." class="w-[18px] h-[18px]">
              </span>
              <span class="flex items-center justify-center text-white text-[11px]">{{ props.options.find(v => v.id == modelValue)?.label }}</span>
            </template>
          </div>
        </div>
        <span class="ui-input__suffix" v-if="$slots.suffix || props.suffix">
          <slot name="suffix" v-if="$slots.suffix" />
          <svg-icon
            :name="props.suffix"
            v-if="props.suffix && !$slots.suffix"
            class-name="!w-[15px] !h-[15px]"
            :style="{
              color: props.suffix_color ? props.suffix_color : 'unset'
            }"
          />
          <template v-if="!$slots.suffix && !props.suffix">
            <!--        <svg-icon name="eye_show" class-name="!w-[15px] !h-[15px]" />-->
            <!--        <svg-icon name="eye_hide" class-name="!w-[15px] !h-[15px]" />-->
          </template>
        </span>
        <span
          class="ui-input__suffix"
          v-if="!$slots.suffix && !props.suffix && showEye"
          @click="showPassword = !showPassword"
        >
          <i class="icon inline-flex justify-center items-center text-[9px]">
            <svg
              width="1em"
              height="1em"
              fill="currentColor"
              class="transition-all duration-500"
              :class="[isFocus ? 'rotate-[450deg]' : 'rotate-[270deg]']"
            >
              <use xlink:href="#ui-arrow-418a3a"></use>
            </svg>
          </i>
        </span>
      </div>
    </template>
    <div class="select-options">
      <div class="scroll-box">
        <div class="options" v-for="i in options" :key="i">
          <div class="span-content" @click="handleSelect(i)">
            <img :src="i.icon" alt="." class="country-icon" />
            <span>{{ i.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </van-popover>
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
  }

  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
  }
}

.ui-input-select.select-focus {
  border-color: #f0c059;
}

.select-options {
  padding: 7.5px 1.5px;
  box-sizing: border-box;
  max-height: 285px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #1c1e23;
  border: solid 1px #565c6c;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  color: white;

  .scroll-box {
    scrollbar-color: #565c6c transparent;
    scrollbar-width: thin;
    max-height: 208px;
    overflow: auto;

    .options {
      background-color: #1c1e23;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: start;
      font-size: 12px;
      padding: 0 10px;
      cursor: pointer;
      color: #677b96;

      &:hover {
        background-color: #202329;
      }

      .span-content {
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        flex: 1;
        display: flex;
        align-items: center;
        color: #677b96;
        font-size: 12px;

        .country-icon {
          margin-right: 5px;
          width: 18px;
          height: 18px;
          border-radius: 9999rem;
        }
      }
    }

    .options-active {
      color: #f0c059;
    }
  }
}
</style>
