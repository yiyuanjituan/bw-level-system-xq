<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWindowSize } from '@vant/use';

const show = ref(false);
const params = ref<any>({});
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}

const dialogWidth = computed(() => {
  return ((Number(params.value?.width) ?? 355) / 375) * windowWidth.value;
});

defineExpose({
  open: openDialog
});
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth">
    <template #default>
      <div class="dialog-container">
        <div class="header-box"><span>存款记录</span></div>
        <div class="content-box">
          <div class="content-header">
            <div class="time-picker">
              <account-time-filter />
            </div>
            <div class="status-picker"></div>
          </div>
        </div>
      </div>
    </template>

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
div[role='dialog'] {
  .dialog-container {
    border: var(--lobby__px) solid var(--skin__border);
    width: 100%;
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    }
    .content-box {
      padding: 0 0 10px;
      flex: 1;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .content-header {
        padding: 0 10px 10px;
        line-height: 25px;
        display: flex;
        align-items: center;
        .time-picker {
          height: 25px;
        }
        .status-picker {

        }
      }
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
}
</style>
