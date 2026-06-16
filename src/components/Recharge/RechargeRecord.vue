<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWindowSize } from '@vant/use';

const show = ref(false);
const params = ref<any>({});
const { width: windowWidth } = useWindowSize();

function openDialog() {
  show.value = true;
}

function handleClose() {
  show.value = false;
}

const dialogWidth = computed(() => {
  return ((Number(params.value?.width) ? Number(params.value?.width) : 355) / 375) * windowWidth.value;
});

defineExpose({
  open: openDialog
});
</script>

<template>
  <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" class-name="recharge-record-popup">
    <template #default>
      <div class="dialog-container">
        <div class="header-box"><span>存款记录</span></div>
        <div class="content-box">
          <div class="content-header">
            <div class="time-picker">
              <date-range-picker :panel-width="335" />
            </div>
            <div class="status-picker">
              <x-select />
            </div>
          </div>
          <div class="list-wrapper">
            <div class="item-box" v-for="i in 6" :key="i">
              <div class="content">
                <div class="row">
                  <div class="left">
                    <img class="icon" src="https://146.103.80.124:5001/siteadmin/upload/img/finance-1691947531341-912002.avif" alt="" srcset="" />
                    <span dir="ltr" class="payment-name">NO钱包</span>
                  </div>
                  <div class="right">300.00</div>
                </div>
                <div class="row">
                  <div class="left">
                    <span class="createtime">2026/06/17 01:53:34</span>
                    <span class="order-no">210179723590005270355</span>
                    <copy :text="`210179723590005270355`" class-name="!text-[12px]" />
                  </div>
                </div>
              </div>
              <div class="arrow">
                <svg-icon name="comm_icon_fh" class-name="rotate-[180deg] text-[8px]" style="color: var(--skin__neutral_2) !important;" />
              </div>
            </div>
          </div>
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
    .header-box {
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
    }
    .content-box {
      padding: 0 0 10px;
      flex: 1;
      box-sizing: border-box;
      min-height: 46px;
      color: var(--skin__lead);
      .content-header {
        padding: 0 10px 10px;
        line-height: 25px;
        display: flex;
        align-items: center;
        .time-picker {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          :deep(.van-popover__wrapper) {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .status-picker {
          margin-left: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          :deep(.x-select) {
            width: 85px;
            height: 25px;
            border-radius: 999rem;
          }
        }
      }
      .list-wrapper {
        max-height: 70vh;
        flex: 1;
        padding: 0 10px 10px;
        list-style: none;
        min-height: 50vh;
        .item-box {
          padding: 5px 10px;
          border-radius: 5px;
          display: flex;
          width: 100%;
          &:nth-child(odd) {
            background-color: var(--skin__bg_1);
          }
          .content {
            width: 100%;
            flex: 1;
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2.5px 0;
              .left {
                flex: 1;
                display: flex;
                align-items: center;
                .icon {
                  height: 24px;
                  width: 24px;
                  margin-right: 10px;
                }
                .payment-name {
                  font-size: 12px;
                  line-height: 1.3;
                  word-break: break-all;
                  display: -webkit-box;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  vertical-align: middle;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
                > span {
                  line-height: 1;
                }
                .createtime {
                  color: var(--skin__neutral_2);
                  font-size: 9px;
                }
                .order-no {
                  margin: 0 5px;
                  color: var(--skin__neutral_2);
                  font-size: 9px;
                }
              }
              .right {
                font-size: 13px;
                font-weight: 700;
                max-width: 30px;
                text-align: right;
                display: flex;
                align-items: center;
                justify-content: end;
              }
            }
          }
          .arrow {
            display: flex;
            align-items: center;
            padding-left: 10px;
            color: var(--skin__neutral_2);
          }
        }
      }
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

<style lang="less">
.recharge-record-popup {
  --van-padding-md: 0;
}
</style>
