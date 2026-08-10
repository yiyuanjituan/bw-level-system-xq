<script setup lang="ts">
import UiTabs from "@/components/UI/tabs.vue";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { getHomeApiData } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import router from "@/router";
import useHomeDataStore from "@/store/modules/home";
import useDataStore from "@/store/modules/data";
import useAuthStore from "@/store/modules/user";

const home = useHomeDataStore();
const localList = ref([
  {
    img: "./siteadmin/skin/lobby_asset/icon_dtfl_rm_1.avif",
    name: "热门",
    pageShowNum: 9,
    children: home.suggestList
  },
  {
    img: "https://146.103.80.124:5001/siteadmin/skin/lobby_asset/2-1-common/common/_sprite/icon_dtfl_zj_1.avif",
    name: "最近"
  },
  {
    img: "https://146.103.80.124:5001/siteadmin/skin/lobby_asset/2-1-common/common/_sprite/icon_dtfl_sc_1.avif",
    name: "收藏"
  }
]);

const list = computed(() => {
  return [localList.value[0], ...home.venueList, localList.value[1], localList.value[2]];
});
const appData = useDataStore();
const auth = useAuthStore();
const currentPageByIndex = reactive<Record<number, number>>({});
const dragOffsetByIndex = reactive<Record<number, number>>({});
const isDraggingByIndex = reactive<Record<number, boolean>>({});
const pointerStateByIndex = new Map<
  number,
  { startX: number; startY: number; startOffset: number; pointerId: number; moved: boolean }
>();
const suppressClickIndexes = new Set<number>();
const swipeThreshold = 40;
const slidePageGap = 15;

defineOptions({
  name: "HomeGameList"
});

function getPageShowNum(row: any) {
  return row.pageShowNum ?? 6;
}

function getPageCount(row: any) {
  return Math.ceil((row.children?.length ?? 0) / getPageShowNum(row));
}

function getPageItems(row: any, pageIndex: number) {
  const pageShowNum = getPageShowNum(row);
  const start = pageIndex * pageShowNum;
  return row.children?.slice(start, start + pageShowNum) ?? [];
}

function getCurrentPage(row: any, index: number) {
  const pageCount = getPageCount(row);
  return Math.min(currentPageByIndex[index] ?? 0, Math.max(pageCount - 1, 0));
}

function setCurrentPage(row: any, index: number, pageIndex: number) {
  const lastPage = Math.max(getPageCount(row) - 1, 0);
  currentPageByIndex[index] = Math.max(0, Math.min(pageIndex, lastPage));
  dragOffsetByIndex[index] = 0;
}

function getTrackStyle(row: any, index: number) {
  const currentPage = getCurrentPage(row, index);
  const dragOffset = dragOffsetByIndex[index] ?? 0;

  return {
    transform: `translate3d(calc(${currentPage * -100}% - ${currentPage * slidePageGap}px + ${dragOffset}px), 0, 0)`,
    transition: isDraggingByIndex[index] ? "none" : "transform 300ms ease"
  };
}

function canSlidePrev(row: any, index: number) {
  return getCurrentPage(row, index) > 0;
}

function canSlideNext(row: any, index: number) {
  return getCurrentPage(row, index) < getPageCount(row) - 1;
}

function slidePrev(row: any, index: number) {
  if (!canSlidePrev(row, index)) {
    dragOffsetByIndex[index] = 0;
    return;
  }
  setCurrentPage(row, index, getCurrentPage(row, index) - 1);
}

function slideNext(row: any, index: number) {
  if (!canSlideNext(row, index)) {
    dragOffsetByIndex[index] = 0;
    return;
  }
  setCurrentPage(row, index, getCurrentPage(row, index) + 1);
}

function handlePointerDown(index: number, event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture?.(event.pointerId);
  pointerStateByIndex.set(index, {
    startX: event.clientX,
    startY: event.clientY,
    startOffset: dragOffsetByIndex[index] ?? 0,
    pointerId: event.pointerId,
    moved: false
  });
  isDraggingByIndex[index] = true;
}

