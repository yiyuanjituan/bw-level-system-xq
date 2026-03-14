<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useWindowSize } from "@vant/use";
import { getFindUsData } from "@/api/common";
import MailBox from "@/components/Top/find/MailBox.vue";

const show = ref(false);
const params = ref<any>({})
const remoteData = ref<any>({})
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}
const dialogWidth = computed(() => {
  if (typeof params.value != 'number' && isNaN(Number(params.value.width))) return params.value.width;
  return (Number(params.value?.width) ?? 343) / 375 * windowWidth.value;
})
defineExpose({
  open: openDialog
})

function init() {
  getFindUsData({}).then((data) => {
    remoteData.value = data;
  })
}

onMounted(() => init())
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth">
    <template #default>
      <div class="dialog-container">
        <div class="dialog-content">
          <div class="py-[10px]">
            <div class="title">
              <img src="@/assets/common/comm_icon_zdwm_title.avif" alt="" srcset="" class="w-[19px] h-[19px] mr-[9px]">
              <div>找到我们</div>
            </div>
            <div class="main-scroll-box">
              <div class="rich-text">
                <div class="flex items-start leading-[16px]">
                  <img src="@/assets/common/icon_rtf_gou.avif" class="w-[13px] h-[13px] mt-[1.5px] mr-[2px] flex-shrink-0" alt="">
                  <span class="text-[12px] font-bold">为了防止网站打不开，请保存我们的网址或邮箱，以免找不到回家路！</span>
                </div>
              </div>
              <div class="item-box-wrap">
                <DoMainBox :backUrl="remoteData.backUrl" />
                <MailBox />
              </div>
            </div>
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
div[role="dialog"] {
  .dialog-container {
    border: solid 1px #242424;
    background-color: #000;
    min-height: unset;
    width: 100%;
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .dialog-content {
      flex: 1;
      box-sizing: border-box;
      min-height: 46px;
      color: white;
      .title {
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        color: white;
      }
      .main-scroll-box {
        max-height: calc(var(--window-height) - 135px - 0px - 0px);
        padding-left: 10px;
        padding-right: 10px;
        overflow: auto;

        .rich-text {
          background-color: #191919;
          padding: 10px;
          display: flex;
          align-items: first baseline;
          border-radius: 7px;
          box-shadow: 0 1.5px 3.5px 0 #0000001F;
          color: white;
          margin-bottom: 10px;
        }
        .item-box-wrap {
          .domain-box {
            background-color: #191919;
            border-radius: 7px;
            padding: 0 10px 10px;
            margin-bottom: 10px;
            box-shadow: 0 1.5px 3.5px 0 #0000001F;
          }
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