<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import QRCode from 'qrcode';
import UiBadge from '@/components/UI/badge.vue';
import { bus } from '@/utils/mitt';
import UiLoading from '@/components/UI/loading.vue';
import { service } from '@/api/service';
import { formatMoney, openUrlInNewWindow } from '@/utils/common';
import router from '@/router';
import useAppStore from '@/store/modules/app';
import { showImagePreview } from 'vant';

const orderId = ref<number>(0);
const show = ref(false);
const orderInfo = ref<any>({});
const generatedAddressQrCode = ref('');
let qrCodeGenerationId = 0;
const app = useAppStore();

const orderContent = computed(() => orderInfo.value?.content ?? {});
const currentRate = computed(() => {
  const countryList = app.appInfo?.countryList ?? [];
  const countryInfo = countryList.find((item: any) => item.id == orderInfo.value?.country_id);
  const rate = Number(countryInfo?.uRate);
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
});
const isCryptoRecharge = computed(() => {
  const contentName = String(orderContent.value?.name || '').toUpperCase();
  return Number(orderContent.value?.channelType) === 2 || String(orderContent.value?.cryptoCurrency || '').toUpperCase() === 'USDT' || contentName.includes('USDT');
});
const cryptoCurrency = computed(() => String(orderContent.value?.cryptoCurrency || 'USDT'));
const cryptoNetwork = computed(() => String(orderContent.value?.cryptoNetwork || 'TRC-20'));
const cryptoAddress = computed(() => String(orderContent.value?.cryptoAddress || orderContent.value?.pay_number || '').trim());
const cryptoAddressText = computed(() => cryptoAddress.value || '--');
const cryptoTransferAmount = computed(() => {
  const amount = Number(orderContent.value?.cryptoAmount);
  if (Number.isFinite(amount) && amount > 0) {
    return amount;
  }

  const money = Number(orderInfo.value?.money);
  if (isCryptoRecharge.value && Number.isFinite(money) && money > 0 && currentRate.value) {
    return Number((money / currentRate.value).toFixed(2));
  }

  return 0;
});
const cryptoTransferAmountText = computed(() => {
  return cryptoTransferAmount.value ? `${formatMoney(cryptoTransferAmount.value)} ${cryptoCurrency.value}` : '--';
});
const paymentQrCode = computed(() => {
  if (isCryptoRecharge.value) {
    return generatedAddressQrCode.value;
  }

  return String(orderContent.value?.pay_qrcode || '').trim();
});
const paymentQrCodeLabel = computed(() => (isCryptoRecharge.value ? '存款地址二维码' : '收款二维码'));
const paymentQrCodeAlt = computed(() => (isCryptoRecharge.value ? 'USDT存款地址二维码' : '收款二维码'));

function open(params: any = {}) {
  orderId.value = params?.id;
  show.value = true;
  initData();
}

function initData() {
  service.v1.user.getOrderInfoDetail({ id: orderId.value }).then(res => {
    orderInfo.value = res;
  });
}

function callToService() {
  close()
  router.push('/home/notice')
}

function handleContinue() {
  show.value = false;
  bus.emit('showRecharge');
}

function handleJumpUrl() {
  openUrlInNewWindow(orderInfo.value?.content?.url)
}

function handlePreviewQrCode() {
  const imageUrl = paymentQrCode.value;
  if (!imageUrl) return;

  showImagePreview({
    images: [imageUrl],
    closeable: true,
    showIndex: false
  });
}

function close() {
  show.value = false;
}

function onClosed() {
  show.value = false;
}

watch(
  () => ({ isCrypto: isCryptoRecharge.value, address: cryptoAddress.value }),
  async ({ isCrypto, address }) => {
    const currentGenerationId = ++qrCodeGenerationId;
    generatedAddressQrCode.value = '';

    if (!isCrypto || !address) {
      return;
    }

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(address, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 180
      });

      if (currentGenerationId === qrCodeGenerationId) {
        generatedAddressQrCode.value = qrCodeDataUrl;
      }
    } catch {
      if (currentGenerationId === qrCodeGenerationId) {
        generatedAddressQrCode.value = '';
      }
    }
  },
  { immediate: true }
);

defineExpose({
  open: open
});
</script>

