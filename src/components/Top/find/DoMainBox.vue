<script setup lang="ts">
import useAppStore from "@/store/modules/app";
import UiButton from "@/components/Common/Button.vue";
import { showCustomToast } from "@/hooks/useCommon";
import useClipboard from 'vue-clipboard3'
import { toPng } from 'html-to-image'
import { ref } from "vue";

const app = useAppStore()
const { toClipboard } = useClipboard()
const saveImageRef = ref()
const showBtn = ref(true)

interface Props {
  backUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  backUrl: ""
});

function copyFun(text: string) {
  toClipboard(text).then(() => {
    showCustomToast({ type: "success", message: "复制成功" });
  })
}

function saveToImg() {
  showBtn.value = false
  toPng(saveImageRef.value).then((imageData) => {
    showBtn.value = true
    const num = Math.floor(100000 + Math.random() * 900000)
    // 这里就按照chrome等新版浏览器来处理
    const a = document.createElement('a')
    a.href = imageData
    a.setAttribute('download', `${num}.png`)
    a.click()
  })
}

</script>

<template>
  <div class="mb-[10px]">
    <div class="domain-box" ref="saveImageRef">
      <div class="title-box">
        <img src="@/assets/common/comm_icon_zdwm_bcwz.avif" alt="" class="w-[20px] h-[20px]">
        <div class="text">保存网址</div>
        <span class="flex items-center">
          <template v-if="showBtn">
            <svg-icon name="comm_icon_copy" class-name="text-[13px] text-[#DFBE5B] mb-[2px]" />
            <span class="copy-text text-[#DFBE5B]" @click="copyFun(`回家网址: ${props.backUrl}`)">复制全部</span>
          </template>
      </span>
      </div>
      <div class="body">
        <div class="editor-content" v-html="app.appInfo.official_website"></div>
      </div>
      <div class="link-box">
        <div class="label">回家网址</div>{{ props.backUrl }}
        <template v-if="showBtn">
          <svg-icon name="comm_icon_copy" class-name="text-[11px] text-[#DFBE5B] mx-[10px] mb-[2px]" @click="copyFun(props.backUrl)" />
        </template>
      </div>
      <div class="h-[35px]">
        <ui-button class="mt-[10px]" @click="saveToImg" v-show="showBtn">保存图片</ui-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.domain-box {
  background-color: #191919;
  border-radius: 7px;
  padding: 0 10px 10px;
  box-shadow: 0 1.5px 3.5px 0 #0000001F;
  height: 203px;

  .title-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 40px;
    margin-bottom: 10px;
    border-bottom: thin solid #242424;
    gap: 8px;
    .text {
      font-size: 13px;
      font-weight: 700;
      flex-grow: 1;
    }
    .copy-text {
      font-size: 11px;
      padding-left: 5px;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      max-width: 125px;
    }
  }
  .body {
    color: #1FE11F;
    .editor-content {
      font-size: 8px;
      * {
        word-break: break-word;

        box-sizing: inherit;
        padding: 0;
        margin: 0;
      }
    }
  }
  .link-box {
    font-size: 11px;
    line-height: 15px;
    color: #DFBE5B;
    word-break: break-all;
    cursor: pointer;
    display: block;
    margin-top: 10px;
    display: flex;
    align-items: center;

    .label {
      margin-right: 3px;
      color: white;
      display: inline-block;
      cursor: auto;
      white-space: nowrap;
    }
  }

  :deep(.ui-button) {
    .ui-button__text {
      color: white;
    }
  }
}
</style>