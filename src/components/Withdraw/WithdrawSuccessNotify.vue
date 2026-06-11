<script setup lang="ts" name="withdraw-success-notify">
import { computed, onMounted, ref } from 'vue';
import { useWindowSize } from '@vant/use';
import { getFindUsData } from '@/api/common';
import { formatMoney } from '@/utils/common';

const show = ref(false);
const params = ref<any>({});
const remoteData = ref<any>({});
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}
const dialogWidth = computed(() => {
  return ((Number(params.value?.width) ? Number(params.value?.width) : 300) / 375) * windowWidth.value;
});
defineExpose({
  open: openDialog
});

function init() {
  getFindUsData({}).then(data => {
    remoteData.value = data;
  });
}

onMounted(() => init());
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth">
    <template #default>
      <div class="dialog-container">
        <div class="dialog__header">
          <div class="title">
            <div class="tips-title">提现通知</div>
          </div>
        </div>
        <div class="content">
          <div>
            <div class="status-icon success-bg">
              <img src="/siteadmin/skin/lobby_asset/comm_icon_pay_1.avif" alt="" srcset="" />
            </div>
            <div class="status-text">提现成功</div>
            <ul>
              <li>
                <span>提现金额</span>
                <p>{{ formatMoney(10000000.00) }}<span class="member-currency">CNY</span></p>
              </li>
              <li>
                <span>手续费</span>
                <p>{{ formatMoney(888888888.00) }}<span class="member-currency">CNY</span></p>
              </li>
              <li>
                <span>实际到账</span>
                <p>0.00<span class="member-currency">CNY</span></p>
              </li>
              <li class="!items-center">
                <span>提现到</span>
                <p class="flex !items-center">
                  <img src="https://rvmgnk882.xq60924187.com:28907/siteadmin/pay-icon/icon_no_wallet.png" alt="" srcset="" class="logo">
                  <span>
                    <span class="type-name">NO钱包-CNY</span>
                    <span class="carAccount">(****9485)</span>
                  </span>
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <x-button class="!w-[100%]" @click="handleClose">知道了</x-button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="footer-box">
        <div class="close-icon" @click="handleClose">
          <svg-icon name="close" color="white" />
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<style scoped lang="less">
div[role='dialog'] {
  .dialog-container {
    border: var(--lobby__px) solid var(--skin__border);
    width: 100%;
    background: var(--skin__bg_2);
    border-radius: 10px;
    backface-visibility: hidden;
    overflow: auto;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .dialog__header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 15px;
      font-weight: 400;
      font-stretch: normal;
      font-style: normal;
      letter-spacing: normal;
      color: var(--skin__lead);
      padding: 10px 15px 15px;
      box-sizing: border-box;
      line-height: 1.5;
      .tips-title {
        font-size: 17px;
        color: var(--skin__lead);
      }
    }
    .content {
      max-height: 50vh;
      overflow: auto;
      flex: 1;
      padding: 0 15px 10px;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .status-icon {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        margin: 0 auto 7.5px;
      }
      .success-bg {
        background-color: var(--skin__accent_1);
      }
      .status-text {
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        color: var(--skin__accent_1);
      }
      ul {
        font-size: 11px;
        margin-top: 15px;
        li {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          margin-bottom: 10px;
          > span {
            color: var(--skin__lead);
            width: 75px;
            text-align: left;
            word-break: break-word;
            line-height: 22px;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
          }
          > p {
            width: 185px;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            color: var(--skin__lead);
            padding-left: 10px;
            font-size: 14px;
            line-height: 22px;
            .member-currency {
              margin-left: 3px;
              font-size: 10px;
              line-height: 22px;
              position: relative;
              top: 0.5px;
              color: var(--skin__neutral_1);
            }
            span {
              width: 100%;
              word-break: break-word;
              color: var(--skin__neutral_2);
            }
            .type-name {
              font-size: 11px;
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              vertical-align: middle;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              color: var(--skin__neutral_2);
              max-width: 130px;
              line-height: 1.4;
            }
            .carAccount {
              font-size: 11px;
              unicode-bidi: plaintext;
              color: var(--skin__neutral_2);
            }
          }
          .logo {
            width: 22px;
            margin-right: 7.5px;
          }
        }
      }
    }
    .footer {
      display: flex;
      overflow: hidden;
      user-select: none;
      padding: 10px 15px 15px;
      box-sizing: border-box;
      gap: 10px;
    }
  }

  .footer-box {
    position: relative;
    width: 100%;
    height: 45px;
    font-size: 8px;
    padding-top: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .close-icon {
      color: white;
      font-size: 30px;
    }
  }
}
</style>
