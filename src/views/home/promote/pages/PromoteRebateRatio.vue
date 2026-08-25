<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PromoteInfo } from "../types";

const props = defineProps<{
  info: PromoteInfo | null;
}>();

const activeGroupKey = ref("");
const showValidMemberTooltip = ref(false);
const ruleGroups = computed(() => props.info?.ruleGroups || []);
const isUnlimitedMode = computed(() => [4, 5].includes(props.info?.config.agentMode || 0));
const gameClassifyIcons: Record<string, string> = {
  "1": "game-icon_dtfl_zr_0",
  "2": "game-icon_dtfl_by_0",
  "3": "game-icon_dtfl_dz_0",
  "4": "game-icon_dtfl_cp_0",
  "5": "game-icon_dtfl_ty_0",
  "6": "game-icon_dtfl_qp_0",
  "7": "game-icon_dtfl_dianjing_0",
};
const activeGroup = computed(() =>
  ruleGroups.value.find(group => group.key === activeGroupKey.value) || ruleGroups.value[0]
);

watch(
  ruleGroups,
  groups => {
    if (!groups.some(group => group.key === activeGroupKey.value))
      activeGroupKey.value = groups[0]?.key || "";
  },
  { immediate: true }
);

function formatNumber(value: number) {
  return Number(value || 0).toFixed(2);
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getGameClassifyIcon(groupKey: string) {
  const gameClassify = String(groupKey).replace(/^game-/, "");
  return gameClassifyIcons[gameClassify];
}

function getCommissionAmount(performanceAmount: number, commissionRate: number, commissionAmount?: number) {
  // 后端返回返佣金额时直接使用；旧接口未返回时按业绩和比例计算，兼容无限代与无限极差模式。
  if (commissionAmount !== undefined && commissionAmount !== null)
    return commissionAmount;

  return performanceAmount * commissionRate / 100;
}
</script>

<template>
  <div class="rebate-ratio">
    <div
      v-if="activeGroup"
      class="rebate-ratio__content"
      :class="{
        'rebate-ratio__content--unlimited': isUnlimitedMode,
        'rebate-ratio__content--net-profit': !isUnlimitedMode,
      }"
    >
      <nav v-if="isUnlimitedMode" class="rebate-ratio__groups" :aria-label="$t('游戏分类')">
        <button
          v-for="group in ruleGroups"
          :key="group.key"
          type="button"
          class="rebate-ratio__group-button"
          :class="{ 'rebate-ratio__group-button--active': group.key === activeGroup.key }"
          @click="activeGroupKey = group.key"
        >
          <span v-if="getGameClassifyIcon(group.key)" class="rebate-ratio__group-icon">
            <svg-icon :name="getGameClassifyIcon(group.key)" />
          </span>
          <span class="rebate-ratio__group-name">{{ group.name }}</span>
        </button>
      </nav>

      <section class="rebate-ratio__table" :aria-label="`${activeGroup.name}返佣比例`">
        <div class="rebate-ratio__header">
          <span class="rebate-ratio__header-cell">
            <span>有效人数</span>
            <van-popover
              v-model:show="showValidMemberTooltip"
              placement="bottom-start"
              :offset="[-10, 8]"
            >
              <span class="rebate-ratio__tooltip-content">
                有效的条件：该下级充值金额<em> ≥ {{ formatNumber(info?.config.validMemberRechargeAmount ?? 0) }}</em>，并且有效投注<em> ≥ {{ formatNumber(info?.config.validMemberBetAmount ?? 0) }}</em>
              </span>
              <template #reference>
                <button
                  type="button"
                  class="rebate-ratio__tooltip"
                  :aria-label="$t('查看有效人数统计要求')"
                >
                  ?
                </button>
              </template>
            </van-popover>
          </span>
          <span class="rebate-ratio__header-cell rebate-ratio__performance-title">
            <span>业绩</span>
            <small>（单位：个）</small>
          </span>
          <span
            v-if="isUnlimitedMode"
            class="rebate-ratio__header-cell rebate-ratio__commission-title"
          >
            <span>返佣金额</span>
            <small>（比例）</small>
          </span>
          <span v-else class="rebate-ratio__header-cell">返佣比例</span>
        </div>

        <div class="rebate-ratio__body">
          <div
            v-for="rule in activeGroup.rules"
            :key="rule.id"
            class="rebate-ratio__row"
          >
            <span>{{ rule.validMemberCount }}</span>
            <span>{{ formatNumber(rule.performanceAmount) }}</span>
            <strong v-if="isUnlimitedMode">
              {{ formatAmount(getCommissionAmount(
                rule.performanceAmount,
                rule.commissionRate,
                rule.commissionAmount
              )) }}
              <small>({{ formatNumber(rule.commissionRate) }}%)</small>
            </strong>
            <strong v-else>{{ formatNumber(rule.commissionRate) }}<small>%</small></strong>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="rebate-ratio__empty">
      {{ info ? "暂无返佣规则" : "代理配置加载中" }}
    </div>
  </div>
</template>

<style scoped lang="less">
.rebate-ratio {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.rebate-ratio__content {
  display: flex;
  width: 100%;
  height: 100%;
}

.rebate-ratio__content--unlimited {
  gap: 10px;
}

.rebate-ratio__content--net-profit {
  display: block;
}

.rebate-ratio__groups {
  display: flex;
  flex: 0 0 75px;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.rebate-ratio__group-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 35px;
  padding: 5px 3px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 5px;
  color: var(--skin__neutral_2);
  font-size: 12px;
  line-height: 1.3;
  background: var(--skin__bg_2);
}

.rebate-ratio__group-icon {
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 18px;
  font-size: 18px;
}

.rebate-ratio__group-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
}

.rebate-ratio__group-button--active {
  border-color: var(--skin__primary);
  color: var(--skin__primary);
}

.rebate-ratio__table {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.rebate-ratio__header,
.rebate-ratio__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  text-align: center;
}

.rebate-ratio__header {
  flex-shrink: 0;
  min-height: 40px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 5px;
  background: var(--skin__bg_2);
}

.rebate-ratio__header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 5px;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 15px;
}

.rebate-ratio__performance-title,
.rebate-ratio__commission-title {
  flex-direction: column;

  small {
    color: var(--skin__neutral_2);
    font-size: 9px;
  }
}

.rebate-ratio__tooltip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  margin-left: 5px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--skin__text_primary);
  font-size: 9px;
  line-height: 12px;
  background: var(--skin__primary);
}

.rebate-ratio__tooltip-content {
  display: block;
  width: 220px;
  margin: 0;
  padding: 8px 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;
  line-height: 1.5;

  em {
    color: var(--skin__lead);
    font-style: normal;
  }
}

.rebate-ratio__body {
  min-height: 0;
  overflow-y: auto;
}

.rebate-ratio__row {
  min-height: 35px;
  border-radius: 5px;
  background: var(--skin__bg_1);

  &:nth-child(even) {
    background: var(--skin__bg_2);
  }

  > span,
  > strong {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 5px;
    color: var(--skin__lead);
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
    direction: ltr;
  }

  > strong {
    color: var(--skin__accent_3, #ffaa09);

    small {
      font-size: inherit;
    }
  }
}

.rebate-ratio__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--skin__neutral_2);
  font-size: 12px;
}
</style>
