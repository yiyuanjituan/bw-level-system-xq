<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import dayjs from "dayjs";
import { service } from "@/api/service";
import Copy from "@/components/Common/Copy.vue";
import AccountTimeFilter from "@/components/HomeReport/AccountTimeFilter.vue";
import type { AccountTimeRange, SelectOption as ReportSelectOption } from "@/components/HomeReport/types";
import { desensitizeWithLodash } from "@/hooks/useCommon";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";

type WithdrawStatusOption = ReportSelectOption & {
  value: string | number;
};

interface WithdrawRecordItem {
  id?: number | string;
  createTime?: string;
  order_sn?: string;
  type?: number;
  real_name?: string;
  bank_name?: string;
  bank_number?: string;
  money?: string | number;
  fee?: string | number;
  pay_status?: number;
  remark?: string;
  [key: string]: any;
}

interface WithdrawRecordState {
  list: WithdrawRecordItem[];
  totalAmount: number;
}

const withdrawTypeIconMap: Record<number, string> = {
  0: "/siteadmin/pay-icon/icon_bank_nromal.png",
  1: "/siteadmin/pay-icon/icon_normal_zfb.png",
  2: "/siteadmin/pay-icon/icon_szhb_xnb.png",
  3: "/siteadmin/pay-icon/icon_wallet_normal.png"
};

const statusOptions: WithdrawStatusOption[] = [
  { label: "全部状态", value: 0 },
  { label: "审核中", value: 1 },
  { label: "出款中", value: 2 },
  { label: "提现成功", value: 3 },
  { label: "提现拒绝", value: 4 }
];

const timeRange = ref<AccountTimeRange>(createTodayRange());
const statusFilterValue = ref<string | number>(statusOptions[0]?.value ?? 0);
const isLoading = ref(false);
const recordState = ref<WithdrawRecordState>({
  list: [],
  totalAmount: 0
});

let latestRequestId = 0;

const hasListData = computed(() => recordState.value.list.length > 0);
const emptyStateText = computed(() => {
  if (timeRange.value.mode === "custom") {
    return "所选时间暂无内容";
  }

  return `${timeRange.value.label}暂无内容`;
});

function createTodayRange(): AccountTimeRange {
  const today = dayjs().format("YYYY-MM-DD");

  return {
    mode: "today",
    label: "今日",
    startTime: dayjs(today).startOf("day").unix(),
    endTime: dayjs(today).endOf("day").unix(),
    startDate: today,
    endDate: today
  };
}

function toNumber(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: unknown) {
  return `\uFFE5${toNumber(value).toFixed(2)}`;
}

function getWithdrawIcon(item: WithdrawRecordItem) {
  return withdrawTypeIconMap[Number(item?.type)] ?? "/siteadmin/pay-icon/icon_wallet_normal.png";
}

function getWithdrawTitle(item: WithdrawRecordItem) {
  const bankName = String(item?.bank_name ?? "").trim();
  return bankName ? `提现到${bankName}` : "提现申请";
}

function getWithdrawAccount(item: WithdrawRecordItem) {
  const bankNumber = String(item?.bank_number ?? "").trim();
  return bankNumber ? desensitizeWithLodash(bankNumber) : "";
}

function getWithdrawAmount(item: WithdrawRecordItem) {
  return `-${formatAmount(item?.money).replace("-", "")}`;
}

function getWithdrawStatusText(item: WithdrawRecordItem) {
  const payStatus = Number(item?.pay_status);

  if (payStatus === 1) return "审核中";
  if (payStatus === 2) return "出款中";
  if (payStatus === 3) return "提现成功";
  if (payStatus === 4) return "提现拒绝";
  return "处理中";
}

function getWithdrawStatusClass(item: WithdrawRecordItem) {
  const payStatus = Number(item?.pay_status);

  if (payStatus === 3) return "success";
  if (payStatus === 4) return "danger";
  return "pending";
}

function getWithdrawRemark(item: WithdrawRecordItem) {
  if (item?.remark) {
    return String(item.remark);
  }

  if (item?.real_name) {
    return `收款人: ${item.real_name}`;
  }

  return "";
}

function handleSeeMore() {
  const yesterday = dayjs().subtract(1, "day");

  timeRange.value = {
    mode: "yesterday",
    label: "昨日",
    startTime: yesterday.startOf("day").unix(),
    endTime: yesterday.endOf("day").unix(),
    startDate: yesterday.format("YYYY-MM-DD"),
    endDate: yesterday.format("YYYY-MM-DD")
  };
}

async function init() {
  const requestId = ++latestRequestId;
  isLoading.value = true;

  try {
    const res = await service.base.withdraw.records({
      page: 1,
      limit: 20,
      startTime: timeRange.value.startTime,
      endTime: timeRange.value.endTime,
      status: statusFilterValue.value
    });

    if (requestId === latestRequestId) {
      recordState.value = { list: res.list, totalAmount: res.total };
    }
  } catch (_error) {
    if (requestId === latestRequestId) {
      recordState.value = {
        list: [],
        totalAmount: 0
      };
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false;
    }
  }
}

watch([() => timeRange.value.startTime, () => timeRange.value.endTime, statusFilterValue], () => {
  void init();
});

onMounted(() => {
  void init();
});
</script>

