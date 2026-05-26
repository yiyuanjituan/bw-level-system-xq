import type { ComputedRef, InjectionKey, Slots } from "vue";

export type XTabName = string | number;

export interface XTabPane {
  uid: number;
  title: ComputedRef<string>;
  name: ComputedRef<XTabName>;
  disabled: ComputedRef<boolean>;
  slots: Slots;
}

export interface XTabsContext {
  registerPane: (pane: XTabPane) => void;
  unregisterPane: (uid: number) => void;
}

export const X_TABS_CONTEXT_KEY: InjectionKey<XTabsContext> = Symbol("X_TABS_CONTEXT_KEY");

let xTabPaneUid = 0;

export function createXTabPaneUid() {
  xTabPaneUid += 1;
  return xTabPaneUid;
}
