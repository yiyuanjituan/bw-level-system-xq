<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getPromoteData } from "@/api/common";
import type { PromoteDataResponse } from "../types";

type PeriodValue = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

interface DataCard {
  title: string;
  unit?: string;
  winLoss?: boolean;
  totalValue: string;
  totalCount?: string;
  directValue: string;
  directCount?: string;
  otherValue: string;
  otherCount?: string;
}

interface AccumulatedMetric {
  label: string;
  value: string;
  highlight?: boolean;
  link?: boolean;
  winLoss?: boolean;
}

const periods: Array<{ label: string; value: PeriodValue; timeEnum: number }> = [
  { label: "今日", value: "today", timeEnum: 1 },
  { label: "昨日", value: "yesterday", timeEnum: 2 },
  { label: "本周", value: "thisWeek", timeEnum: 3 },
  { label: "上周", value: "lastWeek", timeEnum: 4 },
  { label: "本月", value: "thisMonth", timeEnum: 5 },
  { label: "上月", value: "lastMonth", timeEnum: 6 },
];

const activePeriod = ref<PeriodValue>("today");
const periodCache = ref<Partial<Record<PeriodValue, PromoteDataResponse>>>({});
const loading = ref(false);
const requestFailed = ref(false);
let latestRequestId = 0;

const currentData = computed(() => periodCache.value[activePeriod.value]);
const commissionTitle = computed(
  () => `${periods.find(period => period.value === activePeriod.value)?.label ?? "今日"}佣金`,
);

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function formatCount(value: unknown) {
  const count = Number(value);
  return Number.isFinite(count) ? String(Math.max(Math.trunc(count), 0)) : "0";
}

function getWinLossClass(value: string) {
  const amount = Number(value);
  return {
    "_number-column-green_1ngn0_76": amount < 0,
    "_number-column-red_1ngn0_82": amount > 0,
  };
}

function hasValue(value: string) {
  return Number(value) !== 0;
}

const commissionDetails = computed(() => {
  const response = currentData.value;
  return [
    { label: "直属佣金", value: formatMoney(response?.timeDirectCommission), highlight: true },
    { label: "其他佣金", value: formatMoney(response?.timeOtherCommission), highlight: true },
    { label: "推广活动奖励", value: formatMoney(response?.timePromoteActiveAmount) },
    { label: "代理活动奖励", value: formatMoney(response?.timeAgentActiveAmount) },
  ];
});

