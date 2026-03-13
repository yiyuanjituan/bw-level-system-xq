<script setup lang="ts">
import { useAttrs } from "vue";

const attrs = useAttrs()
defineOptions({
  name: 'ui-popup',
})

// @ts-ignore
const onClose = () => attrs['onUpdate:show'](false)
</script>

<template>
  <div class="ui-popup">
    <van-popup v-bind="$attrs" :close-on-click-overlay="!!(attrs.clickOverlay) || false">
      <div class="ui-dialog__main">
        <slot />
      </div>
      <div class="ui-dialog__close-btn" @click="onClose">
        <svg-icon name="close" />
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.ui-popup {
  :deep(.van-popup--center) {
    --van-popup-background: transparent;

    max-height: calc(100dvh - 55px);
    max-width: calc(100vw - 16px);
    width: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .ui-dialog {
    &__main {
      flex: 1;
      height: 100%;
      border: 1px solid #313843;
      width: 100%;
      background: #1C1E23;
      border-radius: 10px;
      backface-visibility: hidden;
      overflow: auto;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    &__close-btn {
      color: white;
      font-size: 30px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 15px;
    }
  }
}
</style>