<script setup lang="ts">
const typeOptions: { label: string; value: string | number; image?: string }[] = [
  { label: '电子', value: 3, image: 'game-icon_dtfl_dz_0' },
  { label: '真人', value: 1, image: 'game-icon_dtfl_zr_0' },
  { label: '捕鱼', value: 2, image: 'game-icon_dtfl_by_0' },
  { label: '彩票', value: 4, image: 'game-icon_dtfl_cp_0' },
  { label: '体育', value: 5, image: 'game-icon_dtfl_ty_0' },
  { label: '棋牌', value: 6, image: 'game-icon_dtfl_qp_0' },
  { label: '电竞', value: 7, image: 'game-icon_dtfl_dianjing_0' }
];
</script>

<template>
  <div class="cash-back-container">
    <div class="sub-info">
      <div class="data">
        <div>今日可领取</div>
        <div class="amount">
          <span class="value">0.00</span>
        </div>
      </div>
    </div>
    <div class="section-content">
      <div class="cashback-box">
        <div class="cashback-left">
          <div class="category-list">
            <div class="item" v-for="i in typeOptions" :key="i.value">
              <x-badge :content="i.value">
                <div class="item-inner-box">
                  <div class="sidebar-tab-icon">
                    <img src="https://146.103.80.124:5001/siteadmin/layoutDesign/2007366585621889025.png" alt="" srcset="" v-if="false" />
                    <svg-icon :name="i.image" />
                  </div>
                  <div class="sidebar-common-tab-name">{{ i.label.split('').join('&nbsp;') }}</div>
                </div>
              </x-badge>
            </div>
          </div>
        </div>
        <div class="cashback-right">
          <div class="ui-scroll-list">
            <div class="list-item" v-for="item in 10" :key="item">
              <div class="center">
                <div>
                  <div class="centerLeft">
                    <img src="https://146.103.80.124:5001/cocos/icon/0/200_N_PG.avif" alt="." class="icon" />
                    <div class="item">
                      <label>有效投注</label>
                      <span class="lead">0.00</span>
                    </div>
                  </div>

                  <div class="centerRight">
                    <div class="item">
                      <label>返水比例</label>
                      <span class="lead">0.60%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span class="upgradeVip">升级到VIP2可0.60%</span>
                  <p><label>可领取</label><span class="receiveAmt">0.00</span></p>
                </div>
              </div>
              <div class="arrow">
                <svg-icon name="comm_icon_fh" class-name="rotate-[180deg]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.cash-back-container {
  display: flex;
  flex-direction: column;

  .sub-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 35px;
    padding: 0 10px;
    align-items: center;
    .data {
      display: flex;
      align-items: baseline;
      font-size: 11px;
      line-height: 1.2;
      color: var(--skin__neutral_1);
      .amount {
        display: flex;
        align-items: center;
        .value {
          margin-left: 5px;
          color: var(--skin__accent_3);
        }
      }
    }
  }
  .section-content {
    width: 100%;
    flex: 1;
    max-height: 100%;
    position: relative;
    z-index: 1;
    height: 0;
    .cashback-box {
      width: 100%;
      height: 100%;
      min-height: 250px;
      padding: 0 10px;
      display: flex;
      .cashback-left {
        height: 100%;
        min-height: 250px;
        padding-top: 0;
        flex: none;
        display: flex;
        .category-list {
          flex: none;
          max-height: calc(var(--window-height) - 262px);
          padding-bottom: 0;
          overflow: auto;
          width: 85px;
          padding-right: 10px;
          .item {
            height: 45px;
            .item-inner-box {
              width: 75px;
              height: 35px;
              margin-bottom: 10px;
              background: url('@/assets/common/btn_zc1_2.avif') no-repeat;
              background-size: 100% 100%;
              display: flex;
              align-items: center;
              border-radius: 7px;
              padding: 0 3px 0 1.5px;
              color: var(--skin__left_nav_def);
              box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
              word-break: break-all;
              .sidebar-tab-icon {
                width: 24px;
                height: 18px;
                display: flex;
                flex-shrink: 0;
                justify-content: center;
                align-items: center;
                font-size: 18px;
                z-index: 6;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .sidebar-common-tab-name {
                display: -webkit-box;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 16px;
                font-size: 12px;
                width: 100%;
                margin: 0 auto;
                align-items: center;
                justify-content: center;
                text-align: center;
                z-index: 6;
              }
            }
          }
        }
      }
      .cashback-right {
        scrollbar-color: var(--skin__border) transparent;
        scrollbar-width: thin;
        overflow-x: hidden;
        overflow-y: scroll;
        flex: 1;
        flex-shrink: 0;
        .ui-scroll-list {
          padding-bottom: 20px;
          .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 53px;
            margin-bottom: 10px;
            padding: 10px 0 10px 5px;
            font-size: 10px;
            background-color: var(--skin__bg_2);
            border-radius: 6px;
            box-shadow: 0 1.5px 3.5px 0 var(--skin__web_left_bg_shadow);
            cursor: pointer;
            .center {
              flex: 1;
              padding-left: 5px;
              color: var(--skin__lead);
              > div {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .centerLeft {
                  width: 130px;
                  display: flex;
                  align-items: center;
                  .icon {
                    margin-right: 5px;
                    width: 25px;
                    height: 25px;
                  }
                }
                .centerRight {
                  display: flex;
                  align-items: center;
                  flex-shrink: 0;
                  width: 84px;
                  padding-left: 10px;
                  padding-right: 3px;
                }
                .item {
                  display: flex;
                  align-items: baseline;
                  padding-top: 3px;
                  label {
                    margin-right: 2px;
                    color: var(--skin__neutral_2);
                    word-break: break-word;
                  }
                  .lead {
                    color: var(--skin__lead);
                  }
                }
                .upgradeVip {
                  color: var(--skin__neutral_2);
                  font-size: 10px;
                  width: 130px;
                }
                > p:last-of-type {
                  flex-shrink: 0;
                  width: 84px;
                  padding-left: 10px;
                  padding-right: 3px;
                  label {
                    margin-right: 2px;
                    color: var(--skin__neutral_2);
                    word-break: break-word;
                  }
                }
                .receiveAmt {
                  color: var(--skin__accent_3);
                }
              }
            }
            .arrow {
              padding: 0 9px 0 0;
              color: var(--skin__neutral_2);
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}
</style>
