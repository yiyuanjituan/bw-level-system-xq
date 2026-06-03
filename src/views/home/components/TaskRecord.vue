<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowSize } from "@vant/use";

const show = ref(false);
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}

defineExpose({
  open: openDialog
});

const dialogWidth = computed(() => (348 / 375) * windowWidth.value);
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth">
    <div class="task-record-container">
      <div class="header-box">
        <span class="header-title">活跃度记录</span>
      </div>
      <div class="content-box">
        <x-tabs shrink>
          <x-tab title="测试">测试委屈</x-tab>
          <x-tab title="测试">测121</x-tab>
          <x-tab title="测试">测12445</x-tab>
        </x-tabs>
      </div>
    </div>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" @click="handleClose">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
.task-record-container {
  border: var(--lobby__px) solid var(--skin__border);
  width: 100%;
  background: var(--skin__bg_2);
  border-radius: 10px;
  backface-visibility: hidden;
  overflow: auto;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .header-box {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    color: var(--skin__lead);
    padding: 10px 15px 15px;
    box-sizing: border-box;
    line-height: 1.5;
    .header-title {

    }
  }
  .content-box {
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    min-height: 46px;
    color: var(--skin__lead);
  }
}
.footer-box {
  position: relative;
  width: 100%;
  height: 45px;
  font-size: 8px;
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .close-icon {
    color: white;
    font-size: 30px;
  }
}
</style>
