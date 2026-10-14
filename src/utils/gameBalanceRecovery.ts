import { service } from '@/api/service';
import { userMoneyIn } from '@/utils/mitt';

const recoveryRequests = new Map<string, Promise<unknown>>();

export async function waitForGameBalanceRecovery(token: string) {
  // 回收失败不阻止用户进入游戏，接口自身会展示错误提示。
  await recoveryRequests.get(token)?.catch(() => undefined);
}

export function recoverGameBalances(token: string, venueId?: number) {
  if (!token) return Promise.resolve();
  const existingRequest = recoveryRequests.get(token);
  if (existingRequest) return existingRequest;

  const request = (venueId === undefined
    ? service.v1.user.totalMoneyIn({})
    : userMoneyIn(venueId)
  ).finally(() => recoveryRequests.delete(token));
  recoveryRequests.set(token, request);
  return request;
}
