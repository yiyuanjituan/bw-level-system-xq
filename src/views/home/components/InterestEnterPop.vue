<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import { service } from "@/api/service";
import { showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import { formatMoney, toNumber } from "@/utils/common";

defineOptions({
  name: "InterestEnterPop"
});

interface Props {
  params?: {
    display?: {
      cycle_text?: string;
    };
    config?: {
      calc_cycle_text?: string;
      minNum?: number | string;
    };
  };
}

const props = withDefaults(defineProps<Props>(), {
  params: () => ({})
});

const emit = defineEmits<{
  (e: "success"): void;
  (e: "close"): void;
}>();

const INTEREST_POPUP_TIME_FORMAT = "MM/DD HH:mm:ss";
const DESIGN_WIDTH = 332;
const DESIGN_VIEWPORT = 375;

const auth = useAuthStore();
const { width: windowWidth } = useWindowSize();
const show = ref(false);
const amount = ref("");
const loading = ref(false);
const currentTime = ref(dayjs().format(INTEREST_POPUP_TIME_FORMAT));
let timeTimer: ReturnType<typeof setInterval> | null = null;

const dialogWidth = computed(() => (DESIGN_WIDTH / DESIGN_VIEWPORT) * windowWidth.value);
const numericBalance = computed(() => toNumber(auth.user?.money));
const integerBalance = computed(() => Math.max(Math.floor(numericBalance.value), 0));
const balanceText = computed(() => formatMoney(numericBalance.value));
const settleCycleText = computed(
  () => props.params?.display?.cycle_text || props.params?.config?.calc_cycle_text || "--"
);
const minAmount = computed(() => Number(props.params?.config?.minNum) || 100);
const helperText = computed(() => `单笔最少转入￥${minAmount.value}，仅限整数`);
const numericAmount = computed(() => Number(amount.value || 0));
const nextInterestTime = computed(() => {
  const match = String(settleCycleText.value).match(/(\d+)\s*(分钟|小时|天)/);

  if (!match) return "--";

  const value = Number(match[1]);
  const unit = match[2] === "分钟" ? "minute" : match[2] === "天" ? "day" : "hour";

  return dayjs().add(value, unit).format(INTEREST_POPUP_TIME_FORMAT);
});
const confirmDisabled = computed(() => {
  if (!amount.value) return true;

  return numericAmount.value < minAmount.value || numericAmount.value > numericBalance.value || loading.value;
});

function sanitizeAmount(value: string | number | undefined) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function syncCurrentTime() {
  currentTime.value = dayjs().format(INTEREST_POPUP_TIME_FORMAT);
}

function startTimer() {
  syncCurrentTime();
  stopTimer();
  timeTimer = setInterval(syncCurrentTime, 1000);
}

function stopTimer() {
  if (!timeTimer) return;

  clearInterval(timeTimer);
  timeTimer = null;
}

function open() {
  amount.value = "";
  show.value = true;
  startTimer();
}

function close() {
  show.value = false;
  amount.value = "";
  stopTimer();
  emit("close");
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  amount.value = sanitizeAmount(target?.value ?? "");
}

function handleAll() {
  amount.value = integerBalance.value > 0 ? String(integerBalance.value) : "";
}

async function handleConfirm() {
  if (confirmDisabled.value) return;

  loading.value = true;

  try {
    await service.v1.activity.interestTransferIn({ money: numericAmount.value });
    await auth.updateInfo();
    showCustomToast({ message: "转入成功", type: "success" });
    show.value = false;
    amount.value = "";
    stopTimer();
    emit("success");
  } finally {
    loading.value = false;
  }
}

defineExpose({
  open,
  close
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :show-confirm-button="false" :width="dialogWidth">
    <template #default>
      <div class="interest-enter-pop">
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
            :value="amount"
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
          {{ loading ? "确认中..." : "确认转入" }}
        </button>

        <div class="interest-enter-pop__tip">本次转入后首次产生利息的时间：{{ nextInterestTime }}</div>
      </div>
    </template>

    <template #footer>
      <div class="interest-enter-pop__footer">
        <button class="interest-enter-pop__close" type="button" @click="close">
          <svg-icon name="close" color="white" />
        </button>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
div[role="dialog"] {
  .interest-enter-pop {
    border: 1px solid #303030;
    border-radius: 12px;
    background: #1b1b1d;
    box-shadow: 0 12px 30px rgb(0 0 0 / 35%);
    padding: 16px 16px 14px;
    color: #fff;
    box-sizing: border-box;

    &__title {
      margin-bottom: 16px;
      text-align: center;
      font-size: 20px;
      line-height: 28px;
      font-weight: 600;
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
      margin-bottom: 18px;
      padding: 0 0 0 12px;
      border: 1px solid #8c7135;
      border-radius: 6px;
      background: #0d0d0e;
    }

    &__field-prefix {
      flex-shrink: 0;
      margin-right: 8px;
      color: #fff;
      font-size: 14px;
      line-height: 20px;
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

    &__footer {
      display: flex;
      justify-content: center;
      padding-top: 16px;
    }

    &__close {
      width: 34px;
      height: 34px;
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
      margin-bottom: 4px;
      color: #8d8d8d;
      font-size: 12px;
      line-height: 17px;
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
}
</style>
