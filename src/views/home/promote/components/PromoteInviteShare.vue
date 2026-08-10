<script setup lang="ts">
import { computed, ref, watch } from "vue";
import QRCode from "qrcode";
import Copy from "@/components/Common/Copy.vue";
import douyinIcon from "@/assets/home/promote/social-douyin.avif";
import facebookIcon from "@/assets/home/promote/social-facebook.png";
import kuaishouIcon from "@/assets/home/promote/social-kuaishou.avif";
import lineIcon from "@/assets/home/promote/social-line.png";
import momentsIcon from "@/assets/home/promote/social-moments.avif";
import qqIcon from "@/assets/home/promote/social-qq.png";
import telegramIcon from "@/assets/home/promote/social-telegram.png";
import wechatIcon from "@/assets/home/promote/social-wechat.avif";
import weiboIcon from "@/assets/home/promote/social-weibo.avif";
import whatsappIcon from "@/assets/home/promote/social-whatsapp.png";
import xiaohongshuIcon from "@/assets/home/promote/social-xiaohongshu.avif";

const props = withDefaults(
  defineProps<{
    showInviteCode?: boolean;
    inviteCode?: string;
    inviteLink?: string;
    inviteLinks?: string[];
    qrCode?: string;
  }>(),
  {
    showInviteCode: true,
    inviteCode: "",
    inviteLink: "",
    inviteLinks: () => [],
    qrCode: ""
  }
);

const emit = defineEmits<{
  saveQrCode: [];
  share: [channel: string];
}>();

const normalizedInviteLinks = computed(() => {
  const inviteLinks = Array.isArray(props.inviteLinks)
    ? props.inviteLinks
        .filter(inviteLink => typeof inviteLink === "string")
        .map(inviteLink => inviteLink.trim())
        .filter(Boolean)
    : [];

  if (inviteLinks.length) return [...new Set(inviteLinks)];

  const inviteLink = typeof props.inviteLink === "string"
    ? props.inviteLink.trim()
    : "";
  return inviteLink ? [inviteLink] : [];
});
const selectedInviteLink = ref("");
const inviteLinkOptions = computed(() =>
  normalizedInviteLinks.value.map(inviteLink => ({
    value: inviteLink,
    label: inviteLink
  }))
);
const inviteLinkOptionsKey = computed(() => normalizedInviteLinks.value.join("\u0000"));

watch(
  normalizedInviteLinks,
  inviteLinks => {
    if (!inviteLinks.includes(selectedInviteLink.value)) {
      selectedInviteLink.value = inviteLinks[0] ?? "";
    }
  },
  { immediate: true }
);

const generatedQrCode = ref("");
let qrCodeGenerationId = 0;

watch(
  selectedInviteLink,
  async inviteLink => {
    const currentGenerationId = ++qrCodeGenerationId;

    if (!inviteLink) {
      generatedQrCode.value = "";
      return;
    }

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(inviteLink, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 220
      });

      // 快速切换链接时，只保留最后一次生成的二维码。
      if (currentGenerationId === qrCodeGenerationId) {
        generatedQrCode.value = qrCodeDataUrl;
      }
    } catch {
      if (currentGenerationId === qrCodeGenerationId) {
        generatedQrCode.value = "";
      }
    }
  },
  { immediate: true }
);

const displayedQrCode = computed(() => generatedQrCode.value || props.qrCode);

const socialMedia = [
  { label: "微信", value: "wechat", icon: wechatIcon },
  { label: "朋友圈", value: "moments", icon: momentsIcon },
  { label: "抖音", value: "douyin", icon: douyinIcon },
  { label: "快手", value: "kuaishou", icon: kuaishouIcon },
  { label: "小红书", value: "xiaohongshu", icon: xiaohongshuIcon },
  { label: "微博", value: "weibo", icon: weiboIcon },
  { label: "QQ", value: "qq", icon: qqIcon },
  { label: "Telegram", value: "telegram", icon: telegramIcon },
  { label: "WhatsApp", value: "whatsapp", icon: whatsappIcon },
  { label: "Line", value: "line", icon: lineIcon },
  { label: "Facebook", value: "facebook", icon: facebookIcon }
];
</script>

