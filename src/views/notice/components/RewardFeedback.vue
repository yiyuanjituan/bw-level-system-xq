<script setup lang="ts">
import { ref } from "vue";
import RewardSubmit from "@/views/notice/components/RewardSubmit.vue";

const activePage = ref<1 | 2>(1)
</script>

<template>
  <div class="reward-container">
    <div class="nav-box">
      <div class="nav-item" :class="{ 'nav-item-active': activePage == 1 }" @click="activePage = 1">创建反馈</div>
      <div class="nav-item" :class="{ 'nav-item-active': activePage == 2 }" @click="activePage = 2">我的反馈</div>
      <div class="wrapper-receive" v-if="activePage == 2">
        <div class="inner-wrapper-receive">
          <div class="column">
            <div class="literal">待领取</div>
            <div class="amount"><span>0.00</span></div>
          </div>
        </div>
        <x-button disabled type="success" size="normal" class="button">一键领取</x-button>
      </div>
    </div>
    <reward-submit v-if="activePage == 1" />
  </div>
</template>

<style scoped lang="less">
.reward-container {
  width: 100%;
  overflow: auto;
  padding: 10px 10px 0;
  font-size: 12px;
  background: var(--skin__bg_1);
  height: 100%;
  display: flex;
  flex-direction: column;
  .nav-box {
    display: flex;
    margin-bottom: 10px;
    position: relative;
    .nav-item {
      margin-right: 10px;
      height: 30px;
      background: var(--skin__bg_2);
      max-width: 120px;
      min-width: 75px;
      font-size: 12px;
      line-height: 1.2;
      border-radius: 15px;
      word-break: break-word;
      border: solid 1px var(--skin__border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--skin__neutral_1);
    }
    .nav-item-active {
      color: var(--skin__text_primary);
      background: var(--skin__primary);
      border: var(--lobby__px) solid var(--skin__primary);
    }
    .wrapper-receive {
      position: absolute;
      right: 0;
      width: 180px;
      display: flex;
      align-items: center;
      .inner-wrapper-receive {
        flex: 1;
        margin: 0 10px;
        display: flex;
        justify-content: flex-end;
        .column {
          line-height: 1.25;
          text-align: center;
          display: flex;
          flex-direction: column;
        }
        .literal {
          color: var(--skin__neutral_2);
          font-size: 12px;
          display: -webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .amount {
          color: var(--skin__accent_3);
          font-size: 12px;
        }
      }
      .button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 25px;
        line-height: 12px;
        font-size: 10px;
      }
    }
  }
}
</style>
