<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";
import { updateUserInfo, type UpdateUserInfoPayload } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import useAppStore from "@/store/modules/app";
import router from "@/router";
import { handleBack } from "@/utils/common";
import XDatePicker from "@/components/X/x-date-picker.vue";
import type { XFormRules } from "@/components/X/x-form-context";
import XInput from "@/components/X/x-input.vue";
import XSelect from "@/components/X/x-select.vue";
import wechatIcon from "@/assets/setting/wechat.avif";
import whatsappIcon from "@/assets/setting/whatsapp.avif";
import telegramIcon from "@/assets/setting/telegram.avif";
import defaultAvatarUrl from "@/assets/setting/default-avatar.avif";
import vipImage from "@/assets/setting/vip.avif";
import verifiedIcon from "@/assets/setting/verified.avif";

type SettingForm = Required<Pick<
  Eps.UserInfoEntity,
  "avatarUrl" | "nickName" | "showAccount" | "wechat" | "whatsapp" | "telegram" | "birthday"
>>;

const EMPTY_FORM: SettingForm = {
  avatarUrl: "",
  nickName: "",
  showAccount: 1,
  wechat: "",
  whatsapp: "",
  telegram: "",
  birthday: ""
};

const auth = useAuthStore();
const app = useAppStore();
const form = reactive<SettingForm>({ ...EMPTY_FORM });
const originalForm = ref<SettingForm>({ ...EMPTY_FORM });
const isSaving = ref(false);
const isNicknameEditing = ref(false);
const avatarLoadFailed = ref(false);
const formRef = ref<{
  validate: (fields?: string | string[]) => Promise<void>;
  clearValidate: (fields?: string | string[]) => void;
} | null>(null);
const formRules: XFormRules = {
  nickName: [
    {
      validator: (_rule, value, callback) => {
        if (!String(value ?? "").trim()) {
          callback(new Error("昵称不能为空"));
          return;
        }
        callback();
      },
      trigger: ["input", "blur", "change"]
    },
    { max: 20, message: "昵称不能超过20个字符", trigger: ["input", "blur", "change"] }
  ]
};

const currencyInfo = computed(() => {
  return app.appInfo?.countryList?.find(country => country.id == auth.user.currencyId);
});

const maskedPhone = computed(() => {
  const phone = String(auth.user.phone ?? "");
  const numberPrefix = String(currencyInfo.value?.numberPrefix ?? "").replace(/^\+/, "");

  if (!phone) {
    return "";
  }

  return `${numberPrefix ? `+${numberPrefix} ` : ""}**${phone.slice(-3)}`;
});

const displayOptions = computed(() => {
  return [
    { id: 1, label: String(auth.user.account || "--"), svgIcon: "input_icon_zh" },
    ...(auth.user.phone ? [{ id: 2, label: maskedPhone.value, svgIcon: "input_icon_sj" }] : []),
    { id: 0, label: String(auth.user.unionid || "--"), title: "ID" }
  ];
});

const avatarUrl = computed(() => {
  return form.avatarUrl && !avatarLoadFailed.value ? form.avatarUrl : defaultAvatarUrl;
});

const maximumBirthday = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const minimumBirthdayDate = new Date(1896, 0, 1);
const maximumBirthdayDate = computed(() => {
  const [year, month, day] = maximumBirthday.value.split("-").map(Number);
  return new Date(year, month - 1, day);
});

const hasBoundBirthday = computed(() => Boolean(originalForm.value.birthday));

function normalizeDate(value: unknown) {
  return value ? String(value).slice(0, 10) : "";
}

function getUserForm(): SettingForm {
  const canShowPhone = Boolean(auth.user.phone);
  const showAccount = Number(auth.user.showAccount);
  const hasValidShowAccount = showAccount === 0 || showAccount === 1 || (showAccount === 2 && canShowPhone);

  return {
    avatarUrl: String(auth.user.avatarUrl ?? ""),
    nickName: String(auth.user.nickName ?? ""),
    showAccount: hasValidShowAccount ? showAccount : 1,
    wechat: String(auth.user.wechat ?? ""),
    whatsapp: String(auth.user.whatsapp ?? ""),
    telegram: String(auth.user.telegram ?? ""),
    birthday: normalizeDate(auth.user.birthday)
  };
}

