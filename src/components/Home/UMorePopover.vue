<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { $t } from "@/locales";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import XPopover from "@/components/X/x-popover.vue";
import depositIcon from "@/assets/home/u-series/more/deposit.png";
import withdrawIcon from "@/assets/home/u-series/more/withdraw.png";
import eventIcon from "@/assets/home/u-series/more/event.png";
import taskIcon from "@/assets/home/u-series/more/task.png";
import yuebaoIcon from "@/assets/home/u-series/more/yuebao.png";
import cashbackIcon from "@/assets/home/u-series/more/cashback.png";
import feedbackIcon from "@/assets/home/u-series/more/feedback.png";
import securityIcon from "@/assets/home/u-series/more/security.png";
import appDownloadIcon from "@/assets/home/u-series/more/app-download.png";
import profileIcon from "@/assets/home/u-series/more/profile.png";
import accountDetailIcon from "@/assets/home/u-series/more/account-detail.png";
import betRecordIcon from "@/assets/home/u-series/more/bet-record.png";
import personalReportIcon from "@/assets/home/u-series/more/personal-report.png";
import claimIcon from "@/assets/home/u-series/more/claim.png";
import withdrawManageIcon from "@/assets/home/u-series/more/withdraw-manage.png";
import languageIcon from "@/assets/home/u-series/more/language.png";
import betTaskIcon from "@/assets/home/u-series/more/bet-task.png";
import findUsIcon from "@/assets/home/u-series/more/find-us.png";
import shareIcon from "@/assets/home/u-series/more/share.png";
import recentIcon from "@/assets/home/u-series/more/recent.png";
import favoriteIcon from "@/assets/home/u-series/more/favorite.png";
import luckyWheelIcon from "@/assets/home/u-series/more/lucky-wheel.webp";
import claimRecordIcon from "@/assets/home/u-series/more/claim-record.png";

defineOptions({
  name: "UHomeMorePopover"
});

const emit = defineEmits<{
  select: [key: string];
}>();

const popoverContentWidth = 270;
const popoverBorderWidth = 2;
const popoverEdgeGap = 10;
const bottomSafeOffset = 12;
const maxAutoScrollTimes = 3;
const innerScrollStep = 200;
const visibleAreaCheckDelay = 100;
const autoScrollEndDelay = 350;
const autoScrollIdleDelay = 120;
const referenceRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const scrollRef = ref<HTMLElement | null>(null);
const visible = ref(false);
const showMoreScrollHint = ref(false);
const popoverWidth = ref(popoverContentWidth);
const popoverOffset = ref<[number, number]>([0, 8]);
const popoverArrowLeft = ref(popoverContentWidth / 2);
let visibleAreaCheckTimer: number | null = null;
let autoScrollEndTimer: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let pageScrollContainer: HTMLElement | Window | null = null;
let autoScrollTimes = 0;
let isAutoScrolling = false;
const menuItems = computed(() => [
  { key: "deposit", title: $t("存款"), icon: depositIcon, badge: $t("送3%") },
  { key: "withdraw", title: $t("提现"), icon: withdrawIcon },
  { key: "event", title: $t("活动"), icon: eventIcon },
  { key: "task", title: $t("任务"), icon: taskIcon },
  { key: "yuebao", title: $t("利息宝"), icon: yuebaoIcon, badge: "88%" },
  { key: "cashback", title: $t("返水"), icon: cashbackIcon },
  { key: "feedback", title: $t("有奖反馈"), icon: feedbackIcon },
  { key: "security", title: $t("安全中心"), icon: securityIcon },
  { key: "app-download", title: $t("APP下载"), icon: appDownloadIcon },
  { key: "profile", title: $t("个人资料"), icon: profileIcon },
  { key: "account-detail", title: $t("账户明细"), icon: accountDetailIcon },
  { key: "bet-record", title: $t("投注记录"), icon: betRecordIcon },
  { key: "personal-report", title: $t("个人报表"), icon: personalReportIcon },
  { key: "claim", title: $t("待领取"), icon: claimIcon },
  { key: "withdraw-manage", title: $t("提现管理"), icon: withdrawManageIcon },
  { key: "language", title: $t("语言"), icon: languageIcon },
  { key: "bet-task", title: $t("投注任务"), icon: betTaskIcon },
  { key: "find-us", title: $t("找到我们"), icon: findUsIcon },
  { key: "share", title: $t("立即分享"), icon: shareIcon },
  { key: "recent", title: $t("最近游戏"), icon: recentIcon },
  { key: "favorite", title: $t("收藏游戏"), icon: favoriteIcon },
  { key: "lucky-wheel", title: $t("幸运转盘"), icon: luckyWheelIcon, animated: true },
  { key: "claim-record", title: $t("领取记录"), icon: claimRecordIcon }
]);

