<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "UiTabs"
});

interface Props {
  list?: any[],
  indicator?: boolean,
  showLine?: boolean,
  showGap?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  indicator: true,
  showLine: true,
  showGap: true,
});

const wrapScrollLeft = ref(0);
const wrapScrollMaxWidth = ref(300);
const scrollBoxRef = ref(null);

function onWrapScroll(e) {
  wrapScrollLeft.value = e.target.scrollLeft;
  wrapScrollMaxWidth.value = e.target.scrollWidth - e.target.clientWidth;
}

function scrollToLeft() {
  scrollBoxRef.value.scrollTo({ left: 0, behavior: "smooth" });
}

function scrollToRight() {
  scrollBoxRef.value.scrollTo({
    left: 9999,
    behavior: "smooth"
  });
}

</script>

<template>
  <div class="ui-tabs ui-tabs--line">
    <div class="ui-tabs__wrap">
      <div class="ui-tabs__navigation-prev ui-tabs__navigation-prev--left" v-if="wrapScrollLeft >= 10 && props.indicator" @click="scrollToLeft">
        <section class="left-icon">
          <i class="inline-flex items-center justify-center icon">
            <svg width="1em" height="1em" fill="currentColor" class="">
              <use xlink:href="#comm_icon_fh"></use>
            </svg>
          </i>
        </section>
      </div>
      <div class="scroll-content-box" :class="{ 'show-line': props.showLine }" @scroll="onWrapScroll" ref="scrollBoxRef">
        <div class="ui-tab" v-for="(item, index) in props.list" :key="item" :class="{ 'ml-[22.5px]': index != 0 && props.showGap }">
          <slot name="tab" :row="item" />
          <template v-if="!$slots.tab">
            <section class="tab-item-title">
              <section class="icon" v-if="item.img">
                <img class="w-[100%] h-[100%]" :src="item.img" alt="." />
              </section>
              <p class="text">
                {{ item.name.length == 2 ? `${item.name[0]}  ${item.name[1]}` : item.name }}
              </p>
            </section>
          </template>
        </div>
      </div>
      <div
        class="ui-tabs__navigation-next ui-tabs__navigation-next--right"
        v-if="wrapScrollMaxWidth - wrapScrollLeft >= 10 && props.indicator"
        @click="scrollToRight"
      >
        <section class="right-icon">
          <i class="inline-flex items-center justify-center icon">
            <svg width="1em" height="1em" fill="currentColor" class="">
              <use xlink:href="#comm_icon_fh"></use>
            </svg>
          </i>
        </section>
      </div>
    </div>
    <div class="ui-tabs__content">
      <template v-for="(item, index) in props.list" :key="index">
        <div class="ui-tab__panel">
          <slot name="panel" :row="item" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-tabs {
  position: relative;

  &__wrap {
    position: relative;
    padding-left: 10px;
    padding-right: 10px;
    overflow: hidden;

    .ui-tabs__navigation-prev {
      z-index: 3;
      position: absolute;
      display: flex;
      align-items: center;

      &--left {
        left: 5px;
        height: 15px;
        top: calc(50% - 7.5px);
      }

      .left-icon {
        left: -1px;
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 18px;
        height: 18px;
        background-color: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;

        .icon {
          transform: translate(-1px, -0.5px);
          font-size: 7px;
          color: white;
        }
      }
    }

    .ui-tabs__navigation-next {
      z-index: 3;
      position: absolute;
      display: flex;
      align-items: center;

      &--right {
        right: 5px;
        height: 15px;
        top: calc(50% - 7.5px);
      }

      .right-icon {
        right: -1px;
        transform: translateY(-50%) rotate(180deg);
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 18px;
        height: 18px;
        background-color: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;

        .icon {
          transform: translate(-1px, -0.5px);
          font-size: 7px;
          color: white;
        }
      }
    }

    .scroll-content-box {
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 0;
      box-sizing: content-box;
      height: 100%;
      position: relative;
      display: flex;
      background: transparent;
      user-select: none;
      scrollbar-width: none;
      &.show-line {
        border-bottom: 1px solid #313843;
      }

      .ui-tab {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        color: inherit;
        font-size: 14px;
        line-height: 10px;
        cursor: pointer;
        flex: none;

        .tab-item-title {
          width: auto;
          min-width: 40px;
          max-width: 150px;
          padding-top: 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #68707b;

          .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 23px;
            font-size: 30px;
          }

          .text {
            display: block;
            white-space: nowrap;
            --webkit-line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-top: 3px;
            height: 2em;
            width: 100%;
            font-size: 12px;
            line-height: 1;
            text-align: center;
            word-break: break-word;
            z-index: 3;
          }
        }
      }
    }
  }

  &--line .ui-tabs__wrap {
    min-height: 30px;
  }

  &__content {
    .ui-tab__panel {
    }
  }
}
</style>
