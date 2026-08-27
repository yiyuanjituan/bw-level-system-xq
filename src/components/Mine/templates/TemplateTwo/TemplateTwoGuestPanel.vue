<script setup lang="ts">
import { $t } from "@/locales";
import defaultAvatarUrl from "@/assets/setting/default-avatar.avif";

defineOptions({
  name: "TemplateTwoGuestPanel"
});

const emit = defineEmits<{
  action: ["login" | "register"];
}>();
</script>

<template>
  <div class="mine-template-two-guest">
    <div class="mine-template-two-guest__info">
      <van-image
        class="mine-template-two-guest__avatar"
        width="44px"
        height="44px"
        round
        :src="defaultAvatarUrl"
      />
      <div class="mine-template-two-guest__tips">
        <span>{{ $t("请先") }}</span>
        <button type="button" @click="emit('action', 'login')">{{ $t("登 录") }}</button>
        <span>{{ $t("或") }}</span>
        <button type="button" @click="emit('action', 'register')">{{ $t("注 册") }}</button>
      </div>
    </div>

    <div class="mine-template-two-guest__actions">
      <button type="button" class="mine-template-two-guest__login" @click="emit('action', 'login')">
        {{ $t("登 录") }}
      </button>
      <button type="button" class="mine-template-two-guest__register" @click="emit('action', 'register')">
        {{ $t("注 册") }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-guest {
  width: calc(100% - 20px);
  margin: 0 10px;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mine-template-two-guest__info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mine-template-two-guest__avatar {
  flex: none;
  overflow: hidden;
  border: var(--lobby__px) solid rgba(var(--skin__primary__toRgbString), 0.35);
  background: var(--skin__bg_2);
}

.mine-template-two-guest__tips {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 1.35;

  button {
    padding: 0 2.5px;
    border: 0;
    color: var(--skin__lead);
    background: transparent;
    font: inherit;
    cursor: pointer;
  }
}

.mine-template-two-guest__actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mine-template-two-guest__login,
.mine-template-two-guest__register {
  width: 60px;
  height: 25px;
  padding: 0 5px;
  box-sizing: border-box;
  border: thin solid var(--skin__primary);
  border-radius: 5px;
  font-size: 10px;
  line-height: 1.3;
  text-align: center;
  cursor: pointer;
}

.mine-template-two-guest__login {
  color: var(--skin__text_primary);
  background: var(--skin__primary);
}

.mine-template-two-guest__register {
  color: var(--skin__primary);
  background: transparent;
}

:global([dir="rtl"]) .mine-template-two-guest__tips {
  direction: rtl;
}
</style>
