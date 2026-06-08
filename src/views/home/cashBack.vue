<script setup lang="ts">
</script>

<template>
  <div class="cash-back-container">
    <div class="sub-info">
      <div class="data">
        <div>今日可领取</div>
        <div class="amount">
          <span class="value">0.00</span>
        </div>
      </div>
    </div>
    <div class="section-content">
      <div class="cashback-box">
        <div class="cashback-left">
          <div class="category-list">
            <div class="item" v-for="i in 10" :key="i">
              <x-badge>
                <div class="item-inner-box"></div>
              </x-badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.cash-back-container {
  .sub-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 35px;
    padding: 0 10px;
    align-items: center;
    .data {
      display: flex;
      align-items: baseline;
      font-size: 11px;
      line-height: 1.2;
      color: var(--skin__neutral_1);
      .amount {
        display: flex;
        align-items: center;
        .value {
          margin-left: 5px;
          color: var(--skin__accent_3);
        }
      }
    }
  }
  .section-content {
    width: 100%;
    flex: 1;
    max-height: 100%;
    position: relative;
    z-index: 1;
    .cashback-box {
      width: 100%;
      height: 100%;
      min-height: 250px;
      padding: 0 10px;
      display: flex;
      .cashback-left {
        height: 100%;
        min-height: 250px;
        padding-top: 0;
        flex: none;
        display: flex;
        .category-list {
          max-height: calc(var(--window-height) - 262px);
          height: fit-content;
          padding-bottom: 0;
          overflow: auto;
          .item {
            height: unset !important;

            .item-inner-box {
              width: 75px;
              height: 35px;
              margin-bottom: 10px;
              background: url("@/assets/common/btn_zc1_2.avif") no-repeat;
              background-size: 100% 100%;
            }
          }
        }
      }
    }
  }
}
</style>
