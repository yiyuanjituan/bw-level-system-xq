<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromoteSubordinateReceive } from "@/api/common";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange } from "@/components/HomeReport/types";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import PromoteMemberDetailDialog from "../components/PromoteMemberDetailDialog.vue";
import PromoteReceiveCard from "../components/PromoteReceiveCard.vue";
import type {
  PromoteSubordinateReceive,
  PromoteSubordinateReceiveOtherCoupon,
  PromoteSubordinateReceiveResponse
} from "../types";

type ReceiveSortField = "totalReward" | "returnGold" | "activityReward" | "taskReward" | "agentCommission";

interface FooterItem {
  label: string;
  value: string;
}

const DEFAULT_PAGE_SIZE = 20;
const sortOptions: Array<{ label: string; value: ReceiveSortField }> = [
  { label: "合计领取排序", value: "totalReward" },
  { label: "返水领取排序", value: "returnGold" },
  { label: "活动领取排序", value: "activityReward" },
  { label: "任务领取排序", value: "taskReward" },
  { label: "代理佣金排序", value: "agentCommission" }
];
const today = dayjs();
const defaultTimeRange: AccountTimeRange = {
  mode: "custom",
  label: "全部",
  startTime: today.subtract(89, "day").startOf("day").unix(),
  endTime: today.endOf("day").unix(),
  startDate: today.subtract(89, "day").format("YYYY-MM-DD"),
  endDate: today.format("YYYY-MM-DD")
};

const selectedSort = ref<ReceiveSortField>("totalReward");
const selectedTimeRange = ref<AccountTimeRange>(defaultTimeRange);
const memberId = ref("");
const searchFocused = ref(false);
const loading = ref(false);
const requestFailed = ref(false);
const finished = ref(false);
const page = ref(1);
const members = ref<PromoteSubordinateReceive[]>([]);
const summary = ref<PromoteSubordinateReceiveResponse | null>(null);
const footerCollapsed = ref(true);
let latestRequestId = 0;

const childDialogVisible = ref(false);
const childStack = ref<PromoteSubordinateReceive[]>([]);
const childMembers = ref<PromoteSubordinateReceive[]>([]);
const childLoading = ref(false);
const childFailed = ref(false);
const childFinished = ref(false);
const childPage = ref(1);
let latestChildRequestId = 0;

const otherDialogVisible = ref(false);
const selectedOtherMember = ref<PromoteSubordinateReceive | null>(null);
const memberDetailVisible = ref(false);
const selectedUserIdx = ref(0);

const hasMembers = computed(() => members.value.length > 0);
const currentParent = computed(() => childStack.value[childStack.value.length - 1] ?? null);
const otherCoupons = computed(() => selectedOtherMember.value?.otherCoupons ?? []);
const footerItems = computed<FooterItem[]>(() => [
  { label: "活动领取", value: formatMoney(summary.value?.totalActivityReward) },
  { label: "返水领取", value: formatMoney(summary.value?.totalReturnGold) },
  { label: "任务领取", value: formatMoney(summary.value?.totalTaskReward) },
  { label: "代理佣金", value: formatMoney(summary.value?.totalAgentCommission) }
]);

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function formatCount(value: unknown) {
  return Math.max(Math.trunc(Number(value) || 0), 0);
}

function normalizeMember(source: any): PromoteSubordinateReceive {
  const otherCouponList = Array.isArray(source?.otherCoupons) ? source.otherCoupons : [];
  return {
    userIdx: Number(source?.userIdx) || 0,
    account: String(source?.account || ""),
    encryption: String(source?.encryption || ""),
    vipLevel: formatCount(source?.vipLevel),
    directChildCount: formatCount(source?.directChildCount),
    activityReward: Number(source?.activityReward) || 0,
    returnGold: Number(source?.returnGold) || 0,
    taskReward: Number(source?.taskReward) || 0,
    agentCommission: Number(source?.agentCommission) || 0,
    totalOther: Number(source?.totalOther) || 0,
    totalReward: Number(source?.totalReward) || 0,
    otherCoupons: otherCouponList.map((coupon: PromoteSubordinateReceiveOtherCoupon) => ({
      otherName: String(coupon?.otherName || "其他奖励"),
      otherAmount: Number(coupon?.otherAmount) || 0
    }))
  };
}

