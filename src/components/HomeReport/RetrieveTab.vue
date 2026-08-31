<script setup lang="ts">
import { $t } from "@/locales";
import { computed, onMounted, ref, watch } from "vue";
import { service } from "@/api/service";
import UiEmpty from "@/components/UI/empty.vue";
import { showCustomToast } from "@/hooks/useCommon";
import router from "@/router";

const props = defineProps<{ currentBalance: number; walletIsLoading: boolean }>();
const emit = defineEmits<{ (event: "refresh-balance"): void }>();
const tabsActive = ref("all");
const keyword = ref("");
const typeOptions: any[] = [
  { label: "全部", value: "all", image: "event_zh" },
  { label: "真人", value: 1, image: "game-icon_dtfl_zr_0" },
  { label: "捕鱼", value: 2, image: "game-icon_dtfl_by_0" },
  { label: "电子", value: 3, image: "game-icon_dtfl_dz_0" },
  { label: "彩票", value: 4, image: "game-icon_dtfl_cp_0" },
  { label: "体育", value: 5, image: "game-icon_dtfl_ty_0" },
  { label: "棋牌", value: 6, image: "game-icon_dtfl_qp_0" },
  { label: "电竞", value: 7, image: "game-icon_dtfl_dianjing_0" }
];
const totalList = ref<any[]>([]);

function normalizeValue(value: unknown) {
  return String(value ?? "");
}

function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

const filteredList = computed(() => {
  const activeType = normalizeValue(tabsActive.value);
  const searchKeyword = normalizeSearchText(keyword.value);

  return totalList.value.filter(item => {
    if (activeType !== "all" && normalizeValue(item?.type) !== activeType) {
      return false;
    }

    if (!searchKeyword) {
      return true;
    }

    const searchSource = [item?.apiCode, item?.name, item?.title].map(normalizeSearchText).join(" ");

    return searchSource.includes(searchKeyword);
  });
});

watch(tabsActive, value => {
  if (normalizeValue(value) !== "all") {
    keyword.value = "";
  }
});

function formatMoney(value: number) {
  return value.toFixed(2);
}

function jumpToService() {
  router.push("/home/notice");
}

function totalMoneyBack() {
  service.v1.user.totalMoneyIn({}).then(() => showCustomToast({ type: "success", message: $t("已回归余额") }));
}

onMounted(() => {
  service.v1.user.thirdWallet({}).then(res => {
    totalList.value = res;
  });
});
</script>

<template>
  <div class="retrieve-tab">
    <section class="balance-card">
      <div class="balance-card__top">
        <div class="balance-card__info">
          <span class="balance-card__label">当前余额</span>
          <span class="balance-card__amount">{{ formatMoney(props.currentBalance) }}</span>
          <svg-icon
            name="comm_icon_retry"
            class-name="balance-card__refresh"
            :class="{ animate__spin: props.walletIsLoading }"
            @click="emit('refresh-balance')"
          />
        </div>
        <x-button size="small" @click="totalMoneyBack">一键找回</x-button>
      </div>
      <div class="balance-card__tip">
        <span>只能找回余额的整数部分(即不含小数点)，若仍无法自助找回，请</span>
        <span class="balance-card__link" @click="jumpToService">联系客服</span>
      </div>
    </section>
    <div class="flex-context-tab flex-1 pt-[10px] pl-[10px] pb-[10px] flex flex-col">
      <x-tabs shrink position="left" type="card" class="flex-1" v-model="tabsActive">
        <x-tab :name="item.value" v-for="(item, index) in typeOptions" :key="index">
          <template #title>
            <div class="custom-row-tab" :class="{ 'custom-row-tab_active': tabsActive == item.value }">
              <span class="slider-icon-box"><svg-icon :name="item.image" /></span>
              <div class="sidebar-common-tab-name">{{ item.label.split("").join("&nbsp;") }}</div>
            </div>
          </template>
          <div class="wallet-search" v-if="item.value == 'all'">
            <x-input v-model="keyword" :placeholder="$t('平台搜索')">
              <template #suffix>
                <svg-icon name="comm_icon_ss" color="var(--skin__primary)"></svg-icon>
              </template>
            </x-input>
          </div>
          <div class="main-layout" v-if="filteredList.length > 0">
            <div class="item" v-for="item in filteredList" :key="item.id">
              <div class="item-wrap">
                <img :src="item.short_image" alt="" class="w-[20px] h-[20px] mr-[10px]" />
                <div class="up">{{ item.apiCode }}</div>
              </div>
              <div class="down">
                <span class="notranslate" v-if="item.balance <= 0">{{ formatMoney(item.balance) }}</span>
                <span class="hasMoney" v-if="item.balance > 0">{{ formatMoney(item.balance) }}</span>
              </div>
            </div>
          </div>
          <ui-empty v-if="filteredList.length == 0" :text="$t('暂无数据')" />
        </x-tab>
      </x-tabs>
    </div>
  </div>
