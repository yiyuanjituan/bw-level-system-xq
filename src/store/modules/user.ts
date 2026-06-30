import { defineStore } from 'pinia'
import { ref } from "vue";
import { getUserInfo } from "@/api/common";
import { connectSse, disconnectSse } from "@/utils/sse";

export const useAuthStore = defineStore('user', () => {
  const user = ref<any>({})
  const token = ref<string>('')

  const setToken = (data: string) => {
    const nextToken = data?.trim() ?? ''
    token.value = nextToken

    if (nextToken) {
      connectSse(nextToken)
    } else {
      disconnectSse()
    }
  }

  const updateInfo = async () => {
    await getUserInfo().then((res) => user.value = res)
    return 'success'
  }

  const logout = () => {
    user.value = {};
    token.value = ''
    disconnectSse()
  }

  return {
    user,
    token,
    setToken,
    updateInfo,
    logout
  }
}, {
  persist: true,
})

export default useAuthStore
