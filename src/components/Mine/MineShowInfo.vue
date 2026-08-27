<script setup lang="ts" name="mine-show-info">
import useAuthStore from "@/store/modules/user";
import * as _ from "lodash-es";
import { computed } from "vue";
import useAppStore from "@/store/modules/app";
import { updateUserInfo } from "@/api/common";

defineOptions({ name: "MineShowInfo" });

const auth = useAuthStore();
const app = useAppStore();
const emit = defineEmits(["close"]);

const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(v => v.id == auth.user.currencyId);
});

const currencyPrefix = computed(() => {
  const numberPrefix = currencyInfo.value?.numberPrefix;
  return numberPrefix ? `+${numberPrefix} ` : "";
});

function handleChangeAccount(type: number) {
  updateUserInfo({ showAccount: type }).then(() => {
    auth.updateInfo();
    emit("close");
  });
}
</script>

<template>
  <div class="mine-info">
    <span class="default-info">默认展示信息</span>
    <div class="name-item" :class="{ 'active-item': auth.user.showAccount == 1 }" @click="handleChangeAccount(1)">
      <svg-icon name="input_icon_zh" class="item-icon" />
      <span class="item-content">{{ auth.user.account }}</span>
    </div>
    <div class="name-item" v-if="auth.user.phone" :class="{ 'active-item': auth.user.showAccount == 2 }" @click="handleChangeAccount(2)">
      <svg-icon name="input_icon_sj" class="item-icon" />
      <span class="item-content">
        {{ currencyPrefix }}
        ***
        {{ _.join(_.takeRight(auth.user.phone, 3), "") }}</span
      >
    </div>
    <div class="name-item" :class="{ 'active-item': auth.user.showAccount == 0 }" @click="handleChangeAccount(0)">
      <span class="item-title">ID</span>
      <span class="item-content">{{ auth.user.unionid }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-info {
  --select-custom-option-defult-info: var(--skin__lead);
  --select-custom-option-defult-info-margin: 5px 5px 5px 0;
  --select-custom-option-font-size: 15px;
  --select-custom-option-title-font-size: 13.5px;
  width: max-content;
  max-width: calc(100vw - 20px);
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: solid thin var(--skin__border);
  background: var(--skin__bg_2);
  padding: 10px 10px 7.5px;
  display: flex;
  flex-direction: column;
  min-width: 210px;
  position: absolute;
  left: 0;
  z-index: 100;
  top: 15px;
  box-sizing: border-box;
  font-size: 13px;

  .default-info {
    color: var(--select-custom-option-defult-info);
    margin: var(--select-custom-option-defult-info-margin);
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
    color: var(--skin__neutral_2);
    cursor: pointer;

    .item-icon {
      width: var(--select-custom-option-font-size);
      height: var(--select-custom-option-font-size);
      flex: none;
      font-size: var(--select-custom-option-font-size);
    }

    .item-title {
      flex: 0 0 15px;
      font-size: var(--select-custom-option-title-font-size);
      font-weight: 600;
      text-align: center;
    }

    .item-content {
      max-width: 168px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      unicode-bidi: plaintext;
    }
  }

  .active-item {
    color: var(--skin__primary) !important;

    .item-content {
      color: var(--skin__primary) !important;
    }
  }
}

:global([dir="rtl"]) .mine-info {
  right: 0;
  left: auto;
}
</style>