<template>
  <van-popup destroy-on-close v-model:show="show" position="bottom" :overlay-style="{ 'backdrop-filter': 'blur(5px)' }" @closed="onClosed">
    <div class="popup-container">
      <div class="popup-header">
        <div class="back-icon" @click="close">
          <svg-icon name="arrow-back" class-name="ml-[-7.5px]"></svg-icon>
        </div>
        <p class="title">存款信息</p>
        <div class="actions">
          <ui-badge content="0" :size="[5, 5]">
            <div class="jl-ico" @click="callToService"><svg-icon name="comm_icon_cz_kf" /></div>
          </ui-badge>
        </div>
      </div>
      <div class="body-container" v-if="orderId && orderInfo?.id">
        <div class="content-box">
          <div class="status-container">
            <template v-if="[1, 2].includes(orderInfo?.pay_status)">
              <div class="status-icon">
                <img src="/siteadmin/skin/lobby_asset/comm_icon_pay_3.avif" alt="" srcset="" />
              </div>
              <div class="status-pay-text">
                <span>进行中</span>
                <svg-icon name="comm_icon_retry" class-name="main-text ml-[5px] text-[12px]" @click="initData()" />
              </div>
            </template>
            <template v-if="[-1].includes(orderInfo?.pay_status)">
              <div class="status-icon cancel-icon">
                <svg-icon name="comm_icon_tc_gant" class-name="text-[50px]" />
              </div>
              <div class="status-pay-text timeout-text">
                <span>您的付款已超时，请</span>
                <span class="retry-apply" @click="handleContinue()">重新发起</span>
              </div>
            </template>
            <template v-if="[3].includes(orderInfo?.pay_status)">
              <div class="status-icon success-icon">
                <svg-icon name="comm_icon_gou" class-name="text-[24px]" />
              </div>
              <div class="status-pay-text success-text">
                <span class="">存款成功</span>
              </div>
            </template>
            <template v-if="[4].includes(orderInfo?.pay_status)">
              <div class="status-icon cancel-icon">
                <svg-icon name="comm_icon_tc_gant" class-name="text-[50px]" />
              </div>
              <div class="status-pay-text timeout-text">
                <span>您的付款失败</span>
              </div>
            </template>
            <div class="amount">
              <span class=""><span class="unitName">￥</span>{{ formatMoney(orderInfo?.money) }}</span>
              <div class="ml-[5px]">
                <copy :text="formatMoney(orderInfo?.money)" />
              </div>
            </div>
          </div>

          <div class="list !pt-[10px]" v-if="orderInfo.mode == 1 && [1, 2].includes(orderInfo?.pay_status)">
            <template v-if="isCryptoRecharge">
              <div class="list-item-box">
                <span class="label">收款币种</span>
                <span class="info">
                  <span class="account crypto-tag">{{ cryptoCurrency }}</span>
                </span>
              </div>
              <div class="list-item-box">
                <span class="label">区块格式</span>
                <span class="info">
                  <span class="account">{{ cryptoNetwork }}</span>
                </span>
              </div>
              <div class="list-item-box">
                <span class="label">转账金额</span>
                <span class="info">
                  <span dir="ltr" class="crypto-transfer-amount">{{ cryptoTransferAmountText }}</span>
                  <span class="copy-label" v-if="cryptoTransferAmount">
                    <copy class-name="!text-[13px] main-text" :text="formatMoney(cryptoTransferAmount)" />
                  </span>
                </span>
              </div>
              <div class="list-item-box">
                <span class="label">存款地址</span>
                <span class="info">
                  <span class="account crypto-address">{{ cryptoAddressText }}</span>
                  <span class="copy-label" v-if="cryptoAddress">
                    <copy class-name="!text-[13px] main-text" :text="cryptoAddress" />
                  </span>
                </span>
              </div>
            </template>
            <template v-else>
              <div class="list-item-box">
                <span class="label">收款银行</span>
                <span class="info">
                  <span class="account">{{ orderInfo?.content?.pay_bank }}</span>
                  <span class="copy-label">
                    <copy class-name="!text-[13px] main-text" :text="orderInfo?.content?.pay_bank" />
                  </span>
                </span>
              </div>
              <div class="list-item-box" v-if="orderInfo">
                <span class="label">收款姓名</span>
                <span class="info">
                  <span class="account">{{ orderInfo?.content?.pay_name }}</span>
                  <span class="copy-label">
                    <copy class-name="!text-[13px] main-text" :text="orderInfo?.content?.pay_name" />
                  </span>
                </span>
              </div>
              <div class="list-item-box">
                <span class="label">收款账号</span>
                <span class="info">
                  <span class="account">{{ orderInfo?.content?.pay_number }}</span>
                  <span class="copy-label">
                    <copy class-name="!text-[13px] main-text" :text="orderInfo?.content?.pay_number" />
                  </span>
                </span>
              </div>
            </template>
            <div class="payment-qrcode-box" v-if="paymentQrCode" @click="handlePreviewQrCode">
              <div class="payment-qrcode">
                <img :src="paymentQrCode" :alt="paymentQrCodeAlt" />
              </div>
              <span class="payment-qrcode-label">{{ paymentQrCodeLabel }}</span>
            </div>
          </div>

          <div class="list !pt-[10px]">
            <div class="list-item-box">
              <span class="label">存款方式</span>
              <span class="info">
                <img :src="orderInfo?.content?.icon" v-if="orderInfo?.content?.icon" alt="" srcset="" class="w-[16px] h-[16px] mr-[5px]" />
                <span dir="ltr">{{ orderInfo.content?.name }}</span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">存款账号</span>
              <span class="info">
                <span class="account">{{ orderInfo?.userAccount }}</span>
                <span class="copy-label">
                  <copy class-name="!text-[13px] main-text" :text="orderInfo?.userAccount" />
                </span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">订单号码</span>
              <span class="info">
                <span class="account" style="white-space: nowrap">{{ orderInfo?.order_sn }}</span>
                <span class="copy-label">
                  <copy class-name="!text-[13px] main-text" :text="orderInfo?.order_sn" />
                </span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">存款金额</span>
              <span class="info">
                <span dir="ltr">￥{{ formatMoney(orderInfo?.money) }}</span>
                <span class="copy-label">
                  <copy class-name="!text-[13px] main-text" :text="formatMoney(orderInfo?.money)" />
                </span>
              </span>
            </div>
            <div class="list-item-box" v-if="Number(orderInfo.bonusAmount) > 0 && [1, 2, 3].includes(orderInfo?.pay_status)">
              <span class="label" v-if="[1, 2].includes(orderInfo?.pay_status)">预计赠送</span>
              <span class="label" v-if="[3].includes(orderInfo?.pay_status)">赠送金额</span>
              <span class="info">
                <img src="/siteadmin/skin/lobby_asset/img_czjl_mccz.avif" alt="" srcset="" class="w-[19px] h-[19px] mr-[5px]" />
                <span class="reward-amount">+{{ formatMoney(orderInfo.bonusAmount) }}</span>
              </span>
            </div>
            <div class="list-item-box" v-if="[1, 2, 3].includes(orderInfo?.pay_status)">
              <span class="label" v-if="[1, 2].includes(orderInfo?.pay_status)">预计到账</span>
              <span class="label" v-if="[3].includes(orderInfo?.pay_status)">实际到账</span>
              <span class="info">
                <span dir="ltr">{{ formatMoney(Number(orderInfo.money) + Number(orderInfo.bonusAmount)) }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex-1"></div>
        <div class="footer">
          <div class="btns">
            <div class="btn btn-plain" v-if="false">{{ $t("查看订单") }}</div>
            <div class="btn" @click="handleContinue" v-if="[-1, 3, 4].includes(orderInfo?.pay_status) || orderInfo?.content?.url?.startsWith('inner')">{{ $t("继续存款") }}</div>
            <div class="btn" @click="handleJumpUrl" v-if="orderInfo?.content?.url && [1,2].includes(orderInfo?.pay_status) && orderInfo?.content?.url?.startsWith('http')">{{ $t("跳转三方") }}</div>
          </div>
          <div class="tips">
            <span>{{ $t("若存款过程遇到问题，请随时") }}</span>
            <span class="main-text" @click="callToService">{{ $t("联系客服") }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-1 w-[100%] h-[100%] items-center justify-center" v-if="!(orderId && orderInfo?.id)">
        <ui-loading />
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="less">
.popup-container {
  --half-screen-header-height: 50px;
  height: calc(100dvh);
  border-radius: 10px 10px 0 0;
  background-color: var(--skin__bg_2);
  color: var(--skin__lead);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .popup-header {
    height: var(--half-screen-header-height);
    position: relative;
    .back-icon {
      position: absolute;
      width: 40px;
      height: var(--half-screen-header-height);
      line-height: var(--half-screen-header-height);
      text-align: center;
      left: 0;
      top: 0;
      color: var(--skin__neutral_1);
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .title {
      font-size: 16px;
      height: var(--half-screen-header-height);
      line-height: var(--half-screen-header-height);
      margin: auto;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .actions {
      font-size: 18px;
      color: var(--skin__primary);
      padding: 5px;

      position: absolute;
      display: flex;
      align-items: center;
      height: 100%;
      right: 0;
      top: 0;

      .kf-ico {
        padding: 10px;
      }
      .jl-ico {
        padding: 10px;
      }
    }
  }
  .body-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #000;
    padding: 10px 10px 0;

    .content-box {
      padding: 10px;
      overflow-y: auto;
      border-radius: 7px;
      background: var(--skin__bg_2);
      box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.06);

      .status-container {
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        margin-bottom: 15px;
        .status-icon {
          background-color: var(--skin__accent_3);
          height: 45px;
          width: 45px;
          border-radius: 50%;
          margin-bottom: 7.5px;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .cancel-icon {
          background-color: var(--skin__neutral_2);
        }
        .success-icon {
          background-color: var(--skin__accent_1);
        }
        .status-pay-text {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          margin-top: 2px;
          span {
            color: var(--skin__accent_3);
            font-size: 12px;
          }
        }
        .success-text {
          span {
            color: var(--skin__accent_1) !important;
          }
        }
        .timeout-text {
          span {
            line-height: 13px;
            color: var(--skin__neutral_2);
            font-size: 12px;
          }
          .retry-apply {
            color: var(--skin__primary);
          }
        }
        .amount {
          font-size: 25px;
          display: flex;
          align-items: center;
          margin-top: 7.5px;
          .right-text {
            color: var(--skin__accent_1);
          }
        }
      }
      .list {
        border-top: thin dashed var(--skin__border);
        padding-top: 5px;
        .list-item-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 13px;
          margin-bottom: 10px;
          font-size: 13px;
          line-height: 17px;
          .label {
            flex: 1;
            max-width: 40%;
            color: var(--skin__lead);
            align-self: flex-start;
          }
          .info {
            display: flex;
            align-items: center;
            word-break: break-all;
            max-width: 60%;
            line-height: 100%;
            .copy-label {
              margin-left: 5px;
              line-height: 9px;
              color: var(--skin__primary);
              cursor: pointer;
            }
            .account {
              color: var(--skin__neutral_2);
            }
            .crypto-tag {
              color: var(--skin__accent_3);
              font-weight: 700;
            }
            .crypto-address {
              max-width: 190px;
              text-align: right;
              line-height: 16px;
              word-break: break-all;
            }
            .crypto-transfer-amount {
              color: var(--skin__accent_3);
              font-weight: 700;
            }
            .reward-amount {
              font-size: 13px;
              font-weight: 700;
              color: var(--skin__accent_3);
              text-decoration: underline;
            }
          }
        }
        .payment-qrcode-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 2px 0 12px;
          padding: 10px;
          border: var(--lobby__px) solid var(--skin__border);
          border-radius: 7px;
          background: var(--skin__bg_1);
          cursor: pointer;
          transition: opacity 0.2s ease;
          &:active {
            opacity: 0.85;
          }
        }
        .payment-qrcode {
          width: 130px;
          height: 130px;
          padding: 7px;
          border-radius: 6px;
          background: #fff;
          img {
            display: block;
            width: 100%;
            height: 100%;
          }
        }
        .payment-qrcode-label {
          margin-top: 7px;
          color: var(--skin__neutral_2);
          font-size: 12px;
          line-height: 14px;
        }
      }
    }

    .footer {
      padding: 10px 5px 20px;
      .btns {
        display: flex;
        align-items: flex-end;
        gap: 10px;
        .btn {
          flex: 1;
          height: 35px;
          font-size: 12px;
          color: var(--skin__text_primary);
          background: var(--skin__primary);
          border: var(--lobby__px) solid var(--skin__primary);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-plain {
          background: transparent;
          color: var(--skin__primary);
        }
      }
      .tips {
        font-size: 12px;
        padding-top: 10px;
        text-align: center;
        color: var(--skin__neutral_2);
      }
    }
  }
}
</style>
