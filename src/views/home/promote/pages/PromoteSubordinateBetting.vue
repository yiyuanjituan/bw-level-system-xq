<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromoteSubordinates } from "@/api/common";
import vipBadgeIcon from "@/assets/home/promote/vip-badge.avif";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange } from "@/components/HomeReport/types";
import Copy from "@/components/Common/Copy.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import PromoteBettingDetailDialog from "../components/PromoteBettingDetailDialog.vue";
import PromoteMemberDetailDialog from "../components/PromoteMemberDetailDialog.vue";
import type { PromoteSubordinate, PromoteSubordinateResponse } from "../types";

interface FooterItem {
  label: string;
  value: string;
}

const DEFAULT_PAGE_SIZE = 20;
const sortOptions = [
  { label: "有效投注排序", value: "validBet" },
  { label: "累计输赢排序", value: "profitLose" }
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

const selectedSort = ref("validBet");
const memberId = ref("");
const selectedTimeRange = ref<AccountTimeRange>(defaultTimeRange);
const searchFocused = ref(false);
const loading = ref(false);
const requestFailed = ref(false);
const finished = ref(false);
const footerCollapsed = ref(true);
const page = ref(1);
const members = ref<PromoteSubordinate[]>([]);
const summary = ref<PromoteSubordinateResponse | null>(null);
const detailVisible = ref(false);
const selectedUserIdx = ref(0);
const bettingDetailVisible = ref(false);
const selectedBettingVipLevel = ref(0);
let latestRequestId = 0;

const hasMembers = computed(() => members.value.length > 0);
const footerItems = computed<FooterItem[]>(() => {
  const current = summary.value;
  return [
    { label: "直属有效投注", value: formatMoney(current?.directValidBet) },
    { label: "直属输赢", value: formatMoney(current?.directProfitLose) },
    { label: "其他有效投注", value: formatMoney(current?.otherValidBet) },
    { label: "其他输赢", value: formatMoney(current?.otherProfitLose) },
    { label: "总有效投注", value: formatMoney(current?.totalValidBet) },
    { label: "总输赢", value: formatMoney(current?.totalProfitLose) }
  ];
});

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function formatCount(value: unknown) {
  return Math.max(Math.trunc(Number(value) || 0), 0);
}

function getWinLossClass(value: unknown) {
  const amount = Number(value);
  return {
    "number--green": amount < 0,
    "number--red": amount > 0
  };
}

function normalizeResponse(response: unknown): PromoteSubordinateResponse {
  const source = (response as any)?.data ?? response ?? {};
  return {
    list: Array.isArray((source as any).list) ? (source as any).list : [],
    totalRecords: formatCount((source as any).totalRecords),
    total: formatCount((source as any).total),
    pageSize: formatCount((source as any).pageSize) || DEFAULT_PAGE_SIZE,
    more: Boolean((source as any).more),
    totalFirstDeposit: Number((source as any).totalFirstDeposit) || 0,
    totalFirstDepositPerson: formatCount((source as any).totalFirstDepositPerson),
    totalDeposit: Number((source as any).totalDeposit) || 0,
    totalDepositPerson: formatCount((source as any).totalDepositPerson),
    directDeposit: Number((source as any).directDeposit) || 0,
    directDepositPerson: formatCount((source as any).directDepositPerson),
    otherDeposit: Number((source as any).otherDeposit) || 0,
    otherDepositPerson: formatCount((source as any).otherDepositPerson),
    directValidBet: Number((source as any).directValidBet) || 0,
    otherValidBet: Number((source as any).otherValidBet) || 0,
    totalValidBet: Number((source as any).totalValidBet) || 0,
    directProfitLose: Number((source as any).directProfitLose) || 0,
    otherProfitLose: Number((source as any).otherProfitLose) || 0,
    totalProfitLose: Number((source as any).totalProfitLose) || 0,
    directRegisterPerson: formatCount((source as any).directRegisterPerson),
    otherRegisterPerson: formatCount((source as any).otherRegisterPerson),
    totalRegisterPerson: formatCount((source as any).totalRegisterPerson),
    startTime: Number((source as any).startTime) || 0,
    endTime: Number((source as any).endTime) || 0
  };
}

function createQueryParams() {
  const normalizedMemberId = memberId.value.trim();
  return {
    page: page.value,
    size: DEFAULT_PAGE_SIZE,
    sortField: selectedSort.value,
    sortOrder: 2,
    startTime: selectedTimeRange.value.startTime,
    endTime: selectedTimeRange.value.endTime,
    ...(normalizedMemberId ? { userIdx: Number(normalizedMemberId) } : {})
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
    const response = normalizeResponse(await getPromoteSubordinates(createQueryParams()));
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

function handleSearch() {
  memberId.value = memberId.value.trim().replace(/\D/g, "");
  void loadMembers(true);
}

function handleRetry() {
  finished.value = false;
  void loadMembers(members.value.length === 0);
}

function openMemberDetail(userIdx: number) {
  selectedUserIdx.value = userIdx;
  detailVisible.value = true;
}

function openBettingDetail(member: PromoteSubordinate) {
  selectedUserIdx.value = member.userIdx;
  selectedBettingVipLevel.value = member.vipLevel;
  bettingDetailVisible.value = true;
}

watch(
  [() => selectedTimeRange.value.startTime, () => selectedTimeRange.value.endTime, selectedSort],
  () => void loadMembers(true),
  { immediate: true }
);
</script>

<template>
  <div class="subordinate-betting">
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
          :placeholder="$t('会员ID')"
          :aria-label="$t('会员ID')"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keydown.enter.prevent="handleSearch"
        >
          <template #suffix>
            <button class="icon-button" type="button" :aria-label="$t('搜索会员')" @click.stop="handleSearch">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 3a7.5 7.5 0 1 0 4.72 13.33l4.22 4.22 1.06-1.06-4.22-4.22A7.5 7.5 0 0 0 10.5 3Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
              </svg>
            </button>
          </template>
        </x-input>
      </div>
    </div>

    <div class="member-list" :class="{ 'member-list--with-footer': summary && !footerCollapsed }">
      <div v-if="loading && !hasMembers" class="state"><ui-loading /></div>
      <ui-empty
        v-else-if="!hasMembers"
        :text="requestFailed ? '加载失败，请重试' : '暂无内容'"
      >
        <template #text="{ text }">
          <span class="empty-text">
            <span>{{ text }}</span>
            <button class="icon-button retry" type="button" :aria-label="$t('重新加载')" @click="handleRetry">
              <svg viewBox="0 0 28 28" aria-hidden="true">
                <path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" />
              </svg>
            </button>
          </span>
        </template>
      </ui-empty>

      <van-list
        v-else
        :loading="loading"
        :finished="finished"
        :immediate-check="false"
        @load="loadMembers(false)"
      >
        <template #loading>
          <div class="loading"><ui-loading /></div>
        </template>

        <div v-for="member in members" :key="member.userIdx" class="member-item">
          <div class="member-row">
            <span class="member-column">
              <div class="account-column">
                <span class="vip-badge">
                  <img :src="vipBadgeIcon" alt="" />
                  <span class="vip-level">{{ member.vipLevel }}</span>
                </span>
                <span class="member-account">
                  <button class="member-id" type="button" @click="openMemberDetail(member.userIdx)">
                    {{ member.userIdx }}
                  </button>
                  <copy class="copy-button" :text="String(member.userIdx)" />
                </span>
              </div>
            </span>
            <span class="member-column">
              <label>他的下级</label>
              <span class="number value">{{ formatCount(member.directChildCount) }}</span>
            </span>
          </div>
          <div class="member-row">
            <span class="member-column">
              <label>有效投注</label>
              <button
                class="number value member-link"
                type="button"
                @click="openBettingDetail(member)"
              >
                {{ formatMoney(member.validBet) }}
              </button>
              <span>({{ formatCount(member.validBetCount) }}次)</span>
            </span>
            <span class="member-column">
              <label>累计输赢</label>
              <span class="number value" :class="getWinLossClass(member.profitLose)">
                {{ formatMoney(member.profitLose) }}
              </span>
            </span>
          </div>
        </div>

        <div v-if="requestFailed" class="load-error" @click="handleRetry">
          加载失败，点击重试
        </div>
      </van-list>
    </div>

    <div v-if="summary" class="summary-footer" :class="{ 'summary-footer--collapsed': footerCollapsed }">
      <button class="footer-toggle" type="button" @click="footerCollapsed = !footerCollapsed">
        <svg class="footer-arrow" viewBox="0 0 23 16" aria-hidden="true">
          <path d="M11.5 16 0 3.36 3.06 0l8.44 9.27L19.94 0 23 3.36Z" />
        </svg>
        {{ footerCollapsed ? "显示" : "隐藏" }}
      </button>
      <div class="footer-content">
        <span v-for="footerItem in footerItems" :key="footerItem.label" class="footer-item">
          <label>{{ footerItem.label }}</label>
          <span class="number footer-value">{{ footerItem.value }}</span>
        </span>
      </div>
    </div>

    <promote-member-detail-dialog v-model:show="detailVisible" :user-idx="selectedUserIdx" />
    <promote-betting-detail-dialog
      v-model:show="bettingDetailVisible"
      :user-idx="selectedUserIdx"
      :vip-level="selectedBettingVipLevel"
      :start-time="selectedTimeRange.startTime"
      :end-time="selectedTimeRange.endTime"
    />
  </div>
</template>

<style scoped lang="less">
.subordinate-betting {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
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
  align-items: flex-start;
  justify-content: flex-start;
  width: max-content;
  margin-bottom: 10px;
}

:deep(.time-trigger) {
  border: var(--lobby__px) solid var(--skin__border);
  background: var(--skin__bg_2);
}

.sort-select {
  display: inline-flex;
  flex: none;
  width: 110px;
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
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 0 10px;
  overflow-y: auto;
  transition: padding-bottom 0.3s;
}

.member-list--with-footer {
  padding-bottom: 85px;
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

.member-item {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
}

.member-item:nth-child(odd) {
  background-color: var(--skin__bg_2);
}

.member-item:nth-child(even) {
  background-color: var(--skin__bg_1);
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.member-row:not(:last-child) {
  margin-bottom: 5px;
}

.member-column {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 50%;
  color: var(--skin__neutral_2);
}

.member-column label {
  margin-right: 5px;
}

.number {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__lead);
  line-height: 1;
  word-break: break-all;
}

.value {
  margin-right: 2px;
}

.member-link {
  padding: 0;
  background: transparent;
  color: var(--skin__primary);
  border-bottom: var(--lobby__px) solid var(--skin__primary);
  border-top: 0;
  border-right: 0;
  border-left: 0;
  cursor: pointer;
}

.number--green {
  color: var(--skin__accent_1);
}

.number--red {
  color: var(--skin__accent_2);
}

.account-column {
  display: flex;
  align-items: center;
}

.vip-badge {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 12px;
  border-radius: 2px 0;
  background-color: #c12929;
  line-height: 1;
}

.vip-badge img {
  width: 8px;
  height: 8px;
}

.vip-level {
  padding-right: 3px;
  margin-left: -2px;
  background-image: linear-gradient(to bottom, #f7ea94 -5%, #e5b952 58%, #ce9510 114%);
  background-clip: text;
  color: transparent;
  font-size: 9px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
}

.member-account {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
  color: var(--skin__lead);
}

.member-id,
.copy-button,
.icon-button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.member-id {
  color: var(--skin__primary);
  border-bottom: var(--lobby__px) solid var(--skin__primary);
}

.copy-button {
  margin-left: 8px;
  color: var(--skin__primary);
  font-size: 15px;
  line-height: 1;
  transform: translateY(2px);
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--skin__primary);
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
  align-items: center;
  height: 18px;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
}

.footer-item {
  display: flex;
  align-items: flex-start;
  width: 50%;
  margin-bottom: 5px;
  color: var(--skin__lead);
  font-size: 11px;
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

[dir="rtl"] {
  .sort-select,
  :deep(.search-input),
  .member-column label,
  .value,
  .member-account,
  .copy-button,
  .footer-arrow,
  .footer-item label,
  .footer-value {
    margin-right: 0;
    margin-left: 5px;
  }

  .vip-badge {
    right: 0;
    left: auto;
    border-radius: 0 2px;
  }
}
</style>
