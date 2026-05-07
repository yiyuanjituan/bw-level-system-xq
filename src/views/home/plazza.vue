<script setup lang="ts">
import { computed, ref } from "vue";
import SubNavbar from "@/components/SubNavbar.vue";

interface PlazaAuthor {
  name: string;
  badge: string;
  followers: string;
}

interface PlazaPost {
  id: number;
  author: PlazaAuthor;
  title: string;
  summary: string[];
  stats: {
    likes: number;
    favorites: number;
    shares: number;
  };
}

const navList = ["全部", "关注", "收藏", "点赞", "我的主页"];
const activeNav = ref(0);

const postList = ref<PlazaPost[]>([
  {
    id: 1,
    author: {
      name: "皇家福利官",
      badge: "V",
      followers: "10.79K 位粉丝"
    },
    title: "【沙林足球】引爆全场",
    summary: [
      "轻松一脚，大奖轻松到手，以小博大，享受超高的爆率。",
      "连续组合奖励示意图仅作展示，实际图片区域你可以直接替换。"
    ],
    stats: {
      likes: 417,
      favorites: 153,
      shares: 98
    }
  },
  {
    id: 2,
    author: {
      name: "皇家福利官",
      badge: "V",
      followers: "10.79K 位粉丝"
    },
    title: "【雪球娱乐·沙林足球】",
    summary: [
      "只需 40 元，轻松赢取超值大奖。",
      "这里预留了图文卡片和说明区，后续只替换图片素材即可。"
    ],
    stats: {
      likes: 266,
      favorites: 87,
      shares: 44
    }
  }
]);

const activeLabel = computed(() => navList[activeNav.value] || "全部");
</script>

<template>
  <div class="plazza-page">
    <sub-navbar title="发现">
      <template #title>
        <div class="title-slot">发现</div>
      </template>
    </sub-navbar>

    <div class="plazza-page__nav">
      <button
        v-for="(item, index) in navList"
        :key="item"
        type="button"
        class="nav-chip"
        :class="{ 'nav-chip--active': activeNav === index }"
        @click="activeNav = index"
      >
        {{ item }}
      </button>
      <button type="button" class="nav-search" aria-label="search">
        <svg-icon name="comm_icon_ss" />
      </button>
    </div>

    <div class="plazza-page__body">
      <div class="post-card" v-for="post in postList" :key="post.id">
        <div class="post-card__header">
          <div class="post-card__author">
            <div class="avatar-ring">
              <div class="avatar-image">图</div>
              <span class="avatar-plus">+</span>
            </div>
            <div class="author-meta">
              <div class="author-row">
                <span class="author-name">{{ post.author.name }}</span>
                <span class="author-badge">{{ post.author.badge }}</span>
              </div>
              <div class="author-followers">{{ post.author.followers }}</div>
            </div>
          </div>
          <button type="button" class="follow-btn">+关注</button>
        </div>

        <div class="post-card__content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-summary" v-for="line in post.summary" :key="line">
            {{ line }}
          </p>
          <button type="button" class="expand-link">查看全文</button>
        </div>

        <div class="media-panel">
          <div class="media-panel__top">
            <div class="slot-machine slot-machine--left">
              <div class="slot-machine__grid">
                <span v-for="index in 15" :key="`left-${index}`" class="slot-tile">
                  {{ index % 5 === 0 ? "10" : "K" }}
                </span>
              </div>
            </div>
            <div class="media-arrow">
              <span></span>
            </div>
            <div class="slot-machine slot-machine--right">
              <div class="slot-machine__grid">
                <span v-for="index in 15" :key="`right-${index}`" class="slot-tile slot-tile--gold">
                  {{ index % 4 === 0 ? "A" : "Q" }}
                </span>
              </div>
            </div>
          </div>
          <div class="media-panel__bottom">
            <div class="bottom-tag">图位 01</div>
            <div class="progress-strip">
              <span v-for="index in 7" :key="index"></span>
            </div>
            <div class="bottom-tag bottom-tag--right">图位 02</div>
          </div>
        </div>

        <div class="post-card__footer">
          <div class="footer-action">
            <span class="footer-icon">♡</span>
            <span>{{ post.stats.likes }}</span>
          </div>
          <div class="footer-action">
            <span class="footer-icon">☆</span>
            <span>{{ post.stats.favorites }}</span>
          </div>
          <div class="footer-action footer-action--share">
            <span class="footer-icon footer-icon--share">↗</span>
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-tip">{{ activeLabel }}</div>
  </div>
</template>

