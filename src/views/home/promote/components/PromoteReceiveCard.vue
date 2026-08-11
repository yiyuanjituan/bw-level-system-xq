<script setup lang="ts">
import vipBadgeIcon from "@/assets/home/promote/vip-badge.avif";
import Copy from "@/components/Common/Copy.vue";
import type { PromoteSubordinateReceive } from "../types";

defineProps<{
  member: PromoteSubordinateReceive;
}>();

const emit = defineEmits<{
  openMember: [member: PromoteSubordinateReceive];
  openChildren: [member: PromoteSubordinateReceive];
  openOther: [member: PromoteSubordinateReceive];
}>();

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}
</script>

<template>
  <div class="receive-card">
    <div class="receive-row">
      <span class="receive-column">
        <span class="account-column">
          <span class="vip-badge">
            <img :src="vipBadgeIcon" alt="" />
            <span class="vip-level">{{ member.vipLevel }}</span>
          </span>
          <span class="member-account">
            <button type="button" class="member-info" @click="emit('openMember', member)">{{ member.userIdx }}</button>
            <copy class="copy-button" :text="String(member.userIdx)" />
          </span>
        </span>
      </span>
      <span class="receive-column">
        <label>他的下级</label>
        <button
          type="button"
          class="number value link-value"
          :class="{ 'link-value--disabled': member.directChildCount <= 0 }"
          :disabled="member.directChildCount <= 0"
          @click="emit('openChildren', member)"
        >
          {{ member.directChildCount }}
        </button>
      </span>
    </div>
    <div class="receive-row">
      <span class="receive-column"><label>活动领取</label><span class="number value">{{ formatMoney(member.activityReward) }}</span></span>
      <span class="receive-column"><label>返水领取</label><span class="number value">{{ formatMoney(member.returnGold) }}</span></span>
    </div>
    <div class="receive-row">
      <span class="receive-column"><label>任务领取</label><span class="number value">{{ formatMoney(member.taskReward) }}</span></span>
      <span class="receive-column"><label>代理佣金</label><span class="number value">{{ formatMoney(member.agentCommission) }}</span></span>
    </div>
    <div class="receive-row">
      <span class="receive-column">
        <label>其他汇总</label>
        <button
          type="button"
          class="number value link-value"
          :class="{ 'link-value--disabled': member.totalOther <= 0 }"
          :disabled="member.totalOther <= 0"
          @click="emit('openOther', member)"
        >
          {{ formatMoney(member.totalOther) }}
        </button>
      </span>
      <span class="receive-column"><label>合计领取</label><span class="number value">{{ formatMoney(member.totalReward) }}</span></span>
    </div>
  </div>
</template>

<style scoped lang="less">
.receive-card {
  position: relative;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
}

.receive-card:nth-child(odd) {
  background-color: var(--skin__bg_2);
}

.receive-card:nth-child(even) {
  background-color: var(--skin__bg_1);
}

.receive-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.receive-row:not(:last-child) {
  margin-bottom: 5px;
}

.receive-column {
  display: flex;
  width: 50%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  color: var(--skin__neutral_2);
}

.receive-column label {
  margin-right: 5px;
}

.number {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  color: var(--skin__lead);
  line-height: 1;
  word-break: break-all;
}

.value {
  margin-right: 2px;
}

.account-column,
.member-account {
  display: inline-flex;
  align-items: center;
}

.member-account {
  margin-right: 5px;
  color: var(--skin__lead);
}

.member-info {
  padding: 0;
  border-bottom: 0.01rem solid var(--skin__primary);
  border-top: 0;
  border-right: 0;
  border-left: 0;
  background: transparent;
  color: var(--skin__primary);
  font: inherit;
  line-height: inherit;
  cursor: pointer;
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

.copy-button {
  margin-left: 8px;
  color: var(--skin__primary);
  font-size: 15px;
  line-height: 1;
  transform: translateY(2px);
}

.link-value {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.06rem;
}

.link-value--disabled {
  color: var(--skin__lead);
  cursor: default;
  text-decoration: none;
}

[dir="rtl"] {
  .receive-column label,
  .value,
  .member-account,
  .copy-button {
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
