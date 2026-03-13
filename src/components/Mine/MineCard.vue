<script setup lang="ts" name="mine-card">
import useAuthStore from "@/store/modules/user";
import { computed, ref } from "vue";
import * as _ from "lodash-es";
import useAppStore from "@/store/modules/app";
import useClipboard from "vue-clipboard3";
import { showCustomToast } from "@/hooks/useCommon";

defineOptions({ name: "mine-card" });

const auth = useAuthStore();
const app = useAppStore();
const walletIsLoading = ref(false);
const { toClipboard } = useClipboard();
const isShowInfo = ref(false);
const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(v => v.id == auth.user.currencyId);
});

function copyAccount(text) {
  toClipboard(text).then(() => {
    showCustomToast({ type: "success", message: "复制成功" });
  });
}

const updateWallet = () => {
  walletIsLoading.value = true;
  auth.updateInfo();
  setTimeout(() => {
    walletIsLoading.value = false;
  }, 2000);
};
</script>

<template>
  <div class="user-center">
    <div class="avatar-box">
      <van-image round width="100%" height="100%" :src="auth.user.avatarUrl" />
      <div class="edit-icon absolute">
        <svg-icon name="icon_grzl" />
      </div>
    </div>
    <div class="username-id">
      <div class="user-name">
        <div
          @click="isShowInfo = !isShowInfo"
          class="rotate-box"
          :class="{ 'rotate-[180deg]': isShowInfo, 'mr-[3.5px]': true }"
        >
          <svg width="1em" height="1em" fill="currentColor" class="down-icon">
            <use xlink:href="#comm_icon_sort"></use>
          </svg>
        </div>
        <mine-show-info v-if="isShowInfo" @close="isShowInfo = !isShowInfo" />
        <span class="user-info-show-name" v-if="auth.user.showAccount == 1">{{
          auth.user.account
        }}</span>
        <span class="user-info-show-name" v-if="auth.user.showAccount == 2">
          {{
            (currencyInfo.numberPrefix ? "+" : "") + currencyInfo.numberPrefix
          }}
          ***
          {{ _.join(_.takeRight(auth.user.phone, 3), "") }}
        </span>
        <span
          class="copy-icon"
          v-if="auth.user.showAccount == 1"
          @click="copyAccount(auth.user.account)"
        >
          <svg width="1em" height="1em" fill="currentColor" class="">
            <use xlink:href="#comm_icon_copy"></use>
          </svg>
        </span>
      </div>
      <div class="username-id-currency">
        <p class="flex items-center user-id">
          <span class="label">ID:</span>
          <span class="id-text">{{ auth.user.unionid }}</span>
          <span class="copt-text" @click="copyAccount(auth.user.unionid)">
            <i class="inline-flex justify-center items-center w-[15px]">
              <svg width="1em" height="1em" fill="currentColor" class="">
                <use xlink:href="#comm_icon_copy"></use>
              </svg>
            </i>
          </span>
        </p>
        <span class="sperator"></span>
        <div class="flex items-center currency-box">
          <div class="currency">
            <van-image
              :src="currencyInfo?.icon"
              alt=""
              srcset=""
              width="100%"
              height="100%"
              round
            />
          </div>
          <div class="currency-info">
            <div class="currency-count" :style="{ borderBottom: `${walletIsLoading ? 0 : 1}px solid white` }">
              <span style="line-height: 17px" v-if="!walletIsLoading">{{ auth.user.money }}</span>
              <span style="line-height: 12px" v-if="walletIsLoading" class="text-[#F0C059] text-[12px] mx-[1px]">加载中</span>
            </div>
            <div
              class="refresh-icon"
              :class="[walletIsLoading ? 'ml-[0px] animate__spin' : 'ml-[4px]']"
              @click="updateWallet"
            >
              <svg width="1em" height="1em" fill="#F0C059" class="">
                <use xlink:href="#comm_icon_sx"></use>
                <!---->
              </svg>
            </div>
            <!--            <div-->
            <!--              class="text-[17px] text-[#F0C059] w-[11px]"-->
            <!--              :class="[walletIsLoading ? 'ml-[0px] animate__spin' : 'ml-[0px]']"-->
            <!--              @click="updateWallet"-->
            <!--            >-->
            <!--              <svg-icon name="comm_icon_sx" />-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.user-center {
  position: relative;
  margin-top: 0;
  font-size: 12px;
  justify-content: flex-start;
  display: flex;
  align-items: center;

  .avatar-box {
    width: 50px;
    height: 50px;
    position: relative;
    border-radius: 50%;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .edit-icon {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 21px;
      height: 21px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid #202329;
      background-color: #f0c059;
      font-size: 20px;
      color: #874404;
    }
  }

  .username-id {
    margin-left: 10px;
    display: flex;
    flex-direction: column;

    .user-name {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      height: 14px;
      position: relative;
      .rotate-box {
        transition: all 0.2s;
      }

      .down-icon {
        color: #68707b;
        font-size: 7.5px;
        transition: all 0.3s;
      }

      .user-info-show-name {
        color: white;
        margin: 0;
        font-size: 12px;
        display: block;
        max-width: 110px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .copy-icon {
        margin: 0 0 0 4px;
        color: #f0c059;
        font-size: 13px;
        position: relative;
      }
    }

    .username-id-currency {
      display: flex;
      align-items: center;
      height: 20px;

      .user-id {
        font-size: 16px;
        justify-content: flex-start;
        display: flex;
        align-items: center;
        line-height: 16px;

        .label {
          margin-right: 5px;
          color: #adb6c3;
        }

        .id-text {
          margin-right: 5px;
          color: white;
        }

        .copt-text {
          width: 15px;
          font-size: 16px;
          height: 15px;
          color: #f0c059;
          margin-bottom: 1px;
        }
      }
    }

    .sperator {
      width: 1px;
      height: 14px;
      margin: 0 8px;
      background: #ffffff33;
    }

    .currency-box {
      .currency {
        width: 17px;
        height: 17px;
        font-size: 12px;
      }

      .currency-info {
        display: flex;
        align-items: center;
        height: 100%;
        position: relative;

        .currency-count {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 100px;
          font-size: 16px;
          margin: 0 0 0 4px;
          color: white;
          font-weight: normal;
          height: 19px;
          display: flex;
          align-items: center;
        }
        .refresh-icon {
          font-size: 17px;
          margin-left: 5px;
        }
      }
    }
  }

  .animate__spin {
    animation: spin 0.2s linear infinite; /* 2秒一次，匀速，无限循环 */
  }
}
</style>