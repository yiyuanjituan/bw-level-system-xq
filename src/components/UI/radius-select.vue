<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: 'ui-radius-select',
})

interface Props {
  placement?: any,
  popClass?: string,
  options?: any[],
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  popClass: '',
  options: () => ([]),
});

// 使用 defineModel 创建双向绑定的模型
const modelValue = defineModel<number>('modelValue', {
  default: 0,
  required: false
});

const emits = defineEmits(['change'])
const isShowPop = ref(false)

function handleClick(item: any, index: number) {
  modelValue.value = index
  emits("change", index);
  isShowPop.value = false // 点击后关闭弹窗（可选）
}
</script>

<template>
  <van-popover v-model:show="isShowPop" :placement="placement" :show-arrow="false" :offset="[0, 1]" :teleport="null" :class="popClass">
    <template #reference>
      <slot :isShow="isShowPop" :value="modelValue" :options="options" />
    </template>
    <div class="options-list">
      <div class="options">
        <div class="scroll-box">
          <div class="option" v-for="(item, index) in props.options" :class="{ 'check-option': modelValue == index }" @click="handleClick(item, index)">
            <div class="content">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </van-popover>
</template>

<style scoped lang="less">
.options-list {
  font-size: 12px;
  background: #191919;
  box-shadow: 0 1.5px 3.5px #0000001F;
  border-radius: 7px;
  overflow: hidden;
  .options {
    padding: 7.5px 1.5px;
    box-sizing: border-box;
    max-height: 285px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #191919;
    border: solid 1px #242424;
    box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
    border-radius: 7px;
    .scroll-box {
      overflow: auto;
      .option {
        &:active {
          background: #000000;
        }
        width: 100%;
        height: 40px;
        line-height: 40px;
        display: flex;
        align-items: center;
        justify-content: start;
        color: #656565;
        font-size: 12px;
        padding: 0 10px;
        cursor: pointer;
        .content {
          line-height: normal;
          max-width: 137.5px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex: 1;
        }
      }
      .check-option {
        color: #DFBE5B;
      }
    }
  }
}
</style>