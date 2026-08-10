<script setup lang="ts">
import goldLevelTwoIcon from "@/assets/home/promote/level-gold-2.avif";
import goldLevelIcon from "@/assets/home/promote/level-gold.avif";
import silverLevelIcon from "@/assets/home/promote/level-silver.avif";
import PromoteActivityReward from "../components/PromoteActivityReward.vue";
import PromoteAgentSummary from "../components/PromoteAgentSummary.vue";
import PromoteBroadcast from "../components/PromoteBroadcast.vue";
import PromoteInviteShare from "../components/PromoteInviteShare.vue";
import PromoteQuickActions from "../components/PromoteQuickActions.vue";
import type { PromoteInfo } from "../types";

defineProps<{
  info: PromoteInfo | null;
}>();

defineEmits<{
  selectTab: [active: "createSubordinate" | "rebateRatio"];
}>();

interface PromoteBroadcastItem {
  account: string;
  commission: string;
  levelIcon: string;
}

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
      :platform-id="info?.user.account || ''"
      :agent-mode-name="info?.config.agentModeName || '加载中'"
      :audit-multiple="info?.config.auditMultiplier ?? 0"
      :settlement-cycle-name="info?.config.settlementCycleName || ''"
      :next-settlement-timestamp="info?.config.nextSettlementTimestamp || 0"
      :highest-commission-rate="info?.config.highestCommissionRate ?? 0"
    />
    <promote-invite-share
      :invite-code="info?.user.inviteCode || ''"
      :invite-links="info?.inviteLinks || []"
    />
    <promote-quick-actions @select-tab="$emit('selectTab', $event)" />
    <promote-activity-reward />
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
