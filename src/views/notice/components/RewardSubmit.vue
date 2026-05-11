<script setup lang="ts">
import { ref } from "vue";

const isLoading = ref(false)
function handleSubmit() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000)
}
</script>

<template>
  <div class="reward-submit-container">
    <div class="flex-1">1212</div>
    <div class="footer-bottom">
      <x-button type="primary" size="normal" class="!w-[100%]" :loading="isLoading" @click="handleSubmit">提交反馈</x-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.reward-submit-container {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  .footer-bottom {
    height: 65px;
    margin: 0 -10px;
    padding: 10px 10px 20px;
    font-size: 12px;
    background-color: var(--skin__bg_2);
    box-shadow: 0 -1.5px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>
