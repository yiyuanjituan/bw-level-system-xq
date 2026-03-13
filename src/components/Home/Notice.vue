<script setup lang="ts">
import UiBadge from "@/components/UI/badge.vue";

defineOptions({
  name: "HomeNotice"
});
</script>

<template>
  <div class="global-marquee px-[12px]">
    <van-notice-bar
      left-icon="volume-o"
      text="无论我们能活多久，我们能够享受的只有无法分割的此刻，此外别无其他。"
    >
      <template #left-icon>
        <img
          src="@/assets/home/icon_dt_pmd.avif"
          alt="."
          class="left-icon mr-[5px]"
        />
      </template>
      <template #right-icon>
        <div class="right-icon">
          <ui-badge :content="99999">
            <img
              src="@/assets/home/icon_dt_1xx_wd.avif"
              alt="."
              class="w-[29px] h-[25.38px]"
            />
          </ui-badge>
        </div>
      </template>
    </van-notice-bar>
  </div>
</template>

<style scoped lang="less">
.global-marquee {
  --van-notice-bar-height: 25px;
  --van-notice-bar-background: transparent;
  --van-notice-bar-text-color: #adb6c3;
  --van-notice-bar-font-size: 12px;
  --van-notice-bar-padding: 0px;
  margin-top: 10px;

  .left-icon {
    width: 18px;
    height: 16.5px;
  }
  .right-icon {
    width: 30px;
    height: 28.3px;
  }
}
</style>
