<template>
  <div v-if="isRendered" class="fixed top-0 left-0 right-0 flex justify-center items-center z-50">
    <div
      :key="contentKey"
      class="receive-success-popup"
      :class="{ 'receive-success-popup--active': isActive }"
      :data-skin-bg="skinBg"
    >
      <img class="receive-success-popup__icon-img" src="@/assets/web/animated/img_emoji_tada.png" alt="领取成功" />

      <div class="receive-success-popup__text" v-html="messageText" />

      <img class="receive-success-popup__anime" src="@/assets/web/animated/apng_lingqu_5_alpha.png" alt="" />

      <div class="receive-success-popup__reward">
        <img :src="rewardIconSrc" alt="" class="receive-success-popup__reward-icon" />
        <span class="receive-success-popup__award">{{ award }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';

type IconType = 'coin';

interface Props {
  messageText: string;
  skinBg?: 0 | 1;
  iconType: IconType;
  award: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  skinBg: 1
});

const rewardIconMap: Record<IconType, string> = {
  coin: '/siteadmin/active/rmb.svg'
};

const SCALE_DURATION_MS = 300;
const AUTO_CLOSE_MS = 300000;

const isRendered = ref(false);
const isActive = ref(false);
const contentKey = ref(0);

let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const rewardIconSrc = computed(() => rewardIconMap[props.iconType]);

async function open() {
  clearTimers();
  contentKey.value += 1;
  isRendered.value = true;
  isActive.value = false;

  await nextTick();

  requestAnimationFrame(() => {
    isActive.value = true;
  });

  autoCloseTimer = setTimeout(() => {
    close();
  }, AUTO_CLOSE_MS);
}

function close() {
  clearTimers();
  isActive.value = false;

  hideTimer = setTimeout(() => {
    isRendered.value = false;
  }, SCALE_DURATION_MS);
}

function clearTimers() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = undefined;
  }

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }
}

defineExpose({
  open,
  close
});

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style lang="less" scoped>
.receive-success-popup {
  position: relative;
  padding: 10px;
  border-radius: 7px;
  width: 345px;
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  transform: scale(0);
  opacity: 0;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;

  &--active {
    transform: scale(1);
    opacity: 1;
  }

  &[data-skin-bg='1'] {
    background: #fff;

    .receive-success-popup__text {
      color: #333;
    }
  }

  &[data-skin-bg='0'] {
    background: rgba(0, 0, 0, 0.8);

    .receive-success-popup__text {
      color: #fff;
    }
  }

  &__icon-img,
  &__text,
  &__reward {
    position: relative;
    z-index: 1;
  }

  &__icon-img {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }

  &__text {
    display: flex;
    flex: 1;
    min-height: 32.5px;
    line-height: 16px;
    text-align: left;
  }

  &__reward {
    max-width: 140px;
    display: inline-flex;
    align-items: center;
    gap: 2.5px;
    color: #ffaa09;
    font-weight: 700;
    line-height: 1.67;
    text-align: left;
  }

  &__reward-icon {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    animation: receive-reward-icon-spin 0.9s linear 1;
    transform-origin: center;
  }

  &__award {
    max-width: 122px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__anime {
    position: absolute;
    z-index: 0;
    width: 400px;
    height: 100px;
    top: calc(50% - 50px);
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }
}

@keyframes receive-reward-icon-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

</style>
