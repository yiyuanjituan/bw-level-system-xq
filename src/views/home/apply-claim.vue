<script setup lang="ts">
import { $t } from "@/locales";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import SubNavbar from "@/components/SubNavbar.vue";
import Copy from "@/components/Common/Copy.vue";
import XInput from "@/components/X/x-input.vue";
import XSelect from "@/components/X/x-select.vue";
import XUpload, { type XUploadFileItem } from "@/components/X/x-upload.vue";
import XButton from "@/components/X/x-button.vue";
import UiEmpty from "@/components/UI/empty.vue";
import useAuthStore from "@/store/modules/user";
import { showCustomToast } from "@/hooks/useCommon";
import ClaimDateRangePicker from "./claim/ClaimDateRangePicker.vue";
import { createClaimDefaultRange, type ClaimDateRangeValue } from "./claim/types";

const router = useRouter();
const auth = useAuthStore();

const claimType = ref("");
const claimOrder = ref("");
const claimRange = ref<ClaimDateRangeValue | null>(createClaimDefaultRange());
const claimAmount = ref("");
const notifyEmail = ref("");
const reason = ref("");
const proofFiles = ref<XUploadFileItem[]>([]);
const withdrawPassword = ref("");
const isSubmitting = ref(false);
const isPasswordVisible = ref(false);
const showPasswordKeyboard = ref(false);
const showClaimOrderDialog = ref(false);
const claimContentRef = ref<HTMLElement | null>(null);
const passwordSectionRef = ref<HTMLElement | null>(null);

const claimTypeOptions = [
  { value: "principal", label: "被判定违规，申请退还本金理赔" },
  { value: "fake-payout", label: "虚假人工出款理赔" },
  { value: "abnormal-deduction", label: "被人工异常扣款理赔" },
  { value: "large-withdrawal", label: "大额提现被拒理赔" },
  { value: "stolen-funds", label: "账号资金被盗理赔" },
  { value: "site-closed", label: "网站永久性关闭退还本金理赔" }
];

const claimCriteriaMap: Record<string, { conditions: string[]; reminder: string }> = {
  principal: {
    conditions: [
      "1. 若近30天内，有提现被拒绝或被强制取消记录、人工扣款记录，存在人工扣款记录、账号被冻结或列入黑名单、被禁止进入游戏、被禁止提现等其中的任意一项才能申请。",
      "2. 累计充值＞累计提现（含手续费），申请理赔金额 ≤ 累计充提差额，且 ≤ 当前余额。"
    ],
    reminder:
      "理赔提交后将从账户当前余额扣除相应的理赔金额，申请理赔成功后，将收取理赔金额0-25%的手续费作为第三方支付和第三方游戏成本。若被风控系统识别为“一机多号、团伙性套利、恶意代码或专业刷客”等专业性违规，则该账号的理赔将不被受理。"
  },
  "fake-payout": {
    conditions: [
      "1. 近30天的提现记录中，若有超过72小时未到账或有被人工强制出款的记录。",
      "2. 账号历史至少有一次提现成功的记录，或其他能证明当前收款账号资料准确无误的证明。",
      "3. 当前账号没有投注任务要求，即已完成所有投注任务。",
      "4. 申请理赔金额 ≤ 该次虚假出款金额。"
    ],
    reminder: "同笔提现订单理赔过后，不能再重复申请。"
  },
  "abnormal-deduction": {
    conditions: [
      "1. 近30天的账变记录中，存在人工扣款记录。",
      "2. 申请理赔金额只能等于人工扣款记录合计。",
      "3. 账号未触发风控行为，与平台客服协商后仍被拒绝才能申请。"
    ],
    reminder: "已理赔过的异常扣款，不能再发起新的理赔。"
  },
  "large-withdrawal": {
    conditions: [
      "1. 若近30天提现记录中，存在被取消/拒绝的记录。",
      "2. 申请理赔金额只能等于提现订单金额。",
      "3. 账号未触发风控行为，且当前无投注任务、充值任务和提现任务。",
      "4. 与平台客服协商仍被拒绝才能申请。"
    ],
    reminder: "同笔提现订单理赔过后，不能再重复申请。"
  },
  "stolen-funds": {
    conditions: [
      "1. 若被盗前设置了提现密码+开通两步验证（即绑定手机、邮箱或Google验证器）和绑定真实姓名，依然被盗。",
      "2. 近30天内，存在非本人实名的提现订单（即收款人不是本人实名）。"
    ],
    reminder: "已理赔过的被盗提现订单，不能再发起新的理赔。"
  }
};