function syncForm() {
  const userForm = getUserForm();
  Object.assign(form, userForm);
  originalForm.value = { ...userForm };
  isNicknameEditing.value = false;
  formRef.value?.clearValidate("nickName");
}

function handleBindPhone() {
  if (auth.user.phone) return;
  router.push("/home/security?active=0");
}

async function finishNicknameEditing() {
  try {
    await formRef.value?.validate("nickName");
  } catch {
    return;
  }

  isNicknameEditing.value = false;
}

function buildUpdatePayload() {
  const payload: UpdateUserInfoPayload = {};
  const nickName = form.nickName.trim();
  const wechat = form.wechat.trim();
  const whatsapp = form.whatsapp.trim();
  const telegram = form.telegram.trim();

  if (form.avatarUrl !== originalForm.value.avatarUrl) payload.avatarUrl = form.avatarUrl;
  if (nickName !== originalForm.value.nickName) payload.nickName = nickName;
  if (form.showAccount !== originalForm.value.showAccount) payload.showAccount = form.showAccount;
  if (wechat !== originalForm.value.wechat) payload.wechat = wechat;
  if (whatsapp !== originalForm.value.whatsapp) payload.whatsapp = whatsapp;
  if (telegram !== originalForm.value.telegram) payload.telegram = telegram;
  if (!hasBoundBirthday.value && form.birthday) payload.birthday = form.birthday;

  return payload;
}

async function handleSave() {
  if (!form.nickName.trim()) {
    isNicknameEditing.value = true;
  }

  try {
    await formRef.value?.validate("nickName");
  } catch {
    return;
  }

  if (form.birthday && form.birthday > maximumBirthday.value) {
    showCustomToast({ type: "warning", message: "用户需年满18周岁" });
    return;
  }

  const payload = buildUpdatePayload();

  if (!Object.keys(payload).length) {
    showCustomToast({ type: "warning", message: "暂无需要保存的修改" });
    return;
  }

  isSaving.value = true;

  try {
    await updateUserInfo(payload);
    await auth.updateInfo();
    syncForm();
    showCustomToast({ type: "success", message: "用户信息保存成功" });
  } catch {
    return;
  } finally {
    isSaving.value = false;
  }
}

watch(
  () => auth.user,
  () => {
    syncForm();
    avatarLoadFailed.value = false;
  },
  { immediate: true }
);

onMounted(() => {
  if (!auth.token) {
    router.replace("/home/login");
  }
});
</script>

