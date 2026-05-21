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

const statusOptions: SelectOption[] = [
  { label: "全部状态" },
  { label: "已结算" },
  { label: "未结算" },
  { label: "已撤单" }
];

const typeOptions: SelectOption[] = [
  { label: "全部类型" },
  { label: "单注" },
  { label: "串关" },
  { label: "追号" }
];

const platformOptions: SelectOption[] = [
  { label: "全部平台" },
  { label: "体育" },
  { label: "真人" },
  { label: "电子" }
];

const resultOptions: SelectOption[] = [
  { label: "全部结果" },
  { label: "赢" },
  { label: "输" },
  { label: "和" }
];

const dayFilterIndex = ref(0);
const statusFilterIndex = ref(0);
const typeFilterIndex = ref(0);
const platformFilterIndex = ref(0);
const resultFilterIndex = ref(0);

const emptyStateText = computed(() => `${dayOptions[dayFilterIndex.value]?.label ?? "今日"}暂无记录`);
</script>

<template>
  <div class="bet-tab">
    <section class="filter-scroll">
      <div class="filter-scroll__inner">
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

        <ui-radius-select :options="statusOptions" v-model="statusFilterIndex">
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

        <ui-radius-select :options="resultOptions" v-model="resultFilterIndex">
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
  </div>
</template>

<style scoped lang="less">
.bet-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
  margin: 0 -10px;
}

.filter-scroll__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  min-width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
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
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
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
</style>
