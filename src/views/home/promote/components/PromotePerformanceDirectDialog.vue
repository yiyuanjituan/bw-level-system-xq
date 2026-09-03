<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { getPromoteCommissionDirectDetail } from "@/api/common";
import vipBadgeIcon from "@/assets/home/promote/vip-badge.avif";
import Copy from "@/components/Common/Copy.vue";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import type {
  PromoteCommissionDirectDetailResponse,
  PromoteCommissionDirectMember
} from "../types";

const props = defineProps<{
  show: boolean;
  settlementId: number;
}>();

const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
}>();

const DEFAULT_PAGE_SIZE = 20;
const detail = ref<PromoteCommissionDirectDetailResponse | null>(null);
const members = ref<PromoteCommissionDirectMember[]>([]);
const loading = ref(false);
const failed = ref(false);
const finished = ref(false);
const nextCursorId = ref<number | null>(null);
let latestRequestId = 0;

const hasMembers = computed(() => members.value.length > 0);
const isNetProfitMode = computed(() => [1, 2, 3].includes(Number(detail.value?.agentMode)));
const settlementDate = computed(() => {
  const date = dayjs(detail.value?.settlementDate);
  return date.isValid() ? date.format("YYYY/MM/DD") : "-";
});

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function getContributionPerformance(member: PromoteCommissionDirectMember) {
  return isNetProfitMode.value ? 0 - member.netProfit : member.validBetAmount;
}

function getAmountClass(value: unknown) {
  const amount = Number(value);
  return {
    "value--green": amount < 0,
    "value--red": amount > 0
  };
}

function normalizeResponse(response: unknown): PromoteCommissionDirectDetailResponse {
  const source = (response as any)?.data ?? response ?? {};
  return {
    settlementId: Number(source.settlementId) || 0,
    agentMode: Number(source.agentMode) || 0,
    settlementDate: String(source.settlementDate || ""),
    directPerformance: Number(source.directPerformance) || 0,
    carryInAmount: Number(source.carryInAmount) || 0,
    currentPerformance: Number(source.currentPerformance) || 0,
    commissionRate: Number(source.commissionRate) || 0,
    directCommission: Number(source.directCommission) || 0,
    directMemberCount: Math.max(Math.trunc(Number(source.directMemberCount) || 0), 0),
    list: Array.isArray(source.list)
      ? source.list.map((member: any) => ({
        memberId: Number(member.memberId) || 0,
        userIdx: Number(member.userIdx) || 0,
        vipLevel: Number(member.vipLevel) || 0,
        netProfit: Number(member.netProfit) || 0,
        winLoseAmount: Number(member.winLoseAmount) || 0,
        rewardAmount: Number(member.rewardAmount) || 0,
        discountAmount: Number(member.discountAmount) || 0,
        validBetAmount: Number(member.validBetAmount) || 0,
        thirdPartyCost: Number(member.thirdPartyCost) || 0,
        feeAmount: Number(member.feeAmount) || 0
      }))
      : [],
    pageSize: Math.max(Math.trunc(Number(source.pageSize) || DEFAULT_PAGE_SIZE), 1),
    more: Boolean(source.more),
    nextCursorId: Number.isInteger(Number(source.nextCursorId)) && Number(source.nextCursorId) > 0
      ? Number(source.nextCursorId)
      : null
  };
}

async function loadDetail(reset = false) {
  if (!props.settlementId || (loading.value && !reset)) return;

  if (reset) {
    detail.value = null;
    members.value = [];
    nextCursorId.value = null;
    failed.value = false;
    finished.value = false;
  }

  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const response = normalizeResponse(await getPromoteCommissionDirectDetail({
      settlementId: props.settlementId,
      size: DEFAULT_PAGE_SIZE,
      ...(nextCursorId.value ? { cursorId: nextCursorId.value } : {})
    }));
    if (requestId !== latestRequestId) return;

    detail.value = response;
    members.value = reset ? response.list : [...members.value, ...response.list];
    nextCursorId.value = response.nextCursorId;
    failed.value = false;
    finished.value = !response.more || !response.nextCursorId;
  } catch {
    if (requestId !== latestRequestId) return;
    failed.value = true;
    finished.value = true;
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

function closeDialog() {
  latestRequestId += 1;
  emit("update:show", false);
}

watch(
  [() => props.show, () => props.settlementId],
  ([show]) => {
    if (show) void loadDetail(true);
  }
);
</script>

<template>
  <van-dialog
    :show="show"
    :title="$t('直属业绩')"
    :width="335"
    :z-index="2020"
    :show-confirm-button="false"
    :show-cancel-button="false"
    close-on-click-overlay
    destroy-on-close
    class-name="performance-direct-dialog"
    teleport="body"
    @update:show="emit('update:show', $event)"
  >
    <div class="dialog-content">
      <div v-if="loading && !detail" class="dialog-state"><ui-loading /></div>
      <div v-else-if="failed && !detail" class="dialog-state dialog-state--failed">
        <span>加载失败</span>
        <button type="button" @click="loadDetail(true)">重新加载</button>
      </div>
      <template v-else-if="detail">
        <div class="detail-summary">
          <span><label>结算日期</label><span class="value">{{ settlementDate }}</span></span>
          <span><label>直属业绩</label><span class="value">{{ formatMoney(detail.directPerformance) }}</span></span>
        </div>

        <div class="member-list">
          <ui-empty v-if="!hasMembers" :text="failed ? '加载失败，请重试' : '暂无内容'">
            <template #text="{ text }">
              <span class="empty-text">
                <span>{{ text }}</span>
                <button v-if="failed" type="button" @click="loadDetail(true)">重新加载</button>
              </span>
            </template>
          </ui-empty>

          <van-list
            v-else
            v-model:loading="loading"
            :finished="finished"
            :immediate-check="false"
            @load="loadDetail(false)"
          >
            <template #loading><div class="dialog-loading"><ui-loading /></div></template>
            <article v-for="member in members" :key="member.memberId" class="member-record">
              <div class="record-row">
                <span class="record-column">
                  <span class="account-column">
                    <span class="vip-badge">
                      <img :src="vipBadgeIcon" alt="" />
                      <span class="vip-level">{{ member.vipLevel }}</span>
                    </span>
                    <span class="member-account">
                      <span>{{ member.userIdx }}</span>
                      <copy class="copy-button" :text="String(member.userIdx)" />
                    </span>
                  </span>
                </span>
                <span class="record-column">
                  <label>贡献业绩</label>
                  <span class="value">{{ formatMoney(getContributionPerformance(member)) }}</span>
                </span>
              </div>
              <div class="record-row">
                <span class="record-column">
                  <label>会员输赢</label>
                  <span class="value" :class="getAmountClass(member.winLoseAmount)">{{ formatMoney(member.winLoseAmount) }}</span>
                </span>
                <span class="record-column"><label>优惠领取</label><span class="value">{{ formatMoney(member.discountAmount) }}</span></span>
              </div>
            </article>
            <button v-if="failed" class="load-error" type="button" @click="loadDetail(false)">加载失败，点击重试</button>
          </van-list>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="close-button" :aria-label="$t('关闭')" @click="closeDialog">
          <svg-icon name="close" color="white" />
        </button>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
.dialog-content {
  display: flex;
  max-height: 490px;
  box-sizing: border-box;
  flex-direction: column;
  padding: 0 10px 10px;
  color: var(--skin__lead);
}

.dialog-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
}

