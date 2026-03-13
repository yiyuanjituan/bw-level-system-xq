import { defineStore } from 'pinia'
import { ref } from "vue";
import { getCommonInfo, getConfig } from "@/api/common";
import { APP_PREFIX_KEY } from "@/utils/site";

export const useAppStore = defineStore('app', () => {
  const appInfo = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_config`)))
  const venueList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_game`)))
  const activityList = ref<any>(JSON.parse(localStorage.getItem(`${APP_PREFIX_KEY}_site_activity`) || '{}'))
  const gameList = ref<{ id: number, children: any[] }[]>([])
  const isShowDownload = ref(true)

  const refreshData = () => {
    getConfig().then((res) => appInfo.value = res)
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
