<script setup lang="ts">
import { computed, ref, watch } from "vue";
import UiInput from "@/components/UI/input.vue";
import UiButton from "@/components/Common/Button.vue";

interface Props {
  listData?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  listData: () => ([])
});
const showTotalWallet = ref(true)
const showTotalChildren = ref(true)
const isLoading = ref(false)
const activeIds = ref<number[]>([0, 0]) // 大分类ID， 渠道ID
const inputAmount = ref<number>()

function handleChangeActiveId(record: Record<string, any>) {
  activeIds.value[0] = record.id;
  activeIds.value[1] = 0;
  inputAmount.value = void 0
}

function handleChangeActiveChildrenId(record: Record<string, any>) {
  activeIds.value[1] = record.id;
  inputAmount.value = void 0
}

function handleSubmit() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

watch(() => props.listData, () => {
  if (activeIds.value[0] == 0 && props.listData.length) {
    activeIds.value[0] = props.listData[0].id
  }
})

const activeGroup = computed(() => {
  if (!props.listData.length) return {}
  if (activeIds.value[0] == 0) activeIds.value[0] = props.listData[0].id
  const info = props.listData.find(v => v.id == activeIds.value[0])
  return info ?? {}
})
const activeInfo = computed(() => {
  const info = activeGroup.value
  if (activeIds.value[1] == 0 && info?.children?.length > 0) activeIds.value[1] = info.children[0].id
  const childrenData = info?.children?.find(v => v.id == activeIds.value[1])
  return childrenData ?? {}
})

</script>

<template>
  <div class="body-content">
    <div class="grid-box">
      <template v-for="(item, index) in listData" :key="index">
        <recharge-badge class="item" :class="{ 'active-item': activeIds[0] == item.id }" :content="item.tip" @click="handleChangeActiveId(item)" v-if="showTotalWallet || (!showTotalWallet && index < 6)">
          <div class="app-icon">
            <van-image width="100%" height="100%" :src="item.image">
              <template v-slot:error>.</template>
            </van-image>
          </div>
          <div class="label-container">
            <span class="label">{{ item.name }}</span>
          </div>
        </recharge-badge>
      </template>
    </div>
    <div class="download-app" v-if="(activeGroup?.download_tip && activeGroup?.wallet_url) && (!activeInfo?.id || !(activeInfo?.download_tip && activeInfo?.wallet_url))">
      <span class="inline-flex items-center text-[11px]">
        <svg-icon name="comm_icon_xz" class-name="text-[9px] mr-[5px]" />
        {{ activeGroup.download_tip }}
      </span>
    </div>
    <div class="fold" v-if="listData.length > 6">
      <span class="btn" @click="showTotalWallet = !showTotalWallet">
        <span class="text">{{ showTotalWallet ? '展开' : '收起'}}</span>
        <span class="arrow" :class="{ 'arrow-show': showTotalWallet }"></span>
      </span>
    </div>
    <div class="line" style="border-width: var(--lobby__px);"></div>
    <template v-if="activeGroup?.children?.filter(v => v.frontShow).length > 0">
      <div class="grid-box">
        <template v-for="(item, index) in activeGroup?.children" :key="index">
          <recharge-badge class="item" :class="{ 'active-item': activeIds[1] == item.id }" :content="item.tip" @click="handleChangeActiveChildrenId(item)" v-if="showTotalChildren || (!showTotalChildren && index < 6)">
            <div class="label-container">
              <span class="label">{{ item.name }}</span>
            </div>
          </recharge-badge>
        </template>
      </div>
      <div class="download-app" v-if="(activeInfo?.download_tip && activeInfo?.wallet_url)">
        <span class="inline-flex items-center text-[11px]">
          <svg-icon name="comm_icon_xz" class-name="text-[9px] mr-[5px]" />
          {{ activeInfo.download_tip }}
        </span>
      </div>
      <div class="fold" v-if="activeGroup?.children?.length > 6">
        <span class="btn" @click="showTotalChildren = !showTotalChildren">
          <span class="text">{{ showTotalChildren ? '展开' : '收起'}}</span>
          <span class="arrow" :class="{ 'arrow-show': showTotalChildren }"></span>
        </span>
      </div>
      <div class="line" style="border-width: var(--lobby__px);"></div>
    </template>
    <template v-if="activeInfo.siteWallet == 0">
      <div class="title-box">
        <span>存款金额</span>
        <div class="no-poster" v-html="activeGroup.tipRichText"></div>
      </div>
      <div class="grid-box quickly-list">
        <template v-for="(item, index) in activeInfo.quickList" :key="index">
          <recharge-badge class="item bg-[#000]" :class="{ 'active-item': inputAmount == item }" @click="inputAmount = Number(item)">
            <div class="label-container">
              <span class="label">{{ item }}</span>
            </div>
          </recharge-badge>
        </template>
      </div>
      <div class="form-input-box">
        <div class="input-box">
          <ui-input v-model="inputAmount" class="input-input" :placeholder="`最低${activeInfo.min ?? 0} ~ 最高${activeInfo.min ?? 0}`">
            <template #prefix><span class="text-[white]">￥</span></template>
          </ui-input>
        </div>
      </div>
      <ui-button @click="handleSubmit" class="button" type="primary" :loading="isLoading">立即存款</ui-button>
    </template>
    <template v-if="activeInfo.siteWallet == 1 && activeInfo.siteWalletKeyword == 'wallet-no'">
      <div class="bind-container">
        <div class="bindTips"><p>已有账号，可登录绑定</p><p>首次使用？只需设置支付密码</p></div>
        <div class="content">
          <div class="bind">
            <ui-button type="info" plain>立即绑定</ui-button>
          </div>
          <div class="setting">
            <ui-button type="primary">立即设置</ui-button>
          </div>
        </div>
        <div class="no-poster"><span class=""><p><span style="font-family: 'Segoe UI';">用NO钱包：赚积分，抽大奖，最高<span style="color: #e67e23;">88888.88</span></span></p></span></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