const allDataCards = computed<DataCard[]>(() => {
  const response = currentData.value;
  return [
    {
      title: "总新增人数",
      totalValue: formatCount(response?.timeNewAddTotalMember),
      directValue: formatCount(response?.timeNewAddDirectMember),
      otherValue: formatCount(response?.timeNewAddOtherMember),
    },
    {
      title: "总充值",
      unit: "人次",
      totalValue: formatMoney(response?.timeTotalDeposit),
      totalCount: formatCount(response?.timeTotalDepositPerson),
      directValue: formatMoney(response?.timeDirectDeposit),
      directCount: formatCount(response?.timeDirectDepositPerson),
      otherValue: formatMoney(response?.timeOtherDeposit),
      otherCount: formatCount(response?.timeOtherDepositPerson),
    },
    {
      title: "总首充",
      unit: "人数",
      totalValue: formatMoney(response?.timeTotalFirstDeposit),
      totalCount: formatCount(response?.timeTotalFirstDepositPerson),
      directValue: formatMoney(response?.timeDirectFirstDeposit),
      directCount: formatCount(response?.timeDirectFirstDepositPerson),
      otherValue: formatMoney(response?.timeOtherFirstDeposit),
      otherCount: formatCount(response?.timeOtherFirstDepositPerson),
    },
    {
      title: "当天注册首充",
      unit: "人数",
      totalValue: formatMoney(response?.timeTotalRegisterDeposit),
      totalCount: formatCount(response?.timeTotalRegisterDepositPerson),
      directValue: formatMoney(response?.timeDirectRegisterDeposit),
      directCount: formatCount(response?.timeDirectRegisterDepositPerson),
      otherValue: formatMoney(response?.timeOtherRegisterDeposit),
      otherCount: formatCount(response?.timeOtherRegisterDepositPerson),
    },
    {
      title: "总提现",
      unit: "次数",
      totalValue: formatMoney(response?.timeTotalWithdraw),
      totalCount: formatCount(response?.timeTotalWithdrawPerson),
      directValue: formatMoney(response?.timeDirectWithdraw),
      directCount: formatCount(response?.timeDirectWithdrawPerson),
      otherValue: formatMoney(response?.timeOtherWithdraw),
      otherCount: formatCount(response?.timeOtherWithdrawPerson),
    },
    {
      title: "领取总奖励",
      unit: "人次",
      totalValue: formatMoney(response?.timeTotalDiscount),
      totalCount: formatCount(response?.timeTotalDiscountPerson),
      directValue: formatMoney(response?.timeDirectDiscount),
      directCount: formatCount(response?.timeDirectDiscountPerson),
      otherValue: formatMoney(response?.timeOtherDiscount),
      otherCount: formatCount(response?.timeOtherDiscountPerson),
    },
    {
      title: "总有效投注",
      unit: "人次",
      totalValue: formatMoney(response?.timeTotalValidBet),
      totalCount: formatCount(response?.timeTotalValidBetPerson),
      directValue: formatMoney(response?.timeDirectValidBet),
      directCount: formatCount(response?.timeDirectValidBetPerson),
      otherValue: formatMoney(response?.timeOtherValidBet),
      otherCount: formatCount(response?.timeOtherValidBetPerson),
    },
    {
      title: "总业绩",
      unit: "人次",
      totalValue: formatMoney(response?.timeTotalPerformance),
      totalCount: formatCount(response?.timeTotalContribute),
      directValue: formatMoney(response?.timeDirectPerformance),
      directCount: formatCount(response?.timeDirectContribute),
      otherValue: formatMoney(response?.timeOtherPerformance),
      otherCount: formatCount(response?.timeOtherContribute),
    },
    {
      title: "总输赢",
      unit: "人次",
      totalValue: formatMoney(response?.timeTotalProfitLose),
      winLoss: true,
      totalCount: formatCount(response?.timeTotalProfitLosePerson),
      directValue: formatMoney(response?.timeDirectProfitLose),
      directCount: formatCount(response?.timeDirectProfitLosePerson),
      otherValue: formatMoney(response?.timeOtherProfitLose),
      otherCount: formatCount(response?.timeOtherProfitLosePerson),
    },
  ];
});

const teamDataRows = computed<AccumulatedMetric[][]>(() => {
  const response = currentData.value;
  return [
    [
      { label: "总人数", value: formatCount(response?.totalMember), link: true },
      { label: "直属人数", value: formatCount(response?.directMember), link: true },
      { label: "其他人数", value: formatCount(response?.otherMember), link: true },
    ],
    [
      { label: "总业绩", value: formatMoney(response?.totalPerformance) },
      { label: "直属业绩", value: formatMoney(response?.directPerformance) },
      { label: "其他业绩", value: formatMoney(response?.otherPerformance) },
    ],
    [
      { label: "累计直属充值", value: formatMoney(response?.totalDeposit), link: true },
      { label: "累计直属提现", value: formatMoney(response?.totalWithdraw), link: true },
      { label: "累计直属领取", value: formatMoney(response?.totalDiscount), link: true },
    ],
    [
      { label: "累计直属有效投注", value: formatMoney(response?.totalValidBet), link: true },
      { label: "累计直属输赢", value: formatMoney(response?.totalProfitLose), winLoss: true },
    ],
  ];
});

