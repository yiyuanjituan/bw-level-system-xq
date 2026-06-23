import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getWithdrawInfo } from '@/api/common';

export const useWithdrawStore = defineStore(
  'withdraw',
  () => {
    const withdrawInfo = ref<any>({});
    const userCardList = computed<any[]>(() => withdrawInfo.value?.cardList ?? []);

    const setWithdrawInfo = (data: any = {}) => {
      withdrawInfo.value = data ?? {};
    };

    const updateWithdrawInfo = async () => {
      const data = await getWithdrawInfo();
      setWithdrawInfo(data);
      return data;
    };

    return {
      withdrawInfo,
      userCardList,
      setWithdrawInfo,
      updateWithdrawInfo
    };
  },
  {
    persist: true
  }
);

export default useWithdrawStore;