function handlePointerMove(row: any, index: number, event: PointerEvent) {
  const pointerState = pointerStateByIndex.get(index);
  if (!pointerState || pointerState.pointerId !== event.pointerId) return;

  const distanceX = event.clientX - pointerState.startX;
  const distanceY = event.clientY - pointerState.startY;

  if (!pointerState.moved && Math.abs(distanceY) > 8 && Math.abs(distanceY) > Math.abs(distanceX)) {
    handlePointerCancel(index);
    return;
  }

  if (Math.abs(distanceX) > 5) pointerState.moved = true;
  if (!pointerState.moved) return;

  const currentPage = getCurrentPage(row, index);
  const lastPage = getPageCount(row) - 1;
  const isDraggingPastStart = currentPage === 0 && distanceX > 0;
  const isDraggingPastEnd = currentPage === lastPage && distanceX < 0;
  const resistance = isDraggingPastStart || isDraggingPastEnd ? 0.3 : 1;

  dragOffsetByIndex[index] = pointerState.startOffset + distanceX * resistance;
}

function handlePointerUp(row: any, index: number, event: PointerEvent) {
  const pointerState = pointerStateByIndex.get(index);
  pointerStateByIndex.delete(index);
  isDraggingByIndex[index] = false;

  if (!pointerState || pointerState.pointerId !== event.pointerId) return;

  const distanceX = event.clientX - pointerState.startX;
  if (!pointerState.moved) {
    dragOffsetByIndex[index] = 0;
    return;
  }

  suppressClickIndexes.add(index);
  window.setTimeout(() => suppressClickIndexes.delete(index), 300);

  if (distanceX <= -swipeThreshold) {
    slideNext(row, index);
    return;
  }

  if (distanceX >= swipeThreshold) {
    slidePrev(row, index);
    return;
  }

  dragOffsetByIndex[index] = 0;
}

function handlePointerCancel(index: number) {
  pointerStateByIndex.delete(index);
  isDraggingByIndex[index] = false;
  dragOffsetByIndex[index] = 0;
}

function handleGameClick(record: any, index: number) {
  if (suppressClickIndexes.has(index)) return;
  clickGameItem(record);
}

function handleDisabledClick(index: number) {
  if (suppressClickIndexes.has(index)) return;
  showDisabledTip();
}

function getHomeData() {
  getHomeApiData().then(res => {
    home.setSuggestData(res.suggestData);
    home.setVenueList(res.venueList);
    nextTick();
  });
}

function showDisabledTip() {
  // @ts-ignore
  showCustomToast({ type: "fail", message: $t("tips.maintenance") });
}

function clickGameItem(record: any) {
  if (record.gameMode == "venue") {
    // 点击的场馆
    router.push({ path: `/home/subGame`, query: { type: record.type, platformId: record.id } });
  } else {
    // 点击的游戏
    appData.setEnterInfo(record.venueId, record.id);
    auth.updateInfo();
    router.push({ path: "/home/embedded" });
  }
}

onMounted(() => getHomeData());
</script>

<template>
  <ui-tabs :list="list" panel-scroll>
    <template #panel="{ row, index }">
      <section class="game-list-box" v-if="row.children && row.children.length">
        <div class="list-slide-box">
          <section class="arrow-load-view">
            <div class="game-headline">
              <div class="title">
                <img :src="row.img" alt="" class="mr-[2.5px] w-[26px] text-[26px]" />
                <span class="text-[15px]">{{ row.name }}游戏</span>
              </div>
              <div class="switch-pagination-box">
                <div class="switch-pagination">
                  <button
                    type="button"
                    class="arrow-btn"
                    :disabled="!canSlidePrev(row, index)"
                    @click="slidePrev(row, index)"
                  >
                    <i class="inline-flex justify-center items-center left-icon">
                      <svg width="1em" height="1em" fill="currentColor" class="">
                        <use xlink:href="#comm_icon_fy_jt"></use>
                      </svg>
                    </i>
                  </button>
                  <div class="btn-all-inside">全部</div>
                  <button
                    type="button"
                    class="arrow-btn"
                    :disabled="!canSlideNext(row, index)"
                    @click="slideNext(row, index)"
                  >
                    <i class="inline-flex justify-center items-center">
                      <svg width="1em" height="1em" fill="currentColor" class="">
                        <use xlink:href="#comm_icon_fy_jt"></use>
                      </svg>
                    </i>
                  </button>
                </div>
              </div>
            </div>
            <div
              class="list-slide-layout"
              @pointerdown="handlePointerDown(index, $event)"
              @pointermove="handlePointerMove(row, index, $event)"
              @pointerup="handlePointerUp(row, index, $event)"
              @pointercancel="handlePointerCancel(index)"
            >
              <div
                class="list-slide-track"
                :class="{ 'is-dragging': isDraggingByIndex[index] }"
                :style="getTrackStyle(row, index)"
              >
                <div
                  v-for="pageIndex in getPageCount(row)"
                  :key="pageIndex"
                  class="list-slide-page"
                  :data-length="getPageItems(row, pageIndex - 1).length"
                >
                  <div
                    v-for="(game, gameIndex) in getPageItems(row, pageIndex - 1)"
                    :key="`${pageIndex}-${game.id ?? game.gameCode ?? gameIndex}`"
                    class="item"
                    :style="{ '--bg-img': `url(${game?.image})` }"
                    @click="handleGameClick(game, index)"
                  >
                    <section class="w-100% h-46px px-[5px] pb-[5px] text-white text-[16px]">
                      <span class="name-inner" v-if="game?.gameMode == 'game'">
                        {{ game?.name }}
                      </span>
                    </section>
                    <section
                      class="disabled-box"
                      v-if="game?.isOpen == 0"
                      @click.stop="handleDisabledClick(index)"
                    >
                      <div class="disabled-icon text-white"></div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>
  </ui-tabs>