function normalizeResponse(response: unknown): PromoteSubordinateReceiveResponse {
  const source = (response as any)?.data ?? response ?? {};
  return {
    list: Array.isArray((source as any).list) ? (source as any).list.map(normalizeMember) : [],
    totalRecords: formatCount((source as any).totalRecords),
    total: formatCount((source as any).total),
    page: formatCount((source as any).page) || 1,
    pageSize: formatCount((source as any).pageSize) || DEFAULT_PAGE_SIZE,
    more: Boolean((source as any).more),
    totalActivityReward: Number((source as any).totalActivityReward) || 0,
    totalReturnGold: Number((source as any).totalReturnGold) || 0,
    totalTaskReward: Number((source as any).totalTaskReward) || 0,
    totalAgentCommission: Number((source as any).totalAgentCommission) || 0,
    totalOther: Number((source as any).totalOther) || 0,
    totalValue: Number((source as any).totalValue) || 0,
    startTime: Number((source as any).startTime) || 0,
    endTime: Number((source as any).endTime) || 0
  };
}

function createQueryParams(currentPage: number, parentUserIdx?: number) {
  const normalizedMemberId = memberId.value.trim();
  return {
    page: currentPage,
    size: DEFAULT_PAGE_SIZE,
    sortField: selectedSort.value,
    sortOrder: 2,
    startTime: selectedTimeRange.value.startTime,
    endTime: selectedTimeRange.value.endTime,
    ...(parentUserIdx ? { parentUserIdx } : {}),
    ...(!parentUserIdx && normalizedMemberId ? { userIdx: Number(normalizedMemberId) } : {})
  };
}