<template>
  <div class="setting-page">
    <sub-navbar title="设置用户信息" />

    <main class="setting-content">
      <x-form ref="formRef" :rule="formRules" :model="form">
        <section class="profile-card">
          <button
            type="button"
            class="avatar-area"
            aria-label="更换头像"
            @click="router.push('/home/setting/updateAvator')"
          >
            <van-image
              round
              width="55px"
              height="55px"
              :src="avatarUrl"
              @error="avatarLoadFailed = true"
            />
            <span class="avatar-edit-icon">
              <svg-icon name="icon_grzl" class-name="avatar-edit-svg text-[20px]" />
            </span>
            <span class="avatar-vip-wrap">
              <span class="avatar-vip-badge">
                <img :src="vipImage" alt="VIP" />
                <span>{{ Number(auth.user.level) || 0 }}</span>
              </span>
            </span>
          </button>

          <div class="profile-info">
            <div class="user-id">
              <span>ID：</span>
              <strong>{{ auth.user.unionid || "--" }}</strong>
              <copy :text="String(auth.user.unionid ?? '')" class-name="copy-icon" />
            </div>
            <div class="nickname-field">
              <span class="nickname-label">昵称:</span>
              <x-form-item prop="nickName" class="nickname-content nickname-form-item">
                <button
                  v-if="!isNicknameEditing"
                  type="button"
                  class="nickname-display"
                  :class="{ 'has-nickname': form.nickName }"
                  @click="isNicknameEditing = true"
                >
                  <span>{{ form.nickName || "请输入昵称" }}</span>
                  <svg-icon name="login_icon_bj" class-name="nickname-edit-icon" />
                </button>
                <x-input
                  v-elseq
                  v-model="form.nickName"
                  class="nickname-input"
                  :maxlength="20"
                  placeholder="请输入昵称"
                  autofocus
                  @keydown.enter.prevent="finishNicknameEditing"
                >
                  <template #suffix>
                    <img
                      :src="verifiedIcon"
                      class="nickname-verified-icon"
                      alt="完成昵称编辑"
                      @click.stop="finishNicknameEditing"
                    />
                  </template>
                </x-input>
              </x-form-item>
            </div>
          </div>
        </section>
      </x-form>

      <section class="setting-section">
        <h2>默认展示信息</h2>
        <div class="setting-select">
          <x-select v-model="form.showAccount" :options="displayOptions">
            <template #prefix>
              <svg-icon name="input_icon_zh" class-name="setting-input-svg setting-input-svg--small" />
            </template>
            <template #suffix>
              <svg-icon name="comm_icon_fh" class-name="setting-arrow" />
            </template>
          </x-select>
        </div>

        <div class="phone-label">绑定手机</div>
        <x-input
          :model-value="String(auth.user.phone ?? '')"
          class="setting-input readonly-input"
          :class="{ 'readonly-input--actionable': !auth.user.phone }"
          placeholder="请绑定手机"
          readonly
          @click="handleBindPhone"
        >
          <template #prefix>
            <svg-icon name="input_icon_sj" class-name="setting-input-svg setting-input-svg--small" />
          </template>
        </x-input>
      </section>

      <section class="setting-section">
        <h2>第三方账号绑定</h2>
        <x-input v-model="form.wechat" class="setting-input" :maxlength="50" placeholder="请输入微信号">
          <template #prefix>
            <img :src="wechatIcon" class="setting-input-icon" alt="微信" />
          </template>
        </x-input>
        <x-input v-model="form.whatsapp" class="setting-input" :maxlength="50" placeholder="请输入WhatsApp号">
          <template #prefix>
            <img :src="whatsappIcon" class="setting-input-icon" alt="WhatsApp" />
          </template>
        </x-input>
        <x-input
          v-model="form.telegram"
          class="setting-input"
          :maxlength="50"
          placeholder="请输入Telegram账号，例如@xxxx"
        >
          <template #prefix>
            <img :src="telegramIcon" class="setting-input-icon" alt="Telegram" />
          </template>
        </x-input>

        <div class="birthday-title">
          <span>生日</span>
          <small>（设置后不能修改）</small>
        </div>
        <x-date-picker
          v-model="form.birthday"
          class="birthday-row"
          :disabled="hasBoundBirthday"
          :min-date="minimumBirthdayDate"
          :max-date="maximumBirthdayDate"
          suffix-icon-name="comm_icon_fh"
        />
        <p class="birthday-tip">系统要求满18周岁才能使用，即{{ maximumBirthday.replaceAll('-', '/') }}前出生。</p>
      </section>
    </main>

    <footer class="setting-footer">
      <x-button plain type="primary" @click="handleBack">返 回</x-button>
      <x-button type="primary" :loading="isSaving" @click="handleSave">保 存</x-button>
    </footer>
  </div>
</template>

<style scoped lang="less">
.setting-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.setting-content {
  flex: 1;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
}

.profile-card,
.setting-section {
  width: 100%;
  background: transparent;
}

.profile-card {
  display: flex;
  align-items: center;
  min-height: 55px;
  margin-bottom: 10px;
  padding: 0;
  font-size: 12px;
}

.avatar-area {
  position: relative;
  flex: 0 0 55px;
  width: 55px;
  height: 55px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.avatar-edit-icon {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--skin__bg_1);
  border-radius: 50%;
  background: var(--skin__primary);
  font-size: 12px;

  :deep(.avatar-edit-svg) {
    color: #fff;
  }
}

.avatar-vip-wrap {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 29px;
  height: 12px;
}

.avatar-vip-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 25px;
  max-width: 33px;
  height: 12px;
  padding: 0 2px;
  border-radius: 7px 0 5px;
  box-sizing: border-box;
  color: #fff;
  background: #24b299;

  img {
    width: 15px;
    height: 7px;
    object-fit: contain;
  }

  span {
    position: relative;
    top: 0.5px;
    margin-left: 1px;
    font-size: 9px;
    font-style: italic;
    line-height: 1;
  }
}

