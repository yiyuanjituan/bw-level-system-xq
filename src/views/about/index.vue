<script setup lang="ts" name="About">
import UiEmpty from "@/components/UI/empty.vue";
import { handleBack } from "@/utils/common";
</script>

<template>
  <div class="_base-layout_6p5kt_91 about-page" data-route-view="2">
    <header class="about-page__header">
      <header class="lobby-base-header lobby-base-header__has-logo-false">
        <div class="lobby-base-header__section lobby-base-header__section--left">
          <div class="lobby-base-header__back" @click="handleBack">
            <i class="ui-arrow ui-arrow--left" aria-label="返回">
              <svg width="1em" height="1em" fill="currentColor">
                <use xlink:href="#ui-arrow-418a3a"></use>
              </svg>
            </i>
          </div>
        </div>
        <div class="lobby-base-header__section lobby-base-header__section--center">
          <div dir="ltr" class="about-page__title">关于我们</div>
        </div>
        <div class="lobby-base-header__section lobby-base-header__section--right"></div>
      </header>
    </header>

    <section
      data-route-for-scroll="about-us-detail"
      class="_main_zzwue_102 lobby-scroll lobby-scroll--y lobby-scroll--system-scrollbar about-page__scroll"
    >
      <ui-empty text="暂无记录" />
    </section>
  </div>
</template>

<style scoped lang="less">
.about-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--skin__lead);
  background: var(--skin__bg_1);

  &__header {
    flex-shrink: 0;
    padding-top: var(--status-bar-height);
    height: calc(var(--status-bar-height) + 45px);
    box-sizing: border-box;
    background: var(--skin__bg_2);
    border-bottom: 1px solid var(--skin__border);
  }

  .lobby-base-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
  }

  .lobby-base-header__section {
    display: flex;
    align-items: center;
    height: 100%;

    &--left,
    &--right {
      width: 40px;
      flex-shrink: 0;
    }

    &--center {
      flex: 1;
      justify-content: center;
      min-width: 0;
    }
  }

  .lobby-base-header__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 100%;
    color: var(--skin__neutral_1, #bcbcbc);
    font-size: 12px;
    cursor: pointer;
  }

  &__title {
    max-width: 215px;
    overflow: hidden;
    color: var(--skin__lead);
    font-size: 15px;
    line-height: 1.4;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
