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
const navRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();

const navScrollLeft = ref(0);
const navScrollMax = ref(0);
const indicatorStyle = ref<Record<string, string>>({});
const contentWidth = ref(0);
const contentHeight = ref<number | null>(null);
const contentMotionEnabled = ref(false);

const tabRefs = new Map<number, HTMLElement>();
const panelRefs = new Map<number, HTMLElement>();

let contentObserver: ResizeObserver | null = null;
let activePanelObserver: ResizeObserver | null = null;

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
const panesSignature = computed(() => panes.value.map(pane => `${pane.uid}:${pane.name.value}:${pane.disabled.value}`).join("|"));
const isVertical = computed(() => props.position === "left" || props.position === "right");
const showPrevArrow = computed(() => !isVertical.value && navScrollLeft.value > 0);
const showNextArrow = computed(() => !isVertical.value && navScrollMax.value > navScrollLeft.value);

const navClass = computed(() => [
  "x-tabs__nav",
  `x-tabs__nav--${props.type}`,
  `x-tabs__nav--${props.position}`,
  {
    [`x-tabs__nav--${props.type}--shrink`]: props.shrink
  }
]);

const rootClass = computed(() => [`x-tabs--${props.type}`, "x-tabs__position", `x-tabs__position--${props.position}`]);

const contentClass = computed(() => ({
  "x-tabs__content--animated": props.animated,
  "x-tabs__content--motion": props.animated && contentMotionEnabled.value
}));

const trackClass = computed(() => ({
  "x-tabs__track--motion": props.animated && contentMotionEnabled.value
}));

const contentStyle = computed(() => {
  if (!props.animated || contentHeight.value === null) return {};

  return {
    height: `${contentHeight.value}px`
  };
});

const trackStyle = computed(() => ({
  transform: `translateX(-${Math.max(activeIndex.value, 0) * contentWidth.value}px)`
}));

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

function bindElement(map: Map<number, HTMLElement>, uid: number, element: Element | ComponentPublicInstance | null) {
  if (!(element instanceof HTMLElement)) {
    map.delete(uid);
    return;
  }

  map.set(uid, element);
}

function setTabRef(uid: number, element: Element | ComponentPublicInstance | null) {
  bindElement(tabRefs, uid, element);
}

function setPanelRef(uid: number, element: Element | ComponentPublicInstance | null) {
  bindElement(panelRefs, uid, element);
}

function stopContentObserver() {
  contentObserver?.disconnect();
  contentObserver = null;
}

function stopActivePanelObserver() {
  activePanelObserver?.disconnect();
  activePanelObserver = null;
}

function resetAnimatedContent() {
  contentHeight.value = null;
  contentMotionEnabled.value = false;
}

function ensureActivePane() {
  if (panes.value.length === 0) return;

  const currentPane = panes.value.find(pane => pane.name.value === modelValue.value && !pane.disabled.value);
  if (currentPane) return;

  const firstAvailablePane = panes.value.find(pane => !pane.disabled.value);
  if (!firstAvailablePane) return;

  modelValue.value = firstAvailablePane.name.value;
}

function updateNavScrollState() {
  const nav = navRef.value;
  if (!nav) {
    navScrollLeft.value = 0;
    navScrollMax.value = 0;
    return;
  }

  navScrollLeft.value = nav.scrollLeft;
  navScrollMax.value = Math.max(nav.scrollWidth - nav.clientWidth, 0);
}

function scrollToEdge(direction: "start" | "end") {
  if (isVertical.value) return;

  navRef.value?.scrollTo({
    left: direction === "start" ? 0 : navScrollMax.value,
    behavior: "smooth"
  });
}

function scrollActiveIntoView() {
  const nav = navRef.value;
  const pane = activePane.value;
  if (!nav || !pane) return;

  const tab = tabRefs.get(pane.uid);
  if (!tab) return;

  if (isVertical.value) {
    const targetTop = tab.offsetTop - (nav.clientHeight - tab.offsetHeight) / 2;
    nav.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth"
    });
    return;
  }

  const targetLeft = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
  nav.scrollTo({
    left: Math.max(targetLeft, 0),
    behavior: "smooth"
  });
}

function updateIndicator() {
  const pane = activePane.value;
  if (props.type !== "line" || !pane) {
    indicatorStyle.value = {};
    return;
  }

  const tab = tabRefs.get(pane.uid);
  if (!tab) {
    indicatorStyle.value = {};
    return;
  }

  const style = window.getComputedStyle(tab);
  const paddingStart = Number.parseFloat(isVertical.value ? style.paddingTop : style.paddingLeft) || 0;
  const paddingEnd = Number.parseFloat(isVertical.value ? style.paddingBottom : style.paddingRight) || 0;
  const size = Math.max((isVertical.value ? tab.offsetHeight : tab.offsetWidth) - paddingStart - paddingEnd, 0);
  const offset = (isVertical.value ? tab.offsetTop : tab.offsetLeft) + paddingStart;

  indicatorStyle.value = isVertical.value
    ? {
        width: "2px",
        height: `${size}px`,
        transform: `translate3d(0, ${offset}px, 0)`
      }
    : {
        width: `${size}px`,
        height: "2px",
        transform: `translate3d(${offset}px, 0, 0)`
      };
}

