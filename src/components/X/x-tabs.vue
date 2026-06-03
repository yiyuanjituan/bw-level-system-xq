<script setup lang="ts">
import {
  type ComponentPublicInstance,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch
} from "vue";
import { X_TABS_CONTEXT_KEY, type XTabName, type XTabPane } from "./x-tabs-context";

defineOptions({
  name: "x-tabs"
});

type TabType = "line" | "card";
type TabPosition = "top" | "right" | "bottom" | "left";

interface Props {
  type?: TabType;
  shrink?: boolean;
  animated?: boolean;
  position?: TabPosition;
}

const props = withDefaults(defineProps<Props>(), {
  type: "line",
  shrink: false,
  animated: false,
  position: "top"
});

const modelValue = defineModel<XTabName>();

const emit = defineEmits<{
  (e: "change", value: XTabName): void;
  (e: "tab-click", value: XTabName, pane: XTabPane): void;
}>();

const panes = shallowRef<XTabPane[]>([]);
const wrapRef = ref<HTMLElement>();
const lineStyle = ref<Record<string, string>>({});
const wrapScrollLeft = ref(0);
const wrapScrollMaxWidth = ref(0);
const tabRefs = new Map<number, HTMLElement>();
const panelRefs = new Map<number, HTMLElement>();
const contentHeight = ref<number | null>(null);
let activePanelResizeObserver: ResizeObserver | null = null;

const SlotRenderer = defineComponent({
  name: "XTabsSlotRenderer",
  props: {
    pane: {
      type: Object as () => XTabPane,
      required: true
    },
    slotName: {
      type: String as () => "default" | "title",
      default: "default"
    }
  },
  setup(slotProps) {
    return () => slotProps.pane.slots[slotProps.slotName]?.() ?? null;
  }
});

const activeIndex = computed(() => panes.value.findIndex(pane => pane.name.value === modelValue.value));
const activePane = computed(() => panes.value[activeIndex.value] ?? null);
const contentTrackStyle = computed(() => ({
  transform: `translate3d(-${Math.max(activeIndex.value, 0) * 100}%, 0, 0)`
}));
const contentStyle = computed(() => {
  if (!props.animated || contentHeight.value === null) return {};

  return {
    height: `${contentHeight.value}px`
  };
});

const navClass = computed(() => [
  "x-tabs__nav",
  `x-tabs__nav--${props.type}`,
  `x-tabs__nav--${props.position}`,
  {
    [`x-tabs__nav--${props.type}--shrink`]: props.shrink
  }
]);

const isVertical = computed(() => props.position === "left" || props.position === "right");

function registerPane(pane: XTabPane) {
  if (panes.value.some(item => item.uid === pane.uid)) return;
  panes.value = [...panes.value, pane];
}

function unregisterPane(uid: number) {
  panes.value = panes.value.filter(pane => pane.uid !== uid);
  tabRefs.delete(uid);
  panelRefs.delete(uid);
}

provide(X_TABS_CONTEXT_KEY, {
  registerPane,
  unregisterPane
});

function setTabRef(uid: number, element: Element | ComponentPublicInstance | null) {
  if (!(element instanceof HTMLElement)) {
    tabRefs.delete(uid);
    return;
  }
  tabRefs.set(uid, element);
}

function setPanelRef(uid: number, element: Element | ComponentPublicInstance | null) {
  if (!(element instanceof HTMLElement)) {
    panelRefs.delete(uid);
    return;
  }
  panelRefs.set(uid, element);
}

function stopObservingActivePanel() {
  activePanelResizeObserver?.disconnect();
  activePanelResizeObserver = null;
}

function updateContentHeight() {
  if (!props.animated) {
    contentHeight.value = null;
    return;
  }

  const pane = activePane.value;
  if (!pane) {
    contentHeight.value = null;
    return;
  }

  const panel = panelRefs.get(pane.uid);
  if (!panel) return;

  const nextHeight = Math.ceil(panel.getBoundingClientRect().height);
  contentHeight.value = nextHeight;
}

function observeActivePanel() {
  stopObservingActivePanel();

  if (!props.animated || typeof ResizeObserver === "undefined") return;

  const pane = activePane.value;
  if (!pane) return;

  const panel = panelRefs.get(pane.uid);
  if (!panel) return;

  activePanelResizeObserver = new ResizeObserver(() => {
    updateContentHeight();
  });
  activePanelResizeObserver.observe(panel);
}

function updateScrollState() {
  const wrap = wrapRef.value;
  if (!wrap) {
    wrapScrollLeft.value = 0;
    wrapScrollMaxWidth.value = 0;
    return;
  }

  wrapScrollLeft.value = wrap.scrollLeft;
  wrapScrollMaxWidth.value = Math.max(wrap.scrollWidth - wrap.clientWidth, 0);
}

function scrollToLeft() {
  wrapRef.value?.scrollTo({ left: 0, behavior: "smooth" });
}