const account = computed(() => String(auth.user.account || auth.user.unionid || "--"));
const balance = computed(() => Number(auth.user.money || 0).toFixed(2));
const activeClaimCriteria = computed(() => claimCriteriaMap[claimType.value] || null);
const requiresClaimOrder = computed(() =>
  ["fake-payout", "abnormal-deduction", "large-withdrawal", "stolen-funds"].includes(claimType.value)
);

function validateProofFile(file: File) {
  const isImage = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
  const isVideo = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
  if (!isImage && !isVideo) {
    showCustomToast({ type: "warning", message: $t("仅支持PNG、JPG、JPEG图片或MP4视频") });
    return false;
  }

  const maxSize = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
  if (file.size > maxSize) {
    showCustomToast({ type: "warning", message: isVideo ? "视频不能超过100MB" : "图片不能超过2MB" });
    return false;
  }

  return true;
}

function handleUploadExceed() {
  showCustomToast({ type: "warning", message: $t("最多上传15个证明材料") });
}

async function handlePasteReason() {
  if (!navigator.clipboard?.readText) {
    showCustomToast({ type: "warning", message: $t("当前环境不支持读取剪贴板") });
    return;
  }

  try {
    const clipboardText = await navigator.clipboard.readText();
    reason.value = `${reason.value}${clipboardText}`.slice(0, 1000);
  } catch {
    showCustomToast({ type: "warning", message: $t("读取剪贴板失败，请手动输入") });
  }
}

async function showPasswordInput() {
  showPasswordKeyboard.value = true;
  await nextTick();

  window.requestAnimationFrame(() => {
    const contentElement = claimContentRef.value;
    const passwordElement = passwordSectionRef.value;
    if (!contentElement || !passwordElement) return;

    const contentRect = contentElement.getBoundingClientRect();
    const passwordRect = passwordElement.getBoundingClientRect();
    contentElement.scrollTo({
      top: contentElement.scrollTop + passwordRect.top - contentRect.top - 10,
      behavior: "smooth"
    });
  });
}

function hidePasswordInput() {
  showPasswordKeyboard.value = false;
}

function openClaimOrderDialog() {
  showClaimOrderDialog.value = true;
}

function closeClaimOrderDialog() {
  showClaimOrderDialog.value = false;
}

function handleSubmit() {
  if (!claimType.value) {
    showCustomToast({ type: "warning", message: $t("请选择理赔类型") });
    return;
  }
  if (!claimRange.value) {
    showCustomToast({ type: "warning", message: $t("请选择日期范围") });
    return;
  }
  if (requiresClaimOrder.value && !claimOrder.value) {
    showCustomToast({ type: "warning", message: $t("请选择理赔订单") });
    return;
  }
  if (!reason.value.trim()) {
    showCustomToast({ type: "warning", message: $t("请输入申请理由") });
    return;
  }
  if (!proofFiles.value.length) {
    showCustomToast({ type: "warning", message: $t("请添加图片或视频证明材料") });
    return;
  }
  if (!/^\d{6}$/.test(withdrawPassword.value)) {
    showCustomToast({ type: "warning", message: $t("请输入6位提现密码") });
    return;
  }

  hidePasswordInput();
  isSubmitting.value = true;
  window.setTimeout(() => {
    isSubmitting.value = false;
    showCustomToast({ type: "warning", message: $t("暂无可理赔金额") });
  }, 300);
}

