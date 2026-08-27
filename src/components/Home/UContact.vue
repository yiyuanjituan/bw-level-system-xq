<script setup lang="ts">
import { onMounted, ref } from "vue";
import { serviceList } from "@/api/common";
import { $t } from "@/locales";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import { bus } from "@/utils/mitt";
import { openUrlInNewWindow } from "@/utils/common";

defineOptions({
  name: "UHomeContact"
});

type ServiceLink = {
  id?: string | number;
  name?: string;
  icon?: string;
  url?: string;
};

const contactList = ref<ServiceLink[]>([]);

function openContact(contact?: ServiceLink) {
  if (contact?.url) {
    openUrlInNewWindow(contact.url);
    return;
  }
  bus.emit("findUs");
}

onMounted(async () => {
  try {
    const response = await serviceList();
    contactList.value = Array.isArray(response) ? response.slice(0, 4) : [];
  } catch (error) {
    console.error("获取U站首页联系方式失败，失败原因：", error);
  }
});
</script>

<template>
  <section class="u-home-contact">
    <button type="button" class="u-home-contact__title" @click="openContact()">
      {{ $t("联系我们") }}
    </button>
    <div v-if="contactList.length" class="u-home-contact__list">
      <button
        v-for="(contact, index) in contactList"
        :key="contact.id ?? index"
        type="button"
        class="u-home-contact__item"
        @click="openContact(contact)"
      >
        <HomeSkeletonImage :src="contact.icon" class="u-home-contact__icon" alt="" fit="contain" />
        <span>{{ contact.name }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="less">
.u-home-contact {
  padding: 2px 10px 22px;
  text-align: center;
}

.u-home-contact__title {
  padding: 5px 16px;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.u-home-contact__list {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.u-home-contact__item {
  min-width: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 9px;
  cursor: pointer;

  span {
    width: 100%;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.u-home-contact__icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}
</style>
