import { defineStore } from 'pinia'
import { ref } from "vue";

type EnterGameId = string | number | null | undefined;

export const useDataStore = defineStore('data', () => {
  const enterGameInfo = ref<{ venueId: any, gameId: any, os_type?: number }>({ venueId: null, gameId: null });

  const setEnterInfo = (venueId: EnterGameId, gameId: EnterGameId, osType?: number) => {
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
