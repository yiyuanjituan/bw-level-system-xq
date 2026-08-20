import { service } from '@/api/service';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type BannerPosition = 0 | 1;
export type BannerJumpMode = 0 | 1 | 2;

type BannerRecord = {
  id?: number | string;
  position?: number | string;
  image?: string;
  weigh?: number | string;
  jumpMode?: number | string;
  url?: string | null;
};

export type BannerItem = {
  id: number | string;
  position: BannerPosition;
  image: string;
  weigh: number;
  jumpMode: BannerJumpMode;
  url: string;
};

function toFiniteNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeBannerResponse(response: any): BannerRecord[] {
  const source = response?.data ?? response;

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.list)) return source.list;
  if (Array.isArray(source?.rows)) return source.rows;

  return [];
}

function normalizeBannerItem(record: BannerRecord, index: number): BannerItem | null {
  const position = toFiniteNumber(record.position, -1);
  const image = typeof record.image === 'string' ? record.image.trim() : '';

  if ((position !== 0 && position !== 1) || !image) {
    return null;
  }

  const jumpMode = toFiniteNumber(record.jumpMode, 0);

  return {
    id: record.id ?? `${position}-${index}`,
    position,
    image,
    weigh: toFiniteNumber(record.weigh, 0),
    jumpMode: jumpMode === 1 || jumpMode === 2 ? jumpMode : 0,
    url: typeof record.url === 'string' ? record.url.trim() : ''
  };
}

export const useHomeDataStore = defineStore('home', () => {
  const banner = ref<BannerItem[]>([])
  const classify = ref<any>({})
  const suggestList = ref<any>({})
  const venueList = ref<any[]>([])

  const bannerList = computed(() => Array.isArray(banner.value) ? banner.value : []);
  const homeBannerList = computed(() => bannerList.value.filter(item => item.position === 0));
  const mineBannerList = computed(() => bannerList.value.filter(item => item.position === 1));

  const setBanner = (value: BannerItem[]) => {
    banner.value = value
  }

  const loadBanner = async () => {
    try {
      const response = await service.open.v1.home.loadBanner();
      banner.value = normalizeBannerResponse(response)
        .map(normalizeBannerItem)
        .filter((item): item is BannerItem => Boolean(item))
        .sort((prev, next) => next.weigh - prev.weigh);
    } catch (error) {
      // 刷新失败时保留本地缓存，避免首页和个人中心的轮播同时消失。
      console.error('获取全局轮播失败，继续使用本地缓存，失败原因：', error);
    }
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
    homeBannerList,
    mineBannerList,
    classify,
    suggestList,
    venueList,
    setBanner,
    loadBanner,
    setClassify,
    setSuggestData,
    setVenueList,
  }
}, {
  persist: true,
})

export default useHomeDataStore
