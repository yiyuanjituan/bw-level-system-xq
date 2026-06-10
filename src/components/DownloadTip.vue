<script setup lang="ts">
import { ref } from 'vue';
import { showCustomToast } from '@/hooks/useCommon';
import { bus } from '@/utils/mitt';
import useAppStore from '@/store/modules/app';

const handleShow = ref(false);
const app = useAppStore();

function handleAddTask() {
  showCustomToast({ type: 'success', message: '敬请期待' });
}

function open() {
  handleShow.value = true;
}

function close() {
  handleShow.value = false;
  onClosed();
}

function onClosed() {
  setTimeout(() => {
    bus.emit('findUs');
  }, 400);
}

defineExpose({
  open,
  close
});
</script>

<template>
  <x-popup position="bottom" v-model:show="handleShow" :z-index="100" @close="onClosed">
    <div class="down-box">
      <div class="close-icon" @click="close">
        <svg-icon name="comm_icon_x" />
      </div>
      <div class="info">
        <img :src="app.appInfo.logo" alt="" />
        <div class="title">
          <div class="">
            <p><strong>下载APP，可参与领取更多优惠！</strong></p>
          </div>
        </div>
      </div>
      <div class="btn-list">
        <x-button type="primary" plain class="!w-[100%]" @click="handleAddTask">添加桌面快捷方式</x-button>
      </div>
    </div>
  </x-popup>
</template>

<style scoped lang="less">
.down-box {
  background: var(--skin__bg_2);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 15px 15px calc(15px + env(safe-area-inset-bottom));
  position: relative;

  .close-icon {
    position: absolute;
    padding: 15px;
    top: 0;
    right: 0;
    font-size: 12px;
    color: var(--skin__neutral_1);
  }

  .info {
    padding-top: 15px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    img {
      width: 60px;
      height: 60px;
      border-radius: 6px;
    }
    .title {
      flex: 1;
      color: var(--skin__lead);
      font-size: 15px;
      text-align: left;
      max-height: 250px;
      overflow: auto;
    }
  }
  .btn-list {
    display: flex;
    justify-content: end;
    text-align: right;
    align-items: flex-end;
    margin-top: 10px;
    gap: 15px;
  }
}
</style>
