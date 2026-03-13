<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import UiTabs from "@/components/UI/tabs.vue";
import { computed, nextTick, onMounted, ref } from "vue";
import "swiper/css";
import "swiper/css/pagination";
import { getHomeApiData } from "@/api/common";
import { showCustomToast } from "@/hooks/useCommon";
import { $t } from "@/locales";
import router from "@/router";
import useHomeDataStore from "@/store/modules/home";

const home = useHomeDataStore();

const localList = ref([
  {
    img: "./siteadmin/skin/lobby_asset/icon_dtfl_rm_1.avif",
    name: "热门",
    pageShowNum: 9,
    children: home.suggestList
  },
  {
    img: "https://146.103.80.124:5001/siteadmin/skin/lobby_asset/2-1-common/common/_sprite/icon_dtfl_zj_1.avif",
    name: "最近"
  },
  {
    img: "https://146.103.80.124:5001/siteadmin/skin/lobby_asset/2-1-common/common/_sprite/icon_dtfl_sc_1.avif",
    name: "收藏"
  }
])

const list = computed(() => {
  return [
    localList.value[0],
    ...home.venueList,
    localList.value[1],
    localList.value[2],
  ]
})

defineOptions({
  name: "HomeGameList"
});

function getHomeData() {
  getHomeApiData().then(res => {
    home.setSuggestData(res.suggestData)
    home.setVenueList(res.venueList)
    nextTick()
  });
}

function showDisabledTip() {
  // @ts-ignore
  showCustomToast({ type: 'fail', message: $t('tips.maintenance') })
}

function clickGameItem(record: any) {
  if (record.gameMode == 'venue') {
    // 点击的场馆
    router.push({ path: `/home/subGame`, query: { type: record.type, platformId: record.id } });
  } else {
    // 点击的游戏，处理点击游戏的方法
  }
  console.log(record);
}

onMounted(() => getHomeData());
</script>

<template>
  <ui-tabs :list="list">
    <template #panel="{ row }">
      <section class="game-list-box" v-if="row.children && row.children.length">
        <div class="list-slide-box">
          <section class="arrow-load-view">
            <div class="game-headline">
              <div class="title">
                <img :src="row.img" alt="" class="mr-[2.5px] w-[26px] text-[26px]"/>
                <span class="text-[15px]">{{ row.name }}游戏</span>
              </div>
              <div class="switch-pagination-box">
                <div class="switch-pagination">
                  <div class="arrow-btn">
                    <i
                      class="inline-flex justify-center items-center left-icon"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        class=""
                      >
                        <use xlink:href="#comm_icon_fy_jt"></use>
                      </svg>
                    </i>
                  </div>
                  <div class="btn-all-inside">全部</div>
                  <div class="arrow-btn">
                    <i class="inline-flex justify-center items-center">
                      <svg
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        class=""
                      >
                        <use xlink:href="#comm_icon_fy_jt"></use>
                      </svg>
                    </i>
                  </div>
                </div>
              </div>
            </div>
            <div class="list-slide-layout">
              <swiper class="" :space-between="15">
                <template v-for="(item, index) in Math.ceil(row.children.length / (row.pageShowNum ?? 6))" :key="item">
                  <swiper-slide class="list-slide-layout-inner" :data-length="Math.min((row.pageShowNum ?? 6), row.children.length)" :class="(row.pageShowNum ?? 6) == 9 ? 'list-slide-layout-nine' : ''">
                    <template v-for="(_, idx) in (row.pageShowNum ?? 6)">
                      <div class="item" :style="{ '--bg-img': `url(${row.children[index * (row.pageShowNum ?? 6) + idx]?.image})` }" @click="clickGameItem(row.children[index * (row.pageShowNum ?? 6) + idx])">
                        <section class="w-100% h-46px px-[5px] pb-[5px] text-white text-[16px]">
                          <span class="name-inner" v-if="row.children[index * (row.pageShowNum ?? 6) + idx]?.gameMode == 'game'">
                            {{ row.children[index * (row.pageShowNum ?? 6) + idx]?.name }}
                          </span>
                        </section>
                        <section class="disabled-box" v-if="row.children[index * (row.pageShowNum ?? 6) + idx]?.isOpen == 0" @click.stop="showDisabledTip">
                          <div class="disabled-icon text-white"></div>
                        </section>
                      </div>
                    </template>
<!--                    <div class="item">-->
<!--                      <section-->
<!--                        class="w-100% h-46px px-[5px] pb-[5px] text-white text-[16px]"-->
<!--                      >-->
<!--                        <span class="name-inner">麻将胡了2</span>-->
<!--                      </section>-->
<!--                    </div>-->
                  </swiper-slide>
                </template>
              </swiper>
            </div>
          </section>
        </div>
      </section>
    </template>
  </ui-tabs>
</template>

<style scoped lang="less">
.game-list-box {
  padding-top: 15px;

  .list-slide-box {
    .arrow-load-view {
      display: flex;
      flex-direction: column;
      align-items: center;

      .game-headline {
        padding: 0 10px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        .title {
          display: flex;
          align-items: center;
          color: white;
          min-height: 26px;
        }

        .switch-pagination-box {
          display: flex;

          .switch-pagination {
            display: flex;
            align-items: center;
            width: fit-content;
            height: 23px;
            border-radius: 50px;
            border: thin solid #313843;

            .arrow-btn {
              color: #68707b;
              cursor: not-allowed;
              pointer-events: none;
              flex-grow: 0;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 100%;
              font-size: 8px;
              .left-icon {
                transform: rotate(180deg);
              }
            }
            .btn-all-inside {
              width: 50px;
              border-left: thin solid #313843;
              border-right: thin solid #313843;
              font-size: 10px;
              flex-grow: 0;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: white;
            }
          }
        }
      }

      .list-slide-layout {
        width: 345px;
        margin-top: 10px;

        .list-slide-layout-inner {
          width: 345px;
          padding-left: 0;
          height: 294.3px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 15px;
          box-sizing: border-box;
          .item {
            width: 105px;
            background-image: var(--bg-img);
            background-size: 100% 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            border-radius: 9px 13px 13px 13px;
            position: relative;
            overflow: hidden;

            .name-inner {
              width: 100%;
              font-size: 11.8px;
              font-weight: 700;
              text-align: center;
              justify-content: center;
              align-items: center;
              display: flex;
              height: 28px;
              padding-top: 3px;
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
              transition: opacity 0.6s;

              .disabled-icon {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translate(-50%);
                width: 105px;
                height: 105px;
                background: url(@/assets/home/img_whz_style_13.avif) no-repeat;
                background-size: 100% 100%;
              }
            }
          }
          &[data-length="1"],
          &[data-length="2"],
          &[data-length="3"] {
            height: 159px;
            grid-template-rows: repeat(1, 1fr);
          }
          &[data-length="4"],
          &[data-length="5"],
          &[data-length="6"] {
            height: 294.3px;
            grid-template-rows: repeat(2, 1fr);
          }
        }
        .list-slide-layout-nine {
          height: 449px;
          grid-template-rows: repeat(3, 1fr);
        }
      }
    }
  }
}
</style>
