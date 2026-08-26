import { service } from "@/api/service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import hotIcon from "@/assets/home/icon_dtfl_rm_1.avif";
import liveIcon from "@/assets/home/icon_dtfl_zr_1.avif";
import fishingIcon from "@/assets/home/icon_dtfl_by_1.avif";
import slotIcon from "@/assets/home/icon_dtfl_dz_1.avif";
import lotteryIcon from "@/assets/home/icon_dtfl_cp_1.avif";
import sportIcon from "@/assets/home/icon_dtfl_ty_1.avif";
import pokerIcon from "@/assets/home/icon_dtfl_qp_1.avif";
import esportIcon from "@/assets/home/icon_dtfl_dianjing_1.avif";

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

const defaultClassifyIconMap: Record<number, string> = {
  0: hotIcon,
  1: liveIcon,
  2: fishingIcon,
  3: slotIcon,
  4: lotteryIcon,
  5: sportIcon,
  6: pokerIcon,
  7: esportIcon
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
  const suggestList = ref<any[]>([])
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
    suggestList.value = Array.isArray(value) ? value : []
  }
  const setVenueList = (value: any[]) => {
    const sourceList = Array.isArray(value) ? value : []

    venueList.value = sourceList.map((item: any) => {
      const type = Number(item?.type);
      const img = item?.img || item?.select_icon || item?.icon || defaultClassifyIconMap[type] || "";

      return {
        ...item,
        img: img
      }
    })
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
