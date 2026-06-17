<script setup lang="ts">
</script>

<template>
  <div class="device-container">
    <sub-navbar title="登录设备" />
    <div class="main">
      <div class="sticky-box">ces</div>
      <div class="device-list">
        <div class="currentDevice"></div>
        <div class="historyDevice">
          <div class="deviceTitle">
            <div class="leftWrap">
              <svg-icon name="icon_dlsb_sj" class-name="picBg" />
              <div>当前设备</div>
              <svg-icon name="comm_icon_gou" class-name="currentBg !text-[8px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.device-container {
  display: flex;
  flex-direction: column;
  color: var(--skin__lead);
  .main {
    flex: 1;
    overflow: auto;
    height: 0;
    .sticky-box {
      position: sticky;
      top: 0;
    }
    .device-list {
      padding: 10px 10px 65px;
      height: calc(100% - 145px);
      overflow-y: auto;
      .currentDevice,
      .historyDevice {
        width: 100%;
        margin-bottom: 10px;
        background-color: var(--skin__bg_2);
        box-shadow: 0 1.5px 5px rgba(0, 0, 0, .06);
        border-radius: 7px;
        .deviceTitle {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          min-height: 45px;
          padding: 0 10px 0 8px;
          color: var(--skin__lead);
          font-size: 12px;
          line-height: 1.8;
          text-align: left;
          .leftWrap {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            height: 100%;
            .picBg {
              color: var(--skin__primary);
              font-size: 18px;
              padding-bottom: 2px;
              padding-right: 2.5px;
            }
            .currentBg {
              background-color: var(--skin__accent_1);
              color: #fff;
              width: 14px;
              height: 14px;
              border-radius: 14px;
              margin-left: 2.5px;
            }
          }
        }
      }
    }
  }
}
</style>
