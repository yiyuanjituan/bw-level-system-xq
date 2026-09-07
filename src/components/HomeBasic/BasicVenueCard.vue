<script setup lang="ts">
import { computed } from 'vue';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import { getHomeGameImage, shouldShowHomeGameName, type HomeGameRecord } from '@/components/Home/types';
import { $t } from '@/locales';
import maintenanceIcon from '@/assets/home/img_whz_style_13.avif';

defineOptions({ name: 'BasicVenueCard' });

const props = withDefaults(defineProps<{
  venue: HomeGameRecord;
  columns?: 1 | 3;
}>(), { columns: 1 });

const emit = defineEmits<{
  (event: 'select', venue: HomeGameRecord): void;
  (event: 'disabled', venue: HomeGameRecord): void;
}>();

// 场馆排列单独选择封面，不改变全局游戏长图、方图配置。
const venueImage = computed(() => getHomeGameImage(props.venue, props.columns === 3 ? 'square' : 'long'));
const showName = computed(() => Boolean(props.venue.name) && shouldShowHomeGameName(props.venue));
const isDisabled = computed(() => Number(props.venue.isOpen) === 0);

function selectVenue() {
  if (isDisabled.value) {
    emit('disabled', props.venue);
    return;
  }
  emit('select', props.venue);
}
</script>

<template>
  <div
    class="basic-venue"
    :class="{ 'basic-venue--triple': columns === 3 }"
    role="button"
    tabindex="0"
    :aria-label="String(venue.name ?? '')"
    :aria-disabled="isDisabled"
    @click="selectVenue"
    @keydown.enter="selectVenue"
    @keydown.space.prevent="selectVenue"
  >
    <HomeSkeletonImage v-if="venueImage" :src="venueImage" :alt="String(venue.name ?? '')" class="basic-venue__poster" fit="cover" />
    <div v-if="showName" class="basic-venue__title">
      <h4>{{ venue.name }}</h4>
    </div>
    <div v-if="isDisabled" class="basic-venue__maintenance">
      <img :src="maintenanceIcon" :alt="$t('tips.maintenance')" />
    </div>
  </div>
</template>

<style scoped lang="less">
.basic-venue {
  position: relative;
  width: 260px;
  height: 101.4px;
  overflow: hidden;
  border-radius: 7.02px;
  color: var(--skin__ddt_icon, var(--skin__lead));
  background-color: var(--skin__ddt_bg);
  box-shadow: 0 1.5px 3.5px var(--skin__web_left_bg_shadow);
  cursor: pointer;

  &__poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__title {
    position: absolute;
    bottom: 8.32px;
    left: 11.96px;
    width: 114.92px;
    height: 39.78px;
    overflow: hidden;
    color: #fff;
    font-size: 14.82px;
    line-height: 1.25;
    text-align: center;
    pointer-events: none;

    h4 {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      font-size: inherit;
      font-weight: 400;
      line-height: inherit;
      word-break: break-word;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  &__maintenance {
    position: absolute;
    inset: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);

    img {
      width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  &--triple {
    width: 80px;
    height: 106.4px;
    border-radius: 10px;
    box-shadow: none;
  }

  &--triple &__title {
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 24px;
    padding: 0 3px;
    font-size: 9.142856px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

    h4 {
      width: 100%;
      font-weight: 700;
    }
  }
}
</style>
