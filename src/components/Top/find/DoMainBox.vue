<script setup lang="ts">
import { $t } from "@/locales";
import useAppStore from "@/store/modules/app";
import { showCustomToast } from "@/hooks/useCommon";
import useClipboard from "vue-clipboard3";
import { toPng } from "html-to-image";
import { ref } from "vue";

const app = useAppStore();
const { toClipboard } = useClipboard();
const saveImageRef = ref<HTMLElement | null>(null);
const captureIgnoreClassName = "capture-ignore";

interface Props {
  backUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  backUrl: "",
});

function copyFun(text: string) {
  toClipboard(text).then(() => {
    showCustomToast({ type: "success", message: $t("复制成功") });
  });
}

async function saveToImg() {
  if (!saveImageRef.value) {
    showCustomToast({ type: "fail", message: $t("保存图片失败，请稍后重试") });
    return;
  }

  try {
    const imageData = await toPng(saveImageRef.value, {
      filter: (domNode) => !domNode.classList?.contains(captureIgnoreClassName),
    });
    const num = Math.floor(100000 + Math.random() * 900000);
    const a = document.createElement("a");
    a.href = imageData;
    a.setAttribute("download", `${num}.png`);
    a.click();
  } catch {
    showCustomToast({ type: "fail", message: $t("保存图片失败，请稍后重试") });
  }
}
</script>

<template>
  <div class="mb-[10px]">
    <div class="domain-box" ref="saveImageRef">
      <div class="title-box">
        <img src="@/assets/common/comm_icon_zdwm_bcwz.avif" alt="" class="w-[20px] h-[20px]">
        <div class="text">保存网址</div>
        <span class="copy-action capture-ignore" @click="copyFun(`回家网址: ${props.backUrl}`)">
          <svg-icon name="comm_icon_copy" class-name="copy-icon" />
          <span class="copy-text">复制全部</span>
        </span>
      </div>
      <div class="body">
        <div class="editor-content" v-html="app.appInfo.official_website"></div>
      </div>
      <div class="link-box">
        <div class="link-item">
          <span class="label">回家网址</span>
          <span class="text">{{ props.backUrl }}</span>
          <span class="link-icon capture-ignore" @click="copyFun(props.backUrl)">
            <svg-icon name="comm_icon_copy" class-name="link-copy-icon" />
          </span>
        </div>
      </div>
      <div class="save-button-wrap capture-ignore">
        <x-button
          class="!w-[100%]"
          color="var(--skin__primary)"
          text-color="var(--skin__text_primary)"
          @click="saveToImg"
        >{{ $t("保存图片") }}</x-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.domain-box {
  background-color: var(--skin__bg_2);
  border-radius: 7px;
  padding: 0 10px 10px;
  box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);

  .title-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 40px;
    margin-bottom: 10px;
    border-bottom: thin solid var(--skin__border);
    gap: 8px;

    > img {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .text {
      min-width: 0;
      color: var(--skin__lead);
      font-size: 13px;
      font-weight: 700;
      flex-grow: 1;
    }

    .copy-action {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      color: var(--skin__primary);
      cursor: pointer;
    }

    .copy-text {
      max-width: 125px;
      padding-left: 5px;
      overflow: hidden;
      color: inherit;
      font-size: 11px;
      display: -webkit-box;
      text-overflow: ellipsis;
      vertical-align: middle;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    :deep(.copy-icon) {
      margin-bottom: 2px;
      color: inherit;
      font-size: 13px;
    }
  }

  .body {
    color: var(--skin__accent_1);

    .editor-content {
      font-size: 8px;
      line-height: 1.4;
      word-break: break-word;

      * {
        word-break: break-word;
        box-sizing: inherit;
        padding: 0;
        margin: 0;
      }
    }
  }

  .link-box {
    margin-top: 10px;

    .link-item {
      padding-bottom: 10px;
      color: var(--skin__primary);
      font-size: 11px;
      line-height: 15px;
      word-break: break-all;
      cursor: pointer;
      display: block;

      &:last-child {
        padding-bottom: 0;
      }
    }

    .label {
      margin-right: 3px;
      color: var(--skin__lead);
      display: inline-block;
      cursor: auto;
      white-space: nowrap;
    }

    .text {
      margin-right: 11px;
    }

    .link-icon {
      height: 15px;
      padding: 0 10px;
      display: inline-flex;
      align-items: center;
      vertical-align: bottom;
      position: relative;
    }

    :deep(.link-copy-icon) {
      color: var(--skin__primary);
      font-size: 11px;
    }
  }

  .save-button-wrap {
    height: 35px;
    margin-top: 10px;
  }

  :deep(.ui-button) {
    width: 100%;
    height: 35px;
    border-color: var(--skin__primary);
    border-radius: 7px;

    .ui-button__text {
      color: var(--skin__text_primary);
    }
  }
}

[dir="rtl"] .domain-box {
  .title-box {
    .copy-text {
      padding-right: 5px;
      padding-left: 0;
    }
  }

  .link-box {
    .label {
      margin-right: 0;
      margin-left: 3px;
    }

    .text {
      margin-right: 0;
      margin-left: 11px;
    }
  }
}
</style>
