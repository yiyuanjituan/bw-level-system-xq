<script setup lang="ts">
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import useClipboard from "vue-clipboard3";
import { getPromoteSubordinateDetail } from "@/api/common";
import vipBadgeIcon from "@/assets/home/promote/vip-badge.avif";
import UiLoading from "@/components/UI/loading.vue";
import { showCustomToast } from "@/hooks/useCommon";
import type { PromoteSubordinateDetail } from "../types";

const props = defineProps<{
  show: boolean;
  userIdx: number;
}>();

const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
}>();

const loading = ref(false);
const failed = ref(false);
const detail = ref<PromoteSubordinateDetail | null>(null);
let latestRequestId = 0;
const { toClipboard } = useClipboard();

const sections = computed(() => [
  { title: "今日数据", value: detail.value?.today },
  { title: "昨日数据", value: detail.value?.yesterday },
  { title: "累计数据", value: detail.value?.total }
]);

function formatMoney(value: unknown) {
  return Number(value || 0).toFixed(2);
}

function formatTime(timestamp: number) {
  if (!timestamp) return "-";
  return dayjs(timestamp * 1000).format("YYYY/MM/DD HH:mm:ss");
}

function formatDate(timestamp: number) {
  if (!timestamp) return "-";
  return dayjs(timestamp * 1000).format("YYYY/MM/DD");
}

async function loadDetail() {
  if (!props.userIdx) return;

  const requestId = ++latestRequestId;
  loading.value = true;
  failed.value = false;
  detail.value = null;
  try {
    const response = await getPromoteSubordinateDetail(props.userIdx) as PromoteSubordinateDetail;
    if (requestId === latestRequestId) {
      detail.value = response;
    }
  } catch {
    if (requestId === latestRequestId) {
      failed.value = true;
    }
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false;
    }
  }
}

async function copyMemberId() {
  if (!detail.value) return;

  try {
    await toClipboard(String(detail.value.userIdx));
    showCustomToast({ type: "success", message: "会员ID复制成功" });
  } catch {
    showCustomToast({ type: "fail", message: "复制失败，请稍后重试" });
  }
}

function closeDialog() {
  emit("update:show", false);
}

watch(
  [() => props.show, () => props.userIdx],
  ([show]) => {
    if (show) void loadDetail();
  }
);
</script>

<template>
  <van-dialog
    :show="show"
    title="会员详情"
    :width="350"
    :z-index="2019"
    :show-confirm-button="false"
    :show-cancel-button="false"
    close-on-click-overlay
    destroy-on-close
    class-name="member-detail-dialog"
    teleport="body"
    @update:show="emit('update:show', $event)"
  >
    <div class="content">
      <div v-if="loading" class="state">
        <ui-loading />
      </div>
      <div v-else-if="failed" class="state error">
        <span>加载失败</span>
        <button type="button" @click="loadDetail">重新加载</button>
      </div>
      <template v-else-if="detail">
        <div class="base-info">
          <div class="row">
            <span class="col">
              <span class="account">
                <span class="vip">
                  <img :src="vipBadgeIcon" alt="" />
                  <span class="vip-level">{{ detail.vipLevel }}</span>
                </span>
                <span class="member">
                  <span>{{ detail.userIdx }}</span>
                  <button class="copy" type="button" aria-label="复制会员ID" @click="copyMemberId">
                    <svg-icon name="comm_icon_copy" />
                  </button>
                </span>
              </span>
            </span>
            <span class="col">
              <label>账号状态</label>
              <span class="number value" :class="detail.status === 1 ? 'green' : 'red'">{{ detail.status === 1 ? "正常" : "停用" }}</span>
            </span>
          </div>
          <div class="row">
            <span class="col"><label>当前</label><span><span class="number value" :class="{ green: detail.online === 1 }">{{ detail.online === 1 ? "在线" : "离线" }}</span></span></span>
            <span class="col"><label>登录次数</label><span><span class="number value">{{ detail.loginTimes }}</span></span></span>
          </div>
          <div class="row">
            <span class="col"><label>登录日期</label><span><span class="value">{{ formatTime(detail.lastLoginTime) }}</span></span></span>
            <span class="col"><label>注册日期</label><span><span class="value">{{ formatDate(detail.regTime) }}</span></span></span>
          </div>
        </div>

        <div v-for="section in sections" :key="section.title" class="data-section">
          <p>{{ section.title }}</p>
          <div class="row">
            <span class="col"><label>充值金额</label><span class="value"><span class="number">{{ formatMoney(section.value?.deposit) }}</span></span></span>
            <span class="col"><label>提现金额</label><span class="value"><span class="number">{{ formatMoney(section.value?.withdraw) }}</span></span></span>
          </div>
          <div class="row">
            <span class="col"><label>充提差额</label><span class="value"><span class="number">{{ formatMoney(section.value?.difference) }}</span></span></span>
            <span class="col"><label>领取优惠</label><span class="value"><span class="number">{{ formatMoney(section.value?.discount) }}</span></span></span>
          </div>
          <div class="row">
            <span class="col"><label>有效投注</label><span class="value"><span class="number">{{ formatMoney(section.value?.validBet) }}</span></span></span>
            <span class="col"><label>输赢金额</label><span class="value"><span class="number" :class="Number(section.value?.profit) < 0 ? 'red' : ''">{{ formatMoney(section.value?.profit) }}</span></span></span>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" role="button" tabindex="0" aria-label="关闭" @click="closeDialog" @keydown.enter="closeDialog">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