.profile-info {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  font-size: 12px;
}

.user-id,
.nickname-field {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 20px;
}

.user-id {
  color: var(--skin__neutral_2);

  strong {
    overflow: hidden;
    color: var(--skin__lead);
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.copy-icon) {
    margin-left: 5px;
    color: var(--skin__primary);
    font-size: 15px;
  }
}

.nickname-field {
  width: 100%;
  margin-top: 5px;
  color: var(--skin__neutral_2);
  align-items: flex-start;

  .nickname-label {
    flex-shrink: 0;
    height: 25px;
    line-height: 25px;
  }

  .nickname-content {
    flex: 1;
    min-width: 0;
    margin-left: 5px;
  }

  .nickname-display {
    display: flex;
    align-items: center;
    max-width: 100%;
    height: 25px;
    padding: 0;
    border: 0;
    color: var(--skin__neutral_2);
    font-family: inherit;
    font-size: 12px;
    line-height: 1;
    background: transparent;
    cursor: pointer;

    &.has-nickname {
      color: var(--skin__lead);
    }

    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.nickname-input.x-input-wrapper) {
    height: 25px;
    padding: 0 7px;
    border-color: var(--skin__neutral_3);
    border-radius: 7px;
    font-size: 12px;
    background: var(--skin__bg_2);
  }

  :deep(.nickname-edit-icon) {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin-left: 5px;
    color: var(--skin__primary);
  }

  .nickname-verified-icon {
    display: block;
    width: 16px;
    height: 16px;
    object-fit: contain;
    cursor: pointer;
  }

  .nickname-form-item {
    margin-bottom: 0;
  }
}

.setting-section {
  margin: 0;
  padding: 0;

  h2,
  .birthday-title {
    margin: 10px 0 5px;
    color: var(--skin__lead);
    font-size: 13px;
    font-weight: 400;
  }
}

.setting-input,
.setting-select {
  margin-bottom: 10px;
}

:deep(.setting-input.x-input-wrapper),
:deep(.setting-select .x-select) {
  border-color: var(--skin__neutral_3);
  border-radius: 7px;
  font-size: 12px;
  background: var(--skin__bg_2);
}

.setting-input-icon {
  display: block;
  width: 24px;
  height: 24px;
  margin-right: 3px;
  object-fit: contain;
}

.setting-input-svg {
  display: block;
  width: 24px;
  height: 24px;
  margin-right: 3px;
  color: var(--skin__neutral_2);
}

.setting-input-svg--small {
  width: 20px;
  height: 20px;
}

.setting-arrow {
  display: block;
  width: 7px;
  height: 11px;
  color: var(--skin__neutral_2);
  transform: rotate(180deg);
}

:deep(.setting-select .x-select__svg-icon) {
  width: 20px;
  height: 20px;
}

.phone-label {
  margin: 0 0 5px;
  color: var(--skin__lead);
  font-size: 13px;
}

:deep(.readonly-input.x-input-wrapper) {
  background: var(--skin__bg_1);
  cursor: default;
}

:deep(.readonly-input--actionable.x-input-wrapper) {
  cursor: pointer;
}

.birthday-title {
  padding-top: 0;

  small {
    color: var(--skin__neutral_2);
    font-size: 10px;
  }
}

.birthday-row {
  margin-bottom: 5px;
}

.birthday-tip {
  margin: 0;
  color: #ffaa09;
  font-size: 11px;
  line-height: 15px;
}

.setting-footer {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  min-height: calc(65px + var(--skin__safe-area-inset-bottom));
  box-sizing: border-box;
  padding: 10px 10px 20px;
  border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
  background: var(--skin__bg_2);
  box-shadow: 0 -2px 8px rgb(0 0 0 / 15%);

  :deep(button) {
    flex: 1;
    width: 172.5px;
    height: 35px;
    font-size: 13px;
  }

  :deep(.ui-button--primary:not(.ui-button--plain)) {
    color: var(--skin__text_primary);
  }
}
</style>
