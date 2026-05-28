<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatMoney, toNumber } from "@/utils/common";

defineOptions({
  name: "InterestEnterPop"
});

interface Props {
  show?: boolean;
  amount?: string | number;
  balance?: string | number;
  settleCycleText?: string;
  currentTime?: string;
  nextInterestTime?: string;
  minAmount?: number;
  confirmLoading?: boolean;
  closeOnClickOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  amount: "",
  balance: 0,
  settleCycleText: "1小时",
  currentTime: "--",
  nextInterestTime: "--",
  minAmount: 100,
  confirmLoading: false,
  closeOnClickOverlay: true
});

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update:amount", value: string): void;
  (e: "confirm", value: number): void;
  (e: "all", value: string): void;
  (e: "close"): void;
}>();

const innerAmount = ref("");

const numericBalance = computed(() => toNumber(props.balance));
const integerBalance = computed(() => Math.max(Math.floor(numericBalance.value), 0));
const balanceText = computed(() => formatMoney(numericBalance.value));
const helperText = computed(() => `单笔最少转入￥${props.minAmount}，仅限整数`);
const numericAmount = computed(() => Number(innerAmount.value || 0));

const isValidAmount = computed(() => {
  if (!innerAmount.value) return false;
  return numericAmount.value >= props.minAmount && numericAmount.value <= numericBalance.value;
});

const confirmDisabled = computed(() => !isValidAmount.value || props.confirmLoading);

watch(
  () => props.amount,
  value => {
    innerAmount.value = sanitizeAmount(value);
  },
  { immediate: true }
);

function sanitizeAmount(value: string | number | undefined) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function syncAmount(value: string) {
  innerAmount.value = sanitizeAmount(value);
  emit("update:amount", innerAmount.value);
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  syncAmount(target?.value ?? "");
}

function handleAll() {
  const value = integerBalance.value > 0 ? String(integerBalance.value) : "";
  syncAmount(value);
  emit("all", value);
}

function handleConfirm() {
  if (confirmDisabled.value) return;
  emit("confirm", numericAmount.value);
}

function handleClose() {
  emit("update:show", false);
  emit("close");
}
</script>

<template>
  <x-popup
    :show="show"
    position="center"
    :close-on-click-overlay="closeOnClickOverlay"
    @update:show="value => emit('update:show', value)"
    @close="emit('close')"
  >
    <div class="interest-enter-pop">
      <div class="interest-enter-pop__panel">
        <div class="interest-enter-pop__title">转入</div>

        <div class="interest-enter-pop__summary">
          <div class="summary-item">
            <div class="summary-item__label">账号余额</div>
            <div class="summary-item__value summary-item__value--accent">
              {{ balanceText }} <span class="summary-item__unit">元</span>
            </div>
          </div>
          <div class="summary-item summary-item--right">
            <div class="summary-item__label">结算周期</div>
            <div class="summary-item__value">{{ settleCycleText }}</div>
          </div>
        </div>

        <div class="interest-enter-pop__section-head">
          <span>转入金额</span>
          <span class="interest-enter-pop__time">当前时间 {{ currentTime }}</span>
        </div>

        <div class="interest-enter-pop__field">
          <div class="interest-enter-pop__field-prefix">￥</div>
          <input
            :value="innerAmount"
            class="interest-enter-pop__input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :placeholder="helperText"
            @input="handleInput"
          />
          <button class="interest-enter-pop__all" type="button" @click="handleAll">全部</button>
        </div>

        <button
          class="interest-enter-pop__confirm"
          :class="{ 'interest-enter-pop__confirm--active': !confirmDisabled }"
          :disabled="confirmDisabled"
          type="button"
          @click="handleConfirm"
        >
          {{ confirmLoading ? "确认中..." : "确认转入" }}
        </button>

        <div class="interest-enter-pop__tip">本次转入后首次产生利息的时间：{{ nextInterestTime }}</div>
      </div>

      <button class="interest-enter-pop__close" type="button" @click="handleClose">
        <svg-icon name="close" color="white" />
      </button>
    </div>
  </x-popup>
</template>

<style scoped lang="less">
.interest-enter-pop {
  display: flex;
  width: min(332px, calc(100vw - 32px));
  flex-direction: column;
  align-items: center;

  &__panel {
    width: 100%;
    border: 1px solid #303030;
    border-radius: 12px;
    background: #1b1b1d;
    box-shadow: 0 12px 30px rgb(0 0 0 / 35%);
    padding: 16px 16px 14px;
    color: #fff;
    box-sizing: border-box;
  }

  &__title {
    text-align: center;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  &__summary {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  &__time {
    color: #8d8d8d;
    font-size: 11px;
    line-height: 16px;
    font-weight: 400;
    text-align: right;
  }

  &__field {
    display: flex;
    align-items: center;
    height: 36px;
    border: 1px solid #8c7135;
    border-radius: 6px;
    background: #0d0d0e;
    padding: 0 0 0 12px;
    margin-bottom: 18px;
  }

  &__field-prefix {
    flex-shrink: 0;
    color: #fff;
    font-size: 14px;
    line-height: 20px;
    margin-right: 8px;
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: #fff;
    font-size: 13px;
    line-height: 20px;

    &::placeholder {
      color: #707070;
    }
  }

  &__all {
    flex-shrink: 0;
    height: 100%;
    padding: 0 12px;
    border: 0;
    background: transparent;
    color: #dfbe5b;
    font-size: 13px;
    line-height: 20px;
    font-weight: 600;
  }

  &__confirm {
    width: 100%;
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: #6f6f6f;
    color: #dadada;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
    transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

    &:disabled {
      opacity: 1;
    }
  }

  &__confirm--active {
    background: linear-gradient(180deg, #f0c059 0%, #dca538 100%);
    color: #5f3503;
  }

  &__tip {
    margin-top: 12px;
    color: #fff;
    font-size: 12px;
    line-height: 17px;
    font-weight: 600;
  }

  &__close {
    width: 34px;
    height: 34px;
    margin-top: 16px;
    border: 2px solid rgb(255 255 255 / 92%);
    border-radius: 50%;
    background: transparent;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  :deep(svg) {
    fill: currentcolor;
  }
}

.summary-item {
  flex: 1;
  min-width: 0;

  &--right {
    text-align: right;
  }

  &__label {
    color: #8d8d8d;
    font-size: 12px;
    line-height: 17px;
    margin-bottom: 4px;
  }

  &__value {
    color: #fff;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
  }

  &__value--accent {
    color: #f0c059;
  }

  &__unit {
    font-size: 12px;
  }
}
</style>
