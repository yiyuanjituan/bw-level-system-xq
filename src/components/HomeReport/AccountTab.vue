<script setup lang="ts">
import { computed, ref } from "vue";
import UiRadiusSelect from "@/components/UI/radius-select.vue";
import HomeReportSummaryBar from "@/components/HomeReport/SummaryBar.vue";
import type { ReportCurrent, SelectOption, SummaryItem } from "@/components/HomeReport/types";
import useAuthStore from "@/store/modules/user";

const auth = useAuthStore()
const isWalletLoading = ref(false)

const emit = defineEmits<{
  (event: "refresh-balance"): void;
  (event: "switch-report", value: ReportCurrent): void;
}>();

const dayOptions: SelectOption[] = [
  { label: "今日" },
  { label: "昨日" },
  { label: "本周" },
  { label: "本月" }
];

const categoryOptions: SelectOption[] = [
  { label: "账变大类" },
  { label: "充值大类" },
  { label: "提现大类" },
  { label: "活动大类" }
];

const detailOptions: SelectOption[] = [
  { label: "小类明细" },
  { label: "人工加款" },
  { label: "活动派发" },
  { label: "提现退回" }
];

const summaryItems: SummaryItem[] = [
  { label: "累计充值", value: 0, color: "success" },
  { label: "累计提现", value: 0, color: "danger" },
  { label: "累计领取", value: 0, color: "warn" }
];

const dayFilterIndex = ref(0);
const categoryFilterIndex = ref(0);
const detailFilterIndex = ref(0);
const emptyStateText = computed(() => `${dayOptions[dayFilterIndex.value]?.label ?? "今日"}暂无记录`);

function formatMoney(value: number) {
  return Number(value).toFixed(2);
}

function handleAction() {
  emit("switch-report", "4");
}
</script>

<template>
  <div class="account-tab">
    <section class="balance-card">
      <div class="balance-card__top">
        <div class="balance-card__info">
          <span class="balance-card__label">当前余额</span>
          <span class="balance-card__amount">{{ formatMoney(auth.user?.money) }}</span>
          <svg-icon
            name="comm_icon_sx"
            class-name="balance-card__refresh"
            :class="{ animate__spin: isWalletLoading }"
            @click="emit('refresh-balance')"
          />
        </div>
        <button
          class="balance-card__action"
          type="button"
          @click="handleAction"
        >
          <span>找回余额</span>
          <svg-icon name="arrow-back" class-name="balance-card__action-arrow" />
        </button>
      </div>
      <div class="balance-card__tip">
        若进出游戏时余额丢失，可通过找回余额自助恢复。
      </div>
    </section>

    <section class="filter-row">
      <ui-radius-select :options="dayOptions" v-model="dayFilterIndex">
        <template #default="{ isShow, options, value }">
          <div class="pill-select" :class="{ 'pill-select--active': isShow }">
            <span class="pill-select__text">{{ options[value]?.label }}</span>
            <svg-icon
              name="arrow-back"
              :class-name="isShow ? 'rotate-[90deg]' : 'rotate-[-90deg]'"
              class="pill-select__arrow"
            />
          </div>
        </template>
      </ui-radius-select>

      <ui-radius-select
        :options="categoryOptions"
        v-model="categoryFilterIndex"
      >
        <template #default="{ isShow, options, value }">
          <div
            class="pill-select pill-select--wide"
            :class="{ 'pill-select--active': isShow }"
          >
            <span class="pill-select__text">{{ options[value]?.label }}</span>
            <svg-icon
              name="arrow-back"
              :class-name="isShow ? 'rotate-[90deg]' : 'rotate-[-90deg]'"
              class="pill-select__arrow"
            />
          </div>
        </template>
      </ui-radius-select>

      <ui-radius-select :options="detailOptions" v-model="detailFilterIndex">
        <template #default="{ isShow, options, value }">
          <div
            class="pill-select pill-select--wide"
            :class="{ 'pill-select--active': isShow }"
          >
            <span class="pill-select__text">{{ options[value]?.label }}</span>
            <svg-icon
              name="arrow-back"
              :class-name="isShow ? 'rotate-[90deg]' : 'rotate-[-90deg]'"
              class="pill-select__arrow"
            />
          </div>
        </template>
      </ui-radius-select>
    </section>

    <section class="content-area">
      <div class="empty-state">
        <div class="empty-state__graphic">
          <span class="empty-state__disc"></span>
          <span class="empty-state__box empty-state__box--top"></span>
          <span class="empty-state__box empty-state__box--left"></span>
          <span class="empty-state__box empty-state__box--right"></span>
        </div>
        <div class="empty-state__text">
          <span>{{ emptyStateText }}</span>
          <span>，可</span>
          <span class="empty-state__link">查看更多</span>
        </div>
      </div>
    </section>

    <HomeReportSummaryBar :items="summaryItems" />
  </div>
