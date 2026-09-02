<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CommonCopy from "@/components/Common/Copy.vue";
import MineShowInfo from "@/components/Mine/MineShowInfo.vue";
import defaultAvatarUrl from "@/assets/setting/default-avatar.avif";
import { $t } from "@/locales";
import useAuthStore from "@/store/modules/user";

defineOptions({
  name: "TemplateTwoUserPanel"
});

const props = defineProps<{
  user: Eps.UserInfoEntity;
  currencyPrefix?: string | number;
  currencyIcon?: string;
}>();

const emit = defineEmits<{
  action: ["profile"];
}>();

const auth = useAuthStore();
const isShowInfo = ref(false);
const isRefresh = ref(false);
const avatarLoadFailed = ref(false);

const avatarUrl = computed(() => {
  return props.user.avatarUrl && !avatarLoadFailed.value ? props.user.avatarUrl : defaultAvatarUrl;
});

const avatarBackgroundStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(avatarUrl.value)})`
}));

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
  if (props.user.showAccount === 1 || props.user.showAccount === undefined) {
    return props.user.account || "";
  }
  return "";
});

function onRefresh() {
  if (isRefresh.value) return;

  isRefresh.value = true;
  auth.updateInfo().finally(() => {
    isRefresh.value = false;
  });
}

watch(
  () => props.user.avatarUrl,
  avatarSource => {
    avatarLoadFailed.value = false;
    if (!avatarSource) return;

    // 头像由接口动态替换，预加载失败时才回退到本地默认头像。
    const avatarImage = new Image();
    avatarImage.onload = () => {
      if (props.user.avatarUrl === avatarSource) avatarLoadFailed.value = false;
    };
    avatarImage.onerror = () => {
      if (props.user.avatarUrl === avatarSource) avatarLoadFailed.value = true;
    };
    avatarImage.src = avatarSource;
  },
  { immediate: true }
);
</script>

<template>
  <div class="mine-template-two-user info-and-balance">
    <div
      class="mine-template-two-user__avatar lobby-image lobby-image--use-bg mine-avatar-wrap user-avatar"
      :style="avatarBackgroundStyle"
    >
      <div
        class="mine-template-two-user__edit mine-avatar-edit-wrap"
        role="button"
        tabindex="0"
        @click="emit('action', 'profile')"
        @keydown.enter.space.prevent="emit('action', 'profile')"
      >
        <i class="lobby-image">
          <svg-icon name="mine-template-two-icon_grzl" />
        </i>
      </div>
    </div>

    <div class="mine-template-two-user__account-wrap account-wrap">
      <div class="mine-template-two-user__account account">
        <div class="mine-template-two-user__custom-name select-custom-name">
          <div class="mine-template-two-user__name-content">
            <span class="ui-popover__wrapper mine-template-two-user__popover">
              <span
                class="mine-template-two-user__toggle mine-account-toggle-box"
                :class="{ 'mine-template-two-user__toggle--active': isShowInfo }"
                role="button"
                tabindex="0"
                @click="isShowInfo = !isShowInfo"
                @keydown.enter.space.prevent="isShowInfo = !isShowInfo"
              >
                <svg-icon name="comm_icon_sort" class-name="!text-[4px]" />
              </span>
              <MineShowInfo v-if="isShowInfo" @close="isShowInfo = false" />
            </span>
            <span class="mine-template-two-user__name show-hidden-arrow user-info-show-name">
              {{ displayName }}
            </span>
            <CommonCopy
              v-if="copyText"
              class="mine-template-two-user__copy copy"
              class-name="text-[13px]"
              :text="copyText"
            />
          </div>
        </div>
      </div>

      <div class="mine-template-two-user__sub-info sub-info">
        <p class="mine-template-two-user__id id-box">
          <span class="mine-template-two-user__id-label">ID:</span>
          <span class="mine-template-two-user__id-value">{{ user.unionid || "--" }}</span>
          <CommonCopy
            v-if="user.unionid"
            class="mine-template-two-user__copy mine-template-two-user__copy--id copy"
            class-name="text-[13px]"
            :text="user.unionid"
          />
        </p>
        <span class="mine-template-two-user__divider" />
        <img
          v-if="currencyIcon"
          class="mine-template-two-user__currency-sign currency-sign"
          :src="currencyIcon"
          alt=""
        />
        <div class="mine-template-two-user__currency global-currency-info-index user-currency-info">
          <div class="ui-popover__wrapper">
            <div class="currency-info-box no-border">
              <div class="currency-info-custom">
                <div v-if="!isRefresh" class="currency-content-wrap">
                  <div class="currency-count">
                    <span>{{ user.money }}</span>
                  </div>
                </div>
                <div v-else class="gaming">{{ $t("加载中") }}</div>
                <div
                  class="icon-content refresh"
                  role="button"
                  tabindex="0"
                  @click="onRefresh"
                  @keydown.enter.space.prevent="onRefresh"
                >
                  <i class="refresh-icon" :class="{ 'animate__spin': isRefresh }">
                    <svg-icon name="comm_icon_sx" />
                  </i>
                </div>
              </div>
            </div>
          </div>
        </div>
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
}

.mine-template-two-user__avatar {
  width: 44px;
  height: 44px;
  position: relative;
  flex: none;
  border-radius: 50%;
  background-color: var(--skin__bg_2);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.mine-template-two-user__edit {
  width: 21px;
  height: 21px;
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--skin__bg_1);
  border-radius: 50%;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  cursor: pointer;

  i {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
}

.mine-template-two-user__account-wrap {
  min-width: 0;
  margin-left: 5px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mine-template-two-user__account {
  position: relative;
  z-index: 2;
  min-height: 14px;
  margin-bottom: 4px;
}

.mine-template-two-user__custom-name,
.mine-template-two-user__name-content,
.mine-template-two-user__sub-info,
.mine-template-two-user__id,
.mine-template-two-user__currency,
.currency-info-custom {
  min-width: 0;
  display: flex;
  align-items: center;
}

.mine-template-two-user__name-content {
  position: relative;
}

.mine-template-two-user__popover {
  position: relative;
  display: inline-flex;
}

.mine-template-two-user__toggle {
  width: 13px;
  height: 8px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__neutral_2);
  font-size: 13px;
  transform: rotate(0deg);
  transition: transform 0.2s;
  cursor: pointer;

  :deep(svg) {
    width: 13px;
    height: 8px;
  }

  &--active {
    transform: rotate(180deg);
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

.mine-template-two-user__sub-info {
  position: relative;
  z-index: 1;
  height: 20px;
  font-size: 16px;
}

.mine-template-two-user__id {
  width: 125px;
  margin: 0;
  justify-content: space-between;
  color: var(--skin__lead);
  font-size: 16px;
  line-height: 20px;
}

.mine-template-two-user__id-label {
  margin-right: 5px;
  color: var(--skin__neutral_1);
}

.mine-template-two-user__id-value {
  flex: 0 0 auto;
  min-width: max-content;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.mine-template-two-user__copy--id {
  margin-left: 5px;
  font-size: 14px;
}

.mine-template-two-user__divider {
  width: 0.5px;
  height: 13px;
  margin: 0 10px;
  flex: none;
  background: var(--skin__lead);
  opacity: 0.1;
}

.mine-template-two-user__currency-sign {
  width: 17px;
  height: 17px;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.mine-template-two-user__currency {
  max-width: 105px;
  height: 20px;
  margin-left: 4px;
}

.currency-info-box,
.currency-info-custom {
  height: 20px;
}

.currency-content-wrap,
.currency-count {
  min-width: 0;
}

.currency-count {
  max-width: 82px;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 16px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;

  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.gaming {
  color: var(--skin__lead);
  font-size: 12px;
  white-space: nowrap;
}

.icon-content {
  height: 20px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  color: var(--skin__primary);
  cursor: pointer;
}

.refresh-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.animate__spin {
  animation: template-two-wallet-spin 0.3s linear infinite;
}

@keyframes template-two-wallet-spin {
  to {
    transform: rotate(360deg);
  }
}

:global([dir="rtl"]) .mine-template-two-user__edit {
  right: auto;
  left: 0;
}

:global([dir="rtl"]) .mine-template-two-user__account-wrap {
  margin-right: 5px;
  margin-left: 0;
}

:global([dir="rtl"]) .mine-template-two-user__copy,
:global([dir="rtl"]) .mine-template-two-user__copy--id,
:global([dir="rtl"]) .mine-template-two-user__currency,
:global([dir="rtl"]) .icon-content {
  margin-right: 5px;
  margin-left: 0;
}

:global([dir="rtl"]) .mine-template-two-user__id-label {
  margin-right: 0;
  margin-left: 5px;
}
</style>
