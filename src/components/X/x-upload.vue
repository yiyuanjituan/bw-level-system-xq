<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from "vue";
import { X_FORM_CONTEXT_KEY, X_FORM_ITEM_PROP_KEY } from "./x-form-context";
import XLoading from "./x-loading.vue";

defineOptions({
  name: "x-upload"
});

type UploadStatus = "ready" | "uploading" | "success" | "error";

export interface XUploadFileItem {
  uid?: string;
  name?: string;
  url?: string;
  file?: File;
  status?: UploadStatus;
  response?: any;
  error?: string;
}

interface Props {
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  maxSize?: number; // bytes
  disabled?: boolean;
  deletable?: boolean;
  preview?: boolean;
  uploadText?: string;
  validateEvent?: boolean;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  customRequest?: (file: File) => Promise<any>;
}

const props = withDefaults(defineProps<Props>(), {
  accept: "image/*",
  multiple: false,
  maxCount: 1,
  maxSize: 0,
  disabled: false,
  deletable: true,
  preview: true,
  uploadText: "Upload",
  validateEvent: true,
  beforeUpload: undefined,
  customRequest: undefined
});

const modelValue = defineModel<XUploadFileItem[]>({ default: () => [] });
const inputRef = ref<HTMLInputElement>();
const objectUrlSet = new Set<string>();
const formContext = inject(X_FORM_CONTEXT_KEY, null);
const itemProp = inject(X_FORM_ITEM_PROP_KEY, null);
const prop = computed(() => itemProp?.value || "");

const emit = defineEmits<{
  (e: "change", files: XUploadFileItem[]): void;
  (e: "remove", file: XUploadFileItem, index: number): void;
  (e: "preview", file: XUploadFileItem, index: number): void;
  (e: "success", payload: { file: XUploadFileItem; response: any; index: number }): void;
  (e: "error", payload: { file: XUploadFileItem; error: unknown; index: number }): void;
  (e: "oversize", file: File): void;
  (e: "exceed", files: File[]): void;
}>();

const fileList = computed(() => Array.isArray(modelValue.value) ? modelValue.value : []);
const hasError = computed(() => {
  if (!prop.value) return false;
  return !!formContext?.errors.value?.[prop.value];
});
const canUpload = computed(() => !props.disabled && fileList.value.length < props.maxCount);

function setFileList(next: XUploadFileItem[]) {
  modelValue.value = next;
  emit("change", next);
  runValidation("change");
}

function fieldHasRules() {
  const field = prop.value;
  return !!(field && formContext?.rules.value?.[field]);
}

function runValidation(trigger: string) {
  if (!props.validateEvent || !fieldHasRules() || !prop.value) return;
  formContext?.validateField(prop.value, trigger).catch(() => {});
}

function createUid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function revokeObjectUrl(url?: string) {
  if (!url) return;
  if (objectUrlSet.has(url)) {
    URL.revokeObjectURL(url);
    objectUrlSet.delete(url);
  }
}

function openFileDialog() {
  if (!canUpload.value) return;
  inputRef.value?.click();
}

async function handleSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const selected = Array.from(target.files ?? []);
  target.value = "";
  if (!selected.length) return;

  const remainCount = props.maxCount - fileList.value.length;
  if (remainCount <= 0) {
    emit("exceed", selected);
    return;
  }

  const files = selected.slice(0, remainCount);
  if (selected.length > remainCount) emit("exceed", selected);

  for (const file of files) {
    if (props.maxSize > 0 && file.size > props.maxSize) {
      emit("oversize", file);
      continue;
    }

    if (props.beforeUpload) {
      const result = await props.beforeUpload(file);
      if (!result) continue;
    }

    await appendFile(file);
  }
}

