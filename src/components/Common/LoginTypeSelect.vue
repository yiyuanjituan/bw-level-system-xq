<script setup lang="ts">
import { ref, watch } from "vue";
import { loginProps } from "@/enums/props";
defineOptions({
  name: "login-type-select",
})
const checked = ref<loginProps['accountType']>()
interface Props {
  modelValue: string
}

const emit = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});
function handleChange(e: loginProps['accountType']) {
  checked.value = e;
  emit('update:modelValue', checked.value)
}

watch(() => props.modelValue, (val: any) => {
  checked.value = val;
}, { immediate: true });

</script>

<template>
  <div class="radio-box">
    <van-radio-group v-model="checked" shape="square" direction="horizontal" @change="handleChange">
      <van-radio name="phone" checked-color="#F0C059" style="color: #874404">
        <template #icon="props">
          <div class="check-icon" :class="{ 'is-checked': props.checked }">
            <svg-icon name="comm_icon_gou" v-if="props.checked" class-name="check-icon-gou" />
          </div>
        </template>
        这是手机号码
      </van-radio>
      <van-radio name="account" checked-color="#F0C059" style="color: #874404">
        <template #icon="props">
          <div class="check-icon" :class="{ 'is-checked': props.checked }">
            <svg-icon name="comm_icon_gou" v-if="props.checked" class-name="check-icon-gou" />
          </div>
        </template>
        这是账号
      </van-radio>
    </van-radio-group>
  </div>
</template>

<style scoped lang="less">
.radio-box {
  --van-radio-border-color: #313843;
  --van-radio-size: 16px;
  --van-radio-label-margin: 5px;
  --van-radio-label-color: white;
  font-size: 11px;
  height: 26px;

  .check-icon {
    border-radius: 3px;
    width: 16px;
    height: 16px;
    border: 1px solid var(--van-radio-border-color);
    &.is-checked {
      border: 0 solid var(--van-radio-border-color);
      background-color: #f0c059;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .check-icon-gou {
      width: 12px;
      height: 12px;
      color: #874404 !important;
    }
  }
  :deep(.van-radio) {
    flex: 1;
  }

  :deep(div[aria-checked="true"]) {
    .van-radio__label {
      color: #F0C059 !important;
    }
  }
}
</style>