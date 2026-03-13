<script lang="ts" setup>
import SubNavbar from "@/components/SubNavbar.vue";
import UiInput from "@/components/UI/input.vue";
import { computed, nextTick, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import UiTabs from "@/components/UI/tabs.vue";
import UiPagination from "@/components/UI/pagination.vue";
import UiLoading from "@/components/UI/loading.vue";
import { useRoute } from "vue-router";
import useAppStore from "@/store/modules/app";
import router from "@/router";
import { getGameListById } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import UiEmpty from "@/components/UI/empty.vue";
import useDataStore from "@/store/modules/data";

const showNext = ref<boolean>(false);
const route = useRoute();
const app = useAppStore();
const appData = useDataStore();
const gameTypeVenueList = ref<any[]>([])
const gameTypeVenueId = ref<string|number>(0)
const
// 使用枚举定义
enum RightKeyEnum {
  ALL = 'all',
  HOT = 'hot',
  LAST = 'last',
  COLLECT = 'collect'
}
interface RightItem {
  key: RightKeyEnum
  name: string
}
const rightList = ref<RightItem[]>([
  { key: RightKeyEnum.ALL, name: "全部" },
  { key: RightKeyEnum.HOT, name: "热门" },
  { key: RightKeyEnum.LAST, name: "最近" },
  { key: RightKeyEnum.COLLECT, name: "收藏" },
])
const rightKey: Ref<RightKeyEnum> = ref(RightKeyEnum.ALL)
const isLoading = ref<boolean>(false)
const gameList = computed(() => {
  const id = Number(gameTypeVenueId.value)
  const info = app.gameList.find(v => v.id == id)
  return info?.children ?? []
})

function handleScroll(e) {
  const { scrollHeight, scrollTop, clientHeight } = e.target;
  showNext.value = scrollHeight - scrollTop - clientHeight > 2;
}

function showTip() {
  // @ts-ignore
  showCustomToast({ type: 'fail', message: $t('tips.maintenance') })
}

function updateActiveKey(key: any) {
  rightKey.value = key;
  handleChangeTab({ id: 0 })
}

const typeData = computed(() => {
  const type = route.query?.type;
  if (!type) return { name: '' };
  if (type == '1') return { name: '真人', image: 'game-icon_dtfl_zr_0' };
  if (type == '2') return { name: '捕鱼', image: 'game-icon_dtfl_by_0' };
  if (type == '3') return { name: '电子', image: 'game-icon_dtfl_dz_0' };
  if (type == '4') return { name: '彩票', image: 'game-icon_dtfl_cp_0' };
  if (type == '5') return { name: '体育', image: 'game-icon_dtfl_ty_0' };
  if (type == '6') return { name: '棋牌', image: 'game-icon_dtfl_qp_0' };
  if (type == '7') return { name: '电竞', image: 'game-icon_dtfl_dianjing_0' };
  if (type == '100') return { name: '最近' };
  if (type == '101') return { name: '收藏' };
  return
})

function init() {
  const type = route.query?.type;
  gameTypeVenueList.value = app.venueList.filter(v => v.type == type)
  // 设置激活的按钮
  gameTypeVenueId.value = Number(route.query?.platformId)
  // 设置rightList
  if (gameTypeVenueId.value === 0) {
    rightList.value = [
      { key: RightKeyEnum.HOT, name: "热门" },
      { key: RightKeyEnum.LAST, name: "最近" },
      { key: RightKeyEnum.COLLECT, name: "收藏" },
    ]
    if (rightKey.value == 'all') rightKey.value = RightKeyEnum.HOT
  } else {
    rightList.value = [
      { key: RightKeyEnum.ALL, name: "全部" },
      { key: RightKeyEnum.HOT, name: "热门" },
      { key: RightKeyEnum.LAST, name: "最近" },
      { key: RightKeyEnum.COLLECT, name: "收藏" },
    ]
    if (rightKey.value != 'all') rightKey.value = RightKeyEnum.ALL
  }
  loadGameListData();
}

function loadGameListData() {
  isLoading.value = true;
  const params = {
    id: gameTypeVenueId.value,
    type: route.query?.type,
    mode: rightKey.value
  }
  getGameListById(params).finally(() => isLoading.value = false).then((res) => {
    app.setGameList(Number(gameTypeVenueId.value), res)
  })
}

async function handleChangeTab(record: any) {
  await router.replace({ path: route.path, query: { ...route.query, platformId: record.id } });
  // 强制重新渲染
  await nextTick()
}

watch(() => route.fullPath, (newVal, oldVal) => init())

function enterGame(record: any) {
  appData.setEnterInfo(record.venueId, record.id);
  router.push({ path: '/home/embedded' })
}

function checkHistory() {
  if (window.history.state.back == window.history.state.current) {
    window.history.go(-2)
  }
}

onMounted(() => {
  init();
  checkHistory();
})
</script>

<template>
  <div class="secondary-page detail">
    <sub-navbar :title="typeData.name" />
    <div class="content">
      <div class="page-body">
        <div class="search-layout">
          <div class="search-bar">
            <ui-input placeholder="搜索游戏">
              <template #suffix>
                <svg-icon name="comm_icon_ss" color="#dfbe5b"></svg-icon>
              </template>
            </ui-input>
          </div>
        </div>
        <div class="content-layout">
          <div class="inner-box">
            <div class="slider-box">
              <div class="tabs">
                <div class="tabs__wrap">
                  <div class="scroll-box" @scroll="handleScroll">
                    <div class="ui-tab" v-if="typeData.image">
                      <div class="inner" :class="{ 'active-inner': gameTypeVenueId == 0 }" @click="handleChangeTab({ id: 0 })">
                        <svg-icon :name="typeData.image" class-name="text-[25px]" />
                        <p class="mt-[1px]">{{ typeData.name }}</p>
                      </div>
                    </div>
                    <div class="ui-tab" v-for="(item, index) in gameTypeVenueList" :key="index">
                      <div class="inner" :class="{ 'active-inner': gameTypeVenueId == item.id }" @click="handleChangeTab(item)">
                        <img :src="item.short_image" alt="" />
                        <p class="">{{ item.archiveCode }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="next-box" v-if="showNext">
                    <div class="down-indicator">
                      <svg-icon name="img_scroll_jt"></svg-icon>
                      <svg-icon name="img_scroll_jt"></svg-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="right-box">
              <ui-tabs :list="rightList" :indicator="false" :show-line="false" :show-gap="false">
                <template v-slot:tab="{ row }">
                  <div class="nav-btn" :class="{ active: rightKey == row.key }" @click="updateActiveKey(row.key)">
                    {{ row.name }}
                  </div>
                </template>
              </ui-tabs>
              <div class="grid-game-col flex-1">
                <div class="w-[100%] h-[100%] flex items-center justify-center pb-[100px]" v-if="isLoading && gameList.length == 0">
                  <ui-loading />
                </div>
                <ui-empty v-if="!isLoading && gameList.length == 0" />
                <div class="scroll-box" v-if="gameList.length > 0">
                  <div class="grid-box">
                    <template v-for="(item) in gameList" :key="item.id">
                      <div class="card-item w-[80px] h-[107px]" :style="{ '--bg-img': `url(${item.image})` }" @click="enterGame(item)">
                        <section class="card-title">
                          <h4 class="name-inner">{{ item.name }}</h4>
                        </section>
                        <div class="thumb-icon" v-if="false"></div>
                        <div class="collect-icon">
                          <img src="@/assets/home/btn_sc_off_2.avif" alt="" srcset="" class="collect-img" v-if="true" />
                          <img src="@/assets/home/btn_sc_on_2.avif" alt="" srcset="" class="collect-img" v-if="false" />
                        </div>
                        <div class="disabled-box" @click.stop="showTip" v-if="!item.isOpen">
                          <div class="disabled-icon text-white"></div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="footer" v-if="!isLoading && gameList.length > 30">
                <ui-pagination />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.detail {
  background: #000;
  color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.content {
  width: 100%;
  flex: 1 1 0;
  max-height: 100%;
  position: relative;
  z-index: 1;
  overflow: hidden;

  .page-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    .search-layout {
      margin: 10px 10px 0;
      flex-shrink: 0;
      .search-bar {
        .ui-input {
          height: 25px;
          border-radius: 13px;
        }
      }
    }
    .content-layout {
      padding: 10px 10px 0;
      overflow: hidden;
      flex-grow: 1;
      height: 100%;
      .inner-box {
        display: flex;
        height: 100%;
        .slider-box {
          flex-shrink: 0;
          flex-grow: 0;
          margin-right: 10px;

          position: relative;
          padding-bottom: 5px;

          .tabs {
            height: 100%;
            width: fit-content;
            .tabs__wrap {
              height: calc(100% + 3.5px);
              margin: -1px -5px -2.5px;
              padding: 1px 5px 2.5px;
              overflow: visible;
              min-height: 30px;
              .next-box {
                width: 100%;
                position: absolute;
                left: 0px;
                bottom: -2.5px;
                z-index: 100;

                height: 32.5px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-image: linear-gradient(
                  to bottom,
                  transparent,
                  rgba(0, 0, 0, 0.6) 35%,
                  rgba(0, 0, 0, 0.8) 45%,
                  rgba(0, 0, 0, 0.9) 50%,
                  rgba(0, 0, 0, 1) 60%,
                  #000
                );
                .down-indicator svg {
                  margin: -3px 0;
                  width: 11px;
                  height: 11px;
                  color: #dfbe5b;
                  transform: rotate(90deg);
                  &:first-of-type {
                    opacity: 0.6;
                    margin: -6px 0;
                  }
                }
              }

              .scroll-box {
                box-sizing: border-box;
                margin: -5px;
                padding: 5px;
                overflow: hidden scroll;
                position: relative;
                display: flex;
                background: transparent;
                user-select: none;
                scrollbar-width: none;
                flex-direction: column;
                height: 100%;

                .ui-tab {
                  margin-top: 10px;
                  flex: 0 0 auto;
                  padding: 0;
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-sizing: border-box;
                  color: inherit;
                  font-size: 14px;
                  line-height: 10px;
                  cursor: pointer;
                  &:first-child {
                    margin-top: 0;
                  }
                  .inner {
                    background-image: url(@/assets/home/btn_zc2_2.avif);
                    width: 75px;
                    height: 52.5px;
                    padding: 0 2.5px;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9px;
                    display: flex;
                    background-size: 100% 100%;
                    box-shadow: 0 1.5px 3.5px 0 #0000001f;
                    word-break: break-word;
                    color: #b1b3bc;

                    img {
                      width: 25px;
                      height: auto;
                      max-height: 25px;
                      z-index: 2;
                      max-width: 100%;
                    }
                    p {
                      font-size: 12px;
                      line-height: 13px;
                      display: -webkit-box;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      vertical-align: middle;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      color: #bcbcbc;
                      position: relative;
                      width: 100%;
                      margin: 0 auto;
                      align-items: center;
                      justify-content: center;
                      text-align: center;
                      z-index: 6;
                    }
                  }
                  .active-inner {
                    background-image: url(@/assets/home/btn_zc2_1.avif);
                    color: #fff;
                    p {
                      color: #fff;
                    }
                  }
                }
              }
            }
          }
        }

        .right-box {
          flex: 1;
          width: 0;
          display: flex;
          flex-direction: column;

          :deep(.ui-tabs__wrap) {
            padding-left: 0;
            padding-right: 0;
          }
          .nav-btn {
            font-size: 11px;
            line-height: 10px;
            flex: none;
            margin-right: 8px;
            padding: 0 2.5px;
            flex-shrink: 0;
            flex-grow: 0;
            width: 70px;
            height: 27.5px;
            word-break: break-word;
            background-color: #191919;
            //border-color: #242424;
            color: #bcbcbc;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 7px;
            border: 1px solid rgb(36, 36, 36);
            &.active {
              --skin__primary: #dfbe5b;
              background: var(--skin__primary);
              color: white;
              height: 28px;
            }
          }

          .grid-game-col {
            margin-top: 8px;

            position: relative;
            box-sizing: content-box;
            width: 100%;
            z-index: 1;
            min-height: 150px;
            height: 150px;
            margin-right: -6.5px;
            margin-left: -6.5px;
            padding-right: 6.5px;
            padding-left: 6.5px;
            flex: 1;
            max-height: 100%;
            .scroll-box {
              scrollbar-color: #242424 transparent;
              scrollbar-width: thin;
              overflow: auto;

              position: absolute;
              top: 0;
              box-sizing: border-box;
              width: 100%;
              height: 100%;
              min-height: 300px;
              margin-right: -6.5px;
              margin-left: -6.5px;
              padding-right: 6.5px;
              padding-left: 6.5px;
              .grid-box {
                width: 260px;
                display: flex;
                flex-wrap: wrap;
                column-gap: 10px;
                row-gap: 10px;
              }
              .card-item {
                background: #1b1b1b;
                background-image: var(--bg-img);
                border-radius: 10px;
                background-size: cover;
                background-repeat: no-repeat;
                position: relative;
                overflow: hidden;

                .card-title {
                  box-sizing: border-box;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  height: 26px;
                  padding: 0 3px 3px;
                  color: #fff;
                  font-size: 9px;
                  word-wrap: break-word;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                  line-height: 1.25;
                  position: absolute;
                  bottom: 0;
                }
                .name-inner {
                  font-weight: bolder;
                }
                .thumb-icon {
                  background-image: url(@/assets/home/img_game_tj1_1.avif);
                  position: absolute;
                  top: -0.5px;
                  left: -0.5px;
                  z-index: 8;
                  width: 25px;
                  height: 21px;
                  background-size: 100% 100%;
                }
                .collect-icon {
                  position: absolute;
                  top: 3px;
                  right: 3px;

                  z-index: 9;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: fit-content;
                  height: fit-content;
                  margin: -3px;
                  padding: 3px;
                  line-height: 0;
                  cursor: pointer;
                  .collect-img {
                    width: 17px;
                    height: 17px;
                    font-size: 17px;
                    border-radius: 50%;
                    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
                    background-size: 100% 100%;
                  }
                }

                .disabled-box {
                  position: absolute;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  left: 0;
                  z-index: 9;
                  text-align: center;
                  background-color: rgba(0, 0, 0, 0.5);
                  border-radius: 0;
                  cursor: not-allowed;
                  opacity: 1;
                  transition: opacity .6s;
                  .disabled-icon {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80px;
                    height: 80px;
                    background: url(@/assets/home/img_whz_style_13.avif) no-repeat;
                    background-size: 100% 100%;
                  }
                }
              }
            }
          }

          .footer {
            margin-top: 10px;
            margin-bottom: 15px;
            width: 100%;
            z-index: 10;
          }
        }
      }
    }
  }
}
</style>
