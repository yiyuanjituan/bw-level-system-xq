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
import PromoteMemberDetailDialog from "../components/PromoteMemberDetailDialog.vue";
import type { PromoteSubordinate, PromoteSubordinateResponse } from "../types";

interface SortOption {
  label: string;
  value: "lastLoginTime" | "directChildCount" | "deposit" | "validBet";
}

interface FooterItem {
  label: string;
  value: string | number;
  unit?: string;
  extraValue?: number;
  extraUnit?: string;
}

const DEFAULT_PAGE_SIZE = 20;
const sortOptions: SortOption[] = [
  { label: "登录日期排序", value: "lastLoginTime" },
  { label: "下级人数排序", value: "directChildCount" },
  { label: "充值金额排序", value: "deposit" },
  { label: "有效投注排序", value: "validBet" }
];

const today = dayjs();
const defaultTimeRange: AccountTimeRange = {
  mode: "today",
  label: "今日",
  startTime: today.startOf("day").unix(),
  endTime: today.endOf("day").unix(),
  startDate: today.format("YYYY-MM-DD"),
  endDate: today.format("YYYY-MM-DD")
};

const selectedSort = ref<SortOption["value"]>("lastLoginTime");
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
let latestRequestId = 0;

const hasMembers = computed(() => members.value.length > 0);
const footerItems = computed<FooterItem[]>(() => {
  const current = summary.value;
  return [
    { label: "总注册", value: formatCount(current?.totalRegisterPerson), unit: "人" },
    { label: "直属注册（其他）", value: formatCount(current?.directRegisterPerson), unit: "人", extraValue: formatCount(current?.otherRegisterPerson), extraUnit: "人" },
    { label: "总充值", value: formatMoney(current?.totalDeposit), extraValue: formatCount(current?.totalDepositPerson), extraUnit: "次" },
    { label: "直属充值", value: formatMoney(current?.directDeposit), extraValue: formatCount(current?.directDepositPerson), extraUnit: "次" },
    { label: "其他充值", value: formatMoney(current?.otherDeposit), extraValue: formatCount(current?.otherDepositPerson), extraUnit: "次" },
    { label: "总首充", value: formatMoney(current?.totalFirstDeposit), extraValue: formatCount(current?.totalFirstDepositPerson), extraUnit: "人" },
    { label: "总有效投注", value: formatMoney(current?.totalValidBet) },
    { label: "直属有效投注", value: formatMoney(current?.directValidBet) },
    { label: "其他有效投注", value: formatMoney(current?.otherValidBet) }
  ];
});
function formatMoney(value: unknown) {
  return Number(value || 0).toFixed(2);
}

function formatCount(value: unknown) {
  return Math.max(Number(value) || 0, 0);
}

function formatTime(timestamp: number) {
  if (!timestamp) return "-";
  return dayjs(timestamp * 1000).format("YYYY/MM/DD HH:mm:ss");
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
    startTime: selectedTimeRange.value?.startTime,
    endTime: selectedTimeRange.value?.endTime,
    ...(normalizedMemberId ? { userIdx: Number(normalizedMemberId) } : {})
  };
}

