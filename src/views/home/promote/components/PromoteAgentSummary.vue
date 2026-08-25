<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import dayjs from "dayjs";
import levelIcon from "@/assets/home/promote/level-current.avif";

const props = withDefaults(
  defineProps<{
    loggedIn?: boolean;
    platformId?: string;
    agentModeName?: string;
    auditMultiple?: number;
    settlementCycleName?: string;
    nextSettlementTimestamp?: number;
    highestCommissionRate?: number;
    receivedCommission?: string;
    unclaimedCommission?: string;
    yesterdayPerformance?: string;
    totalCommission?: string;
  }>(),
  {
    loggedIn: false,
    platformId: "",
    agentModeName: "加载中",
    auditMultiple: 0,
    settlementCycleName: "",
    nextSettlementTimestamp: 0,
    highestCommissionRate: 0,
    receivedCommission: "0.00",
    unclaimedCommission: "0.00",
    yesterdayPerformance: "0.00",
    totalCommission: "0.00"
  }
);

const nowTimestamp = ref(Date.now());
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const auditMultipleText = computed(() =>
  Number(props.auditMultiple || 0).toFixed(2)
);
const settlementDate = computed(() =>
  props.nextSettlementTimestamp
    ? dayjs(props.nextSettlementTimestamp).format("YYYY/MM/DD")
    : "--/--/--"
);
const countdownText = computed(() => {
  if (!props.nextSettlementTimestamp)
    return "--";

  const remainingSeconds = Math.max(
    Math.floor((props.nextSettlementTimestamp - nowTimestamp.value) / 1000),
    0
  );
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
});

