<script setup lang="ts">
import PromoteCommissionTutorial from "../components/PromoteCommissionTutorial.vue";
import PromoteInviteShare from "../components/PromoteInviteShare.vue";
import type { PromoteInfo } from "../types";

defineProps<{
  info: PromoteInfo | null;
}>();
</script>

<template>
  <div class="promote-share">
    <promote-invite-share
      :invite-code="info?.user.inviteCode || ''"
      :invite-links="info?.inviteLinks || []"
    />
    <promote-commission-tutorial />
  </div>
</template>

<style scoped lang="less">
.promote-share {
  width: 100%;
  padding-top: 10px;
}
</style>
