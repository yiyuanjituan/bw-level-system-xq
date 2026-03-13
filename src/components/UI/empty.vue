<script setup lang="ts">
defineOptions({
  name: "ui-empty"
})
interface Props {
  text?: string
}
const props = withDefaults(defineProps<Props>(), {
  text: '暂无游戏',
});

</script>

<template>
  <div class="empty-box">
    <img src="/siteadmin/skin/lobby_asset/img_none_sj.avif" alt="" class="ui-empty-box">
    <span class="empty-text">{{ props.text }}</span>
  </div>
</template>

<style scoped lang="less">
.empty-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 30px;

  .ui-empty-box {
    width: 105px;
    height: 105px;
    margin-bottom: 10px;
    margin-top: 30px;
  }
  .empty-text {
    color: #656565;
    font-size: 13px;
    margin-bottom: 30px;
  }
}
</style>