function scrollToRight() {
  wrapRef.value?.scrollTo({ left: wrapScrollMaxWidth.value, behavior: "smooth" });
}

function scrollActiveIntoView() {
  const wrap = wrapRef.value;
  const pane = activePane.value;
  if (!wrap || !pane) return;

  const tab = tabRefs.get(pane.uid);
  if (!tab) return;

  if (isVertical.value) {
    const targetTop = tab.offsetTop - (wrap.clientHeight - tab.offsetHeight) / 2;
    wrap.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth"
    });
    return;
  }

  const targetLeft = tab.offsetLeft - (wrap.clientWidth - tab.offsetWidth) / 2;
  wrap.scrollTo({
    left: Math.max(targetLeft, 0),
    behavior: "smooth"
  });
}

function updateLine() {
  const pane = activePane.value;
  const wrap = wrapRef.value;

  if (props.type !== "line" || !pane || !wrap) {
    lineStyle.value = {};
    return;
  }

  const tab = tabRefs.get(pane.uid);
  if (!tab) {
    lineStyle.value = {};
    return;
  }

  const computedStyle = window.getComputedStyle(tab);
  const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;

  if (isVertical.value) {
    const height = Math.max(tab.offsetHeight - paddingTop - paddingBottom, 0);
    const top = tab.offsetTop + paddingTop;

    lineStyle.value = {
      height: `${height}px`,
      width: "2px",
      transform: `translate3d(0, ${top}px, 0)`
    };
    return;
  }

  const width = Math.max(tab.offsetWidth - paddingLeft - paddingRight, 0);
  const left = tab.offsetLeft + paddingLeft;

  lineStyle.value = {
    width: `${width}px`,
    height: "2px",
    transform: `translate3d(${left}px, 0, 0)`
  };
}

function ensureActivePane() {
  if (panes.value.length === 0) return;

  const currentPane = panes.value.find(pane => pane.name.value === modelValue.value && !pane.disabled.value);
  if (currentPane) return;

  const firstAvailablePane = panes.value.find(pane => !pane.disabled.value);
  if (!firstAvailablePane) return;

  modelValue.value = firstAvailablePane.name.value;
}

function setActivePane(pane: XTabPane) {
  if (pane.disabled.value) return;

  emit("tab-click", pane.name.value, pane);

  if (modelValue.value === pane.name.value) return;

  modelValue.value = pane.name.value;
  emit("change", pane.name.value);
}

function isPaneActive(pane: XTabPane) {
  return pane.name.value === modelValue.value;
}

function getPaneTitle(pane: XTabPane) {
  return pane.title.value;
}

async function syncTabs() {
  ensureActivePane();
  await nextTick();
  updateScrollState();
  updateLine();
  scrollActiveIntoView();
  updateContentHeight();
  observeActivePanel();
}

watch(
  () => panes.value.map(pane => `${pane.uid}:${pane.name.value}:${pane.disabled.value}`).join("|"),
  () => {
    syncTabs();
  },
  { flush: "post" }
);

watch(
  () => modelValue.value,
  () => {
    syncTabs();
  },
  { flush: "post" }
);

watch(
  () => props.animated,
  () => {
    syncTabs();
  },
  { flush: "post" }
);

onMounted(() => {
  syncTabs();
  window.addEventListener("resize", syncTabs);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncTabs);
  stopObservingActivePanel();
});
</script>

