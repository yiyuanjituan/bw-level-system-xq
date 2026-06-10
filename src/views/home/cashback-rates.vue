<script lang="ts" setup>
import UiLoading from '@/components/UI/loading.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { handleBack } from '@/utils/common';
import { service } from '@/api/service';

const route = useRoute();

const activeCategory = ref(1);
const activeCodeId = ref<number | string>('');
const currentLevel = ref(0);
const detailList = ref<any[]>([]);
const isPageLoading = ref(true);
const typeOptions: any[] = [
  { label: '真人', value: 1 },
  { label: '捕鱼', value: 2 },
  { label: '电子', value: 3 },
  { label: '彩票', value: 4 },
  { label: '体育', value: 5 },
  { label: '棋牌', value: 6 },
  { label: '电竞', value: 7 }
];
const codeOptions = ref<any[]>([]);

function getTypeLabel(type: number) {
  return typeOptions.find(item => item.value === type)?.label;
}

async function loadDetail(gameCategory: number, gameSecondCateId: number | string) {
  isPageLoading.value = true;
  const res = await service.v1.user.getCashBackDetail({ gameCategory, gameSecondCateId });

  if (!res.activeId) {
    handleBack();
    return;
  }

  activeCategory.value = gameCategory;
  activeCodeId.value = res.activeId;
  currentLevel.value = res.level;
  codeOptions.value = res.options;
  detailList.value = res.list;
  isPageLoading.value = false;
}

async function init() {
  if (!route.query.gameCategory || !route.query.gameSecondCateId) {
    handleBack();
    return;
  }

  await loadDetail(Number(route.query.gameCategory), Number(route.query.gameSecondCateId));
}

async function handleCategoryChange(value: number | string) {
  await loadDetail(Number(value), activeCodeId.value);
}

async function handleCodeChange(value: number | string) {
  await loadDetail(activeCategory.value, value);
}

onMounted(() => init());
</script>

<template>
  <div class="cashback-rates-page">
    <sub-navbar title="返水比例" />

    <div class="body-box">
      <div class="search-header">
        <div class="thead-item">
          <div class="thead-cell">
            <x-select
              v-model="activeCategory"
              :options="typeOptions"
              value-key="value"
              fit-option-width
              @change="handleCategoryChange"
            />
          </div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">
            <x-select
              v-model="activeCodeId"
              :options="codeOptions"
              value-key="value"
              fit-option-width
              @change="handleCodeChange"
            />
          </div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">VIP等级</div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">返水比例</div>
        </div>
      </div>

      <div class="loading-box" v-if="isPageLoading">
        <ui-loading />
      </div>

      <div class="scroll-box" v-else>
        <div class="cell" v-for="item in detailList" :key="item.id">
          <div class="thead-item"><span>{{ getTypeLabel(item.type) }}</span></div>
          <div class="thead-item"><span>{{ item.apiCode }}</span></div>
          <div class="thead-item"><span>VIP{{ item.level }}</span></div>
          <div class="thead-item"><span>{{ item.scale }}%</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cashback-rates-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  .body-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0 10px;

    .search-header {
      height: 45px;
      width: 100%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      background-color: var(--skin__bg_1);
      min-height: 40px;
      text-align: center;
      border-radius: 5px;

      :deep(.x-select__placeholder) {
        font-size: 10px;
      }
    }

    .loading-box {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scroll-box {
      flex: 1;
      min-height: 0;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;

      .cell {
        min-height: 35px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        text-align: center;
        font-size: 10px;
        width: 100%;
        line-height: 1.5;

        &:nth-child(odd) {
          background-color: var(--skin__bg_2);
        }

        .thead-item {
          font-size: 10px !important;
          color: var(--skin__neutral_1) !important;

          &:first-child {
            padding-left: 5px;
          }
        }
      }
    }

    .thead-item {
      width: calc(355px / 4);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      font-size: 12px;
      color: var(--skin__lead);
      line-height: 15px;
      word-break: break-word;

      &:first-child {
        padding-left: 0;
      }

      .thead-cell {
        display: flex;
        align-items: center;
        text-align: center;
        color: var(--skin__lead);
        overflow: visible;
        word-break: break-word;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;

        :deep(.x-select) {
          width: 80px;
          height: 25px;
          border-radius: 9999rem;
        }

        :deep(.x-select__label) {
          color: var(--skin__neutral_2, var(--skin__lead));
        }
      }
    }
  }
}
</style>
