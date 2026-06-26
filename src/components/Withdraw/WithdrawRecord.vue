<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { service } from '@/api/service';
import Copy from '@/components/Common/Copy.vue';
import AccountTimeFilter from '@/components/HomeReport/AccountTimeFilter.vue';
import type { AccountTimeRange, SelectOption as ReportSelectOption } from '@/components/HomeReport/types';
import { desensitizeWithLodash } from '@/hooks/useCommon';
import UiEmpty from '@/components/UI/empty.vue';
import UiLoading from '@/components/UI/loading.vue';

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
  0: '/siteadmin/pay-icon/icon_bank_nromal.png',
  1: '/siteadmin/pay-icon/icon_normal_zfb.png',
  2: '/siteadmin/pay-icon/icon_szhb_xnb.png',
  3: '/siteadmin/pay-icon/icon_wallet_normal.png'
};

const statusOptions: WithdrawStatusOption[] = [
  { label: '全部状态', value: 0 },
  { label: '审核中', value: 1 },
  { label: '出款中', value: 2 },
  { label: '提现成功', value: 3 },
  { label: '提现拒绝', value: 4 }
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
  if (timeRange.value.mode === 'custom') {
    return '所选时间暂无内容';
  }

  return `${timeRange.value.label}暂无内容`;
});

function createTodayRange(): AccountTimeRange {
  const today = dayjs().format('YYYY-MM-DD');

  return {
    mode: 'today',
    label: '今日',
    startTime: dayjs(today).startOf('day').unix(),
    endTime: dayjs(today).endOf('day').unix(),
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
  return withdrawTypeIconMap[Number(item?.type)] ?? '/siteadmin/pay-icon/icon_wallet_normal.png';
}

function getWithdrawTitle(item: WithdrawRecordItem) {
  const bankName = String(item?.bank_name ?? '').trim();
  return bankName ? `提现到${bankName}` : '提现申请';
}

function getWithdrawAccount(item: WithdrawRecordItem) {
  const bankNumber = String(item?.bank_number ?? '').trim();
  return bankNumber ? desensitizeWithLodash(bankNumber) : '';
}

function getWithdrawAmount(item: WithdrawRecordItem) {
  return `-${formatAmount(item?.money).replace('-', '')}`;
}

function getWithdrawStatusText(item: WithdrawRecordItem) {
  const payStatus = Number(item?.pay_status);

  if (payStatus === 1) return '审核中';
  if (payStatus === 2) return '出款中';
  if (payStatus === 3) return '提现成功';
  if (payStatus === 4) return '提现拒绝';
  return '处理中';
}

function getWithdrawStatusClass(item: WithdrawRecordItem) {
  const payStatus = Number(item?.pay_status);

  if (payStatus === 3) return 'success';
  if (payStatus === 4) return 'danger';
  return 'pending';
}

function getWithdrawRemark(item: WithdrawRecordItem) {
  if (item?.remark) {
    return String(item.remark);
  }

  if (item?.real_name) {
    return `收款人: ${item.real_name}`;
  }

  return '';
}

function handleSeeMore() {
  const yesterday = dayjs().subtract(1, 'day');

  timeRange.value = {
    mode: 'yesterday',
    label: '昨日',
    startTime: yesterday.startOf('day').unix(),
    endTime: yesterday.endOf('day').unix(),
    startDate: yesterday.format('YYYY-MM-DD'),
    endDate: yesterday.format('YYYY-MM-DD')
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
          <x-select v-model="statusFilterValue" :options="statusOptions" value-key="value" placement="bottom" fit-option-width />
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
          <div class="cell-content">
            <div class="content">
              <div class="name">
                <div class="logo-box">
                  <img v-if="item.bank_icon" :src="item.bank_icon" alt="" srcset="" />
                  <div class="desc">
                    <span class="withdraw-record-account-name">提现到{{ item.bank_name }}</span>
                    <span dir="ltr">({{ desensitizeWithLodash(item.bank_number) }})</span>
                  </div>
                </div>
                <div class="time">
                  <span class="create-time">{{ dayjs(item.createTime).format('YYYY/MM/DD HH:mm:ss') }}</span>
                  <span class="no">{{ item.order_sn }}</span>
                  <span class="ml-[5px] leading-[100%] mt-[1px]">
                    <copy class-name="text-[9px]" :text="item.order_sn" />
                  </span>
                </div>
              </div>
              <div class="right">
                <p class="money">{{ Number(0 - Number(item.money)).toFixed(2) }}</p>
                <p class="status pending" v-if="item.pay_status == 1">审核中</p>
                <p class="status pending" v-if="item.pay_status == 2">出款中</p>
                <p class="status success" v-if="item.pay_status == 3">提现成功</p>
                <p class="status failed" v-if="item.pay_status == 4">拒绝出款</p>
                <p class="status cancel" v-if="item.pay_status == 100">提现取消</p>
              </div>
            </div>
            <span class="arrows">
              <svg-icon name="arrow-back" class="text-[12px]" />
            </span>
          </div>
          <div class="remark" v-if="item.remark">
            <span class="label">备注</span>
            <span class="front-remark">{{ item.remark }}</span>
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
    position: relative;

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

      position: absolute;
      right: 10px;
      top: 50%;
      text-align: right;
      transform: translateY(-50%);
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
      font-size: 11px;
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
    min-height: 62.5px;
    border-radius: 5px;
    padding: 10px;
    color: var(--skin__lead);

    .cell-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          .logo-box {
            display: flex;
            align-items: center;
            img {
              width: 24px;
              height: 24px;
              margin-right: 10px;
              border-radius: 5px;
            }
            .desc {
              max-width: 225px;
              color: var(--skin__lead);
              font-size: 11px;
              .withdraw-record-account-name {
                display: inline;
              }
              span:not(.withdraw-record-account-name) {
                color: var(--skin__neutral_2);
              }
            }
          }
          .time {
            display: flex;
            align-items: center;
            color: var(--skin__neutral_2);
            font-size: 9px;
            margin-top: 5px;
            .create-time {
              white-space: nowrap;
              line-height: 12px;
            }
            .no {
              margin-left: 5px;
              line-height: 12px;
            }
          }
        }
        .right {
          text-align: right;
          line-height: 12px;
          .money {
            color: var(--skin__lead);
            font-weight: 400;
            font-size: 12px;
          }
          .status {
            margin-top: 6px;
            font-size: 11px;
            max-width: 120px;
            text-align: right;
            &.success {
              color: var(--skin__accent_1);
            }
            &.pending {
              color: var(--skin__accent_3);
            }
            &.failed {
              color: var(--skin__accent_2);
            }
            &.cancel {
              color: var(--skin__neutral_2);
            }
          }
        }
      }
      .arrows {
        flex: 1;
        margin-left: 10px;
        font-size: 13px;
        transform: rotate(180deg);
        color: var(--skin__neutral_2);
      }
    }
    .remark {
      display: flex;
      align-items: center;
      font-size: 9px;
      color: var(--skin__lead);
      margin-top: 2.5px;
      max-width: 312.5px;
      height: 14px;
      line-height: 1;
      .label {
        color: var(--skin__neutral_2);
        margin-right: 2.5px;
      }
      .front-remark {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    &:nth-child(odd) {
      background: var(--skin__bg_2);
      border-radius: 5px;
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
