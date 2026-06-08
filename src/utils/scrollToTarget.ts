import { nextTick, unref, type ComponentPublicInstance, type Ref } from "vue";

type ScrollSource = Element | ComponentPublicInstance | null | undefined;
type ScrollSourceGetter = () => ScrollSource;
type MaybeRefScrollSource = ScrollSource | Ref<ScrollSource> | ScrollSourceGetter;

interface ScrollToTargetOptions {
  duration?: number;
  delay?: number;
  offset?: number | ((container: HTMLElement, target: HTMLElement) => number);
}

interface ScrollState {
  animationFrameId: number | null;
  timerId: ReturnType<typeof setTimeout> | null;
}

const scrollStateMap = new WeakMap<HTMLElement, ScrollState>();

function resolveElement(source: MaybeRefScrollSource): HTMLElement | null {
  const value = typeof source === "function" ? source() : unref(source);

  if (!value) return null;
  if (value instanceof HTMLElement) return value;
  if (value instanceof Element) return value as HTMLElement;

  const element = value.$el;
  if (element instanceof HTMLElement) return element;
  if (element instanceof Element) return element as HTMLElement;

  return null;
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function getScrollState(container: HTMLElement) {
  const existingState = scrollStateMap.get(container);

  if (existingState) return existingState;

  const nextState: ScrollState = {
    animationFrameId: null,
    timerId: null
  };

  scrollStateMap.set(container, nextState);
  return nextState;
}

function clearScrollState(state: ScrollState) {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  if (state.timerId !== null) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function scrollToTarget(
  containerSource: MaybeRefScrollSource,
  targetSource: MaybeRefScrollSource,
  options: ScrollToTargetOptions = {}
) {
  const {
    duration = 1200,
    delay = 0,
    offset = 0
  } = options;

  const container = resolveElement(containerSource);

  if (!container) {
    return () => {};
  }

  const state = getScrollState(container);
  clearScrollState(state);

  const startScroll = () => {
    const target = resolveElement(targetSource);

    if (!target) return;
    if (!container.isConnected || !target.isConnected) return;

    const startTop = container.scrollTop;
    const offsetValue = typeof offset === "function" ? offset(container, target) : offset;
    const targetTop = Math.max(target.offsetTop - offsetValue, 0);
    const distance = targetTop - startTop;

    if (distance === 0) return;

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      container.scrollTop = startTop + distance * easedProgress;

      if (progress < 1) {
        state.animationFrameId = requestAnimationFrame(step);
        return;
      }

      state.animationFrameId = null;
    };

    state.animationFrameId = requestAnimationFrame(step);
  };

  state.timerId = setTimeout(() => {
    state.timerId = null;
    nextTick(startScroll);
  }, delay);

  return () => clearScrollState(state);
}
