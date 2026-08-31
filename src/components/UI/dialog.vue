<script setup lang="ts" name="ui-dialog">
import { $t } from "@/locales";
import { bus } from "@/utils/mitt";
import { useWindowSize } from "@vant/use";
import { setGlobalZIndex, useGlobalZIndex } from "vant";
import type { DialogOptions } from "vant";
import { computed, onMounted, onUnmounted, ref } from "vue";

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
  bgColor?: string;
}

export type ICustomDialogOptions = DialogOptions & IProps;

const MIN_DIALOG_Z_INDEX = 2003;
const LAYER_SELECTOR = ".van-overlay, .van-popup, [role='dialog']";

const show = ref(false);
const params = ref<ICustomDialogOptions>({});
const dialogKey = ref(0);
const dialogZIndex = ref(MIN_DIALOG_Z_INDEX);
const { width: windowWidth } = useWindowSize();

const dialogWidth = computed(() => {
  const width = params.value.width ?? 300;
  const numericWidth = Number(width);

  if (typeof width !== "number" && !Number.isFinite(numericWidth)) {
    return width;
  }

  return (numericWidth / 375) * windowWidth.value;
});

const showConfirmButton = computed(() => params.value.showConfirmButton !== false);

function getHighestVisibleLayerZIndex() {
  if (typeof window === "undefined") return MIN_DIALOG_Z_INDEX - 1;

  return Array.from(document.querySelectorAll<HTMLElement>(LAYER_SELECTOR)).reduce(
    (highestZIndex, element) => {
      const style = window.getComputedStyle(element);

      if (style.display === "none" || style.visibility === "hidden") {
        return highestZIndex;
      }

      const zIndex = Number(style.zIndex);
      return Number.isFinite(zIndex) ? Math.max(highestZIndex, zIndex) : highestZIndex;
    },
    MIN_DIALOG_Z_INDEX - 1
  );
}

function resolveDialogZIndex(options: ICustomDialogOptions) {
  const requestedZIndex = Number(options.zIndex);
  const validRequestedZIndex = Number.isFinite(requestedZIndex) ? requestedZIndex : 0;
  const nextZIndex = Math.max(
    MIN_DIALOG_Z_INDEX,
    useGlobalZIndex(),
    validRequestedZIndex,
    getHighestVisibleLayerZIndex() + 1
  );

  // 同步 Vant 的全局层级，确保后续打开的 Popup 仍能覆盖当前弹窗。
  setGlobalZIndex(nextZIndex);
  return nextZIndex;
}

function showDialog(options: ICustomDialogOptions) {
  params.value = { ...options };
  dialogZIndex.value = resolveDialogZIndex(options);
  dialogKey.value += 1;
  show.value = true;
}

function handleClose() {
  if (!show.value) return;

  show.value = false;
  params.value.onClose?.();
}

function handleConfirm() {
  if (!show.value) return;

  show.value = false;
  params.value.onConfirm?.();
}

function handleCancel() {
  if (!show.value) return;

  show.value = false;
  params.value.onCancel?.();
}

function handleShowUpdate(value: boolean) {
  if (value) {
    show.value = true;
    return;
  }

  handleClose();
}

onMounted(() => {
  bus.on("showDialog", showDialog);
});

onUnmounted(() => {
  bus.off("showDialog", showDialog);
});
</script>

