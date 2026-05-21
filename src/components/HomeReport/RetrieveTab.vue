<script setup lang="ts">
import { showCustomToast } from "@/hooks/useCommon";

const props = defineProps<{
  currentBalance: number;
  walletIsLoading: boolean;
}>();

const emit = defineEmits<{
  (event: "refresh-balance"): void;
}>();

function formatMoney(value: number) {
  return value.toFixed(2);
}

function handleAction() {
  showCustomToast({ type: "success", message: "一键找回功能待接入" });
}
</script>

<template>
  <div class="retrieve-tab">
    <section class="balance-card">
      <div class="balance-card__top">
        <div class="balance-card__info">
          <span class="balance-card__label">当前余额</span>
          <span class="balance-card__amount">{{ formatMoney(props.currentBalance) }}</span>
          <svg-icon
            name="comm_icon_retry"
            class-name="balance-card__refresh"
            :class="{ 'animate__spin': props.walletIsLoading }"
            @click="emit('refresh-balance')"
          />
        </div>
        <button class="recover-button" type="button" @click="handleAction">一键找回</button>
      </div>
      <div class="balance-card__tip">
        <span>只能找回余额的整数值(即不含小数点)，若仍无法自助找回，请</span>
        <span class="balance-card__link">联系客服</span>
      </div>
    </section>

    <section class="toolbar">
      <button class="toolbar__all" type="button">
        <span class="toolbar__icon">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span>全部</span>
      </button>

      <label class="toolbar__search">
        <input type="text" placeholder="平台搜索" />
        <svg-icon name="comm_icon_search" class-name="toolbar__search-icon" />
      </label>
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
          <span>暂无内容</span>
          <svg-icon name="comm_icon_retry" class-name="empty-state__refresh" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.retrieve-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.balance-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 9px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  padding: 10px 12px;
}

.balance-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.balance-card__info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.balance-card__label {
  color: #666d7c;
  font-size: 13px;
}

.balance-card__amount {
  color: #f5a143;
  font-size: 17px;
  font-weight: 700;
}

.balance-card__refresh {
  color: #6165ff;
  font-size: 13px;
}

.recover-button {
  min-width: 88px;
  height: 30px;
  padding: 0 16px;
  border: 0;
  border-radius: 16px;
  color: #fff;
  font-size: 13px;
  background: linear-gradient(135deg, #8c7cff 0%, #5764ff 100%);
  box-shadow: 0 8px 16px rgba(97, 101, 255, 0.24);
}

.balance-card__tip {
  margin-top: 8px;
  color: #8f95a3;
  font-size: 12px;
  line-height: 1.5;
}

.balance-card__link {
  color: #6165ff;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
}

.toolbar__all {
  height: 34px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 7px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(135deg, #8d79ff 0%, #5764ff 100%);
  box-shadow: 0 8px 18px rgba(97, 101, 255, 0.26);
}

.toolbar__icon {
  width: 12px;
  height: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.toolbar__icon span {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 2px;
}

.toolbar__search {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d7daea;
  border-radius: 18px;
}

.toolbar__search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #4f5668;
  font-size: 12px;
  outline: none;
}

.toolbar__search input::placeholder {
  color: #b0b5c4;
}

.toolbar__search-icon {
  color: #6165ff;
  font-size: 14px;
}

.content-area {
  flex: 1;
  display: flex;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 42px;
  color: #9aa0ad;
}

.empty-state__graphic {
  position: relative;
  width: 116px;
  height: 116px;
  margin-bottom: 18px;
}

.empty-state__disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(238, 240, 245, 0.82) 58%, rgba(226, 229, 236, 0.95));
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
  left: 40px;
  top: 30px;
  transform: rotate(8deg);
}

.empty-state__box--left {
  left: 22px;
  top: 46px;
  transform: rotate(-20deg);
}

.empty-state__box--right {
  right: 20px;
  top: 46px;
  transform: rotate(22deg);
}

.empty-state__text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #9aa0ad;
  font-size: 13px;
}

.empty-state__refresh {
  color: #6165ff;
  font-size: 13px;
}
</style>
