import { defineStore } from 'pinia'
import { ref } from "vue";

export const useDataStore = defineStore('data', () => {
  const enterGameInfo = ref<{ venueId: any, gameId: any }>({ venueId: null, gameId: null });

  const setEnterInfo = (venueId: number, gameId: number) => {
    enterGameInfo.value.venueId = venueId;
    enterGameInfo.value.gameId = gameId;
  }

  return {
    enterGameInfo,
    setEnterInfo
  }
})

export default useDataStore
