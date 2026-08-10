<script setup lang="ts">
withDefaults(
  defineProps<{
    totalReward?: string;
    validInvites?: string;
    unclaimedReward?: string;
  }>(),
  {
    totalReward: "0.00",
    validInvites: "0",
    unclaimedReward: "0.00"
  }
);
</script>

<template>
  <section class="activity-reward">
    <header class="activity-reward__header">
      <span>活动累计奖励</span>
      <div><strong>{{ totalReward }}</strong><button type="button" disabled>一键领取</button></div>
    </header>

    <div class="activity-reward__tab">
      <svg-icon name="promote-gift" class-name="activity-reward__gift" aria-hidden="true" />
      <span>推广盛宴 下级存款立享888元</span>
    </div>

    <div class="activity-reward__row">
      <span><label>邀请有效人数</label><strong>{{ validInvites }}</strong></span>
      <span><label>待领取</label><strong class="activity-reward__amount">{{ unclaimedReward }}</strong></span>
      <button type="button" disabled>领 取</button>
      <svg-icon name="arrow-back" class-name="activity-reward__arrow" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped lang="less">
.activity-reward {
  margin: 0 10px 10px;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.08);
}

.activity-reward__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px);
  margin: 0 10px;
  padding: 10px 0;
  gap: 10px;
  border-bottom: 0.5px solid var(--skin__border, #e3e3e3);
  color: var(--skin__neutral_2);
  font-size: 13px;

  > span {
    display: -webkit-box;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  strong {
    color: var(--skin__accent_3);
    font-size: 11px;
    font-weight: 400;
  }

  button {
    width: 60px;
    height: 25px;
    border: 0;
    border-radius: 5px;
    color: #191919;
    font-size: 10px;
    line-height: 25px;
    background: #656565;
  }
}

.activity-reward__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  max-width: calc(100% - 20px);
  margin: 10px 10px 0;
  padding: 5px 10px;
  overflow: hidden;
  border: 0.5px solid var(--skin__border, #e3e3e3);
  border-radius: 45px;
  color: var(--skin__text_primary, #fff);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--skin__primary);

  > span {
    max-width: 260px;
    overflow: hidden;
    color: var(--skin__text_primary, #fff);
    font-size: 11px;
    font-weight: 400;
    line-height: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.activity-reward__gift {
  flex: none;
  width: 1em;
  height: 1em;
  margin-right: 4px;
  color: var(--skin__text_primary, #fff);
  transform: translateY(-0.5px);
}

.activity-reward__row {
  display: flex;
  align-items: center;
  padding: 10px;

  > span {
    display: flex;
    flex: 1;
    min-width: 0;
    color: var(--skin__neutral_2);
    font-size: 11px;
  }

  label {
    display: -webkit-box;
    max-width: 75px;
    margin-right: 2.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }

  button {
    width: 50px;
    height: 20px;
    border: 0;
    border-radius: 4px;
    color: #191919;
    font-size: 9px;
    line-height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: #656565;
  }
}

:deep(.activity-reward__arrow) {
  flex: none;
  margin-left: 10px;
  color: var(--skin__neutral_2);
  font-size: 9px;
  transform: rotate(180deg);
}

.activity-reward__amount {
  color: var(--skin__accent_3) !important;
}
</style>
