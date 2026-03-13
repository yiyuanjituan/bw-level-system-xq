import { defineStore } from 'pinia'
import { ref } from "vue";

export const useHomeDataStore = defineStore('home', () => {
  const banner = ref<any>({})
  const classify = ref<any>({})
  const suggestList = ref<any>({})
  const venueList = ref<any[]>([])

  const setBanner = (value: any) => {
    banner.value = value
  }

  const setClassify = (value: any) => {
    classify.value = value
  }

  const setSuggestData = (value: any) => {
    suggestList.value = value
  }
  const setVenueList = (value: any[]) => {
    let list = [];
    value.forEach((item: any) => {
      let img = item.img
      if (!item.img) {
        if (item.type == 1) img = `./siteadmin/skin/lobby_asset/icon_dtfl_zr_1.avif`
        if (item.type == 2) img = `./siteadmin/skin/lobby_asset/icon_dtfl_by_1.avif`
        if (item.type == 3) img = `./siteadmin/skin/lobby_asset/icon_dtfl_dz_1.avif`
        if (item.type == 4) img = `./siteadmin/skin/lobby_asset/icon_dtfl_cp_1.avif`
        if (item.type == 5) img = `./siteadmin/skin/lobby_asset/icon_dtfl_ty_1.avif`
        if (item.type == 6) img = `./siteadmin/skin/lobby_asset/icon_dtfl_qp_1.avif`
        if (item.type == 7) img = `./siteadmin/skin/lobby_asset/icon_dtfl_dianjing_1.avif`
      }
      list.push({
        ...item,
        img: img
      })
    })
    venueList.value = list
  }

  return {
    banner,
    classify,
    suggestList,
    venueList,
    setBanner,
    setClassify,
    setSuggestData,
    setVenueList,
  }
}, {
  persist: true,
})

export default useHomeDataStore
