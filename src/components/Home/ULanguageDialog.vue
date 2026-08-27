<script setup lang="ts">
import { computed } from "vue";
import { $locale, $t, setLocale } from "@/locales";

defineOptions({
  name: "UHomeLanguageDialog"
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});
const languageOptions = computed<Array<{ label: string; value: I18nType.LangType }>>(() => [
  { label: $t("简体中文"), value: "zh-cn" },
  { label: "English", value: "en" }
]);

function selectLanguage(locale: I18nType.LangType) {
  if ($locale.value !== locale) setLocale(locale);
  visible.value = false;
}
</script>

<template>
  <van-dialog
    v-model:show="visible"
    class="u-language-dialog"
    overlay-class="u-language-dialog-overlay"
    width="min(300px, calc(100vw - 40px))"
    teleport="body"
    close-on-popstate
    :close-on-click-overlay="true"
    :show-confirm-button="false"
    :show-cancel-button="false"
  >
    <template #default>
      <div class="u-language-dialog__container">
        <div class="u-language-dialog__header">{{ $t("选择语言") }}</div>
        <div class="u-language-dialog__list">
          <button
            v-for="language in languageOptions"
            :key="language.value"
            type="button"
            class="u-language-dialog__item"
            :class="{ 'u-language-dialog__item--active': $locale === language.value }"
            @click="selectLanguage(language.value)"
          >
            <span class="u-language-dialog__item-text">{{ language.label }}</span>
            <span
              class="u-language-dialog__checkbox"
              :class="{ 'u-language-dialog__checkbox--checked': $locale === language.value }"
              aria-hidden="true"
            >
              <svg-icon class="u-language-dialog__check" name="comm_icon_gou" />
            </span>
          </button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="u-language-dialog__footer">
        <button
          type="button"
          class="u-language-dialog__close"
          :aria-label="$t('关闭')"
          @click="visible = false"
        >
          <svg-icon name="close" color="white" />
        </button>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
:global(.u-language-dialog-overlay) {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.u-language-dialog {
  max-height: 100vh;
  overflow: visible;

  :deep(.van-dialog__content) {
    overflow: visible;
  }
}

.u-language-dialog__container {
  width: 100%;
  min-height: unset;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 10px;
  background: var(--skin__bg_2);
  backface-visibility: hidden;
}

.u-language-dialog__header {
  padding: 10px 15px;
  border-bottom: var(--lobby__px) solid var(--skin__border);
  color: var(--skin__lead);
  background: var(--skin__bg_2);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
}

.u-language-dialog__list {
  max-height: min(320px, calc(100vh - 100px));
  padding: 0 10px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.u-language-dialog__item {
  --switch-lang-content-item-text-color: var(--skin__lead);
  width: 100%;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  border: 0;
  background: var(--skin__bg_2);
  line-height: 20px;
  cursor: pointer;

  & + & {
    border-top: var(--lobby__px) solid var(--skin__border);
  }
}

.u-language-dialog__item-text {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: var(--switch-lang-content-item-text-color);
  font-size: 11px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  .u-language-dialog__item--active & {
    color: var(--skin__primary);
  }
}

.u-language-dialog__checkbox {
  width: 15px;
  height: 15px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 50%;
  line-height: 16.5px;

  &--checked {
    color: var(--skin__text_primary);
    background: var(--skin__primary);
  }
}

.u-language-dialog__check {
  font-size: 9px;
  opacity: 0;

  .u-language-dialog__checkbox--checked & {
    opacity: 1;
  }
}

:global([dir="rtl"]) .u-language-dialog__item-text {
  text-align: right;
}

.u-language-dialog__footer {
  position: relative;
  width: 100%;
  height: 45px;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.u-language-dialog__close {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: white;
  background: transparent;
  cursor: pointer;

  :deep(svg) {
    width: 30px;
    height: 30px;
    fill: currentColor;
  }
}
</style>