onMounted(() => {
  if (!auth.token) return;
  auth.updateInfo().catch(() => undefined);
});

watch(claimType, () => {
  claimOrder.value = "";
  showClaimOrderDialog.value = false;
});
</script>

<template>
  <main class="apply-claim-page">
    <SubNavbar :title="$t('申请理赔')">
      <template #right>
        <button class="apply-claim-header__rules" type="button" @click="router.push('/home/claim?active=2')">
          理赔规则
        </button>
      </template>
    </SubNavbar>

    <section
      ref="claimContentRef"
      class="apply-claim-page__content"
      :class="{ 'apply-claim-page__content--keyboard-open': showPasswordKeyboard }"
    >
      <div class="apply-claim-account-bar">
        <div class="apply-claim-account-bar__user">
          <span>会员账号</span>
          <strong>{{ account }}</strong>
          <copy :text="account" class="apply-claim-account-bar__copy" />
        </div>
        <div class="apply-claim-account-bar__balance">
          <svg-icon name="input_icon_hb" class-name="apply-claim-account-bar__currency" />
          <span>{{ balance }}</span>
          <button type="button" :aria-label="$t('刷新余额')" @click="auth.updateInfo()">
            <svg-icon name="comm_icon_sx" />
          </button>
        </div>
      </div>

      <form class="apply-claim-form" novalidate @submit.prevent="handleSubmit">
        <div class="apply-claim-form__field">
          <label class="apply-claim-form__label"><span>*</span>理赔类型</label>
          <x-select
            v-model="claimType"
            class="apply-claim-form__control"
            required
            prefix="input_icon_bank"
            :placeholder="$t('请选择理赔类型')"
            :options="claimTypeOptions"
            value-key="value"
            label-key="label"
            placement="bottom"
          />
        </div>

        <div v-if="activeClaimCriteria" class="apply-claim-criteria">
          <span class="apply-claim-criteria__title">申请条件：</span>
          <p v-for="condition in activeClaimCriteria.conditions" :key="condition">{{ condition }}</p>
          <div class="apply-claim-criteria__reminder">
            <svg-icon name="comm_icon_zyts" />
            <span class="apply-claim-criteria__reminder-title">重要提醒：</span>
            <span>{{ activeClaimCriteria.reminder }}</span>
          </div>
        </div>

        <div class="apply-claim-form__field">
          <label class="apply-claim-form__label"><span>*</span>日期范围</label>
          <ClaimDateRangePicker v-model="claimRange" />
        </div>

        <div v-if="requiresClaimOrder" class="apply-claim-form__field">
          <label class="apply-claim-form__label"><span>*</span>理赔订单</label>
          <button type="button" class="apply-claim-order-trigger" @click="openClaimOrderDialog">
            <span class="apply-claim-order-trigger__prefix">
              <svg-icon name="comm_icon_cz_jl" />
              <span>*</span>
            </span>
            <span :class="claimOrder ? 'apply-claim-order-trigger__value' : 'apply-claim-order-trigger__placeholder'">
              {{ claimOrder || "请选择理赔订单" }}
            </span>
            <svg-icon name="comm_icon_fh" class-name="apply-claim-order-trigger__arrow" />
          </button>
        </div>

        <div class="apply-claim-form__field">
          <label class="apply-claim-form__label"><span>*</span>理赔金额</label>
          <x-input
            v-model="claimAmount"
            prefix="input_icon_hb"
            :placeholder="$t('请输入理赔金额')"
          />
        </div>

        <div class="apply-claim-form__field">
          <label class="apply-claim-form__label">接收通知邮箱</label>
          <x-input v-model="notifyEmail" prefix="security_email" :placeholder="$t('请输入接收通知邮箱')" />
        </div>
        <p class="apply-claim-email-tips">
          请务必填写真实邮箱地址，并将官方邮箱<b>gc@no.com</b><copy :text="'gc@no.com'" class="apply-claim-email-tips__copy" />
          <b>添加为您的邮箱收件人或白名单</b>，以便我们及时通知您关于该理赔申请的最新进度信息。
        </p>

        <div class="apply-claim-reason">
          <textarea v-model="reason" maxlength="1000" :placeholder="$t('请输入申请理由(详情描述，最多1000字)')"></textarea>
          <span>*</span>
          <button type="button" @click="handlePasteReason">粘贴</button>
          <p>{{ reason.length }}/1000字</p>
        </div>

        <div class="apply-claim-upload">
          <div class="apply-claim-upload__title"><span>*</span><strong>添加图片/视频</strong><em>{{ $t("（可上传") }}{{ proofFiles.length }}/15）</em></div>
          <x-upload
            v-model="proofFiles"
            accept="image/png,image/jpeg,image/jpg,.mp4"
            multiple
            :max-count="15"
            :max-size="100 * 1024 * 1024"
            upload-text=""
            :before-upload="validateProofFile"
            @exceed="handleUploadExceed"
          />
          <p>{{ $t("图片仅限png、jpg、jpeg格式，每张不超过2MB视频限单个不超过100MB") }}</p>
        </div>

        <div ref="passwordSectionRef" class="apply-claim-password">
          <div class="apply-claim-password__label">
            <span>{{ $t("验证提现密码") }}</span>
            <button type="button" :aria-label="$t('显示或隐藏提现密码')" @click="isPasswordVisible = !isPasswordVisible">
              <svg-icon :name="isPasswordVisible ? 'comm_icon_show' : 'comm_icon_hide'" />
            </button>
          </div>
          <div
            class="apply-claim-password__input"
            :class="{ 'apply-claim-password__input--focused': showPasswordKeyboard }"
          >
            <x-password-input
              :mask="!isPasswordVisible"
              :value="withdrawPassword"
              :focused="showPasswordKeyboard"
              @focus="showPasswordInput"
            />
          </div>
        </div>

        <teleport to="body">
          <div class="apply-claim-password__keyboard">
            <x-number-keyboard
              v-model="withdrawPassword"
              :maxlength="6"
              :show="showPasswordKeyboard"
              @blur="hidePasswordInput"
            />
          </div>
        </teleport>

        <p class="apply-claim-kind-tips">{{ $t("温馨提示 : 请如实填写申请，虚假或恶意提交申请，会被暂停或永久禁止申请理赔资格。") }}</p>

        <div class="apply-claim-actions">
          <x-button plain type="primary" disabled>{{ $t("保存草稿") }}</x-button>
          <x-button native-type="submit" type="primary" :loading="isSubmitting">{{ $t("提 交") }}</x-button>
        </div>
      </form>
    </section>

    <van-dialog
      v-model:show="showClaimOrderDialog"
      :show-confirm-button="false"
      :show-cancel-button="false"
      class-name="claim-order-dialog"
      teleport="body"
      :overlay-style="{ backdropFilter: 'blur(5px)' }"
    >
      <div class="claim-order-dialog__body">
        <div class="claim-order-dialog__header">{{ $t("理赔提现订单") }}</div>
        <div class="claim-order-dialog__content">
          <ul class="claim-order-dialog__table-head">
            <li>{{ $t("时间") }}</li>
            <li>{{ $t("订单编号（金额）") }}</li>
          </ul>
          <div class="claim-order-dialog__empty">
            <UiEmpty :text="$t('暂无记录')" />
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="claim-order-dialog__close" :aria-label="$t('关闭理赔订单')" @click="closeClaimOrderDialog">
          <svg-icon name="close" />
        </button>
      </template>
    </van-dialog>
  </main>
