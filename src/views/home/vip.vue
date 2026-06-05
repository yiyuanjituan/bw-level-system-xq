<script setup lang="ts">
import { ref } from "vue";
import { showCustomToast } from "@/hooks/useCommon";
import UiButton from "@/components/Common/Button.vue";
import UpLevelGift from "@/components/Vip/UpLevelGift.vue";
import UpLevelWeek from "@/components/Vip/UpLevelWeek.vue";
import router from "@/router";

const isLoading = ref(false);

function handleLoading() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showCustomToast({ message: "刷新成功", type: "success" });
  }, 500);
}

function jumpToRecord() {
  router.push("/home/records");
}
</script>

<template>
  <div class="vip-container">
    <div class="main-box">
      <div class="title-box">
        <svg-icon name="common-event-icon_vip_ms2" class-name="text-[21px] icon-box" />
        <span class="title-text">VIP奖励列表</span>
        <svg-icon name="common-event-icon_vip_ms2" class-name="text-[21px] icon-box scale-x-[-1]" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.vip-container {
  background: #000;
  display: flex;
  flex-direction: column;
  .main-box {
    height: 100%;
    padding-bottom: 10px;
    .title-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--skin__lead);
        line-height: 1.4;
      }
      .icon-box {
        color: var(--skin__neutral_2);
      }
    }
  }
}
</style>
