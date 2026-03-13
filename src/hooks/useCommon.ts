import { ToastOptions } from "vant";
import { bus } from "@/utils/mitt";
import { DialogPromiseHandlers, IToastOptions } from "@/typings/mitt";
import { ICustomDialogOptions } from "@/components/UI/dialog.vue";

export const showCustomToast = (options: String | IToastOptions) => {
  return bus.emit('showToast', options);
}

export const showCustomDialog = (options: ICustomDialogOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const enhancedOptions = {
      ...options,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => reject(new Error('Dialog closed'))
    };

    bus.emit('showDialog', enhancedOptions);
  });
};