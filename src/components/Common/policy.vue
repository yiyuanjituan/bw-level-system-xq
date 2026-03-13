<script setup lang="ts">
import { ref } from "vue";
import UiPopup from "@/components/UI/popup.vue";
const showPopup = ref(false);

const open = () => {
  showPopup.value = true;
}

defineExpose({
  open: open,
})
</script>

<template>
  <ui-popup v-model:show="showPopup">
    <div class="popup-content">
      <div class="message">
        <p style="text-align: center;"><strong>用户协议</strong></p>
        <p style="text-align: center;">&nbsp;</p>
        <p style="text-align: center;">&nbsp;</p>
        <p>1. 为避免于本公司投注时之争议，请会员务必于进入app前详阅本公司定制各项规则，客户一经“我同意”进入本公司进行投注时，即被视为已接受本公司。</p>
        <p style="text-align: center;">&nbsp;</p>
        <p>2. 会员有责任确保自己的帐户以及登入资料的保密性，以会员帐号及密码进行的任何线上投注，将被视为有效。敬请不定时做密码变更之动作。若帐号密码被盗用，进行的投注，本公司一概不负赔偿责任。</p>
        <p style="text-align: center;">&nbsp;</p>
        <p>3. 本公司保留不定时更改本协定或游戏规则或保密条例，更改之条款将从更改发生后指定之日起生效，并保留一切有争议事项及最后的决策权。</p>
        <p style="text-align: center;">&nbsp;</p>
        <p>4. 用户须达到居住地国家法律规定之合法年龄方可使用线上娱乐场或app。网上投注如未能成功提交投注将被视为无效。</p>
        <p style="text-align: center;">&nbsp;</p>
        <p>5. 凡玩家于出牌途中且尚无结果前自动或强制断线时，并不影响比赛之结果。</p>
      </div>
      <div class="footer">
        <div class="confirm-btn" @click="showPopup = !showPopup">已阅读</div>
      </div>
    </div>
  </ui-popup>
</template>

<style scoped lang="less">
.popup-content {
  height: 100%;
  display: flex;
  align-items: center;
  min-height: 52px;
  color: white;
  flex: 1;
  padding: 0 15px 10px;
  box-sizing: border-box;
  flex-direction: column;

  .message {
    height: 100%;
    overflow-y: auto;
    padding-top: 10px;
    min-height: 150px;
    font-size: 11px;
    color: #ADB6C3;
    text-align: initial;
    line-height: 18px;
    word-wrap: break-word;
    letter-spacing: normal;
    white-space: pre-wrap;
    flex: 1;
  }
  .footer {
    display: flex;
    overflow: hidden;
    user-select: none;
    padding: 20px 0 0;
    box-sizing: border-box;
    gap: 10px;
    width: 100%;
    .confirm-btn {
      background: #F0C059;
      flex: 1;
      height: 35px;
      border-radius: 7px;
      width: 100%;
      color: #874404;
      font-size: 12px;
      box-sizing: border-box;
      line-height: 1.2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>