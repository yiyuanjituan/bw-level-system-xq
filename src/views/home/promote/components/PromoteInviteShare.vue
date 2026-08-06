<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
    inviteCode?: string;
    inviteLink?: string;
    qrCode?: string;
  }>(),
  {
    inviteCode: "482485509",
    inviteLink: "https://543gffdg-65gjg.33552555.com:18026/?dl=7z9c79",
    qrCode: ""
  }
);

const emit = defineEmits<{
  saveQrCode: [];
  share: [channel: string];
}>();

const selectedInviteLink = ref(props.inviteLink);
const inviteLinkOptions = computed(() => [
  { value: props.inviteLink, label: props.inviteLink }
]);

watch(
  () => props.inviteLink,
  inviteLink => {
    selectedInviteLink.value = inviteLink;
  }
);

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
    <header class="invite-share__header">
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
          <img v-if="qrCode" :src="qrCode" alt="推广二维码" />
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
          <x-select
            v-model="selectedInviteLink"
            :options="inviteLinkOptions"
            value-key="value"
            label-key="label"
            class="invite-share__link-select"
          />
          <span class="invite-share__link-copy">
            <copy :text="selectedInviteLink" class-name="invite-share__copy-icon" />
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
  margin: 0 0.2rem 0.2rem;
  padding: 0.2rem 0.2rem 0;
  border-radius: 0.14rem;
  background: var(--skin__bg_2);
  box-shadow: 0 0.03rem 0.07rem rgba(0, 0, 0, 0.08);
}

.invite-share__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.2rem;
  padding-bottom: 0.2rem;
  border-bottom: var(--lobby__px, 0.01rem) solid var(--skin__border);

  p {
    margin: 0;
    color: var(--skin__lead);
  }
}

.invite-share__code {
  display: flex;
  align-items: center;
  height: 0.3rem;
  color: var(--skin__neutral_2);
  line-height: 0.3rem;

  label {
    margin-right: 0.1rem;
  }

  strong {
    margin-right: 0.02rem;
    color: var(--skin__lead);
    font-weight: 400;
  }
}

:deep(.invite-share__copy-icon) {
  margin-left: 0.1rem;
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
  width: 1.3rem;
  margin-right: 0.2rem;
  border: var(--lobby__px, 0.01rem) solid var(--skin__border);
  border-radius: 0.14rem 0.14rem 0.2rem 0.2rem;
  background: #fff;
}

.invite-share__qr {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.14rem 0.14rem 0 0;

  img,
  span {
    display: block;
    box-sizing: content-box;
    width: 1.1rem;
    height: 1.1rem;
    padding: 0.1rem;
    object-fit: contain;
  }

  span {
    background:
      linear-gradient(90deg, #111 12%, transparent 12% 24%, #111 24% 36%, transparent 36% 48%, #111 48% 60%, transparent 60% 72%, #111 72% 84%, transparent 84%),
      linear-gradient(#111 12%, transparent 12% 24%, #111 24% 36%, transparent 36% 48%, #111 48% 60%, transparent 60% 72%, #111 72% 84%, transparent 84%);
    background-size: 0.26rem 0.26rem;
  }
}

.invite-share__save-button {
  width: 100%;
  min-height: 0.5rem;
  height: 0.66rem;
  padding: 0;
  border-radius: 0 0 0.14rem 0.14rem;
  font-size: 0.22rem;
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
  height: 0.7rem;
  overflow: hidden;
  border: var(--lobby__px, 0.01rem) solid var(--skin__border);
  border-radius: 0.14rem;
}

.invite-share__link-select {
  flex: 1;
  min-width: 0;
  height: 0.68rem;
  border: 0;
  border-radius: 0;
}

.invite-share__link-copy {
  display: flex;
  align-items: center;
  align-self: stretch;
  flex: none;
  padding: 0.2rem;
  border-left: var(--lobby__px, 0.01rem) solid var(--skin__border);

  :deep(.invite-share__copy-icon) {
    margin-left: 0;
    font-size: 0.28rem;
  }
}

.invite-share__media-scroll {
  width: 5rem;
  margin-top: 0.2rem;
  padding-bottom: 0.1rem;
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
  margin-right: 0.4rem;
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
    width: 0.7rem;
    height: 0.7rem;
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
    max-width: 1.1rem;
    margin-top: 0.1rem;
    color: var(--skin__neutral_1);
    font-size: 0.22rem;
    line-height: 1.15;
    text-align: center;
    overflow-wrap: break-word;
  }
}

.invite-share__share-symbol {
  border: var(--lobby__px, 0.01rem) solid var(--skin__border);
  color: var(--skin__primary);

  :deep(.svg-icon) {
    width: 0.35rem;
    height: 0.35rem;
  }
}

[dir="rtl"] {
  .invite-share__code label {
    margin-right: 0;
    margin-left: 0.1rem;
  }

  .invite-share__qr-wrap {
    margin-right: 0;
    margin-left: 0.2rem;
  }

  .invite-share__link-copy {
    border-right: var(--lobby__px, 0.01rem) solid var(--skin__border);
    border-left: 0;
  }

  .invite-share__media {
    margin-right: 0;
    margin-left: 0.4rem;
  }
}
</style>
