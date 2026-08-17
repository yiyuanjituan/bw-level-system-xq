<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { getSpecialInviteSummary, type SpecialInviteSummary } from "@/api/common";
import goldLevelTwoIcon from "@/assets/home/promote/level-gold-2.avif";
import goldLevelIcon from "@/assets/home/promote/level-gold.avif";
import silverLevelIcon from "@/assets/home/promote/level-silver.avif";
import PromoteActivityReward from "../components/PromoteActivityReward.vue";
import PromoteAgentSummary from "../components/PromoteAgentSummary.vue";
import PromoteBroadcast from "../components/PromoteBroadcast.vue";
import PromoteInviteShare from "../components/PromoteInviteShare.vue";
import PromoteQuickActions from "../components/PromoteQuickActions.vue";
import type { PromoteInfo } from "../types";

const props = defineProps<{
  info: PromoteInfo | null;
}>();

const router = useRouter();

defineEmits<{
  selectTab: [active: "createSubordinate" | "rebateRatio"];
}>();

interface PromoteBroadcastItem {
  account: string;
  commission: string;
  levelIcon: string;
}

const isLoggedIn = computed(() => Boolean(props.info?.user?.account));
const emptyActivityReward = (): SpecialInviteSummary => ({
  available: false,
  activityId: 0,
  activityType: 0,
  specialActivity: 15,
  activityTitle: "邀请红包活动",
  totalReward: 0,
  validInviteCount: 0,
  unclaimedReward: 0
});
const activityReward = ref<SpecialInviteSummary>(emptyActivityReward());

function formatMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function openActivityDetail() {
  if (!activityReward.value.available || activityReward.value.activityId <= 0) return;

  void router.push({
    path: "/home/event/detail",
    query: {
      current: activityReward.value.activityType,
      eventId: activityReward.value.activityId,
      template: activityReward.value.specialActivity || 1
    }
  });
}

watch(
  isLoggedIn,
  loggedIn => {
    if (!loggedIn) {
      activityReward.value = emptyActivityReward();
      return;
    }

    void getSpecialInviteSummary()
      .then(summary => {
        activityReward.value = summary?.available ? summary : emptyActivityReward();
      })
      .catch(() => {
        activityReward.value = emptyActivityReward();
      });
  },
  { immediate: true }
);

const leadingBroadcastItems: PromoteBroadcastItem[] = [
  { account: "43****573", commission: "1,994.51", levelIcon: goldLevelIcon },
  { account: "42****556", commission: "959.84", levelIcon: silverLevelIcon },
  { account: "44****779", commission: "853.22", levelIcon: goldLevelTwoIcon },
  { account: "62****497", commission: "805.91", levelIcon: goldLevelIcon },
  { account: "95****685", commission: "689.25", levelIcon: silverLevelIcon },
  { account: "91****320", commission: "686.17", levelIcon: goldLevelIcon },
  { account: "19****372", commission: "604.40", levelIcon: silverLevelIcon },
  { account: "91****125", commission: "601.14", levelIcon: goldLevelTwoIcon }
];
</script>

<template>
  <div class="promote-home">
    <div class="promote-home__broadcasts">
      <promote-broadcast :items="leadingBroadcastItems" :duration="50" />
      <promote-broadcast :duration="30" />
    </div>
    <promote-agent-summary
      :logged-in="isLoggedIn"
      :platform-id="info?.user?.account || ''"
      :agent-mode-name="info?.config.agentModeName || '加载中'"
      :audit-multiple="info?.config.auditMultiplier ?? 0"
      :settlement-cycle-name="info?.config.settlementCycleName || ''"
      :next-settlement-timestamp="info?.config.nextSettlementTimestamp || 0"
      :highest-commission-rate="info?.config.highestCommissionRate ?? 0"
    />
    <promote-invite-share
      :show-invite-code="isLoggedIn"
      :invite-code="info?.user?.inviteCode || ''"
      :invite-links="info?.inviteLinks || []"
    />
    <promote-quick-actions
      :show-create-subordinate="isLoggedIn"
      @select-tab="$emit('selectTab', $event)"
    />
    <promote-activity-reward
      v-if="isLoggedIn && activityReward.available"
      :activity-title="activityReward.activityTitle"
      :total-reward="formatMoney(activityReward.totalReward)"
      :valid-invites="String(activityReward.validInviteCount)"
      :unclaimed-reward="formatMoney(activityReward.unclaimedReward)"
      @open-activity="openActivityDetail"
    />
  </div>
</template>

<style scoped lang="less">
.promote-home {
  width: 100%;
  padding: 10px 0;
}

.promote-home__broadcasts {
  margin-bottom: 5px;
}
</style>
