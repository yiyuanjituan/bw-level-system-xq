<script setup lang="ts">
defineOptions({
  name: 'ui-loading'
})
</script>

<template>
  <div class="ui-loading">
    <div class="loading-icon"></div>
  </div>
</template>

<style scoped lang="less">
.ui-loading {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: #1677ff;
  font-size: 28px;
  line-height: 1.57;
  list-style: none;
  text-align: center;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
  display: inline-block;
  opacity: 1;

  .loading-icon {
      width: 25px;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 4px solid;
  }
}
</style>