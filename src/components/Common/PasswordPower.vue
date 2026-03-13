<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "PasswordPower"
});

interface Props {
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: ""
});

const colors = computed(() => {
  if (!props.text || !props.text.length) return ["#313843", "#313843", "#313843", "#313843"];

  const hasNumber = /\d/.test(props.text);
  const hasLower = /[a-z]/.test(props.text);
  const hasUpper = /[A-Z]/.test(props.text);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(props.text);
  const trueCount = [hasNumber, hasLower, hasUpper, hasSpecial].filter(Boolean).length;
  if (trueCount == 1) {
    return ["#EA4E3D", "#313843", "#313843", "#313843"];
  }
  if (trueCount == 2) {
    return ["#FFAA09", "#FFAA09", "#313843", "#313843"];
  }
  if (trueCount == 3) {
    return ["#F0C059", "#F0C059", "#F0C059", "#313843"];
  }
  if (trueCount == 4) {
    return ["#04BE02", "#04BE02", "#04BE02", "#04BE02"];
  }
});
</script>

<template>
  <div class="password-power">
    <span class="mr-[5px]">密码强度</span>
    <span class="colorLump" :style="{ background: colors[0] }"></span>
    <span class="colorLump" :style="{ background: colors[1] }"></span>
    <span class="colorLump" :style="{ background: colors[2] }"></span>
    <span class="colorLump" :style="{ background: colors[3] }"></span>
  </div>
</template>

<style scoped lang="less">
.password-power {
  height: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  font-size: 11px;
  margin-right: 5px;
  color: white;
  transition: all 0.3s;

  .colorLump {
    width: 40px;
    height: 6px;
    background: #313843;
    border-radius: 6px;
    margin-right: 5px;
    transition: all 0.3s;
  }
}
</style>