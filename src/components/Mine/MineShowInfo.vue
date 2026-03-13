<script setup lang="ts" name="mine-show-info">
import useAuthStore from "@/store/modules/user";
import * as _ from "lodash-es";
import { computed } from "vue";
import useAppStore from "@/store/modules/app";
import { updateUserInfo } from "@/api/common";

defineOptions({ name: "MineShowInfo" });

const auth = useAuthStore();
const app = useAppStore();
const emit = defineEmits(['close'])

const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(v => v.id == auth.user.currencyId);
});

function handleChangeAccount(type: number) {
  updateUserInfo({ showAccount: type }).then(() => {
    auth.updateInfo()
    emit("close");
  });
}
</script>

<template>
  <div class="mine-info">
    <span class="default-info">默认展示信息</span>
    <div class="name-item" :class="{ 'active-item': auth.user.showAccount == 1 }" @click="handleChangeAccount(1)">
      <svg-icon name="input_icon_zh" class-name="text-[15px]" />
      <span class="item-content">{{ auth.user.account }}</span>
    </div>
    <div class="name-item" v-if="auth.user.phone" :class="{ 'active-item': auth.user.showAccount == 2 }" @click="handleChangeAccount(2)">
      <svg-icon name="input_icon_sj" class-name="text-[15px]" />
      <span class="item-content">
        {{ (currencyInfo.numberPrefix ? "+" : "") + currencyInfo.numberPrefix }}
        ***
        {{ _.join(_.takeRight(auth.user.phone, 3), "") }}</span
      >
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-info {
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: solid thin #313843;
  background: #1c1e23;
  padding: 10px 10px 7.5px;
  display: flex;
  flex-direction: column;
  min-width: 210px;
  position: absolute;
  left: 0;
  z-index: 100;
  top: 15px;
  .default-info {
    color: #fff;
    margin: 0 0 7px 0;
    font-size: 11px;
    max-width: 190px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .name-item {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 40px;
    color: #999;
    .item-content {
      max-width: 160px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 12px;
      color: #656565;
    }
  }
  .active-item {
    color: #DFBE5B !important;
    .item-content {
      color: #DFBE5B !important;
    }
  }
}
</style>