const incomeRows = computed<AccumulatedMetric[][]>(() => {
  const response = currentData.value;
  return [
    [
      { label: "总佣金", value: formatMoney(response?.totalCommission), highlight: true },
      { label: "直属佣金", value: formatMoney(response?.directCommission), highlight: true },
      { label: "其他佣金", value: formatMoney(response?.otherCommission), highlight: true },
    ],
    [
      { label: "累计实发佣金", value: formatMoney(response?.sumCommission), highlight: true },
      { label: "待领取", value: formatMoney(response?.canTakeCommission), highlight: true },
      { label: "已领取", value: formatMoney(response?.takenCommission), highlight: true },
    ],
    [
      { label: "推广活动累计奖励", value: formatMoney(response?.promoteActiveAmount) },
      { label: "代理活动累计奖励", value: formatMoney(response?.agentActiveAmount) },
    ],
  ];
});

async function loadPeriod(periodValue: PeriodValue, force = false) {
  if (!force && periodCache.value[periodValue]) return;

  const period = periods.find(periodItem => periodItem.value === periodValue);
  if (!period) return;

  const requestId = ++latestRequestId;
  loading.value = true;
  requestFailed.value = false;
  try {
    const response = await getPromoteData(period.timeEnum);
    if (requestId !== latestRequestId) return;

    periodCache.value = {
      ...periodCache.value,
      [periodValue]: response,
    };
  } catch {
    if (requestId === latestRequestId) requestFailed.value = true;
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

watch(activePeriod, periodValue => void loadPeriod(periodValue), { immediate: true });
</script>

<template>
  <div class="promote-data">
    <x-tabs
      v-model="activePeriod"
      type="card"
      :show-nav-arrows="false"
      class="promote-data__period-tabs"
    >
      <x-tab
        v-for="period in periods"
        :key="period.value"
        :name="period.value"
        :title="period.label"
      />
    </x-tabs>

    <div v-if="loading && !currentData" class="promote-data__state">
      <ui-loading />
    </div>
    <div v-else-if="requestFailed && !currentData" class="promote-data__state">
      <span>数据加载失败</span>
      <button type="button" class="promote-data__retry" @click="loadPeriod(activePeriod, true)">
        重新加载
      </button>
    </div>

    <div v-else class="promote-data__content lobby-scroll lobby-scroll--y">
      <section class="_commissionCard_5ctcb_59">
        <div class="_headerSection_5ctcb_66">
          <span class="_title_5ctcb_72">{{ commissionTitle }}</span>
          <div class="_amountGroup_5ctcb_81">
            <span class="_mainAmount_5ctcb_86">
              <span class="number-column-value _number-column_1ngn0_59 _number-column-yellow_1ngn0_66 _value_5ctcb_122">
                {{ formatMoney(currentData?.timeReceiveCommission) }}
              </span>
            </span>
            <span class="_subAmount_5ctcb_92">
              (总佣金 <span class="number-column-value _number-column_1ngn0_59 _number-column-yellow_1ngn0_66 _value_5ctcb_122">{{ formatMoney(currentData?.timeCommission) }}</span>)
            </span>
          </div>
        </div>
        <div class="_divider_5ctcb_102"></div>
        <div class="_detailGrid_5ctcb_107">
          <div v-for="detail in commissionDetails" :key="detail.label" class="_detailItem_5ctcb_112">
            <div class="_label_5ctcb_117">{{ detail.label }}</div>
            <div class="_value_5ctcb_122" :class="{ _highlight_5ctcb_129: detail.highlight }">
              {{ detail.value }}
            </div>
          </div>
        </div>
      </section>

      <section class="_allDataContainer_8fyve_59">
        <div class="_header_8fyve_67">全部数据</div>
        <div class="_grid_8fyve_78">
          <article v-for="card in allDataCards" :key="card.title" class="_dataItem_8fyve_83">
            <div>
              <div class="_titleRow_8fyve_91">
                <span class="_title_8fyve_91">{{ card.title }}</span>
                <span v-if="card.unit" class="_subTitle_8fyve_101"> ({{ card.unit }})</span>
              </div>
              <div class="_totalRow_8fyve_107">
                <span
                  class="_totalAmount_8fyve_113"
                  :class="{ '_data-link-to_1ngn0_89': card.totalCount === undefined, '_has-value_1ngn0_89': card.totalCount === undefined && hasValue(card.totalValue) }"
                >
                  <span
                    class="number-column-value _number-column_1ngn0_59"
                    :class="card.winLoss ? getWinLossClass(card.totalValue) : undefined"
                  >{{ card.totalValue }}</span>
                </span>
                <span v-if="card.totalCount !== undefined" class="_totalCount_8fyve_122">
                  (<span
                    class="_data-link-to_1ngn0_89 _totalCountNoLink_8fyve_128"
                    :class="{ '_has-value_1ngn0_89': hasValue(card.totalCount) }"
                  ><span class="_number-column_1ngn0_59">{{ card.totalCount }}</span></span>)
                </span>
              </div>
            </div>
            <div class="_divider_8fyve_134"></div>
            <div class="_detailRow_8fyve_139">
              <span class="_label_8fyve_144">直属数据</span>
              <div class="_valueWrap_8fyve_150">
                <span
                  class="_value_8fyve_150"
                  :class="{ '_data-link-to_1ngn0_89': card.directCount === undefined, '_has-value_1ngn0_89': card.directCount === undefined && hasValue(card.directValue) }"
                >
                  <span
                    class="number-column-value _number-column_1ngn0_59"
                    :class="card.winLoss ? getWinLossClass(card.directValue) : undefined"
                  >{{ card.directValue }}</span>
                </span>
                <span v-if="card.directCount !== undefined" class="_linkCount_8fyve_165">
                  (<span
                    class="_data-link-to_1ngn0_89 _extraValue_8fyve_172"
                    :class="{ '_has-value_1ngn0_89': hasValue(card.directCount) }"
                  ><span class="_number-column_1ngn0_59">{{ card.directCount }}</span></span>)
                </span>
              </div>
            </div>
            <div class="_detailRow_8fyve_139">
              <span class="_label_8fyve_144">其他数据</span>
              <div class="_valueWrap_8fyve_150">
                <span
                  class="_value_8fyve_150"
                  :class="{ '_data-link-to_1ngn0_89': card.otherCount === undefined, '_has-value_1ngn0_89': card.otherCount === undefined && hasValue(card.otherValue) }"
                >
                  <span
                    class="number-column-value _number-column_1ngn0_59"
                    :class="card.winLoss ? getWinLossClass(card.otherValue) : undefined"
                  >{{ card.otherValue }}</span>
                </span>
                <span v-if="card.otherCount !== undefined" class="_linkCount_8fyve_165">
                  (<span
                    class="_data-link-to_1ngn0_89 _extraValue_8fyve_172"
                    :class="{ '_has-value_1ngn0_89': hasValue(card.otherCount) }"
                  ><span class="_number-column_1ngn0_59">{{ card.otherCount }}</span></span>)
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="_teamDataTableContainer_12h2o_59">
        <div class="_header_12h2o_67">累计数据（含其他下级）</div>
        <div class="_blueSection_12h2o_132">
          <div class="_section_12h2o_78">
            <div v-for="(row, rowIndex) in teamDataRows" :key="rowIndex" class="_row_12h2o_98">
              <div v-for="metric in row" :key="metric.label" class="_dataItem_12h2o_104">
                <div class="_label_12h2o_115">{{ metric.label }}</div>
                <div class="_value_12h2o_122">
                  <span
                    v-if="metric.link"
                    class="_data-link-to_1ngn0_89"
                    :class="{ '_has-value_1ngn0_89': hasValue(metric.value) }"
                  >
                    <span
                      class="_number-column_1ngn0_59"
                      :class="metric.winLoss ? getWinLossClass(metric.value) : undefined"
                    >{{ metric.value }}</span>
                  </span>
                  <span
                    v-else
                    class="_number-column_1ngn0_59"
                    :class="metric.winLoss ? getWinLossClass(metric.value) : undefined"
                  >{{ metric.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="_divider_12h2o_127"></div>
        <div class="_sectionTitle_12h2o_78">我的累计收益</div>
        <div class="_yellowSection_12h2o_132">
          <div class="_section_12h2o_78">
            <div v-for="(row, rowIndex) in incomeRows" :key="rowIndex" class="_row_12h2o_98">
              <div v-for="metric in row" :key="metric.label" class="_dataItem_12h2o_104">
                <div class="_label_12h2o_115">{{ metric.label }}</div>
                <div class="_value_12h2o_122">
                  <span
                    class="_number-column_1ngn0_59"
                    :class="[
                      { '_number-column-yellow_1ngn0_66': metric.highlight },
                      metric.winLoss ? getWinLossClass(metric.value) : undefined,
                    ]"
                  >
                    {{ metric.value }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.promote-data {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.promote-data__content {
  position: relative;
  flex: 1;
  min-height: 0;
  height: auto;
  padding: 0.2rem;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--skin__bg_1);
}

.promote-data__content > section {
  box-sizing: border-box;
}

.promote-data__state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--skin__neutral_2);
}

.promote-data__retry {
  padding: 5px 12px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 14px;
  background: transparent;
  color: var(--skin__primary);
  cursor: pointer;
}

.promote-data__period-tabs {
  flex-shrink: 0;
  padding: 0.2rem 0;
  border-bottom: var(--lobby__px) solid var(--skin__border);
  background-color: var(--skin__bg_2);
}

:deep(.promote-data__period-tabs > .x-tabs__wrap) {
  min-height: 25px;
  margin: 0;
  border: 0;
}

:deep(.promote-data__period-tabs .x-tabs__nav) {
  min-height: 25px;
  padding: 0 0 0 10px;
  border: 0;
}

:deep(.promote-data__period-tabs .x-tab) {
  flex: 0 0 auto;
  min-width: 50px;
  min-height: 25px;
  padding: 0 5px;
  margin-right: 10px;
  color: var(--skin__neutral_1);
  font-size: 11px;
  background: var(--skin__text_bg, var(--skin__bg_2));
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 12.5px;
}

:deep(.promote-data__period-tabs .x-tab--active) {
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  border-color: var(--skin__primary);
}

:deep(.promote-data__period-tabs .x-tabs__content) {
  display: none;
}

._number-column_1ngn0_59 {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__lead);
  word-break: break-all;
}

._number-column_1ngn0_59._number-column-yellow_1ngn0_66,
._number-column_1ngn0_59._number-column-yellow_1ngn0_66 span {
  color: var(--skin__accent_3) !important;
}

._number-column_1ngn0_59._number-column-green_1ngn0_76,
._number-column_1ngn0_59._number-column-green_1ngn0_76 span {
  color: var(--skin__accent_1) !important;
}

._number-column_1ngn0_59._number-column-red_1ngn0_82,
._number-column_1ngn0_59._number-column-red_1ngn0_82 span {
  color: var(--skin__accent_2) !important;
}

._data-link-to_1ngn0_89._has-value_1ngn0_89 ._number-column_1ngn0_59 {
  color: var(--skin__primary);
  text-decoration: underline;
  text-underline-offset: 0.06rem;
}

._commissionCard_5ctcb_59 {
  width: 100%;
  padding: 0.2rem;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgb(0 0 0 / 6%);
}

._commissionCard_5ctcb_59 ._headerSection_5ctcb_66 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.12rem;
}

