<script setup lang="ts">
import { $t } from "@/locales";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  getPromoteInfo,
  getSpecialInviteData,
  receiveSpecialInviteReward,
  type SpecialInviteData,
  type SpecialInviteRule
} from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import rulesDecorationImage from "@/assets/home/event/invite/invite-rules-decoration.avif";
import PromoteInviteShare from "@/views/home/promote/components/PromoteInviteShare.vue";
import type { PromoteInfo } from "@/views/home/promote/types";
import InviteRewardRoadmap from "./InviteRewardRoadmap.vue";
import SpecialInviteMemberDialog from "./SpecialInviteMemberDialog.vue";

const router = useRouter();
const authStore = useAuthStore();
const promoteInfo = ref<PromoteInfo | null>(null);
const inviteData = ref<SpecialInviteData | null>(null);
const isLoading = ref(false);
const loadFailed = ref(false);
const receivingRewardId = ref<number | null>(null);
const validInviteDialogVisible = ref(false);

const isLoggedIn = computed(() => Boolean(authStore.token));
const rawDescription = computed(() => inviteData.value?.config.description || "");
const descriptionContent = computed(() =>
  rawDescription.value
    .replace(
      /<img\b(?=[^>]*(?:img_hdgz_style8_zs\.avif|_finger[12]_1wf2z_(?:88|89)))[^>]*\/?\s*>/gi,
      ""
    )
);