</template>

<style scoped lang="less">
.apply-claim-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.apply-claim-header__rules {
  height: 45px;
  padding: 0;
  border: 0;
  color: var(--skin__primary);
  font-size: 11px;
  background: transparent;
}

.apply-claim-page__content {
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.apply-claim-page__content--keyboard-open {
  padding-bottom: calc(230px + env(safe-area-inset-bottom));
}

.apply-claim-account-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--skin__bg_2);
  border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
}

.apply-claim-account-bar__user,
.apply-claim-account-bar__balance {
  display: flex;
  align-items: center;
  min-width: 0;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.apply-claim-account-bar__user strong {
  max-width: 120px;
  margin: 0 7px;
  overflow: hidden;
  color: var(--skin__lead);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply-claim-account-bar__copy {
  flex-shrink: 0;
  font-size: 15px;
}

.apply-claim-account-bar__balance {
  gap: 5px;
  color: var(--skin__lead);
  direction: ltr;
}

.apply-claim-account-bar__currency {
  width: 15px;
  height: 15px;
  color: var(--skin__primary);
}

.apply-claim-account-bar__balance button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  color: var(--skin__primary);
  background: transparent;
}

.apply-claim-account-bar__balance button svg {
  width: 15px;
  height: 15px;
}

.apply-claim-form {
  padding: 10px;
}

.apply-claim-form__field {
  margin-bottom: 10px;

  :deep(.van-popover__wrapper) {
    width: 100%;
  }
}

.apply-claim-form__label {
  display: block;
  margin-bottom: 6px;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.apply-claim-form__label span,
.apply-claim-reason > span,
.apply-claim-upload__title > span {
  margin-right: 4px;
  color: var(--skin__accent_2);
}

.apply-claim-criteria {
  margin: -2px 8px 14px;
  color: var(--skin__lead);
  font-size: 11px;
  line-height: 1.5;
}

.apply-claim-criteria__title {
  display: inline-block;
  font-weight: 700;
  line-height: 1.6;
}

.apply-claim-criteria p {
  margin: 0;
  line-height: 1.6;
}

.apply-claim-criteria__reminder {
  display: block;
  color: var(--skin__lead);
  line-height: 1.6;
}

.apply-claim-criteria__reminder svg {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  color: var(--skin__accent_3);
  vertical-align: -3px;
}

.apply-claim-criteria__reminder-title {
  white-space: nowrap;
  color: var(--skin__accent_3);
  font-weight: 700;
}

.apply-claim-form__control,
.apply-claim-form__field :deep(.x-input-wrapper) {
  width: 100%;
}

.apply-claim-order-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  height: 35px;
  padding: 0 11px 0 10px;
  color: var(--skin__lead);
  font-family: inherit;
  font-size: 11px;
  text-align: left;
  background: var(--skin__bg_2);
  border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
  border-radius: 7px;
  box-sizing: border-box;
}

.apply-claim-order-trigger__prefix {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  margin-right: 7px;
}

.apply-claim-order-trigger__prefix svg {
  width: 15px;
  height: 15px;
  color: var(--skin__neutral_2);
}

.apply-claim-order-trigger__prefix span {
  margin-left: 5px;
  color: var(--skin__accent_2);
}

.apply-claim-order-trigger__placeholder,
.apply-claim-order-trigger__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apply-claim-order-trigger__placeholder {
  color: var(--skin__neutral_3);
}

.apply-claim-order-trigger__value {
  color: var(--skin__lead);
}

.apply-claim-order-trigger__arrow {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  color: var(--skin__neutral_2);
  transform: rotate(180deg);
}

.apply-claim-form__field :deep(.x-select),
.apply-claim-form__field :deep(.x-input-wrapper) {
  height: 35px;
  border-radius: 7px;
}

.apply-claim-form__field--disabled {
  opacity: 0.65;
}

.apply-claim-email-tips,
.apply-claim-upload p,
.apply-claim-kind-tips {
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 1.5;
}

.apply-claim-email-tips {
  margin: -2px 0 14px;
}

.apply-claim-email-tips b {
  color: var(--skin__lead);
  font-weight: 400;
}

.apply-claim-email-tips__copy {
  display: inline-flex;
  margin: 0 3px -2px;
  color: var(--skin__primary);
  font-size: 15px;
}

.apply-claim-reason {
  position: relative;
  margin-bottom: 22px;
}

.apply-claim-reason textarea {
  display: block;
  width: 100%;
  height: 100px;
  padding: 10px 50px 20px 22px;
  border: var(--lobby__px, 0.5px) solid var(--skin__neutral_3);
  border-radius: 5px;
  color: var(--skin__lead);
  font-family: inherit;
  font-size: 11px;
  resize: none;
  background: var(--skin__bg_2);
  box-sizing: border-box;
}

.apply-claim-reason textarea::placeholder {
  color: var(--skin__neutral_3);
}

.apply-claim-reason > span {
  position: absolute;
  top: 11px;
  left: 10px;
}

.apply-claim-reason button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0;
  border: 0;
  color: var(--skin__primary);
  font-size: 11px;
  background: transparent;
}

