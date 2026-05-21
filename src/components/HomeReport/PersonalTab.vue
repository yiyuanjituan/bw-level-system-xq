<script setup lang="ts">
import { computed, ref } from "vue";
import UiRadiusSelect from "@/components/UI/radius-select.vue";
import type { SelectOption } from "@/components/HomeReport/types";

const dayOptions: SelectOption[] = [
  { label: "今日" },
  { label: "昨日" },
  { label: "本周" },
  { label: "本月" }
];

const typeOptions: SelectOption[] = [
  { label: "全部类型" },
  { label: "充值报表" },
  { label: "提现报表" },
  { label: "优惠报表" }
];

const platformOptions: SelectOption[] = [
  { label: "全部平台" },
  { label: "体育" },
  { label: "真人" },
  { label: "电子" }
];

const dayFilterIndex = ref(0);
const typeFilterIndex = ref(0);
const platformFilterIndex = ref(0);

const emptyStateText = computed(() => `${dayOptions[dayFilterIndex.value]?.label ?? "今日"}暂无记录`);
</script>

<template>
  <div class="personal-tab">
    <section class="filter-row">
      <div class="filter-row__left">
        <ui-radius-select :options="dayOptions" v-model="dayFilterIndex">
          <template #default="{ isShow, options, value }">
            <div class="pill-select pill-select--compact" :class="{ 'pill-select--active': isShow }">
              <span class="pill-select__text">{{ options[value]?.label }}</span>
              <svg-icon
                name="arrow-back"
                :class-name="isShow ? 'rotate-[90deg]' : 'rotate-[-90deg]'"
                class="pill-select__arrow"
              />
            </div>
          </template>
        </ui-radius-select>

        <ui-radius-select :options="typeOptions" v-model="typeFilterIndex">
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

        <ui-radius-select :options="platformOptions" v-model="platformFilterIndex">
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
      </div>
      <div class="sort-entry">
        <span>排序</span>
        <svg-icon name="arrow-back" class-name="sort-entry__icon rotate-[90deg]" />
      </div>
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

    <footer class="summary-grid">
      <div class="summary-grid__item">
        <span class="summary-grid__label">累计注单数</span>
        <span class="summary-grid__value">0</span>
      </div>
      <div class="summary-grid__item">
        <span class="summary-grid__label">累计有效投注</span>
        <span class="summary-grid__value">0.00USDT</span>
      </div>
      <div class="summary-grid__item">
        <span class="summary-grid__label">累计预扣税</span>
        <span class="summary-grid__value">0.00USDT</span>
      </div>
      <div class="summary-grid__item">
        <span class="summary-grid__label">累计输赢</span>
        <span class="summary-grid__value summary-grid__value--danger">0.00USDT</span>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="less">
.personal-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.filter-row__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pill-select {
  min-width: 84px;
  height: 30px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e4e6ee;
  border-radius: 15px;
  color: #8a90a0;
  box-sizing: border-box;
}

.pill-select--compact {
  min-width: 66px;
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

.sort-entry {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #8d93a3;
  font-size: 12px;
  white-space: nowrap;
  padding-right: 2px;
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
  padding-bottom: 64px;
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
  font-size: 13px;
}

.empty-state__link {
  color: #6165ff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 10px;
  column-gap: 18px;
  padding: 12px 10px 14px;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid #ececf1;
}

.summary-grid__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.summary-grid__label {
  color: #8d93a3;
  font-size: 12px;
}

.summary-grid__value {
  color: #252b36;
  font-size: 13px;
}

.summary-grid__value--danger {
  color: #ff4d6d;
}
</style>
