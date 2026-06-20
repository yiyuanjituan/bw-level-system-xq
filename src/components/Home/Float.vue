<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useWindowSize } from '@vant/use';
import { service } from '@/api/service';
import router from '@/router';

defineOptions({
  name: 'HomeFloat'
});

const props = withDefaults(
  defineProps<{
    isPut?: boolean;
  }>(),
  {
    isPut: false
  }
);

type FloatPosition = 0 | 1 | 2 | 3;
type FloatJumpMode = 0 | 1 | 2;

type FloatRecord = {
  id?: number | string;
  position?: number | string;
  image?: string;
  weigh?: number | string;
  jumpMode?: number | string;
  url?: string | null;
};

type FloatItem = {
  id: number | string;
  position: FloatPosition;
  image: string;
  weigh: number;
  jumpMode: FloatJumpMode;
  url: string;
};

const fastBtnWidth = 60;
const swipeItemGap = 10;
const swipeItemWidth = fastBtnWidth + swipeItemGap;
const viewportBaseWidth = 375;
const leftPositions: FloatPosition[] = [0, 2];
const rightPositions: FloatPosition[] = [1, 3];
const allPositions: FloatPosition[] = [0, 1, 2, 3];

const { width: windowWidth } = useWindowSize();
const swipeWidth = computed(() => (windowWidth.value / viewportBaseWidth) * swipeItemWidth);
const floatGroups = ref<Record<FloatPosition, FloatItem[]>>(createFloatGroups());
const closedPositions = ref<Set<FloatPosition>>(new Set());
const hasLeftFloat = computed(() => leftPositions.some(position => getPositionItems(position).length > 0));
const hasRightFloat = computed(() => rightPositions.some(position => getPositionItems(position).length > 0));
const hasFloat = computed(() => hasLeftFloat.value || hasRightFloat.value);

function createFloatGroups(): Record<FloatPosition, FloatItem[]> {
  return {
    0: [],
    1: [],
    2: [],
    3: []
  };
}

function toFiniteNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isFloatPosition(value: number): value is FloatPosition {
  return allPositions.includes(value as FloatPosition);
}

function normalizeJumpMode(value: unknown): FloatJumpMode {
  const jumpMode = toFiniteNumber(value, 0);
  return jumpMode === 1 || jumpMode === 2 ? jumpMode : 0;
}

function normalizeFloatList(response: any): FloatRecord[] {
  const source = response?.data ?? response;

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.list)) return source.list;
  if (Array.isArray(source?.rows)) return source.rows;

  return [];
}

function normalizeFloatItem(record: FloatRecord, index: number): FloatItem | null {
  const position = toFiniteNumber(record.position, -1);
  const image = typeof record.image === 'string' ? record.image.trim() : '';

  if (!isFloatPosition(position) || !image) {
    return null;
  }

  return {
    id: record.id ?? `${position}-${index}`,
    position,
    image,
    weigh: toFiniteNumber(record.weigh, 0),
    jumpMode: normalizeJumpMode(record.jumpMode),
    url: typeof record.url === 'string' ? record.url.trim() : ''
  };
}

function groupFloatList(records: FloatRecord[]) {
  const groups = createFloatGroups();

  records
    .map(normalizeFloatItem)
    .filter((item): item is FloatItem => Boolean(item))
    .sort((prev, next) => next.weigh - prev.weigh)
    .forEach(item => {
      groups[item.position].push(item);
    });

  return groups;
}

function init() {
  service.open.v1.home.floatData().then(res => {
    closedPositions.value = new Set();
    floatGroups.value = groupFloatList(normalizeFloatList(res));
  });
}

function getPositionItems(position: FloatPosition) {
  if (closedPositions.value.has(position)) {
    return [];
  }

  return floatGroups.value[position];
}

function closePosition(position: FloatPosition) {
  const nextClosedPositions = new Set(closedPositions.value);
  nextClosedPositions.add(position);
  closedPositions.value = nextClosedPositions;
}

function handleFloatClick(item: FloatItem) {
  if (item.jumpMode === 0 || !item.url) return;

  if (item.jumpMode === 1) {
    router.push(item.url);
    return;
  }

  window.open(item.url, '_blank');
}

onMounted(() => {
  init();
});
</script>
<template>
  <div class="float-box" v-if="hasFloat">
    <div class="floatBox float-left" :class="{ isPut: props.isPut }" v-if="hasLeftFloat">
      <div class="fast-list">
        <section>
          <template v-for="position in leftPositions" :key="position">
            <div class="fast-entry-item" v-if="getPositionItems(position).length">
              <van-swipe :width="swipeWidth" :show-indicators="false" :autoplay="3000">
                <van-swipe-item v-for="item in getPositionItems(position)" :key="item.id">
                  <div class="fast-btn" @click="handleFloatClick(item)">
                    <img :src="item.image" alt="" class="fast-image" />
                    <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon" @click.stop="closePosition(position)" />
                  </div>
                </van-swipe-item>
              </van-swipe>
            </div>
          </template>
        </section>
      </div>
    </div>
    <div class="floatBox float-right" :class="{ isPut: props.isPut }" v-if="hasRightFloat">
      <div class="fast-list">
        <section>
          <template v-for="position in rightPositions" :key="position">
            <div class="fast-entry-item" v-if="getPositionItems(position).length">
              <van-swipe :width="swipeWidth" :show-indicators="false" :autoplay="3000">
                <van-swipe-item v-for="item in getPositionItems(position)" :key="item.id">
                  <div class="fast-btn" @click="handleFloatClick(item)">
                    <img :src="item.image" alt="" class="fast-image" />
                    <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon" @click.stop="closePosition(position)" />
                  </div>
                </van-swipe-item>
              </van-swipe>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.float-box {
  .floatBox {
    --float-box-y-axis-gap: 3.5px;
    position: absolute;
    bottom: 5px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    isolation: isolate;
    transition: transform 0.2s ease;
    .fast-list {
      width: 60px;
      > section {
        display: flex;
        flex-direction: column;
        align-items: center;
        .fast-entry-item {
          position: relative;
          width: 60px;
          .fast-btn {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            cursor: pointer;
            height: 70px;
            justify-content: flex-start;
            .fast-image {
              display: block;
              width: 60px;
              height: 70px;
              object-fit: contain;
            }
            .close-icon {
              position: absolute;
              top: 0;
              left: 0;
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }
  }
  .float-left {
    left: var(--float-box-y-axis-gap);
    right: unset;
    &.isPut {
      transform: translateX(-35px);
    }
    .close-icon {
      left: unset !important;
      right: 0 !important;
    }
  }
  .float-right {
    right: var(--float-box-y-axis-gap);
    left: unset;
    &.isPut {
      transform: translateX(35px);
    }
    .close-icon {
    }
  }
}
</style>