.dialog-state--failed {
  flex-direction: column;
  gap: 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;

  button {
    padding: 5px 10px;
    border: var(--lobby__px) solid var(--skin__primary);
    border-radius: 8px;
    background: transparent;
    color: var(--skin__primary);
  }
}

.detail-summary {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 10px;
  color: var(--skin__lead);
  font-size: 10px;

  > span {
    display: flex;
    width: 50%;
    align-items: center;
    color: var(--skin__neutral_2);
  }

  > span:first-child { margin-right: 10px; }
  label { margin-right: 2.5px; }
}

.member-list {
  min-height: 150px;
  flex: 1;
  overflow-y: auto;
}

.member-record {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;

  &:nth-child(odd) { background: var(--skin__bg_1); }
  &:nth-child(even) { background: var(--skin__bg_2); }
}

.record-row {
  display: flex;
  align-items: center;

  &:not(:last-child) { margin-bottom: 5px; }
}

.record-column {
  display: flex;
  width: 50%;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__neutral_2);

  label { margin-right: 5px; }
}

.value {
  margin-right: 2.5px;
  color: var(--skin__lead);
  word-break: break-all;
}

.value--green { color: var(--skin__accent_1); }
.value--red { color: var(--skin__accent_2); }

.account-column,
.member-account {
  display: inline-flex;
  align-items: center;
}

.vip-badge {
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

  img { width: 8px; height: 8px; }
}

.vip-level {
  padding-right: 3px;
  margin-left: -2px;
  background: linear-gradient(to bottom, #f7ea94 -5%, #e5b952 58%, #ce9510 114%);
  background-clip: text;
  font-size: 9px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  -webkit-text-fill-color: transparent;
}

.member-account {
  margin-right: 5px;
  color: var(--skin__lead);
}

.copy-button {
  margin-left: 8px;
  color: var(--skin__primary);
  font-size: 15px;
  line-height: 1;
  transform: translateY(2px);
}

.dialog-loading {
  display: flex;
  padding: 10px;
  align-items: center;
  justify-content: center;
}

.empty-text {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  button {
    padding: 2px 6px;
    border: var(--lobby__px) solid var(--skin__primary);
    border-radius: 8px;
    background: transparent;
    color: var(--skin__primary);
    font-size: 9px;
  }
}

.load-error {
  width: 100%;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  font-size: 10px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  width: 100%;
  height: 45px;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
}

.close-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

:global(.performance-direct-dialog) {
  max-width: calc(100vw - 20px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

:global(.performance-direct-dialog .van-dialog__header) {
  position: relative;
  z-index: 1;
  padding: 10px 15px 15px;
  border: var(--lobby__px) solid var(--skin__border);
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  background: var(--skin__bg_2);
  color: var(--skin__lead);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
}

:global(.performance-direct-dialog .van-dialog__content) {
  padding: 0;
  border: var(--lobby__px) solid var(--skin__border);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: var(--skin__bg_2);
}

:global(.performance-direct-dialog .van-dialog__footer) { background: transparent; }

[dir="rtl"] {
  .detail-summary > span:first-child,
  .detail-summary label,
  .record-column label,
  .value,
  .member-account {
    margin-right: 0;
    margin-left: 5px;
  }

  .vip-badge {
    right: 0;
    left: auto;
    flex-direction: row-reverse;
    border-radius: 0 2px;
  }

  .vip-level {
    padding-right: 0;
    padding-left: 3px;
    margin-right: -2px;
    margin-left: 0;
  }

  .copy-button {
    margin-right: 8px;
    margin-left: 0;
  }
}
</style>
