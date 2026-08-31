<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useWindowSize } from "@vant/use";
import { service } from "@/api/service";
import { $t } from "@/locales";
import { bus } from "@/utils/mitt";
import UiCheckbox from "@/components/UI/checkbox.vue";

defineOptions({
  name: "DialogTip"
});

interface PopupNoticeItem {
  id?: number | string;
  title?: string;
  showMode?: number | string;
  image?: string;
  content?: string;
  layout?: number | string;
  layoutType?: number | string;
  style?: number | string;
}

type PopupLayout = "side" | "bottom";

interface DialogOpenParams {
  layout?: PopupLayout | number | string;
}

const SUPPRESS_KEY = "home-popup-notice-suppress-date";
const { width: windowWidth } = useWindowSize();
const show = ref(false);
const listData = ref<PopupNoticeItem[]>([]);
const activeTab = ref(0);
const suppressToday = ref(false);
const popupLayout = ref<PopupLayout>("side");

const dialogWidth = computed(() => {
  const viewportWidth = windowWidth.value || 375;
  return `${Math.min(345, Math.max(viewportWidth - 30, 280))}px`;
});
const showLeftPageArrow = computed(() => activeTab.value > 0);
const showRightPageArrow = computed(() => activeTab.value < listData.value.length - 1);

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${date}`;
}

function isSuppressedToday() {
  try {
    return window.localStorage.getItem(SUPPRESS_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

function saveSuppressPreference() {
  if (!suppressToday.value) return;

  try {
    window.localStorage.setItem(SUPPRESS_KEY, getTodayKey());
  } catch {
    // 隐私模式或禁用存储时不影响弹窗关闭。
  }
}

function isImageNotice(item: PopupNoticeItem) {
  return Number(item.showMode) === 0;
}

function normalizeLayout(value: DialogOpenParams["layout"]): PopupLayout {
  return value === "bottom" || Number(value) === 3 ? "bottom" : "side";
}

function resolveLayout(params: DialogOpenParams) {
  const configuredLayout =
    params.layout ?? listData.value[0]?.layout ?? listData.value[0]?.layoutType ?? listData.value[0]?.style;
  return normalizeLayout(configuredLayout);
}

function open(params: DialogOpenParams = {}) {
  if (!listData.value.length || isSuppressedToday()) return false;

  activeTab.value = 0;
  suppressToday.value = false;
  popupLayout.value = resolveLayout(params);
  show.value = true;
  return true;
}

function close() {
  saveSuppressPreference();
  show.value = false;
}

function changePage(step: -1 | 1) {
  const nextIndex = activeTab.value + step;
  if (nextIndex < 0 || nextIndex >= listData.value.length) return;
  activeTab.value = nextIndex;
}

async function loadNotices() {
  try {
    const response = await service.open.site.base.popup();
    listData.value = Array.isArray(response) ? response : [];
  } catch {
    listData.value = [];
  }
}

onMounted(() => {
  void loadNotices();
});

watch(listData, value => {
  if (!value.length || activeTab.value >= value.length) {
    activeTab.value = 0;
  }
});

watch(show, (value, oldValue) => {
  if (!value && oldValue) {
    bus.emit("closed-popup");
  }
});

defineExpose({ open });
</script>

<template>
  <van-dialog
    v-model:show="show"
    class-name="message-popup-dialog"
    overlay-class="message-popup-overlay"
    :width="dialogWidth"
    :show-cancel-button="false"
    :show-confirm-button="false"
    :close-on-click-overlay="false"
    destroy-on-close
  >
    <div class="message-popup">
      <div class="message-popup__stage" :class="{ 'message-popup__stage--bottom-tabs': popupLayout === 'bottom' }">
        <x-tabs
          v-model="activeTab"
          :position="popupLayout === 'bottom' ? 'bottom' : 'left'"
          type="line"
          shrink
          animated
          :show-nav-arrows="false"
          class="message-popup__tabs"
        >
          <x-tab v-for="(notice, index) in listData" :key="notice.id ?? index" :name="index">
            <template #title>
              <span class="message-popup__tab-title">
                <span class="message-popup__tab-icon">
                  <svg-icon name="icon_message_pmd" />
                </span>
                <span class="message-popup__tab-label">{{ notice.title || $t("公告") }}</span>
              </span>
            </template>

            <div class="message-popup__panel">
              <div v-if="isImageNotice(notice)" class="message-popup__image-wrap">
                <img :src="notice.image" :alt="notice.title || $t('公告')" />
              </div>
              <div v-else class="message-popup__text-wrap">
                <div class="message-popup__rich-text" v-html="notice.content || ''"></div>
              </div>
            </div>
          </x-tab>
        </x-tabs>

        <button
          v-if="showLeftPageArrow"
          type="button"
          class="message-popup__page-button message-popup__page-button--prev"
          :aria-label="$t('上一页')"
          @click.stop="changePage(-1)"
        >
          <svg-icon
            name="comm_icon_fh"
            class-name="message-popup__page-icon message-popup__page-icon--prev"
          />
        </button>
        <button
          v-if="showRightPageArrow"
          type="button"
          class="message-popup__page-button message-popup__page-button--next"
          :aria-label="$t('下一页')"
          @click.stop="changePage(1)"
        >
          <svg-icon
            name="comm_icon_fh"
            class-name="message-popup__page-icon message-popup__page-icon--next"
          />
        </button>
      </div>

      <div class="message-popup__footer">
        <ui-checkbox v-model="suppressToday">
          {{ $t("今日不再提示") }}
        </ui-checkbox>
      </div>

      <button
        type="button"
        class="message-popup__close"
        :aria-label="$t('关闭')"
        @click="close"
      >
        <svg-icon name="close" />
      </button>
    </div>
  </van-dialog>
</template>

<style lang="less">
.message-popup-overlay {
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(5px);
}

.message-popup-dialog {
  max-width: calc(100vw - 30px);
  overflow: visible !important;
  border-radius: 10px;
  background: transparent !important;
}

.message-popup-dialog .van-dialog__content {
  padding: 0;
  overflow: visible;
}

.message-popup-dialog .van-dialog__footer {
  display: none;
}

.message-popup {
  width: 100%;
  color: var(--skin__lead);
}

.message-popup__stage {
  position: relative;
  width: 100%;
  height: 206px;
  overflow: hidden;
  border-radius: 10px;
  background: var(--skin__bg_2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.message-popup__stage--bottom-tabs {
  height: 303px;
  border-radius: 10px 10px 0 0;
  background: transparent;
}

.message-popup__tabs {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--skin__bg_2);

  .x-tabs__wrap {
    width: 81px;
    flex: 0 0 81px;
    border-right: thin solid var(--skin__border);
  }

  .x-tabs__nav {
    width: 100%;
    background: var(--skin__bg_2);
  }

  .x-tabs__line,
  .x-tabs__line--vertical {
    display: none;
  }

  .x-tab {
    width: 100%;
    min-height: 40px;
    padding: 0 8px;
    justify-content: flex-start;
    box-sizing: border-box;
    color: var(--skin__neutral_2);
    white-space: normal;
  }

  .x-tab--active {
    color: var(--skin__primary);
    background: rgba(var(--skin__primary__toRgbString), 0.06);
  }

  .x-tabs__content {
    width: calc(100% - 81px);
    height: 100%;
    min-height: 0;
    display: flex;
    overflow: hidden;
    background: var(--skin__bg_2);
  }

  .x-tabs__track {
    height: 100%;
    min-height: 0;
  }

  .x-tab__panel,
  .x-tab__panel-inner {
    height: 100%;
    min-height: 0;
  }
}

.message-popup__stage--bottom-tabs .message-popup__tabs {
  background: transparent;

  .x-tabs__wrap {
    width: 100%;
    height: 33px;
    flex: 0 0 33px;
    border: 0;
  }

  .x-tabs__nav {
    height: 33px;
    padding-bottom: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border: 0;
    background: transparent;
  }

  .x-tabs__line {
    display: none;
  }

  .x-tab {
    width: auto;
    min-width: 86px;
    max-width: 130px;
    height: 33px;
    min-height: 33px;
    padding: 0 7.5px;
    margin-right: 1px;
    border-radius: 0 0 7px 7px;
    color: var(--skin__primary);
    background: var(--skin__bg_2);
  }

  .x-tab .message-popup__tab-icon,
  .x-tab .message-popup__tab-label {
    color: var(--skin__primary);
  }

  .x-tab--active {
    color: var(--skin__text_primary);
    background-color: var(--skin__primary) !important;
  }

  .x-tab--active .message-popup__tab-icon,
  .x-tab--active .message-popup__tab-label {
    color: var(--skin__text_primary);
  }

  .x-tab:nth-last-child(2) {
    margin-right: 0;
  }

  .x-tabs__content {
    width: 100%;
    height: 270px;
    min-height: 0;
    flex: 1;
  }
}

.message-popup__stage--bottom-tabs .message-popup__image-wrap img {
  object-fit: fill;
}

.message-popup__tab-title {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
}

.message-popup__tab-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: currentColor;
  font-size: 14px;
}

.message-popup__tab-label {
  min-width: 0;
  flex: 1 1 auto;
  display: -webkit-box;
  overflow: hidden;
  color: currentColor;
  font-size: 11px;
  line-height: 15px;
  text-align: start;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.message-popup__panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--skin__bg_2);
}

.message-popup__image-wrap,
.message-popup__text-wrap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.message-popup__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--skin__bg_2);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.message-popup__text-wrap {
  display: flex;
  min-height: 0;
  flex-direction: column;
  padding: 10px 12px;
  overflow: hidden;
}

.message-popup__rich-text {
  width: 100%;
  height: auto;
  min-height: 0;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 1.56;
  text-align: start;
  text-shadow: var(--notice--text-shadow);
  word-break: break-word;
  -webkit-overflow-scrolling: touch;

  p {
    margin: 0 0 8px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul {
    padding-left: 18px;
    list-style: disc;
  }

  ol {
    padding-left: 18px;
    list-style: decimal;
  }

  a {
    color: var(--skin__primary);
  }

  img {
    max-width: 100%;
    height: auto;
  }

  table {
    max-width: 100%;
    border-collapse: collapse;
  }

  td,
  th {
    padding: 3px;
    border: thin solid var(--skin__border);
  }
}

.message-popup__page-button {
  width: 20px;
  height: 20px;
  padding: 0;
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: thin solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.16);
  transform: translateY(-50%);
  cursor: pointer;

  &--prev {
    left: 7px;
  }

  &--next {
    right: 7px;
  }
}

.message-popup__page-icon {
  display: block;
  width: 8px !important;
  height: 12px !important;
  flex: none;
}

.message-popup__page-icon--next {
  transform: rotate(180deg);
}

.message-popup__stage--bottom-tabs .message-popup__page-button {
  width: 18px;
  height: 18px;
  border: 0;
  background: rgba(0, 0, 0, 0.2);
  top: 135px;
}

.message-popup__stage:not(.message-popup__stage--bottom-tabs) .message-popup__page-button--prev {
  left: 88px;
}

.message-popup__footer {
  min-height: 30px;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-popup__footer .ui-checkbox {
  min-height: 24px;
  padding: 4px 10px;
  align-items: center;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.3);
}

.message-popup__footer .ui-checkbox__icon-wrap {
  width: 14px;
  height: 14px;
  margin-right: 5px;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.2);
}

.message-popup__footer .ui-checkbox__label {
  color: #fff;
  font-size: 11px;
  line-height: 16px;
}

.message-popup__close {
  width: 30px;
  height: 30px;
  margin: 7px auto 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: #fff;
  background: transparent;
  font-size: 27px;
  cursor: pointer;
}

[dir="rtl"] .message-popup__tabs {
  .x-tabs__wrap {
    border-right: 0;
    border-left: thin solid var(--skin__border);
  }
}

[dir="rtl"] .message-popup__stage--bottom-tabs .message-popup__tabs .x-tabs__wrap {
  border-left: 0;
}

[dir="rtl"] .message-popup__stage--bottom-tabs .message-popup__tabs .x-tab {
  margin-right: 0;
  margin-left: 1px;
}

[dir="rtl"] .message-popup__stage--bottom-tabs .message-popup__tabs .x-tab:nth-last-child(2) {
  margin-left: 0;
}

[dir="rtl"] .message-popup__tab-icon {
  margin-right: 0;
  margin-left: 5px;
}

[dir="rtl"] .message-popup__page-button--prev {
  right: 7px;
  left: auto;
}

[dir="rtl"] .message-popup__page-button--next {
  right: auto;
  left: 7px;
}

[dir="rtl"] .message-popup__stage:not(.message-popup__stage--bottom-tabs) .message-popup__page-button--prev {
  right: 88px;
  left: auto;
}

[dir="rtl"] .message-popup__page-button--prev .message-popup__page-icon {
  transform: rotate(180deg);
}

[dir="rtl"] .message-popup__page-button--next .message-popup__page-icon {
  transform: none;
}

[dir="rtl"] .message-popup__footer .ui-checkbox__icon-wrap {
  margin-right: 0;
  margin-left: 5px;
}
</style>
