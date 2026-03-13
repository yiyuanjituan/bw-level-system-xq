<script setup lang="ts">
import { ref } from "vue";
import useAuthStore from "@/store/modules/user";

const walletIsLoading = ref(false);
const auth = useAuthStore();
const typeList = [
  // { id: 0, name: 'No钱包' },
  { id: 1, name: '正常提现' },
  { id: 2, name: '转为数字货币' },
  { id: 3, name: '三方钱包' },
]
const selectTypeId = ref(1)

function handleChangeType(item) {
  selectTypeId.value = item.id;
}


const updateWallet = () => {
  walletIsLoading.value = true;
  auth.updateInfo();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 1000);
};
</script>

<template>
  <div class="apply-box">
    <div class="content-box">
      <div class="withdraw-info-main">
        <div class="withdraw-info">
          <div class="left">
            余额&nbsp;<span class="currency">{{  auth.user.money }}</span>&nbsp;
            <div
              class="refresh-icon"
              :class="[walletIsLoading ? 'ml-[4px] animate__spin' : 'ml-[4px]']"
              @click="updateWallet"
            >
              <svg width="1em" height="1em" fill="#F0C059" class="">
                <use xlink:href="#comm_icon_sx"></use>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="choose-type">
        <div
          class="choose-item"
          :class="{ 'choose-item-active': selectTypeId == item.id }"
          v-for="(item, index) in typeList"
          :key="index"
          @click="handleChangeType(item)"
        >{{ item.name }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="less">
.apply-box {
  height: 100%;
  overflow: auto;
  position: relative;
  .content-box {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    .withdraw-info-main {
      background-color: #191919;
      border-bottom: thin solid #242424;
      padding: 10px;
      .withdraw-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: auto;
        .left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-size: 12px;
          color: #656565;

          .currency {
            color: #ffaa09;
            font-weight: 700;
            white-space: nowrap;
          }
        }
      }
    }

    .choose-type {
      width: 100%;
      height: 66px;
      background: #191919;
      border-bottom: thin solid #242424;
      cursor: pointer;
      padding: 15px 10px;
      display: flex;
      
      .choose-item {
        position: relative;
        flex: 1;
        height: 35px;
        border-radius: 7px;
        margin-right: 5px;
        color: white;
        border: thin solid #242424;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
        font-size: 11px;

        &:last-child {
          margin: 0;
        }
      }
      .choose-item-active {
        border-color: #DFBE5B;
        color: #dfbe5b;
      }
    }
  }

  .animate__spin {
    animation: spin 0.5s linear infinite; /* 2秒一次，匀速，无限循环 */
  }

  @keyframes spin {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
