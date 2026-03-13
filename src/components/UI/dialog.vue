<script setup lang="ts" name="ui-dialog">
import { computed, onMounted, ref } from "vue";
import { bus } from "@/utils/mitt";
import { closeDialog, DialogOptions } from "vant";
import UiButton from "@/components/Common/Button.vue";
import { useWindowSize } from '@vant/use';

defineOptions({
  name: "ui-dialog"
});

export interface IProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  titleColor?: string;
  width?: number | string;
  showClose?: boolean;
}

export type ICustomDialogOptions = DialogOptions & IProps

const show = ref(false);
const params = ref<ICustomDialogOptions>({});
const { width: windowWidth } = useWindowSize();
const dialogWidth = computed(() => {
  if (typeof params.value != 'number' && isNaN(Number(params.value.width))) return params.value.width;
  return (Number(params.value?.width) ?? 320) / 375 * windowWidth.value;
})

function showDialog(options: ICustomDialogOptions) {
  show.value = true;
  params.value = options;
}

function handleClose() {
  show.value = false;
  params.value.onCancel?.();
}

const handleConfirm = () => {
  show.value = false;
  params.value.onConfirm?.();
};

const handleCancel = () => {
  show.value = false;
  params.value.onCancel?.();
};

onMounted(() => {
  bus.on("showDialog", showDialog);
});
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="params.showCancelButton" :width="dialogWidth">
    <template #default>
      <div class="dialog-container">
        <div class="dialog-content">
          <div class="title" v-if="params.title" :style="{ '--title-color': params.titleColor ?? 'white' }">{{ params.title }}</div>
          <div class="message" v-if="params.message">{{ params.message }}</div>
          <div class="btn-list pt-[20px] pb-[5px] flex">
            <ui-button @click="handleClose" v-if="params.showCancelButton" plain>{{ params?.cancelButtonText || '取消' }}</ui-button>
            <ui-button class="!mr-[0px]" @click="handleConfirm">{{ params?.confirmButtonText }}</ui-button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="footer-box" v-if="params.showClose === false">
        <div class="close-icon" @click="handleClose">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
div[role="dialog"] {
  .dialog-container {
    width: 100%;
    border: solid 1px #313843;
    background: #1c1e23;
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .dialog-content {
      flex: 1;
      padding: 0 15px 10px;
      box-sizing: border-box;
      min-height: 46px;
      color: white;
      .title {
        font-weight: 400;
        font-size: 15px;
        padding: 10px 0 15px;
        text-align: center;
        color: var(--title-color);
      }
      .message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: left;
        font-size: 12px;
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