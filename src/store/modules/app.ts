import { defineStore } from 'pinia'
import { ref } from "vue";
import { getCommonInfo, getConfig } from "@/api/common";
import { APP_PREFIX_KEY } from "@/utils/site";

// 站点图标必须写入 HTML head；接口刷新后覆盖已有节点，避免重复添加 link。
const updateFavicon = (iconUrl?: string) => {
  const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    || document.createElement("link");

  iconLink.rel = "icon";
  iconLink.href = iconUrl || "/favicon.ico";

  if (!iconLink.parentElement) {
    document.head.appendChild(iconLink);
  }
};

export const useAppStore = defineStore('app', () => {
  const appInfo = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_config`)))
  const venueList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_game`)))
  const activityList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_activity`) || '{}'))
  const gameList = ref<{ id: number, children: any[] }[]>([])
  const isShowDownload = ref(true)
  updateFavicon(appInfo.value?.favicon)

  const refreshData = () => {
    getConfig().then((res) => {
      appInfo.value = res
      updateFavicon(res?.favicon)
    })
    getCommonInfo().then((res) => venueList.value = res.venueList)
  }

  const updateDownloadBtn = (value: boolean) => {
    isShowDownload.value = value
  }

  const setGameList = (id: number, list: any[]) => {
    // 判断id对应的数据是否存在
    const index = gameList.value.findIndex((item) => item.id === id)
    if (index > -1) {
      gameList.value[index].children = list
    } else {
      gameList.value.push({ id, children: list })
    }
  }

  const updateActivity = (value: any) => {
    activityList.value = value
  }

  return {
    appInfo,
    isShowDownload,
    venueList,
    gameList,
    activityList,
    refreshData,
    updateDownloadBtn,
    setGameList,
    updateActivity
  }
}, {
  persist: true,
})

export default useAppStore
