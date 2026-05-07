import { http } from "@/utils/http";

type ListResult = {
  code: number;
  message: string;
  data: Array<any>;
};

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

export function getUserInfo(data?: object): Promise<any> {
  return http.request({
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

export function getFindUsData(data: any): Promise<any> {
  return http.request({
    url: "/open/site/base/findUs",
    method: "get",
    params: data
  });
}

export function updateUserInfo(data: any): Promise<any> {
  return http.request({
    url: "/app/user/info/updatePerson",
    method: "post",
    data: data
  });
}

export function setPayPassword(data: any): Promise<any> {
  return http.request({
    url: "/app/user/info/setPayPassword",
    method: "post",
    data: data
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