._commissionCard_5ctcb_59 ._title_5ctcb_72 {
  color: var(--skin__lead);
  font-size: 0.3rem;
  font-weight: 400;
  line-height: 1.3;
}

:global(html[data-skin-layout="98"]) ._commissionCard_5ctcb_59 ._title_5ctcb_72 {
  color: var(--skin__primary);
}

._commissionCard_5ctcb_59 ._amountGroup_5ctcb_81 {
  display: flex;
  align-items: baseline;
  gap: 0.04rem;
}

._commissionCard_5ctcb_59 ._mainAmount_5ctcb_86 {
  color: var(--skin__accent_3, #ffaa09);
  font-size: 0.34rem;
  font-weight: 600;
  line-height: normal;
}

._commissionCard_5ctcb_59 ._subAmount_5ctcb_92,
._commissionCard_5ctcb_59 ._subAmount_5ctcb_92 span {
  color: var(--skin__neutral_2, #999) !important;
  font-size: 0.24rem;
  font-weight: 400;
  line-height: normal;
}

._commissionCard_5ctcb_59 ._divider_5ctcb_102 {
  height: 0.01rem;
  margin-bottom: 0.16rem;
  background-color: var(--skin__border);
}

._commissionCard_5ctcb_59 ._detailGrid_5ctcb_107 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  text-align: left;
}

:global([dir="rtl"]) ._commissionCard_5ctcb_59 ._detailGrid_5ctcb_107 {
  text-align: right;
}

._commissionCard_5ctcb_59 ._detailItem_5ctcb_112 {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

._commissionCard_5ctcb_59 ._label_5ctcb_117 {
  color: var(--skin__neutral_1, #666);
  font-size: 0.24rem;
  white-space: nowrap;
}

._commissionCard_5ctcb_59 ._detailGrid_5ctcb_107 ._value_5ctcb_122 {
  color: var(--skin__lead);
  font-size: 0.28rem;
  font-weight: 600;
}

._commissionCard_5ctcb_59 ._detailGrid_5ctcb_107 ._highlight_5ctcb_129 {
  color: var(--skin__accent_3, #ffaa09);
}

._allDataContainer_8fyve_59 {
  width: 100%;
  margin-top: 0.2rem;
  padding: 0.2rem;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgb(0 0 0 / 6%);
}

._allDataContainer_8fyve_59 ._header_8fyve_67 {
  margin-bottom: 0.2rem;
  color: var(--skin__lead);
  font-size: 0.3rem;
  font-weight: 400;
  line-height: 1.3;
  text-align: center;
}

:global(html[data-skin-layout="98"]) ._allDataContainer_8fyve_59 ._header_8fyve_67 {
  color: var(--skin__primary);
}

._allDataContainer_8fyve_59 ._grid_8fyve_78 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.16rem 0.2rem;
}

._allDataContainer_8fyve_59 ._dataItem_8fyve_83 {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.2rem;
  border-radius: 0.14rem;
  background-color: rgba(var(--skin__primary__toRgbString), 0.05);
}

._allDataContainer_8fyve_59 ._titleRow_8fyve_91 {
  margin-bottom: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

._allDataContainer_8fyve_59 ._title_8fyve_91,
._allDataContainer_8fyve_59 ._subTitle_8fyve_101 {
  font-size: 0.26rem;
  line-height: normal;
}

._allDataContainer_8fyve_59 ._title_8fyve_91 {
  color: var(--skin__lead);
}

._allDataContainer_8fyve_59 ._subTitle_8fyve_101 {
  color: var(--skin__neutral_2, #999);
  white-space: nowrap;
}

._allDataContainer_8fyve_59 ._totalRow_8fyve_107 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.04rem;
}

._allDataContainer_8fyve_59 ._totalAmount_8fyve_113 {
  font-size: 0.3rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

._allDataContainer_8fyve_59 ._totalCount_8fyve_122 {
  color: var(--skin__neutral_2, #999);
  font-size: 0.3rem;
  font-weight: 400;
  line-height: normal;
}

._allDataContainer_8fyve_59 ._totalCountNoLink_8fyve_128,
._allDataContainer_8fyve_59 ._totalCountNoLink_8fyve_128 span {
  color: var(--skin__neutral_2, #999) !important;
}

._allDataContainer_8fyve_59 ._divider_8fyve_134 {
  height: 0.01rem;
  background-color: var(--skin__border);
  opacity: 0.3;
}

._allDataContainer_8fyve_59 ._detailRow_8fyve_139 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

._allDataContainer_8fyve_59 ._label_8fyve_144 {
  flex-shrink: 0;
  color: var(--skin__neutral_2, #666);
  font-size: 0.24rem;
  line-height: normal;
}

._allDataContainer_8fyve_59 ._valueWrap_8fyve_150 {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.04rem;
}

._allDataContainer_8fyve_59 ._value_8fyve_150,
._allDataContainer_8fyve_59 ._value_8fyve_150 span {
  color: var(--skin__lead);
  font-size: 0.24rem;
  font-weight: 500;
  line-height: normal;
}

._allDataContainer_8fyve_59 ._linkCount_8fyve_165 {
  color: var(--skin__neutral_2, #999);
  font-size: 0.24rem;
  font-weight: 400;
  line-height: normal;
  text-decoration: none;
}

._allDataContainer_8fyve_59 ._extraValue_8fyve_172,
._allDataContainer_8fyve_59 ._extraValue_8fyve_172 span {
  color: var(--skin__neutral_2, #999);
}

._teamDataTableContainer_12h2o_59 {
  width: 100%;
  margin-top: 0.2rem;
  padding: 0.2rem;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgb(0 0 0 / 6%);
}

._teamDataTableContainer_12h2o_59 ._header_12h2o_67,
._teamDataTableContainer_12h2o_59 ._sectionTitle_12h2o_78 {
  color: var(--skin__lead);
  font-size: 0.3rem;
  font-weight: 400;
  line-height: 1.3;
  text-align: center;
}

._teamDataTableContainer_12h2o_59 ._header_12h2o_67 {
  margin-bottom: 0.2rem;
}

._teamDataTableContainer_12h2o_59 ._sectionTitle_12h2o_78 {
  margin: 0.1rem 0 0.16rem;
}

:global(html[data-skin-layout="98"]) ._teamDataTableContainer_12h2o_59 ._header_12h2o_67,
:global(html[data-skin-layout="98"]) ._teamDataTableContainer_12h2o_59 ._sectionTitle_12h2o_78 {
  color: var(--skin__primary);
}

._teamDataTableContainer_12h2o_59 ._section_12h2o_78 {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  padding: 0;
  margin-bottom: 0.1rem;
  border-radius: 0.14rem;
}

._teamDataTableContainer_12h2o_59 ._row_12h2o_98 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: stretch;
  gap: 0.2rem;
}

._teamDataTableContainer_12h2o_59 ._dataItem_12h2o_104 {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 0.8rem;
  padding: 0.16rem 0.2rem;
  gap: 0.08rem;
  border-radius: 0.14rem;
  text-align: center;
}

._teamDataTableContainer_12h2o_59 ._label_12h2o_115 {
  max-width: 1.9rem;
  color: var(--skin__lead);
  font-size: 0.24rem;
  font-weight: 400;
  line-height: normal;
}

._teamDataTableContainer_12h2o_59 ._value_12h2o_122 span {
  font-size: 0.28rem;
  font-weight: 600;
  line-height: normal;
}

._teamDataTableContainer_12h2o_59 ._divider_12h2o_127 {
  height: 0.01rem;
  margin: 0.2rem 0 0;
  background-color: var(--skin__border);
}

._teamDataTableContainer_12h2o_59 ._blueSection_12h2o_132,
._teamDataTableContainer_12h2o_59 ._yellowSection_12h2o_132 {
  background-color: transparent;
}

._teamDataTableContainer_12h2o_59 ._blueSection_12h2o_132 ._dataItem_12h2o_104 {
  background-color: rgba(var(--skin__primary__toRgbString), 0.05);
}

._teamDataTableContainer_12h2o_59 ._yellowSection_12h2o_132 ._dataItem_12h2o_104 {
  background-color: rgb(255 193 7 / 10%);
}
</style>
