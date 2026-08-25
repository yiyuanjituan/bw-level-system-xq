<script setup lang="ts">
import { $t } from "@/locales";
import { inject, ref, computed } from "vue";

defineOptions({
  name: "ui-common-select"
});

// 更通用的选项类型定义
export interface SelectOption<T = any> {
  id?: string | number;
  value: T;
  label: string;
  icon?: string;
  disabled?: boolean;
  [key: string]: any; // 允许其他自定义字段
}

interface Props {
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffix_color?: string;
  options: SelectOption[];
  // 自定义展示模板的插槽名称
  optionSlot?: string;
  // 自定义选中值展示模板的插槽名称
  selectedSlot?: string;
  // 值字段名（用于自定义选项结构）
  valueField?: string;
  // 标签字段名（用于自定义选项结构）
  labelField?: string;
  // 图标字段名（用于自定义选项结构）
  iconField?: string;
  // 是否可清除
  clearable?: boolean;
  // 弹出层位置
  placement?: 'top' | 'bottom' | 'left' | 'right';
  // 是否显示箭头
  showArrow?: boolean;
  // 空状态提示
  emptyText?: string;
  // 搜索功能
  searchable?: boolean;
  // 搜索占位符
  searchPlaceholder?: string;
}

const modelValue = defineModel({ type: [String, Number, Object], default: "" });

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  placeholder: $t("请选择"),
  prefix: "",
  suffix: "",
  suffix_color: "",
  options: () => [],
  optionSlot: "option",
  selectedSlot: "selected",
  valueField: "value",
  labelField: "label",
  iconField: "icon",
  clearable: false,
  placement: "bottom",
  showArrow: true,
  emptyText: "暂无数据",
  searchable: false,
  searchPlaceholder: "搜索..."
});

