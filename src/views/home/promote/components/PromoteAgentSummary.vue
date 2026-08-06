<script setup lang="ts">
import levelIcon from "@/assets/home/promote/level-current.avif";

withDefaults(
  defineProps<{
    platformId?: string;
    auditMultiple?: string;
    settlementDate?: string;
    receivedCommission?: string;
    unclaimedCommission?: string;
    yesterdayPerformance?: string;
    totalCommission?: string;
  }>(),
  {
    platformId: "482485509",
    auditMultiple: "0.00",
    settlementDate: "2026/08/09",
    receivedCommission: "0.00",
    unclaimedCommission: "0.00",
    yesterdayPerformance: "0.00",
    totalCommission: "0.00"
  }
);

</script>

<template>
  <section class="agent-summary">
    <div class="agent-summary__card">
      <div class="agent-summary__identity">
        <div class="agent-summary__level">
          <img :src="levelIcon" alt="当前代理等级" />
          <span>?</span>
        </div>

        <div class="agent-summary__profile">
          <p><button type="button" class="agent-summary__id">{{ platformId }}</button></p>
          <p><label>稽核倍数</label><strong>{{ auditMultiple }}</strong></p>
          <p><span class="agent-summary__mode">三级净盈利</span></p>
          <p><label>结算日期</label><strong>{{ settlementDate }}</strong></p>
        </div>
      </div>

      <div class="agent-summary__commission">
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
                  <span>最高返佣<em>25%</em>，月入百万不是梦</span>
                </span>
              </template>
            </x-badge>
            <small>(距离下次结算 <i>3天</i> 05:31:47)</small>
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
  margin-bottom: 0.2rem;
}

.agent-summary__card {
  width: 7.1rem;
  height: 100%;
  margin: 0 0.2rem;
  padding: 0.2rem;
  overflow: visible;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
}

.agent-summary__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.2rem;
  border-bottom: 0.01rem solid var(--skin__border, #e3e3e3);
}

.agent-summary__level {
  position: relative;
  flex: none;
  margin-right: 0.05rem;
  line-height: 100%;

  img {
    display: block;
    width: 1rem;
  }

  span {
    position: absolute;
    top: 0;
    right: -0.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.28rem;
    height: 0.28rem;
    border-radius: 50%;
    color: var(--skin__text_primary, #fff);
    font-size: 0.18rem;
    background: var(--skin__primary);
  }
}

.agent-summary__profile {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 5.5rem;
  margin-left: 0.2rem;

  p {
    display: flex;
    align-items: flex-start;
    width: 50%;
    margin: 0;
    color: var(--skin__neutral_2);
    font-size: 0.22rem;
    line-height: 1.2;

    &:nth-child(1),
    &:nth-child(2) {
      margin-bottom: 0.1rem;
    }
  }

  label {
    max-width: 1.38rem;
    margin-right: 0.05rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: var(--skin__lead);
    font-weight: 400;
  }
}

.agent-summary__id {
  display: -webkit-box;
  max-width: 1.25rem;
  padding: 0;
  overflow: hidden;
  border: 0;
  color: var(--skin__primary);
  font: inherit;
  line-height: 1.4;
  text-decoration: underline;
  text-underline-offset: 0.06rem;
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
  max-width: 2.65rem;
  padding: 0.03rem 0.1rem;
  overflow: hidden;
  border: 0.01rem solid rgba(var(--skin__accent_3__toRgbString), 0.3);
  border-radius: 0.06rem;
  color: var(--skin__lead);
  font-size: 0.18rem;
  text-overflow: ellipsis;
  vertical-align: middle;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  background: rgba(var(--skin__accent_3__toRgbString), 0.1);
}

.agent-summary__commission {
  padding-top: 0.2rem;
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
  font-size: 0.22rem;

  small {
    color: var(--skin__neutral_2);
    font-size: 0.2rem;
    font-weight: 400;
  }

  i {
    color: var(--skin__neutral_2);
    font-style: normal;
  }
}

.agent-summary__commission-badge {
  margin-right: 0.05rem;
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
  max-width: 5rem;
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
  width: 0.24rem;
  height: 0.24rem;
  margin-right: 0.05rem;
}

.agent-summary__arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: none;
  width: 1rem;
  height: 0.65rem;
  color: var(--skin__neutral_2);
  font-size: 0.18rem;

  :deep(.svg-icon) {
    transform: rotate(180deg);
  }
}

.agent-summary__row {
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-bottom: 0.2rem;
  }
}

.agent-summary__col {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 2.65rem;
  color: var(--skin__neutral_2);
  font-size: 0.22rem;

  label {
    margin-right: 0.1rem;
    line-height: 1;
  }

  strong {
    margin-right: 0.03rem;
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
    width: 2.1rem;
  }

  button {
    position: relative;
    width: 1rem;
    height: 0.4rem;
    margin-left: auto;
    border: 0;
    border-radius: 0.08rem;
    color: #191919;
    font-size: 0.18rem;
    line-height: 0.4rem;
    background: #656565;
    opacity: 1;
  }
}

.agent-summary__amount {
  color: var(--skin__accent_3) !important;
}
</style>
