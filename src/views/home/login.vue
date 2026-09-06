<script setup lang="ts">
import { onMounted, ref } from "vue";
import { handleBack } from "@/utils/common";
import { showCustomDialog } from "@/hooks/useCommon";
import { bus } from "@/utils/mitt";
import LoginRegisterPanel from "@/components/Common/LoginRegisterPanel.vue";
import type { LoginSuccessType } from "@/hooks/useLoginFlow";

defineOptions({
  name: "LoginPage"
});

const height = ref("100dvh");

function handleSuccess(type: LoginSuccessType) {
  handleBack();

  if (type !== "register") return;

  window.setTimeout(() => {
    void showCustomDialog({
      title: "注册成功",
      message: "恭喜您注册成功，赶紧玩一局吧~",
      confirmButtonText: "立即存款",
      showCancelButton: true,
      cancelButtonText: "稍后再说",
      titleColor: "#04be02"
    }).then(confirmed => {
      if (confirmed) bus.emit("showRecharge");
    });
  }, 100);
}

onMounted(() => {
  height.value = `${window.innerHeight}px`;
});
</script>

<template>
  <div class="common-container" :style="{ '--login-page-height': height }">
    <img src="@/assets/common/img_login_bg_style1_yd.avif" alt="" class="bg-img" />
    <div class="header">
      <button type="button" class="back-icon" aria-label="返回" @click="handleBack">
        <svg-icon name="arrow-back" />
      </button>
    </div>
    <LoginRegisterPanel sync-route @success="handleSuccess" />
  </div>
</template>

<style scoped lang="less">
.common-container {
  position: relative;
  min-height: var(--login-page-height);
  overflow: hidden;
  background: var(--skin__bg_2);
  font-size: 12px;
}

.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 260px;
  pointer-events: none;
}

.header {
  position: relative;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 10px;
}

.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  color: #adb6c3;
  background: transparent;
  cursor: pointer;
}

:deep(.login-register-panel) {
  position: relative;
  width: min(100%, 430px);
  max-height: calc(var(--login-page-height) - 64px);
  margin: 0 auto;
  padding-bottom: 16px;
}
</style>
