<script setup lang="ts">
import HomeNavBar from "@/components/Home/NavBar.vue";
import HomeBanner from "@/components/Home/Banner.vue";
import HomeNotice from "@/components/Home/Notice.vue";
import HomeGameList from "@/components/Home/GameList.vue";
</script>

<template>
  <div class="home-container">
    <HomeNavBar />
    <div class="scroll-box" id="scroll-box">
      <HomeBanner />
      <HomeNotice />
      <div class="mt-[10px]">
        <HomeGameList />
      </div>
    </div>
    <van-back-top target="#scroll-box" class="page-home-custom-back-top">
      <svg-icon name="comm_icon_top"></svg-icon>
      <div class="span">返回顶部</div>
    </van-back-top>
  </div>
</template>

<style lang="less">
.page-home-custom-back-top {
  --van-back-top-bottom: 77px;
  --van-back-top-right: calc(50vw - 33px);
  width: 66px;
  height: 20px;
  border-radius: 10px;
  border: solid 1px #DFBE5B;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: white;
  flex-direction: row;
  background: #191919;
  font-size: 9px;

  .span {
    line-height: 9px;
    margin-left: 5px;
    white-space: nowrap;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    scale: 0.98;
  }
}
</style>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .scroll-box {
    overflow: auto;
    height: 100%;
    width: 100%;
    background-image: url("@/assets/home/bg_pattern_tile.avif");
    background-position: center;
    background-size: 90px 90px;
  }
}
</style>