.apply-claim-reason p {
  position: absolute;
  right: 0;
  bottom: -17px;
  margin: 0;
  color: var(--skin__neutral_2);
  font-size: 10px;
}

.apply-claim-upload__title {
  margin-bottom: 8px;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.apply-claim-upload__title strong {
  color: var(--skin__lead);
  font-weight: 400;
}

.apply-claim-upload__title em {
  font-style: normal;
}

.apply-claim-upload :deep(.x-upload__list) {
  gap: 8px;
}

.apply-claim-upload :deep(.x-upload__item),
.apply-claim-upload :deep(.x-upload__trigger) {
  width: 60px;
  height: 60px;
  border-radius: 0;
}

.apply-claim-upload :deep(.x-upload__trigger) {
  border-style: solid;
}

.apply-claim-upload :deep(.x-upload__trigger-plus) {
  color: var(--skin__neutral_2);
}

.apply-claim-upload p {
  margin: 8px 0 18px;
}

.apply-claim-password {
  padding-top: 12px;
  border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
}

.apply-claim-password__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--skin__lead);
  font-size: 12px;
}

.apply-claim-password__label button {
  display: inline-flex;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
}

.apply-claim-password__label svg {
  width: 16px;
  height: 16px;
}

.apply-claim-password__keyboard {
  position: absolute;
  z-index: 99999;
}