function getScrollContainer(element: HTMLElement | null): HTMLElement | Window {
  let currentElement = element?.parentElement ?? null;

  while (currentElement) {
    const overflowY = window.getComputedStyle(currentElement).overflowY;
    if (["auto", "scroll", "overlay"].includes(overflowY)) return currentElement;
    currentElement = currentElement.parentElement;
  }

  return window;
}

function getScrollTop(container: HTMLElement | Window) {
  if (container === window) return window.scrollY || document.documentElement.scrollTop;
  return (container as HTMLElement).scrollTop;
}

function getMaxScrollTop(container: HTMLElement | Window) {
  if (container === window) {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  const scrollElement = container as HTMLElement;
  return Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
}

function scrollToPosition(container: HTMLElement | Window, top: number) {
  if (container === window) {
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  (container as HTMLElement).scrollTo({ top, behavior: "smooth" });
}

function updateInnerScrollHint() {
  const scrollElement = scrollRef.value;
  if (!scrollElement) {
    showMoreScrollHint.value = false;
    return;
  }

  showMoreScrollHint.value =
    scrollElement.scrollHeight > scrollElement.clientHeight &&
    scrollElement.scrollTop + scrollElement.clientHeight + 1 < scrollElement.scrollHeight;
}

function scheduleAutoScrollEnd(delay = autoScrollEndDelay) {
  if (autoScrollEndTimer !== null) window.clearTimeout(autoScrollEndTimer);

  autoScrollEndTimer = window.setTimeout(() => {
    autoScrollEndTimer = null;
    isAutoScrolling = false;
    checkPopoverVisibleArea();
  }, delay);
}

function checkPopoverVisibleArea() {
  const contentElement = contentRef.value;
  if (!visible.value || !contentElement) return;

  updateInnerScrollHint();

  const overflowHeight =
    contentElement.getBoundingClientRect().bottom - (window.innerHeight - bottomSafeOffset);
  if (overflowHeight <= 0 || autoScrollTimes >= maxAutoScrollTimes) return;

  const scrollContainer = pageScrollContainer ?? getScrollContainer(referenceRef.value);
  const currentTop = getScrollTop(scrollContainer);
  const targetTop = Math.min(
    getMaxScrollTop(scrollContainer),
    Math.round(currentTop + overflowHeight)
  );
  if (targetTop <= currentTop) return;

  autoScrollTimes += 1;
  isAutoScrolling = true;
  scrollToPosition(scrollContainer, targetTop);
  scheduleAutoScrollEnd();
}

function scheduleVisibleAreaCheck() {
  if (!visible.value || visibleAreaCheckTimer !== null) return;

  visibleAreaCheckTimer = window.setTimeout(() => {
    visibleAreaCheckTimer = null;
    checkPopoverVisibleArea();
  }, visibleAreaCheckDelay);
}

function startObservePopoverSize() {
  const contentElement = contentRef.value;
  if (!contentElement || typeof ResizeObserver === "undefined") return;

  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(scheduleVisibleAreaCheck);
  resizeObserver.observe(contentElement);
}

function stopObservePopoverSize() {
  resizeObserver?.disconnect();
  resizeObserver = null;
}

function handlePageScroll() {
  if (isAutoScrolling) {
    scheduleAutoScrollEnd(autoScrollIdleDelay);
    return;
  }
  visible.value = false;
}

function addPageScrollListener() {
  removePageScrollListener();
  pageScrollContainer = getScrollContainer(referenceRef.value);
  pageScrollContainer.addEventListener("scroll", handlePageScroll, { passive: true });
}

function removePageScrollListener() {
  pageScrollContainer?.removeEventListener("scroll", handlePageScroll);
  pageScrollContainer = null;
}

function clearPopoverTimers() {
  if (visibleAreaCheckTimer !== null) window.clearTimeout(visibleAreaCheckTimer);
  if (autoScrollEndTimer !== null) window.clearTimeout(autoScrollEndTimer);
  visibleAreaCheckTimer = null;
  autoScrollEndTimer = null;
}

function stopPopoverObserve() {
  stopObservePopoverSize();
  removePageScrollListener();
  clearPopoverTimers();
  autoScrollTimes = 0;
  isAutoScrolling = false;
  showMoreScrollHint.value = false;
}

function preparePopoverPosition() {
  const referenceElement = referenceRef.value;
  if (!referenceElement) return;

  const referenceRect = referenceElement.getBoundingClientRect();
  const homeRect = referenceElement.closest<HTMLElement>(".u-home")?.getBoundingClientRect();
  const boundaryLeft = Math.max(0, homeRect?.left ?? 0);
  const boundaryRight = Math.min(window.innerWidth, homeRect?.right ?? window.innerWidth);
  const boundaryWidth = boundaryRight - boundaryLeft;

  popoverWidth.value = Math.max(
    1,
    Math.min(popoverContentWidth, boundaryWidth - popoverEdgeGap * 2)
  );

  const popupOuterWidth = popoverWidth.value + popoverBorderWidth;
  const centeredLeft = referenceRect.left + referenceRect.width / 2 - popupOuterWidth / 2;
  const minLeft = boundaryLeft + popoverEdgeGap;
  const maxLeft = Math.max(minLeft, boundaryRight - popoverEdgeGap - popupOuterWidth);
  const resolvedLeft = Math.min(maxLeft, Math.max(minLeft, centeredLeft));
  const referenceCenter = referenceRect.left + referenceRect.width / 2;
  const arrowLeft = Math.min(
    popupOuterWidth - 16,
    Math.max(16, referenceCenter - resolvedLeft)
  );

  popoverOffset.value = [resolvedLeft - referenceRect.left, 8];
  popoverArrowLeft.value = arrowLeft;
}

function handleViewportResize() {
  if (!visible.value) return;
  preparePopoverPosition();
  scheduleVisibleAreaCheck();
}

function handlePopoverOpened() {
  scheduleVisibleAreaCheck();
}

function handleInnerScroll() {
  updateInnerScrollHint();
}

function handleInnerScrollMore() {
  const scrollElement = scrollRef.value;
  if (!scrollElement) return;

  scrollElement.scrollTo({
    top: scrollElement.scrollTop + innerScrollStep,
    behavior: "smooth"
  });
}

function selectItem(key: string) {
  visible.value = false;
  emit("select", key);
}

watch(visible, show => {
  if (!show) {
    stopPopoverObserve();
    return;
  }

  autoScrollTimes = 0;
  isAutoScrolling = false;
  nextTick(() => {
    if (!visible.value) return;
    addPageScrollListener();
    startObservePopoverSize();
    updateInnerScrollHint();
    scheduleVisibleAreaCheck();
  });
});

onMounted(() => {
  window.addEventListener("resize", handleViewportResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleViewportResize);
  stopPopoverObserve();
});
</script>

<template>
  <div ref="referenceRef" class="u-more-popover__reference" @click.capture="preparePopoverPosition">
    <XPopover
      v-model:show="visible"
      placement="bottom"
      trigger="click"
      overlay
      overlay-background="rgba(0, 0, 0, 0.2)"
      :offset="popoverOffset"
      :close-on-click-outside="true"
      @opened="handlePopoverOpened"
    >
      <template #reference>
        <slot />
      </template>

      <div class="u-more-popover__panel">
        <span
          class="u-more-popover__arrow"
          :style="{ left: `${popoverArrowLeft}px` }"
          aria-hidden="true"
        />
        <div ref="contentRef" class="u-more-popover__content" :style="{ width: `${popoverWidth}px` }">
          <div ref="scrollRef" class="u-more-popover__scroll" @scroll.passive="handleInnerScroll">
            <div class="u-more-popover__grid">
              <button
                v-for="menuItem in menuItems"
                :key="menuItem.key"
                type="button"
                class="u-more-popover__item"
                @click="selectItem(menuItem.key)"
              >
                <span class="u-more-popover__image-wrap">
                  <HomeSkeletonImage
                    :src="menuItem.icon"
                    :alt="menuItem.title"
                    fit="contain"
                    class="u-more-popover__icon"
                    :class="{ 'u-more-popover__icon--animated': menuItem.animated }"
                  />
                  <span v-if="menuItem.badge" class="u-more-popover__badge">{{ menuItem.badge }}</span>
                </span>
                <span class="u-more-popover__title">{{ menuItem.title }}</span>
              </button>
            </div>
          </div>
          <div v-if="showMoreScrollHint" class="u-more-popover__scroll-hint">
            <button
              type="button"
              class="u-more-popover__scroll-more"
              :aria-label="$t('更多')"
              @click.stop="handleInnerScrollMore"
            >
              <van-icon name="arrow-down" />
            </button>
          </div>
        </div>
      </div>
    </XPopover>
  </div>
</template>

<style scoped lang="less">
.u-more-popover__panel {
  position: relative;
  border: thin solid var(--skin__bg_2);
  border-radius: 7px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.9);
  box-shadow: 0 2px 6px rgba(var(--skin__web_left_bg_shadow_active__toRgbString), 0.3);
}

.u-more-popover__arrow {
  width: 11px;
  height: 11px;
  position: absolute;
  top: -6px;
  z-index: 0;
  border-top: thin solid var(--skin__bg_2);
  border-left: thin solid var(--skin__bg_2);
  background: rgba(var(--skin__bg_2__toRgbString), 0.9);
  transform: translateX(-50%) rotate(45deg);
}

.u-more-popover__reference {
  width: 100%;
  min-width: 0;

  :deep(.x-popover__reference) {
    width: 100%;
    display: block;
  }
}

.u-more-popover__content {
  max-height: min(400px, calc(100vh - 130px));
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(var(--skin__bg_2__toRgbString), 0.9);
}

.u-more-popover__scroll {
  max-height: min(400px, calc(100vh - 130px));
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.u-more-popover__scroll-hint {
  height: 36px;
  padding-bottom: 4px;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(var(--skin__bg_2__toRgbString), 0.96)
  );
  pointer-events: none;
}

.u-more-popover__scroll-more {
  width: 28px;
  height: 22px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  pointer-events: auto;
}

.u-more-popover__grid {
  padding: 10px 0 5px 5px;
  display: flex;
  flex-wrap: wrap;
  align-items: start;
}

.u-more-popover__item {
  min-width: 45px;
  max-width: 50px;
  min-height: 55px;
  margin-right: 2.5px;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  cursor: pointer;

  &:nth-child(5n) {
    margin-right: 0;
  }

  &:not(:nth-child(-n + 5)) {
    margin-top: 1px;
  }
}

.u-more-popover__image-wrap {
  width: 28.5px;
  height: 28px;
  flex: none;
  position: relative;
}

.u-more-popover__icon {
  width: 28.5px;
  height: 25px;
  background-size: cover;

  &--animated {
    width: 43px;
    height: 43px;
    position: absolute;
    top: -7.5px;
    left: 50%;
    transform: translateX(-50%);
  }
}

.u-more-popover__badge {
  max-width: 41px;
  padding: 1px 3px;
  position: absolute;
  top: -4px;
  left: 50%;
  z-index: 2;
  overflow: hidden;
  border-radius: 999px;
  color: var(--skin__text_primary);
  background: var(--skin__accent_2);
  font-size: 8px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.u-more-popover__title {
  width: 50px;
  min-height: 24px;
  margin-top: 3px;
  display: -webkit-box;
  overflow: hidden;
  color: var(--skin__neutral_1);
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  &:lang(zh) {
    font-size: 11px;
  }
}

:global([dir="rtl"]) .u-more-popover__grid {
  padding: 10px 5px 5px 0;
}

:global([dir="rtl"]) .u-more-popover__item {
  margin-right: 0;
  margin-left: 2.5px;
}

:global([dir="rtl"]) .u-more-popover__item:nth-child(5n) {
  margin-left: 0;
}

:global([dir="rtl"]) .u-more-popover__icon--animated {
  right: 50%;
  left: auto;
  transform: translateX(50%);
}

:global([dir="rtl"]) .u-more-popover__badge {
  right: 50%;
  left: auto;
}
</style>
