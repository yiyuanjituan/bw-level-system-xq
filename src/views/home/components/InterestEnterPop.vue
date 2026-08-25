<script setup lang="ts">
import { $t } from "@/locales";
import { computed, onBeforeUnmount, ref } from "vue";
import { useWindowSize } from "@vant/use";
import dayjs from "dayjs";
import useAuthStore from "@/store/modules/user";
import { useRaf } from "@vant/use";
import { service } from "@/api/service";
import { showCustomToast } from "@/hooks/useCommon";

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

const emit = defineEmits<{ (e: "success"): void; (e: "close"): void }>();
const currentTime = ref(dayjs().format("MM/DD HH:mm:ss"));
const openTime = ref(dayjs().format("MM/DD HH:mm:ss"));
let cancelRaf: (() => void) | null = null;
const isLoading = ref(false);

const auth = useAuthStore();
const { width: windowWidth } = useWindowSize();
const show = ref(false);
const amount = ref("");
const inputEnterValue = ref();

const dialogWidth = computed(() => (300 / 375) * windowWidth.value);

function stopClock() {
  cancelRaf?.();
  cancelRaf = null;
}

function startClock() {
  currentTime.value = dayjs().format("MM/DD HH:mm:ss");
  stopClock();
  cancelRaf = useRaf(() => (currentTime.value = dayjs().format("MM/DD HH:mm:ss")), {
    isLoop: true,
    interval: 1000
  });
}

function handleEnter() {
  if (!inputEnterValue.value) {
    return;
  }
  isLoading.value = true;
  service.v1.activity
    .interestTransferIn({ money: parseInt(inputEnterValue.value) })
    .then(() => {
      auth.updateInfo();
      close();
      showCustomToast({ type: "success", message: $t("存入成功") });
      emit("success");
    })
    .finally(() => (isLoading.value = false));
}

function open() {
  amount.value = "";
  show.value = true;
  startClock();
  inputEnterValue.value = void 0;
}

function close() {
  show.value = false;
  amount.value = "";
  emit("close");
  stopClock();
}

defineExpose({
  open,
  close
});

onBeforeUnmount(stopClock);
</script>

<template>
  <div class="enter-pop">
    <van-dialog
      v-model:show="show"
      :show-cancel-button="false"
      :show-confirm-button="false"
      :width="dialogWidth"
      destroy-on-close
      overlay-class="interest-overlay-box"
    >
      <template #default>
        <div class="interest-enter-pop">
          <div class="interest-enter-pop__title">转入</div>
          <div class="content-box">
            <div class="account-balance">
              <div class="balance-main">
                <span class="amount-text">账号余额</span>
                <span class="amount">
                  <x-text :value="auth.user.money" />
                </span>
                <svg-icon name="comm_icon_sx" class-name="main-text ml-[4px] text-[12px]" @click="auth.updateInfo()" />
              </div>
              <div class="settlement-label">
                <span>结算周期</span>
                <div class="">1小时</div>
              </div>
            </div>
            <div class="current-time">
              <div class="label">转入金额</div>
              <div class="time">
                <span>当前时间 </span>
                <span>{{ currentTime }}</span>
              </div>
            </div>
            <x-form>
              <x-form-item class="!mb-[20px]">
                <x-input
                  prefix-text="￥"
                  :placeholder="`单笔最少转入 ${props.params?.config?.minNum}， 仅限整数`"
                  v-model="inputEnterValue"
                >
                  <template #suffix>
                    <span class="main-text" @click="inputEnterValue = Math.trunc(Number(auth.user.money))">全部</span>
                  </template>
                </x-input>
              </x-form-item>
            </x-form>
            <x-button class="!w-[100%]" :disabled="!inputEnterValue" :loading="isLoading" @click="handleEnter"
              >确认转入</x-button
            >
            <div class="tips">{{ $t("本次转入后首次产生利息的时间：") }}{{ openTime }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="interest-enter-pop__footer">
          <button class="interest-enter-pop__close" @click="close">
            <svg-icon name="close" color="white" />
          </button>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.enter-pop {
  :deep(.interest-overlay-box) {
    backdrop-filter: blur(5px);
  }
}
div[role="dialog"] {
  .interest-enter-pop {
    border: var(--lobby__px) solid var(--skin__border);
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 300px;

    &__title {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 17px;
      font-weight: 400;
      font-stretch: normal;
      font-style: normal;
      letter-spacing: normal;
      color: var(--skin__lead);
      padding: 10px 15px 15px;
      box-sizing: border-box;
      line-height: 1.5;
    }
    .content-box {
      flex: 1;
      padding: 0 15px 10px;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .account-balance {
        justify-content: space-between;
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        line-height: 1;
        overflow: hidden;
        .balance-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--skin__neutral_2);
          .amount-text {
            margin-right: 5px;
            width: max-content;
          }
          .amount {
            color: var(--skin__accent_3);
            font-size: 14px;
            font-weight: 700;
          }
        }
        .settlement-label {
          font-size: 0.22rem;
          color: var(--skin__neutral_2);
          margin-left: 10px;
          text-align: right;
          span:first-child {
            display: inline-block;
          }
          *:last-child {
            margin-left: 5px;
            color: var(--skin__lead);
            display: inline-block;
          }
        }
      }
      .current-time {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        line-height: 15px;
        .label {
          color: var(--skin__lead);
          text-align: left;
          font-size: 13px;
        }
        .time {
          text-align: right;
          font-size: 11px;
          color: var(--skin__neutral_2);
        }
      }
      .tips {
        font-size: 12px;
        margin-top: 10px;
        margin-bottom: 5px;
        color: var(--skin__lead);
        text-align: left;
      }
    }

    &__footer {
      display: flex;
      justify-content: center;
      padding-top: 16px;
    }

    &__close {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: transparent;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }

    :deep(svg) {
      fill: currentcolor;
    }
  }
}
</style>