</template>

<style scoped lang="less">
.account-tab {
  height: 100%;
  display: flex;
  flex-direction: column;

  .balance-card {
    background: var(--skin__bg_2);
    border-radius: 5px;
    box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.06);
    padding: 10px;
    margin: 10px 10px 0;
  }

  .balance-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .balance-card__info {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .balance-card__label {
    color: var(--skin__neutral_2);
    font-size: 12px;
    white-space: nowrap;
  }

  .balance-card__amount {
    color: var(--skin__accent_3);
    line-height: 1;
    margin: 0 5px;
    font-size: 12px;
  }

  .balance-card__refresh {
    color: var(--skin__primary);
    font-size: 13px;
  }

  .balance-card__action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--skin__primary);
    background: transparent;
    border: 0;
    padding: 0;
    font-size: 12px;
    white-space: nowrap;
  }

  .balance-card__action-arrow {
    font-size: 10px;
    transform: rotate(180deg);
    color: var(--skin__neutral_2);
  }

  .balance-card__tip {
    margin-top: 5px;
    color: var(--skin__neutral_2);
    font-size: 11px;
    line-height: 1;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0 10px;
  }

  .pill-select {
    min-width: 66px;
    height: 28px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #e4e6ee;
    border-radius: 14px;
    color: #70778a;
    box-sizing: border-box;
  }

  .pill-select--wide {
    min-width: 88px;
  }

  .pill-select--active {
    border-color: #6a6dff;
  }

  .pill-select__text {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .pill-select__arrow {
    font-size: 10px;
    color: #9aa0b2;
  }

  .content-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 72px;
    color: #9aa0ad;
  }

  .empty-state__graphic {
    position: relative;
    width: 110px;
    height: 110px;
    margin-bottom: 16px;
  }

  .empty-state__disc {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.95),
      rgba(238, 240, 245, 0.82) 58%,
      rgba(226, 229, 236, 0.95)
    );
    box-shadow: inset 0 10px 24px rgba(255, 255, 255, 0.6);
  }

  .empty-state__box {
    position: absolute;
    width: 36px;
    height: 24px;
    background: linear-gradient(180deg, #fefefe 0%, #dde2eb 100%);
    border-radius: 4px;
    box-shadow: 0 8px 14px rgba(136, 145, 165, 0.16);
  }

  .empty-state__box::before {
    content: "";
    position: absolute;
    left: 4px;
    right: 4px;
    top: -7px;
    height: 10px;
    background: linear-gradient(180deg, #eef2f8 0%, #d6dce7 100%);
    clip-path: polygon(0 100%, 50% 0, 100% 100%);
  }

  .empty-state__box--top {
    left: 37px;
    top: 29px;
    transform: rotate(8deg);
  }

  .empty-state__box--left {
    left: 20px;
    top: 44px;
    transform: rotate(-20deg);
  }

  .empty-state__box--right {
    right: 18px;
    top: 45px;
    transform: rotate(22deg);
  }

  .empty-state__text {
    font-size: 13px;
    line-height: 1.5;
  }

  .empty-state__link {
    color: #6165ff;
  }
}
</style>
