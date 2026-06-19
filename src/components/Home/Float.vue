<script setup lang="ts">
defineOptions({
  name: 'HomeFloat'
});
</script>
<template>
  <div class="float-box">
    <div class="floatBox float-left">
      <div class="fast-list">
        <section>
          <div class="fast-entry-item">
            <van-swipe>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
            </van-swipe>
          </div>
          <div class="fast-entry-item">
            <van-swipe>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
            </van-swipe>
          </div>
        </section>
      </div>
    </div>
    <div class="floatBox float-right">
      <div class="fast-list">
        <section>
          <div class="fast-entry-item">
            <van-swipe>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
            </van-swipe>
          </div>
          <div class="fast-entry-item">
            <van-swipe>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
              <van-swipe-item>
                <div class="fast-btn">
                  <img src="https://146.103.80.124:5001/common/upload/1998005108970332161.webp" alt="" />
                  <img src="@/assets/home/kjrk_icon_guanbi.avif" alt="" srcset="" class="close-icon">
                </div>
              </van-swipe-item>
            </van-swipe>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.float-box {
  .floatBox {
    --float-box-y-axis-gap: 3.5px;
    position: absolute;
    bottom: 67px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    isolation: isolate;
    .fast-list {
      width: 60px;
      > section {
        display: flex;
        flex-direction: column;
        align-items: center;
        .fast-entry-item {
          position: relative;
          width: 60px;
          .fast-btn {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            cursor: pointer;
            height: 70px;
            justify-content: flex-start;
            .close-icon {
              position: absolute;
              top: 0;
              left: 0;
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }
  }
  .float-left {
    left: var(--float-box-y-axis-gap);
    right: unset;
    .close-icon {
      left: unset !important;
      right: 0 !important;
    }
  }
  .float-right {
    right: var(--float-box-y-axis-gap);
    left: unset;
    .close-icon {
      left: unset !important;
      right: 0 !important;
    }
  }
}
</style>