.content {
  max-height: 450px;
  box-sizing: border-box;
  padding: 0 10px;
  overflow-y: auto;
  color: var(--skin__lead);
}

.state {
  display: flex;
  height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error {
  color: var(--skin__neutral_2);
  font-size: 11px;
}

.error button {
  padding: 5px 10px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 5px;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;
}

.base-info,
.data-section {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
}

.base-info {
  margin-bottom: 10px;
  border: var(--lobby__px) solid var(--skin__border);
}

.data-section {
  border: none;
}

.data-section:nth-child(odd) {
  background: var(--skin__bg_2);
}

.data-section:nth-child(even) {
  background: var(--skin__bg_1);
}

.data-section p {
  margin: 0 0 10px;
  color: var(--skin__lead);
  font-size: 12px;
  text-align: center;
}

.row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 10px;
}

.row:not(:last-child) {
  margin-bottom: 10px;
}

.col {
  display: flex;
  width: 50%;
  min-width: 0;
  color: var(--skin__lead);
}

.col label {
  display: -webkit-box;
  max-width: 75px;
  margin-right: 2.5px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.value {
  display: -webkit-box;
  max-width: 90px;
  overflow: hidden;
  line-height: 14.5px;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.number {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  color: var(--skin__lead);
  word-break: break-all;
}

.green {
  color: var(--skin__accent_1);
}

.red {
  color: var(--skin__accent_2);
}

.account,
.member {
  display: inline-flex;
  align-items: center;
}

.vip {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  height: 11.5px;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 2px 0;
  background: #c12929;
}

.vip img {
  width: 8px;
  height: 8px;
}

.vip-level {
  padding-right: 2.5px;
  margin-left: -1.5px;
  background: linear-gradient(to bottom, #f7ea94 -5%, #e5b952 58%, #ce9510 114%);
  background-clip: text;
  font-size: 9px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  -webkit-text-fill-color: transparent;
}

.member {
  margin-right: 5px;
  color: var(--skin__lead);
}

.copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 7.5px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;
  font-size: 14.5px;
  transform: translateY(2px);
}

.footer-box {
  position: relative;
  display: flex;
  width: 100%;
  height: 45px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  font-size: 8px;
}

.close-icon {
  color: white;
  cursor: pointer;
  font-size: 30px;
}

:global(.member-detail-dialog) {
  max-width: calc(100vw - 20px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

:global(.member-detail-dialog .van-dialog__header) {
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

:global(.member-detail-dialog .van-dialog__content) {
  padding: 0 0 10px;
  border: var(--lobby__px) solid var(--skin__border);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: var(--skin__bg_2);
}

:global(.member-detail-dialog .van-dialog__footer) {
  background: transparent;
}

[dir="rtl"] .col label {
  margin-right: 0;
  margin-left: 2.5px;
}

[dir="rtl"] .vip {
  right: 0;
  left: auto;
  flex-direction: row-reverse;
  border-radius: 0 2px;
}

[dir="rtl"] .vip-level {
  padding-right: 0;
  padding-left: 2.5px;
  margin-right: -1.5px;
  margin-left: 0;
}

[dir="rtl"] .member {
  margin-right: 0;
  margin-left: 5px;
}

[dir="rtl"] .copy {
  margin-right: 7.5px;
  margin-left: 0;
}

html:not([lang="zh"]):not([lang="zh_hk"]) .row {
  align-items: flex-start;
}

html:not([lang="zh"]):not([lang="zh_hk"]) .col {
  max-width: 100%;
  align-items: center;
  justify-content: flex-start;
  line-height: 100%;
}

html:not([lang="zh"]):not([lang="zh_hk"]) .col label,
html:not([lang="zh"]):not([lang="zh_hk"]) .col span {
  max-width: 100%;
}
</style>