<template>
  <div class="withdraw-record">
    <section class="toolbar">
      <div class="toolbar__filters">
        <AccountTimeFilter v-model="timeRange" />

        <div class="filter-select">
          <x-select
            v-model="statusFilterValue"
            :options="statusOptions"
            value-key="value"
            placement="bottom"
            fit-option-width
          />
        </div>
      </div>

      <div class="toolbar__summary">
        <div class="toolbar__summary-label">累计提现</div>
        <div class="toolbar__summary-value">
          <span>{{ formatAmount(recordState.totalAmount) }}</span>
          <svg-icon
            name="comm_icon_retry"
            class-name="toolbar__summary-refresh"
            :class="{ 'toolbar__summary-refresh--spin': isLoading }"
            @click="init"
          />
        </div>
      </div>
    </section>

    <section class="content-area">
      <div v-if="isLoading && !hasListData" class="content-state">
        <ui-loading />
      </div>

      <div v-else-if="hasListData" class="withdraw-list">
        <div v-for="item in recordState.list" :key="item.id" class="withdraw-item">
          <div class="item-main">
            <div class="flex items-center">
              <img class="item-icon" :src="getWithdrawIcon(item)" alt="" />
              <div class="item-title">
                {{ getWithdrawTitle(item) }}
                <span v-if="getWithdrawAccount(item)" class="item-account">({{ getWithdrawAccount(item) }})</span>
              </div>
            </div>
            <div class="item-info">
              <span>{{ item.createTime }}</span>
              <span class="order-no">{{ item.order_sn }}</span>
              <copy :text="item.order_sn" class="text-[14px]" />
            </div>

            <div v-if="getWithdrawRemark(item)" class="item-remark">
              {{ getWithdrawRemark(item) }}
            </div>
          </div>

          <div class="item-right">
            <div class="item-money">{{ getWithdrawAmount(item) }}</div>
            <div class="item-status" :class="getWithdrawStatusClass(item)">
              {{ getWithdrawStatusText(item) }}
            </div>
          </div>

          <div class="item-arrow">
            <svg-icon name="arrow-back" class="rotate-[180deg] text-[12px]" />
          </div>
        </div>
      </div>

      <ui-empty v-else>
        <template #text>
          <div class="empty-state__text">
            <span>{{ emptyStateText }}</span>
            <template v-if="timeRange.mode === 'today'">
              <span>，可</span>
              <span class="empty-state__link" @click="handleSeeMore">查看更多</span>
            </template>
          </div>
        </template>
      </ui-empty>
    </section>
  </div>
</template>

<style scoped lang="less">
.withdraw-record {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);

  .toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 10px;

    &__filters {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
    }

    &__summary {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      padding-top: 1px;
    }

    &__summary-label {
      color: var(--skin__neutral_2);
      font-size: 11px;
      line-height: 1;
    }

    &__summary-value {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--skin__lead);
      font-size: 12px;
      line-height: 1;
      font-weight: 700;
    }

    &__summary-refresh {
      color: var(--skin__primary);
      font-size: 13px;

      &--spin {
        animation: withdraw-record-spin 0.7s linear infinite;
      }
    }
  }

  .filter-select {
    width: 83px;
    flex-shrink: 0;

    :deep(.x-select) {
      height: 25px;
      padding: 0 10px;
      border: var(--lobby__px) solid var(--skin__border);
      border-radius: 14px;
      background: var(--skin__bg_2);
      color: var(--skin__neutral_2, var(--skin__lead));
    }

    :deep(.x-select--focused) {
      border-color: var(--skin__primary);
      color: var(--skin__primary);
    }

    :deep(.x-select__wrap) {
      line-height: 25px;
    }

    :deep(.x-select__label),
    :deep(.x-select__placeholder) {
      font-size: 10px;
      color: var(--skin__neutral_2, var(--skin__lead));
    }

    :deep(.x-select__suffix) {
      margin-left: 6px;
      font-size: 10px;
    }
  }

  .content-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .content-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .withdraw-list {
    width: 100%;
    padding: 0 10px;
    background: #060606;
  }

  .withdraw-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    height: 64px;
    padding: 9px 34px 8px 9px;
    box-sizing: border-box;
    color: var(--skin__lead);

    &:nth-child(odd) {
      background: var(--skin__bg_2);
      border-radius: 5px;
    }

    .item-icon {
      flex: none;
      width: 26px;
      height: 26px;
      border-radius: 4px;
      object-fit: cover;
    }

    .item-main {
      flex: 1;
      min-width: 0;
      padding-right: 8px;
    }

    .item-title {
      height: 20px;
      line-height: 20px;
      font-size: 13px;
      font-weight: 500;
      color: var(--skin__lead);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-account {
      color: var(--skin__neutral_2);
    }

    .item-info {
      display: flex;
      align-items: center;
      height: 18px;
      margin-top: 3px;
      font-size: 10px;
      color: var(--skin__neutral_2);
      white-space: nowrap;
      overflow: hidden;

      .order-no {
        margin-left: 5px;
      }

      :deep(.copy-icon) {
        flex: none;
        margin-left: 4px;
        font-size: 11px;
        color: var(--skin__primary);
      }
    }

    .item-remark {
      margin-top: 3px;
      font-size: 11.5px;
      line-height: 16px;
      color: var(--skin__neutral_1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-right {
      flex: none;
      width: 72px;
      text-align: right;
    }

    .item-money {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--skin__lead);
    }

    .item-status {
      margin-top: 4px;
      line-height: 16px;
      font-size: 12.5px;

      &.success {
        color: var(--skin__accent_1);
      }

      &.danger {
        color: var(--skin__accent_2);
      }

      &.pending {
        color: var(--skin__primary);
      }
    }

    .item-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      height: 24px;
      line-height: 22px;
      font-size: 18px;
      font-weight: 400;
      color: var(--skin__neutral_2);
    }
  }

  .empty-state {
    &__text {
      color: var(--skin__neutral_2, var(--skin__lead));
      font-size: 13px;
      line-height: 1.5;
    }

    &__link {
      color: var(--skin__primary);
    }
  }
}
</style>
