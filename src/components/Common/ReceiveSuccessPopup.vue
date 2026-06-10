<template>
  <div v-if="isRendered" class="fixed top-[120px] left-0 right-0 flex justify-center z-50" style="pointer-events: none;">
    <div
      :key="contentKey"
      class="receive-success-popup-wrap"
      :class="{ 'receive-success-popup-wrap--active': isActive }"
    >
      <div class="receive-success-popup" :data-skin-bg="skinBg">
        <img class="receive-success-popup__icon-img" src="@/assets/web/animated/img_emoji_tada.png" alt="领取成功" />

        <div class="receive-success-popup__text" v-html="messageText" />

        <img class="receive-success-popup__anime" src="@/assets/web/animated/apng_lingqu_5_alpha.png" alt="" />

        <div class="receive-success-popup__reward">
          <img :src="rewardIconSrc" alt="" class="receive-success-popup__reward-icon" />
          <span class="receive-success-popup__award">{{ award }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import receiveAudioSrc from '@/assets/theme-0/receive.mp3';

type IconType = 'coin';

interface OpenParams {
  messageText: string;
  skinBg?: 0 | 1;
  iconType: IconType;
  award: string | number;
}

const rewardIconMap: Record<IconType, string> = {
  coin: '/siteadmin/active/rmb.svg'
};

const SCALE_DURATION_MS = 170;
const AUTO_CLOSE_MS = 2400;

const isRendered = ref(false);
const isActive = ref(false);
const contentKey = ref(0);
const messageText = ref('');
const skinBg = ref<0 | 1>(1);
const iconType = ref<IconType>('coin');
const award = ref<string | number>('');

let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const receiveAudio = new Audio(receiveAudioSrc);

const rewardIconSrc = computed(() => rewardIconMap[iconType.value]);

async function open(params: OpenParams) {
  clearTimers();
  messageText.value = params.messageText;
  skinBg.value = params.skinBg ?? 1;
  iconType.value = params.iconType;
  award.value = params.award;
  contentKey.value += 1;
  isRendered.value = true;
  isActive.value = false;

  await nextTick();

  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isActive.value = true;
      });
    });
  } else {
    isActive.value = true;
  }

  receiveAudio.currentTime = 0;
  void receiveAudio.play();

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
  receiveAudio.pause();
  receiveAudio.currentTime = 0;
});
</script>

<style lang="less" scoped>
.receive-success-popup-wrap {
  display: inline-block;
  padding-top: 55px;
  transform: scale(0.1);
  transform-origin: top center;
  will-change: transform;
  transition: transform 0.5s ease;
  pointer-events: none;

  &--active {
    transform: scale(1);
  }
}

.receive-success-popup {
  position: relative;
  padding: 10px;
  border-radius: 7px;
  width: 345px;
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  pointer-events: auto;
  line-height: 1;

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
    align-items: center;
  }

  &__reward {
    max-width: 140px;
    display: inline-flex;
    align-items: center;
    gap: 2.5px;
    color: #ffaa09;
    font-weight: 700;
    text-align: left;
  }

  &__reward-icon {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    animation: receive-reward-icon-spin 2s linear 1;
    transform-origin: center;
  }

  &__award {
    max-width: 122px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
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
    transform: rotateY(0deg);
  }

  25% {
    transform: rotateY(180deg);
  }

  50% {
    transform: rotateY(360deg);
  }

  100% {
    transform: rotateY(540deg);
  }
}

</style>
