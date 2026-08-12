<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { publishMoment, uploadMomentImage } from "@/api/common";
import SubNavbar from "@/components/SubNavbar.vue";
import PlazzaColorPicker from "./components/PlazzaColorPicker.vue";
import PlazzaEmojiPicker from "./components/PlazzaEmojiPicker.vue";
import { showCustomToast } from "@/hooks/useCommon";
import router from "@/router";
import useAuthStore from "@/store/modules/user";

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGE_COUNT = 9;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

interface MomentUploadFile {
  uid?: string;
  name?: string;
  url?: string;
  file?: File;
  status?: "ready" | "uploading" | "success" | "error";
  response?: unknown;
  error?: string;
}

const auth = useAuthStore();
const content = ref("");
const uploadFiles = ref<MomentUploadFile[]>([]);
const contentInputRef = ref<HTMLTextAreaElement | null>(null);
const isPublishing = ref(false);
const isColorPickerVisible = ref(false);
const isEmojiPickerVisible = ref(false);
const textColor = ref("");

const isUploading = computed(() => {
  return uploadFiles.value.some(file => file.status === "uploading");
});

function hasCompletePublishProfile() {
  return Boolean(
    String(auth.user.nickName || "").trim()
    && String(auth.user.avatarUrl || "").trim()
    && String(auth.user.description || "").trim()
  );
}

async function handleUploadImage(file: File) {
  const response = await uploadMomentImage(file);
  const imageUrl = typeof response === "string"
    ? response
    : response?.url || response?.data?.url || response?.path || response?.data?.path;
  if (!imageUrl) throw new Error("图片上传结果缺少地址");
  return { url: String(imageUrl) };
}

function validateImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  showCustomToast({ type: "warning", message: "仅支持PNG、JPG或JPEG图片" });
  return false;
}

function handleUploadOversize() {
  showCustomToast({ type: "warning", message: "单张图片不能超过10MB" });
}

function handleUploadExceed() {
  showCustomToast({ type: "warning", message: `最多上传${MAX_IMAGE_COUNT}张图片` });
}

function handleUploadError() {
  showCustomToast({ type: "fail", message: "图片上传失败，请重新选择" });
}

async function insertEmoji(emoji: string) {
  const textarea = contentInputRef.value;
  const selectionStart = textarea?.selectionStart ?? content.value.length;
  const selectionEnd = textarea?.selectionEnd ?? selectionStart;
  const nextContent = `${content.value.slice(0, selectionStart)}${emoji}${content.value.slice(selectionEnd)}`;
  if (nextContent.length > MAX_CONTENT_LENGTH) return;

  content.value = nextContent;
  await nextTick();
  textarea?.focus();
  textarea?.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
}

async function handlePublish() {
  const normalizedContent = content.value.trim();
  const hasUploadError = uploadFiles.value.some(file => file.status === "error");
  const imageUrls = uploadFiles.value
    .filter(file => file.status === "success" && file.url && !file.url.startsWith("blob:"))
    .map(file => String(file.url));

  if (!normalizedContent && !imageUrls.length) {
    showCustomToast({ type: "warning", message: "请输入帖子内容或上传图片" });
    return;
  }
  if (normalizedContent.length > MAX_CONTENT_LENGTH) {
    showCustomToast({ type: "warning", message: `帖子内容不能超过${MAX_CONTENT_LENGTH}个字符` });
    return;
  }
  if (isUploading.value) {
    showCustomToast({ type: "warning", message: "图片正在上传，请稍后发布" });
    return;
  }
  if (hasUploadError) {
    showCustomToast({ type: "warning", message: "请移除上传失败的图片后再发布" });
    return;
  }

  isPublishing.value = true;
  try {
    await publishMoment({ content: normalizedContent, imageUrls });
    showCustomToast({ type: "success", message: "发布成功" });
    await router.replace("/home/plazza?active=profile");
  } catch {
    return;
  } finally {
    isPublishing.value = false;
  }
}

onMounted(async () => {
  if (!auth.token) {
    await router.replace("/home/login");
    return;
  }

  try {
    await auth.updateInfo();
  } catch {
    return;
  }

  if (!hasCompletePublishProfile()) {
    showCustomToast({ type: "warning", message: "请先完善头像、昵称和个人介绍" });
    await router.replace("/home/plazza?active=profile");
  }
});
</script>

