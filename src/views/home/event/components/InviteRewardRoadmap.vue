<script setup lang="ts">
import { computed } from "vue";
import type { SpecialInviteRule } from "@/api/common";
import redpackClaimableSealImage from "@/assets/home/event/invite/invite-redpack-claimable-seal.avif";
import redpackClosedImage from "@/assets/home/event/invite/invite-redpack-closed.avif";
import redpackImage from "@/assets/home/event/invite/invite-redpack.avif";
import redpackMarkImage from "@/assets/home/event/invite/invite-redpack-mark.avif";
import redpackOpenImage from "@/assets/home/event/invite/invite-redpack-open.avif";
import redpackOpenedImage from "@/assets/home/event/invite/invite-redpack-opened.avif";
import redpackSealBackgroundImage from "@/assets/home/event/invite/invite-redpack-seal-background.avif";

const props = withDefaults(
  defineProps<{
    rules?: SpecialInviteRule[];
    validInviteCount?: number;
    receivingRewardId?: number | null;
  }>(),
  {
    rules: () => [],
    validInviteCount: 0,
    receivingRewardId: null
  }
);

const emit = defineEmits<{
  receive: [rule: SpecialInviteRule];
}>();

const rewardRows = computed(() => {
  const rows: SpecialInviteRule[][] = [];
  for (let index = 0; index < props.rules.length; index += 4) {
    rows.push(props.rules.slice(index, index + 4));
  }
  return rows;
});

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function getRewardText(rule: SpecialInviteRule) {
  if (rule.minAmount !== undefined && rule.maxAmount !== undefined) {
    return `${formatMoney(rule.minAmount)}-${formatMoney(rule.maxAmount)}`;
  }
  return `最高${formatMoney(rule.displayMaxAmount)}`;
}

function getRedpackImage(rule: SpecialInviteRule) {
  return rule.reward?.status === 2 ? redpackOpenedImage : redpackClosedImage;
}

function isItemArrowActive(row: SpecialInviteRule[], ruleIndex: number) {
  const currentRule = row[ruleIndex];
  const nextRule = row[ruleIndex + 1];
  return Math.max(currentRule.inviteCount, nextRule.inviteCount) <= props.validInviteCount;
}

function isRowArrowActive(rowIndex: number) {
  const nextRow = rewardRows.value[rowIndex + 1];
  if (!nextRow?.length) return false;
  return Math.min(...nextRow.map(rule => rule.inviteCount)) <= props.validInviteCount;
}
</script>

<template>
  <section class="reward-roadmap">
    <div
      v-for="(row, rowIndex) in rewardRows"
      :key="rowIndex"
      class="reward-roadmap__row"
      :class="{ 'reward-roadmap__row--reverse': rowIndex % 2 === 1 }"
    >
      <div class="reward-roadmap__items">
        <template v-for="(rule, ruleIndex) in row" :key="rule.id">
          <button
            type="button"
            class="reward-roadmap__reward"
            :class="{
              'reward-roadmap__reward--pending': rule.reward?.status === 1,
              'reward-roadmap__reward--received': rule.reward?.status === 2
            }"
            :disabled="rule.reward?.status !== 1 || receivingRewardId !== null"
            :title="rule.reward?.status === 1 ? '领取邀请红包' : undefined"
            @click="emit('receive', rule)"
          >
            <span class="reward-roadmap__pattern">
              <span v-if="!rule.reward" class="reward-roadmap__unfinished">
                <img class="reward-roadmap__unfinished-background" :src="redpackImage" alt="" />
                <span class="reward-roadmap__unfinished-open">
                  <img class="reward-roadmap__unfinished-open-background" :src="redpackOpenImage" alt="" />
                  <img class="reward-roadmap__unfinished-mark" :src="redpackMarkImage" alt="" />
                </span>
              </span>
              <span
                v-else
                class="reward-roadmap__available"
                :class="{ 'reward-roadmap__available--received': rule.reward.status === 2 }"
              >
                <img class="reward-roadmap__available-background" :src="getRedpackImage(rule)" alt="" />
                <span
                  v-if="rule.reward.status !== 2"
                  class="reward-roadmap__available-seal"
                >
                  <img
                    class="reward-roadmap__available-seal-background"
                    :src="redpackSealBackgroundImage"
                    alt=""
                  />
                  <img
                    class="reward-roadmap__available-seal-icon"
                    :src="redpackClaimableSealImage"
                    alt=""
                  />
                </span>
              </span>
              <span v-if="rule.reward?.status === 2" class="reward-roadmap__received-amount">
                {{ formatMoney(rule.reward.amount) }}
              </span>
              <span
                class="reward-roadmap__people"
                :class="{ 'reward-roadmap__people--received': rule.reward?.status === 2 }"
              >推广{{ rule.inviteCount }}人</span>
            </span>
            <span class="reward-roadmap__amount">
              {{ receivingRewardId === rule.reward?.id ? "领取中" : getRewardText(rule) }}
            </span>
          </button>

          <span
            v-if="ruleIndex < row.length - 1"
            class="reward-roadmap__item-arrow"
            :class="{ 'reward-roadmap__arrow--active': isItemArrowActive(row, ruleIndex) }"
            aria-hidden="true"
          >
            <svg-icon name="event-invite-route-arrow" />
          </span>
        </template>
      </div>

      <div
        v-if="rowIndex < rewardRows.length - 1"
        class="reward-roadmap__row-arrow"
        :class="{ 'reward-roadmap__arrow--active': isRowArrowActive(rowIndex) }"
        aria-hidden="true"
      >
        <svg-icon name="event-invite-route-arrow" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.reward-roadmap {
  padding-bottom: 0;
}

