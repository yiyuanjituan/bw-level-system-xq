<script setup lang="ts">
import XPopup from "./x-popup.vue";
import XButton from "./x-button.vue";

defineOptions({
  name: "x-dialog"
});

type DialogType = "info" | "success" | "warning" | "error" | "important";

interface Props {
  show?: boolean;
  title?: string;
  message?: string;
  type?: DialogType;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  closeOnClickOverlay?: boolean;
  showClose?: boolean;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: "",
  message: "",
  type: "info",
  showCancelButton: false,
  showConfirmButton: true,
  confirmButtonText: "确认",
  cancelButtonText: "取消",
  closeOnClickOverlay: false,
  showClose: false,
  width: "300px"
});

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "close"): void;
}>();

function close() {
  emit("update:show", false);
  emit("close");
}

function onConfirm() {
  emit("confirm");
  close();
}

function onCancel() {
  emit("cancel");
  close();
}
</script>

<template>
  <x-popup
    :show="show"
    position="center"
    :show-close="showClose"
    :close-on-click-overlay="closeOnClickOverlay"
    @update:show="value => emit('update:show', value)"
    @close="close"
  >
    <div class="x-dialog" :style="{ width }">
      <div class="x-dialog__main">
        <div v-if="title" class="x-dialog__header" :class="`x-dialog__header--${type}`">
          <span>{{ title }}</span>
        </div>

        <div class="x-dialog__content" :class="{ 'x-dialog__content--has-title': !!title }">
          <div class="x-dialog__message">{{ message }}</div>
        </div>

        <div v-if="showCancelButton || showConfirmButton" class="x-dialog__footer">
          <x-button v-if="showCancelButton" plain block @click="onCancel">
            {{ cancelButtonText }}
          </x-button>
          <x-button v-if="showConfirmButton" block @click="onConfirm">
            {{ confirmButtonText }}
          </x-button>
        </div>
      </div>
    </div>
  </x-popup>
</template>

<style scoped lang="less">
.x-dialog {
  font-size: 8px;
  transform-origin: center center;
  background-color: transparent;
  overflow-y: visible;
  max-height: 100vh;

  &__main {
    width: 100%;
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: var(--lobby__px) solid var(--skin__border);
  }

  &__header {
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

  &__header--important,
  &__header--error {
    color: var(--skin__accent_2);
  }

  &__content {
    flex: 1;
    padding: 0 15px 10px;
    box-sizing: border-box;
    min-height: 46px;
    color: var(--skin__lead);
  }

  &__content--has-title {
    padding-top: 4px;
  }

  &__message {
    color: var(--skin__lead);
    flex: 1;
    overflow-y: auto;
    font-size: 11px;
    line-height: 1.64;
    white-space: pre-wrap;
    text-align: center;
    word-wrap: break-word;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    overflow: hidden;
    user-select: none;
    padding: 10px 15px 15px;
    box-sizing: border-box;
    gap: 10px;
  }

  :deep(.x-button) {
    flex: 1;
    height: 35px;
    border-radius: 7px;
    box-sizing: border-box;
    width: auto;
  }
}
</style>

