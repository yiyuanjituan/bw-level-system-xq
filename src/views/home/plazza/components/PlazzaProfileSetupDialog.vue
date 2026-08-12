<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { updateUserInfo } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import PlazzaLazyImage from "./PlazzaLazyImage.vue";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
  (event: "completed"): void;
}>();

const AVATAR_COUNT = 25;
const LOCAL_AVATAR_BASE_PATH = "/siteadmin/default/2D";
const auth = useAuthStore();
const isSaving = ref(false);
const form = reactive({
  nickName: "",
  avatarUrl: "",
  description: ""
});

const avatarList = computed(() => {
  const maleAvatars = Array.from({ length: AVATAR_COUNT }, (_, index) => {
    const avatarNumber = index + 2;
    const extension = [7, 11].includes(avatarNumber) ? "avif" : "webp";
    return `${LOCAL_AVATAR_BASE_PATH}/img_txn${avatarNumber}.${extension}`;
  });
  const femaleAvatars = Array.from({ length: AVATAR_COUNT }, (_, index) => {
    const avatarNumber = index + 1;
    const extension = avatarNumber === 1 ? "avif" : "webp";
    return `${LOCAL_AVATAR_BASE_PATH}/img_ntx${avatarNumber}.${extension}`;
  });

  return [...maleAvatars, ...femaleAvatars];
});

function normalizeAvatarPath(value: string) {
  return value.replace(/^https?:\/\/[^/]+/, "");
}

function isSelected(avatarUrl: string) {
  return normalizeAvatarPath(form.avatarUrl) === normalizeAvatarPath(avatarUrl);
}

function syncForm() {
  form.nickName = String(auth.user.nickName || "");
  form.avatarUrl = String(auth.user.avatarUrl || "");
  form.description = String(auth.user.description || "");
}

function handleClose() {
  if (isSaving.value) return;
  emit("update:show", false);
}

async function handleConfirm() {
  const nickName = form.nickName.trim();
  const description = form.description.trim();

  if (!nickName) {
    showCustomToast({ type: "warning", message: "请输入昵称" });
    return;
  }
  if (nickName.length > 20) {
    showCustomToast({ type: "warning", message: "昵称不能超过20个字符" });
    return;
  }
  if (!form.avatarUrl) {
    showCustomToast({ type: "warning", message: "请选择头像" });
    return;
  }
  if (!description) {
    showCustomToast({ type: "warning", message: "请输入个人介绍" });
    return;
  }
  if (description.length > 500) {
    showCustomToast({ type: "warning", message: "个人介绍不能超过500个字符" });
    return;
  }

  isSaving.value = true;
  try {
    await updateUserInfo({ nickName, avatarUrl: form.avatarUrl, description });
    await auth.updateInfo();
    showCustomToast({ type: "success", message: "个人资料设置成功" });
    emit("completed");
  } catch {
    return;
  } finally {
    isSaving.value = false;
  }
}

watch(
  () => props.show,
  show => {
    if (show) syncForm();
  },
  { immediate: true }
);
</script>

<template>
  <van-dialog
    :show="show"
    class-name="profile-setup-dialog"
    :width="345"
    transition="van-dialog-bounce"
    teleport="body"
    overlay-class="profile-setup-dialog__overlay"
    :close-on-click-overlay="false"
    :show-confirm-button="false"
    :show-cancel-button="false"
    @update:show="emit('update:show', $event)"
  >
    <section class="profile-setup-dialog__panel" aria-labelledby="profile-setup-title">
      <header id="profile-setup-title">请先完善头像、昵称和个人介绍才能发帖哦！</header>

      <div class="profile-setup-dialog__content">
        <label class="profile-setup-dialog__field">
          <span><i>*</i>请输入您的昵称</span>
          <input
            v-model="form.nickName"
            maxlength="20"
            type="text"
            placeholder="请输入您的昵称，字数1-20位"
          />
        </label>

        <section class="profile-setup-dialog__field">
          <span><i>*</i>请选择您的头像</span>
          <div class="profile-setup-dialog__avatars">
            <button
              v-for="(avatarUrl, index) in avatarList"
              :key="avatarUrl"
              type="button"
              class="profile-setup-dialog__avatar"
              :class="{ 'profile-setup-dialog__avatar--active': isSelected(avatarUrl) }"
              :aria-label="`选择头像${index + 1}`"
              :aria-pressed="isSelected(avatarUrl)"
              @click="form.avatarUrl = avatarUrl"
            >
              <plazza-lazy-image :src="avatarUrl" alt="" error-text="" />
            </button>
          </div>
        </section>

        <label class="profile-setup-dialog__field">
          <span><i>*</i>个人介绍</span>
          <textarea
            v-model="form.description"
            maxlength="500"
            placeholder="请输入个人介绍"
          ></textarea>
          <small>{{ form.description.length }} / 500</small>
        </label>
      </div>

      <footer>
        <x-button plain type="primary" :disabled="isSaving" @click="handleClose">取 消</x-button>
        <x-button type="primary" :loading="isSaving" @click="handleConfirm">确 认</x-button>
      </footer>

    </section>

    <template #footer>
      <div class="profile-setup-dialog__close-footer">
        <button type="button" class="profile-setup-dialog__close" aria-label="关闭" @click="handleClose">
          <svg-icon name="close" color="white" />
        </button>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
