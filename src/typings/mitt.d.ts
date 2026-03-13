import { DialogOptions, ToastOptions } from "vant";

export type ToastType = 'text' | 'loading' | 'success' | 'fail' | 'html' | 'warning';

export interface IToastOptions extends Omit<ToastOptions, 'type'> {
  type?: ToastType;
}

export type MittEvent = {
  showDialog: DialogOptions
  showToast: String | IToastOptions
  'error': Error
  'logout': null
  'findUs': null
  'moneyIn': null
}

export interface DialogPromiseHandlers {
  then: (onFulfilled?: (value: boolean) => void, onRejected?: (reason: any) => void) => DialogPromiseHandlers;
  catch: (onRejected?: (reason: any) => void) => DialogPromiseHandlers;
  finally: (onFinally?: () => void) => void;
}