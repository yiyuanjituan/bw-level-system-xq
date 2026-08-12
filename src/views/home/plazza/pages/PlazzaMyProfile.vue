<script setup lang="ts">
import PlazzaProfileCard from "../components/PlazzaProfileCard.vue";
import PlazzaRecentGames from "../components/PlazzaRecentGames.vue";
import type { PlazzaProfile, PlazzaRecentGame } from "../types";

defineProps<{
  profile: PlazzaProfile;
  recentGames: PlazzaRecentGame[];
  emptyText: string;
}>();

defineEmits<{
  (event: "edit-profile"): void;
  (event: "publish"): void;
  (event: "search"): void;
  (event: "share"): void;
  (event: "select-game", game: PlazzaRecentGame): void;
  (event: "toggle-favorite", game: PlazzaRecentGame): void;
}>();
</script>

<template>
  <div class="my-profile">
    <plazza-profile-card
      :profile="profile"
      @edit-profile="$emit('edit-profile')"
      @publish="$emit('publish')"
      @search="$emit('search')"
      @share="$emit('share')"
    />

    <plazza-recent-games
      :games="recentGames"
      @select-game="$emit('select-game', $event)"
      @toggle-favorite="$emit('toggle-favorite', $event)"
    />

    <ui-empty :text="emptyText" />
  </div>
</template>

<style scoped lang="less">
.my-profile {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

:deep(.empty-box) {
  flex: 1;
  height: auto;
  min-height: 190px;
}
</style>
