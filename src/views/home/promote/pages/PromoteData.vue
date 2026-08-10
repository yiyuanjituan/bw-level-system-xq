<script setup lang="ts">
import { computed, ref } from "vue";

type PeriodValue = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

interface DataCard {
  title: string;
  unit?: string;
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
}

const periods: Array<{ label: string; value: PeriodValue }> = [
  { label: "今日", value: "today" },
  { label: "昨日", value: "yesterday" },
  { label: "本周", value: "thisWeek" },
  { label: "上周", value: "lastWeek" },
  { label: "本月", value: "thisMonth" },
  { label: "上月", value: "lastMonth" },
];

const activePeriod = ref<PeriodValue>("today");
const commissionTitle = computed(
  () => `${periods.find(period => period.value === activePeriod.value)?.label ?? "今日"}佣金`,
);

const commissionDetails = [
  { label: "直属佣金", value: "0.00", highlight: true },
  { label: "其他佣金", value: "0.00", highlight: true },
  { label: "推广活动奖励", value: "0.00" },
  { label: "代理活动奖励", value: "0.00" },
];

const allDataCards: DataCard[] = [
  { title: "总新增人数", totalValue: "0", directValue: "0", otherValue: "0" },
  { title: "总充值", unit: "人次", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "总首充", unit: "人数", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "当天注册首充", unit: "人数", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "总提现", unit: "次数", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "领取总奖励", unit: "人次", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "总有效投注", unit: "人次", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
  { title: "总业绩", unit: "人次", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "-" },
  { title: "总输赢", unit: "人次", totalValue: "0.00", totalCount: "0", directValue: "0.00", directCount: "0", otherValue: "0.00", otherCount: "0" },
];

const teamDataRows: AccumulatedMetric[][] = [
  [{ label: "总人数", value: "0" }, { label: "直属人数", value: "0" }, { label: "其他人数", value: "0" }],
  [{ label: "总业绩", value: "0.00" }, { label: "直属业绩", value: "0.00" }, { label: "其他业绩", value: "0.00" }],
  [{ label: "累计直属充值", value: "0.00" }, { label: "累计直属提现", value: "0.00" }, { label: "累计直属领取", value: "0.00" }],
  [{ label: "累计直属有效投注", value: "0.00" }, { label: "累计直属输赢", value: "0.00" }],
];

const incomeRows: AccumulatedMetric[][] = [
  [{ label: "总佣金", value: "0.00", highlight: true }, { label: "直属佣金", value: "0.00", highlight: true }, { label: "其他佣金", value: "0.00", highlight: true }],
  [{ label: "累计实发佣金", value: "0.00", highlight: true }, { label: "待领取", value: "0.00", highlight: true }, { label: "已领取", value: "0.00", highlight: true }],
  [{ label: "推广活动累计奖励", value: "0.00" }, { label: "代理活动累计奖励", value: "0.00" }],
];
</script>

<template>
  <div class="promote-data">
    <x-tabs
      v-model="activePeriod"
      type="card"
      :show-nav-arrows="false"
      class="_time-select_p4q46_59 promote-data__period-tabs"
    >
      <x-tab
        v-for="period in periods"
        :key="period.value"
        :name="period.value"
        :title="period.label"
      />
    </x-tabs>

    <div class="_prmote-base-layout_pluce_60 promote-data__content lobby-scroll lobby-scroll--y">
      <section class="_commissionCard_5ctcb_59">
        <div class="_headerSection_5ctcb_66">
          <span class="_title_5ctcb_72">{{ commissionTitle }}</span>
          <div class="_amountGroup_5ctcb_81">
            <span class="_mainAmount_5ctcb_86">
              <span class="number-column-value _number-column_1ngn0_59 _number-column-yellow_1ngn0_66 _value_5ctcb_122">0.00</span>
            </span>
            <span class="_subAmount_5ctcb_92">
              (总佣金 <span class="number-column-value _number-column_1ngn0_59 _number-column-yellow_1ngn0_66 _value_5ctcb_122">0.00</span>)
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
            <div class="_titleAndTotal_8fyve_198">
              <div class="_titleRow_8fyve_91">
                <span class="_title_8fyve_91">{{ card.title }}</span>
                <span v-if="card.unit" class="_subTitle_8fyve_101"> ({{ card.unit }})</span>
              </div>
              <div class="_totalRow_8fyve_107">
                <span class="number-column-value _number-column_1ngn0_59 _totalAmount_8fyve_113">{{ card.totalValue }}</span>
                <span v-if="card.totalCount !== undefined" class="_totalCount_8fyve_122">
                  (<span class="_number-column_1ngn0_59 _totalCountNoLink_8fyve_128">{{ card.totalCount }}</span>)
                </span>
              </div>
            </div>
            <div class="_divider_8fyve_134"></div>
            <div class="_detailRow_8fyve_139">
              <span class="_label_8fyve_144">直属数据</span>
              <div class="_valueWrap_8fyve_150">
                <span class="number-column-value _number-column_1ngn0_59 _value_8fyve_150">{{ card.directValue }}</span>
                <span v-if="card.directCount !== undefined" class="_linkCount_8fyve_165">
                  (<span class="_data-link-to_1ngn0_89 _extraValue_8fyve_172">{{ card.directCount }}</span>)
                </span>
              </div>
            </div>
            <div class="_detailRow_8fyve_139">
              <span class="_label_8fyve_144">其他数据</span>
              <div class="_valueWrap_8fyve_150">
                <span class="number-column-value _number-column_1ngn0_59 _value_8fyve_150">{{ card.otherValue }}</span>
                <span v-if="card.otherCount !== undefined" class="_linkCount_8fyve_165">
                  (<span class="_number-column_1ngn0_59 _extraValue_8fyve_172">{{ card.otherCount }}</span>)
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="_teamDataTableContainer_12h2o_59">
        <div class="_header_12h2o_67">累计数据(含其他下级)</div>
        <div class="_blueSection_12h2o_132">
          <div class="_section_12h2o_78">
            <div v-for="(row, rowIndex) in teamDataRows" :key="rowIndex" class="_row_12h2o_98">
              <div v-for="metric in row" :key="metric.label" class="_dataItem_12h2o_104">
                <div class="_label_12h2o_115">{{ metric.label }}</div>
                <div class="_value_12h2o_122"><span class="_number-column_1ngn0_59">{{ metric.value }}</span></div>
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
                  <span class="_number-column_1ngn0_59" :class="{ '_number-column-yellow_1ngn0_66': metric.highlight }">
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
  flex: 1;
  min-height: 0;
  height: auto;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.promote-data__content > section {
  box-sizing: border-box;
}

:deep(.promote-data__period-tabs > .x-tabs__wrap) {
  min-height: 0.5rem;
  margin: 0;
  border: 0;
}

:deep(.promote-data__period-tabs .x-tabs__nav) {
  min-height: 0.5rem;
  padding: 0 0 0 0.2rem;
  border: 0;
}

:deep(.promote-data__period-tabs .x-tab) {
  flex: 0 0 auto;
  min-width: 1rem;
  min-height: 0.5rem;
  padding: 0 0.1rem;
  margin-right: 0.2rem;
  color: var(--skin__neutral_1);
  font-size: 0.22rem;
  background: var(--skin__text_bg, var(--skin__bg_2));
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 0.25rem;
}

:deep(.promote-data__period-tabs .x-tab--active) {
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  border-color: var(--skin__primary);
}

:deep(.promote-data__period-tabs .x-tabs__content) {
  display: none;
}
</style>
