<script setup lang="ts">
import { computed, onMounted } from "vue";
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import SubNavbar from "@/components/SubNavbar.vue";
import { useStorage } from "@vueuse/core";

const route = useRoute();
const detailData: any = useStorage('money-detail-data', {})
const categoryOptions = [
  { label: "账变大类", value: 0 },
  { label: "资金切换", value: 1 },
  { label: "会员充值", value: 2 },
  { label: "会员提现", value: 3 },
  { label: "银商结算", value: 4 },
  { label: "资金修正", value: 5 },
  { label: "活动", value: 6 },
  { label: "返水", value: 7 },
  { label: "返佣", value: 8 },
  { label: "利息宝", value: 9 },
  { label: "任务", value: 10 },
  { label: "VIP奖励", value: 11 },
  { label: "充值优惠", value: 12 },
  { label: "奖励", value: 13 },
  { label: "担保理赔", value: 14 },
  { label: "代理转账", value: 15 },
  { label: "信用借款", value: 16 }
];
const detailRows = computed(() => [
  {
    label: "账变大类",
    value: categoryOptions.find(v => v.value == detailData.value.mode)?.label,
    valueClass: "active-text"
  },
  {
    label: "小类明细",
    value: detailData.value.title,
    valueClass: "active-text"
  },
  {
    label: "时间",
    value: detailData.value.createTime
  },
  {
    label: "钱包类型",
    value: "余额钱包"
  },
  {
    label: "金额",
    value: detailData.value.money,
    valueClass: "active-text"
  },
  {
    label: "变动前余额",
    value: detailData.value.before
  },
  {
    label: "变动后余额",
    value: detailData.value.after
  }
]);

</script>

<template>
  <div class="account-detail-page">
    <SubNavbar :title="$t('详情')" />

    <div class="detail-scroll">
      <section class="detail-card">
        <div v-for="row in detailRows" :key="row.label" class="detail-card__row">
          <span class="detail-card__label">{{ row.label }}</span>
          <span class="detail-card__value" :class="row.valueClass">
            {{ row.value }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.account-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);
}

.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px;
}

.detail-card {
  padding: 11px 10px;
  border-radius: 8px;
  background: var(--skin__bg_2);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
}

.detail-card__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail-card__row+.detail-card__row {
  margin-top: 8px;
}

.detail-card__label {
  flex-shrink: 0;
  color: #6f6f6f;
  font-size: 12px;
  line-height: 17px;
}

.detail-card__value {
  min-width: 0;
  color: var(--skin__neutral_2, var(--skin__lead));
  font-size: 12px;
  line-height: 17px;
  text-align: right;
  word-break: break-all;
}

.active-text {
  color: var(--skin__lead);
  font-weight: 700;
}
</style>
