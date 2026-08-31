<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useWindowSize } from "@vant/use";
import { getFindUsData } from "@/api/common";
import MailBox from "@/components/Top/find/MailBox.vue";
import { bus } from "@/utils/mitt";

const show = ref(false);
const params = ref<any>({});
const remoteData = ref<any>({});
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}
const dialogWidth = computed(() => {
  const viewportWidth = windowWidth.value || 375;
  const configuredWidth = Number(params.value?.width);
  const preferredWidth = Number.isFinite(configuredWidth) && configuredWidth > 0 ? configuredWidth : 345;
  return `${Math.min(preferredWidth, Math.max(viewportWidth - 30, 280))}px`;
});
defineExpose({
  open: openDialog
});

function init() {
  getFindUsData({}).then(data => {
    remoteData.value = data;
  });
}

onMounted(() => init());

watch(show, (value, oldValue) => {
  if (!value && oldValue) {
    bus.emit("closed-popup");
  }
});
</script>

<template>
  <van-dialog
    v-model:show="show"
    class-name="find-us-dialog"
    overlay-class="find-us-overlay"
    :show-cancel-button="false"
    :show-confirm-button="false"
    :close-on-click-overlay="false"
    :width="dialogWidth"
  >
    <template #default>
      <div class="dialog-container">
        <div class="dialog-content">
          <div class="content-box">
            <div class="title">
              <img
                src="@/assets/common/comm_icon_zdwm_title.avif"
                alt=""
                class="title-icon"
              />
              <div>{{ $t("找到我们") }}</div>
            </div>
            <div class="main-scroll-box">
              <div class="rich-text">
                <div class="tip-row">
                  <img
                    src="@/assets/common/icon_rtf_gou.avif"
                    class="tip-icon"
                    alt=""
                  />
                  <span class="tip-text">
                    {{ $t("为了防止网站打不开，请保存我们的网址或邮箱，以免找不到回家路！") }}
                  </span>
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

<style lang="less">
.find-us-overlay {
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(5px);
}

.find-us-dialog {
  max-width: calc(100vw - 30px);
  overflow: visible !important;
  border-radius: 0;
  background: transparent !important;
}

.find-us-dialog .van-dialog__content {
  padding: 0;
  overflow: visible;
}

.find-us-dialog .van-dialog__footer {
  padding: 0;
  background: transparent;
}

.find-us-dialog .dialog-container {
  width: 100%;
  min-height: 150px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 10px;
  background: var(--skin__bg_1);
  backface-visibility: hidden;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.find-us-dialog .dialog-content {
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  min-height: 46px;
  color: var(--skin__lead);
}

.find-us-dialog .content-box {
  padding: 10px 0;
}

.find-us-dialog .title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: var(--skin__lead);
  font-size: 13px;
}

.find-us-dialog .title-icon {
  width: 19px;
  height: 19px;
  margin-right: 9px;
  flex-shrink: 0;
}

.find-us-dialog .main-scroll-box {
  max-height: calc(var(--window-height, 667px) - 135px);
  padding: 0 10px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.find-us-dialog .rich-text {
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  align-items: first baseline;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
  color: var(--skin__lead);
}

.find-us-dialog .tip-row {
  display: flex;
  min-width: 0;
  align-items: first baseline;
  line-height: 16px;
}

.find-us-dialog .tip-icon {
  width: 13px;
  height: 13px;
  margin-top: 1.5px;
  margin-right: 2px;
  flex-shrink: 0;
}

.find-us-dialog .tip-text {
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  word-break: break-word;
}

.find-us-dialog .item-box-wrap > div:last-child {
  margin-bottom: 0;
}

.find-us-dialog .footer-box {
  position: relative;
  width: 100%;
  height: 45px;
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.find-us-dialog .close-icon {
  color: #fff;
  font-size: 30px;
  cursor: pointer;
}

[dir="rtl"] .find-us-dialog .title-icon {
  margin-right: 0;
  margin-left: 9px;
}
</style>
