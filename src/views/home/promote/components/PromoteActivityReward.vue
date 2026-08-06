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
  margin: 0 0.2rem 0.2rem;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgba(0, 0, 0, 0.08);
}

.activity-reward__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 0.4rem);
  margin: 0 0.2rem;
  padding: 0.2rem 0;
  gap: 0.2rem;
  border-bottom: 0.01rem solid var(--skin__border, #e3e3e3);
  color: var(--skin__neutral_2);
  font-size: 0.26rem;

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
    gap: 0.2rem;
  }

  strong {
    color: var(--skin__accent_3);
    font-size: 0.22rem;
    font-weight: 400;
  }

  button {
    width: 1.2rem;
    height: 0.5rem;
    border: 0;
    border-radius: 0.1rem;
    color: #191919;
    font-size: 0.2rem;
    line-height: 0.5rem;
    background: #656565;
  }
}

.activity-reward__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  max-width: calc(100% - 0.4rem);
  margin: 0.2rem 0.2rem 0;
  padding: 0.1rem 0.2rem;
  overflow: hidden;
  border: 0.01rem solid var(--skin__border, #e3e3e3);
  border-radius: 0.9rem;
  color: var(--skin__text_primary, #fff);
  font-size: 0.22rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--skin__primary);

  > span {
    max-width: 5.2rem;
    overflow: hidden;
    color: var(--skin__text_primary, #fff);
    font-size: 0.22rem;
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
  margin-right: 0.08rem;
  color: var(--skin__text_primary, #fff);
  transform: translateY(-0.01rem);
}

.activity-reward__row {
  display: flex;
  align-items: center;
  padding: 0.2rem;

  > span {
    display: flex;
    flex: 1;
    min-width: 0;
    color: var(--skin__neutral_2);
    font-size: 0.22rem;
  }

  label {
    display: -webkit-box;
    max-width: 1.5rem;
    margin-right: 0.05rem;
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
    width: 1rem;
    height: 0.4rem;
    border: 0;
    border-radius: 0.08rem;
    color: #191919;
    font-size: 0.18rem;
    line-height: 0.4rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: #656565;
  }
}

:deep(.activity-reward__arrow) {
  flex: none;
  margin-left: 0.2rem;
  color: var(--skin__neutral_2);
  font-size: 0.18rem;
  transform: rotate(180deg);
}

.activity-reward__amount {
  color: var(--skin__accent_3) !important;
}
</style>
