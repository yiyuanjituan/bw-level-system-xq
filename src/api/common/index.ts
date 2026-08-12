import { http } from "@/utils/http";
import type {
  PromoteBettingDetailResponse,
  PromoteCommissionParams,
  PromoteCommissionResponse,
  PromoteDataResponse,
  PromotePerformanceParams,
  PromotePerformanceResponse,
  PromoteSubordinateFinanceParams,
  PromoteSubordinateFinanceResponse,
  PromoteSubordinateReceiveResponse
} from "@/views/home/promote/types";

type ListResult = {
  code: number;
  message: string;
  data: Array<any>;
};

export type CanReceiveSource = 2 | 3 | 4 | 5 | 6;

export interface CanReceiveItem {
  key: string;
  name: string;
  money: number;
  vitality: number;
  source: CanReceiveSource;
  sourceName: string;
  createTime?: string | null;
}

export interface CanReceiveResponse {
  list: CanReceiveItem[];
  total: number;
  totalMoney: number;
  totalVitality: number;
}

export interface BindEmailPayload {
  email: string;
}

export interface UpdateLoginPasswordPayload {
  password: string;
}

export interface PayPasswordPayload {
  password: string;
}

export interface UpdatePayPasswordPayload extends PayPasswordPayload {
  loginPassword: string;
}

export type UpdateUserInfoPayload = Partial<Pick<
  Eps.UserInfoEntity,
  "avatarUrl" | "nickName" | "showAccount" | "birthday" | "wechat" | "whatsapp" | "telegram"
>>;

export function getConfig(data?: object): Promise<any> {
  return http.request({
    url: "/open/site/base/config",
    method: "get",
    params: data
  });
}

export function sendSms(data?: object): Promise<any> {
  return http.request({
    url: "/app/user/login/smsCode",
    method: "post",
    data
  });
}

export function userRegister(data?: object): Promise<any> {
  return http.request({
    url: "/app/user/login/register",
    method: "post",
    data
  });
}

export function userLogin(data?: object): Promise<any> {
  return http.request({
    url: "/app/user/login/password",
    method: "post",
    data
  });
}


export function userPhoneLogin(data?: object): Promise<any> {
  return http.request({
    url: "/app/user/login/phoneVerifyCode",
    method: "post",
    data
  });
}

export function getUserInfo(data?: object): Promise<Eps.UserInfoEntity> {
  return http.request<Eps.UserInfoEntity>({
    url: "/app/user/info/person",
    method: "get",
    params: data
  });
}

export function getCommonInfo(data?: object): Promise<any> {
  return http.request({
    url: "/open/site/base/classifyData",
    method: "get",
    data: data
  });
}

export function getHomeApiData(data?: object): Promise<any> {
  return http.request({
    url: "/open/v1/home/pageData",
    method: "post",
    data: data
  });
}

export function getGameListById(data: any): Promise<any> {
  return http.request({
    url: "/open/v1/game/getGameById",
    method: "post",
    data: data
  });
}

export function getGameUrl(data: any): Promise<any> {
  return http.request({
    url: "/app/v1/game/getGameUrl",
    method: "post",
    data: data
  });
}

export function userMoneyInWallet(data: any): Promise<any> {
  return http.request({
    url: "/app/v1/game/userMoneyIn",
    method: "post",
    data: data
  });
}

export function getEventData(data: any): Promise<any> {
  return http.request({
    url: "/open/activity/data/listData",
    method: "post",
    data: data
  });
}

export function getEventInfo(data: any): Promise<any> {
  return http.request({
    url: "/open/activity/data/infoData",
    method: "post",
    data: data
  });
}

export function getActivityRecords(data: any): Promise<any> {
  return http.request({
    url: "/app/v1/activity/records",
    method: "post",
    data: data
  });
}

export function getCanReceiveList(): Promise<CanReceiveResponse> {
  return http.request<CanReceiveResponse>({
    url: "/app/v1/activity/canReceive",
    method: "post"
  });
}

export function getFindUsData(data: any): Promise<any> {
  return http.request({
    url: "/open/site/base/findUs",
    method: "get",
    params: data
  });
}

export function updateUserInfo(data: UpdateUserInfoPayload): Promise<unknown> {
  return http.request<unknown>({
    url: "/app/user/info/updatePerson",
    method: "post",
    data: data
  });
}

export function setPayPassword(data: PayPasswordPayload): Promise<void> {
  return http.request<void>({
    url: "/app/user/info/setPayPassword",
    method: "post",
    data
  });
}

