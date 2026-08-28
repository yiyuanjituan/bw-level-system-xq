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
      <span>{{ $t("密码注册") }}</span>
    </div>
    <div class="item" @click="handleChange">
      <span class="svg-border"><svg-icon name="sms_register" class-name="!w-[15px] !h-[15px]" /></span>
      <span>{{ $t("验证码注册") }}</span>
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
    color: var(--skin__lead);
    .svg-border {
      margin-right: 4px;
      color: var(--skin__neutral_2);
      font-size: 15px;
      background: var(--skin__bg_2);
      border-radius: 9999rem;
      border: solid 1px var(--skin__border);
    }
  }
  .active {
    color: var(--skin__primary);
    .svg-border {
      color: var(--skin__text_primary);
      background-color: var(--skin__primary);
      border: 0 none;
    }
  }
}
</style>
