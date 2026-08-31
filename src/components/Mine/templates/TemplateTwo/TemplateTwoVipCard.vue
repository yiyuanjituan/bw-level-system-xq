<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { service } from "@/api/service";
import { $t } from "@/locales";
import { formatMoney } from "@/utils/common";
import vipBg from "@/assets/mine/template-two/vip_bg.avif";
import vipColor from "@/assets/mine/template-two/vip_color_1.avif";
import vipStyle from "@/assets/mine/template-two/vip_style_0.avif";

defineOptions({
  name: "TemplateTwoVipCard"
});

const router = useRouter();
const vipInfo = ref<Record<string, any>>({});
const vipLevelList = ref<any[]>([]);

function toFiniteNumber(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

const currentLevel = computed(() => toFiniteNumber(vipInfo.value.level));
const nextLevel = computed(() => toFiniteNumber(vipInfo.value.nextLevel));
const nowFlow = computed(() => toFiniteNumber(vipInfo.value.nowFlow));
const nextLevelFlow = computed(() => toFiniteNumber(vipInfo.value.nextLevelFlow));
const upNeedFlow = computed(() => toFiniteNumber(vipInfo.value.upNeedFlow));
const currentLevelFlow = computed(() => {
  const levelConfig = vipLevelList.value.find(item => toFiniteNumber(item.level) === currentLevel.value);

  return toFiniteNumber(levelConfig?.upFlow);
});

const progressPercent = computed(() => {
  const requiredFlow = Math.max(nextLevelFlow.value - currentLevelFlow.value, 0);
  if (requiredFlow <= 0) return 0;

  const completedFlow = Math.max(nowFlow.value - currentLevelFlow.value, 0);
  return Math.min(Math.max((completedFlow / requiredFlow) * 100, 0), 100);
});

const progressText = computed(() => {
  return `${formatMoney(nowFlow.value)}/${formatMoney(nextLevelFlow.value)}`;
});

const promotionAmount = computed(() => {
  const rewardLevel = nextLevel.value > currentLevel.value ? nextLevel.value : currentLevel.value;
  const levelConfig = vipLevelList.value.find(item => toFiniteNumber(item.level) === rewardLevel);

  return toFiniteNumber(levelConfig?.upAmount ?? vipInfo.value.awaitGetNum);
});
const promotionAmountText = computed(() => formatMoney(promotionAmount.value));
const upNeedFlowText = computed(() => formatMoney(upNeedFlow.value));

async function loadVipInfo() {
  const [vipInfoResult, vipListResult] = await Promise.allSettled([
    service.v1.user.getVipInfo(),
    service.v1.user.vipList()
  ]);

  if (vipInfoResult.status === "fulfilled") {
    vipInfo.value = vipInfoResult.value || {};
  } else {
    console.error("获取个人中心VIP信息失败，失败原因：", vipInfoResult.reason);
  }

  if (vipListResult.status === "fulfilled") {
    const list = vipListResult.value?.list;
    vipLevelList.value = Array.isArray(list) ? list : [];
  } else {
    console.error("获取个人中心VIP配置失败，失败原因：", vipListResult.reason);
  }
}

function handleOpenVip() {
  void router.push("/home/vip");
}

onMounted(() => {
  void loadVipInfo();
});
</script>

<template>
  <div
    class="mine-template-two-vip vip-container mine-1-vip"
    role="button"
    tabindex="0"
    @click="handleOpenVip"
    @keydown.enter.space.prevent="handleOpenVip"
  >
    <img class="mine-template-two-vip__bg" :src="vipBg" alt="" />

    <div class="mine-template-two-vip__left left-wrap">
      <div class="mine-template-two-vip__level vip-level">
        <div class="mine-template-two-vip__level-badge level-image">
          <img :src="vipColor" alt="" />
          <img :src="vipStyle" alt="" />
          <div class="mine-template-two-vip__level-text level-text">
            <span :data-text="currentLevel">{{ currentLevel }}</span>
          </div>
        </div>
        <div class="mine-template-two-vip__current current-vip">V{{ currentLevel }}</div>
      </div>

      <div class="mine-template-two-vip__progress-info process-info">
        <div class="process-info-item">
          <div class="mine-template-two-vip__progress bar">
            <div
              class="mine-template-two-vip__progress-bar bar-item"
              :style="{ width: `${progressPercent}%` }"
            />
            <div class="mine-template-two-vip__progress-text bar-label">{{ progressText }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mine-template-two-vip__divider middle-space" />

    <div class="mine-template-two-vip__right right-wrap">
      <div class="mine-template-two-vip__bonus promotion-wrap">
        <div>
          <span class="promotion-text">{{ $t("晋级奖金") }}</span>
          <span class="promotion-amount">{{ promotionAmountText }}</span>
        </div>
      </div>
      <div class="mine-template-two-vip__upgrade vip-process-text">
        <div class="vip-process-text-wrap">
          <div class="process">
            <span class="process-type-label">
              <span class="action-text">{{ $t("晋级VIP需再") }}</span>
              <span class="action-btn">{{ $t("投注") }}</span>
            </span>
            <span class="action-amount">{{ upNeedFlowText }}</span>
          </div>
        </div>
      </div>
    </div>

    <i class="mine-template-two-vip__arrow right-icon">
      <svg-icon name="mine-template-two-comm_icon_fh" />
    </i>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-vip {
  width: calc(100% - 24px);
  max-width: 351px;
  height: 97px;
  min-height: 97px;
  margin: 5px auto 0;
  padding: 5px 10px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mine-template-two-vip__bg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  object-fit: fill;
  pointer-events: none;
}

.mine-template-two-vip__left,
.mine-template-two-vip__right,
.mine-template-two-vip__divider,
.mine-template-two-vip__arrow {
  position: relative;
  z-index: 1;
}

.mine-template-two-vip__left {
  width: 132px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.mine-template-two-vip__level {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mine-template-two-vip__level-badge {
  width: 38px;
  height: 38px;
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    object-fit: contain;
  }

  .mine-template-two-vip__level-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      width: 1ch;
      color: transparent;
      background-image: linear-gradient(to bottom, #f7ea94, #e5b952 51%, #ce9510);
      background-clip: text;
      -webkit-background-clip: text;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      text-shadow: none;
    }
  }
}

.mine-template-two-vip__current {
  color: var(--skin__text_primary);
  font-size: 18px;
  font-style: italic;
  font-weight: 600;
  line-height: 21px;
}

.mine-template-two-vip__progress {
  width: 132px;
  height: 10px;
  position: relative;
  overflow: hidden;
  border: 0.5px solid rgba(255, 255, 255, .3);
  border-radius: 7.5px;
  background: rgba(0, 0, 0, .1);
}

.mine-template-two-vip__progress-bar {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: inherit;
  background: var(--skin__accent_1);
}

.mine-template-two-vip__progress-text {
  position: absolute;
  inset: 0;
  color: var(--skin__text_primary);
  font-size: 10px;
  line-height: 10px;
  text-align: center;
}

.mine-template-two-vip__divider {
  width: 15px;
  max-width: 15px;
  height: 0;
  margin: 0;
  flex: none;
  background: transparent;
}

.mine-template-two-vip__right {
  min-width: 0;
  flex: 1;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
}

.mine-template-two-vip__bonus,
.mine-template-two-vip__upgrade {
  min-width: 0;
  display: flex;
  align-items: center;
}

.mine-template-two-vip__bonus {
  height: 38px;
  color: var(--skin__text_primary);
  font-size: 12px;
  line-height: 16px;

  > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .promotion-amount {
    min-width: 0;
    max-width: 65px;
    margin-top: 2px;
    overflow: hidden;
    color: var(--skin__text_primary);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.mine-template-two-vip__upgrade {
  margin-top: 7px;
  color: var(--skin__text_primary);
  font-size: 10px;
  line-height: 13.5px;

  .process {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .process-type-label {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .action-text {
    max-width: 60.5px;
    display: -webkit-box;
    overflow: hidden;
    opacity: .6;
    text-overflow: ellipsis;
    unicode-bidi: plaintext;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .action-btn {
    padding: 0;
    text-decoration: underline;
    color: var(--skin__text_primary);
    background: transparent;
    font-size: 10px;
    white-space: nowrap;
  }

  .action-amount {
    min-width: 0;
    max-width: 65px;
    overflow: hidden;
    color: var(--skin__text_primary);
    font-size: 10px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.mine-template-two-vip__arrow {
  position: absolute;
  right: 8px;
  z-index: 1;
  color: var(--skin__text_primary);
  font-size: 11px;
  opacity: .6;
  transform: rotate(180deg);

  :deep(svg) {
    display: block;
  }
}

:global([dir="rtl"]) .mine-template-two-vip {
  text-align: right;
}

:global([dir="rtl"]) .mine-template-two-vip__right {
  padding-right: 0;
  padding-left: 20px;
}

:global([dir="rtl"]) .mine-template-two-vip__progress-bar {
  right: 0;
  left: auto;
}

:global([dir="rtl"]) .mine-template-two-vip__arrow {
  right: auto;
  left: 8px;
  transform: rotate(0deg);
}
</style>