onMounted(() => {
  countdownTimer = setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<template>
  <section class="agent-summary">
    <div class="agent-summary__card" :class="{ 'agent-summary__card--guest': !loggedIn }">
      <div class="agent-summary__identity">
        <div v-if="loggedIn" class="agent-summary__level">
          <img :src="levelIcon" :alt="$t('当前代理等级')" />
          <span>?</span>
        </div>

        <div class="agent-summary__profile" :class="{ 'agent-summary__profile--guest': !loggedIn }">
          <p>
            <button v-if="loggedIn" type="button" class="agent-summary__id">{{ platformId }}</button>
            <span v-else class="agent-summary__guest-value">-</span>
          </p>
          <p><label>稽核倍数</label><strong>{{ loggedIn ? auditMultipleText : "-" }}</strong></p>
          <p><span class="agent-summary__mode">{{ agentModeName }}</span></p>
          <p v-if="loggedIn"><label>{{ settlementCycleName || "结算" }}日期</label><strong>{{ settlementDate }}</strong></p>
          <p v-else><label>结算周期</label><strong>{{ settlementCycleName || "-" }}</strong></p>
        </div>
      </div>

      <div v-if="loggedIn" class="agent-summary__commission">
        <div class="agent-summary__title">
          <div class="agent-summary__title-copy">
            <x-badge
              class="agent-summary__commission-badge"
              position="top-left"
              :translate-x="false"
              bg-color="var(--skin__accent_2, #ea4e3d)"
            >
              <span class="agent-summary__commission-label">我的佣金</span>
              <template #content>
                <span class="agent-summary__bubble-content">
                  <svg-icon name="promote-megaphone" class-name="agent-summary__bubble-icon" />
                  <span>最高返佣<em>{{ highestCommissionRate.toFixed(2) }}%</em></span>
                </span>
              </template>
            </x-badge>
            <small>(距离下次结算 <i>{{ countdownText }}</i>)</small>
          </div>
          <span class="agent-summary__arrow" aria-hidden="true">
            <svg-icon name="arrow-back" />
          </span>
        </div>

        <div class="agent-summary__row">
          <span class="agent-summary__col"><label>已领取</label><strong>{{ receivedCommission }}</strong></span>
          <span class="agent-summary__col agent-summary__col--claim">
            <span><label>待领取</label><strong class="agent-summary__amount">{{ unclaimedCommission }}</strong></span>
            <button type="button" disabled>领 取</button>
          </span>
        </div>
        <div class="agent-summary__row">
          <span class="agent-summary__col"><label>昨日直属业绩</label><strong>{{ yesterdayPerformance }}</strong></span>
          <span class="agent-summary__col"><label>累计佣金</label><strong>{{ totalCommission }}</strong></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.agent-summary {
  margin-bottom: 10px;
}

.agent-summary__card {
  width: 355px;
  height: 100%;
  margin: 0 10px;
  padding: 10px;
  overflow: visible;
  border-radius: 7px;
  background: var(--skin__bg_2);
}

.agent-summary__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 0.5px solid var(--skin__border, #e3e3e3);
}

.agent-summary__card--guest .agent-summary__identity {
  padding-bottom: 0;
  border-bottom: 0;
}

.agent-summary__level {
  position: relative;
  flex: none;
  margin-right: 2.5px;
  line-height: 100%;

  img {
    display: block;
    width: 50px;
  }

  span {
    position: absolute;
    top: 0;
    right: -5px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    color: var(--skin__text_primary, #fff);
    font-size: 9px;
    background: var(--skin__primary);
  }
}

.agent-summary__profile {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 275px;
  margin-left: 10px;

  p {
    display: flex;
    align-items: flex-start;
    width: 50%;
    margin: 0;
    color: var(--skin__neutral_2);
    font-size: 11px;
    line-height: 1.2;

    &:nth-child(1),
    &:nth-child(2) {
      margin-bottom: 5px;
    }
  }

  label {
    max-width: 69px;
    margin-right: 2.5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }
}

.agent-summary__profile--guest {
  width: 100%;
  margin-left: 0;
}

.agent-summary__guest-value {
  color: var(--skin__neutral_2);
}

.agent-summary__id {
  display: -webkit-box;
  max-width: 62.5px;
  padding: 0;
  overflow: hidden;
  border: 0;
  color: var(--skin__primary);
  font: inherit;
  line-height: 1.4;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-overflow: ellipsis;
  vertical-align: middle;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  background: transparent;
  cursor: pointer;
}

.agent-summary__mode {
  display: -webkit-box;
  max-width: 132.5px;
  padding: 1.5px 5px;
  overflow: hidden;
  border: 0.5px solid rgba(var(--skin__accent_3__toRgbString), 0.3);
  border-radius: 3px;
  color: var(--skin__lead);
  font-size: 9px;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  background: rgba(var(--skin__accent_3__toRgbString), 0.1);
}

.agent-summary__commission {
  padding-top: 10px;
}

.agent-summary__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-summary__title-copy {
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  color: var(--skin__lead);
  font-size: 11px;

  small {
    color: var(--skin__neutral_2);
    font-size: 10px;
    font-weight: 400;
  }

  i {
    color: var(--skin__neutral_2);
    font-style: normal;
  }
}

.agent-summary__commission-badge {
  margin-right: 2.5px;
  color: var(--skin__lead);
  line-height: 1.15;
}

:deep(.agent-summary__commission-badge .x-badge--top-left) {
  top: -7.5px;
}

.agent-summary__commission-label {
  color: var(--skin__lead);
}

.agent-summary__bubble-content {
  display: inline-flex;
  align-items: center;
  width: max-content;
  max-width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  em {
    color: #f7ff09;
    font-style: normal;
  }
}

:deep(.agent-summary__bubble-icon) {
  flex: none;
  width: 12px;
  height: 12px;
  margin-right: 2.5px;
}

.agent-summary__arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: none;
  width: 50px;
  height: 32.5px;
  color: var(--skin__neutral_2);
  font-size: 9px;

  :deep(.svg-icon) {
    transform: rotate(180deg);
  }
}

.agent-summary__row {
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-bottom: 10px;
  }
}

.agent-summary__col {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 132.5px;
  color: var(--skin__neutral_2);
  font-size: 11px;

  label {
    margin-right: 5px;
    line-height: 1;
  }

  strong {
    margin-right: 1.5px;
    color: var(--skin__lead);
    font-weight: 400;
    line-height: 1;
    word-break: break-word;
  }
}

.agent-summary__col--claim {
  flex: 1;
  flex-wrap: nowrap;

  > span {
    display: flex;
    align-items: center;
    width: 105px;
  }

  button {
    position: relative;
    width: 50px;
    height: 20px;
    margin-left: auto;
    border: 0;
    border-radius: 4px;
    color: #191919;
    font-size: 9px;
    line-height: 20px;
    background: #656565;
    opacity: 1;
  }
}

.agent-summary__amount {
  color: var(--skin__accent_3) !important;
}
</style>