const emit = defineEmits<{
  (e: 'change', value: any): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

// 表单校验相关
const rules = inject("formRules");
const prop: any = inject("prop");
const validateField: any = inject("validateField");

const isFocus = ref(false);
const searchKeyword = ref('');

// 根据配置获取选项的值
const getOptionValue = (option: SelectOption) => {
  if (!option) return;
  return props.valueField === 'value' ? option.value : option[props.valueField];
};

// 根据配置获取选项的标签
const getOptionLabel = (option: SelectOption) => {
  return props.labelField === 'label' ? option.label : option[props.labelField];
};

// 根据配置获取选项的图标
const getOptionIcon = (option: SelectOption) => {
  if (!props.iconField) return null;
  return props.iconField === 'icon' ? option.icon : option[props.iconField];
};

// 当前选中的选项对象
const selectedOption = computed(() => {
  if (!modelValue.value) return null;

  // 如果modelValue本身就是选项对象
  if (typeof modelValue.value === 'object') {
    return modelValue.value;
  }

  // 否则按值查找
  return props.options.find(opt =>
    getOptionValue(opt) === modelValue.value
  ) || null;
});

// 显示文本
const displayText = computed(() => {
  if (!selectedOption.value) return '';
  return getOptionLabel(selectedOption.value);
});

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!props.searchable || !searchKeyword.value) return props.options;

  return props.options.filter(opt =>
    getOptionLabel(opt).toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

// 是否有选中值
const hasValue = computed(() => !!modelValue.value);

// 处理选中
const handleSelect = (option: SelectOption) => {
  if (option.disabled) return;

  const value = getOptionValue(option);
  modelValue.value = value;
  emit('change', value);
  isFocus.value = false;
  searchKeyword.value = '';

  // 触发表单校验
  if (prop && rules?.[prop]?.length) {
    validateField?.(prop);
  }
};

// 处理清除
const handleClear = (event: Event) => {
  event.stopPropagation();
  modelValue.value = '';
  emit('change', '');
  searchKeyword.value = '';

  if (prop && rules?.[prop]?.length) {
    validateField?.(prop);
  }
};

// 处理聚焦
const handleFocus = () => {
  if (props.disabled) return;
  isFocus.value = true;
  emit('focus');
};

// 处理失焦
const handleBlur = () => {
  // 延迟关闭，以便点击选项时能触发
  setTimeout(() => {
    if (!isFocus.value) return;
    isFocus.value = false;
    searchKeyword.value = '';
    emit('blur');

    if (prop && rules?.[prop]?.length) {
      validateField?.(prop);
    }
  }, 200);
};
</script>

<template>
  <van-popover
    v-model:show="isFocus"
    :show-arrow="false"
    :offset="[0, 4]"
    :placement="placement"
    trigger="manual"
    @click="handleFocus"
  >
    <template #reference>
      <div
        class="ui-select"
        :class="[
          { 'is-focus': isFocus, 'is-disabled': disabled, 'is-required': required }
        ]"
        @click.stop="handleFocus"
      >
        <!-- 前缀 -->
        <span class="ui-select__prefix" v-if="$slots.prefix || prefix">
          <slot name="prefix" v-if="$slots.prefix" />
          <svg-icon
            v-else-if="prefix"
            :name="prefix"
            class-name="!w-[15px] !h-[15px]"
          />
        </span>

        <!-- 输入区域 -->
        <div class="ui-select__wrap" @click.stop="isFocus = !isFocus">
          <span class="ui-select__required-star" v-if="required && !hasValue">*</span>

          <div class="ui-select__value">
            <!-- 自定义选中值展示 -->
            <slot
              v-if="$slots[selectedSlot] && selectedOption"
              :name="selectedSlot"
              :option="selectedOption"
            >
              <div class="ui-select__selected">
                <img
                  v-if="false && getOptionIcon(selectedOption)"
                  :src="getOptionIcon(selectedOption)"
                  class="ui-select__icon"
                  alt="."
                />
                <span>{{ displayText }}</span>
              </div>
            </slot>

            <!-- 默认展示 -->
            <template v-else-if="selectedOption">
              <div class="ui-select__selected">
                <img
                  v-if="false && getOptionIcon(selectedOption)"
                  :src="getOptionIcon(selectedOption)"
                  class="ui-select__icon"
                  alt="."
                />
                <span>{{ displayText }}</span>
              </div>
            </template>

            <!-- 占位符 -->
            <span v-else class="ui-select__placeholder">{{ placeholder }}</span>
          </div>
        </div>

        <!-- 后缀区域 -->
        <span class="ui-select__suffix" v-if="$slots.suffix || suffix">
          <slot name="suffix" v-if="$slots.suffix" />
          <svg-icon
            v-else-if="suffix"
            :name="suffix"
            class-name="!w-[15px] !h-[15px]"
            :style="{ color: suffix_color }"
          />
        </span>

        <!-- 清除按钮 -->
        <span class="ui-select__suffix ui-select__clear" v-if="clearable && hasValue && !disabled" @click="handleClear">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
            <path d="M4 4L10 10M4 10L10 4" stroke="currentColor" stroke-width="1"/>
          </svg>
        </span>

        <!-- 箭头 -->
        <span class="ui-select__suffix ui-select__arrow" v-if="showArrow && !$slots.suffix && !suffix" >
          <i class="icon inline-flex justify-center items-center text-[9px]">
            <svg width="1em" height="1em" fill="currentColor" class="transition-all duration-500" :class="[isFocus ? 'rotate-[90deg]' : 'rotate-[-90deg]']">
              <use xlink:href="#ui-arrow-418a3a"></use>
            </svg>
          </i>
        </span>
      </div>
    </template>

    <!-- 下拉选项 -->
    <div class="select-options" :class="{ 'searchable': searchable }">
      <!-- 搜索框 -->
      <div class="select-options__search" v-if="searchable">
        <input
          type="text"
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          class="select-options__search-input"
          @click.stop
        />
      </div>

      <!-- 选项列表 -->
      <div class="select-options__scroll">
        <template v-if="filteredOptions.length">
          <div
            v-for="option in filteredOptions"
            :key="getOptionValue(option)"
            class="select-options__item"
            :class="{
              'is-active': getOptionValue(option) === getOptionValue(selectedOption),
              'is-disabled': option.disabled
            }"
            @click.stop="handleSelect(option)"
          >
            <!-- 自定义选项展示 -->
            <slot
              v-if="$slots[optionSlot]"
              :name="optionSlot"
              :option="option"
              :isActive="getOptionValue(option) === getOptionValue(selectedOption)"
              :isDdisabled="option.disabled"
            >
              <div class="select-options__content">
                <img
                  v-if="getOptionIcon(option)"
                  :src="getOptionIcon(option)"
                  class="select-options__icon"
                  alt="."
                />
                <span>{{ getOptionLabel(option) }}</span>
              </div>
            </slot>

            <!-- 默认选项展示 -->
            <div v-else class="select-options__content">
              <img
                v-if="getOptionIcon(option)"
                :src="getOptionIcon(option)"
                class="select-options__icon"
                alt="."
              />
              <span>{{ getOptionLabel(option) }}</span>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="select-options__empty">
          {{ emptyText }}
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
  background-color: var(--skin__bg_2);
  color: #68707b;
  font-size: 11px;
  padding: 0 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: #565c6c;
  }

  &.is-focus {
    border-color: #f0c059;
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &.is-required:not(.has-value) {
    border-color: #ea4e3d;
  }

  &__prefix {
    padding-right: 5px;
    display: flex;
    align-items: center;
    height: 100%;
    color: currentColor;
  }

  &__wrap {
    flex: 1;
    height: 100%;
    line-height: 35px;
    display: flex;
    overflow: hidden;
  }

  &__required-star {
    color: #ea4e3d;
    width: 6px;
    height: 100%;
    display: block;
  }

  &__value {
    flex: 1;
    padding-left: 2px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__selected {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: white;
  }

  &__icon {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__placeholder {
    color: #9CA3AF !important;
  }

  &__suffix {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 5px;
    color: currentColor;
  }

  &__clear {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  &__arrow {
    transition: transform 0.2s;
  }
}

.select-options {
  width: 315px;
  max-height: 285px;
  background: var(--skin__bg_2);
  //border: 1px solid #565c6c;
  //border-radius: 7px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.searchable {
    padding-top: 0;
  }

  &__search {
    padding: 8px;
    border-bottom: 1px solid #313843;

    &-input {
      width: 100%;
      height: 32px;
      padding: 0 10px;
      background: #252830;
      border: 1px solid var(--skin__border);
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      outline: none;

      &:focus {
        border-color: #f0c059;
      }

      &::placeholder {
        color: #68707b;
      }
    }
  }

  &__scroll {
    max-height: 208px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #565c6c transparent;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #565c6c;
      border-radius: 2px;
    }
  }

  &__item {
    height: 40px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--skin__neutral_2);
    font-size: 11px;
    transition: background 0.2s;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover:not(.is-disabled) {
      background: var(--skin__bg_1);
    }

    &.is-active {
      color: white !important;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__empty {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #68707b;
    font-size: 12px;
  }
}
</style>