<script setup lang="ts">
import { computed, ref } from "vue";
import * as _ from "lodash-es";
import CommonCopy from "@/components/Common/Copy.vue";
import MineShowInfo from "@/components/Mine/MineShowInfo.vue";

defineOptions({
  name: "AccountDisplaySelector"
});

const props = withDefaults(defineProps<{
  user?: Partial<Eps.UserInfoEntity>;
  currencyPrefix?: string | number;
}>(), {
  user: () => ({}),
  currencyPrefix: ""
});

const isShowInfo = ref(false);

const displayName = computed(() => {
  if (props.user.showAccount === 2 && props.user.phone) {
    const prefix = props.currencyPrefix ? `+${props.currencyPrefix} ` : "";
    return `${prefix}***${_.join(_.takeRight(props.user.phone, 3), "")}`;
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

function toggleSelector() {
  isShowInfo.value = !isShowInfo.value;
}

function closeSelector() {
  isShowInfo.value = false;
}
</script>

<template>
  <div class="account-display-selector">
    <span class="account-display-selector__popover" @click.stop>
      <button
        type="button"
        class="account-display-selector__toggle"
        :aria-expanded="isShowInfo"
        aria-label="切换账号展示信息"
        @click.stop="toggleSelector"
        @keydown.enter.space.prevent="toggleSelector"
      >
        <svg-icon name="comm_icon_sort" />
      </button>
      <MineShowInfo v-if="isShowInfo" @close="closeSelector" />
    </span>
    <span class="account-display-selector__name" dir="auto">{{ displayName }}</span>
    <CommonCopy
      v-if="copyText"
      :text="copyText"
      class="account-display-selector__copy"
      class-name="account-display-selector__copy-icon"
      @click.stop
    />
  </div>
</template>

<style scoped lang="less">
.account-display-selector {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
}

.account-display-selector__popover {
  position: relative;
  display: inline-flex;
  flex: none;
}

.account-display-selector__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 17px;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.account-display-selector__toggle[aria-expanded="true"] {
  transform: rotate(180deg);
}

.account-display-selector__toggle :deep(svg) {
  width: 13px;
  height: 8px;
}

.account-display-selector__name {
  min-width: 0;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 12px;
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-display-selector__copy {
  width: 17px;
  height: 17px;
  margin-left: 3px;
  flex: none;
}

.account-display-selector__copy :deep(.account-display-selector__copy-icon) {
  color: var(--skin__primary);
  font-size: 14px !important;
}

:global([dir="rtl"]) .account-display-selector__copy {
  margin-right: 3px;
  margin-left: 0;
}
</style>
