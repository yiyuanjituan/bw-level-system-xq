<script setup lang="ts">
defineOptions({
  name: "HomeBackTop"
});

withDefaults(
  defineProps<{
    target?: string;
    isPut?: boolean;
  }>(),
  {
    target: "#scroll-box",
    isPut: false
  }
);
</script>

<template>
  <van-back-top
    :target="target"
    class="home-back-top"
    :class="{ 'home-back-top--put': isPut }"
    :aria-label="$t('返回顶部')"
  >
    <span class="home-back-top__icon-wrap">
      <svg-icon name="comm_icon_top" class-name="home-back-top__icon" />
    </span>
    <span class="home-back-top__title">{{ $t("返回顶部") }}</span>
  </van-back-top>
</template>

<style scoped lang="less">
.home-back-top {
  --van-back-top-right: 3.5px;
  --van-back-top-bottom: 77px;
  width: 54px;
  height: 58px;
  padding: 5px 4px 6px;
  border: var(--lobby__px) solid var(--skin__alt_border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--skin__lead);
  background: var(--skin__bg_2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transition: transform 0.1s linear, opacity 0.1s linear;

  &--put {
    transform: translateX(70px);
  }

  &:active {
    opacity: 0.86;
  }
}

:global([dir="rtl"]) .home-back-top {
  --van-back-top-right: auto;
  left: 3.5px;

  &--put {
    transform: translateX(-70px);
  }
}

.home-back-top__icon-wrap {
  width: 23px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: currentColor;
}

:deep(.home-back-top__icon) {
  width: 23px;
  height: 28px;
  display: block;
}

.home-back-top__title {
  margin-top: 3px;
  color: currentColor;
  font-size: 9px;
  line-height: 1;
  white-space: nowrap;
  transform: scale(0.98);
  transform-origin: center;
}
</style>
