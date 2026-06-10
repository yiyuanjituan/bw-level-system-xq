<script lang="ts" setup>
import UiLoading from '@/components/UI/loading.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { handleBack } from '@/utils/common';
import { service } from '@/api/service';

const route = useRoute();

const activeCategory = ref(1);
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
const codeOptions = ref<any>([])

function init() {
  if (!route.query.gameCategory || !route.query.gameSecondCateId) {
    handleBack();
  }
  const { gameCategory, gameSecondCateId } = route.query;
  activeCategory.value = Number(gameCategory);
  service.v1.user
    .getCashBackDetail({ gameCategory, gameSecondCateId })
    .finally(() => (isPageLoading.value = false))
    .then(res => {
      console.log(res);
    });
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
            <x-select :options="typeOptions" value-key="value" fit-option-width v-model="activeCategory" />
          </div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">
            <x-select :options="typeOptions" value-key="value" fit-option-width />
          </div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">VIP等级</div>
        </div>
        <div class="thead-item">
          <div class="thead-cell">返水比例</div>
        </div>
      </div>
      <div class="flex-1 flex items-center justify-center">
        <ui-loading />
      </div>
      <div class="scroll-box" v-if="false">
        <div class="cell" v-for="i in 20" :key="i">
          <div class="thead-item"><span>捕 鱼</span></div>
          <div class="thead-item"><span>JDB</span></div>
          <div class="thead-item"><span>VIP0</span></div>
          <div class="thead-item"><span>0.40%</span></div>
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
    align-items: center;
    justify-content: center;

    .search-header {
      height: 45px;
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
    .scroll-box {
      flex: 1;
      min-height: 0;
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