</template>

<style scoped lang="less">
.retrieve-tab {
  height: 100%;
  display: flex;
  flex-direction: column;

  .balance-card {
    margin: 10px 10px 0;
    padding: 10px;
    background: var(--skin__bg_2);
    border-radius: 5px;
    box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.16);

    &__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    &__info {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    &__label {
      color: var(--skin__neutral_2, var(--skin__lead));
      font-size: 12px;
      white-space: nowrap;
    }

    &__amount {
      margin: 0 5px;
      color: var(--skin__primary);
      font-size: 12px;
      line-height: 1;
    }

    &__refresh {
      color: var(--skin__primary);
      font-size: 13px;
    }

    &__action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--skin__primary);
      font-size: 12px;
      white-space: nowrap;
    }

    &__tip {
      margin-top: 5px;
      color: #6f6f6f;
      font-size: 11px;
      line-height: 1.35;
    }

    &__link {
      color: var(--skin__primary);
    }
  }

  .flex-context-tab {
    min-height: 0;
    :deep(.x-tabs) {
      min-height: 0;
    }
    :deep(.x-tabs__nav) {
      border: none !important;
      border-radius: 0 !important;
      padding-right: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    :deep(.x-tab) {
      padding: 0 !important;
      border: none !important;
      background-color: transparent !important;
    }
    .custom-row-tab {
      display: flex;
      align-items: center;
      border-radius: 7px;
      overflow: hidden;
      width: 75px;
      height: 35px;
      padding: 0 3px 0 1.5px;
      color: var(--skin__left_nav_def);
      background: var(--skin__bg_2);
      border: 1px solid var(--skin__border);
      box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
      word-break: break-all;
      .slider-icon-box {
        width: 24px;
        height: 18px;
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        z-index: 6;
      }
      .sidebar-common-tab-name {
        width: 100%;
        margin: 0 auto;
        align-items: center;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 16px;
        font-size: 12px;
        text-align: center;
      }
    }
    .custom-row-tab_active {
      color: var(--skin__text_primary);
      background: var(--skin__primary);
      border-color: var(--skin__primary);
    }

    :deep(.x-tabs__content) {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    :deep(.x-tab__panel) {
      overflow: hidden;
      flex: 1;
      height: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .wallet-search {
      margin-bottom: 10px;
      padding-right: 10px;
      :deep(.x-input-wrapper) {
        height: 25px;
        color: var(--skin__neutral_2);
        border-radius: 9999px;
        cursor: pointer;
      }
    }
    .main-layout {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      align-content: start;
      scrollbar-color: var(--skin__border) transparent;
      scrollbar-width: thin;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 0 10px 10px 0;

      .item {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        height: 55px;
        background-color: var(--skin__bg_2);
        font-size: 10px;
        border-radius: 7px;
        box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
        .item-wrap {
          display: flex;
          align-items: center;
          height: 30px;
          padding: 5px 6.5px;
          border-bottom: var(--lobby__px) solid var(--skin__border);
          .up {
            overflow: hidden;
            color: var(--skin__lead);
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .down {
          height: 25px;
          padding: 5px 10px;
          color: var(--skin__neutral_2);
        }
        .hasMoney {
          color: var(--skin__accent_3);
        }
      }
    }
  }

  .content-area {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 42px;
    color: #9aa0ad;

    &__graphic {
      position: relative;
      width: 116px;
      height: 116px;
      margin-bottom: 18px;
    }

    &__disc {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.95),
        rgba(238, 240, 245, 0.82) 58%,
        rgba(226, 229, 236, 0.95)
      );
    }

    &__box {
      position: absolute;
      width: 36px;
      height: 24px;
      background: linear-gradient(180deg, #fefefe 0%, #dde2eb 100%);
      border-radius: 4px;
      box-shadow: 0 8px 14px rgba(136, 145, 165, 0.16);

      &::before {
        content: "";
        position: absolute;
        left: 4px;
        right: 4px;
        top: -7px;
        height: 10px;
        background: linear-gradient(180deg, #eef2f8 0%, #d6dce7 100%);
        clip-path: polygon(0 100%, 50% 0, 100% 100%);
      }

      &--top {
        left: 40px;
        top: 30px;
        transform: rotate(8deg);
      }

      &--left {
        left: 22px;
        top: 46px;
        transform: rotate(-20deg);
      }

      &--right {
        right: 20px;
        top: 46px;
        transform: rotate(22deg);
      }
    }

    &__text {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #9aa0ad;
      font-size: 13px;
    }

    &__refresh {
      color: #6165ff;
      font-size: 13px;
    }
  }
}
</style>