.reward-roadmap__row {
  padding-top: 6px;
}

.reward-roadmap__items {
  display: flex;
  align-items: center;
}

.reward-roadmap__row--reverse .reward-roadmap__items {
  flex-direction: row-reverse;
}

.reward-roadmap__reward {
  display: block;
  flex: none;
  width: 66px;
  padding: 0;
  border: 0;
  color: inherit;
  font: inherit;
  background: transparent;
  cursor: default;
}

.reward-roadmap__reward--pending {
  cursor: pointer;
}

.reward-roadmap__pattern {
  position: relative;
  display: block;
  width: 66px;
  height: 44px;
}

.reward-roadmap__available {
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: 66px;
  height: 37.5px;
}

.reward-roadmap__available--received {
  height: 44px;
}

.reward-roadmap__available-background {
  display: block;
  width: 100%;
  height: 100%;
}

.reward-roadmap__available-seal {
  position: absolute;
  top: 6px;
  left: 27px;
  display: flex;
  width: 13px;
  height: 13.5px;
  align-items: center;
  justify-content: center;
}

.reward-roadmap__available-seal-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.reward-roadmap__available-seal-icon {
  position: relative;
  z-index: 1;
  display: block;
  width: 8px;
  height: auto;
}

.reward-roadmap__unfinished {
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: 66px;
  height: 37.5px;
}

.reward-roadmap__unfinished-background {
  display: block;
  width: 66px;
  height: 37.5px;
}

.reward-roadmap__unfinished-open {
  position: absolute;
  top: 6px;
  left: 27px;
  display: flex;
  width: 13px;
  height: 13.5px;
  align-items: center;
  justify-content: center;
}

.reward-roadmap__unfinished-open-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.reward-roadmap__unfinished-mark {
  position: relative;
  z-index: 1;
  display: block;
  width: 8px;
}

.reward-roadmap__people {
  position: absolute;
  bottom: 1px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 18px;
  padding: 0 2px;
  overflow: hidden;
  color: #fff;
  font-size: 7px;
  line-height: 9px;
  text-align: center;
}

.reward-roadmap__people--received {
  top: 22.5px;
  bottom: auto;
}

.reward-roadmap__received-amount {
  position: absolute;
  top: 7.5px;
  right: 0;
  left: 0;
  height: 15px;
  overflow: hidden;
  color: var(--skin__accent_3);
  font-size: 9px;
  line-height: 15px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reward-roadmap__amount {
  display: -webkit-box;
  width: 66px;
  height: 20px;
  margin-top: 5px;
  overflow: hidden;
  color: var(--skin__neutral_2);
  font-size: 10px;
  line-height: 0.9;
  text-align: center;
  text-overflow: ellipsis;
  word-break: break-all;
  transform: scale(0.85);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.reward-roadmap__reward--received .reward-roadmap__amount {
  color: var(--skin__accent_3);
}

.reward-roadmap__item-arrow,
.reward-roadmap__row-arrow {
  color: var(--skin__neutral_2);
}

.reward-roadmap__arrow--active {
  color: var(--skin__accent_3);
}

.reward-roadmap__item-arrow {
  display: block;
  flex: none;
  padding: 0 6.3px 15px;
}

.reward-roadmap__row--reverse .reward-roadmap__item-arrow {
  transform: rotateY(180deg);
}

.reward-roadmap__row-arrow {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.reward-roadmap__row--reverse .reward-roadmap__row-arrow {
  justify-content: flex-start;
}

.reward-roadmap__item-arrow :deep(.svg-icon),
.reward-roadmap__row-arrow :deep(.svg-icon) {
  width: 11px;
  height: 10px;
}

.reward-roadmap__row-arrow :deep(.svg-icon) {
  margin-right: 26px;
  transform: rotate(90deg);
}

.reward-roadmap__row--reverse .reward-roadmap__row-arrow :deep(.svg-icon) {
  margin-right: 0;
  margin-left: 28.5px;
}
</style>
