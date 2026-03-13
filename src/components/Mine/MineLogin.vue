<script setup lang="ts" name="mine-login">
import router from "@/router";

defineOptions({ name: "mine-login" });

const jumpTo = (url: string) => {
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  router.push(url);
}

</script>

<template>
  <div class="user-login-box">
    <div class="row-box">
      <div class="login-box">
        <div class="bg-box" @click="jumpTo('/home/login')">
          <svg-icon name="style_2_btn_dl" class="text-[40px] text-[#F0C059]" />
          <span>登 录</span>
        </div>
      </div>
      <div class="register-box">
        <div class="bg-box" @click="jumpTo('/home/register')">
          <svg-icon name="style_2_btn_zc" class="text-[40px] text-[#F0C059]" />
          <span class="text-[#F0C059]">注 册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.user-login-box {
  padding: 4px 0 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .row-box {
    width: 100%;
    flex-direction: row-reverse;
    display: flex;
    align-items: center;

    .login-box, .register-box {
      height: 40px;
      padding: 0;
      background-color: transparent;
      color: #874404;
      margin: 0 0 0 -14px;
      width: 52%;
      font-size: 12px;
      border-radius: 5px;

      display: flex;
      align-items: center;
      justify-content: center;
      word-wrap: break-word;
      text-align: center;
      cursor: pointer;
      line-height: 1.3;
      position: relative;

      .bg-box {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 0;

        svg {
          width: 100%;
          height: 100%;
          position: absolute;
        }
        span {
          position: relative;
        }
      }
    }
  }
}
</style>