<template>
  <main class="moment-post-page">
    <sub-navbar title="发帖" />

    <section class="moment-post-page__content">
      <form class="moment-post-form" novalidate @submit.prevent="handlePublish">
        <section class="moment-post-editor">
          <div class="moment-post-editor__toolbar">
            <button
              type="button"
              :class="{ 'moment-post-editor__tool--active': isColorPickerVisible }"
              aria-label="选择文字颜色"
              :aria-expanded="isColorPickerVisible"
              @click="isColorPickerVisible = !isColorPickerVisible; isEmojiPickerVisible = false"
            >
              <svg-icon name="icon_moments_ziti" />
            </button>
            <button
              type="button"
              :class="{ 'moment-post-editor__tool--active': isEmojiPickerVisible }"
              aria-label="选择表情"
              :aria-expanded="isEmojiPickerVisible"
              @click="isEmojiPickerVisible = !isEmojiPickerVisible; isColorPickerVisible = false"
            >
              <svg-icon name="icon_moment2_bq" />
            </button>
          </div>

          <textarea
            ref="contentInputRef"
            v-model="content"
            :style="{ color: textColor || undefined }"
            :maxlength="MAX_CONTENT_LENGTH"
            autofocus
            placeholder="这一刻的想法..."
          ></textarea>
          <div class="moment-post-editor__count">{{ content.length }} / {{ MAX_CONTENT_LENGTH }}</div>
          <plazza-color-picker
            v-if="isColorPickerVisible"
            v-model="textColor"
          />
        </section>

        <transition name="moment-post-emoji">
          <plazza-emoji-picker
            v-if="isEmojiPickerVisible"
            @select="insertEmoji"
          />
        </transition>

        <x-upload
          v-model="uploadFiles"
          class="moment-post-upload"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          :max-count="MAX_IMAGE_COUNT"
          :max-size="MAX_IMAGE_SIZE"
          upload-text=""
          :before-upload="validateImage"
          :custom-request="handleUploadImage"
          @oversize="handleUploadOversize"
          @exceed="handleUploadExceed"
          @error="handleUploadError"
        />
      </form>
    </section>

    <footer class="moment-post-footer">
      <x-button plain type="primary" :disabled="isPublishing" @click="router.back()">取 消</x-button>
      <x-button type="primary" :loading="isPublishing" @click="handlePublish">发 布</x-button>
    </footer>
  </main>
</template>

<style scoped lang="less">
.moment-post-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.moment-post-page__content {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}

.moment-post-form {
  padding: 10px;
}

.moment-post-editor {
  position: relative;
  width: 100%;
}

.moment-post-editor__toolbar {
  position: absolute;
  top: 1px;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 3px);
  padding: 10px 7px;
  border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  box-sizing: border-box;
  background: var(--skin__bg_2);
  transform: translateX(-50%);

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    color: var(--skin__neutral_2);
    background: transparent;
    transition: color 0.2s;

    :deep(.svg-icon) {
      width: 18px;
      height: 18px;
    }

    &:active,
    &.moment-post-editor__tool--active {
      color: var(--skin__primary);
    }
  }
}

.moment-post-editor textarea {
  display: block;
  width: 100%;
  height: 119.5px;
  padding: 48px 10px 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px;
  box-sizing: border-box;
  color: var(--skin__lead);
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  resize: none;
  background: var(--skin__bg_2);
  outline: none;

  &:focus {
    border-color: var(--skin__primary);
  }

  &::placeholder {
    color: var(--skin__neutral_2);
    font-weight: 400;
  }

}

.moment-post-editor__count {
  margin-top: 10px;
  color: var(--skin__neutral_2);
  font-size: 10px;
  line-height: 14px;
  text-align: right;
}

:global([dir="rtl"]) .moment-post-editor__toolbar {
  right: 50%;
  left: auto;
  transform: translateX(50%);
}

:global([dir="rtl"]) .moment-post-editor__count {
  text-align: left;
}

.moment-post-emoji-enter-active,
.moment-post-emoji-leave-active {
  overflow: hidden;
  transition:
    max-height 0.25s ease,
    margin-top 0.25s ease,
    opacity 0.2s ease,
    transform 0.25s ease;
}

.moment-post-emoji-enter-active,
.moment-post-emoji-leave-from {
  max-height: 157px;
}

.moment-post-emoji-enter-from,
.moment-post-emoji-leave-to {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .moment-post-emoji-enter-active,
  .moment-post-emoji-leave-active {
    transition: none;
  }
}

.moment-post-upload {
  margin-top: 10px;

  :deep(.x-upload__list) {
    gap: 10px;
  }

  :deep(.x-upload__item),
  :deep(.x-upload__trigger) {
    width: 70px;
    height: 70px;
    border-radius: 0;
  }

  :deep(.x-upload__trigger) {
    position: relative;
    border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
    background: var(--skin__bg_2);
  }

  :deep(.x-upload__trigger-plus) {
    width: 28px;
    height: 28px;
    overflow: hidden;
    color: transparent;
  }

  :deep(.x-upload__trigger-plus::before),
  :deep(.x-upload__trigger-plus::after) {
    position: absolute;
    top: 50%;
    left: 50%;
    background: var(--skin__neutral_3);
    content: "";
    transform: translate(-50%, -50%);
  }

  :deep(.x-upload__trigger-plus::before) {
    width: 28px;
    height: 1px;
  }

  :deep(.x-upload__trigger-plus::after) {
    width: 1px;
    height: 28px;
  }
}

.moment-post-footer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  width: 100%;
  min-height: calc(65px + var(--skin__safe-area-inset-bottom));
  padding: 10px 10px 20px;
  box-sizing: border-box;
  background: var(--skin__bg_2);
  box-shadow: 0 -1.5px 5px rgb(0 0 0 / 10%);

  :deep(.x-button) {
    flex: 1;
    width: auto;
    height: 35px;
    border-radius: 7px;
    font-size: 12px;
  }
}
</style>
