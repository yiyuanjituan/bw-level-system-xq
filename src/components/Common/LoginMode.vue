<script setup lang="ts">
import { ref, watch } from "vue";
import { loginProps } from "@/enums/props";
defineOptions({
  name: "login-mode",
})
const checked = ref<loginProps['type']>()
interface Props {
  modelValue: string
}

const emit = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});
function handleChange(e: loginProps['type']) {
  checked.value = e;
  emit('update:modelValue', checked.value)
}

watch(() => props.modelValue, (val: any) => {
  checked.value = val;
}, { immediate: true });

</script>

<template>
  <div class="switch-box">
    <van-radio-group v-model="checked" shape="square" direction="horizontal" @change="handleChange">
      <van-radio name="password" checked-color="#F0C059" style="color: #874404">
        <template #icon="props">
          <div class="check-icon" :class="{ 'is-checked': props.checked, '!text-[#68707B]': !props.checked }">
            <svg-icon name="password_register" class-name="check-icon-gou" />
          </div>
        </template>
        密码登录
      </van-radio>
      <van-radio name="sms" checked-color="#F0C059" style="color: #874404">
        <template #icon="props">
          <div class="check-icon" :class="{ 'is-checked': props.checked, '!text-[#68707B]': !props.checked }">
            <svg-icon name="sms_register" class-name="check-icon-sms" />
          </div>
        </template>
        验证码登录
      </van-radio>
    </van-radio-group>
  </div>
</template>

<style scoped lang="less">
.switch-box {
  --van-radio-border-color: #313843;
  --van-radio-size: 16px;
  --van-radio-label-margin: 5px;
  --van-radio-label-color: white;
  font-size: 9px;
  height: 15px;
  margin-bottom: 10px;
  padding-left: 22px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 8px;
    width: 10px;
    height: 13px;
    border-bottom: 1px solid #313843;
    border-left: 1px solid #313843;
  }

  .check-icon {
    border-radius: 999999px;
    width: 15px;
    height: 15px;
    box-sizing: border-box;
    border: 1px solid var(--van-radio-border-color);
    display: flex;
    align-items: center;
    justify-content: center;

    &.is-checked {
      border: 0 solid var(--van-radio-border-color);
      background-color: #f0c059;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .check-icon-gou {
      width: 15px;
      height: 15px;
    }
    .check-icon-sms {
      width: 13px;
      height: 13px;
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