<template>
  <van-dialog
    :key="dialogKey"
    :show="show"
    :width="dialogWidth"
    :z-index="dialogZIndex"
    :overlay="params.overlay !== false"
    :teleport="params.teleport ?? 'body'"
    :lock-scroll="params.lockScroll !== false"
    :before-close="params.beforeClose"
    :overlay-style="params.overlayStyle"
    :class-name="['custom-dialog', 'ui-dialog', params.className]"
    :overlay-class="['custom-dialog-overlay', params.overlayClass]"
    :close-on-click-overlay="params.closeOnClickOverlay === true"
    :close-on-popstate="params.closeOnPopstate !== false"
    :destroy-on-close="params.destroyOnClose"
    :keyboard-enabled="params.keyboardEnabled !== false"
    :show-confirm-button="false"
    :show-cancel-button="false"
    transition-appear
    @update:show="handleShowUpdate"
  >
    <div class="ui-dialog__main" :style="{ background: params.bgColor || undefined }">
      <div v-if="params.title" class="ui-dialog__header ui-dialog__header--info">
        <span
          class="ui-dialog__header--info ui-dialog__header--info--title"
          :style="{ color: params.titleColor || undefined }"
        >
          {{ params.title }}
        </span>
      </div>

      <div
        v-if="params.message"
        class="ui-dialog__content"
        :class="{ 'ui-dialog__content--isolated': !params.title }"
      >
        <div class="ui-dialog__message" :style="{ textAlign: params.messageAlign || 'center' }">
          <component v-if="typeof params.message === 'function'" :is="params.message" />
          <span v-else-if="params.allowHtml" v-html="String(params.message)" />
          <template v-else>{{ params.message }}</template>
        </div>
      </div>

      <div
        v-if="params.showCancelButton || showConfirmButton"
        class="van-hairline--top ui-dialog__footer"
      >
        <x-button
          v-if="params.showCancelButton"
          type="primary"
          class="ui-dialog__cancel"
          plain
          block
          :disabled="params.cancelButtonDisabled"
          @click="handleCancel"
        >
          {{ params.cancelButtonText || $t("取消") }}
        </x-button>
        <x-button
          v-if="showConfirmButton"
          type="primary"
          class="ui-dialog__confirm"
          block
          :disabled="params.confirmButtonDisabled"
          @click="handleConfirm"
        >
          {{ params.confirmButtonText || $t("确定") }}
        </x-button>
      </div>
    </div>

    <div
      v-if="params.showClose === true"
      class="ui-dialog-close-box ui-dialog-close-box--occupy-space"
    >
      <div>
        <button
          type="button"
          class="ui-dialog-close-box__button"
          :aria-label="$t('关闭')"
          @click="handleClose"
        >
          <svg-icon name="close" class-name="ui-dialog-close-box__icon" />
        </button>
      </div>
    </div>
  </van-dialog>
</template>

<style lang="less">
.custom-dialog-overlay.van-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.custom-dialog.ui-dialog.van-dialog {
  top: 50%;
  max-width: calc(100vw - 16px);
  max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  overflow: visible;
  font-size: 8px;
  background: transparent;
  border-radius: 0;
  transform-origin: center center;

  > .van-dialog__content {
    display: contents;
  }

  > .van-dialog__footer {
    display: none;
  }

  .ui-dialog__main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 150px;
    max-height: calc(100vh - 60px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    overflow: hidden;
    background: var(--skin__bg_2, #191919);
    border: var(--lobby__px, 0.5px) solid var(--skin__border, #242424);
    border-radius: 10px;
    backface-visibility: hidden;
  }

  .ui-dialog__header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 15px 15px;
    color: var(--skin__lead, #fff);
    font-size: 15px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: center;
    box-sizing: border-box;
  }

  .ui-dialog__header--info--title {
    color: var(--skin__lead, #fff);
  }

  .ui-dialog__content {
    display: flex;
    flex: 1;
    min-height: 46px;
    padding: 0 15px 10px;
    color: var(--skin__lead, #fff);
    box-sizing: border-box;
  }

  .ui-dialog__content--isolated {
    align-items: center;
    min-height: 52px;
    padding-top: 0;
  }

  .ui-dialog__message {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    color: var(--skin__lead, #fff);
    font-size: 11px;
    line-height: 1.64;
    letter-spacing: normal;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    -webkit-overflow-scrolling: touch;
  }

  .ui-dialog__footer {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    padding: 10px 15px 15px;
    overflow: hidden;
    user-select: none;
    box-sizing: border-box;
  }

  .ui-dialog__cancel,
  .ui-dialog__confirm {
    flex: 1;
    width: auto;
    height: 35px;
    border-radius: 7px;
    box-sizing: border-box;
  }

  .ui-dialog__confirm,
  .ui-dialog__confirm:active {
    background: var(--skin__primary);
  }

  .ui-dialog-close-box {
    position: relative;
    flex-shrink: 0;
    width: 100%;

    > div {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding-top: 15px;
    }
  }

  .ui-dialog-close-box--occupy-space > div {
    position: relative;
  }

  .ui-dialog-close-box__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 29px;
    height: 29px;
    padding: 0;
    color: #fff;
    line-height: 1;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .ui-dialog-close-box__icon {
    width: 29px;
    height: 29px;
    color: currentColor;
  }
}
</style>