</template>

<style scoped lang="less">
.game-list-box {
  padding-top: 15px;

  .list-slide-box {
    .arrow-load-view {
      display: flex;
      flex-direction: column;
      align-items: center;

      .game-headline {
        padding: 0 10px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        .title {
          display: flex;
          align-items: center;
          color: white;
          min-height: 26px;
        }

        .switch-pagination-box {
          display: flex;

          .switch-pagination {
            display: flex;
            align-items: center;
            width: fit-content;
            height: 23px;
            border-radius: 50px;
            border: thin solid #313843;

            .arrow-btn {
              padding: 0;
              border: 0;
              color: white;
              cursor: pointer;
              background: transparent;
              flex-grow: 0;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 100%;
              font-size: 8px;
              transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;

              .left-icon {
                transform: rotate(180deg);
              }

              &:active:not(:disabled) {
                background-color: rgba(255, 255, 255, 0.12);
                transform: scale(0.92);
              }

              &:disabled {
                color: #68707b;
                cursor: not-allowed;
              }
            }
            .btn-all-inside {
              width: 50px;
              border-left: thin solid #313843;
              border-right: thin solid #313843;
              font-size: 10px;
              flex-grow: 0;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: white;
            }
          }
        }
      }

      .list-slide-layout {
        width: 345px;
        margin-top: 10px;
        overflow: hidden;
        touch-action: pan-y;
        user-select: none;

        .list-slide-track {
          display: flex;
          gap: 15px;
          height: 100%;
          will-change: transform;
          transition: transform 300ms ease;

          &.is-dragging {
            transition: none;
          }
        }

        .list-slide-page {
          flex: 0 0 345px;
          width: 345px;
          padding-left: 0;
          height: 294.3px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 15px;
          box-sizing: border-box;
          .item {
            width: 105px;
            background-color: #1c1e23;
            background-image: var(--bg-img);
            background-size: 100% 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            border-radius: 9px 13px 13px 13px;
            position: relative;
            overflow: hidden;

            .name-inner {
              width: 100%;
              font-size: 11.8px;
              font-weight: 700;
              text-align: center;
              justify-content: center;
              align-items: center;
              display: flex;
              height: 28px;
              padding-top: 3px;
            }
            .disabled-box {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              z-index: 9;
              text-align: center;
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: 0;
              cursor: not-allowed;
              opacity: 1;
              transition: opacity 0.6s;

              .disabled-icon {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translate(-50%);
                width: 105px;
                height: 105px;
                background: url(@/assets/home/img_whz_style_13.avif) no-repeat;
                background-size: 100% 100%;
              }
            }
          }
          &[data-length="1"],
          &[data-length="2"],
          &[data-length="3"] {
            height: calc((294.3px - 15px) / 2);
            grid-template-rows: repeat(1, 1fr);
          }
          &[data-length="4"],
          &[data-length="5"],
          &[data-length="6"] {
            height: 294.3px;
            grid-template-rows: repeat(2, 1fr);
          }
          &[data-length="7"],
          &[data-length="8"],
          &[data-length="9"] {
            height: 449px;
            grid-template-rows: repeat(3, 1fr);
          }
        }
      }
    }
  }
}
</style>
