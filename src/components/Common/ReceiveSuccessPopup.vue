<template>
  <div class="receive-success-popup" :data-skin-bg="skinBg">
    <img class="receive-success-popup__icon-img" src="@/assets/web/animated/img_emoji_tada.png" alt="领取成功" />

    <div class="receive-success-popup__text" v-html="messageHtml" />

    <img class="receive-success-popup__anime" src="@/assets/web/animated/apng_lingqu_5_alpha.png" alt="" />

    <div class="receive-success-popup__right-content">
      <span v-if="activityValue !== ''" class="receive-success-popup__activity">
        <!-- 原站这里是奖励类型组件，这里改成无依赖标签，保留展示位、颜色和文本逻辑。 -->
        <span class="receive-success-popup__activity-badge" :class="{ 'is-discount': isDiscountType }">
          <img src="/siteadmin/active/rmb.svg" alt="" srcset="" class="receive-success-popup__icon" />
          <span class="receive-success-popup__text-class">{{ activityDisplay }}</span>
        </span>
      </span>

      <span v-if="awardValue > 0" class="receive-success-popup__currency">
        <span class="receive-success-popup__icon-anime">{{ awardDisplay }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type BonusType = number | string;

interface Props {
  award?: number | string;
  activity?: number | string;
  messageText?: string;
  extraBonusType?: BonusType;
  couponName?: string;
  skinBg?: 0 | 1;
  couponTitleText?: string;
  discountTypeValue?: BonusType;
  giftCountTypes?: BonusType[];
  giftCountFormatter?: (value: number | string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  award: 0,
  activity: 0,
  messageText: '',
  extraBonusType: 'activity',
  couponName: '',
  skinBg: 1,
  couponTitleText: '优惠券',
  discountTypeValue: 'discount',
  giftCountTypes: () => [],
  giftCountFormatter: undefined
});

const awardValue = computed(() => {
  const parsed = Number(props.award);
  return Number.isFinite(parsed) ? parsed : 0;
});

const isDiscountType = computed(() => props.extraBonusType === props.discountTypeValue);

const activityValue = computed(() => {
  if (isDiscountType.value) {
    return props.couponName || props.couponTitleText;
  }
  return props.activity;
});

const activityDisplay = computed(() => {
  if (activityValue.value === '' || activityValue.value === 0 || activityValue.value === '0') {
    return '';
  }

  if (isDiscountType.value) {
    return String(activityValue.value);
  }

  const shouldFormatAsGiftCount = props.giftCountTypes.includes(props.extraBonusType);
  const formattedValue =
    shouldFormatAsGiftCount && props.giftCountFormatter ? props.giftCountFormatter(activityValue.value) : String(activityValue.value);

  return `+${formattedValue}`;
});

const awardDisplay = computed(() => {
  const amount = formatAmount(awardValue.value);
  return `+${amount}`;
});

const messageHtml = computed(() => props.messageText || '恭喜您，获得奖励！');

function formatAmount(value: number) {
  const hasDecimal = !Number.isInteger(value);
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0
  }).format(value);
}
</script>

<style scoped>
.receive-success-popup {
  position: relative;
  margin-top: 175px;
  padding: 10px;
  border-radius: 7px;
  width: 345px;
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
}

.receive-success-popup[data-skin-bg='1'] {
  background: #fff;
}

.receive-success-popup[data-skin-bg='0'] {
  background: rgba(0, 0, 0, 0.8);
}

.receive-success-popup__icon-img,
.receive-success-popup__text,
.receive-success-popup__right-content {
  position: relative;
  z-index: 1;
}

.receive-success-popup__icon-img {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.receive-success-popup__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-height: 32.5px;
  line-height: 16px;
  text-align: left;
}

.receive-success-popup[data-skin-bg='1'] .receive-success-popup__text {
  color: #333;
}

.receive-success-popup[data-skin-bg='0'] .receive-success-popup__text {
  color: #fff;
}

.receive-success-popup__right-content {
  max-width: 140px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.receive-success-popup__currency,
.receive-success-popup__activity {
  display: flex;
  align-items: center;
  color: #ffaa09;
  font-weight: 700;
  line-height: 1.67;
  letter-spacing: normal;
  text-align: left;
}

.receive-success-popup__activity {
  margin: 0;
}

.receive-success-popup__activity-badge {
  --category-icon-size: 15px;
  --category-icon-font-size: 15px;
  --category-text-font-size: 12px;
  --category-text-width: 140px;
  display: inline-flex;
  align-items: center;
  gap: 2.5px;
  max-width: var(--category-text-width);
  color: inherit;
}

.receive-success-popup__activity-badge.is-discount {
  color: var(--discount, #0d79ff);
}

.receive-success-popup__icon {
  width: var(--category-icon-size);
  height: var(--category-icon-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: var(--category-icon-font-size);
  line-height: 1;
  animation: receive-activity-icon-spin 0.9s linear 1;
  transform-origin: center;
}

.receive-success-popup__text-class {
  max-width: calc(var(--category-text-width) - var(--category-icon-size));
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes receive-currency-icon-rotate-y {
  0% {
    transform: rotateY(0);
  }

  100% {
    transform: rotateY(-360deg);
  }
}

@keyframes receive-activity-icon-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.receive-success-popup__icon-anime {
  display: inline-block;
  animation: receive-currency-icon-rotate-y 1s linear 1;
  transform-origin: center;
  color: #ffaa09;
}

.receive-success-popup__anime {
  position: absolute;
  z-index: 0;
  width: 400px;
  height: 100px;
  top: calc(50% - 50px);
  left: calc(50%);
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
