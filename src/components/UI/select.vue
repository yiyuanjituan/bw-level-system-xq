<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { FORM_CONTEXT_KEY, FORM_ITEM_PROP_KEY } from "./form-context";

defineOptions({
  name: "ui-select"
});

interface SelectOption {
  id?: string | number;
  label?: string;
  icon?: string;
  [key: string]: any;
}

interface Props {
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffix_color?: string;
  options: SelectOption[];
  showEye?: boolean;
}

const modelValue = defineModel<string | number>({ default: "" });
const isFocus = ref(false);

const formContext = inject(FORM_CONTEXT_KEY, null);
const legacyProp = inject<any>("prop", "");
const itemProp = inject(FORM_ITEM_PROP_KEY, null);
const prop = computed(() => itemProp?.value || legacyProp || "");

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  placeholder: "请选择",
  prefix: "",
  suffix: "",
  suffix_color: "",
  options: () => [],
  showEye: false
});

const selectedOption = computed(() => {
  return props.options.find(option => option.id === modelValue.value);
});

const hasValue = computed(() => {
  return modelValue.value !== "" && modelValue.value !== null && modelValue.value !== undefined;
});

const hasError = computed(() => {
  const field = prop.value;
  if (!field)
    return false;
  return !!formContext?.errors.value?.[field];
});

function fieldHasRules() {
  const field = prop.value;
  return !!(field && formContext?.rules.value?.[field]);
}

function runValidation(trigger: string) {
  if (!fieldHasRules() || !prop.value)
    return;
  formContext?.validateField(prop.value, trigger).catch(() => {});
}

function togglePopover() {
  if (props.disabled)
    return;
  isFocus.value = !isFocus.value;
  if (!isFocus.value)
    runValidation("blur");
}

function handleBlur() {
  isFocus.value = false;
  runValidation("blur");
}

function handleSelect(option: SelectOption) {
  if (props.disabled)
    return;
  modelValue.value = option.id ?? "";
  isFocus.value = false;
  runValidation("change");
}
</script>

<template>
  <van-popover
    v-model:show="isFocus"
    :show-arrow="false"
    :offset="[0, 0]"
    style="width: 315px"
    placement="top"
    @update:show="(value) => { if (!value) handleBlur() }"
  >
    <template #reference>
      <div
        class="ui-select"
        :class="{
          'ui-select--focused': isFocus,
          'ui-select--disabled': disabled,
          'ui-select--invalid': hasError && !isFocus
        }"
        @click="togglePopover"
      >
        <span class="ui-select__prefix" v-if="$slots.prefix || prefix">
          <slot name="prefix" v-if="$slots.prefix" />
          <svg-icon
            v-else-if="prefix"
            :name="prefix"
            class-name="!w-[15px] !h-[15px]"
          />
        </span>

        <div class="ui-select__wrap">
          <span class="ui-select__required-star" v-if="required && !hasValue">*</span>

          <div class="ui-select__value">
            <span class="ui-select__placeholder" v-if="!selectedOption">{{ placeholder }}</span>
            <template v-else>
              <span class="ui-select__icon-wrap" v-if="selectedOption.icon">
                <img :src="selectedOption.icon" alt="." class="ui-select__icon" />
              </span>
              <span class="ui-select__label">{{ selectedOption.label }}</span>
            </template>
          </div>
        </div>

        <span class="ui-select__suffix" v-if="$slots.suffix || suffix || showEye">
          <slot name="suffix" v-if="$slots.suffix" />
          <svg-icon
            v-else-if="suffix"
            :name="suffix"
            class-name="!w-[15px] !h-[15px]"
            :style="{ color: suffix_color || 'unset' }"
          />
          <i v-else-if="showEye" class="icon inline-flex justify-center items-center text-[9px]">
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
        <div class="options" v-for="option in options" :key="option.id ?? option.label">
          <div class="span-content" @click="handleSelect(option)">
            <img :src="option.icon" alt="." class="country-icon" v-if="option.icon" />
            <span>{{ option.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </van-popover>
</template>

<style scoped lang="less">
.ui-select {
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
  transition: all 0.2s ease;
  box-sizing: border-box;

  &--focused {
    border-color: #f0c059;
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--invalid {
    border-color: #ea4e3d;
  }

  &__prefix {
    padding-right: 5px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__wrap {
    flex: 1 1 0;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
    min-width: 0;
  }

  &__required-star {
    display: block;
    color: #ea4e3d;
    width: 6px;
    height: 100%;
    flex-shrink: 0;
  }

  &__value {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    min-width: 0;
    padding-left: 2px;
  }

  &__placeholder {
    color: #525252;
  }

  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-right: 5px;
  }

  &__icon {
    width: 18px;
    height: 18px;
  }

  &__label {
    color: white;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 5px;
  }
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
      min-height: 40px;
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
  }
}
</style>
