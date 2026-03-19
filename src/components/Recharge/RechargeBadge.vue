<script setup lang="ts">
import { ref } from "vue";

interface Props {
  content?: string;
}

const showTotalWallet = ref(true)
const props = withDefaults(defineProps<Props>(), {
  content: ''
});
</script>

<template>
  <div class="recharge-badge__wrapper">
    <slot />
    <div class="recharge-badge" v-if="content">
      <div class="recharge-badge__content">{{ content }}</div>
      <div class="ui-badge__gift">
        <img src="/siteadmin/skin/lobby_asset/img_jlqp_cw.avif" alt="" srcset="">
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.recharge-badge__wrapper {
  position: relative;
  display: inline-block;

  .recharge-badge {
    font-weight: 600;
    font-size: 10px;
    line-height: 13px;
    height: 13px;
    padding: 0 4px;
    border-radius: 6.5px 6.5px 6.5px 0;
    right: 0;
    top: -9px;
    transform: translate(5px, -50%);
    position: absolute;
    transform-origin: 100%;
    display: inline-block;
    box-sizing: border-box;
    min-width: 16px;
    color: #fff;
    text-align: center;
    background: var(--skin__accent_2);
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    overflow: visible;
    vertical-align: middle;
    &::before {
      content: "";
      display: inline-block;
      position: absolute;
      bottom: -3px;
      z-index: 20;
      left: 0;
      width: 0;
      height: 0;
      border-left: 3.9px solid var(--skin__accent_2);
      border-top: 3.3px solid transparent;
      border-bottom: 3.3px solid transparent;
      font-size: 0;
    }
    .recharge-badge__content {
      color: #fff;
      font-weight: 700;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
      z-index: 1;
      max-width: 100px;
    }
    .ui-badge__gift {
      width: 16px;
      left: 4px;
      top: 1px;
      transform: translate(-100%, .04rem);
      height: 19px;
      z-index: 21;
      position: absolute;
      img {
        height: auto;
        max-width: 100%;
        width: 100%;
      }
    }
  }
}
</style>