<template>
  <section class="invite-share">
    <header v-if="showInviteCode" class="invite-share__header">
      <p>邀请好友</p>
      <div class="invite-share__code">
        <label>我的邀请码</label>
        <strong>{{ inviteCode }}</strong>
        <copy :text="inviteCode" class-name="invite-share__copy-icon" />
      </div>
    </header>

    <div class="invite-share__content">
      <div class="invite-share__qr-wrap">
        <div class="invite-share__qr">
          <img v-if="displayedQrCode" :src="displayedQrCode" alt="推广二维码" />
          <span v-else aria-label="推广二维码占位图" />
        </div>
        <x-button
          type="primary"
          class="invite-share__save-button"
          @click="emit('saveQrCode')"
        >
          保存邀请码
        </x-button>
      </div>

      <div class="invite-share__right">
        <div class="invite-share__link">
          <div class="invite-share__link-select">
            <x-select
              v-if="inviteLinkOptions.length"
              :key="inviteLinkOptionsKey"
              v-model="selectedInviteLink"
              :options="inviteLinkOptions"
              value-key="value"
              label-key="label"
            />
            <span v-else class="invite-share__link-empty">暂无可用推广域名</span>
          </div>
          <span class="invite-share__link-copy">
            <copy
              :text="selectedInviteLink"
              class-name="invite-share__copy-icon"
            />
          </span>
        </div>

        <div class="invite-share__media-scroll">
          <div class="invite-share__media-list">
            <button type="button" class="invite-share__media" @click="emit('share', 'system')">
              <span class="invite-share__share-symbol">
                <svg-icon name="promote-share" aria-hidden="true" />
              </span>
              <small>分享</small>
            </button>
            <button
              v-for="media in socialMedia"
              :key="media.value"
              type="button"
              class="invite-share__media"
              @click="emit('share', media.value)"
            >
              <span class="invite-share__media-icon">
                <img :src="media.icon" :alt="media.label" loading="lazy" />
              </span>
              <small>{{ media.label }}</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.invite-share {
  margin: 0 10px 10px;
  padding: 10px 10px 0;
  border-radius: 7px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.08);
}

.invite-share__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: var(--lobby__px, 0.5px) solid var(--skin__border);

  p {
    margin: 0;
    color: var(--skin__lead);
  }
}

.invite-share__code {
  display: flex;
  align-items: center;
  height: 15px;
  color: var(--skin__neutral_2);
  line-height: 15px;

  label {
    margin-right: 5px;
  }

  strong {
    margin-right: 1px;
    color: var(--skin__lead);
    font-weight: 400;
  }
}

:deep(.invite-share__copy-icon) {
  margin-left: 5px;
  color: var(--skin__primary);
}

.invite-share__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.invite-share__qr-wrap {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 65px;
  margin-right: 10px;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px 7px 10px 10px;
  background: #fff;
}

.invite-share__qr {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 7px 7px 0 0;

  img,
  span {
    display: block;
    box-sizing: content-box;
    width: 55px;
    height: 55px;
    padding: 5px;
    object-fit: contain;
  }

  span {
    background:
      linear-gradient(90deg, #111 12%, transparent 12% 24%, #111 24% 36%, transparent 36% 48%, #111 48% 60%, transparent 60% 72%, #111 72% 84%, transparent 84%),
      linear-gradient(#111 12%, transparent 12% 24%, #111 24% 36%, transparent 36% 48%, #111 48% 60%, transparent 60% 72%, #111 72% 84%, transparent 84%);
    background-size: 13px 13px;
  }
}

.invite-share__save-button {
  width: 100%;
  min-height: 25px;
  height: 33px;
  padding: 0;
  border-radius: 0 0 7px 7px;
  font-size: 11px;
}

.invite-share__right {
  flex: 1;
  min-width: 0;
  max-width: 76%;
}

.invite-share__link {
  display: flex;
  align-items: center;
  width: 100%;
  height: 35px;
  overflow: hidden;
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  border-radius: 7px;
}

.invite-share__link-select {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  height: 34px;
  overflow: hidden;

  :deep(.x-select) {
    width: 100%;
    min-width: 0;
    height: 34px;
    border: 0;
    border-radius: 0;
  }
}

.invite-share__link-empty {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;
}

.invite-share__link-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex: none;
  box-sizing: border-box;
  width: 35px;
  border-left: var(--lobby__px, 0.5px) solid var(--skin__border);
  color: var(--skin__primary);

  :deep(.copy-icon) {
    width: 100%;
    height: 100%;
    font-size: 11px;
  }

  :deep(.invite-share__copy-icon) {
    margin-left: 0;
    font-size: 14px;
  }
}

.invite-share__media-scroll {
  width: 250px;
  margin-top: 10px;
  padding-bottom: 5px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.invite-share__media-list {
  display: flex;
  width: max-content;
}

.invite-share__media {
  display: flex;
  align-items: center;
  flex: none;
  flex-direction: column;
  margin-right: 20px;
  padding: 0;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;

  .invite-share__media-icon,
  .invite-share__share-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 35px;
    height: 35px;
    overflow: hidden;
    border-radius: 50%;
  }

  .invite-share__media-icon img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  small {
    display: inline-block;
    max-width: 55px;
    margin-top: 5px;
    color: var(--skin__neutral_1);
    font-size: 11px;
    line-height: 1.15;
    text-align: center;
    overflow-wrap: break-word;
  }
}

.invite-share__share-symbol {
  border: var(--lobby__px, 0.5px) solid var(--skin__border);
  color: var(--skin__primary);

  :deep(.svg-icon) {
    width: 17.5px;
    height: 17.5px;
  }
}

[dir="rtl"] {
  .invite-share__code label {
    margin-right: 0;
    margin-left: 5px;
  }

  .invite-share__qr-wrap {
    margin-right: 0;
    margin-left: 10px;
  }

  .invite-share__link-copy {
    border-right: var(--lobby__px, 0.5px) solid var(--skin__border);
    border-left: 0;
  }

  .invite-share__media {
    margin-right: 0;
    margin-left: 20px;
  }
}
</style>