async function loadMembers(reset = false) {
  if (loading.value && !reset) return;

  if (reset) {
    page.value = 1;
    finished.value = false;
    requestFailed.value = false;
  }

  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const response = normalizeResponse(await getPromoteSubordinateReceive(createQueryParams(page.value)));
    if (requestId !== latestRequestId) return;

    members.value = reset ? response.list : [...members.value, ...response.list];
    summary.value = response;
    requestFailed.value = false;
    finished.value = !response.more || members.value.length >= response.totalRecords;
    if (!finished.value) page.value += 1;
  } catch {
    if (requestId !== latestRequestId) return;
    requestFailed.value = true;
    finished.value = true;
    if (reset) {
      members.value = [];
      summary.value = null;
    }
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

async function loadChildMembers(reset = false) {
  const parent = currentParent.value;
  if (!parent || (childLoading.value && !reset)) return;

  if (reset) {
    childPage.value = 1;
    childFinished.value = false;
    childFailed.value = false;
  }

  const requestId = ++latestChildRequestId;
  childLoading.value = true;
  try {
    const response = normalizeResponse(
      await getPromoteSubordinateReceive(createQueryParams(childPage.value, parent.userIdx))
    );
    if (requestId !== latestChildRequestId) return;

    childMembers.value = reset ? response.list : [...childMembers.value, ...response.list];
    childFailed.value = false;
    childFinished.value = !response.more || childMembers.value.length >= response.totalRecords;
    if (!childFinished.value) childPage.value += 1;
  } catch {
    if (requestId !== latestChildRequestId) return;
    childFailed.value = true;
    childFinished.value = true;
    if (reset) {
      childMembers.value = [];
    }
  } finally {
    if (requestId === latestChildRequestId) childLoading.value = false;
  }
}

function handleSearch() {
  memberId.value = memberId.value.trim().replace(/\D/g, "");
  void loadMembers(true);
}

function handleRetry() {
  finished.value = false;
  void loadMembers(members.value.length === 0);
}

function openChildren(member: PromoteSubordinateReceive) {
  if (member.directChildCount <= 0) return;
  childStack.value.push(member);
  childDialogVisible.value = true;
  void loadChildMembers(true);
}

function goBackChild() {
  if (childStack.value.length <= 1) return;
  childStack.value.pop();
  void loadChildMembers(true);
}

function updateChildDialog(show: boolean) {
  childDialogVisible.value = show;
  if (!show) {
    latestChildRequestId += 1;
    childStack.value = [];
    childMembers.value = [];
  }
}

function openOther(member: PromoteSubordinateReceive) {
  if (member.totalOther <= 0) return;
  selectedOtherMember.value = member;
  otherDialogVisible.value = true;
}

function openMemberDetail(member: PromoteSubordinateReceive) {
  selectedUserIdx.value = member.userIdx;
  memberDetailVisible.value = true;
}

watch(
  [() => selectedTimeRange.value.startTime, () => selectedTimeRange.value.endTime, selectedSort],
  () => {
    updateChildDialog(false);
    void loadMembers(true);
  },
  { immediate: true }
);
</script>

<template>
  <div class="receive-layout">
    <div class="filter-header">
      <div class="search-tools">
        <account-time-filter v-model="selectedTimeRange" />
        <span class="sort-select">
          <x-select
            v-model="selectedSort"
            placement="bottom"
            :options="sortOptions"
            value-key="value"
            label-key="label"
          />
        </span>
        <x-input
          v-model="memberId"
          class="search-input"
          :class="{ 'is-focused': searchFocused }"
          type="search"
          inputmode="numeric"
          placeholder="会员ID"
          aria-label="会员ID"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keydown.enter.prevent="handleSearch"
        >
          <template #suffix>
            <button class="icon-button" type="button" aria-label="搜索会员" @click.stop="handleSearch">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 1 0 4.72 13.33l4.22 4.22 1.06-1.06-4.22-4.22A7.5 7.5 0 0 0 10.5 3Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" /></svg>
            </button>
          </template>
        </x-input>
      </div>
    </div>

    <div class="member-list" :class="{ 'member-list--with-footer': summary && summary.totalRecords > 0 }">
      <div v-if="loading && !hasMembers" class="state"><ui-loading /></div>
      <ui-empty v-else-if="!hasMembers" :text="requestFailed ? '加载失败，请重试' : '暂无内容'">
        <template #text="{ text }">
          <span class="empty-text">
            <span>{{ text }}</span>
            <button class="icon-button retry" type="button" aria-label="重新加载" @click="handleRetry">
              <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" /></svg>
            </button>
          </span>
        </template>
      </ui-empty>

      <van-list v-else v-model:loading="loading" :finished="finished" :immediate-check="false" @load="loadMembers(false)">
        <template #loading><div class="loading"><ui-loading /></div></template>
        <promote-receive-card
          v-for="member in members"
          :key="member.userIdx"
          :member="member"
          @open-member="openMemberDetail"
          @open-children="openChildren"
          @open-other="openOther"
        />
        <div v-if="requestFailed" class="load-error" @click="handleRetry">加载失败，点击重试</div>
      </van-list>
    </div>

    <div
      v-if="summary && summary.totalRecords > 0"
      class="summary-footer"
      :class="{ 'summary-footer--collapsed': footerCollapsed }"
    >
      <button class="footer-toggle" type="button" @click="footerCollapsed = !footerCollapsed">
        <svg class="footer-arrow" viewBox="0 0 23 16" aria-hidden="true"><path d="M11.5 16 0 3.36 3.06 0l8.44 9.27L19.94 0 23 3.36Z" /></svg>
        {{ footerCollapsed ? "展示" : "收起" }}
      </button>
      <div class="footer-content">
        <span v-for="footerItem in footerItems" :key="footerItem.label" class="footer-item">
          <label>{{ footerItem.label }}</label>
          <span class="footer-value">{{ footerItem.value }}</span>
        </span>
      </div>
    </div>

    <van-dialog
      :show="childDialogVisible"
      :width="350"
      :z-index="2020"
      :show-confirm-button="false"
      :show-cancel-button="false"
      close-on-click-overlay
      destroy-on-close
      class-name="receive-child-dialog"
      teleport="body"
      @update:show="updateChildDialog"
    >
      <template #title>
        <div class="dialog-title">
          <button v-if="childStack.length > 1" type="button" class="back-button" aria-label="返回上一级" @click="goBackChild">‹</button>
          <span>{{ currentParent?.userIdx }}的下级</span>
        </div>
      </template>
      <div class="child-content">
        <div class="dialog-date">日期 {{ selectedTimeRange.startDate }} - {{ selectedTimeRange.endDate }}</div>
        <div class="child-list">
          <div v-if="childLoading && childMembers.length === 0" class="dialog-state"><ui-loading /></div>
          <ui-empty v-else-if="childMembers.length === 0" :text="childFailed ? '加载失败，请重试' : '暂无内容'">
            <template #text="{ text }">
              <span class="empty-text">
                <span>{{ text }}</span>
                <button v-if="childFailed" class="icon-button retry" type="button" aria-label="重新加载" @click="loadChildMembers(true)">
                  <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" /></svg>
                </button>
              </span>
            </template>
          </ui-empty>
          <van-list
            v-else
            v-model:loading="childLoading"
            :finished="childFinished"
            :immediate-check="false"
            @load="loadChildMembers(false)"
          >
            <template #loading><div class="dialog-loading"><ui-loading /></div></template>
            <promote-receive-card
              v-for="member in childMembers"
              :key="member.userIdx"
              :member="member"
              @open-member="openMemberDetail"
              @open-children="openChildren"
              @open-other="openOther"
            />
            <button v-if="childFailed" type="button" class="dialog-retry" @click="loadChildMembers(childMembers.length === 0)">加载失败，点击重试</button>
          </van-list>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="close-button" aria-label="关闭" @click="updateChildDialog(false)"><svg-icon name="close" color="white" /></button>
        </div>
      </template>
    </van-dialog>

    <van-dialog
      v-model:show="otherDialogVisible"
      title="其他汇总明细"
      :width="350"
      :z-index="2021"
      :show-confirm-button="false"
      :show-cancel-button="false"
      close-on-click-overlay
      destroy-on-close
      class-name="receive-other-dialog"
      teleport="body"
    >
      <div class="other-details">
        <div v-for="coupon in otherCoupons" :key="coupon.otherName" class="other-item">
          <label>{{ coupon.otherName }}</label>
          <span>{{ formatMoney(coupon.otherAmount) }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="close-button" aria-label="关闭" @click="otherDialogVisible = false"><svg-icon name="close" color="white" /></button>
        </div>
      </template>
    </van-dialog>

    <promote-member-detail-dialog
      v-model:show="memberDetailVisible"
      :user-idx="selectedUserIdx"
      :z-index="2022"
    />
  </div>
</template>

<style scoped lang="less">
.receive-layout {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.filter-header {
  flex: none;
  padding: 10px 10px 0;
  overflow-x: auto;
}

.search-tools {
  display: flex;
  width: max-content;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 10px;
}

:deep(.time-trigger) {
  border: var(--lobby__px) solid var(--skin__border);
  background: var(--skin__bg_2);
}

.sort-select {
  display: inline-flex;
  width: 110px;
  flex: none;
  margin-left: 10px;
}

:deep(.sort-select .x-popover__reference) {
  width: 100%;
}

:deep(.sort-select .x-select) {
  height: 25px;
  padding: 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 25px;
  background: var(--skin__bg_2);
  color: var(--skin__neutral_2);
  font-size: 10px;
}

:deep(.sort-select .x-select__label) {
  max-width: 85px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.search-input) {
  box-sizing: border-box;
  width: 100px;
  height: 25px;
  padding: 0 8px 0 10px;
  margin-left: 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 25px;
  font-size: 10px;
  transition: all 0.5s 0.3s;
}

:deep(.search-input.is-focused) {
  flex: 1;
  border-color: var(--skin__primary);
  transition-delay: 0s;
}

:deep(.search-input .x-input__wrap) {
  height: 100%;
  line-height: 25px;
}

:deep(.search-input .x-input__field) {
  color: var(--skin__lead);
  font-size: 10px;
}

:deep(.search-input .x-input__field::placeholder) {
  color: var(--skin__neutral_3);
  opacity: 1;
}

.member-list {
  position: relative;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  padding: 0 10px;
  overflow-y: auto;
  transition: padding-bottom 0.3s;
}

.member-list--with-footer {
  padding-bottom: 65px;
}

.state,
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  z-index: 1;
  pointer-events: none;
}

.icon-button {
  display: inline-flex;
  width: 14px;
  height: 14px;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;
}

.icon-button svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.empty-text {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.retry {
  width: 15px;
  height: 15px;
}

.load-error {
  padding: 12px;
  color: var(--skin__danger, #e95b5b);
  text-align: center;
  cursor: pointer;
}

.summary-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  min-height: 20px;
  padding: 10px 10px calc(10px + var(--skin__safe-area-inset-bottom));
  background-color: var(--skin__bg_2);
  box-shadow: 0 3px 9px rgba(var(--skin__bg-shadow__custom), 0.06);
  font-size: 11px;
  line-height: 11px;
  transition: transform 0.3s;
}

.summary-footer--collapsed {
  transform: translateY(100%);
}

.footer-toggle {
  position: absolute;
  top: -18px;
  left: 50%;
  display: flex;
  height: 18px;
  align-items: center;
  padding: 0 8px;
  border: 0;
  border-radius: 7px 7px 0 0;
  background-color: var(--skin__bg_2);
  color: var(--skin__primary);
  font-size: 10px;
  line-height: 18px;
  cursor: pointer;
  transform: translateX(-50%);
}

.footer-arrow {
  width: 10px;
  height: 10px;
  margin-right: 5px;
  fill: currentColor;
  transition: transform 0.3s;
}

.summary-footer--collapsed .footer-arrow {
  transform: rotate(180deg);
}

.footer-content {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.footer-item {
  display: flex;
  width: 50%;
  align-items: flex-start;
  margin-bottom: 5px;
  color: var(--skin__lead);
}

.footer-item:nth-last-child(-n + 2) {
  margin-bottom: 0;
}

.footer-item label,
.footer-value {
  flex: 1;
  margin-right: 5px;
}

.footer-item label {
  color: var(--skin__neutral_2);
  word-wrap: break-word;
}

.child-content {
  box-sizing: border-box;
  padding: 0 10px;
}

.dialog-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button {
  position: absolute;
  left: 0;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.dialog-date {
  padding-bottom: 10px;
  color: var(--skin__neutral_2);
  font-size: 10px;
}

.child-list {
  position: relative;
  min-height: 180px;
  max-height: 400px;
  overflow-y: auto;
}

.dialog-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
}

.dialog-loading {
  display: flex;
  padding: 10px;
  align-items: center;
  justify-content: center;
}

.dialog-retry {
  display: block;
  width: 100%;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--skin__danger, #e95b5b);
  font-size: 10px;
  cursor: pointer;
}

.other-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
  margin: 0 10px;
  padding: 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 5px;
  color: var(--skin__lead);
  font-size: 10px;
}

.other-item {
  display: flex;
  min-width: 0;
  align-items: flex-start;
}

.other-item label {
  max-width: 80px;
  margin-right: 2px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  line-height: 1.5;
  text-overflow: ellipsis;
  word-break: break-all;
}

.other-item span {
  color: var(--skin__lead);
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.close-button {
  width: 21px;
  height: 21px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__lead);
  cursor: pointer;
}

:deep(.receive-child-dialog .van-dialog__header),
:deep(.receive-other-dialog .van-dialog__header) {
  color: var(--skin__lead);
  font-size: 17px;
}

[dir="rtl"] {
  .sort-select,
  :deep(.search-input),
  .footer-arrow,
  .footer-item label,
  .footer-value,
  .other-item label {
    margin-right: 0;
    margin-left: 5px;
  }

  .back-button {
    right: 0;
    left: auto;
  }
}
</style>