:global(.profile-setup-dialog__overlay) {
  backdrop-filter: blur(5px);
}

:global(.profile-setup-dialog.van-dialog) {
  width: min(345px, calc(100vw - 30px));
  max-height: calc(100vh - 130px);
  overflow: visible;
  border-radius: 10px;
  background: transparent;
}

:global(.profile-setup-dialog .van-dialog__content) {
  overflow: visible;
}

.profile-setup-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  max-height: calc(100vh - 130px);
  padding: 10px 10px 5px;
  border-radius: 10px;
  box-sizing: border-box;
  color: var(--skin__lead);
  background: var(--skin__bg_2);

  > header {
    flex-shrink: 0;
    padding: 0 24px 15px;
    font-size: 15px;
    font-weight: 400;
    line-height: 21px;
    text-align: center;
  }

  > footer {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    padding: 10px 0 5px;

    :deep(.x-button) {
      flex: 1;
      height: 35px;
      border-radius: 5px;
      font-size: 12px;
    }
  }
}

.profile-setup-dialog__content {
  flex: 1;
  min-height: 0;
  margin-right: -6.5px;
  padding-right: 6.5px;
  overflow-y: auto;
}

.profile-setup-dialog__field {
  position: relative;
  display: block;
  margin-bottom: 10px;

  > span {
    display: block;
    margin-bottom: 10px;
    font-size: 12px;
    line-height: 16px;

    i {
      margin-right: 3px;
      color: var(--skin__accent_2, #ff5662);
      font-style: normal;
    }
  }

  input,
  textarea {
    width: 100%;
    border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
    border-radius: 5px;
    box-sizing: border-box;
    color: var(--skin__lead);
    font-family: inherit;
    font-size: 12px;
    background: var(--skin__bg_2);
    outline: none;

    &:focus {
      border-color: var(--skin__primary);
    }
  }

  input {
    height: 36px;
    padding: 0 10px;
  }

  textarea {
    display: block;
    min-height: 86px;
    padding: 10px 10px 24px;
    resize: none;
  }

  small {
    position: absolute;
    right: 9px;
    bottom: 7px;
    color: var(--skin__neutral_2);
    font-size: 10px;
  }
}

.profile-setup-dialog__avatars {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-height: 160.5px;
  padding-right: 7px;
  overflow-y: auto;
}

.profile-setup-dialog__avatar {
  position: relative;
  width: 55px;
  max-width: 100%;
  aspect-ratio: 1;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 7px;
  box-sizing: border-box;
  background: transparent;

  :deep(.plazza-lazy-image) {
    width: 100%;
    height: 100%;
    border-radius: 7px;
  }

  &--active::before {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    width: 0;
    height: 0;
    border: 8px solid var(--skin__primary);
    border-top-color: transparent;
    border-left-color: transparent;
    content: "";
  }

  &--active::after {
    position: absolute;
    right: 3px;
    bottom: 2px;
    z-index: 2;
    width: 4px;
    height: 7px;
    border: solid var(--skin__text_primary);
    border-width: 0 1.5px 1.5px 0;
    content: "";
    transform: rotate(40deg);
  }

  &--active {
    border-color: var(--skin__primary);
  }
}

.profile-setup-dialog__close-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 45px;
  padding-top: 15px;
  box-sizing: content-box;
}

.profile-setup-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  cursor: pointer;

  :deep(.svg-icon) {
    width: 30px;
    height: 30px;
  }
}
</style>
