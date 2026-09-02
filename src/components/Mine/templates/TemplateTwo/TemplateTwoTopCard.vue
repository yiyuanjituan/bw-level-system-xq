<script setup lang="ts">
import { $t } from "@/locales";
import TemplateTwoGuestPanel from "./TemplateTwoGuestPanel.vue";
import TemplateTwoUserPanel from "./TemplateTwoUserPanel.vue";

defineOptions({
  name: "TemplateTwoTopCard"
});

defineProps<{
  isLogin: boolean;
  user: Eps.UserInfoEntity;
  messageCount: number;
  currencyPrefix?: string | number;
  currencyIcon?: string;
}>();

const emit = defineEmits<{
  guestAction: ["login" | "register"];
  headerAction: ["service" | "message"];
  profileAction: ["profile"];
}>();
</script>

<template>
  <div
    class="mine-template-two-top-card top-user-card-box"
    :class="{ 'mine-template-two-top-card--login': isLogin }"
  >
    <div class="mine-template-two-top-card__header">
      <div />
      <header v-if="isLogin" class="mine-template-two-top-card__tools header-wrapper">
        <div
          class="mine-template-two-top-card__tool header-item common-item"
          role="button"
          tabindex="0"
          :aria-label="$t('联系客服')"
          @click="emit('headerAction', 'service')"
          @keydown.enter.space.prevent="emit('headerAction', 'service')"
        >
          <i class="mine-template-two-top-card__tool-icon lobby-image icon">
            <svg-icon name="mine-template-two-top_kf" />
          </i>
        </div>
        <div
          class="mine-template-two-top-card__tool header-item common-item"
          role="button"
          tabindex="0"
          :aria-label="$t('公告')"
          @click="emit('headerAction', 'message')"
          @keydown.enter.space.prevent="emit('headerAction', 'message')"
        >
          <div class="ui-badge__wrapper mine-template-two-top-card__badge-box">
            <i class="mine-template-two-top-card__tool-icon lobby-image icon">
              <svg-icon name="mine-template-two-top_xx" />
            </i>
            <div
              v-if="messageCount > 0"
              class="ui-badge ui-badge--top-right ui-badge--fixed mine-template-two-top-card__badge"
            >
              <div class="ui-badge__content">{{ messageCount }}</div>
            </div>
          </div>
        </div>
      </header>
      <div v-else class="mine-template-two-top-card__placeholder" />
    </div>

    <TemplateTwoUserPanel
      v-if="isLogin"
      :user="user"
      :currency-prefix="currencyPrefix"
      :currency-icon="currencyIcon"
      @action="emit('profileAction', $event)"
    />
    <TemplateTwoGuestPanel v-else @action="emit('guestAction', $event)" />
  </div>
</template>

<style scoped lang="less">
.mine-template-two-top-card {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 35px 0 0;
  box-sizing: border-box;

  &--login {
    padding-top: 8px;
  }
}

.mine-template-two-top-card__header {
  min-height: 24px;
  padding: 0 13px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-template-two-top-card__tools {
  display: flex;
  align-items: center;
}

.mine-template-two-top-card__tool {
  width: 24px;
  height: 24px;
  margin-left: 15px;
  color: var(--skin__primary);
  cursor: pointer;
}

.mine-template-two-top-card__tool-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.mine-template-two-top-card__badge-box {
  width: 24px;
  height: 24px;
  position: relative;
}

.mine-template-two-top-card__badge {
  min-width: 13px;
  height: 13px;
  padding: 0 3px;
  box-sizing: border-box;
  position: absolute;
  top: -2px;
  right: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #fff;
  background: var(--skin__accent_2);
  font-size: 8px;
  line-height: 13px;
}

.mine-template-two-top-card__placeholder {
  width: 24px;
  height: 24px;
}

:global([dir="rtl"]) .mine-template-two-top-card__tool {
  margin-right: 15px;
  margin-left: 0;
}

:global([dir="rtl"]) .mine-template-two-top-card__badge {
  right: auto;
  left: -2px;
}
</style>
