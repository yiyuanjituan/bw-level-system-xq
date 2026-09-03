<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    activityTitle?: string;
    totalReward?: string;
    validInvites?: string;
    unclaimedReward?: string;
    claiming?: boolean;
  }>(),
  {
    activityTitle: "邀请红包活动",
    totalReward: "0.00",
    validInvites: "0",
    unclaimedReward: "0.00",
    claiming: false
  }
);

const emit = defineEmits<{
  openActivity: [];
  claim: [];
}>();

const canClaim = computed(() => Number(props.unclaimedReward) > 0);
</script>

<template>
  <section class="activity-reward">
    <header class="activity-reward__header">
      <span>活动累计奖励</span>
      <div>
        <strong>{{ totalReward }}</strong>
        <x-button
          class="activity-reward__claim-all"
          type="primary"
          size="small"
          :disabled="!canClaim"
          :loading="claiming"
          @click="emit('claim')"
        >一键领取</x-button>
      </div>
    </header>

    <div class="activity-reward__tab">
      <svg-icon name="promote-gift" class-name="activity-reward__gift" aria-hidden="true" />
      <span>{{ activityTitle }}</span>
    </div>

    <div class="activity-reward__row">
      <span><label>邀请有效人数</label><strong>{{ validInvites }}</strong></span>
      <span><label>待领取</label><strong class="activity-reward__amount">{{ unclaimedReward }}</strong></span>
      <x-button
        class="activity-reward__claim"
        type="primary"
        size="mini"
        :disabled="!canClaim"
        :loading="claiming"
        @click="emit('claim')"
      >{{ $t("领 取") }}</x-button>
      <button
        type="button"
        class="activity-reward__link"
        :aria-label="$t('查看活动详情')"
        @click="emit('openActivity')"
      >
        <svg-icon name="arrow-back" class-name="activity-reward__arrow" aria-hidden="true" />
      </button>
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
}

.activity-reward__claim-all {
  flex: none;
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
}

.activity-reward__claim {
  flex: none;
}

.activity-reward__link {
  display: flex;
  align-items: center;
  flex: none;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 4px;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_2);
  cursor: pointer;
  background: transparent;
}

:deep(.activity-reward__arrow) {
  width: 9px;
  height: 9px;
  color: currentColor;
  font-size: 9px;
  transform: rotate(180deg);
}

.activity-reward__amount {
  color: var(--skin__accent_3) !important;
}
</style>
