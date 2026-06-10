<script lang="ts" setup>

const typeOptions: any[] = [
  { label: "真人", value: 1 },
  { label: "捕鱼", value: 2 },
  { label: "电子", value: 3 },
  { label: "彩票", value: 4 },
  { label: "体育", value: 5 },
  { label: "棋牌", value: 6 },
  { label: "电竞", value: 7 }
];

</script>

<template>
  <div class="cashback-rates-page">
    <sub-navbar title="返水比例" />
    <div class="body-box">
      <div class="search-header">
        <div class="thead-item">
          <div class="thead-cel">
            <x-select />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cashback-rates-page {
  .body-box {
    padding: 0 10px;
    .search-header {
      height: 45px;
      display: flex;
      align-items: center;
      background-color: var(--skin__bg_1);
      min-height: 40px;
      text-align: center;
      border-radius: 5px;
      .thead-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        font-size: 12px;
        color: var(--skin__lead);
        line-height: 15px;
        word-break: break-word;
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
        }
        .thead-cel {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--skin__lead);
          overflow: visible;
          word-break: break-word;
          text-overflow: ellipsis;
          vertical-align: middle;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
}
</style>