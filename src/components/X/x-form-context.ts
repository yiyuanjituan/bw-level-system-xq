import type { InjectionKey, Ref } from "vue";

export interface XFormRuleItem {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  validator?: (...args: any[]) => void;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

export type XFormRules = Record<string, XFormRuleItem | XFormRuleItem[]>;
export type XFormModel = Record<string, any>;
export type XFormErrors = Record<string, string>;

export interface XFormContextValue {
  rules: Ref<XFormRules>;
  model: Ref<XFormModel>;
  errors: Ref<XFormErrors>;
  validateField: (field: string, trigger?: string, value?: unknown) => Promise<void>;
  validate: (fields?: string | string[]) => Promise<void>;
  clearValidate: (fields?: string | string[]) => void;
}

export const X_FORM_CONTEXT_KEY: InjectionKey<XFormContextValue> = Symbol("X_FORM_CONTEXT_KEY");
export const X_FORM_ITEM_PROP_KEY: InjectionKey<Ref<string>> = Symbol("X_FORM_ITEM_PROP_KEY");
