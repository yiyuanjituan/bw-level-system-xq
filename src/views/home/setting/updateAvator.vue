<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import { updateUserInfo } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import router from "@/router";

type AvatarGender = "male" | "female";

const AVATAR_COUNT = 25;
const LOCAL_AVATAR_BASE_PATH = "/siteadmin/default/2D";
const DEFAULT_AVATAR_URL = "/siteadmin/skin/lobby_asset/common/common/profile/icon_wd_mrtx.avif";
const auth = useAuthStore();
const currentAvatarUrl = String(auth.user.avatarUrl ?? "");
const activeGender = ref<AvatarGender>(currentAvatarUrl.includes("/img_txn") ? "male" : "female");
const selectedAvatarUrl = ref(currentAvatarUrl);
const isSaving = ref(false);

const avatarList = computed(() => {
  return Array.from({ length: AVATAR_COUNT }, (_, index) => {
    if (activeGender.value === "male") {
      const avatarNumber = index + 2;
      return `${LOCAL_AVATAR_BASE_PATH}/img_txn${avatarNumber}.webp`;
    }

    const avatarNumber = index + 1;
    const extension = avatarNumber === 1 ? "avif" : "webp";
    return `${LOCAL_AVATAR_BASE_PATH}/img_ntx${avatarNumber}.${extension}`;
  });
});

function normalizeAvatarPath(value: string) {
  return value.replace(/^https?:\/\/[^/]+/, "");
}

function isSelected(avatarUrl: string) {
  return normalizeAvatarPath(selectedAvatarUrl.value) === normalizeAvatarPath(avatarUrl);
}

function handleGenderChange(gender: AvatarGender) {
  activeGender.value = gender;
  const targetPrefix = gender === "male" ? "img_txn" : "img_ntx";

  if (!normalizeAvatarPath(selectedAvatarUrl.value).includes(`/${targetPrefix}`)) {
    selectedAvatarUrl.value = gender === "male"
      ? `${LOCAL_AVATAR_BASE_PATH}/img_txn2.webp`
      : `${LOCAL_AVATAR_BASE_PATH}/img_ntx1.avif`;
  }
}

function handleImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement;

  if (image.dataset.fallbackApplied) return;

  image.dataset.fallbackApplied = "true";
  image.src = DEFAULT_AVATAR_URL;
}

async function handleSave() {
  if (!selectedAvatarUrl.value) {
    showCustomToast({ type: "warning", message: "请选择头像" });
    return;
  }

  if (normalizeAvatarPath(selectedAvatarUrl.value) === normalizeAvatarPath(currentAvatarUrl)) {
    showCustomToast({ type: "warning", message: "头像未发生变化" });
    return;
  }

  isSaving.value = true;

  try {
    await updateUserInfo({ avatarUrl: selectedAvatarUrl.value });
    await auth.updateInfo();
    showCustomToast({ type: "success", message: "头像修改成功" });
    router.back();
  } catch {
    return;
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  if (!auth.token) {
    router.replace("/home/login");
  }
});
</script>

<template>
  <div class="update-avatar-page">
    <sub-navbar title="更换头像" />

    <main class="update-avatar-content">
      <div class="gender-tabs" role="tablist" aria-label="头像性别">
        <button
          type="button"
          class="gender-tab"
          :class="{ active: activeGender === 'male' }"
          role="tab"
          :aria-selected="activeGender === 'male'"
          @click="handleGenderChange('male')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14.1 3h6.9v6.9h-2.3V6.93l-3.12 3.12a7 7 0 1 1-1.63-1.63l3.12-3.12H14.1V3ZM10 9a4.7 4.7 0 1 0 0 9.4A4.7 4.7 0 0 0 10 9Z"
            />
          </svg>
          <span>男</span>
        </button>
        <button
          type="button"
          class="gender-tab"
          :class="{ active: activeGender === 'female' }"
          role="tab"
          :aria-selected="activeGender === 'female'"
          @click="handleGenderChange('female')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2a7 7 0 0 1 1.15 13.9V18h2.6v2.2h-2.6V23h-2.3v-2.8h-2.6V18h2.6v-2.1A7 7 0 0 1 12 2Zm0 2.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Z"
            />
          </svg>
          <span>女</span>
        </button>
      </div>

      <div class="avatar-scroll">
        <ul class="avatar-list">
          <li v-for="(avatarUrl, index) in avatarList" :key="avatarUrl">
            <button
              type="button"
              class="avatar-option"
              :class="{ active: isSelected(avatarUrl) }"
              :aria-label="`选择第${index + 1}个${activeGender === 'male' ? '男' : '女'}头像`"
              :aria-pressed="isSelected(avatarUrl)"
              @click="selectedAvatarUrl = avatarUrl"
            >
              <img :src="avatarUrl" :alt="`头像${index + 1}`" loading="lazy" @error="handleImageError" />
              <span v-if="isSelected(avatarUrl)" class="selected-mark" aria-hidden="true">
                <svg viewBox="0 0 20 15">
                  <path d="M1.5 7.6 7.1 12.4 18.5 1.5" />
                </svg>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </main>

    <footer class="update-avatar-footer">
      <x-button type="primary" :loading="isSaving" @click="handleSave">保 存</x-button>
    </footer>
  </div>
</template>

<style scoped lang="less">
.update-avatar-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.update-avatar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: 10px;
  overflow: hidden;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px rgb(0 0 0 / 6%);
}

.gender-tabs {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 25px;
  margin: 15px auto 20px;
}

.gender-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 60px;
  height: 25px;
  padding: 0 9px;
  border: 1px solid var(--skin__border);
  border-radius: 13px;
  color: var(--skin__neutral_1);
  font-family: inherit;
  font-size: 11px;
  line-height: 25px;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;

  svg {
    flex-shrink: 0;
    width: 11px;
    height: 11px;
    fill: currentColor;
  }

  &:first-child:not(.active) svg {
    color: #18a8e0;
    transform: scale(1.5);
  }

  &:last-child:not(.active) svg {
    color: #ff5662;
  }

  &.active {
    border-color: transparent;
    color: var(--skin__text_primary);
    background: var(--skin__primary);
  }
}

.avatar-scroll {
  flex: 1;
  width: 293px;
  max-width: calc(100% - 20px);
  min-height: 0;
  margin: 0 auto;
  overflow-y: auto;
}

.avatar-list {
  display: grid;
  grid-template-columns: repeat(4, 50px);
  justify-content: space-between;
  row-gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.avatar-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  &.active {
    border: 1px solid var(--skin__primary);
  }
}

.selected-mark {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  color: var(--skin__web_filter_gou, var(--skin__text_primary));
  background: var(--skin__filter_active, var(--skin__primary));

  svg {
    width: 7px;
    height: 5px;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
  }
}

.update-avatar-footer {
  flex-shrink: 0;
  min-height: calc(65px + var(--skin__safe-area-inset-bottom));
  padding: 10px 10px 20px;
  background: var(--skin__bg_2);
  box-shadow: 0 -1.5px 5px rgb(0 0 0 / 10%);
  box-sizing: border-box;

  :deep(button) {
    width: 100%;
    height: 35px;
    font-size: 13px;
  }

  :deep(.ui-button--primary) {
    color: var(--skin__text_primary);
  }
}
</style>
