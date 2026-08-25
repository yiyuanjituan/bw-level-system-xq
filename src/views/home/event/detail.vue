<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEventInfo } from "@/api/common";
import EventDetailBottom from "@/components/Home/EventDetailBottom.vue";
import EventDetailTab from "@/components/Home/EventDetailTab.vue";
import BaseTemplateDetail from "./components/BaseTemplateDetail.vue";
import InviteTemplateDetail from "./components/InviteTemplateDetail.vue";

interface ActivityInfo {
  id: number;
  title?: string;
  type?: number;
  specialActivity?: number | null;
  data?: string;
  image?: string;
  jumpMode?: number;
  url?: string;
}

const route = useRoute();
const router = useRouter();
const info = ref<ActivityInfo | null>(null);
const showList = ref<ActivityInfo[]>([]);
const isLoading = ref(false);
const loadFailed = ref(false);
let requestId = 0;

const currentTemplate = computed(() => Number(info.value?.specialActivity) === 15 ? 15 : 1);

function normalizeEventId(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const eventId = Number(rawValue);
  return Number.isInteger(eventId) && eventId > 0 ? eventId : null;
}

function createDetailQuery(activity: ActivityInfo) {
  return {
    current: Number(activity.type) || 0,
    eventId: activity.id,
    template: Number(activity.specialActivity) || 1
  };
}

async function syncDetailQuery(activity: ActivityInfo) {
  const detailQuery = createDetailQuery(activity);
  if (
    Number(route.query.current) === detailQuery.current &&
    Number(route.query.eventId) === detailQuery.eventId &&
    Number(route.query.template) === detailQuery.template
  ) return;

  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      ...detailQuery
    }
  });
}

async function loadEventInfo() {
  const eventId = normalizeEventId(route.query.eventId);
  if (!eventId) {
    info.value = null;
    showList.value = [];
    loadFailed.value = true;
    return;
  }

  const currentRequestId = ++requestId;
  isLoading.value = true;
  loadFailed.value = false;
  try {
    const response = await getEventInfo({ id: eventId });
    if (currentRequestId !== requestId) return;

    info.value = response.info || null;
    showList.value = Array.isArray(response.list) ? response.list : [];
    if (info.value) {
      await syncDetailQuery(info.value);
    }
  } catch {
    if (currentRequestId === requestId) {
      info.value = null;
      showList.value = [];
      loadFailed.value = true;
    }
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false;
    }
  }
}

function handleActivityClick(activity: ActivityInfo) {
  if (activity.jumpMode == 1) {
    void router.replace({ path: route.path, query: createDetailQuery(activity) });
  } else if (activity.jumpMode == 2 && activity.url) {
    void router.push(activity.url);
  } else if (activity.url) {
    window.open(activity.url);
  }
}

watch(
  () => route.query.eventId,
  () => {
    void loadEventInfo();
  }
);

onMounted(() => {
  void loadEventInfo();
});
</script>

<template>
  <div class="secondary-page event-detail-page">
    <sub-navbar :title="info?.title || '活动详情'" />

    <main class="event-detail-page__content">
      <div v-if="isLoading && !info" class="event-detail-page__state">
        <svg-icon name="loading" class-name="event-detail-page__loading" />
        <span>{{ $t("活动详情加载中") }}</span>
      </div>

      <div v-else-if="loadFailed" class="event-detail-page__state">
        <span>{{ $t("活动详情加载失败") }}</span>
        <x-button type="primary" @click="loadEventInfo">{{ $t("重新加载") }}</x-button>
      </div>

      <template v-else-if="info">
        <invite-template-detail v-if="currentTemplate === 15" />

        <template v-else>
          <base-template-detail :content="info.data || ''" />
          <event-detail-tab
            :list="showList"
            :id="info.id"
            @change="handleActivityClick"
          />
          <div class="event-detail-page__bottom-space" />
          <div class="event-detail-page__bottom">
            <event-detail-bottom />
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<style scoped lang="less">
.event-detail-page {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
}

.event-detail-page__content {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.event-detail-page__state {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  gap: 15px;
  color: var(--skin__neutral_2);
  font-size: 13px;

  :deep(.x-button) {
    width: 100px;
  }
}

:deep(.event-detail-page__loading) {
  width: 28px;
  height: 28px;
  color: var(--skin__primary);
  animation: event-detail-loading 0.8s linear infinite;
}

.event-detail-page__bottom-space {
  height: 20px;
}

.event-detail-page__bottom {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

@keyframes event-detail-loading {
  to {
    transform: rotate(360deg);
  }
}
</style>
