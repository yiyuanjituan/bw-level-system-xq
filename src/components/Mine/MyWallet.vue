<script setup lang="ts">
import useAuthStore from "@/store/modules/user";
import { computed, ref } from "vue";
import useAppStore from "@/store/modules/app";

const auth = useAuthStore();
const isRefresh = ref(false);
const app = useAppStore();
const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(v => v.id == auth.user.currencyId);
});

function onRefresh() {
  isRefresh.value = true;
  auth.updateInfo().finally(() => (isRefresh.value = false));
}
</script>

<template>
  <div class="currency-info-box">
    <div class="currency-icon">
      <div class="w-[15px] h-[15px] rounded-full text-[0px] overflow-hidden">
        <van-image width="100%" height="100%" :src="currencyInfo?.icon" round>
          <template v-slot:error></template>
        </van-image>
      </div>
    </div>
    <div class="currency-info">
      <div class="currency-content-wrap" v-if="!isRefresh">
        <div class="currency-count">
          <span>{{ auth.user.money }}</span>
        </div>
      </div>
      <div class="gaming" v-if="isRefresh">加载中</div>
      <div
        class="refresh-icon"
        @click="onRefresh"
        :class="[isRefresh ? 'animate__spin' : '']"
      >
        <svg-icon name="comm_icon_sx" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.currency-info-box {
  border: solid thin var(--skin__border);
  --currency-info-refresh-icon-color: var(--skin__primary);
  --currency-info-refresh-icon-width: 15px;
  --currency-info-refresh-icon-size: 15px;
  --currency-info-box-border-radius: 10px;
  --currency-info-box-height: 20px;
  --currency-info-box-padding: 0 0 0 1px;
  --currency-info-box-background-color: transparent;
  --currency-info-currency-count-max-width: 82px;
  --currency-info-currency-count-size: 11px;
  --currency-info-currency-count-margin: 0 0 0 4px;
  --currency-info-currency-count-color: #ffaa09;
  --currency-info-currency-count-border-color: #ffaa09;
  --currency-info-currency-font-weight: normal;
  --currency-info-refresh-icon-margin: 4px;
  --currency-info-gaming-color: var(--skin__neutral_2);
  --currency-info-gaming-size: 9px;

  border-radius: var(--currency-info-box-border-radius);
  height: var(--currency-info-box-height);
  padding: var(--currency-info-box-padding);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
  background-color: var(--currency-info-box-background-color);

  .currency-icon {
    background-image: url(@/assets/common/img_hb_frame.avif);
    background-size: 100% 100%;
    width: 17px;
    height: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
  .currency-info {
    display: flex;
    align-items: center;
    height: 100%;
    position: relative;
    transition: all 0.3s;
    .currency-content-wrap {
      position: relative;
      .currency-count {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: var(--currency-info-currency-count-max-width);
        font-size: var(--currency-info-currency-count-size);
        margin: var(--currency-info-currency-count-margin);
        color: var(--currency-info-currency-count-color);
        border-bottom: 0.02rem solid
          var(--currency-info-currency-count-border-color);
        font-weight: var(--currency-info-currency-font-weight);
        > span {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          display: block;
          max-width: var(--currency-info-currency-count-max-width);
        }
      }
    }
    .gaming {
      width: max-content;
      padding: 0 6.5px;
      color: var(--currency-info-gaming-color);
      font-size: var(--currency-info-gaming-size);
    }
    .refresh-icon {
      height: 100%;
      display: flex;
      align-items: center;
      position: relative;

      color: var(--currency-info-refresh-icon-color);
      font-size: var(--currency-info-refresh-icon-size);
      margin: var(--currency-info-refresh-icon-margin);
      width: var(--currency-info-refresh-icon-width);
    }

    .animate__spin {
      animation: spin 0.3s linear infinite; /* 2秒一次，匀速，无限循环 */
    }
  }
}
</style>
