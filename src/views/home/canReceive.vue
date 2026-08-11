<script setup lang="ts">
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import UiEmpty from "@/components/UI/empty.vue";
import UiLoading from "@/components/UI/loading.vue";
import {
  getCanReceiveList,
  type CanReceiveItem,
  type CanReceiveSource
} from "@/api/common";
import router from "@/router";
import { formatMoney } from "@/utils/common";

const rewardList = ref<CanReceiveItem[]>([]);
const isLoading = ref(false);

const sourceRouteMap: Record<CanReceiveSource, string> = {
  2: "/home/event",
  3: "/home/task",
  4: "/home/vip",
  5: "/home/cashback",
  6: "/home/yuebao"
};

async function loadData() {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const response = await getCanReceiveList();
    rewardList.value = Array.isArray(response?.list) ? response.list : [];
  } catch {
    rewardList.value = [];
  } finally {
    isLoading.value = false;
  }
}

function handleGo(source: CanReceiveSource) {
  router.push(sourceRouteMap[source]);
}

function formatTime(value?: string | null) {
  if (!value || !dayjs(value).isValid()) return "";
  return dayjs(value).format("YYYY/MM/DD HH:mm");
}

onMounted(() => loadData());
</script>

<template>
  <div class="can-receive">
    <div class="wallet-box">
      <my-wallet />
    </div>
    <div class="content-box">
      <div class="list-box">
        <ui-loading v-if="isLoading" />
        <ui-empty v-else-if="rewardList.length === 0" text="" />
        <div v-for="reward in rewardList" :key="reward.key" class="item-box">
          <div class="item-info">
            <div class="name">{{ reward.name }}</div>
            <div class="rewards">
              <div v-if="reward.vitality > 0" class="rewards-item">
                <svg-icon name="comm_icon_shy" class-name="text-[12px]"></svg-icon>
                <span class="category-text">{{ reward.vitality }}</span>
              </div>
              <div v-if="reward.money > 0" class="rewards-item">
                <img src="/siteadmin/active/rmb.svg" alt="." class="w-[12px]" />
                <span class="category-text mt-[1.7px] ml-[2px]" style="color: var(--skin__accent_3);">
                  {{ formatMoney(reward.money) }}
                </span>
              </div>
            </div>
          </div>
          <div class="item-sub">
            <div class="source">
              <span v-if="formatTime(reward.createTime)" class="time">{{ formatTime(reward.createTime) }}</span>
              <span class="template">
                <span class="activeTypeName">来源:</span>
                <span class="source-text">{{ reward.sourceName }}</span>
              </span>
            </div>
            <div class="receive-btn-box">
              <x-button size="small" type="primary" @click="handleGo(reward.source)">前 往</x-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.can-receive {
  display: flex;
  flex-direction: column;
  .wallet-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 13px;
    :deep(.currency-count) {
      font-size: 13px !important;
    }
  }
  .content-box {
    flex: 1;
    height: 0;
    overflow: auto;
    .list-box {
      min-height: calc(var(--window-height) - 148px);
      padding: 0 10px 10px;
      .item-box {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: space-between;
        min-height: 71.5px;
        padding: 10px;
        border-radius: 7px;
        background-color: var(--skin__bg_2);
        color: var(--skin__neutral_2);
        margin-top: 10px;
        box-shadow: 0 1.5px 4.5px 0 var(--skin__web_left_bg_shadow);
        &:first-child {
          margin-top: 0;
        }
        .item-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: var(--skin__neutral_2);
          font-size: 12px;
          .name {
            line-height: 20px;
            max-height: 40px;
            max-width: 225px;
            color: var(--skin__lead);
            font-size: 12px;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 5px;
            unicode-bidi: plaintext;
            flex-shrink: 0;
          }
          .rewards {
            display: inline-block;
            text-align: right;
            margin-bottom: 5px;
            min-width: 75px;
            max-width: 180px;
            .rewards-item {
              color: var(--skin__accent_1);
              margin: 0 7px;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.67;
              letter-spacing: normal;
              text-align: right;
              display: inline-flex;
              align-items: center;
              .category-text {
                max-width: 97.5px;
                font-weight: 700;
                font-size: 12px;
                margin-left: 2px;
              }
            }
          }
        }
        .item-sub {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          .source {
            display: flex;
            font-size: 10px;
            line-height: 1.6;
            .time {
              color: var(--skin__neutral_2);
              white-space: nowrap;
              margin-right: 7px;
            }
            .template {
              max-width: 140px;
              display: inline-flex;
              align-items: center;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              .activeTypeName {
                margin-right: 2.5px;
                color: var(--skin__lead);
              }
              .source-text {
                cursor: pointer;
                color: var(--skin__primary);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
          }
          .receive-btn-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 30px;
            :deep(.x-button) {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 75px;
              height: 30px;
              line-height: normal
            }
            :deep(.x-button__text) {
              font-size: 11px;
              margin-bottom: 2px;
            }
          }
        }
      }
    }
  }
}
</style>
