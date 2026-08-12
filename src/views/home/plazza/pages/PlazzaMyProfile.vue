<script setup lang="ts">
import PlazzaProfileCard from "../components/PlazzaProfileCard.vue";
import PlazzaRecentGames from "../components/PlazzaRecentGames.vue";
import type { PlazzaProfile, PlazzaRecentGame } from "../types";

defineProps<{
  profile: PlazzaProfile;
  recentGames: PlazzaRecentGame[];
  pendingGameFavoriteIds?: string[];
  isSharing?: boolean;
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
      :is-sharing="isSharing"
      @edit-profile="$emit('edit-profile')"
      @publish="$emit('publish')"
      @search="$emit('search')"
      @share="$emit('share')"
    />

    <plazza-recent-games
      :games="recentGames"
      :pending-favorite-ids="pendingGameFavoriteIds"
      @select-game="$emit('select-game', $event)"
      @toggle-favorite="$emit('toggle-favorite', $event)"
    />
  </div>
</template>

<style scoped lang="less">
.my-profile {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
