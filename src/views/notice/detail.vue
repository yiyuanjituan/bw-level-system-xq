<script setup lang="ts">
import { onMounted, ref } from "vue";

const title = ref('')

function init() {

}

onMounted(() => init())
</script>

<template>
  <div class="detail-container">
    <sub-navbar :title="title" />
  </div>
</template>

<style scoped lang="less">
.detail-container {

}
</style>
