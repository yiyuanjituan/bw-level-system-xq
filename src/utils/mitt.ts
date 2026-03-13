// mitt.js文件
import mitt from 'mitt'
import { MittEvent } from "@/typings/mitt";
import { userMoneyInWallet } from "@/api/common";
import useAuthStore from "@/store/modules/user";

export const bus = mitt<MittEvent>()

export const userMoneyIn = (venueId: number) => {
  return userMoneyInWallet({ venueId })
}