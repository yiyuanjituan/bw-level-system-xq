<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useWindowSize } from '@vant/use';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { service } from '@/api/service';

dayjs.extend(isoWeek);

const { width: windowWidth } = useWindowSize();
const show = ref(false);
const dialogWidth = computed(() => (345 / 375) * windowWidth.value);
const listData = ref([]);
const activeTab = ref(0);

const showLeftPageArrow = computed(() => listData.value.length > 1 && activeTab.value > 0);
const showRightPageArrow = computed(() => listData.value.length > 1 && activeTab.value < listData.value.length - 1);

function openDialog() {
  if (listData.value.length <= 0) {
    return false;
  }
  show.value = true;
  activeTab.value = 0;
  init();
}

function handleClose() {
  show.value = false;
}
function init() {
  service.open.site.base.popup().then(res => {
    listData.value = res;
  });
}

function changePage(step: -1 | 1) {
  const nextIndex = activeTab.value + step;
  if (nextIndex < 0 || nextIndex >= listData.value.length) return;
  activeTab.value = nextIndex;
}

onMounted(() => init());

watch(
  listData,
  value => {
    if (value.length === 0) {
      activeTab.value = 0;
      return;
    }

    if (activeTab.value > value.length - 1) {
      activeTab.value = 0;
    }
  },
  { deep: true }
);

defineExpose({
  open: openDialog
});
</script>

<template>
  <div class="dialog-box">
    <van-dialog v-model:show="show" :show-cancel-button="false" :width="dialogWidth" destroy-on-close>
      <div class="main-content-container">
        <x-tabs v-model="activeTab" shrink position="bottom" class="main-content-box" animated :show-nav-arrows="false">
          <x-tab v-for="(item, index) in listData" :key="item.id" :name="index">
            <template #title>
              <div class="tab-item">
                <span class="notice-icon">
                  <svg-icon name="icon_message_pmd" />
                </span>
                <div class="tabs-label">
                  <span>{{ item.title }}</span>
                </div>
              </div>
            </template>
            <div class="content">
              <div class="text-box" v-if="item.showMode == 1">
                <div class="overflow-auto flex-1 h-0">
                  <span v-html="item.content"></span>
                </div>
              </div>
              <div v-if="item.showMode == 0" class="w-full h-full">
                <img :src="item.image" alt="" srcset="" class="w-[100%] h-[100%]" />
              </div>
            </div>
          </x-tab>
        </x-tabs>

        <div v-if="showLeftPageArrow" class="page-arrow page-arrow--prev" @click="changePage(-1)">
          <i class="inline-flex items-center justify-center x-arrow x-arrow--left">
            <svg width="1em" height="1em" fill="currentColor">
              <use xlink:href="#comm_icon_fh"></use>
            </svg>
          </i>
        </div>

        <div v-if="showRightPageArrow" class="page-arrow page-arrow--next" @click="changePage(1)">
          <i class="inline-flex items-center justify-center x-arrow x-arrow--right">
            <svg width="1em" height="1em" fill="currentColor">
              <use xlink:href="#comm_icon_fh"></use>
            </svg>
          </i>
        </div>
      </div>
      <template #footer>
        <div class="footer-box">
          <div class="close-icon" @click="handleClose">
            <svg-icon name="close" color="white" />
          </div>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
.dialog-box {
  --van-padding-md: 0px;
}
.main-content-container {
  position: relative;
  padding: 0;
  border-radius: 10px;
  min-height: 206px;
  width: 100%;
  overflow: hidden;
}
.main-content-box {
  width: 100%;
  border-radius: 10px;
  :deep(.x-tab) {
    border-radius: 0 0 7px 7px;
    padding: 0 7.5px;
    max-width: 130px;
    min-width: 86px;
    justify-content: flex-start;
    background-color: var(--skin__bg_2);
    margin-right: 1px;
    box-sizing: border-box;
    color: var(--skin__primary);
  }
  :deep(.x-tab--active) {
    background-color: var(--skin__primary);
    .notice-icon {
      color: var(--skin__lead) !important;
    }
    .tabs-label {
      color: var(--skin__lead) !important;
    }
  }
  :deep(.x-tabs__line) {
    display: none;
  }
  .tab-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    max-width: 100%;
    height: 33px;
    min-width: 0;
    padding: 10px 0;
    box-sizing: border-box;
    color: var(--skin__lead);
    .notice-icon {
      flex: 0 0 auto;
      color: var(--skin__primary);
      font-size: 14px;
      height: 100%;
      align-items: center;
      justify-content: center;
      position: relative;
      display: flex;
      margin-right: 4px;
    }
    .tabs-label {
      height: 100%;
      min-width: 0;
      flex: 1 1 auto;
      font-size: 11px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      line-height: 14px;
      color: var(--skin__primary);
      span {
        width: 100%;
        white-space: normal;
        word-break: break-word;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  :deep(.x-tabs__content) {
    box-sizing: content-box;
    width: 345px;
    user-select: none;
    overflow: hidden;
    flex: none;
  }
  .content {
    width: 100%;
    height: 270px;
    background: var(--skin__bg_2);
    display: flex;
    flex-direction: column;

    .text-box {
      padding: 10px;
      flex: 1;
      height: 0;
      overflow: hidden;
      color: var(--skin__neutral_1);
      position: relative;
      width: 100%;
      font-size: 12px !important;
      line-height: 1.56;
      text-shadow: var(--notice--text-shadow);
      display: flex;
      flex-direction: column;
    }
  }
}

.page-arrow {
  position: absolute;
  top: calc(135px);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  color: #fff;
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;

  &--prev {
    left: 6px;
  }

  &--next {
    right: 6px;
  }

  .x-arrow {
    font-size: 7px;
    line-height: 1;

    &--right {
      transform: rotate(180deg);
    }
  }
}

.footer-box {
  position: relative;
  width: 100%;
  height: 45px;
  font-size: 8px;
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .close-icon {
    color: white;
    font-size: 30px;
  }
}
</style>