function formatRequirement(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

async function loadData(showSuccessMessage = false) {
  if (isLoading.value) return;

  isLoading.value = true;
  loadFailed.value = false;
  try {
    const [promoteResult, inviteResult] = await Promise.allSettled([
      getPromoteInfo(),
      getSpecialInviteData()
    ]);
    promoteInfo.value = promoteResult.status === "fulfilled"
      ? promoteResult.value as PromoteInfo
      : null;
    if (inviteResult.status === "rejected") {
      throw inviteResult.reason;
    }
    inviteData.value = inviteResult.value;
    if (showSuccessMessage) {
      showCustomToast({ type: "success", message: $t("刷新成功") });
    }
  } catch {
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function handleReceive(rule: SpecialInviteRule) {
  const reward = rule.reward;
  if (!reward || reward.status !== 1 || receivingRewardId.value !== null) return;

  receivingRewardId.value = reward.id;
  try {
    const result = await receiveSpecialInviteReward(reward.id);
    reward.status = 2;
    reward.amount = Number(result.amount ?? reward.amount);
    showCustomToast({
      type: "success",
      message: `成功领取${Number(reward.amount).toFixed(2)}元`
    });
  } catch {
    // 请求拦截器已统一展示失败原因，此处只负责恢复按钮状态。
  } finally {
    receivingRewardId.value = null;
  }
}

function openSubordinateDetail() {
  validInviteDialogVisible.value = true;
}

onMounted(() => {
  if (isLoggedIn.value) {
    void loadData();
  }
});
</script>

<template>
  <section class="invite-template">
    <div v-if="!isLoggedIn" class="invite-template__state">
      <span>请先登录后查看邀请红包活动</span>
      <x-button type="primary" @click="router.push('/home/login')">去登录</x-button>
    </div>

    <div v-else-if="isLoading && !inviteData" class="invite-template__state">
      <svg-icon name="loading" class-name="invite-template__loading" />
      <span>活动数据加载中</span>
    </div>

    <div v-else-if="loadFailed && !inviteData" class="invite-template__state">
      <span>活动数据加载失败</span>
      <x-button type="primary" @click="loadData()">重新加载</x-button>
    </div>

    <template v-else-if="inviteData">
      <section class="invite-template__header">
        <promote-invite-share
          embedded
          :show-invite-code="true"
          :invite-code="promoteInfo?.user?.inviteCode || ''"
          :invite-links="promoteInfo?.inviteLinks || []"
        />

        <div class="invite-template__summary">
          <div class="invite-template__summary-row">
            <span>有效下级</span>
            <strong>{{ inviteData.validInviteCount }}</strong>
            <span>人</span>
            <button
              type="button"
              class="invite-template__refresh"
              :disabled="isLoading"
              :title="$t('刷新有效下级')"
              @click="loadData(true)"
            >
              <svg-icon
                name="comm_icon_retry"
                :class-name="isLoading ? 'invite-template__refresh-icon invite-template__refresh-icon--loading' : 'invite-template__refresh-icon'"
              />
            </button>
          </div>
          <button type="button" class="invite-template__detail" @click="openSubordinateDetail">详情</button>
        </div>
      </section>

      <section class="invite-template__tips">
        <h2>什么是有效推广人数？</h2>
        <p>
          该下级累计充值
          <strong>≥ {{ formatRequirement(inviteData.config.rechargeAmount) }}</strong>，
          累计有效投注
          <strong>≥ {{ formatRequirement(inviteData.config.validBetAmount) }}</strong>，
          累计充值天数
          <strong>≥ {{ inviteData.config.rechargeDays }}</strong>
        </p>
      </section>

      <section class="invite-template__reward-content">
        <invite-reward-roadmap
          v-if="inviteData.rules.length"
          :rules="inviteData.rules"
          :valid-invite-count="inviteData.validInviteCount"
          :receiving-reward-id="receivingRewardId"
          @receive="handleReceive"
        />
        <div v-else class="invite-template__rules-empty">{{ $t("暂无奖励档位") }}</div>
      </section>

      <section v-if="inviteData.config.description" class="invite-template__description">
        <div class="invite-template__description-title">
          <img
            class="invite-template__rules-decoration"
            :src="rulesDecorationImage"
            alt=""
          />
          <h2 class="invite-template__description-title-text">{{ $t("活动说明") }}</h2>
          <img
            class="invite-template__rules-decoration invite-template__rules-decoration--right"
            :src="rulesDecorationImage"
            alt=""
          />
        </div>
        <div class="invite-template__description-content" v-html="descriptionContent" />
      </section>
    </template>

    <special-invite-member-dialog
      v-if="inviteData"
      v-model:show="validInviteDialogVisible"
      :config="inviteData.config"
    />
  </section>
</template>

<style scoped lang="less">
.invite-template {
  min-height: 100%;
  padding: 10px 10px 0;
  color: var(--skin__neutral_2);
  background: var(--skin__bg_1);
}

.invite-template__state {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: calc(var(--lobby__screen-height) - 45px);
  gap: 15px;
  color: var(--skin__neutral_2);
  font-size: 13px;

  :deep(.x-button) {
    width: 100px;
  }
}

:deep(.invite-template__loading) {
  width: 28px;
  height: 28px;
  color: var(--skin__primary);
  animation: invite-template-loading 0.8s linear infinite;
}

.invite-template__header,
.invite-template__tips,
.invite-template__description {
  margin-bottom: 10px;
  border-radius: 5px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px var(--skin__web_left_bg_shadow);
}

.invite-template__header {
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px;
}

.invite-template__summary {
  display: flex;
  align-items: center;
  padding-top: 10px;
}

.invite-template__summary-row {
  display: flex;
  align-items: center;
  min-width: 0;
  color: var(--skin__neutral_2);
  font-size: 11px;

  strong {
    padding: 0 2.5px;
    color: var(--skin__primary);
    font-size: 11px;
    font-weight: 400;
  }
}

.invite-template__refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  padding: 0 5.5px;
  border: 0;
  color: var(--skin__primary);
  background: transparent;
}

.invite-template__detail {
  padding: 0 2.5px;
  border: 0;
  color: var(--skin__primary);
  font-size: 11px;
  background: transparent;
}

:deep(.invite-template__refresh-icon) {
  width: 12px;
  height: 12px;
}

:deep(.invite-template__refresh-icon--loading) {
  animation: invite-template-loading 0.8s linear infinite;
}

.invite-template__tips,
.invite-template__description {
  padding: 0 10px 10px;

  h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding-top: 10px;
    color: var(--skin__neutral_2);
    font-size: 11px;
    font-weight: 400;
    text-align: center;
  }

  p {
    margin: 0;
    padding-top: 10px;
    font-size: 11px;
    line-height: 1.5;
    word-break: break-word;
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }
}

.invite-template__description {
  padding-top: 10px;
  overflow-wrap: anywhere;
}

.invite-template__description-content {
  color: var(--skin__neutral_1);
  font-size: 14px;
  line-height: 21px;
  white-space: pre-wrap;
  word-break: break-word;

  :deep(*) {
    box-sizing: border-box;
    max-width: 100%;
  }

  :deep(img) {
    height: auto;
  }

  :deep(p) {
    margin: 0;
  }
}

.invite-template__description-title {
  max-width: 100%;
  margin-bottom: 10px;
  text-align: center;
  white-space: nowrap;
}

.invite-template__description-title .invite-template__description-title-text {
  position: relative;
  display: inline-block;
  max-width: 100%;
  height: 22px;
  margin: 0;
  padding: 0 5px;
  overflow: hidden;
  color: var(--introduction-inner__text-color, var(--skin__neutral_1));
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  text-overflow: ellipsis;
  vertical-align: top;
  white-space: nowrap;
  z-index: 1;
}

.invite-template__rules-decoration {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-bottom: 2px;
  object-fit: contain;
  vertical-align: bottom;
}

.invite-template__rules-decoration--right {
  transform: scaleX(-1);
}

// 对应参考样式 _rewardContent_gt0zn_82，负责奖励区域的外层视觉容器。
.invite-template__reward-content {
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
}

.invite-template__rules-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--skin__neutral_2);
  font-size: 12px;
}

@keyframes invite-template-loading {
  to {
    transform: rotate(360deg);
  }
}
</style>