.body-content {
  padding: 18px 10px 0;
  height: 100%;
  overflow-y: scroll;
}
.grid-box {
  display: grid;
  gap: 11px;
  grid-template-columns: repeat(3, 1fr);
  .item {
    display: inline-flex;
    align-items: center;
    flex: 1;
    height: 37px;
    border: thin solid var(--skin__border);
    border-radius: 5px;
    position: relative;
    .app-icon {
      margin-right: 5px;
      margin-left: 5px;
      height: 27px;
      width: 27px;
    }
    .label-container {
      flex: 1;
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-direction: column;
      margin-right: 5px;
      .label {
        text-align: center;
        word-break: break-all;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }
  .active-item {
    border-color: var(--skin__filter_active);
    color: var(--skin__primary);
  }
}
.line {
  width: 100%;
  border-bottom: solid var(--skin__border);
  border-color: var(--skin__border) !important;
  margin-bottom: 10px;
  margin-top: 10px;
}
.download-app {
  margin: 10px 0 5px;
  color: var(--skin__primary);
}
.fold {
  text-align: center;
  color: var(--skin__primary);
  display: flex;
  justify-content: center;
  font-size: 12px;
  margin-top: 2.5px;
  .btn {
    display: flex;
    align-items: baseline;
    justify-content: center;
    .text {
      margin-right: 8px;
    }
    .arrow {
      display: inline-block;
      border-right: 2px solid var(--skin__primary);
      border-top: 2px solid var(--skin__primary);
      height: 8px;
      width: 8px;
      transform: rotate(-45deg) translateY(3px);
    }
    .arrow-show {
      transform: rotate(135deg) translateY(3px);
    }
  }
}
.title-box {
  display: flex;
  justify-content: space-between;
  position: relative;
  color: var(--skin__lead);
  margin-bottom: 10px;
  .no-poster {
    text-align: right;
    color: var(--skin__neutral_2);
    flex: 1;
    margin-left: 10px;
    font-size: 11px !important;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.quickly-list {
  margin-bottom: 10px;
  .item {
    border-color: transparent;
    font-weight: 700;
    font-size: 13px;
  }
}

.form-input-box {
  width: 355px;
  display: flex;
  flex-direction: column;
  position: relative;
  .input-box {
    margin-bottom: 5px;
    .input-input {
    }
    :deep(.ui-input--focused) {
      border-color: var(--skin__neutral_3) !important;
    }
  }
}
.button {
  --ui-button-text-color: white !important;
  --ui-button-border-color: transparent !important;
  width: 100%;
  margin-top: 10px;
  height: 35px;
}
.bind-container {
  text-align: center;
  .bindTips {
    display: flex;
    padding-bottom: 5px;

    p {
      font-size: 11px;
      color: var(--skin__neutral_2);
      flex: 1;
      text-align: center;
      margin: 0 5px;
    }
  }
  .content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .bind {
      margin-right: 5px;
      flex: 1;
      button {
        width: 100%;
        color: var(--skin__primary);
      }
    }
    .setting {
      margin-left: 5px;
      flex: 1;
      button {
        width: 100%;
        color: var(--skin__text_primary);
        border-color: transparent !important;
      }
    }
  }
  .no-poster {
    color: var(--skin__lead);
    flex: 1;
    margin-left: 10px;
    text-align: center;
    font-size: 12px !important;
  }
}
</style>
