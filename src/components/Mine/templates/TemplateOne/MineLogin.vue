<script setup lang="ts">
import router from '@/router';
import guestRewardImage from '@/assets/mine/template-one/guest-reward.avif';

defineOptions({ name: 'MineLogin' });

function jumpTo(path: string) {
  void router.push(path);
}
</script>

<template>
  <div class="mine-guest-card">
    <div class="mine-guest-card__content">
      <p class="mine-guest-card__title">{{ $t('登录后可领取收益') }}</p>
      <div class="mine-guest-card__actions">
        <button type="button" class="mine-guest-card__button" @click="jumpTo('/home/login')">
          <span>{{ $t('登 录') }}</span>
        </button>
        <button type="button" class="mine-guest-card__button mine-guest-card__button--plain" @click="jumpTo('/home/register')">
          <span>{{ $t('注 册') }}</span>
        </button>
      </div>
    </div>
    <img class="mine-guest-card__reward" :src="guestRewardImage" alt="" />
  </div>
</template>

<style scoped lang="less">
.mine-guest-card {
  min-height: 103.5px;
  padding: 16px 12.5px 0;
  position: relative;
  box-sizing: border-box;
}

.mine-guest-card__content {
  position: relative;
  z-index: 1;
}

.mine-guest-card__title {
  max-width: 250px;
  max-height: 39px;
  margin: 33px 0 0;
  display: -webkit-box;
  overflow: hidden;
  color: var(--skin__lead);
  font-size: 15px;
  line-height: 19.5px;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.mine-guest-card__actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.mine-guest-card__button {
  width: 60px;
  height: 25px;
  padding: 6px 2.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 0.5px solid var(--skin__primary);
  border-radius: 5px;
  color: var(--skin__text_primary);
  background: var(--skin__primary);
  font-size: 11px;
  line-height: 1.3;
  text-align: center;
  word-wrap: break-word;
  cursor: pointer;
}

.mine-guest-card__button > span {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.mine-guest-card__button--plain {
  margin-left: 10px;
  color: var(--skin__primary);
  background: transparent;
}

.mine-guest-card__reward {
  width: 99px;
  height: 100px;
  position: absolute;
  right: 12.5px;
  bottom: -20px;
  z-index: 0;
  display: block;
  object-fit: contain;
  pointer-events: none;
}

:global([dir='rtl']) .mine-guest-card__button--plain {
  margin-right: 10px;
  margin-left: 0;
}

:global([dir='rtl']) .mine-guest-card__reward {
  right: auto;
  left: 12.5px;
}
</style>
