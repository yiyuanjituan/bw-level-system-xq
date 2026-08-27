<script setup lang="ts">
import UiBadge from "@/components/UI/badge.vue";
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
}>();

const emit = defineEmits<{
  guestAction: ["login" | "register"];
  headerAction: ["service" | "message"];
  profileAction: ["profile"];
}>();
</script>

<template>
  <section
    class="mine-template-two-top"
    :class="{ 'mine-template-two-top--login': isLogin }"
  >
    <header class="mine-template-two-top__header">
      <span />
      <div v-if="isLogin" class="mine-template-two-top__tools">
        <button
          type="button"
          class="mine-template-two-top__tool"
          :aria-label="$t('联系客服')"
          @click="emit('headerAction', 'service')"
        >
          <span class="mine-template-two-top__tool-icon">
            <svg-icon name="mine-template-two-top_kf" />
          </span>
        </button>
        <UiBadge :content="messageCount" :size="[2, -2]">
          <button
            type="button"
            class="mine-template-two-top__tool"
            :aria-label="$t('公告')"
            @click="emit('headerAction', 'message')"
          >
            <span class="mine-template-two-top__tool-icon">
              <svg-icon name="mine-template-two-top_xx" />
            </span>
          </button>
        </UiBadge>
      </div>
      <span v-else class="mine-template-two-top__placeholder" />
    </header>

    <TemplateTwoUserPanel
      v-if="isLogin"
      :user="user"
      :currency-prefix="currencyPrefix"
      @action="emit('profileAction', $event)"
    />
    <TemplateTwoGuestPanel v-else @action="emit('guestAction', $event)" />
  </section>
</template>

<style scoped lang="less">
.mine-template-two-top {
  width: 100%;
  padding: 35px 0 0;
  box-sizing: border-box;

  &--login {
    padding-top: 8px;
  }
}

.mine-template-two-top__header {
  min-height: 24px;
  padding: 0 13px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-template-two-top__tools {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mine-template-two-top__tool {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  color: var(--skin__primary);
  background: transparent;
  cursor: pointer;
}

.mine-template-two-top__tool-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.mine-template-two-top__placeholder {
  width: 24px;
  height: 24px;
}
</style>
