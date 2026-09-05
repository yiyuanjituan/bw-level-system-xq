<script setup lang="ts">
import { computed } from 'vue';
import HomeSkeletonImage from '@/components/Home/SkeletonImage.vue';
import type { HomeGameRecord } from '@/components/Home/types';
import { getHomeGameImage, shouldShowHomeGameName } from '@/components/Home/types';
import maintenanceIcon from '@/assets/home/u-series/img_whz_style_1.png';

defineOptions({
  name: 'BasicVenueCard'
});

const props = withDefaults(
  defineProps<{
    venue: HomeGameRecord;
    imageDisplay?: 'square' | 'long';
  }>(),
  {
    imageDisplay: 'square'
  }
);

const emit = defineEmits<{
  (event: 'select', venue: HomeGameRecord): void;
  (event: 'disabled', venue: HomeGameRecord): void;
}>();

// 横向场馆卡优先使用接口海报，避免把方形封面放大裁切成横条。
const venueImage = computed(() => getHomeGameImage(props.venue, 'long'));
const showName = computed(() => shouldShowHomeGameName(props.venue));
const isDisabled = computed(() => Number(props.venue.isOpen) === 0);

function handleSelect() {
  if (isDisabled.value) {
    emit('disabled', props.venue);
    return;
  }
  emit('select', props.venue);
}
</script>

<template>
  <section
    class="basic-venue-card"
    :class="{ 'basic-venue-card--disabled': isDisabled }"
    role="button"
    tabindex="0"
    :aria-disabled="isDisabled"
    @click="handleSelect"
    @keydown.enter="handleSelect"
    @keydown.space.prevent="handleSelect"
  >
    <home-skeleton-image
      v-if="venueImage"
      :src="venueImage"
      :alt="String(venue.name ?? '')"
      class="basic-venue-card__image"
      fit="cover"
      loading="lazy"
    />
    <p v-if="showName" class="basic-venue-card__name" dir="ltr">{{ venue.name }}</p>
    <div v-if="isDisabled" class="basic-venue-card__maintenance">
      <img :src="maintenanceIcon" :alt="$t('tips.maintenance')" />
    </div>
  </section>
</template>

<style scoped lang="less">
// 与参考稿 poster-box-core 横向场馆卡一致：宽 5.2rem、高约 0.39 宽、小圆角，
// 名称浮层位于卡片左下。
.basic-venue-card {
  position: relative;
  display: block;
  width: 260px;
  max-width: 100%;
  aspect-ratio: 100 / 39;
  flex: none;
  overflow: hidden;
  border-radius: 7px;
  background-color: var(--skin__ddt_bg);
  cursor: pointer;
  box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);

  &--disabled {
    cursor: not-allowed;

  }

  &__maintenance {
    position: absolute;
    inset: 0;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);

    img {
      height: 100%;
      aspect-ratio: 1;
      object-fit: contain;
    }
  }

  &__image {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__name {
    position: absolute;
    bottom: 8px;
    left: 12px;
    z-index: 2;
    width: 115px;
    margin: 0;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    line-height: 18px;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    pointer-events: none;
  }
}
</style>
