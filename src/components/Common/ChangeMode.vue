<script setup lang="ts">
const emit = defineEmits(['change'])
const handleChange = () => {
  emit('change')
}
</script>

<template>
  <div class="list">
    <div class="item mr-[10px] active">
      <span class="svg-border"><svg-icon name="password_register" class-name="!w-[15px] !h-[15px]" /></span>
      <span>密码注册</span>
    </div>
    <div class="item" @click="handleChange">
      <span class="svg-border"><svg-icon name="sms_register" class-name="!w-[15px] !h-[15px]" /></span>
      <span>验证码注册</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.list {
  display: flex;
  align-items: flex-start;
  min-height: 13px;
  margin-bottom: 10px;
  color: white;
  font-size: 11px;
  .item {
    display: flex;
    font-size: 11px;
    flex: 1;
    .svg-border {
      margin-right: 4px;
      color: #68707B;
      font-size: 15px;
      background: #1C1E23;
      border-radius: 9999rem;
      border: solid 1px #313843;
    }
  }
  .active {
    color: #F0C059;
    .svg-border {
      color: #874404;
      background: #F0C059;
    }
  }
}
</style>
