<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CommonCopy from "@/components/Common/Copy.vue";
import MineShowInfo from "@/components/Mine/MineShowInfo.vue";
import MyWallet from "@/components/Mine/MyWallet.vue";
import defaultAvatarUrl from "@/assets/setting/default-avatar.avif";

defineOptions({
  name: "TemplateTwoUserPanel"
});

const props = defineProps<{
  user: Eps.UserInfoEntity;
  currencyPrefix?: string | number;
}>();

const emit = defineEmits<{
  action: ["profile"];
}>();

const isShowInfo = ref(false);
const avatarLoadFailed = ref(false);

const avatarUrl = computed(() => {
  return props.user.avatarUrl && !avatarLoadFailed.value ? props.user.avatarUrl : defaultAvatarUrl;
});

const displayName = computed(() => {
  if (props.user.showAccount === 2 && props.user.phone) {
    const prefix = props.currencyPrefix ? `+${props.currencyPrefix} ` : "";
    return `${prefix}***${String(props.user.phone).slice(-3)}`;
  }

  if (props.user.showAccount === 0) return props.user.unionid || "--";

  return props.user.account || props.user.nickName || props.user.unionid || "--";
});

const copyText = computed(() => {
  if (props.user.showAccount === 0) return props.user.unionid || "";
  if (props.user.showAccount === 1 || props.user.showAccount === undefined) return props.user.account || "";
  return "";
});

watch(
  () => props.user.avatarUrl,
  () => {
    // 用户更换头像后重新尝试加载接口返回的新地址。
    avatarLoadFailed.value = false;
  }
);
</script>

<template>
  <div class="mine-template-two-user">
    <div class="mine-template-two-user__avatar-wrap">
      <van-image
        class="mine-template-two-user__avatar"
        width="44px"
        height="44px"
        round
        :src="avatarUrl"
        @error="avatarLoadFailed = true"
      />
      <button type="button" class="mine-template-two-user__edit" @click="emit('action', 'profile')">
        <svg-icon name="mine-template-two-icon_grzl" />
      </button>
    </div>

    <div class="mine-template-two-user__content">
      <div class="mine-template-two-user__name-row">
        <button
          type="button"
          class="mine-template-two-user__toggle"
          :class="{ 'mine-template-two-user__toggle--active': isShowInfo }"
          @click="isShowInfo = !isShowInfo"
        >
          <svg-icon name="arrow-down" />
        </button>
        <MineShowInfo v-if="isShowInfo" @close="isShowInfo = false" />
        <span class="mine-template-two-user__name">{{ displayName }}</span>
        <CommonCopy
          v-if="copyText"
          class="mine-template-two-user__copy"
          class-name="text-[13px]"
          :text="copyText"
        />
      </div>

      <div class="mine-template-two-user__meta-row">
        <div class="mine-template-two-user__id">
          <span class="mine-template-two-user__id-label">ID:</span>
          <span class="mine-template-two-user__id-value">{{ user.unionid || "--" }}</span>
          <CommonCopy
            v-if="user.unionid"
            class="mine-template-two-user__copy mine-template-two-user__copy--id"
            class-name="text-[13px]"
            :text="user.unionid"
          />
        </div>
        <span class="mine-template-two-user__divider" />
        <MyWallet class="mine-template-two-user__wallet" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-user {
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
}

.mine-template-two-user__avatar-wrap {
  width: 44px;
  height: 44px;
  flex: none;
  position: relative;
}

.mine-template-two-user__avatar {
  overflow: hidden;
  border: var(--lobby__px) solid rgba(var(--skin__primary__toRgbString), 0.35);
  background: var(--skin__bg_2);
}

.mine-template-two-user__edit {
  width: 21px;
  height: 21px;
  padding: 0;
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--lobby__px) solid var(--skin__bg_1);
  border-radius: 50%;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  font-size: 20px;
  cursor: pointer;
}

.mine-template-two-user__content {
  min-width: 0;
  flex: 1;
}

.mine-template-two-user__name-row,
.mine-template-two-user__meta-row,
.mine-template-two-user__id {
  min-width: 0;
  display: flex;
  align-items: center;
}

.mine-template-two-user__name-row {
  min-height: 14px;
  margin-bottom: 4px;
  position: relative;
}

.mine-template-two-user__toggle {
  width: 9px;
  height: 9px;
  padding: 0;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
  font-size: 8px;
  transform: rotate(90deg);
  transition: transform 0.2s;
  cursor: pointer;

  &--active {
    transform: rotate(270deg);
  }
}

.mine-template-two-user__name {
  min-width: 0;
  max-width: 110px;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-template-two-user__copy {
  margin-left: 4px;
  color: var(--skin__primary);
}

.mine-template-two-user__meta-row {
  height: 20px;
  margin-top: 0;
  font-size: 16px;
}

.mine-template-two-user__id {
  width: 125px;
  color: var(--skin__lead);
  font-size: 16px;
  line-height: 20px;
}

.mine-template-two-user__id-label {
  margin-right: 5px;
  color: var(--skin__neutral_1);
}

.mine-template-two-user__id-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-template-two-user__copy--id {
  margin-left: 5px;
}

.mine-template-two-user__divider {
  width: 0.5px;
  height: 13px;
  margin: 0 10px;
  flex: none;
  background: var(--skin__lead);
  opacity: .1;
}

.mine-template-two-user__wallet {
  min-width: 0;

  :deep(.currency-info-box) {
    --currency-info-box-height: 20px;
    --currency-info-box-border-radius: 10px;
    --currency-info-box-background-color: transparent;
    --currency-info-currency-count-color: var(--skin__lead);
    --currency-info-currency-count-border-color: var(--skin__lead);
    --currency-info-currency-count-size: 16px;
    --currency-info-currency-count-max-width: 105px;
    --currency-info-currency-count-margin: 0 0 0 4px;
    --currency-info-refresh-icon-color: var(--skin__primary);
    --currency-info-refresh-icon-size: 14px;
    --currency-info-refresh-icon-margin: 0 0 0 5px;
    --currency-info-gaming-color: var(--skin__lead);
    --currency-info-gaming-size: 12px;
  }
}

:global([dir="rtl"]) .mine-template-two-user__edit {
  right: auto;
  left: 0;
}

:global([dir="rtl"]) .mine-template-two-user__copy,
:global([dir="rtl"]) .mine-template-two-user__copy--id {
  margin-right: 4px;
  margin-left: 0;
}

:global([dir="rtl"]) .mine-template-two-user__id-label {
  margin-right: 0;
  margin-left: 5px;
}
</style>
