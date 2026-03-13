<script setup lang="ts">
import { ref } from "vue";
import { showCustomDialog, showCustomToast } from "@/hooks/useCommon";
import useAuthStore from "@/store/modules/user";
import router from "@/router";
import { bus } from "@/utils/mitt";

defineOptions({
  name: "MineGrid"
});

const list = ref([
  {
    key: "forget",
    icon_1: "style_2_icon_list_zhye",
    icon_2: "style_2_icon_list_zhye2",
    name: "找回余额",
    url: ""
  },
  {
    key: "zhmx",
    icon_1: "style_2_icon_list_zhmx",
    icon_2: "style_2_icon_list_zhmx2",
    name: "账户明细",
    url: "账户明细"
  },
  {
    key: "tzjl",
    icon_1: "style_2_icon_list_tzjl",
    icon_2: "style_2_icon_list_tzjl2",
    name: "投注记录",
    url: "账户明细"
  },
  {
    key: "txgl",
    icon_1: "style_2_icon_list_txgl",
    icon_2: "style_2_icon_list_txgl2",
    name: "提现管理",
    url: "账户明细"
  },
  {
    key: "grbb",
    icon_1: "style_2_icon_list_grbb",
    icon_2: "style_2_icon_list_grbb2",
    name: "个人报表",
    url: "账户明细"
  },
  {
    key: "vip",
    icon_1: "style_2_icon_list_vip",
    icon_2: "style_2_icon_list_vip2",
    name: "VIP中心",
    url: "账户明细"
  },
  {
    key: "aqzx",
    icon_1: "style_2_icon_list_aqzx",
    icon_2: "style_2_icon_list_aqzx2",
    name: "安全中心",
    url: "账户明细"
  },
  {
    key: "zdwm",
    icon_1: "style_2_icon_list_zdwm",
    icon_2: "style_2_icon_list_zdwm2",
    name: "找到我们",
    url: "账户明细"
  },
  {
    key: "fxzq",
    icon_1: "style_2_icon_list_fxzq",
    icon_2: "style_2_icon_list_fxzq2",
    name: "分享赚钱",
    url: "账户明细"
  },
  {
    key: "pyq",
    icon_1: "style_2_icon_list_pyq",
    icon_2: "style_2_icon_list_pyq2",
    name: "发现",
    url: "账户明细"
  },
  {
    key: "cjwt",
    icon_1: "style_2_icon_list_cjwt",
    icon_2: "style_2_icon_list_cjwt2",
    name: "常见问题",
    url: "账户明细"
  },
  {
    key: "yjfk",
    icon_1: "style_2_icon_list_yjfk",
    icon_2: "style_2_icon_list_yjfk2",
    name: "有奖反馈",
    url: "账户明细"
  },
  {
    key: "dlsb",
    icon_1: "style_2_icon_list_dlsb",
    icon_2: "style_2_icon_list_dlsb2",
    name: "登录设备",
    url: "账户明细"
  },
  {
    key: "aqtc",
    icon_1: "style_2_icon_list_aqtc",
    icon_2: "style_2_icon_list_aqtc2",
    name: "安全退出",
    url: "账户明细"
  },
]);
const auth = useAuthStore()

function safeLogOut() {
  const options = {
    title: '温馨提示',
    message: '是否退出当前账号?',
    showCancelButton: true,
    confirmButtonText: '确认退出',
    cancelButtonText: '我点错了',
    width: 300
  }

  showCustomDialog(options).then((result) => {
    if (result) {
      auth.logout()
      showCustomToast({ type: 'success', message: "退出成功" })
      setTimeout(() => {
        router.replace('/')
      }, 500)
    }
  })
}

const onTapItem = (item: any) => {
  if (item.key === 'aqtc') return safeLogOut()
  if (item.key === 'zdwm') return bus.emit('findUs')
}
</script>

<template>
  <div class="grid-box">
    <div class="grid-row">
      <div
        class="grid-item-box"
        v-for="(i, idx) in list"
        :key="i.key"
        @click="onTapItem(i)"
      >
        <div class="icon-box">
          <svg-icon :name="i.icon_1" class="svg-icon text-[#68707B]" />
          <svg-icon :name="i.icon_2" class="svg-icon text-[#F0C059]" />
        </div>
        <div class="item-text">{{ i.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.grid-box {
  padding: 0 10px 10px;

  .grid-row {
    padding: 20px 10px 10px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 7px;
    background-color: #1c1e23;
    border-radius: 7px;
    box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
    .grid-item-box {
      color: #adb6c3;
      position: relative;
      flex-direction: column;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon-box {
        position: relative;
        width: 20px;
        height: 20px;
        .svg-icon {
          position: absolute;
          font-size: 20px;
        }
      }
      .item-text {
        line-height: 15px;
        height: 30px;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        font-size: 12px;
        margin-top: 5px;
      }
    }
  }
}
</style>
