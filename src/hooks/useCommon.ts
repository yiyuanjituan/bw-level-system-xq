import { bus } from "@/utils/mitt";
import { IToastOptions } from "@/typings/mitt";
import { ICustomDialogOptions } from "@/components/UI/dialog.vue";
import * as _ from "lodash-es";

export const showCustomToast = (options: string | IToastOptions) => {
  return bus.emit("showToast", options);
};

export const showCustomDialog = (options: ICustomDialogOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const enhancedOptions = {
      ...options,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => reject(new Error("Dialog closed"))
    };

    bus.emit("showDialog", enhancedOptions);
  });
};

export function desensitizeWithLodash(value: string): string {
  if (!value || !_.isString(value)) return value;

  // 邮箱处理：前3位 + ***@域名
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    const [localPart, domain] = value.split("@");
    return `${localPart.substring(0, 3)}***@${domain}`;
  }

  // 普通字符串处理：*** + 后几位
  const length = value.length;
  if (length < 4) {
    // 不足4位：*** + 后2位
    return `***${value.slice(-2)}`;
  }
  // 4位及以上：*** + 后4位
  return `***${value.slice(-4)}`;
}
