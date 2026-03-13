<script setup lang="ts" name="home-drawer">
import { ref } from "vue";

defineOptions({ name: "home-drawer" });

export type IProps = {
  showDownLoad: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  showDownLoad: false,
});
const emit = defineEmits(['close'])
const showLeft = ref(false);
const open = () => showLeft.value = true
const close = () => showLeft.value = false
const handleClose = () => {
  emit("close")
}

defineExpose({
  open: open,
  close: close
})
</script>

<template>
  <van-popup
    v-model:show="showLeft"
    position="left"
    :style="{ height: '100%' }"
    teleport="body"
    @close="handleClose"
    :overlay-class="{ 'drawer-box': true, 'drawer-box-no-download': !showDownLoad }"
    :class="{ 'drawer-body-box': true, 'drawer-body-box-no-download': !showDownLoad }"
  >
    <div class="body-container">
      <div class="search-box">
        <span class="text">搜索游戏</span>
        <svg-icon name="comm_icon_ss" class="text-[11px] text-[#ADB6C3] mr-[9px]" />
      </div>

      <div class="colos text-white" v-for="i in 100">萨队</div>
      <div class="colos text-white">萨队</div>
      <div class="colos text-white">萨队</div>
      <div class="colos text-white">萨队</div>
    </div>
  </van-popup>
</template>

<style scoped lang="less">
.drawer-box {
  --van-overlay-background: rgba(0, 0, 0, 0.5);
  transition: all .3s;
  margin-top: 75px;
}
.drawer-box-no-download {
  margin-top: 45px;
}

.drawer-body-box {
  transition: all .3s;
  margin-top: 75px;
  width: 150px;
  background: #1C1E23;
  --skin__bs_zc_an1: #22242A;

  .body-container {
    margin-top: 5px;
    overflow: auto;
    padding-bottom: 100px;
    height: 100%;

    .search-box {
      display: flex;
      align-items: center;
      margin: 0 7.5px 5px;
      height: 25px;
      overflow: hidden;
      background-color: var(--skin__bs_zc_an1);
      border-radius: 7px;
      .text {
        flex: 1;
        margin-left: 9px;
        color: #68707B;
        font-size: 11px;
      }
    }
  }
}
.drawer-body-box-no-download {
  margin-top: 45px;
}
</style>