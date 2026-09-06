<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import LoginRegisterPanel from "@/components/Common/LoginRegisterPanel.vue";
import { showCustomDialog } from "@/hooks/useCommon";
import { bus } from "@/utils/mitt";
import type { LoginFlowTab, LoginSuccessType } from "@/hooks/useLoginFlow";

defineOptions({
  name: "LoginDialog"
});

const visible = ref(false);
const activeTab = ref<LoginFlowTab>(1);
type LoginRegisterPanelExpose = {
  reset: (initialTab?: LoginFlowTab) => void;
};
const panelRef = ref<LoginRegisterPanelExpose>();

function open(tab: LoginFlowTab = 1) {
  activeTab.value = tab;
  visible.value = true;

  // 弹窗不通过路由区分登录/注册，打开时显式重置表单，避免上一次输入残留。
  void nextTick(() => panelRef.value?.reset(tab));
}

function close() {
  visible.value = false;
}

function handleSuccess(type: LoginSuccessType) {
  close();

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

function handleNavigate() {
  close();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && visible.value) close();
}

function openRegister() {
  open(0);
}

onMounted(() => {
  bus.on("showLogin", open);
  bus.on("showRegister", openRegister);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  bus.off("showLogin", open);
  bus.off("showRegister", openRegister);
  window.removeEventListener("keydown", handleKeydown);
});

defineExpose({
  open,
  close
});
</script>

<template>
  <van-dialog
    v-model:show="visible"
    class-name="login-dialog"
    overlay-class="login-dialog-overlay"
    width="345px"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :close-on-click-overlay="true"
    close-on-popstate
    teleport="body"
    destroy-on-close
  >
    <div class="login-dialog__main">
      <LoginRegisterPanel
        v-if="visible"
        ref="panelRef"
        :initial-tab="activeTab"
        @success="handleSuccess"
        @navigate="handleNavigate"
      />
    </div>
    <template #footer>
      <div class="login-dialog__footer">
        <button type="button" class="login-dialog__close" aria-label="关闭" @click="close">
          <svg-icon name="close" color="white" />
        </button>
      </div>
    </template>
  </van-dialog>
</template>

<style lang="less">
.login-dialog-overlay.van-overlay {
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(5px);
}

.login-dialog.van-dialog {
  width: min(345px, calc(100vw - 32px));
  max-height: calc(100dvh - 56px);
  overflow: visible !important;
  background: transparent !important;
  border-radius: 0;
}

.login-dialog .van-dialog__content {
  overflow: visible;
  padding: 0;
}

.login-dialog__main {
  width: 100%;
  max-height: calc(100dvh - 56px);
  padding-top: 10px;
  overflow: auto;
  border: var(--lobby__px) solid var(--skin__border);
  border-radius: 10px;
  background: var(--skin__bg_2);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
}

.login-dialog .van-dialog__footer {
  padding: 0;
  background: transparent;
}

.login-dialog__footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 45px;
  padding-top: 15px;
  box-sizing: border-box;
}

.login-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  font-size: 30px;
  cursor: pointer;
}

.login-dialog :deep(.login-register-panel) {
  max-height: calc(100dvh - 56px);
  overflow-y: auto;
}

.login-dialog :deep(.login-register-panel__header) {
  padding-top: 8px;
}
</style>
