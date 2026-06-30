import { DialogOptions, ToastOptions } from "vant";
import type { SseMessage } from "@/utils/sse";

export type ToastType = "text" | "loading" | "success" | "fail" | "html" | "warning";

export interface IToastOptions extends Omit<ToastOptions, "type"> {
  type?: ToastType;
}

export type MittEvent = {
  showDialog: DialogOptions;
  showToast: string | IToastOptions;
  showRecharge: null;
  showRechargeDetail: any;
  showRechargeRecord: any;
  error: Error;
  logout: null;
  'closed-popup': null;
  findUs: null;
  moneyIn: null;
  switchTab: string;
  sseMessage: SseMessage;
  showWithdrawSuccess: any;
};

export interface DialogPromiseHandlers {
  then: (onFulfilled?: (value: boolean) => void, onRejected?: (reason: any) => void) => DialogPromiseHandlers;
  catch: (onRejected?: (reason: any) => void) => DialogPromiseHandlers;
  finally: (onFinally?: () => void) => void;
}