async function appendFile(file: File) {
  const uid = createUid();
  const localUrl = URL.createObjectURL(file);
  objectUrlSet.add(localUrl);

  const item: XUploadFileItem = {
    uid,
    name: file.name,
    file,
    url: localUrl,
    status: props.customRequest ? "uploading" : "success"
  };

  const nextList = [...fileList.value, item];
  setFileList(nextList);

  if (!props.customRequest) return;

  try {
    const response = await props.customRequest(file);
    const finalUrl = response?.url || response?.data?.url || response?.path || response?.data?.path;
    const updated = [...fileList.value];
    const target = updated.find(v => v.uid === uid);
    if (!target) return;
    target.status = "success";
    target.response = response;
    if (finalUrl) target.url = finalUrl;
    modelValue.value = updated;
    emit("success", { file: target, response, index: updated.findIndex(v => v.uid === uid) });
    emit("change", updated);
    runValidation("change");
  } catch (error) {
    const updated = [...fileList.value];
    const target = updated.find(v => v.uid === uid);
    if (!target) return;
    target.status = "error";
    target.error = "upload error";
    modelValue.value = updated;
    emit("error", { file: target, error, index: updated.findIndex(v => v.uid === uid) });
    emit("change", updated);
    runValidation("change");
  }
}

function removeFile(index: number) {
  const target = fileList.value[index];
  if (!target) return;
  revokeObjectUrl(target.url);
  const next = fileList.value.filter((_, idx) => idx !== index);
  setFileList(next);
  emit("remove", target, index);
}

function previewFile(item: XUploadFileItem, index: number) {
  emit("preview", item, index);
  if (!props.preview) return;
  if (item.url) window.open(item.url, "_blank");
}

onBeforeUnmount(() => {
  for (const url of objectUrlSet) URL.revokeObjectURL(url);
  objectUrlSet.clear();
});
</script>

<template>
  <div class="x-upload" :class="{ 'x-upload--disabled': disabled, 'x-upload--invalid': hasError }">
    <input
      ref="inputRef"
      class="x-upload__input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleSelect"
    />

    <div class="x-upload__list">
      <div
        v-for="(item, index) in fileList"
        :key="item.uid || `${item.name}_${index}`"
        class="x-upload__item"
      >
        <div class="x-upload__preview" @click="previewFile(item, index)">
          <img v-if="item.url" :src="item.url" :alt="item.name || `file_${index}`" />
          <div v-else class="x-upload__placeholder">{{ item.name || "File" }}</div>
          <div v-if="item.status === 'uploading'" class="x-upload__mask">
            <x-loading size="14px" />
          </div>
          <div v-if="item.status === 'error'" class="x-upload__mask x-upload__mask--error">Error</div>
        </div>
        <button
          v-if="deletable && !disabled"
          type="button"
          class="x-upload__remove"
          @click="removeFile(index)"
        >
          <span>x</span>
        </button>
      </div>

      <button
        v-if="canUpload"
        type="button"
        class="x-upload__trigger"
        :disabled="disabled"
        @click="openFileDialog"
      >
        <span class="x-upload__trigger-plus">+</span>
        <span>{{ uploadText }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.x-upload {
  width: 100%;

  &__input {
    display: none;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__item,
  &__trigger {
    width: 70px;
    height: 70px;
    border-radius: 7px;
  }

  &__item {
    position: relative;
    overflow: hidden;
    border: var(--lobby__px) solid var(--skin__border);
    background: var(--skin__bg_2);
    box-sizing: border-box;
  }

  &__preview {
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &:active {
      opacity: 0.85;
    }
  }

  &__placeholder {
    color: var(--skin__neutral_2);
    font-size: 9px;
    padding: 0 6px;
    text-align: center;
    word-break: break-all;
    line-height: 1.2;
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;

    &--error {
      background: rgba(234, 78, 61, 0.82);
    }
  }

  &__remove {
    position: absolute;
    right: 2px;
    top: 2px;
    width: 16px;
    height: 16px;
    border: 0;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-size: 11px;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.85;
    }
  }

  &__trigger {
    border: var(--lobby__px) dashed var(--skin__border);
    background: var(--skin__bg_2);
    color: var(--skin__neutral_2);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    font-size: 9px;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s, opacity 0.2s;
    box-sizing: border-box;

    &-plus {
      font-size: 16px;
      line-height: 1;
    }

    &:hover {
      border-color: var(--skin__primary);
      color: var(--skin__primary);
    }

    &:active {
      opacity: 0.85;
    }
  }

  &--disabled {
    opacity: 0.6;

    .x-upload__trigger,
    .x-upload__preview {
      cursor: not-allowed;
    }
  }

  &--invalid .x-upload__item,
  &--invalid .x-upload__trigger {
    border-color: var(--skin__accent_2);
  }
}

[dir="rtl"] .x-upload__remove {
  right: auto;
  left: 2px;
}
</style>

