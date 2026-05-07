<script setup lang="ts">
import { ref } from "vue";
import UiBadge from "@/components/UI/badge.vue";
import { getChannelList } from "@/api/common";
import useClipboard from "vue-clipboard3";
import { showCustomToast } from "@/hooks/useCommon";
import { bus } from "@/utils/mitt";

const { toClipboard } = useClipboard()
const show = ref(false);
const listData = ref<any>([])
const isShowCopy = ref(true)

function open() {
  show.value = true;
  initData()
}

function handleCopyText(text: string) {
  toClipboard(text).then(() => {
    isShowCopy.value = false;
    showCustomToast({ type: "success", message: '复制成功' });
    setTimeout(() => isShowCopy.value = true, 2000)
  })
}

function initData() {
  getChannelList().then((res) => {
    listData.value = res;
  })
}

function handleContinue() {
  show.value = false;
  bus.emit('showRecharge')
}

defineExpose({
  open: open
})
</script>

<template>
  <van-popup v-model:show="show" position="bottom" :overlay-style="{ 'backdrop-filter': 'blur(5px)' }">
    <div class="popup-container">
      <div class="popup-header">
        <div class="back-icon" @click="show = false">
          <svg-icon name="arrow-back" class-name="ml-[-7.5px]"></svg-icon>
        </div>
        <p class="title">存款信息</p>
        <div class="actions">
          <ui-badge content="0" :size="[5,5]">
            <div class="jl-ico"><svg-icon name="comm_icon_cz_jl" /></div>
          </ui-badge>
        </div>
      </div>
      <div class="body-container">
        <div class="content-box">
          <div class="status-container">
            <div class="status-icon">
              <img src="/siteadmin/skin/lobby_asset/comm_icon_pay_3.avif" alt="" srcset="">
            </div>
            <div class="status-icon cancel-icon">
              <svg-icon name="comm_icon_tc_gant" class-name="text-[50px]" />
            </div>
            <div class="status-pay-text" v-if="false">
              <span>进行中</span>
              <svg-icon name="comm_icon_retry" class-name="main-text ml-[5px] text-[12px]" />
            </div>
            <div class="status-pay-text timeout-text">
              <span>您的付款已超时，请</span>
              <span class="retry-apply">重新发起</span>
            </div>
            <div class="amount">
              <span class=""><span class="unitName">￥</span>50.00</span>
              <div class="ml-[5px]" @click="handleCopyText('50')">
                <svg-icon name="comm_icon_copy" v-if="isShowCopy" class-name="text-[15px] main-text" />
                <svg-icon name="comm_icon_gou" v-if="!isShowCopy" class-name="text-[15px] right-text" />
              </div>
            </div>
          </div>

          <div class="list">
            <div class="list-item-box">
              <span class="label">存款方式</span>
              <span class="info">
                <img src="https://20.2.25.135:20002/siteadmin/upload/img/finance-1764948895290-540460.avif" alt="" srcset="" class="w-[16px] h-[16px] mr-[5px]">
                <span dir="ltr">其他电子钱包</span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">存款账号</span>
              <span class="info">
                <span class="account">asuya612</span>
                <span class="copy-label">
                  <svg-icon name="comm_icon_copy" v-if="isShowCopy" class-name="text-[13px] main-text" />
                </span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">订单号码</span>
              <span class="info">
                <span class="account">210179723040042054040</span>
                <span class="copy-label">
                  <svg-icon name="comm_icon_copy" v-if="isShowCopy" class-name="text-[13px] main-text" />
                </span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">存款金额</span>
              <span class="info">
                <span dir="ltr">50.00</span>
                <span class="copy-label">
                  <svg-icon name="comm_icon_copy" v-if="isShowCopy" class-name="text-[13px] main-text" />
                </span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">预计赠送</span>
              <span class="info">
                <img src="/siteadmin/skin/lobby_asset/img_czjl_mccz.avif" alt="" srcset="" class="w-[19px] h-[19px] mr-[5px]">
                <span class="reward-amount">+1.00</span>
              </span>
            </div>
            <div class="list-item-box">
              <span class="label">预计到账</span>
              <span class="info">
                <span dir="ltr">51.00</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex-1"></div>
        <div class="footer">
          <div class="btns">
            <div class="btn btn-plain">查看订单</div>
            <div class="btn" @click="handleContinue">继续存款</div>
            <div class="btn">跳转三方</div>
          </div>
          <div class="tips">
            <span>若存款过程遇到问题，请随时</span>
            <span class="main-text">联系客服</span>
          </div>
        </div>
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
        }
        .cancel-icon {
          background-color: var(--skin__neutral_2);
        }
        .status-pay-text {
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            line-height: 13px;
            color: var(--skin__accent_3);
            font-size: 12px;
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
            .reward-amount {
              font-size: 13px;
              font-weight: 700;
              color: var(--skin__accent_3);
              text-decoration: underline;
            }
          }
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
