<script setup lang="ts">
import { computed } from "vue";
import router from "@/router";
import { $t } from "@/locales";
import { openUrlInNewWindow } from "@/utils/common";
import useAppStore from "@/store/modules/app";
import licenseIcon from "@/assets/home/footer/license-18plus.avif";

defineOptions({
  name: "HomeFooter"
});

type FooterLink = {
  label: string;
  route?: string;
  gameType?: number;
  action?: "hot";
};

const app = useAppStore();
const footerConfig = computed(() => app.homeFooterConfig);
const hasVisibleFooterContent = computed(() => (
  footerConfig.value.navigation.visible
  || footerConfig.value.license.visible
  || (footerConfig.value.contacts.visible && footerConfig.value.contacts.items.length > 0)
  || (footerConfig.value.richText.visible && Boolean(footerConfig.value.richText.content))
));

const footerLinkGroups = computed(() => [
  {
    title: $t("娱乐城"),
    links: [
      { label: $t("待领取"), route: "/home/canReceive" },
      { label: $t("返水"), route: "/home/cashback" },
      { label: "VIP", route: "/home/vip" },
      { label: $t("分享赚钱"), route: "/home/promote" },
      { label: $t("任务"), route: "/home/task" },
      { label: $t("活动"), route: "/home/event" },
    ]
  },
  {
    title: $t("游戏"),
    links: [
      { label: $t("热门"), action: "hot" as const },
      { label: $t("电子"), gameType: 3 },
      { label: $t("捕鱼"), gameType: 2 },
      { label: $t("棋牌"), gameType: 6 },
      { label: $t("真人"), gameType: 1 },
      { label: $t("体育"), gameType: 5 },
      { label: $t("彩票"), gameType: 4 }
    ]
  },
  {
    title: $t("支持"),
    links: [
      { label: $t("在线客服"), route: "/home/notice?noticeType=4" },
      { label: $t("帮助中心"), route: "/home/notice?noticeType=4" },
      { label: $t("有奖反馈"), route: "/home/notice?noticeType=5" }
    ]
  }
]);

const richTextContent = computed(() => sanitizeFooterRichText(footerConfig.value.richText.content));

function openFooterLink(link: FooterLink) {
  if (link.action === "hot") {
    document.querySelector<HTMLElement>("[data-home-game-section]")?.scrollIntoView({ block: "start" });
    return;
  }

  if (link.gameType !== undefined) {
    void router.push({
      path: "/home/subGame",
      query: { type: link.gameType, platformId: 0 }
    });
    return;
  }

  if (link.route) void router.push(link.route);
}

function openContact(url: string) {
  const normalizedUrl = normalizeSafeUrl(url);
  if (!normalizedUrl) return;
  if (normalizedUrl.startsWith("/")) {
    void router.push(normalizedUrl);
    return;
  }
  openUrlInNewWindow(normalizedUrl);
}

