<script setup lang="ts">
withDefaults(
  defineProps<{
    content?: string;
  }>(),
  {
    content: ""
  }
);
</script>

<template>
  <section class="base-template">
    <div class="base-template__texture base-template__texture--top" />
    <div v-if="content" class="base-template__content" v-html="content" />
    <div v-else class="base-template__empty">{{ $t("暂无活动详情") }}</div>
    <div class="base-template__texture base-template__texture--bottom" />
  </section>
</template>

<style scoped lang="less">
.base-template {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  color: #e5e4e2;
  background: #222832;
}

.base-template__texture {
  position: relative;
  width: 100%;
  height: 40px;
  background: url("@/assets/home/active_shading.avif") center / cover no-repeat;
}

.base-template__texture--bottom {
  transform: rotate(180deg);
}

.base-template__content {
  min-height: calc(var(--lobby__screen-height) - 250px);
  padding: 0 10px;
  color: #e5e4e2;
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;

  :deep(*) {
    box-sizing: border-box;
    max-width: 100%;
  }

  :deep(p) {
    margin: 0;
  }

  :deep(img) {
    height: auto;
    vertical-align: middle;
  }

  :deep(table) {
    width: 100% !important;
    table-layout: fixed;
    border-collapse: collapse;
  }

  :deep(td),
  :deep(th) {
    min-width: 0;
    padding: 2px;
    overflow-wrap: anywhere;
  }

  :deep(a) {
    color: var(--skin__primary);
  }
}

.base-template__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--lobby__screen-height) - 250px);
  color: var(--skin__neutral_2);
  font-size: 13px;
}
</style>
