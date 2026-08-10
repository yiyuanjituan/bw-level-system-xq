<script setup lang="ts">
import PromoteCommissionTutorial from "../components/PromoteCommissionTutorial.vue";
import PromoteInviteShare from "../components/PromoteInviteShare.vue";
</script>

<template>
  <div class="promote-share">
    <promote-invite-share />
    <promote-commission-tutorial />
  </div>
</template>

<style scoped lang="less">
.promote-share {
  width: 100%;
  padding-top: 10px;
}
</style>
