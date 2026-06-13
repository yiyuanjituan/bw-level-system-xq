<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const { width: windowWidth } = useWindowSize();
const show = ref(false);
const dialogWidth = computed(() => (345 / 375) * windowWidth.value);
const title = ref("");
const message = ref("");

function openDialog(params) {
  show.value = true;
  title.value = params.title;
  message.value = params.content;
}

function handleClose() {
  show.value = false;
}

defineExpose({
  open: openDialog
});
</script>

<template>
  <div class="dialog-box">
    <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" destroy-on-close>
      <div class="main-content-box">
        <x-tabs shrink type="card">
          <x-tab title="测噶山豆根"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
          <x-tab title="测噶山"></x-tab>
        </x-tabs>
      </div>

      <template #footer>
        <div class="footer-box">
          <div class="close-icon" @click="handleClose">
            <svg-icon name="close" color="white" />
          </div>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.dialog-box {
  --van-padding-md: 0px;
}

.main-content-box {
  width: 100%;
  height: 303px;
  font-size: 8px;
  display: flex;
  flex-direction: column-reverse;
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