.apply-claim-kind-tips {
  margin: 12px 0 16px;
  color: var(--skin__lead);
}

.apply-claim-actions {
  display: flex;
  gap: 10px;
}

.apply-claim-actions :deep(.x-button) {
  flex: 1;
  width: auto;
  height: 35px;
}

.claim-order-dialog__body {
  width: 100%;
  overflow: hidden;
  color: var(--skin__lead);
  background: var(--skin__bg_2);
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 10px;
  box-sizing: border-box;
}

.claim-order-dialog__header {
  padding: 10px 15px 15px;
  color: var(--skin__lead);
  font-size: 15px;
  line-height: 1.5;
  text-align: center;
}

.claim-order-dialog__content {
  min-height: 300px;
  padding: 0 10px;
  box-sizing: border-box;
}

.claim-order-dialog__table-head {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0;
  margin: 0;
  color: var(--skin__lead);
  font-size: 12px;
  list-style: none;
  border-top: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);
}

.claim-order-dialog__table-head li {
  flex: 1;
  text-align: center;
}

.claim-order-dialog__table-head li:last-child {
  text-align: left;
}

.claim-order-dialog__empty {
  height: 260px;
}

.claim-order-dialog__empty :deep(.empty-box) {
  padding-bottom: 0;
}

.claim-order-dialog__empty :deep(.ui-empty-box) {
  margin-top: 30px;
}

.claim-order-dialog__empty :deep(.empty-text) {
  margin-bottom: 0;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

.claim-order-dialog__close {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  width: 45px;
  height: 45px;
  padding: 15px 0 0;
  color: var(--skin__lead);
  background: transparent;
  border: 0;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
}

.claim-order-dialog__close svg {
  width: 30px;
  height: 30px;
}
</style>