<template>
  <div class="x-tabs" :class="[`x-tabs--${type}`, 'x-tabs__position', `x-tabs__position--${position}`]">
    <div class="x-tabs__wrap">
      <div
        v-if="wrapScrollLeft > 0 && !isVertical"
        class="x-tabs__navigation-prev x-tabs__navigation-prev--left"
        @click="scrollToLeft"
      >
        <i class="inline-flex items-center justify-center x-arrow x-arrow--left">
          <svg width="1em" height="1em" fill="currentColor">
            <use xlink:href="#comm_icon_fh"></use>
          </svg>
        </i>
      </div>

      <div ref="wrapRef" :class="navClass" @scroll="updateScrollState">
        <div
          v-for="pane in panes"
          :key="pane.uid"
          :ref="element => setTabRef(pane.uid, element)"
          class="x-tab"
          :class="{
            'x-tab--active': isPaneActive(pane),
            'x-tab--disabled': pane.disabled.value,
            'x-tab--grow': !shrink,
            'x-tab--shrink': shrink,
            'x-tab--card': type === 'card'
          }"
          @click="setActivePane(pane)"
        >
          <slot-renderer v-if="pane.slots.title" :pane="pane" slot-name="title" />
          <span v-else>{{ getPaneTitle(pane) }}</span>
        </div>

        <div
          v-if="type === 'line'"
          class="x-tabs__line"
          :class="{ 'x-tabs__line--vertical': isVertical }"
          :style="lineStyle"
        ></div>
      </div>

      <div
        v-if="wrapScrollMaxWidth - wrapScrollLeft > 0 && !isVertical"
        class="x-tabs__navigation-next x-tabs__navigation-next--right"
        @click="scrollToRight"
      >
        <i class="inline-flex items-center justify-center x-arrow x-arrow--right">
          <svg width="1em" height="1em" fill="currentColor">
            <use xlink:href="#comm_icon_fh"></use>
          </svg>
        </i>
      </div>
    </div>

    <div class="x-tabs__content" :class="{ 'x-tabs__content--animated': animated }" :style="contentStyle">
      <div v-if="animated" class="x-tabs__track" :style="contentTrackStyle">
        <div v-for="pane in panes" :key="pane.uid" :ref="element => setPanelRef(pane.uid, element)" class="x-tab__panel">
          <div class="x-tab__panel-inner">
            <slot-renderer :pane="pane" />
          </div>
        </div>
      </div>

      <template v-else>
        <div
          v-for="pane in panes"
          :key="pane.uid"
          :ref="element => setPanelRef(pane.uid, element)"
          v-show="isPaneActive(pane)"
          class="x-tab__panel"
        >
          <div class="x-tab__panel-inner">
            <slot-renderer :pane="pane" />
          </div>
        </div>
      </template>
    </div>

    <div class="x-tabs__registry">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.x-tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--skin__lead);

  &__position {
    &--top {
      flex-direction: column;
    }

    &--bottom {
      flex-direction: column-reverse;
    }

    &--left {
      flex-direction: row;
      align-items: stretch;
    }

    &--right {
      flex-direction: row-reverse;
      align-items: stretch;
    }
  }

  &--line .x-tabs__wrap,
  &--card > .x-tabs__wrap {
    min-height: 30px;
  }

  &__wrap {
    position: relative;
    overflow: hidden;
  }

  &__nav {
    position: relative;
    display: flex;
    width: 100%;
    min-width: 0;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    &--line {
      padding-bottom: 0;
    }

    &--top,
    &--bottom {
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
    }

    &--left,
    &--right {
      flex-direction: column;
      width: auto;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }

    &--card {
      border: var(--lobby__px) solid var(--skin__primary);
      border-radius: 2px;
      overflow: hidden;
    }

    &--card--shrink {
      display: inline-flex;
      width: auto;
      min-width: 100%;
    }
  }

  &__line {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    height: 2px;
    background: var(--skin__primary);
    border-radius: 2px;
    transition: transform 0.3s ease, width 0.3s ease;
  }

  &__line--vertical {
    top: 0;
    bottom: auto;
    left: auto;
    right: 0;
    transition: transform 0.3s ease, height 0.3s ease;
  }

  &__navigation-prev,
  &__navigation-next {
    position: absolute;
    top: 50%;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
    color: #fff;
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    cursor: pointer;
  }

  &__navigation-prev--left {
    left: 2px;
  }

  &__navigation-next--right {
    right: 2px;
  }

  &__content {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }

  &__content--animated {
    overflow: hidden;
    transition: height 0.3s ease;
    will-change: height;
  }

  &__track {
    position: relative;
    display: flex;
    width: 100%;
    align-items: flex-start;
    transition: transform 0.3s ease;
    will-change: transform;
  }

  &__registry {
    display: none;
  }
}

.x-tabs__position--left .x-tabs__wrap,
.x-tabs__position--right .x-tabs__wrap {
  flex: 0 0 auto;
  height: 100%;
}

.x-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 30px;
  padding: 0 2px;
  color: inherit;
  font-size: 14px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;

  &--active {
    color: var(--skin__primary);
    font-weight: 400;
  }

  &--disabled {
    color: #c8c9cc;
    cursor: not-allowed;
  }

  &--grow {
    flex: 1 0 auto;
    padding: 0 12px;
  }

  &--shrink {
    flex: none;
    padding: 0 8px;
  }

  &--card {
    color: var(--skin__primary);
    border-right: var(--lobby__px) solid var(--skin__primary);
  }

  &--card:last-child {
    border-right: none;
  }

  &--card.x-tab--active {
    color: #fff;
    background-color: var(--skin__primary);
  }
}

.x-tabs__nav--left .x-tab,
.x-tabs__nav--right .x-tab {
  width: 100%;
}

.x-tab__panel {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  flex: 0 0 100%;
  min-height: 0;
}

.x-tab__panel-inner {
  width: 100%;
  min-height: 0;
}

.x-arrow {
  font-size: 7px;
  line-height: 1;

  &--left {
    transform: rotate(0);
  }

  &--right {
    transform: rotate(180deg);
  }
}

[dir="rtl"] .x-tabs__line {
  left: auto;
  right: 0;
}

[dir="rtl"] .x-tabs__navigation-prev--left {
  left: auto;
  right: 2px;
}

[dir="rtl"] .x-tabs__navigation-next--right {
  right: auto;
  left: 2px;
}

[dir="rtl"] .x-tab--card {
  border-right: none;
  border-left: var(--lobby__px) solid var(--skin__primary);
}

[dir="rtl"] .x-tab--card:last-child {
  border-left: none;
}
</style>
