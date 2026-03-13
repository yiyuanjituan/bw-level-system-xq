import { defineStore } from 'pinia'
import { ref } from "vue";
import { getUserInfo } from "@/api/common";

export const useAuthStore = defineStore('user', () => {
  const user = ref<any>({})
  const token = ref<string>('')

  const setToken = (data: string) => {
    token.value = data.trim()
  }

  const updateInfo = () => {
    getUserInfo().then((res) => user.value = res)
  }

  const logout = () => {
    user.value = {};
    token.value = ''
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