<style scoped lang="less">
.plazza-page {
  --plazza-bg: #0f0f10;
  --plazza-panel: #1b1b1d;
  --plazza-panel-strong: #232326;
  --plazza-text: #f7f4eb;
  --plazza-muted: #8d8a84;
  --plazza-gold: #dfbe5b;
  --plazza-border: #2b2b2f;

  min-height: 100%;
  height: 100%;
  background:
    radial-gradient(circle at top right, rgba(223, 190, 91, 0.08), transparent 28%),
    linear-gradient(180deg, #121214 0%, #09090a 100%);
  color: var(--plazza-text);
  display: flex;
  flex-direction: column;
}

.title-slot {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.plazza-page__nav {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  height: 40px;
  border-bottom: 1px solid var(--plazza-border);
  background: rgba(20, 20, 21, 0.92);
  overflow-x: auto;
  scrollbar-width: none;
}

.plazza-page__nav::-webkit-scrollbar {
  display: none;
}

.nav-chip {
  border: 0;
  background: transparent;
  color: #f0eee8;
  font-size: 12px;
  padding: 0;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;

  &--active {
    color: var(--plazza-gold);
    font-weight: 700;
  }

  &--active::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -11px;
    height: 2px;
    background: var(--plazza-gold);
    border-radius: 999px;
  }
}

.nav-search {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--plazza-gold);
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plazza-page__body {
  flex: 1;
  overflow: auto;
  padding: 12px 12px 80px;
}

.post-card {
  background: linear-gradient(180deg, rgba(31, 31, 34, 0.96), rgba(22, 22, 24, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar-ring {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(180deg, #eceef3, #babec8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff, #dce0e8);
  color: #5e6672;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.avatar-plus {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--plazza-gold);
  color: #121212;
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
}

.author-meta {
  min-width: 0;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: #f4f1e8;
}

.author-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6ad0ff, #368dff);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.author-followers {
  margin-top: 2px;
  color: #8b8b90;
  font-size: 11px;
}

.follow-btn {
  border: 0;
  height: 28px;
  min-width: 62px;
  padding: 0 12px;
  border-radius: 7px;
  background: linear-gradient(180deg, #e7c862, #d2a83e);
  color: #fffdf6;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(223, 190, 91, 0.2);
}

.post-card__content {
  margin-top: 12px;
}

.post-title {
  font-size: 15px;
  font-weight: 700;
  color: #e7e4dc;
  margin: 0 0 10px;
}

.post-summary {
  font-size: 13px;
  line-height: 1.65;
  color: #a7a19a;
  margin: 0;
}

.expand-link {
  margin-top: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--plazza-gold);
  font-size: 12px;
  font-weight: 700;
}

.media-panel {
  margin-top: 14px;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(46, 46, 52, 0.95), rgba(32, 32, 37, 0.98)),
    url("@/assets/home/active_shading.avif");
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
  padding: 14px 12px 12px;
}

.media-panel__top {
  display: grid;
  grid-template-columns: 1fr 18px 1fr;
  align-items: center;
  gap: 8px;
}

.slot-machine {
  min-height: 128px;
  border-radius: 10px;
  background: linear-gradient(180deg, #2a2a2d, #202023);
  padding: 8px;
  position: relative;
}

.slot-machine__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.slot-tile {
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: linear-gradient(180deg, #f6c75c, #c98325);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #65430d;
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.15);
}

.slot-tile--gold {
  background: linear-gradient(180deg, #f6e2a8, #d8a437);
  color: #714b0f;
}

.media-arrow {
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 8px solid #7c6f4a;
    opacity: 0.9;
  }
}

.media-panel__bottom {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.bottom-tag {
  color: #7f7d74;
  font-size: 10px;

  &--right {
    text-align: right;
  }
}

.progress-strip {
  flex: 1;
  display: flex;
  gap: 3px;
  justify-content: center;

  span {
    width: 10px;
    height: 4px;
    border-radius: 2px;
    background: #8a6e24;
  }
}

.post-card__footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  color: #9b958d;
  font-size: 12px;
}

.footer-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &--share {
    color: var(--plazza-gold);
    font-weight: 700;
  }
}

.footer-icon {
  font-size: 15px;
  color: #6e6962;
}

.footer-icon--share {
  color: var(--plazza-gold);
}

.floating-tip {
  position: fixed;
  right: 12px;
  bottom: 16px;
  min-width: 52px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(223, 190, 91, 0.12);
  border: 1px solid rgba(223, 190, 91, 0.22);
  color: var(--plazza-gold);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}
</style>
