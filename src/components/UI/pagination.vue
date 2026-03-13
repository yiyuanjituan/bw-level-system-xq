<script setup lang="ts">
defineOptions({
  name: 'ui-pagination',
})
</script>

<template>
  <div class="ui-pagination">
    <div class="ui-pagination__button">
      <button type="button" class="flex items-center justify-center text-[10px] pl-[1px]">
        <svg-icon name="arrow-back"></svg-icon>
      </button>
    </div>
    <ul class="ui-pagination__items">
      <li class="ui-pagination__item ui-pagination__item--page hairline--surround"><div>1</div></li>
      <li class="ui-pagination__item ui-pagination__item--page hairline--surround"><div>···</div></li>
      <li class="ui-pagination__item ui-pagination__item--page hairline--surround"><div>3</div></li>
    </ul>
    <div class="ui-pagination__button">
      <button type="button" class="flex items-center justify-center text-[10px] pl-[1px] rotate-180">
        <svg-icon name="arrow-back"></svg-icon>
      </button>
    </div>
  </div>
</template>

<style scoped lang="less">
.ui-pagination {
  margin: 0 auto;
  width: fit-content;
  font-size: 10px;
  display: flex;
  align-items: center;

  &__button {
    flex: 1;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    text-align: center;
    height: 25px;
    >button {
      width: 25px;
      height: 25px;
      margin: 0 auto;
      border: 1px solid #242424;
      background: #191919;
      border-radius: 5px;
      color: #DFBE5B;
    }
  }
  &__items {
    flex: 1;
    display: flex;
  }
  &__item--page {
    flex-grow: 0;
  }
  &__item {
    flex: 1;
    box-sizing: border-box;
    color: #FFFFFF;
    background: #191919;
    cursor: pointer;
    user-select: none;
    border: 1px solid #242424;
    margin: 0 3.75px;
    font-weight: 400;
    min-width: 25px;
    height: 25px;
  }
  &__item, &__page-desc {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
  }
}
</style>
