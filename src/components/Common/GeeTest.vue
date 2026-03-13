<script setup lang="ts">
import { CaptchaConfig, GeetestCaptcha } from "vue3-geetest";
import { ref } from "vue";

const config: CaptchaConfig = {
  product: "bind",
  nativeButton: {
    width: "100%",
    height: "50px"
  }
};
const geeTest = ref();
const isLoadSuccess = ref(false);
const emit = defineEmits(["success"]);

const initGeeTest = (instance: any) => {
  geeTest.value = instance;
  isLoadSuccess.value = !instance.isOffline();
  instance.onSuccess(function () {
    emit("success");
  });
};

const showCaptcha = () => {
  if (!isLoadSuccess.value) {
    emit("success");
  } else {
    geeTest.value.showCaptcha();
  }
};
defineExpose({
  showCaptcha
});
</script>

<template>
  <GeetestCaptcha :config="config" @initialized="initGeeTest" />
</template>

<style scoped lang="less"></style>