export function updatePayPassword(data: UpdatePayPasswordPayload): Promise<void> {
  return http.request<void>({
    url: "/app/user/info/updatePayPassword",
    method: "post",
    data
  });
}

export function getWithdrawInfo(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/v1/finance/withdrawInfo",
    method: "post",
    data: data
  });
}

export function verifyWithdrawalPassword(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/v1/finance/verifyWithdrawalPassword",
    method: "post",
    data: data
  });
}

// 绑定银行卡
export function bindCard(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/v1/finance/bindCard",
    method: "post",
    data: data
  });
}

// 设置为默认银行卡
export function setDefault(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/v1/finance/setDefault",
    method: "post",
    data: data
  });
}

// 获取所有的充值渠道
export function getChannelList(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/base/recharge/channelList",
    method: "post",
    data: data
  });
}

// 获取站内钱包的充值方式
export function getSiteWalletInfo(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/base/recharge/siteWalletInfo",
    method: "post",
    data: data
  });
}

// 创建No钱包用户
export function createNoWalletUser(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/base/recharge/createNoWalletUser",
    method: "post",
    data: data
  });
}

// 创建支付
export function createOrder(data: any = {}): Promise<any> {
  return http.request({
    url: "/app/base/recharge/createOrder",
    method: "post",
    data: data
  });
}

// 客服信息
export function serviceList(data: any = {}): Promise<any> {
  return http.request({
    url: "/open/service/info/list",
    method: "post",
    data: data
  });
}

// 帮助信息
export function getHelpData(data: any = {}): Promise<any> {
  return http.request({
    url: "/open/v1/home/helpData",
    method: "post",
    data: data
  });
}

export function updateLoginPassword(data: UpdateLoginPasswordPayload): Promise<void> {
  return http.request<void>({
    url: "/app/user/info/updatePassword",
    method: "post",
    data
  });
}

export function bindEmail(data: BindEmailPayload): Promise<void> {
  return http.request<void>({
    url: "/app/user/info/bindEmail",
    method: "post",
    data
  });
}

export function getUserDevices(): Promise<any> {
  return http.request({
    url: "/app/user/device/list",
    method: "get"
  });
}

export function getPromoteInfo(): Promise<any> {
  return http.request({
    url: "/app/v1/agent/promoteInfo",
    method: "post"
  });
}

export function getPromoteCommission(
  data: PromoteCommissionParams
): Promise<PromoteCommissionResponse> {
  return http.request<PromoteCommissionResponse>({
    url: "/app/v1/agent/commissionInfo",
    method: "post",
    data
  });
}

export function getPromotePerformance(
  data: PromotePerformanceParams
): Promise<PromotePerformanceResponse> {
  return http.request<PromotePerformanceResponse>({
    url: "/app/v1/agent/performanceInfo",
    method: "post",
    data
  });
}

export function getPromoteData(timeEnum: number): Promise<PromoteDataResponse> {
  return http.request<PromoteDataResponse>({
    url: "/app/v1/agent/dataInfo",
    method: "post",
    data: { timeEnum }
  });
}

// 查询代理下级列表及所选时间范围内的汇总数据
export function getPromoteSubordinates(data: Record<string, unknown> = {}): Promise<any> {
  return http.request({
    url: "/app/v1/agent/subordinateInfo",
    method: "post",
    data
  });
}

export function getPromoteSubordinateFinance(
  data: PromoteSubordinateFinanceParams
): Promise<PromoteSubordinateFinanceResponse> {
  return http.request<PromoteSubordinateFinanceResponse>({
    url: "/app/v1/agent/subordinateFinanceInfo",
    method: "post",
    data
  });
}

export function getPromoteSubordinateReceive(
  data: Record<string, unknown> = {}
): Promise<PromoteSubordinateReceiveResponse> {
  return http.request<PromoteSubordinateReceiveResponse>({
    url: "/app/v1/agent/subordinateReceiveInfo",
    method: "post",
    data
  });
}

export function getPromoteSubordinateDetail(userIdx: number): Promise<any> {
  return http.request({
    url: "/app/v1/agent/subordinateDetail",
    method: "post",
    data: { userIdx }
  });
}

export function getPromoteSubordinateBettingDetail(
  data: Record<string, unknown>
): Promise<PromoteBettingDetailResponse> {
  return http.request<PromoteBettingDetailResponse>({
    url: "/app/v1/agent/subordinateBettingDetail",
    method: "post",
    data
  });
}
