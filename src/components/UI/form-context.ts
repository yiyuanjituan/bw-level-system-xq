import type { InjectionKey, Ref } from "vue";

export interface FormRuleItem {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  validator?: (...args: any[]) => void;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

export type FormRules = Record<string, FormRuleItem | FormRuleItem[]>;
export type FormModel = Record<string, any>;
export type FormErrors = Record<string, string>;

export interface FormExpose {
  validateField: (field: string, trigger?: string) => Promise<void>;
  validate: (fields?: string | string[]) => Promise<void>;
  clearValidate: (fields?: string | string[]) => void;
  errors: Ref<FormErrors>;
}

export interface FormContextValue {
  rules: Ref<FormRules>;
  model: Ref<FormModel>;
  errors: Ref<FormErrors>;
  validateField: (field: string, trigger?: string) => Promise<void>;
  validate: (fields?: string | string[]) => Promise<void>;
  clearValidate: (fields?: string | string[]) => void;
}

export const FORM_CONTEXT_KEY: InjectionKey<FormContextValue> = Symbol("FORM_CONTEXT_KEY");
export const FORM_ITEM_PROP_KEY: InjectionKey<Ref<string>> = Symbol("FORM_ITEM_PROP_KEY");