function updateContentMetrics() {
  contentWidth.value = contentRef.value?.clientWidth ?? 0;

  if (!props.animated) {
    resetAnimatedContent();
    return;
  }

  const pane = activePane.value;
  if (!pane) {
    resetAnimatedContent();
    return;
  }

  const panel = panelRefs.get(pane.uid);
  if (!panel) return;

  contentHeight.value = Math.ceil(panel.getBoundingClientRect().height);
}

function observeActivePanel() {
  stopActivePanelObserver();

  if (!props.animated || typeof ResizeObserver === "undefined") return;

  const pane = activePane.value;
  if (!pane) return;

  const panel = panelRefs.get(pane.uid);
  if (!panel) return;

  activePanelObserver = new ResizeObserver(() => {
    updateContentMetrics();
  });
  activePanelObserver.observe(panel);
}

function observeContent() {
  stopContentObserver();

  if (typeof ResizeObserver === "undefined" || !contentRef.value) return;

  contentObserver = new ResizeObserver(() => {
    updateContentMetrics();
  });
  contentObserver.observe(contentRef.value);
}

function activatePane(pane: XTabPane) {
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
  updateNavScrollState();
  updateIndicator();
  scrollActiveIntoView();
  updateContentMetrics();
  observeContent();
  observeActivePanel();
}

watch(
  panesSignature,
  () => {
    void syncTabs();
  },
  { flush: "post" }
);

watch(
  () => modelValue.value,
  (value, previousValue) => {
    contentMotionEnabled.value = previousValue !== undefined && previousValue !== value;
    void syncTabs();
  },
  { flush: "post" }
);

watch(
  () => props.animated,
  animated => {
    if (!animated) {
      resetAnimatedContent();
    }
    void syncTabs();
  },
  { flush: "post" }
);

onMounted(() => {
  void syncTabs();
  window.addEventListener("resize", syncTabs);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncTabs);
  stopContentObserver();
  stopActivePanelObserver();
});
</script>

<template>
  <div class="x-tabs" :class="rootClass">
    <div class="x-tabs__wrap">
      <div v-if="showPrevArrow" class="x-tabs__navigation-prev x-tabs__navigation-prev--left" @click="scrollToEdge('start')">
        <i class="inline-flex items-center justify-center x-arrow x-arrow--left">
          <svg width="1em" height="1em" fill="currentColor">
            <use xlink:href="#comm_icon_fh"></use>
          </svg>
        </i>
      </div>

      <div ref="navRef" :class="navClass" @scroll="updateNavScrollState">
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
          @click="activatePane(pane)"
        >
          <slot-renderer v-if="pane.slots.title" :pane="pane" slot-name="title" />
          <span v-else>{{ getPaneTitle(pane) }}</span>
        </div>

        <div v-if="type === 'line'" class="x-tabs__line" :class="{ 'x-tabs__line--vertical': isVertical }" :style="indicatorStyle"></div>
      </div>

      <div v-if="showNextArrow" class="x-tabs__navigation-next x-tabs__navigation-next--right" @click="scrollToEdge('end')">
        <i class="inline-flex items-center justify-center x-arrow x-arrow--right">
          <svg width="1em" height="1em" fill="currentColor">
            <use xlink:href="#comm_icon_fh"></use>
          </svg>
        </i>
      </div>
    </div>

    <div ref="contentRef" class="x-tabs__content" :class="contentClass" :style="contentStyle">
      <div v-if="animated" class="x-tabs__track" :class="trackClass" :style="trackStyle">
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

    &--top,
    &--bottom {
      flex-direction: row;
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
    width: 0;
    height: 2px;
    background: var(--skin__primary);
    border-radius: 2px;
    transition: transform 0.3s ease, width 0.3s ease;
  }

  &__line--vertical {
    top: 0;
    right: 0;
    bottom: auto;
    left: auto;
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
  }

  &__content--motion {
    transition: height 0.3s ease;
    will-change: height;
  }

  &__track {
    position: relative;
    display: flex;
    width: 100%;
    align-items: flex-start;
  }

  &__track--motion {
    transition: transform 0.3s ease;
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

  &--right {
    transform: rotate(180deg);
  }
}

[dir="rtl"] .x-tabs__line {
  right: 0;
  left: auto;
}

[dir="rtl"] .x-tabs__navigation-prev--left {
  right: 2px;
  left: auto;
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
