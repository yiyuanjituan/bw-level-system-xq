<script setup lang="ts">
defineOptions({
  name: 'ui-button'
})

interface Props {
  loading?: boolean,
  plain?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  plain: false,
});

</script>

<template>
  <div class="ui-button" :class="{ 'ui-button-plain': plain }">
    <div class="ui-button__content">
      <div class="ui-button__text">
        <slot />
      </div>
      <div class="justify-start flex" style="transition: width 300ms" v-if="props.loading">
        <div style="flex-shrink: 0">
          <div class="ui-button__loading">
            <div class="ui-dot-loading">
              <div class="ui-dot-loading__icon"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-button {
  margin-right: 15px;
  cursor: default;
  display: block;
  height: 35px;
  padding: 0 8.28px;
  font-size: 12px;
  width: 100%;
  color: #874404;
  background: #f0c059;
  border: 1px solid #f0c059;
  position: relative;
  box-sizing: border-box;
  line-height: 1.2;
  text-align: center;
  border-radius: 7px;
  transition: opacity 0.2s;
  appearance: none;

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &__text {
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 12px;
  }

  &__loading {
    color: inherit;
    font-size: inherit;
    margin-right: 2px;
    .ui-dot-loading {
      --double-size: 6px;
      --double-space: 12px;
      --left-space: calc(-1 * var(--double-space));
      --right-space: var(--double-space);
      --opacity: 0.15;
      --skin__text_primary__toRgbString: 135,68,4;
      width: 16px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 3px;
      &__icon {
        width: var(--double-size);
        aspect-ratio: 1;
        border-radius: 50%;
        transform: scale(.5);
        transform-origin: center center;
        animation: _dot_loading 1s infinite
        linear alternate;
      }

      @keyframes _dot_loading {
        0% {
          box-shadow: var(--right-space) 0 rgba(var(--skin__text_primary__toRgbString), 1), var(--left-space) 0 rgba(var(--skin__text_primary__toRgbString), var(--opacity));
          background: rgba(var(--skin__text_primary__toRgbString), 1);
        }
        33% {
          box-shadow: var(--right-space) 0 rgba(var(--skin__text_primary__toRgbString), 1), var(--left-space) 0 rgba(var(--skin__text_primary__toRgbString), var(--opacity));
          background: rgba(var(--skin__text_primary__toRgbString), var(--opacity));
        }
        66% {
          box-shadow: var(--right-space) 0 rgba(var(--skin__text_primary__toRgbString), var(--opacity)), var(--left-space) 0 rgba(var(--skin__text_primary__toRgbString), 1);
          background: rgba(var(--skin__text_primary__toRgbString), var(--opacity));
        }
        100% {
          box-shadow: var(--right-space) 0 rgba(var(--skin__text_primary__toRgbString), var(--opacity)), var(--left-space) 0 rgba(var(--skin__text_primary__toRgbString), 1);
          background: rgba(var(--skin__text_primary__toRgbString), 1);
        }
      }
    }
  }
}
.ui-button-plain {
  background: transparent;
  color: #f0c059;
}

</style>
