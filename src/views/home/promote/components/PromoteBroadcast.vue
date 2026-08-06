<script setup lang="ts">
import { computed } from "vue";
import goldLevelTwoIcon from "@/assets/home/promote/level-gold-2.avif";
import goldLevelIcon from "@/assets/home/promote/level-gold.avif";
import silverLevelTwoIcon from "@/assets/home/promote/level-silver-2.avif";
import silverLevelIcon from "@/assets/home/promote/level-silver.avif";

interface PromoteBroadcastItem {
  account: string;
  commission: string;
  levelIcon: string;
}

const defaultBroadcastItems: PromoteBroadcastItem[] = [
  {
    account: "17****503",
    commission: "589.22",
    levelIcon: goldLevelIcon
  },
  {
    account: "26****210",
    commission: "503.77",
    levelIcon: silverLevelIcon
  },
  {
    account: "87****659",
    commission: "479.53",
    levelIcon: silverLevelIcon
  },
  {
    account: "35****468",
    commission: "461.59",
    levelIcon: goldLevelTwoIcon
  },
  {
    account: "41****427",
    commission: "406.62",
    levelIcon: goldLevelIcon
  },
  {
    account: "60****800",
    commission: "360.97",
    levelIcon: silverLevelTwoIcon
  },
  {
    account: "81****330",
    commission: "357.61",
    levelIcon: silverLevelIcon
  }
];

const props = withDefaults(
  defineProps<{
    duration?: number;
    items?: PromoteBroadcastItem[];
  }>(),
  {
    duration: 34.75
  }
);

const broadcastItems = computed(() =>
  props.items?.length ? props.items : defaultBroadcastItems
);
</script>

<template>
  <div class="promote-broadcast" aria-label="佣金播报">
    <div
      class="promote-broadcast__track"
      :style="{ '--promote-broadcast-duration': `${duration}s` }"
    >
      <div
        v-for="groupIndex in 2"
        :key="groupIndex"
        class="promote-broadcast__group"
        :aria-hidden="groupIndex === 2"
      >
        <div
          v-for="broadcastItem in broadcastItems"
          :key="`${groupIndex}-${broadcastItem.account}`"
          class="promote-broadcast__item"
        >
          <span class="promote-broadcast__level">
            <img :src="broadcastItem.levelIcon" alt="" decoding="async" loading="lazy" />
          </span>
          <p class="promote-broadcast__account">
            代理ID: <span>{{ broadcastItem.account }}</span>
          </p>
          <span class="promote-broadcast__space">&nbsp;</span>
          <p class="promote-broadcast__commission">
            今日获得佣金:
            <span>{{ broadcastItem.commission }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.promote-broadcast {
  position: relative;
  display: flex;
  flex-flow: row;
  align-items: center;
  width: 100%;
  margin-bottom: 0.1rem;
  overflow: hidden;
}

.promote-broadcast__track {
  display: flex;
  width: max-content;
  animation: promote-broadcast-scroll-left var(--promote-broadcast-duration) linear infinite;
  will-change: transform;
  height: 23px;
}

.promote-broadcast__group {
  display: flex;
  flex: none;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  max-height: 0.4rem;
}

.promote-broadcast__item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin-right: 0.3rem;
  padding: 0.04rem 0.12rem;
  line-height: 0.32rem;
  border-radius: 0.9rem;
  background: var(--skin__bg_2, #fff);
}

.promote-broadcast__level {
  position: relative;
  display: flex;
  flex: none;
  width: 0.32rem;
  margin-right: 0.05rem;

  img {
    display: block;
    width: 100%;
  }
}

.promote-broadcast__account,
.promote-broadcast__commission {
  margin: 0;
  color: var(--skin__neutral_2, #999);
  font-size: 0.18rem;
  font-weight: 400;
  white-space: nowrap;
}

.promote-broadcast__account span {
  color: var(--skin__lead, #333);
}

.promote-broadcast__commission span {
  color: #ffeb32;
}

.promote-broadcast__space {
  font-size: 0.18rem;
}

@keyframes promote-broadcast-scroll-left {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