function normalizeSafeUrl(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

function sanitizeFooterRichText(value: string) {
  if (!value) return "";

  const parsedDocument = new DOMParser().parseFromString(value, "text/html");
  parsedDocument.body
    .querySelectorAll("script, style, iframe, object, embed, form, input, button, textarea, select, meta, base, link, svg, math")
    .forEach(element => element.remove());

  parsedDocument.body.querySelectorAll<HTMLElement>("*").forEach(element => {
    Array.from(element.attributes).forEach(attribute => {
      const attributeName = attribute.name.toLowerCase();
      if (attributeName.startsWith("on") || attributeName === "srcdoc" || attributeName === "contenteditable") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (["href", "src", "xlink:href", "action", "formaction", "poster", "background"].includes(attributeName)) {
        const normalizedUrl = normalizeSafeUrl(attribute.value);
        if (normalizedUrl) element.setAttribute(attribute.name, normalizedUrl);
        else element.removeAttribute(attribute.name);
        return;
      }

      if (attributeName === "style" && /(expression\s*\(|javascript:|vbscript:|-moz-binding|behavior\s*:)/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }

      if (attributeName === "target" && !["_blank", "_self"].includes(attribute.value.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A" && element.getAttribute("target") === "_blank") {
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return parsedDocument.body.innerHTML;
}
</script>

<template>
  <footer v-if="hasVisibleFooterContent" class="home-footer">
    <nav v-if="footerConfig.navigation.visible" class="home-footer__links" :aria-label="$t('首页底部导航')">
      <section v-for="group in footerLinkGroups" :key="group.title" class="home-footer__column">
        <h2 class="home-footer__column-title">{{ group.title }}</h2>
        <ul class="home-footer__link-list">
          <li v-for="link in group.links" :key="link.label">
            <button type="button" class="home-footer__link" @click="openFooterLink(link)">
              {{ link.label }}
            </button>
          </li>
        </ul>
      </section>
    </nav>

    <section v-if="footerConfig.license.visible" class="home-footer__license" :aria-label="$t('牌照合规')">
      <h2 class="home-footer__section-title">{{ $t("牌照合规") }}</h2>
      <img :src="licenseIcon" class="home-footer__license-icon" alt="18+" />
    </section>

    <section
      v-if="footerConfig.contacts.visible"
      class="home-footer__contacts"
      :aria-label="footerConfig.contacts.title"
    >
      <h2 class="home-footer__section-title home-footer__contact-title">{{ footerConfig.contacts.title }}</h2>
      <ul class="home-footer__contact-list">
        <li
          v-for="(contact, index) in footerConfig.contacts.items"
          :key="`${contact.title}-${index}`"
          class="home-footer__contact-item"
        >
          <button
            v-if="contact.url"
            type="button"
            class="home-footer__contact-link"
            :aria-label="contact.title"
            @click="openContact(contact.url)"
          >
            <img :src="contact.image" class="home-footer__contact-avatar" :alt="contact.title" :title="contact.title" />
          </button>
          <img
            v-else
            :src="contact.image"
            class="home-footer__contact-avatar"
            :alt="contact.title"
            :title="contact.title"
          />
        </li>
      </ul>
    </section>

    <section
      v-if="footerConfig.richText.visible && richTextContent"
      class="home-footer__rich-text"
      v-html="richTextContent"
    ></section>
  </footer>
</template>

<style scoped lang="less">
.home-footer {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 18px 10px calc(50px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  color: var(--skin__neutral_1);
  background: var(--skin__home_bg);
}

.home-footer__links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.home-footer__column {
  min-width: 0;
}

.home-footer__column-title,
.home-footer__section-title {
  margin: 0;
  color: var(--skin__lead);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.home-footer__link-list,
.home-footer__contact-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-footer__link-list {
  margin-top: 7px;
}

.home-footer__link-list li {
  min-width: 0;
}

.home-footer__link {
  width: 100%;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  color: var(--skin__neutral_2);
  background: transparent;
  font-size: 11px;
  line-height: 22px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.home-footer__license,
.home-footer__contacts,
.home-footer__rich-text {
  margin-top: 18px;
  padding-top: 13px;
  border-top: 1px solid var(--skin__border);
}

.home-footer > :first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.home-footer__license {
  display: flex;
  align-items: center;
  gap: 10px;
}

.home-footer__license-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.home-footer__contact-title {
  text-align: left;
}

.home-footer__contact-list {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.home-footer__contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-footer__contact-link {
  padding: 0;
  display: block;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.home-footer__contact-avatar {
  width: 35px;
  height: 35px;
  display: block;
  object-fit: cover;
}

.home-footer__rich-text {
  overflow-wrap: anywhere;
  color: var(--skin__neutral_1);
  font-size: 11px;
  line-height: 1.6;
}

.home-footer__rich-text :deep(p) {
  margin: 0;
}

.home-footer__rich-text :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.home-footer__rich-text :deep(a) {
  color: inherit;
}

:global([dir="rtl"]) .home-footer__link,
:global([dir="rtl"]) .home-footer__contact-title {
  text-align: right;
}

@media (min-width: 560px) {
  .home-footer {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
