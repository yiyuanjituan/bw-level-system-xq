<script setup lang="ts">
import { ref, watch } from "vue";

const activeId = ref<number>(4)

interface Props {
  list: any,
  id: any
}
const props = withDefaults(defineProps<Props>(), {
  list: () => ([]),
  id: 1
});
const emits = defineEmits(['change'])
watch(() => props.id, () => activeId.value = props.id)

function handleChange() {
  emits('change', activeId.value)
}

</script>

<template>
  <div class="scroll-tab-box">
    <van-tabs shrink v-model:active="activeId" @change="handleChange">
      <van-tab v-for="(item, index) in props.list" :name="item.id" :key="index">
        <template #title>
          <div class="w-[90px] h-[60px]">
            <div class="img-layout">
              <div class="checked-status" v-if="item.id == activeId">
                <div class="subscript">
                  <svg-icon name="comm_icon_gou" class-name="right-icon" />
                  <svg-icon name="comm_img_corner" class-name="border-icon" />
                </div>
              </div>
              <div class="nav-item-inner">
                <img :src="item.image" alt="" srcset="">
              </div>
            </div>
            <div class="active-name" dir="ltr">{{ item.title }}</div>
          </div>
        </template>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped lang="less">
.scroll-tab-box {
  --van-tabs-line-height: 60px;
  --van-tabs-nav-background: transparent;
  --van-tab-line-height: 10px;
  --van-tabs-bottom-bar-width: 0;
  --van-padding-xs: 5px;
  --van-tab-active-text-color: #DFBE5B;
  --van-tab-text-color: #656565;

  .img-layout {
    position: relative;
    padding: 2.5px;
    width: 94px;
    height: 45px;
    background-color: #191919;
    border-radius: 2.5px;
    box-shadow: 0 1.5px 3.5px 0 #0000001F;

    .checked-status {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      border: thin solid #DFBE5B;
      border-radius: 2.5px;
      overflow: hidden;
      .subscript {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 15px;
        height: 15px;
        overflow: hidden;
        line-height: 15px;
        display: block;
        .right-icon {
          position: absolute;
          right: 2px;
          bottom: 2px;
          width: 7px;
          height: 5px;
          color: #191919;
          z-index: 1;
        }
        .border-icon {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          border-bottom: 15px solid #DFBE5B;
          border-left: 15px solid transparent;
        }
      }
    }
    .nav-item-inner {
      position: relative;
      width: 89px;
      height: 40px;
      overflow: hidden;
      img {
        width: 89px;
        min-height: 100%;
      }
    }
  }

  .active-name {
    margin-top: 5px;
    font-size: 9px;
    text-align: center;
    unicode-bidi: plaintext;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>