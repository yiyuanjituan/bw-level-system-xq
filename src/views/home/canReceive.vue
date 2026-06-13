<script setup lang="ts">
</script>

<template>
  <div class="can-receive">
    <div class="wallet-box">
      <my-wallet />
    </div>
    <div class="content-box">
      <div class="list-box">
        <div class="item-box">
          <div class="item-info">
            <div class="name">注册账号</div>
            <div class="rewards">
              <div class="rewards-item">
                <svg-icon name="comm_icon_shy" class-name="text-[12px]"></svg-icon>
                <span class="category-text">0.01</span>
              </div>
              <div class="rewards-item">
                <img src="/siteadmin/active/rmb.svg" alt="." class="w-[12px]" />
                <span class="category-text mt-[1.7px] ml-[2px]" style="color: var(--skin__accent_3);">0.01</span>
              </div>
            </div>
          </div>
          <div class="item-sub">
            <div class="source">
              <span class="time">2025/12/03 23:32</span>
              <span class="template">
                <span class="activeTypeName">来源:</span>
                <span class="source-text">任务奖励</span>
              </span>
            </div>
            <div class="receive-btn-box">
              <x-button size="small" type="primary">前 往</x-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.can-receive {
  display: flex;
  flex-direction: column;
  .wallet-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 13px;
    :deep(.currency-count) {
      font-size: 13px !important;
    }
  }
  .content-box {
    flex: 1;
    height: 0;
    overflow: auto;
    .list-box {
      min-height: calc(var(--window-height) - 148px);
      padding: 0 10px 10px;
      .item-box {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: space-between;
        min-height: 71.5px;
        padding: 10px;
        border-radius: 7px;
        background-color: var(--skin__bg_2);
        color: var(--skin__neutral_2);
        margin-top: 10px;
        box-shadow: 0 1.5px 4.5px 0 var(--skin__web_left_bg_shadow);
        &:first-child {
          margin-top: 0;
        }
        .item-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: var(--skin__neutral_2);
          font-size: 12px;
          .name {
            line-height: 20px;
            max-height: 40px;
            max-width: 225px;
            color: var(--skin__lead);
            font-size: 12px;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 5px;
            unicode-bidi: plaintext;
            flex-shrink: 0;
          }
          .rewards {
            display: flex;
            align-items: center;
            text-align: right;
            margin-bottom: 5px;
            min-width: 75px;
            max-width: 180px;
            .rewards-item {
              color: var(--skin__accent_1);
              margin: 0 7px;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.67;
              letter-spacing: normal;
              text-align: right;
              word-break: break-all;
              display: flex;
              align-items: center;
              .category-text {
                max-width: 97.5px;
                font-weight: 700;
                font-size: 12px;
                margin-left: 2px;
              }
            }
          }
        }
        .item-sub {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          .source {
            display: flex;
            font-size: 10px;
            line-height: 1.6;
            .time {
              color: var(--skin__neutral_2);
              white-space: nowrap;
              margin-right: 7px;
            }
            .template {
              max-width: 140px;
              display: inline-flex;
              align-items: center;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              .activeTypeName {
                margin-right: 2.5px;
                color: var(--skin__lead);
              }
              .source-text {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
          }
          .receive-btn-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 30px;
            :deep(.x-button) {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 75px;
              height: 30px;
              line-height: normal
            }
          }
        }
      }
    }
  }
}
</style>
