<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { getEventInfo } from "@/api/common";
import { useRoute } from "vue-router";
import EventDetail from "@/components/Home/EventDetail.vue";
import EventDetailTab from "@/components/Home/EventDetailTab.vue";
import router from "@/router";

const route = useRoute();
const info = ref<any>({})
const showList = ref<any[]>([])

function init() {
  getEventInfo({ id: route.query.eventId }).then((data) => {
    info.value = data.info
    showList.value = data.list
  })
}

function handleChangeId(id: number) {
  router.replace({ path: route.path, query: { eventId: id } })
}

watch(() => route.query, () => init())

onMounted(() => {
  init()
})
</script>
<template>
  <div class="secondary-page detail">
    <sub-navbar :title="info.title" />
    <div class="content">
      <EventDetail :info="info" v-if="true" />
      <EventDetailTab :list="showList" :id="info.id" @change="handleChangeId" />
      <div class="h-[20px]" />
      <div class="sticky bottom-0 z-[100]">
        <EventDetailBottom />
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
  overflow: auto;
}
</style>
