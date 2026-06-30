import { defineStore } from "pinia";
import { ref } from "vue";
import type { SseMessage } from "@/utils/sse";

export const useFinanceStore = defineStore(
  "finance",
  () => {
    const lastFinanceNotification = ref<SseMessage | null>(null);

    const setLastFinanceNotification = (message: SseMessage) => {
      lastFinanceNotification.value = message;
    };

    return {
      lastFinanceNotification,
      setLastFinanceNotification
    };
  },
  {
    persist: true
  }
);

export default useFinanceStore;
