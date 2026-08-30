<script setup lang="ts">
import { computed, ref } from "vue";
import { useWindowSize } from "@vant/use";
import { $t } from "@/locales";
import { showCustomToast } from "@/hooks/useCommon";
import { bus } from "@/utils/mitt";
import useAppStore from "@/store/modules/app";
import { requestPwaInstall } from "@/utils/pwa";
import {
  type DownloadConfig,
  type DownloadOption,
  getDownloadOptions
} from "@/utils/downloadConfig";

const handleShow = ref(false);
const installing = ref(false);
const installHint = ref("");
const app = useAppStore();
const { width: windowWidth } = useWindowSize();

const downloadConfig = computed<DownloadConfig | null>(() => app.appInfo?.downloadConfig || null);
const downloadOptions = computed(() => getDownloadOptions(downloadConfig.value));
const dialogWidth = computed(() => (
  windowWidth.value > 0 ? Math.min(345, Math.max(windowWidth.value - 30, 0)) : 345
));
const downloadLogo = computed(() => String(
  downloadConfig.value?.logo || app.appInfo?.logo || app.appInfo?.favicon || "/favicon.ico"
).trim());
const downloadDescription = computed(() => String(downloadConfig.value?.description || "").trim());

async function handlePwaInstall() {
  if (installing.value) return;

  installing.value = true;
  installHint.value = "";

  try {
    const result = await requestPwaInstall();

    if (result === "accepted") {
      showCustomToast({ type: "success", message: $t("已开始添加到桌面") });
      close();
      return;
    }

    if (result === "installed") {
      showCustomToast({ type: "success", message: $t("应用已添加到桌面") });
      close();
      return;
    }

    if (result === "ios-guide") {
      installHint.value = $t("请点击浏览器分享按钮，然后选择添加到主屏幕");
      return;
    }

    if (result === "browser-guide") {
      installHint.value = $t("请打开浏览器菜单，然后选择添加到主屏幕");
      return;
    }

    showCustomToast({ type: "warning", message: $t("已取消添加到桌面") });
  } finally {
    installing.value = false;
  }
}

async function handleDownload(option: DownloadOption) {
  if (option.type === "pwa") {
    await handlePwaInstall();
    return;
  }

  if (option.url) {
    window.location.href = option.url;
  }
}

function open() {
  if (!downloadOptions.value.length) return false;

  installHint.value = "";
  handleShow.value = true;
  return true;
}

function close() {
  handleShow.value = false;
}

function onClosed() {
  bus.emit("closed-popup");
}

defineExpose({
  open,
  close
});
</script>

<template>
  <van-dialog
    v-model:show="handleShow"
    class-name="download-dialog-popup"
    transition="van-dialog-bounce"
    :z-index="2001"
    :width="dialogWidth"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :close-on-click-overlay="false"
    @closed="onClosed"
  >
    <div class="download-dialog">
      <div class="download-dialog__main">
        <div class="download-dialog__content">
          <div class="download-dialog__info">
            <img :src="downloadLogo" alt="" />
            <div v-if="downloadDescription" class="download-dialog__title">
              <p>{{ downloadDescription }}</p>
            </div>
          </div>

          <div
            class="download-dialog__buttons"
            :class="{ 'download-dialog__buttons--single': downloadOptions.length === 1 }"
          >
            <button
              v-for="(option, optionIndex) in downloadOptions"
              :key="option.type"
              type="button"
              class="download-dialog__item"
              :class="{ 'download-dialog__item--ghost': optionIndex === 0 }"
              :disabled="option.type === 'pwa' && installing"
              @click="handleDownload(option)"
            >
              <span>
                {{ option.type === 'pwa' && installing ? $t("正在打开安装提示") : $t(option.label) }}
              </span>
              <span v-if="option.size && !(option.type === 'pwa' && installing)">
                ({{ option.size }})
              </span>
            </button>
          </div>

          <p v-if="installHint" class="download-dialog__hint">{{ installHint }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" role="button" :aria-label="$t('关闭')" @click="close">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
.download-dialog {
  width: 100%;
  max-height: 100vh;
  font-size: 8px;
  overflow-y: visible;
  background-color: transparent;
  transform-origin: center center;
}

.download-dialog__main {
  width: 100%;
  min-height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
  background: var(--skin__bg_2);
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 10px;
  backface-visibility: hidden;
}

.download-dialog__content {
  min-height: 46px;
  padding: 0 10px 10px;
  color: var(--skin__lead);
}

.download-dialog__info {
  padding-top: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.download-dialog__info img {
  width: 60px;
  height: 60px;
  flex: none;
  object-fit: contain;
}

.download-dialog__title {
  flex: 1;
  max-height: 250px;
  overflow: auto;
  color: var(--skin__lead);
  font-size: 15px;
  text-align: left;
}

.download-dialog__title p {
  margin: 0;
  line-height: 1.55;
  white-space: pre-line;
}

.download-dialog__buttons {
  width: 100%;
  margin-top: 5px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.download-dialog__buttons--single {
  grid-template-columns: 1fr;
}

.download-dialog__item {
  min-width: 0;
  height: 35px;
  margin-top: 15px;
  padding: 0 2.5px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 7px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--skin__text_primary);
  font-size: 11px;
  white-space: nowrap;
  background: var(--skin__primary);
  cursor: pointer;
  appearance: none;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  &--ghost {
    color: var(--skin__primary);
    background: transparent;
  }
}

.download-dialog__hint {
  margin-top: 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 18px;
  text-align: center;
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
}

.close-icon {
  color: #fff;
  font-size: 30px;
  cursor: pointer;
}

:global([dir="rtl"]) .download-dialog__title {
  text-align: right;
}
</style>