async function loadMembers(reset = false) {
  if (loading.value) return;

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

watch(
  [() => selectedTimeRange.value?.startTime, () => selectedTimeRange.value?.endTime, selectedSort],
  () => void loadMembers(true),
  { immediate: true }
);
</script>

<template>
  <div class="layout">
    <div class="header">
      <div class="search-tools">
        <account-time-filter v-model="selectedTimeRange" />
        <span class="sort-select">
          <x-select v-model="selectedSort" placement="bottom" :options="sortOptions" value-key="value" label-key="label" />
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
            <button class="icon-btn" type="button" :aria-label="$t('搜索会员')" @click.stop="handleSearch">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 1 0 4.72 13.33l4.22 4.22 1.06-1.06-4.22-4.22A7.5 7.5 0 0 0 10.5 3Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" /></svg>
            </button>
          </template>
        </x-input>
      </div>
    </div>

    <div class="list">
      <div v-if="loading && !hasMembers" class="state"><ui-loading /></div>
      <ui-empty v-else-if="!hasMembers" :text="requestFailed ? '加载失败，请重试' : '暂无内容'">
        <template #text="{ text }">
          <span class="empty-text">
            <span>{{ text }}</span>
            <button class="icon-btn retry" type="button" :aria-label="$t('重新加载')" @click="handleRetry">
              <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M0 18.97l9.55-.16-2.4 3.42a10.75 10.75 0 1 0-4.05-8.4c0 .31.01.62.04.92H.06c-.02-.3-.03-.61-.03-.92A13.83 13.83 0 1 1 5.39 24.76L3.11 28Z" /></svg>
            </button>
          </span>
        </template>
      </ui-empty>

      <van-list v-else v-model:loading="loading" :finished="finished" :immediate-check="false" @load="loadMembers(false)">
        <template #loading>
          <div class="loading">
            <ui-loading />
          </div>
        </template>
        <div v-for="member in members" :key="member.userIdx" class="list-item">
          <div class="row">
            <span class="col">
              <div class="account-col flex items-center">
                <span class="vip">
                  <img class="vip-icon" :src="vipBadgeIcon" alt="" />
                  <span class="vip-level">{{ member.vipLevel }}</span>
                </span>
                <span class="member">
                  <button class="member-id" type="button" @click="openMemberDetail(member.userIdx)">{{ member.userIdx }}</button>
                  <copy class="copy" :text="String(member.userIdx)" />
                </span>
                <span class="number" :class="{ 'number--green': member.online === 1 }">{{ member.online === 1 ? "在线" : "离线" }}</span>
              </div>
            </span>
            <span class="col"><label>他的下级</label><span class="number value">{{ member.directChildCount }}</span></span>
          </div>
          <div class="row">
            <span class="col"><label>充值金额</label><span class="number value">{{ formatMoney(member.deposit) }}</span></span>
            <span class="col"><label>有效投注</label><span class="number value">{{ formatMoney(member.validBet) }}</span></span>
          </div>
          <div class="row">
            <span class="col"><label>状态</label><span class="number value" :class="member.status === 1 ? 'number--green' : 'number--red'">{{ member.status === 1 ? "正常" : "停用" }}</span></span>
            <span class="col"><label>登录日期</label><span class="number value">{{ formatTime(member.lastLoginTime) }}</span></span>
          </div>
        </div>
        <div v-if="requestFailed" class="load-error" @click="handleRetry">加载失败，点击重试</div>
      </van-list>
    </div>

    <div
      v-if="summary"
      class="footer"
      :class="{ 'footer--collapsed': footerCollapsed }"
    >
      <button class="footer-toggle" type="button" @click="footerCollapsed = !footerCollapsed">
        <svg class="footer-arrow" viewBox="0 0 23 16" aria-hidden="true">
          <path d="M11.5 16 0 3.36 3.06 0l8.44 9.27L19.94 0 23 3.36Z" />
        </svg>
        {{ footerCollapsed ? "展示" : "收起" }}
      </button>
      <div class="footer-content">
        <span v-for="footerItem in footerItems" :key="footerItem.label" class="footer-item">
          <label>{{ footerItem.label }}</label>
          <span class="footer-value">
            {{ footerItem.value }}
            <span v-if="footerItem.unit" class="suffix">{{ footerItem.unit }}</span>
            <span v-if="footerItem.extraValue !== undefined" class="suffix">
              <span class="neutral">
                (<span class="number">{{ footerItem.extraValue }}<span class="suffix">{{ footerItem.extraUnit }}</span></span>)
              </span>
            </span>
          </span>
        </span>
      </div>
    </div>

    <promote-member-detail-dialog
      v-model:show="detailVisible"
      :user-idx="selectedUserIdx"
    />
  </div>
</template>

<style scoped lang="less">
.layout {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  background: var(--skin__bg_1);
}

.header {
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
  width: 100px;
  height: 25px;
  box-sizing: border-box;
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

.list {
  position: relative;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 0 10px;
  overflow-y: auto;
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

.list-item {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
}

.list-item:nth-child(odd) {
  background: var(--skin__bg_2);
}

.list-item:nth-child(even) {
  background: var(--skin__bg_1);
}

.row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.row:not(:last-child) {
  margin-bottom: 5px;
}

.col {
  display: flex;
  width: 50%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  color: var(--skin__neutral_2);
}

.col label {
  margin-right: 5px;
}

.number {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  color: var(--skin__lead);
  word-break: break-all;
  line-height: 1;
}

.value {
  margin-right: 2px;
}

.number--green {
  color: var(--skin__accent_1);
}

.number--red {
  color: var(--skin__accent_2);
}

.vip {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 12px;
  align-items: center;
  justify-content: center;
  border-radius: 2px 0;
  background: #c12929;
  line-height: 1;
}

.vip-icon {
  width: 8px;
  height: 8px;
  object-fit: contain;
}

.vip-level {
  padding-right: 3px;
  margin-left: -2px;
  background: linear-gradient(to bottom, #f7ea94 -5%, #e5b952 58%, #ce9510 114%);
  background-clip: text;
  color: transparent;
  font-size: 9px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
}

.member {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
  color: var(--skin__lead);
}

.member-id,
.copy {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.member-id {
  border-bottom: var(--lobby__px) solid var(--skin__primary);
  color: var(--skin__primary);
}

.copy {
  margin-left: 8px;
  color: var(--skin__primary);
  font-size: 15px;
  line-height: 1;
  transform: translateY(2px);
}

.icon-btn {
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

.icon-btn svg {
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

.footer {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  min-height: 20px;
  box-sizing: border-box;
  padding: 10px 10px calc(10px + var(--skin__safe-area-inset-bottom));
  background: var(--skin__bg_2);
  box-shadow: 0 3px 9px rgba(var(--skin__bg-shadow__custom), 0.06);
  font-size: 11px;
  line-height: 11px;
  transition: transform 0.3s;
}

.footer--collapsed {
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
  background: var(--skin__bg_2);
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

.footer--collapsed .footer-arrow {
  transform: rotate(180deg);
}

.footer-content {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
}

.footer-item {
  display: flex;
  width: 50%;
  align-items: flex-start;
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

.footer-value {
  display: flex;
  flex-flow: row wrap;
  color: var(--skin__lead);
}

.footer-value .suffix,
.footer-value .neutral {
  display: flex;
  flex-flow: row wrap;
}

.footer-value .neutral,
.footer-value .neutral span {
  color: var(--skin__neutral_2) !important;
}

[dir="rtl"] {
  .sort-select,
  :deep(.search-input),
  .copy,
  .col label,
  .value,
  .member,
  .footer-arrow,
  .footer-item label,
  .footer-value {
    margin-right: 0;
    margin-left: 5px;
  }

  .vip {
    right: 0;
    left: auto;
    border-radius: 0 2px;
  }
}
</style>
