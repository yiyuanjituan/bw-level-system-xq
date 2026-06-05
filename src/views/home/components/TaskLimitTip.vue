<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const { width: windowWidth } = useWindowSize();
const show = ref(false);
const dialogWidth = computed(() => (300 / 375) * windowWidth.value);
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
      <div class="task-record-container">
        <div class="header-box">
          <span class="header-title">{{ title }}</span>
        </div>
        <div class="content-box">
          <div class="message">{{ message }}</div>
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
  </div>
</template>

<style scoped lang="less">
.dialog-box {
  --van-padding-md: 0px;
}

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
    color: var(--skin__lead);
    padding: 10px 15px 15px;
    box-sizing: border-box;
    line-height: 1.5;
  }

  .content-box {
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    min-height: 46px;
    color: var(--skin__lead);
    padding-left: 15px;
    padding-right: 15px;
    .message {
      color: var(--skin__lead);
      flex: 1;
      overflow-y: auto;
      font-size: 11px;
      line-height: 1.64;
      letter-spacing: normal;
      white-space: pre-wrap;
      text-align: center;
      word-wrap: break-word;
    }
  }
}

.empty-state {
  &__text {
    color: var(--skin__neutral_2, var(--skin__lead));
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  &__link {
    color: var(--skin__primary);
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
