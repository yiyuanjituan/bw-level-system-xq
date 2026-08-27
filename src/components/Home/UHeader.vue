<script setup lang="ts">
import { computed, ref } from "vue";
import router from "@/router";
import { $locale, $t } from "@/locales";
import HomeSkeletonImage from "@/components/Home/SkeletonImage.vue";
import ULanguageDialog from "@/components/Home/ULanguageDialog.vue";
import useAppStore from "@/store/modules/app";
import useHomeDataStore from "@/store/modules/home";
import searchIcon from "@/assets/home/u-series/icon_dt_ss.png";
import languageIcon from "@/assets/home/u-series/icon_dt_yuyan.png";

defineOptions({
  name: "UHomeHeader"
});

defineProps<{
  solid?: boolean;
}>();

const app = useAppStore();
const home = useHomeDataStore();
const languageDialogVisible = ref(false);
const currentLanguageName = computed(() => $locale.value === "zh-cn" ? "中文" : "English");

function openGameSearch() {
  const homeSections = Array.isArray(home.venueList) ? home.venueList : [];
  const venueList = Array.isArray(app.venueList) ? app.venueList : [];
  const firstSection = homeSections[0] ?? venueList[0];
  if (!firstSection) return;

  void router.push({
    path: "/home/subGame",
    query: {
      type: firstSection.type,
      platformId: 0
    }
  });
}

function openLanguageDialog() {
  languageDialogVisible.value = true;
}
</script>

<template>
  <header class="u-home-header" :class="{ 'u-home-header--solid': solid }">
    <div class="u-home-header__brand">
      <HomeSkeletonImage
        v-if="app.appInfo?.logo"
        :src="app.appInfo.logo"
        class="u-home-header__logo"
        alt="logo"
        fit="contain"
        loading="eager"
      />
    </div>

    <div class="u-home-header__actions">
      <button
        type="button"
        class="u-home-header__action"
        :aria-label="$t('搜索游戏')"
        @click="openGameSearch"
      >
        <img :src="searchIcon" alt="" />
      </button>
      <button
        type="button"
        class="u-home-header__action"
        :aria-label="`${$t('common.language')}：${currentLanguageName}`"
        @click="openLanguageDialog"
      >
        <img :src="languageIcon" alt="" />
      </button>
    </div>
  </header>
  <ULanguageDialog v-model="languageDialogVisible" />
</template>

<style scoped lang="less">
.u-home-header {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  height: 45px;
  padding: var(--status-bar-height) 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  transition: background-color 0.2s ease;
  box-sizing: border-box;

  &--solid {
    background: var(--skin__bg_1);
  }
}

.u-home-header__brand {
  max-width: min(56vw, 210px);
  height: 35px;
  display: flex;
  align-items: center;
}

.u-home-header__logo {
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.u-home-header__actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.u-home-header__action {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
