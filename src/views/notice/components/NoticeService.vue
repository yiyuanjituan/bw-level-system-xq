<script setup lang="ts">
import { $t } from "@/locales";
import { onMounted, ref } from "vue";
import { getHelpData, serviceList } from "@/api/common";
import { openUrlInNewWindow } from "@/utils/common";
import useClipboard from "vue-clipboard3";
import { showCustomToast } from "@/hooks/useCommon";

const { toClipboard } = useClipboard();
const serviceData = ref([]);
const helpData = ref([]);
const isShowDetail = ref(false);
const detailTitle = ref("");
const detailRichText = ref("");


function init() {
  serviceList().then(res => {
    serviceData.value = res;
  });
  getHelpData().then(res => {
    helpData.value = res;
  });
}

function jumpUrl(info: any, copy: boolean) {
  setTimeout(() => openUrlInNewWindow(info.url), copy ? 1000 : 0);
  if (copy) {
    toClipboard(info.account).then(() => {
      showCustomToast({ type: "success", message: $t("复制成功") });
    });
  }
}

function openDetail(item: any) {
  isShowDetail.value = true;
  detailTitle.value = item.title;
  detailRichText.value = item.content;
}

onMounted(() => init());
</script>

<template>
  <div class="service-box">
    <div class="service-inner">
      <div class="service-container-card">
        <div class="online-box">
          <div class="inner-online-customers">
            <div class="default-title">7×24在线客服</div>
            <div class="default-describe">
              专业客服在线对话，为您解决遇到的问题。
            </div>
            <div class="button-mobile">
              <div
                class="btn"
                v-for="i in serviceData.filter(v => v.type == 0)"
                @click="jumpUrl(i, false)"
              >
                <div class="inner">
                  <img :src="i.icon" alt="" srcset="" />
                  <div class="name">{{ i.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <van-tabs shrink>
          <van-tab v-if="serviceData.filter(v => v.type == 2).length > 0">
            <template #title>
              <div class="flex items-center">
                <img
                  src="/siteadmin/skin/lobby_asset/icon_kf_im.avif"
                  class="w-[18px] h-[18px] mr-[5px]"
                />其他客服
              </div>
            </template>
            <div class="py-[5px]">
              <div class="scroll-box">
                <div
                  class="other-item"
                  v-for="i in serviceData.filter(v => v.type == 2)"
                  :key="i.id"
                >
                  <img
                    :src="i.icon"
                    alt=""
                    class="w-[33px] h-[33px] rounded-[17.5px] overflow-hidden"
                  />
                  <div class="wrapper-customer-name">
                    <div class="customer-name">
                      <span class="label">昵称:</span>
                      <span class="name">{{ i.name }}</span>
                    </div>
                    <div class="customer-number">
                      <span class="account">{{ i.account }}</span>
                      <copy :text="i.account" class-name="!text-[12px]" />
                    </div>
                    <div class="online-time">
                      <span class="label">在线时间:</span>
                      <span>{{ i.time }}</span>
                    </div>
                  </div>
                  <div class="call-btn" @click="jumpUrl(i, true)">立即联系</div>
                </div>
              </div>
            </div>
          </van-tab>
          <van-tab v-if="serviceData.filter(v => v.type == 1).length > 0">
            <template #title>
              <div class="flex items-center">
                <img
                  src="/siteadmin/skin/lobby_asset/icon_im_telegram.avif"
                  class="w-[18px] h-[18px] mr-[5px]"
                />Telegram客服
              </div>
            </template>
            <div class="py-[5px]">
              <div class="scroll-box">
                <div
                  class="other-item"
                  v-for="i in serviceData.filter(v => v.type == 1)"
                  :key="i.id"
                >
                  <img
                    :src="i.icon"
                    alt=""
                    class="w-[33px] h-[33px] rounded-[17.5px] overflow-hidden"
                  />
                  <div class="wrapper-customer-name">
                    <div class="customer-name">
                      <span class="label">昵称:</span>
                      <span class="name">{{ i.name }}</span>
                    </div>
                    <div class="customer-number">
                      <span class="account">{{ i.account }}</span>
                      <copy :text="i.account" class-name="!text-[12px]" />
                    </div>
                    <div class="online-time">
                      <span class="label">在线时间:</span>
                      <span>{{ i.time }}</span>
                    </div>
                  </div>
                  <div class="call-btn" @click="jumpUrl(i, true)">立即联系</div>
                </div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <div class="help-box">
        <div class="search-box">
          <div class="help-title">帮助中心</div>
          <div class="search-bar">
            <div class="search-info">请输入您的问题</div>
            <svg-icon name="comm_icon_ss" class="text-[15px]" />
          </div>
        </div>
        <div class="list-box">
          <van-tabs shrink>
            <van-tab v-for="i in helpData" :key="i.id">
              <template #title>
                <div class="custom-item-btn">
                  <img :src="i.icon" alt="" srcset="" class="icon-img" />
                  <span class="mt-[2px]">{{ i.name }}</span>
                </div>
              </template>
              <div class="question-list">
                <div class="question-item" v-for="(item, index) in i.children" :key="index" @click="openDetail(item)">
                  <div class="left-box">
                    <div class="sort-no">{{ index + 1 }}、</div>
                    <div class="title">{{ item.title }}</div>
                  </div>
                  <svg-icon name="comm_icon_fh" class-name="rotate-[180deg]" />
                </div>
              </div>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </div>

    <van-popup v-model:show="isShowDetail" position="bottom" :overlay-style="{ 'backdrop-filter': 'blur(5px)' }">
      <div class="body-content">
        <header class="header">
          <div class="btn-close" @click="isShowDetail = false">
            <svg-icon name="comm_icon_fh" />
          </div>
          <p class="title">{{ detailTitle }}</p>
        </header>
        <div class="main-box">
          <div class="question-answer" v-html="detailRichText"></div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="less">
.service-box {
  height: 100%;
  position: relative;
  overflow: auto;
  padding: 10px;
  background: #000;
  .service-inner {
    height: 100%;
    overflow: auto;

    .service-container-card {
      background-color: var(--skin__bg_2);
      border-radius: 7px;
      box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.06);
      .online-box {
        padding: 10px 10px 15px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        flex-direction: column;
        .inner-online-customers {
          .default-title {
            color: var(--skin__lead);
            font-size: 14px;
            font-style: normal;
            font-weight: 600;
          }
          .default-describe {
            margin-top: 5px;
            color: var(--skin__neutral_2);
            font-size: 12px;
          }
          .button-mobile {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            margin-top: 10px;

            .btn {
              width: 105px;
              height: 31px;
              margin-right: 10px;
              font-size: 11px;
              line-height: 15px;
              text-align: center;
              padding: 0 7px;
              border-radius: 5px;
              color: var(--skin__primary);
              border: var(--lobby__px) solid var(--skin__primary);
              .inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                height: 100%;
                img {
                  width: 19px;
                  height: 19px;
                  border-radius: 50%;
                }
                .name {
                  width: 100%;
                  display: -webkit-box;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  vertical-align: middle;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
              }
            }
          }
        }
      }

      .scroll-box {
        scrollbar-color: var(--skin__border) transparent;
        scrollbar-width: thin;
        overflow-x: hidden;
        overflow-y: scroll;
        max-height: 212.5px;
        width: 100%;

        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        font-size: 10px;

        .other-item {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
          height: 71px;
          padding: 10px 0;
          font-size: 7px;
          border-bottom: var(--lobby__px) solid var(--skin__border);
          .wrapper-customer-name {
            flex: 1;
            min-width: 75px;
            margin: 0 7px;

            .customer-name {
              width: 100%;
              margin: 0;
              padding-bottom: 0;
              font-size: 13px;
              color: var(--skin__lead);
              font-weight: 600;
              line-height: 17.5px;
              display: flex;
              .label {
                display: inline-block;
                color: var(--skin__neutral_2);
                font-weight: 400;
                margin-right: 4px;
                font-size: 13px;
              }
              .name {
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                flex: 1;
              }
            }

            .customer-number {
              font-size: 12px;
              line-height: 16.5px;
              color: var(--skin__primary);
              cursor: pointer;
              display: flex;
              .account {
                display: inline-block;
                color: var(--skin__lead);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin-right: 4px;
              }
            }
            .online-time {
              font-size: 11px;
              color: var(--skin__neutral_2);
              line-height: 15px;
              display: flex;
            }
          }

          .call-btn {
            width: 60px;
            height: 25px;
            padding: 0 3px;
            font-size: 10px;
            line-height: 12px;
            border-radius: 5px;
            color: var(--skin__text_primary);
            background: var(--skin__primary);
            border: var(--lobby__px) solid var(--skin__primary);
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }

    .help-box {
      background-color: var(--skin__bg_2);
      border-radius: 7px;
      box-shadow: 0 1.5px 4.5px rgba(0, 0, 0, 0.06);
      margin-top: 10px;
      padding: 10px;
      margin-bottom: 10px;
      .search-box {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        justify-content: space-between;
        .help-title {
          width: 120px;
          font-size: 14px;
          font-weight: 600;
          color: var(--skin__lead);
        }
        .search-bar {
          width: 210px;
          height: 30px;
          padding: 0 10px;
          align-items: center;
          border-radius: 15px;
          display: flex;
          border: 0.5px solid var(--skin__neutral_3);
          background: var(--skin__bg_2);
          justify-content: space-between;
          cursor: pointer;
          color: var(--skin__primary);

          .search-info {
            color: var(--skin__neutral_2);
            font-size: 12px;
            width: 165px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
      .list-box {
        --van-tabs-bottom-bar-color: transparent;

        :deep(.van-tab--active) {
          .custom-item-btn {
            border: var(--lobby__px) solid var(--skin__primary);
            background: var(--skin__primary);
            color: var(--skin__text_primary);
          }
        }

        :deep(.van-tabs__wrap) {
          padding-left: 0;
          padding-right: 0;
        }

        :deep(.van-tabs .van-tab) {
          padding-left: 0;
          padding-right: 0;
          margin-right: 0px;
        }

        .custom-item-btn {
          min-width: 70px;
          height: 27.5px;
          font-size: 12px;
          padding: 0 8px;
          width: auto;
          display: flex;
          align-items: center;
          line-height: 16.5px;
          color: var(--skin__neutral_1);
          border: var(--lobby__px) solid var(--skin__primary);
          border-color: var(--skin__border);
          border-radius: 7px;
          margin-right: 8px;

          .icon-img {
            width: 16px;
            height: 16px;
            margin-right: 3px;
          }
        }

        .question-list {
          margin: 0;
          padding: 0;
          list-style: none;
          .question-item {
            display: flex;
            align-items: center;
            padding: 6px 0;
            font-size: 12px;
            border-bottom: var(--lobby__px) solid var(--skin__border);
            cursor: pointer;
            color: var(--skin__lead);
            .left-box {
              display: flex;
              align-items: center;
              flex: 1;
              height: 28px;
              .title {
                margin-right: 5px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 250px;
              }
            }
          }
        }
      }
    }
  }

  .body-content {
    height: calc(100dvh - 100px);
    border-radius: 10px 10px 0 0;
    background-color: var(--skin__bg_2);
    color: var(--skin__lead);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .header {
      width: 100%;
      height: 40px;
      position: relative;
      .btn-close {
        position: absolute;
        padding: 0 10px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        left: 0;
        top: 0;
        color: var(--skin__neutral_1);
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .title {
        font-size: 17px;
        font-weight: 600;
        color: var(--skin__lead);
        line-height: 40px;
        margin: auto;
        text-align: center;
        white-space: nowrap;
        overflow-x: auto;
        max-width: 300px;
      }
    }

    .main-box {
      overflow-x: hidden;
      overflow-y: scroll;
      height: 100%;
      padding: 0 10px 10px;
      .question-answer {
        color: var(--skin__neutral_1);
        word-break: break-word;
        font-size: 12px;
      }
    }
  }
}
</style>
