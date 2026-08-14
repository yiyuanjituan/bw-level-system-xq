import { defineStore } from 'pinia'
import { ref } from "vue";

export const useDataStore = defineStore('data', () => {
  const enterGameInfo = ref<{ venueId: any, gameId: any, os_type?: number }>({ venueId: null, gameId: null });

  const setEnterInfo = (venueId: number, gameId: number, osType?: number) => {
    enterGameInfo.value.venueId = venueId;
    enterGameInfo.value.gameId = gameId;
    if (osType === undefined) {
      delete enterGameInfo.value.os_type;
      return;
    }
    enterGameInfo.value.os_type = osType;
  }

  return {
    enterGameInfo,
    setEnterInfo
  }
})

export default useDataStore
